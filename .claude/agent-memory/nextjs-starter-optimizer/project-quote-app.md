---
name: project-quote-app
description: ch18 프로젝트의 정체성이 어드민 대시보드 스타터에서 노션 기반 견적서 공유 앱으로 전환됨
metadata:
  type: project
---

ch18은 `docs/PRD.md`에 정의된 **노션 기반 견적서 관리/공유 웹앱 MVP**의 프로덕션 기반이다. 더 이상 어드민 대시보드가 아니다.

**Why:** 스타터킷(어드민 대시보드)을 견적서 앱의 출발점으로 재활용. PRD는 인증 없는 공개 2페이지(목록/상세) + 에러 구조의 읽기 전용 앱을 요구.

**How to apply:**
- 앱 성격: 인증 없음, 공개 URL 기반, 노션이 유일한 데이터 소스. 견적서 조회 + PDF 다운로드(`window.print()` + `@media print`, `react-to-print`로 트리거).
- 라우트: `/`(견적서 목록·진입점, RSC ISR 60초), `/quotes/[id]`(상세, RSC ISR 300초), `error.tsx`/`not-found.tsx`(에러).
- 도메인 타입은 `src/lib/types.ts`의 `Quote`/`QuoteItem`(PRD 기준). 노션 연동 자리는 `src/lib/notion.ts`(stub: `getQuotes`/`getQuote`/`normalizeQuote`, `server-only` 보장, notionVersion `2025-09-03`, `dataSources.query` 사용).
- 단일 소스: `src/config/site.ts`(siteConfig=견적서 공유, mainNav=견적서 목록 1개), `providers.tsx`(테마+툴팁+sonner — sonner는 링크 복사 토스트에 필수라 유지).
- 골격만 존재 — 실제 노션 fetch/렌더/PDF는 미구현 TODO. 관련 [[project-open-decisions]].
