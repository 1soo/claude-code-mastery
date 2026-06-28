// 앱 내부 도메인 타입 (PRD 데이터 모델 기준).
// 노션 API 응답은 nullable 필드가 많으므로, 정규화 레이어(lib/notion.ts)에서
// null 가드 + fallback 처리 후 아래 타입으로 변환해 사용한다.

// 견적서 상태 (노션 select 프로퍼티 → 앱 내부 값). 미선택 시 null.
export type QuoteStatus = "issued" | "reviewing" | "approved" | "expired";

// 견적서 단일 항목 (노션 페이지 본문에서 파싱)
export interface QuoteItem {
  name: string; // 품목명
  quantity: number; // 수량
  unitPrice: number; // 단가
  amount: number; // 금액 (수량 × 단가)
  note?: string; // 비고 (선택)
}

// 견적서 도메인 모델
export interface Quote {
  id: string; // 노션 페이지 ID
  title: string; // 견적서 제목 (빈 title → '제목 없음' fallback)
  quoteNumber: string; // 견적번호
  clientName: string; // 고객명
  clientEmail: string | null; // 고객 이메일 (미입력 가능)
  issuedAt: string | null; // 발행일 (ISO 8601, 미입력 가능)
  expiresAt: string | null; // 유효기간 (ISO 8601, 미입력 가능)
  totalAmount: number | null; // 합계금액 (미입력 가능)
  status: QuoteStatus | null; // select 미선택 → null
  memo: string; // 메모 (빈 값 → '')
  items: QuoteItem[]; // 견적 항목 목록
}

// 견적서 상태별 한국어 라벨 (배지 등 UI 표시에 재사용)
export const quoteStatusLabel: Record<QuoteStatus, string> = {
  issued: "발행",
  reviewing: "검토중",
  approved: "승인",
  expired: "만료",
};
