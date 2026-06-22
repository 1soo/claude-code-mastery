import "server-only";

import { Client } from "@notionhq/client";

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
 * 견적서 목록 조회 (F001 / F004).
 * 견적서 목록 페이지(RSC, ISR 60초)에서 호출한다.
 *
 * TODO(노션 연동): dataSources.query(dataSourceId)로 페이지 목록을 가져온 뒤
 *   normalizeQuote()로 Quote[]로 변환해 반환한다.
 *   - 정렬/필터는 query body에서 처리하거나 변환 후 처리
 *   - rate limit(평균 3 req/s) 대비 가벼운 429 백오프 고려
 */
export async function getQuotes(): Promise<Quote[]> {
  // TODO: notion.dataSources.query({ data_source_id: dataSourceId, ... })
  throw new Error("getQuotes 미구현 — 노션 연동 후 구현 필요");
}

/**
 * 견적서 상세 조회 (F002 / F004).
 * 견적서 상세 페이지(RSC, ISR 300초)에서 호출한다.
 * 존재하지 않으면 null을 반환해 호출부에서 notFound() 처리한다.
 *
 * TODO(노션 연동):
 *   1. pages.retrieve(id)로 프로퍼티 조회 → normalizeQuote()
 *   2. 페이지 본문(blocks.children.list)에서 견적 항목 파싱 → QuoteItem[]
 *      - 항목 저장 방식(JSON 코드 블록 vs 테이블 블록)은 미확정 (사용자 결정 필요)
 */
export async function getQuote(_id: string): Promise<Quote | null> {
  // TODO: notion.pages.retrieve({ page_id: _id }) + 본문 항목 파싱
  throw new Error("getQuote 미구현 — 노션 연동 후 구현 필요");
}

/**
 * 노션 page 응답을 앱 내부 Quote 타입으로 정규화한다.
 * strict 모드 주의: email/number/date/select는 미입력 시 null,
 * title/rich_text는 항상 배열(빈 배열 가능)이므로 null 가드 + fallback 처리한다.
 *
 * TODO(정규화 레이어): 노션 프로퍼티 → Quote 매핑 + null 가드 구현
 */
// export function normalizeQuote(page: PageObjectResponse): Quote { ... }
