---
name: quote-detail-page-data-flow
description: 견적서 상세 page.tsx의 데이터 페칭·ISR·notFound·generateMetadata 패턴
metadata:
  type: project
---

`src/app/quotes/[id]/page.tsx` (RSC) 데이터 흐름:

- `export const revalidate = 300;` (상세 ISR 300초. 목록 `/`은 60초)
- `const { id } = await params;` (params는 Promise)
- `const quote = await getQuote(id); if (!quote) notFound();`
- `getQuote`(노션 접근, `src/lib/notion.ts`, server-only)는 **RSC인 page.tsx에서만** 호출. 컴포넌트로 내려보내지 않음.
- `generateMetadata`도 같은 `getQuote(id)` 호출로 title=`견적서 ${quoteNumber}` 설정. 빌드 시 동일 ID에 대해 page 본문과 합쳐 캐시됨(Next dedup).

빌드 결과: `/quotes/[id]`는 동적(ƒ) 라우트로 표시됨(동적 세그먼트). 목록 `/`은 Revalidate 1m.

**Why:** shrimp-rules.md 렌더링 규칙(상세 revalidate=300, 미존재 시 notFound, 노션 접근은 notion.ts 경유).
**How to apply:** 상세 페이지 데이터 추가 시 동일 패턴 유지. notFound() 시 `src/app/not-found.tsx`(EmptyState 기반)가 렌더됨.
