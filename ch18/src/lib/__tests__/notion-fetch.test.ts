// notion.ts 의 getQuotes / getQuote 에러 분기 단위 테스트.
//
// ⚠️ 실 노션 API 호출 금지 — notion 클라이언트 메서드를 전부 vi.spyOn 으로 모킹한다.
//   - notion.dataSources.query        (목록)
//   - notion.pages.retrieve           (상세 프로퍼티)
//   - notion.blocks.children.list     (상세 본문)
// server-only 가드는 vitest.config.ts 의 resolve.alias 셰임으로 우회되므로
// @/lib/notion 을 직접 import 해도 node 환경에서 throw 하지 않는다.

import { APIResponseError } from "@notionhq/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { notion, getQuote, getQuotes } from "@/lib/notion";
import {
  pageAllFilled,
  pageKoreanRuns,
  pageNullNullable,
} from "@/lib/__tests__/fixtures/notion-pages";
import { codeBlockFromJson, paragraphBlock } from "@/lib/__tests__/fixtures/notion-blocks";

// APIResponseError 인스턴스를 코드 분기와 동일한 실제 클래스로 생성한다.
// (notion.ts 의 `error instanceof APIResponseError` 분기와 정확히 일치시키기 위함)
function makeApiError(
  code: string,
  status: number,
  message = "테스트 에러",
): APIResponseError {
  return new APIResponseError({
    code: code as APIResponseError["code"],
    status,
    message,
    headers: new Headers(),
    rawBodyText: "{}",
    additional_data: undefined,
    request_id: undefined,
  });
}

// dataSources.query 응답 형태(테스트에서 필요한 results 만 채운다).
function queryResponse(results: unknown[]) {
  return {
    object: "list",
    results,
    next_cursor: null,
    has_more: false,
    type: "page_or_data_source",
    page_or_data_source: {},
  } as unknown as Awaited<ReturnType<typeof notion.dataSources.query>>;
}

// blocks.children.list 응답 형태.
function blocksResponse(results: unknown[]) {
  return {
    object: "list",
    results,
    next_cursor: null,
    has_more: false,
    type: "block",
    block: {},
  } as unknown as Awaited<ReturnType<typeof notion.blocks.children.list>>;
}

describe("notion.ts — getQuotes / getQuote 에러 분기", () => {
  beforeEach(() => {
    // 환경변수가 설정된 정상 상태를 기본값으로 둔다(개별 케이스에서 override).
    vi.stubEnv("NOTION_TOKEN", "test-token");
    vi.stubEnv("NOTION_DATA_SOURCE_ID", "test-ds-id");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  // (a) getQuotes 정상 → Quote[] 변환.
  it("getQuotes: 정상 응답을 Quote[]로 변환하고 발행일 내림차순 정렬한다", async () => {
    // pageNullNullable(발행일 null) 을 먼저, pageAllFilled(2026-06-01) 를 뒤에 두어
    // 변환 후 2차 정렬이 동작하는지(날짜 있는 항목이 앞, null 이 뒤) 확인한다.
    const querySpy = vi
      .spyOn(notion.dataSources, "query")
      .mockResolvedValue(queryResponse([pageNullNullable, pageAllFilled]));

    const quotes = await getQuotes();

    expect(querySpy).toHaveBeenCalledTimes(1);
    expect(quotes).toHaveLength(2);
    // 2차 정렬: issuedAt 이 있는 pageAllFilled 가 앞, null 인 pageNullNullable 이 뒤.
    expect(quotes[0].id).toBe("page-a");
    expect(quotes[0].issuedAt).toBe("2026-06-01");
    expect(quotes[1].id).toBe("page-c");
    expect(quotes[1].issuedAt).toBeNull();
    // 변환 내용 spot check.
    expect(quotes[0].title).toBe("2026년 6월 웹사이트 구축 견적서");
    expect(quotes[0].quoteNumber).toBe("Q-2026-001");
    expect(quotes[0].status).toBe("issued");
  });

  // (a-2) 부분 응답(isFullPage 가드 탈락)은 결과에서 제외된다.
  it("getQuotes: isFullPage 가드를 통과하지 못한 부분 응답은 제외한다", async () => {
    // properties 가 없는 부분 응답(PartialPageObjectResponse) 모사.
    const partial = { object: "page", id: "partial-1" };
    vi.spyOn(notion.dataSources, "query").mockResolvedValue(
      queryResponse([partial, pageAllFilled]),
    );

    const quotes = await getQuotes();

    expect(quotes).toHaveLength(1);
    expect(quotes[0].id).toBe("page-a");
  });

  // (b) getQuote 정상 → Quote(본문 항목 포함).
  it("getQuote: 정상 응답을 본문 항목(items)과 함께 Quote로 변환한다", async () => {
    const itemsJson = JSON.stringify([
      { name: "디자인", quantity: 2, unitPrice: 500000, amount: 1000000 },
      { name: "개발", quantity: 1, unitPrice: 2000000 }, // amount 누락 → 보정
    ]);

    vi.spyOn(notion.pages, "retrieve").mockResolvedValue(
      pageKoreanRuns as Awaited<ReturnType<typeof notion.pages.retrieve>>,
    );
    vi.spyOn(notion.blocks.children, "list").mockResolvedValue(
      blocksResponse([paragraphBlock("안내 문구"), codeBlockFromJson(itemsJson)]),
    );

    const quote = await getQuote("page-e");

    expect(quote).not.toBeNull();
    // 조각난 rich_text 이어붙이기 + 한글 보존 확인.
    expect(quote?.title).toBe("주식회사 한글컴퍼니 견적서 🧾");
    expect(quote?.status).toBe("expired");
    expect(quote?.items).toHaveLength(2);
    expect(quote?.items[0]).toMatchObject({ name: "디자인", amount: 1000000 });
    // amount 누락 항목은 quantity * unitPrice 로 보정.
    expect(quote?.items[1].amount).toBe(2000000);
  });

  // (c) getQuote object_not_found → null.
  it("getQuote: object_not_found(APIResponseError)면 null을 반환한다", async () => {
    vi.spyOn(notion.pages, "retrieve").mockRejectedValue(
      makeApiError("object_not_found", 404),
    );
    // blocks 는 호출 전에 throw 되므로 굳이 모킹하지 않아도 되지만, 안전하게 막아둔다.
    vi.spyOn(notion.blocks.children, "list").mockResolvedValue(blocksResponse([]));

    const quote = await getQuote("없는-id");
    expect(quote).toBeNull();
  });

  // (c-2) validation_error(잘못된 ID 형식) → null.
  it("getQuote: validation_error면 null을 반환한다", async () => {
    vi.spyOn(notion.pages, "retrieve").mockRejectedValue(
      makeApiError("validation_error", 400),
    );

    const quote = await getQuote("형식이-잘못된-id");
    expect(quote).toBeNull();
  });

  // (d) env 누락 → throw.
  it("getQuotes/getQuote: NOTION_DATA_SOURCE_ID 누락 시 한국어 메시지로 throw 한다", async () => {
    vi.stubEnv("NOTION_DATA_SOURCE_ID", "");

    // query 가 호출되기 전에 assertEnv 에서 throw 되어야 한다.
    const querySpy = vi.spyOn(notion.dataSources, "query");

    await expect(getQuotes()).rejects.toThrow("노션 환경변수가 설정되지 않았습니다");
    await expect(getQuote("any")).rejects.toThrow(
      "노션 환경변수가 설정되지 않았습니다",
    );
    expect(querySpy).not.toHaveBeenCalled();
  });

  // (e) rate_limited 1회 후 성공 → 백오프 재시도(query 2회 호출).
  it("getQuotes: rate_limited 1회 후 재시도하여 성공한다(query 2회 호출)", async () => {
    // 백오프의 setTimeout 을 즉시 흘려보내기 위해 fake timers 사용.
    vi.useFakeTimers();

    const querySpy = vi
      .spyOn(notion.dataSources, "query")
      .mockRejectedValueOnce(makeApiError("rate_limited", 429))
      .mockResolvedValueOnce(queryResponse([pageAllFilled]));

    const promise = getQuotes();
    // 첫 호출(reject) → 백오프 대기 → 두 번째 호출(resolve) 순으로 진행되도록
    // 보류 중인 타이머/마이크로태스크를 모두 흘려보낸다.
    await vi.runAllTimersAsync();
    const quotes = await promise;

    expect(querySpy).toHaveBeenCalledTimes(2);
    expect(quotes).toHaveLength(1);
    expect(quotes[0].id).toBe("page-a");
  });

  // (e-2) rate_limited 가 재시도 소진까지 계속되면 throw 전파.
  it("getQuotes: rate_limited 가 재시도 소진(총 3회)까지 지속되면 throw 한다", async () => {
    vi.useFakeTimers();

    const querySpy = vi
      .spyOn(notion.dataSources, "query")
      .mockRejectedValue(makeApiError("rate_limited", 429));

    const promise = getQuotes();
    // unhandled rejection 경고 방지를 위해 미리 catch 핸들러를 건다.
    const assertion = expect(promise).rejects.toBeInstanceOf(APIResponseError);
    await vi.runAllTimersAsync();
    await assertion;

    // 최초 1회 + 재시도 2회 = 총 3회.
    expect(querySpy).toHaveBeenCalledTimes(3);
  });

  // (f) 500/기타 에러 → throw 전파(재시도하지 않음).
  it("getQuotes: rate_limited 가 아닌 에러(500)는 재시도 없이 throw 한다", async () => {
    const querySpy = vi
      .spyOn(notion.dataSources, "query")
      .mockRejectedValue(makeApiError("internal_server_error", 500));

    await expect(getQuotes()).rejects.toBeInstanceOf(APIResponseError);
    // 재시도하지 않으므로 1회만 호출.
    expect(querySpy).toHaveBeenCalledTimes(1);
  });

  // (f-2) getQuote 의 기타 에러도 그대로 throw(null 로 흡수하지 않음).
  it("getQuote: object_not_found/validation_error 외의 에러는 throw 한다", async () => {
    vi.spyOn(notion.pages, "retrieve").mockRejectedValue(
      makeApiError("internal_server_error", 500),
    );

    await expect(getQuote("page-x")).rejects.toBeInstanceOf(APIResponseError);
  });
});
