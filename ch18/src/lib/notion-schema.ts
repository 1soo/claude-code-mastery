// 노션 data source(=invoices) 프로퍼티 ↔ 코드 필드 매핑 (단일 소스).
// 실제 노션 DB를 조회해 검증한 결과를 반영한다 (2026-06-23, Phase 0-T2).
//
// ⚠️ 주의 — PRD 가정과 다른 점:
//   노션 DB는 title 프로퍼티가 정확히 1개 필수다. 운영자가 '견적번호'를 title로 만들었으므로
//   노션상 '견적번호' = title, '제목' = rich_text 다 (PRD 가정과 타입이 반대).
//   정규화 레이어(normalizeQuote)는 아래 NOTION_PROP_TYPE에 따라 추출 분기해야 한다.
//
// 프로퍼티명을 코드 곳곳에 하드코딩하지 말고 반드시 이 상수를 통해서만 접근한다
// (노션에서 이름 변경 시 여기 한 곳만 수정).

import type { QuoteStatus } from "@/lib/types";

// 코드 필드 → 노션 프로퍼티명(한글). 노션 실제 이름과 공백까지 정확히 일치해야 한다.
export const NOTION_PROP = {
  title: "제목",
  quoteNumber: "견적번호",
  clientName: "고객명",
  clientEmail: "고객 이메일", // 공백 포함
  issuedAt: "발행일",
  expiresAt: "유효기간",
  totalAmount: "합계금액",
  status: "상태",
  memo: "메모",
} as const;

// 코드 필드 → 노션 프로퍼티 타입(추출 로직 분기용).
// title/rich_text가 PRD 가정과 반대인 점에 주의.
export const NOTION_PROP_TYPE = {
  title: "rich_text",
  quoteNumber: "title",
  clientName: "rich_text",
  clientEmail: "email",
  issuedAt: "date",
  expiresAt: "date",
  totalAmount: "number",
  status: "select",
  memo: "rich_text",
} as const;

// 노션 상태 select 한글값 → 앱 enum (단일 소스). 매핑에 없으면 null(미분류).
export const STATUS_FROM_NOTION: Record<string, QuoteStatus> = {
  발행: "issued",
  검토중: "reviewing",
  승인: "approved",
  만료: "expired",
};
