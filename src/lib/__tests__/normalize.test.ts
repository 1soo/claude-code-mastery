import { describe, expect, it } from "vitest";

import { normalizeQuote } from "@/lib/normalize";
import type { QuoteItem } from "@/lib/types";

import {
  pageAllFilled,
  pageEmptyTitle,
  pageKoreanRuns,
  pageNoStatus,
  pageNullNullable,
  pageUnknownStatus,
} from "./fixtures/notion-pages";

describe("normalizeQuote: 노션 page → Quote 정규화", () => {
  it("(a) 전 필드가 정상이면 모든 값을 매핑한다", () => {
    const quote = normalizeQuote(pageAllFilled);

    expect(quote.id).toBe("page-a");
    // 제목은 rich_text '제목', 견적번호는 title '견적번호'(타입이 PRD와 반대).
    expect(quote.title).toBe("2026년 6월 웹사이트 구축 견적서");
    expect(quote.quoteNumber).toBe("Q-2026-001");
    expect(quote.clientName).toBe("메타넷글로벌");
    expect(quote.clientEmail).toBe("client@example.com");
    expect(quote.issuedAt).toBe("2026-06-01");
    expect(quote.expiresAt).toBe("2026-06-30");
    expect(quote.totalAmount).toBe(3300000);
    expect(quote.status).toBe("issued");
    expect(quote.memo).toBe("부가세 포함 금액입니다.");
    // items 는 기본 빈 배열.
    expect(quote.items).toEqual([]);
  });

  it("(a-2) items 인자를 주입하면 그대로 반영한다", () => {
    const items: QuoteItem[] = [
      { name: "디자인", quantity: 1, unitPrice: 1000000, amount: 1000000 },
    ];
    const quote = normalizeQuote(pageAllFilled, items);
    expect(quote.items).toBe(items);
  });

  it("(b) 제목이 빈 rich_text 이면 '제목 없음'으로 fallback, 빈 견적번호/고객명/메모는 ''", () => {
    const quote = normalizeQuote(pageEmptyTitle);

    expect(quote.title).toBe("제목 없음");
    expect(quote.quoteNumber).toBe("");
    expect(quote.clientName).toBe("");
    expect(quote.memo).toBe("");
    // 합계금액 0 은 유효한 값이므로 null 이 아니다.
    expect(quote.totalAmount).toBe(0);
    expect(quote.expiresAt).toBeNull();
    expect(quote.status).toBe("reviewing");
  });

  it("(c) email/number/date 미입력 시 모두 null", () => {
    const quote = normalizeQuote(pageNullNullable);

    expect(quote.clientEmail).toBeNull();
    expect(quote.issuedAt).toBeNull();
    expect(quote.expiresAt).toBeNull();
    expect(quote.totalAmount).toBeNull();
    // 텍스트 필드는 정상값 유지.
    expect(quote.title).toBe("초안 견적서");
    expect(quote.quoteNumber).toBe("Q-DRAFT");
    expect(quote.status).toBe("approved");
  });

  it("(d) status select 미선택이면 null", () => {
    const quote = normalizeQuote(pageNoStatus);
    expect(quote.status).toBeNull();
    // 다른 필드는 정상 매핑되는지 함께 확인.
    expect(quote.clientEmail).toBe("noselect@example.com");
    expect(quote.totalAmount).toBe(1500000);
  });

  it("(d-2) status 가 매핑에 없는 값이면 null(미분류)", () => {
    const quote = normalizeQuote(pageUnknownStatus);
    expect(quote.status).toBeNull();
  });

  it("(e) 한글 plain_text 를 보존하고 조각난 rich_text 를 이어붙인다", () => {
    const quote = normalizeQuote(pageKoreanRuns);

    // 여러 런이 공백/이모지까지 보존되어 이어붙는다.
    expect(quote.title).toBe("주식회사 한글컴퍼니 견적서 🧾");
    expect(quote.quoteNumber).toBe("견적-2026-한글-001");
    expect(quote.clientName).toBe("홍길동 고객님");
    expect(quote.memo).toBe("비고: 긴급 처리 요망");
    expect(quote.status).toBe("expired");
  });
});
