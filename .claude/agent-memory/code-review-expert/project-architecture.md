---
name: project-architecture
description: ch13 프로젝트의 전체 아키텍처, 주요 파일 위치, 기술 스택 요약
metadata:
  type: project
---

# ch13 프로젝트 아키텍처

Next.js 15 App Router + TypeScript + Tailwind CSS v4 + shadcn/ui 기반 관리자 대시보드 스타터킷.

## 기술 스택
- **프레임워크:** Next.js 16.2.9, React 19.2.4
- **UI:** shadcn/ui (radix-ui 기반), lucide-react 아이콘
- **테이블:** @tanstack/react-table v8
- **폼:** react-hook-form + zod (hookform/resolvers)
- **차트:** recharts v3
- **날짜:** date-fns v4
- **테마:** next-themes
- **토스트:** sonner
- **React Compiler:** 활성화 (next.config.ts: reactCompiler: true)

## 주요 디렉터리 구조
```
src/
  app/
    (dashboard)/          # 대시보드 레이아웃 그룹
      layout.tsx          # SidebarProvider + AppSidebar + AppHeader 셸
      dashboard/page.tsx  # 통계 카드 + 차트 + 최근 판매
      users/
        page.tsx          # DataTable 페이지
        columns.tsx       # TanStack Table 컬럼 정의 ("use client")
      settings/
        page.tsx          # 설정 페이지 (Server Component)
        settings-form.tsx # react-hook-form + zod 폼 ("use client")
    layout.tsx            # 루트 레이아웃, 폰트, Providers
    page.tsx              # 랜딩 페이지
  components/
    common/               # DataTable, EmptyState, ThemeToggle
    dashboard/            # StatCard, OverviewChart, RecentSales
    layout/               # AppSidebar, AppHeader, PageHeader
    providers/            # Providers(통합), ThemeProvider
    ui/                   # shadcn/ui 컴포넌트 (자동 생성)
  config/
    site.ts               # siteConfig, mainNav (단일 소스)
  hooks/
    use-mobile.ts         # useSyncExternalStore 기반 모바일 감지
  lib/
    mock-data.ts          # 데모용 샘플 데이터 (실 API 연동 시 교체 대상)
    utils.ts              # cn() 유틸 (clsx + tailwind-merge)
```

## 아키텍처 핵심 결정
- `config/site.ts`의 `mainNav`를 AppSidebar와 AppHeader 브레드크럼이 공유 (단일 진실 원천)
- 전역 프로바이더는 `components/providers/providers.tsx`에 통합 관리
- `data-table.tsx`는 `"use no memo"` 지시어로 React Compiler opt-out (TanStack Table 호환 이슈)
- 모든 mock 데이터는 `lib/mock-data.ts`에 집중, 실 API 연동 시 이 파일만 교체

**Why:** 스타터킷 특성상 확장 가능한 구조와 단일 진실 원천 패턴을 우선시.
**How to apply:** 새 기능 추가 시 config/site.ts 네비게이션 먼저 확인, 데이터는 mock-data.ts 교체 방식 권장.
