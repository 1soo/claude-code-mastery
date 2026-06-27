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

**MVP 완료 (2026-06-27 기준)**: F001~F006 모두 구현 완료(notion.ts stub throw 제거됨, getQuotes/getQuote 실구현). vitest 설치됨(`npm run test`/`test:watch`). 고도화(v2) 로드맵은 `docs/ROADMAP_v2.md`에 별도 작성(F007 어드민셸 / F008 테이블 / F009 행링크복사 / F010 다크모드마감). `docs/ROADMAP.md`·`docs/ROADMAP_v1.md`는 수정 금지.

**중요(반직관적) — 어드민 셸은 현재 없음**: CLAUDE.md는 이 스타터를 "어드민 대시보드"라 칭하고 `(dashboard)` 라우트 그룹·사이드바를 전제하지만, MVP 전환 과정에서 **셸이 제거됨**. 실측 결과 `(dashboard)`/`(admin)` 라우트 그룹 없음, 사이드바 없음(`src/components/layout/`엔 page-header.tsx만), `mainNav`는 "견적서 목록→/" 1개뿐. `@tanstack/react-table`도 미설치. 즉 "기존 어드민 셸 재사용"이 아니라 **신규 구축**으로 계획해야 함.
**Why:** CLAUDE.md 문구만 믿고 "기존 셸 활용"으로 잘못 가정하면 작업 분해·의존성이 어긋난다.
**How to apply:** 어드민/대시보드 관련 작업은 라우트 그룹·사이드바·`mainNav`·TanStack 설치 여부를 코드에서 먼저 확인하고, 없으면 신규 작업으로 분류한다.

관련: [[feature-react-compiler-tanstack-trap]], [[reference-prd-validation]]
