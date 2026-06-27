// 어드민 견적서 테이블 순수 로직(정렬·검색·페이지네이션) 단위 테스트.
// 외부 노션 API 호출 없이 Quote[] fixture 만으로 검증한다.
import { describe, it, expect } from "vitest";

import {
  filterQuotes,
  matchesQuery,
  normalizeQuery,
  paginate,
  sortQuotes,
} from "@/lib/quote-table";
import type { Quote, QuoteStatus } from "@/lib/types";

// 테스트용 Quote 빌더 — 정렬/검색에 쓰는 필드만 의미 있게 채우고
// 나머지는 형식상 기본값으로 둔다.
function makeQuote(overrides: Partial<Quote> & { id: string }): Quote {
  return {
    id: overrides.id,
    title: overrides.title ?? "제목",
    quoteNumber: overrides.quoteNumber ?? "Q-0000",
    clientName: overrides.clientName ?? "고객",
    clientEmail: overrides.clientEmail ?? null,
    issuedAt: overrides.issuedAt ?? null,
    expiresAt: overrides.expiresAt ?? null,
    totalAmount: overrides.totalAmount ?? null,
    status: overrides.status ?? null,
    memo: overrides.memo ?? "",
    items: overrides.items ?? [],
  };
}

// 공통 fixture: 발행일/합계/상태가 섞이고 null 도 포함.
const q1 = makeQuote({
  id: "1",
  quoteNumber: "Q-2026-001",
  clientName: "메타넷글로벌",
  issuedAt: "2026-06-01",
  totalAmount: 3300000,
  status: "issued",
});
const q2 = makeQuote({
  id: "2",
  quoteNumber: "Q-2026-002",
  clientName: "ACME Corp",
  issuedAt: "2026-06-20",
  totalAmount: 550000,
  status: "expired",
});
const q3 = makeQuote({
  id: "3",
  quoteNumber: "Q-2026-003",
  clientName: "초안고객",
  issuedAt: null, // null 위치 검증용
  totalAmount: null, // null 위치 검증용
  status: null, // 미분류 검증용
});
const q4 = makeQuote({
  id: "4",
  quoteNumber: "Q-2026-004",
  clientName: "삼성전자",
  issuedAt: "2026-06-10",
  totalAmount: 1500000,
  status: "approved",
});

const baseQuotes: Quote[] = [q1, q2, q3, q4];

// 정렬 결과를 id 배열로 단언하기 위한 헬퍼.
function ids(quotes: Quote[]): string[] {
  return quotes.map((q) => q.id);
}

describe("sortQuotes - issuedAt", () => {
  it("오름차순: 과거→최근, null 은 항상 뒤", () => {
    // 날짜: q1(06-01) < q4(06-10) < q2(06-20), q3(null) 뒤.
    expect(ids(sortQuotes(baseQuotes, "issuedAt", "asc"))).toEqual([
      "1",
      "4",
      "2",
      "3",
    ]);
  });

  it("내림차순: 최근→과거, null 은 여전히 뒤(부호 반전에도 앞으로 오지 않음)", () => {
    expect(ids(sortQuotes(baseQuotes, "issuedAt", "desc"))).toEqual([
      "2",
      "4",
      "1",
      "3",
    ]);
  });

  it("원본 배열을 변경하지 않는다(불변)", () => {
    const snapshot = ids(baseQuotes);
    sortQuotes(baseQuotes, "issuedAt", "asc");
    expect(ids(baseQuotes)).toEqual(snapshot);
  });
});

describe("sortQuotes - totalAmount", () => {
  it("오름차순: 작은 금액→큰 금액, null 뒤", () => {
    // 금액: q2(550000) < q4(1500000) < q1(3300000), q3(null) 뒤.
    expect(ids(sortQuotes(baseQuotes, "totalAmount", "asc"))).toEqual([
      "2",
      "4",
      "1",
      "3",
    ]);
  });

  it("내림차순: 큰 금액→작은 금액, null 뒤", () => {
    expect(ids(sortQuotes(baseQuotes, "totalAmount", "desc"))).toEqual([
      "1",
      "4",
      "2",
      "3",
    ]);
  });
});

describe("sortQuotes - status", () => {
  it("오름차순: issued→reviewing→approved→expired→null(미분류) 순", () => {
    // q1(issued) < q4(approved) < q2(expired) < q3(null).
    expect(ids(sortQuotes(baseQuotes, "status", "asc"))).toEqual([
      "1",
      "4",
      "2",
      "3",
    ]);
  });

  it("reviewing 을 포함한 전체 상태 순서를 안정적으로 정렬한다", () => {
    const statuses: QuoteStatus[] = [
      "expired",
      "approved",
      "reviewing",
      "issued",
    ];
    const quotes = statuses.map((status, i) =>
      makeQuote({ id: String(i), status }),
    );
    // asc 기대 순서: issued, reviewing, approved, expired.
    const sorted = sortQuotes(quotes, "status", "asc");
    expect(sorted.map((q) => q.status)).toEqual([
      "issued",
      "reviewing",
      "approved",
      "expired",
    ]);
  });

  it("내림차순에서도 null(미분류)은 항상 뒤로 간다", () => {
    const sorted = sortQuotes(baseQuotes, "status", "desc");
    // 마지막은 항상 null(q3).
    expect(sorted[sorted.length - 1].id).toBe("3");
  });
});

describe("normalizeQuery", () => {
  it("좌우 공백을 제거하고 소문자화한다", () => {
    expect(normalizeQuery("  ACME  ")).toBe("acme");
  });

  it("빈 문자열/공백만 있으면 빈 문자열을 반환한다", () => {
    expect(normalizeQuery("   ")).toBe("");
    expect(normalizeQuery("")).toBe("");
  });
});

describe("matchesQuery", () => {
  it("견적번호 부분일치를 찾는다", () => {
    expect(matchesQuery(q1, "001")).toBe(true);
  });

  it("고객명 부분일치를 찾는다", () => {
    expect(matchesQuery(q1, "메타넷")).toBe(true);
  });

  it("대소문자를 무시한다", () => {
    expect(matchesQuery(q2, "acme")).toBe(true);
    expect(matchesQuery(q2, "ACME")).toBe(true);
  });

  it("좌우 공백을 무시한다", () => {
    expect(matchesQuery(q2, "  corp  ")).toBe(true);
  });

  it("매칭되지 않으면 false", () => {
    expect(matchesQuery(q1, "존재하지않는값")).toBe(false);
  });

  it("빈 query 는 전체 통과(true)", () => {
    expect(matchesQuery(q1, "")).toBe(true);
    expect(matchesQuery(q1, "   ")).toBe(true);
  });
});

describe("filterQuotes", () => {
  it("견적번호로 거른다", () => {
    expect(ids(filterQuotes(baseQuotes, "002"))).toEqual(["2"]);
  });

  it("고객명으로 거른다(대소문자 무시)", () => {
    expect(ids(filterQuotes(baseQuotes, "acme"))).toEqual(["2"]);
  });

  it("무매칭이면 빈 배열", () => {
    expect(filterQuotes(baseQuotes, "zzz없음")).toEqual([]);
  });

  it("빈 query 는 전체 통과", () => {
    expect(ids(filterQuotes(baseQuotes, "  "))).toEqual(["1", "2", "3", "4"]);
  });

  it("원본 배열을 변경하지 않는다", () => {
    const snapshot = ids(baseQuotes);
    filterQuotes(baseQuotes, "001");
    expect(ids(baseQuotes)).toEqual(snapshot);
  });
});

describe("paginate", () => {
  const rows = [1, 2, 3, 4, 5, 6, 7]; // 7건

  it("정상 슬라이스: 1페이지(size 3)", () => {
    const r = paginate(rows, 1, 3);
    expect(r.slice).toEqual([1, 2, 3]);
    expect(r.totalPages).toBe(3); // ceil(7/3)
    expect(r.page).toBe(1);
  });

  it("마지막 페이지 경계: 3페이지에 1건만", () => {
    const r = paginate(rows, 3, 3);
    expect(r.slice).toEqual([7]);
    expect(r.page).toBe(3);
  });

  it("page 가 totalPages 초과면 마지막 페이지로 보정", () => {
    const r = paginate(rows, 99, 3);
    expect(r.page).toBe(3);
    expect(r.slice).toEqual([7]);
  });

  it("page 가 0/음수면 1페이지로 보정", () => {
    expect(paginate(rows, 0, 3).page).toBe(1);
    expect(paginate(rows, -5, 3).page).toBe(1);
    expect(paginate(rows, -5, 3).slice).toEqual([1, 2, 3]);
  });

  it("빈 목록: totalPages 1, slice 빈 배열, page 1", () => {
    const r = paginate([], 1, 10);
    expect(r.slice).toEqual([]);
    expect(r.totalPages).toBe(1);
    expect(r.page).toBe(1);
  });

  it("size 가 length 보다 크면 전체가 1페이지", () => {
    const r = paginate(rows, 1, 100);
    expect(r.slice).toEqual(rows);
    expect(r.totalPages).toBe(1);
  });

  it("size 가 0/음수면 1로 보정", () => {
    const r = paginate(rows, 1, 0);
    expect(r.slice).toEqual([1]); // size 1 로 보정
    expect(r.totalPages).toBe(7);
  });
});
