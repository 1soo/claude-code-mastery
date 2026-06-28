// 어드민 견적서 테이블의 정렬·검색·페이지네이션 순수 로직 (UI 의존 없음).
// vitest 단위 검증 대상이며, 테이블 컴포넌트(components/dashboard/quote-table.tsx)의
// TanStack sortingFn/globalFilterFn 이 동일 규칙을 공유하도록 여기 함수를 재사용한다.
// 외부 노션 API 호출 없이 Quote[] 배열만 다룬다.

import type { Quote, QuoteStatus } from "@/lib/types";

// 정렬 가능한 컬럼 키 (테이블 헤더 클릭 정렬 대상).
export type SortKey = "issuedAt" | "totalAmount" | "status";

// 정렬 방향.
export type SortDirection = "asc" | "desc";

// status 의 안정적 정렬 순서(오름차순 기준).
// issued → reviewing → approved → expired → null(미분류, 항상 뒤).
// quoteStatusLabel(types.ts)과 별개로 "정렬 우선순위"만 정의한다.
const STATUS_ORDER: Record<QuoteStatus, number> = {
  issued: 0,
  reviewing: 1,
  approved: 2,
  expired: 3,
};
// null(미분류)은 항상 가장 뒤로 보내기 위한 큰 값.
const STATUS_NULL_ORDER = Number.MAX_SAFE_INTEGER;

// 키별 원시 비교(오름차순 기준). non-null 영역에서만 호출되며,
// null 위치(항상 뒤)는 sortQuotes 가 별도로 분리 처리한다.
function compareByKey(a: Quote, b: Quote, key: SortKey): number {
  switch (key) {
    case "issuedAt":
      return compareNullableString(a.issuedAt, b.issuedAt);
    case "totalAmount":
      return compareNullableNumber(a.totalAmount, b.totalAmount);
    case "status":
      return compareStatus(a.status, b.status);
  }
}

// 문자열(ISO 날짜 등) 비교(오름차순 기준). null 방어 분기는 남기되,
// 실제 null 위치 결정은 sortQuotes 의 null 분리 로직이 담당한다.
function compareNullableString(a: string | null, b: string | null): number {
  if (a === b) return 0;
  if (a === null) return 1; // a 를 뒤로
  if (b === null) return -1; // b 를 뒤로
  return a < b ? -1 : 1;
}

function compareNullableNumber(a: number | null, b: number | null): number {
  if (a === b) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return a < b ? -1 : 1;
}

function compareStatus(a: QuoteStatus | null, b: QuoteStatus | null): number {
  const oa = a === null ? STATUS_NULL_ORDER : STATUS_ORDER[a];
  const ob = b === null ? STATUS_NULL_ORDER : STATUS_ORDER[b];
  if (oa === ob) return 0;
  return oa < ob ? -1 : 1;
}

/**
 * 정렬 키/방향을 적용한 새 배열을 반환한다(원본 불변).
 * 주의: null 은 방향과 무관하게 항상 뒤로 정렬된다(compareQuotes 규칙).
 *   - asc:  값 오름차순,  null 뒤
 *   - desc: 값 내림차순, null 뒤
 * desc 에서 단순 부호 반전을 쓰면 null 이 앞으로 와버리므로,
 * null 분리 후 non-null 영역만 정렬해 합친다.
 */
export function sortQuotes(
  quotes: Quote[],
  key: SortKey,
  direction: SortDirection,
): Quote[] {
  const valued: Quote[] = [];
  const nulls: Quote[] = [];
  for (const q of quotes) {
    if (isNullForKey(q, key)) nulls.push(q);
    else valued.push(q);
  }
  // non-null 끼리만 방향 적용 정렬(부호 반전이 null 에 영향 주지 않게).
  valued.sort((a, b) =>
    direction === "asc"
      ? compareByKey(a, b, key)
      : -compareByKey(a, b, key),
  );
  // null(미분류/미입력)은 방향과 무관하게 항상 뒤.
  return [...valued, ...nulls];
}

// 주어진 정렬 키에 대해 해당 견적서의 값이 null 인지 판정.
function isNullForKey(q: Quote, key: SortKey): boolean {
  if (key === "issuedAt") return q.issuedAt === null;
  if (key === "totalAmount") return q.totalAmount === null;
  return q.status === null;
}

/**
 * 검색어 정규화: 좌우 공백 제거 + 소문자화.
 * 검색 predicate 와 전역 필터에서 동일하게 사용한다.
 */
export function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

/**
 * 단건 견적서가 검색어에 매칭되는지 판정한다.
 * 견적번호(quoteNumber) 또는 고객명(clientName) 부분일치(대소문자 무시).
 * 정규화된 query 가 빈 문자열이면 전체 통과(true).
 *
 * @param quote 대상 견적서
 * @param query 사용자 입력 검색어(정규화 전 원문 허용 — 내부에서 normalizeQuery)
 */
export function matchesQuery(quote: Quote, query: string): boolean {
  const q = normalizeQuery(query);
  if (q === "") return true;
  const haystack = `${quote.quoteNumber} ${quote.clientName}`.toLowerCase();
  return haystack.includes(q);
}

/**
 * 검색어로 거른 새 배열을 반환한다(원본 불변).
 * 빈 query(공백 포함)는 전체를 그대로 통과시킨다.
 */
export function filterQuotes(quotes: Quote[], query: string): Quote[] {
  const q = normalizeQuery(query);
  if (q === "") return [...quotes];
  return quotes.filter((quote) => matchesQuery(quote, query));
}

// 페이지네이션 결과.
export interface PaginateResult<T> {
  slice: T[]; // 현재 페이지에 보일 항목
  totalPages: number; // 총 페이지 수(최소 1 — 빈 목록도 1페이지로 본다)
  page: number; // 경계 보정된 현재 페이지(1-base)
}

/**
 * 1-base 페이지네이션 계산. 원본 불변(슬라이스만 반환).
 *
 * 규칙:
 *   - page 는 1 미만이면 1 로, totalPages 초과면 totalPages 로 보정한다.
 *   - size 가 1 미만이면 1 로 보정(0/음수 방어).
 *   - 빈 목록(rows.length === 0)은 totalPages = 1, slice = [], page = 1.
 *     (UI 가 "1 / 1" 을 안정적으로 표시할 수 있게 0 이 아닌 1 로 둔다.)
 *
 * @param rows 전체(정렬·검색이 끝난) 행
 * @param page 요청 페이지(1-base)
 * @param size 페이지당 항목 수
 */
export function paginate<T>(
  rows: T[],
  page: number,
  size: number,
): PaginateResult<T> {
  const safeSize = Math.max(1, Math.floor(size));
  const totalPages = Math.max(1, Math.ceil(rows.length / safeSize));
  // page 보정: [1, totalPages] 범위로 clamp.
  const safePage = Math.min(Math.max(1, Math.floor(page)), totalPages);
  const start = (safePage - 1) * safeSize;
  const slice = rows.slice(start, start + safeSize);
  return { slice, totalPages, page: safePage };
}
