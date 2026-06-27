---
name: project-share-url-f009
description: V2-3/F009 공유 URL 단일소스(lib/share.ts)와 어드민 테이블 행 액션 메뉴 구현
metadata:
  type: project
---

`src/lib/share.ts`의 `buildShareUrl(quoteId, origin?)`가 견적서 공유 URL의 단일 소스다. `${origin ?? siteConfig.url}/quotes/${quoteId}` — 인코딩 안 함(기존 F005 인라인 동작 보존).

**Why:** F005 공개 버튼과 F009 어드민 테이블 행 액션이 동일한 URL 형식을 써야 해서 순수 함수로 추출. server-only 의존 금지(클라/테스트 양쪽 import).

**How to apply:**
- 공유 URL이 필요하면 직접 템플릿 만들지 말고 `buildShareUrl` 사용. 클라이언트에선 `window.location.origin` 전달, 비브라우저/폴백은 undefined.
- 복사 동작·토스트 문구는 고정: 성공 `toast.success("링크가 복사되었습니다")`, 실패 `toast.error("링크 복사에 실패했습니다")`. 두 곳([[project_quote_components]]의 quote-share-button, quote-table의 QuoteRowActions)이 공유하므로 한쪽만 바꾸면 회귀.
- 어드민 테이블 행 액션은 [[project_admin_quote_table_f008]] quote-table.tsx 하단 `QuoteRowActions({ quote })` 컴포넌트. 행/ID 혼선 방지를 위해 cell에서 `row.original`을 props로 전달(클로저로 index 참조 금지). dropdown-menu의 `DropdownMenuItem onSelect`로 복사, `asChild`+next/link로 "견적서 보기"(target=_blank).
- 메뉴 비주얼/정렬은 후속 UI 에이전트가 다듬는 영역(트리거 MoreHorizontal, 항목 스타일).
