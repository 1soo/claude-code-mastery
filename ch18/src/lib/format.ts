// 금액 포맷·계산 유틸 (순수 함수).
// cn() 등 클래스 유틸과 관심사를 분리하기 위해 utils.ts와 별도 파일로 둔다.
// 외부 라이브러리 없이 표준 Intl API만 사용한다(바퀴 재발명 금지).
// 서버/클라이언트 양쪽에서 import 가능한 순수 모듈이다.

// ko-KR 통화 포맷터.
// 모듈 로드 시 1회만 생성해 재사용한다(포맷터 생성 비용 절감, 결정적 출력 보장).
const krwFormatter = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
});

/**
 * 숫자를 한국 원화(₩) 문자열로 포맷한다.
 * 예: 1500000 → "₩1,500,000", 0 → "₩0", -1000 → "-₩1,000"
 * 값이 null/undefined(미입력)면 "-"를 반환한다(예: Quote.totalAmount).
 */
export function formatKRW(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  return krwFormatter.format(value);
}

/**
 * 견적 항목의 금액을 계산한다(수량 × 단가).
 */
export function calcAmount(quantity: number, unitPrice: number): number {
  return quantity * unitPrice;
}

/**
 * 견적 항목 금액의 합계를 구한다(합계금액 표시용).
 */
export function sumAmount(items: { amount: number }[]): number {
  return items.reduce((total, item) => total + item.amount, 0);
}
