// 노션 정규화 레이어 (순수 함수 — server-only 의존 없음).
// 노션 page/block 응답을 앱 내부 도메인 타입(Quote / QuoteItem)으로 변환한다.
//
// 설계 원칙:
//   - 프로퍼티 접근은 반드시 NOTION_PROP / NOTION_PROP_TYPE 를 통해서만 한다(한글명 하드코딩 금지).
//   - @notionhq/client v5 응답 타입의 union을 타입 가드(p.type === "...")로 좁혀 안전하게 추출한다.
//   - strict 모드 null 가드 필수: email/number/date/select 는 미입력 시 null,
//     title/rich_text 는 항상 배열(빈 배열 가능)이므로 fallback 처리한다.
//   - 본문 항목 파서는 깨진 입력에도 throw하지 않고 [] 를 반환(상세 페이지가 깨지지 않도록).

import type {
  BlockObjectResponse,
  PageObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client";

import {
  NOTION_PROP,
  NOTION_PROP_TYPE,
  STATUS_FROM_NOTION,
} from "@/lib/notion-schema";
import type { Quote, QuoteItem, QuoteStatus } from "@/lib/types";

// page.properties 의 단일 프로퍼티 값 타입(union). 타입 가드로 좁혀 사용한다.
type PageProperty = PageObjectResponse["properties"][string];

/**
 * rich_text / title 배열을 평문 문자열로 이어붙인다.
 * 빈 배열이면 ''.
 */
function readPlainText(rich: RichTextItemResponse[]): string {
  return rich.map((t) => t.plain_text).join("");
}

/**
 * NOTION_PROP_TYPE 가 title/rich_text 인 프로퍼티에서 평문 텍스트를 추출한다.
 * 프로퍼티가 없거나 타입이 기대와 다르면 '' 를 반환한다.
 */
function readTextProp(prop: PageProperty | undefined): string {
  if (!prop) return "";
  if (prop.type === "title") return readPlainText(prop.title);
  if (prop.type === "rich_text") return readPlainText(prop.rich_text);
  return "";
}

/**
 * email 프로퍼티에서 이메일을 추출한다. 미입력 시 null.
 */
function readEmailProp(prop: PageProperty | undefined): string | null {
  if (!prop || prop.type !== "email") return null;
  return prop.email ?? null;
}

/**
 * number 프로퍼티에서 숫자를 추출한다. 미입력 시 null.
 */
function readNumberProp(prop: PageProperty | undefined): number | null {
  if (!prop || prop.type !== "number") return null;
  return prop.number ?? null;
}

/**
 * date 프로퍼티에서 시작일(ISO 8601)을 추출한다. 미입력 시 null.
 */
function readDateProp(prop: PageProperty | undefined): string | null {
  if (!prop || prop.type !== "date") return null;
  return prop.date?.start ?? null;
}

/**
 * select 프로퍼티에서 상태값을 추출해 앱 enum 으로 매핑한다.
 * 미선택이거나 매핑에 없는 값이면 null(미분류).
 */
function readStatusProp(prop: PageProperty | undefined): QuoteStatus | null {
  if (!prop || prop.type !== "select") return null;
  const name = prop.select?.name ?? "";
  return STATUS_FROM_NOTION[name] ?? null;
}

/**
 * 노션 page 응답을 앱 내부 Quote 타입으로 정규화한다.
 *
 * ⚠️ 노션 DB는 '견적번호'가 title, '제목'이 rich_text 다(PRD 가정과 반대).
 *    프로퍼티 접근은 NOTION_PROP_TYPE 에 기록된 실제 타입을 따른다.
 *
 * @param page  pages.retrieve / dataSources.query 로 얻은 PageObjectResponse
 * @param items 본문에서 파싱한 견적 항목(T3 파서가 채워 주입). 기본 []
 */
export function normalizeQuote(
  page: PageObjectResponse,
  items: QuoteItem[] = [],
): Quote {
  const props = page.properties;

  // NOTION_PROP_TYPE 상 title='rich_text', quoteNumber='title' 임에 주의.
  const title = readTextProp(props[NOTION_PROP.title]);
  const quoteNumber = readTextProp(props[NOTION_PROP.quoteNumber]);
  const clientName = readTextProp(props[NOTION_PROP.clientName]);
  const memo = readTextProp(props[NOTION_PROP.memo]);

  return {
    id: page.id,
    // 빈 제목은 '제목 없음' fallback.
    title: title === "" ? "제목 없음" : title,
    quoteNumber, // 빈 값 → ''
    clientName, // 빈 값 → ''
    clientEmail: readEmailProp(props[NOTION_PROP.clientEmail]),
    issuedAt: readDateProp(props[NOTION_PROP.issuedAt]),
    expiresAt: readDateProp(props[NOTION_PROP.expiresAt]),
    totalAmount: readNumberProp(props[NOTION_PROP.totalAmount]),
    status: readStatusProp(props[NOTION_PROP.status]),
    memo, // 빈 값 → ''
    items,
  };
}

// JSON.parse 결과의 개별 항목을 안전하게 다루기 위한 임시 형태.
type RawItem = Record<string, unknown>;

/**
 * 본문 blocks 에서 견적 항목 JSON 코드 블록을 파싱한다(방식 A 확정).
 *
 * 절차:
 *   1. blocks 에서 type === 'code' 인 첫 블록을 찾는다.
 *   2. code.rich_text[].plain_text 를 이어붙여 JSON 문자열을 만든다.
 *   3. JSON.parse → Array.isArray 가드 → 각 항목을 QuoteItem 으로 coerce.
 *
 * amount 가 없거나 숫자가 아니면 quantity * unitPrice 로 보정한다.
 * 깨진 JSON·빈 본문·code 블록 없음 등 어떤 실패도 throw하지 않고
 * 빈 배열([])을 반환하고 console.error 로 로깅한다(상세 페이지가 깨지지 않도록).
 */
export function parseQuoteItems(blocks: BlockObjectResponse[]): QuoteItem[] {
  try {
    // 1. 첫 code 블록 탐색.
    const codeBlock = blocks.find((b) => b.type === "code");
    if (!codeBlock || codeBlock.type !== "code") {
      // code 블록 없음 → 항목 없음으로 간주(정상 케이스일 수 있음).
      return [];
    }

    // 2. plain_text 이어붙여 JSON 문자열 확보.
    const jsonText = readPlainText(codeBlock.code.rich_text).trim();
    if (jsonText === "") return [];

    // 3. 파싱 + 배열 가드.
    const parsed: unknown = JSON.parse(jsonText);
    if (!Array.isArray(parsed)) {
      console.error("[parseQuoteItems] JSON 최상위가 배열이 아님:", typeof parsed);
      return [];
    }

    // 각 항목 coerce.
    return parsed.map((raw) => coerceQuoteItem(raw as RawItem));
  } catch (error) {
    // 깨진 JSON 등 모든 예외를 흡수하고 빈 배열 반환.
    console.error("[parseQuoteItems] 견적 항목 파싱 실패:", error);
    return [];
  }
}

/**
 * 원시 객체 1건을 QuoteItem 으로 변환한다.
 * amount 누락/NaN 시 quantity * unitPrice 로 보정한다.
 */
function coerceQuoteItem(raw: RawItem): QuoteItem {
  const name = String(raw.name ?? "");
  const quantity = Number(raw.quantity);
  const unitPrice = Number(raw.unitPrice);

  // amount 가 유효한 숫자가 아니면 수량 × 단가로 보정.
  const rawAmount = Number(raw.amount);
  const amount = Number.isNaN(rawAmount) ? quantity * unitPrice : rawAmount;

  // note 는 문자열일 때만 채우고, 그 외(누락/null/숫자 등)는 undefined.
  const note = typeof raw.note === "string" ? raw.note : undefined;

  return {
    name,
    quantity: Number.isNaN(quantity) ? 0 : quantity,
    unitPrice: Number.isNaN(unitPrice) ? 0 : unitPrice,
    amount: Number.isNaN(amount) ? 0 : amount,
    ...(note !== undefined ? { note } : {}),
  };
}
