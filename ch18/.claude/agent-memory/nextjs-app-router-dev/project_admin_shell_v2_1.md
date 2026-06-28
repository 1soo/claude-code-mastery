---
name: admin-shell-v2-1
description: V2-1 어드민 셸(F007) 구조 — (admin) 라우트 그룹, 경량 자작 사이드바, mainNav 혼재
metadata:
  type: project
---

V2-1 어드민 셸(F007) 개발 단계 완료(2026-06-27, 인증 없는 공개).

**구조 결정 (사용자 승인 완료):**
- URL: `(admin)` 라우트 그룹 + `/admin/quotes` (그룹은 URL 미반영)
- 사이드바: 경량 자작 (`src/components/layout/admin-sidebar.tsx`, `"use client"` — usePathname 활성강조). shadcn sidebar 블록 금지.
- 네비: `src/config/site.ts`의 `mainNav` **단일 소스에 공개+어드민 혼재**. 별도 adminNav 분리 안 함. `NavItem`에 `section?: "public" | "admin"` 선택 필드 추가(그룹 구분용).
- 헤더: `src/components/layout/admin-header.tsx` (서버 컴포넌트 — 기존 ThemeToggle 재사용, 클라이언트 경계는 ThemeToggle 내부에서 처리).
- 레이아웃 `src/app/(admin)/layout.tsx`: 루트 layout 하위 중첩이라 Providers 컨텍스트 자동 상속. 인증/세션/리다이렉트 없음.
- 페이지 `src/app/(admin)/admin/quotes/page.tsx`: RSC 스캐폴딩(EmptyState placeholder). **getQuotes 미호출** — 데이터 연결은 V2-2.

**활성 경로 로직:** 루트("/")는 정확 일치(`pathname === "/"`), 그 외는 접두사 일치(`startsWith(href + "/")`)로 하위 경로 포함.

**How to apply:**
- 새 어드민 메뉴는 `mainNav`에 `section: "admin"`으로 추가하면 사이드바가 자동 렌더.
- 모바일 오프캔버스/접힘은 미완 — 사이드바는 `hidden md:flex`로 데스크톱 고정만. 후속 UI 단계 보강 대상.

**함정 — .next stale 타입 캐시:** V2-0 검증용 임시 라우트(`src/app/smoke-table`)를 삭제했어도 `.next/dev/types/validator.ts`에 stale 참조가 남아 `npm run build` 타입체크가 "Cannot find module '../../../src/app/smoke-table/page.js'"로 실패할 수 있음. **해결: `rm -rf .next` 후 재빌드.** 라우트 폴더를 지운 뒤 빌드 타입 에러가 나면 이걸 1순위로 의심.

관련: [[tanstack-table-no-memo]], [[quote-app-identity]], [[quote-components]]
