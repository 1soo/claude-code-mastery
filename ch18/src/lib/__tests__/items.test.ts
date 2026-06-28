import { afterEach, describe, expect, it, vi } from "vitest";

import { parseQuoteItems } from "@/lib/normalize";

import {
  codeBlock,
  codeBlockFromJson,
  paragraphBlock,
} from "./fixtures/notion-blocks";

// console.error 를 가로채 fallback 경로(에러 로깅)를 검증하고, 테스트 출력 노이즈를 줄인다.
afterEach(() => {
  vi.restoreAllMocks();
});

describe("parseQuoteItems: 본문 JSON 코드 블록 파서", () => {
  it("정상 다건을 QuoteItem[] 로 파싱한다", () => {
    const json = JSON.stringify([
      { name: "기획", quantity: 1, unitPrice: 1000000, amount: 1000000, note: "1차" },
      { name: "디자인", quantity: 2, unitPrice: 500000, amount: 1000000 },
    ]);
    const items = parseQuoteItems([codeBlockFromJson(json)]);

    expect(items).toHaveLength(2);
    expect(items[0]).toEqual({
      name: "기획",
      quantity: 1,
      unitPrice: 1000000,
      amount: 1000000,
      note: "1차",
    });
    // note 누락 항목은 note 키 자체가 없어야 한다.
    expect(items[1]).toEqual({
      name: "디자인",
      quantity: 2,
      unitPrice: 500000,
      amount: 1000000,
    });
    expect("note" in items[1]).toBe(false);
  });

  it("여러 plain_text 런으로 나뉜 JSON 도 이어붙여 파싱한다", () => {
    const items = parseQuoteItems([
      codeBlock('[{"name":"개발",', '"quantity":3,', '"unitPrice":2000000}]'),
    ]);
    expect(items).toHaveLength(1);
    // amount 누락 → quantity * unitPrice 보정.
    expect(items[0].amount).toBe(6000000);
  });

  it("깨진 JSON 이면 [] 를 반환하고 console.error 로 로깅한다", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const items = parseQuoteItems([codeBlockFromJson('[{ name: "깨짐"')]);

    expect(items).toEqual([]);
    expect(spy).toHaveBeenCalledOnce();
  });

  it("최상위가 배열이 아니면 [] 를 반환한다", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const items = parseQuoteItems([codeBlockFromJson('{"name":"객체"}')]);

    expect(items).toEqual([]);
    expect(spy).toHaveBeenCalledOnce();
  });

  it("code 블록 본문이 비어 있으면 [] 를 반환한다", () => {
    const items = parseQuoteItems([codeBlock("")]);
    expect(items).toEqual([]);
  });

  it("code 블록이 없으면(단락만 존재) [] 를 반환한다", () => {
    const items = parseQuoteItems([paragraphBlock("그냥 설명 문단입니다.")]);
    expect(items).toEqual([]);
  });

  it("빈 blocks 배열이면 [] 를 반환한다", () => {
    expect(parseQuoteItems([])).toEqual([]);
  });

  it("amount 누락 시 quantity * unitPrice 로 보정한다", () => {
    const json = JSON.stringify([{ name: "유지보수", quantity: 12, unitPrice: 100000 }]);
    const items = parseQuoteItems([codeBlockFromJson(json)]);
    expect(items[0].amount).toBe(1200000);
  });

  it("amount 가 숫자가 아니면(NaN 유발) quantity * unitPrice 로 보정한다", () => {
    const json = JSON.stringify([
      { name: "보정", quantity: 2, unitPrice: 3000, amount: "이상한값" },
    ]);
    const items = parseQuoteItems([codeBlockFromJson(json)]);
    expect(items[0].amount).toBe(6000);
  });

  it("수량 0 / 음수 단가 등 경계값을 그대로 보존한다", () => {
    const json = JSON.stringify([
      { name: "무상제공", quantity: 0, unitPrice: 0, amount: 0 },
      { name: "할인", quantity: 1, unitPrice: -50000, amount: -50000 },
    ]);
    const items = parseQuoteItems([codeBlockFromJson(json)]);

    expect(items[0]).toMatchObject({ quantity: 0, unitPrice: 0, amount: 0 });
    expect(items[1]).toMatchObject({ quantity: 1, unitPrice: -50000, amount: -50000 });
  });

  it("note 가 문자열이 아니면(숫자/null) note 키를 생략한다", () => {
    const json = JSON.stringify([
      { name: "A", quantity: 1, unitPrice: 100, amount: 100, note: 123 },
      { name: "B", quantity: 1, unitPrice: 100, amount: 100, note: null },
    ]);
    const items = parseQuoteItems([codeBlockFromJson(json)]);

    expect("note" in items[0]).toBe(false);
    expect("note" in items[1]).toBe(false);
  });

  it("첫 code 블록만 사용한다(단락이 앞서 있어도 무시)", () => {
    const json = JSON.stringify([{ name: "항목", quantity: 1, unitPrice: 100, amount: 100 }]);
    const items = parseQuoteItems([
      paragraphBlock("머리말"),
      codeBlockFromJson(json),
    ]);
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe("항목");
  });
});
