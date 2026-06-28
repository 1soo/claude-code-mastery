---
name: project-admin-quote-table-f008
description: V2-2 F008 어드민 견적서 테이블 — 정렬/검색/페이지 순수함수와 TanStack manual 연동 방식, use no memo 동작
metadata:
  type: project
---

V2-2(F008) 어드민 견적서 테이블 구현 완료. `/admin/quotes`.

**핵심 결정: TanStack 내장 모델 대신 순수함수 + manual 모드.**
- 정렬/검색/페이지 규칙은 `src/lib/quote-table.ts` 순수함수(`sortQuotes`/`filterQuotes`/`paginate`/`matchesQuery`/`normalizeQuery`)에 집중. vitest 28건 통과.
- 컴포넌트(`src/components/dashboard/quote-table.tsx`)는 `useReactTable`로 헤더 토글·렌더링만 하고, `getCoreRowModel`만 사용. 데이터는 순수함수로 sort→filter→paginate 가공한 `slice`만 `data`로 전달.
- **Why:** TanStack `sortingFn`은 desc 시 결과를 자동 부호반전하므로 "null은 방향 무관 항상 뒤" 규칙을 깨뜨림. 내장 모델을 쓰면 단위테스트(순수함수)와 런타임 정렬이 어긋남.
- **How to apply:** 정렬에 null-마지막 같은 비대칭 규칙이 있으면 TanStack 내장정렬 신뢰 말고 순수함수로 미리 정렬 후 manual 주입. `sortQuotes`는 null을 분리해 non-null만 부호반전 정렬 후 뒤에 붙임.

**status 정렬 순서(asc):** issued→reviewing→approved→expired→null(미분류 항상 뒤). `STATUS_ORDER` 상수로 정의(quoteStatusLabel과 별개).

**"use no memo" 동작 확인:** 1행 `"use no memo";` 2행 `"use client";`. 이 환경(Next16/React19.2/reactCompiler:true)에서 ESLint가 `react-hooks/incompatible-library` **warning**(error 아님)을 내며 "Compilation Skipped" 메시지 출력 — 이게 지시어가 제대로 먹은 정상 신호. build/lint 0 errors. [[project_tanstack_table_no_memo]]

**재사용 패턴(재구현 금지):** 발행일 포맷은 `date-fns` `format(new Date(iso), "yyyy.MM.dd")`(quote-card와 동일), 금액은 `formatKRW`(null→"-"), 상태셀은 `<StatusBadge>`, 상태필터 라벨은 `quoteStatusLabel`. 검색입력은 shadcn `input`(이번에 add).

**행 액션 컬럼:** id "actions"로 자리만 마련(빈 셀). 내용은 F009/V2-3에서 채움.

**revalidate:** 어드민도 공개목록과 동일 60초. page.tsx에서 `getQuotes()` RSC 호출 후 0건이면 EmptyState, 아니면 QuoteTable에 배열 props.

**UI 에이전트 인계:** 마크업은 최소 수준(ui/table + 기본 Tailwind). 정렬 인디케이터(ArrowUp/Down/ChevronsUpDown), 페이지네이션 UI, 반응형, 셀 정렬/여백 다듬기 필요.
