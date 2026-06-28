// 금액 포맷·계산 유틸 단위 테스트.
// ko-KR ₩ 포맷은 Intl이 결정적으로 동작하므로 정확한 출력 문자열을 toBe로 단언한다.
import { describe, it, expect } from "vitest";

import { calcAmount, formatKRW, sumAmount } from "@/lib/format";

describe("formatKRW", () => {
  it("일반 금액을 ₩ 통화 문자열로 포맷한다", () => {
    expect(formatKRW(1500000)).toBe("₩1,500,000");
  });

  it("0원을 포맷한다", () => {
    expect(formatKRW(0)).toBe("₩0");
  });

  it("음수 금액은 부호가 앞에 붙는다", () => {
    expect(formatKRW(-1000)).toBe("-₩1,000");
  });

  it("null이면 '-'를 반환한다", () => {
    expect(formatKRW(null)).toBe("-");
  });

  it("undefined이면 '-'를 반환한다", () => {
    expect(formatKRW(undefined)).toBe("-");
  });
});

describe("calcAmount", () => {
  it("수량 × 단가를 계산한다", () => {
    expect(calcAmount(3, 450000)).toBe(1350000);
  });

  it("수량이 0이면 0이다", () => {
    expect(calcAmount(0, 450000)).toBe(0);
  });

  it("단가가 0이면 0이다", () => {
    expect(calcAmount(3, 0)).toBe(0);
  });

  it("음수 수량 경계를 처리한다", () => {
    expect(calcAmount(-2, 1000)).toBe(-2000);
  });
});

describe("sumAmount", () => {
  it("여러 항목의 금액을 합산한다", () => {
    const items = [{ amount: 1000 }, { amount: 2500 }, { amount: 450000 }];
    expect(sumAmount(items)).toBe(453500);
  });

  it("빈 배열이면 0이다", () => {
    expect(sumAmount([])).toBe(0);
  });

  it("단일 항목이면 그 금액과 같다", () => {
    expect(sumAmount([{ amount: 1350000 }])).toBe(1350000);
  });
});
