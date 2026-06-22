---
name: project-quote-app
description: ch18 견적서 공유 앱 MVP의 범위·기능 ID·이미 스캐폴딩된 자산. PRD는 docs/PRD.md, 로드맵은 ROADMAP.md.
metadata:
  type: project
---

ch18 프로젝트는 어드민 대시보드 스타터킷을 기반으로 한 **노션 견적서 공유 웹앱 MVP**다. PRD: `docs/PRD.md`, 로드맵: `ROADMAP.md`(2026-06-23 생성).

기능 ID: F001(목록조회) F002(상세조회) F003(PDF다운로드, window.print 방식) F004(노션 dataSources.query 연동) F005(공유링크 클립보드복사) F006(에러처리).

**이미 스캐폴딩된 자산** (재구현 금지, TODO 채우기만 — 작성 시점 기준이므로 착수 전 현재 상태 재확인):
- 의존성 설치됨: `@notionhq/client@^5.1.0`, `react-to-print@^3.0.5`
- `src/lib/types.ts`: Quote/QuoteItem/quoteStatusLabel 완성
- `src/lib/notion.ts`: notion 클라이언트(notionVersion 2025-09-03) + getQuotes/getQuote stub(미구현 throw) + normalizeQuote 주석
- 라우트 골격: `/`=목록(src/app/page.tsx), `/quotes/[id]`=상세, error.tsx, not-found.tsx
- UI 프리미티브 존재: badge button card dialog dropdown-menu separator sonner table tooltip / 공용: EmptyState PageHeader ThemeToggle

**Why:** 로드맵/계획 시 이 자산들을 "신규 작업"이 아닌 "채우기 작업"으로 분류해야 추정·의존성이 정확해진다.
**How to apply:** 다음 견적서 앱 관련 요청 시 docs/PRD.md와 위 파일들의 현재 상태부터 확인하고, stub 시그니처를 존중해 작업을 기술한다.

관련: [[feature-react-compiler-tanstack-trap]], [[reference-prd-validation]]
