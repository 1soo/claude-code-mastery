import "server-only";

import {
  APIResponseError,
  Client,
  isFullBlock,
  isFullPage,
} from "@notionhq/client";
import type {
  BlockObjectResponse,
  PageObjectResponse,
} from "@notionhq/client";

import { NOTION_PROP } from "@/lib/notion-schema";
import { normalizeQuote, parseQuoteItems } from "@/lib/normalize";
import type { Quote } from "@/lib/types";

// 노션 클라이언트 (서버 전용 — API 키가 클라이언트에 노출되지 않도록 server-only 보장).
// API는 2025-09-03 버전부터 database(컨테이너)와 data source(쿼리 대상)를 분리하므로
// dataSources.query(data_source_id)를 사용한다. (구형 databases.query 금지)
//
// 환경변수:
//   NOTION_TOKEN          — 노션 통합(integration) 시크릿
//   NOTION_DATA_SOURCE_ID — 쿼리 대상 data source ID
//     (배포/빌드 시 1회 databases.retrieve → data_sources[]로 조회해 env로 고정)
const notionToken = process.env.NOTION_TOKEN;
// 견적서 목록/상세 조회 시 사용 (연동 구현 시 query body에 전달)
export const dataSourceId = process.env.NOTION_DATA_SOURCE_ID;

// notionVersion을 2025-09-03으로 고정해 data source 분리 API를 사용한다.
export const notion = new Client({
  auth: notionToken,
  notionVersion: "2025-09-03",
});

/**
 * 노션 환경변수(NOTION_TOKEN / NOTION_DATA_SOURCE_ID)가 설정되어 있는지 검증한다.
 * 누락 시 한국어 메시지로 throw 한다. getQuotes / getQuote 진입 시 가장 먼저 호출한다.
 *
 * @returns 검증된 dataSourceId(string) — 이후 query에 그대로 전달한다.
 */
function assertEnv(): string {
  // 모듈 로드 시점이 아니라 호출 시점에 process.env 를 다시 읽어
  // 테스트의 vi.stubEnv 등 런타임 환경변수 변경을 반영한다.
  const token = process.env.NOTION_TOKEN;
  const id = process.env.NOTION_DATA_SOURCE_ID;
  if (!token || !id) {
    throw new Error(
      "노션 환경변수가 설정되지 않았습니다 (NOTION_TOKEN / NOTION_DATA_SOURCE_ID).",
    );
  }
  return id;
}

/**
 * rate_limited(429) 에러에 대해 지수 백오프로 재시도하는 래퍼.
 *
 * - @notionhq/client 의 APIResponseError 이고 code === 'rate_limited' 인 경우에만
 *   약 300ms * 2^n 대기 후 재시도한다(n = 0,1,...).
 * - 재시도 횟수를 소진하거나(rate_limited 가 계속됨) 그 외 에러는 그대로 throw 한다.
 *
 * @param fn      실행할 비동기 함수
 * @param retries 최대 재시도 횟수(기본 2 — 최초 1회 + 재시도 2회 = 최대 3회 호출)
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return await fn();
    } catch (error) {
      const isRateLimited =
        error instanceof APIResponseError && error.code === "rate_limited";
      // rate_limited 가 아니거나 재시도 소진 시 throw.
      if (!isRateLimited || attempt >= retries) {
        throw error;
      }
      // 지수 백오프: 약 300ms * 2^attempt.
      const delayMs = 300 * 2 ** attempt;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      attempt += 1;
    }
  }
}

/**
 * 견적서 목록 조회 (F001 / F004).
 * 견적서 목록 페이지(RSC, ISR 60초)에서 호출한다.
 *
 * 절차:
 *   1. dataSources.query 로 발행일 내림차순, 최대 100건 조회(withRetry 로 429 백오프).
 *   2. isFullPage 가드로 부분 응답을 걸러낸 뒤 normalizeQuote 로 Quote 변환.
 *   3. 노션 sorts 가 (프로퍼티명 변경 등으로) 무시될 수 있으므로 변환 후 issuedAt 내림차순 2차 정렬.
 *      issuedAt 이 null 인 항목은 항상 뒤로 보낸다.
 */
export async function getQuotes(): Promise<Quote[]> {
  const dataSourceId = assertEnv();

  const res = await withRetry(() =>
    notion.dataSources.query({
      data_source_id: dataSourceId,
      sorts: [{ property: NOTION_PROP.issuedAt, direction: "descending" }],
      page_size: 100,
    }),
  );

  // 부분 응답(PartialPageObjectResponse 등)을 걸러내고 PageObjectResponse 만 변환.
  const quotes = res.results
    .filter((r): r is PageObjectResponse => isFullPage(r))
    .map((page) => normalizeQuote(page));

  // 변환 후 issuedAt 내림차순 2차 정렬(null 은 뒤로).
  return quotes.sort(byIssuedAtDesc);
}

/**
 * issuedAt(ISO 8601 문자열 | null) 기준 내림차순 비교자.
 * null 은 항상 뒤로 정렬한다.
 */
function byIssuedAtDesc(a: Quote, b: Quote): number {
  if (a.issuedAt === b.issuedAt) return 0;
  if (a.issuedAt === null) return 1; // a 를 뒤로
  if (b.issuedAt === null) return -1; // b 를 뒤로
  // 내림차순: 더 최근 날짜가 앞.
  return a.issuedAt < b.issuedAt ? 1 : -1;
}

/**
 * 견적서 상세 조회 (F002 / F004).
 * 견적서 상세 페이지(RSC, ISR 300초)에서 호출한다.
 * 존재하지 않으면 null 을 반환해 호출부에서 notFound() 처리한다.
 *
 * 절차:
 *   1. pages.retrieve(id) 로 프로퍼티 조회(withRetry).
 *   2. blocks.children.list(id) 로 본문 블록 조회 → parseQuoteItems 로 견적 항목 파싱.
 *      ⚠️ MVP 범위에서는 본문 블록 100건 이상 페이지네이션은 처리하지 않는다(page_size: 100 단일 호출).
 *   3. isFullPage 가드 통과 시 normalizeQuote(page, items) 반환, 아니면 null.
 *
 * 에러 처리:
 *   - object_not_found / validation_error(잘못된 ID 형식 등)는 '없는 견적서'로 보고 null 반환.
 *   - 그 외 에러(권한/서버 오류 등)는 throw 해 상위 error.tsx 가 처리하도록 전파.
 */
export async function getQuote(id: string): Promise<Quote | null> {
  assertEnv();

  try {
    const page = await withRetry(() => notion.pages.retrieve({ page_id: id }));

    const blocksRes = await withRetry(() =>
      notion.blocks.children.list({ block_id: id, page_size: 100 }),
    );

    // 본문 블록 중 완전한 BlockObjectResponse 만 추려 항목 파서로 넘긴다.
    const blocks = blocksRes.results.filter((b): b is BlockObjectResponse =>
      isFullBlock(b),
    );
    const items = parseQuoteItems(blocks);

    return isFullPage(page) ? normalizeQuote(page, items) : null;
  } catch (error) {
    // 존재하지 않는 페이지 ID 또는 형식 오류 → null(호출부에서 notFound()).
    if (
      error instanceof APIResponseError &&
      (error.code === "object_not_found" || error.code === "validation_error")
    ) {
      return null;
    }
    // 그 외 에러는 전파.
    throw error;
  }
}

// 정규화 레이어는 server-only 의존이 없는 순수 함수로 src/lib/normalize.ts 에 분리하고
// 여기서 re-export 한다. (단위 테스트는 @/lib/normalize 를 직접 import해 격리 테스트)
//   - normalizeQuote(page, items): 노션 page → Quote 변환(NOTION_PROP 매핑 + null 가드)
//   - parseQuoteItems(blocks): 본문 JSON 코드 블록 → QuoteItem[] (실패 시 [] fallback)
export { normalizeQuote, parseQuoteItems };
