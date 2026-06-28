---
name: project-quote-app
description: 견적서 공유 앱의 기술 스택, 색 테마, 컴포넌트 구조 요약 — 향후 스타일링 결정에 활용
metadata:
  type: project
---

## 앱 정체성
Notion DB 견적서를 웹으로 열람·공유하는 공개 서비스. 화면 2개: 목록(`/`) + 상세(`/quotes/[id]`).

## 색 테마 특성
- shadcn/ui style: `radix-nova`, baseColor: `neutral`
- 모든 색 토큰이 `oklch(... 0 0)` — 채도 0, 완전 무채색 팔레트
- 외부 시맨틱 색(emerald, blue 등) 직접 사용 시 테마 일관성 깨짐 → 테마 토큰 우선
- Badge variant 의미 매핑: approved=default(진한강조), issued=secondary(연회색), reviewing=outline(테두리), expired=destructive(빨강)

## Card 컴포넌트 특성
- 기본 ring: `ring-1 ring-foreground/10`
- hover 강조: `hover:ring-foreground/20 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`
- CardContent에 `border-t`로 헤더와 메타 섹션 분리하는 패턴 검증됨

## 필터 빈 상태
- EmptyState 컴포넌트(icon + title + description) + FilterX 아이콘 조합 사용
- "all" 전체 빈 상태는 page.tsx에서 FileText 아이콘으로 처리, 필터 빈 상태는 QuoteListClient에서 처리

## 인쇄(@media print) 스타일 구조
- `@page`: `size: A4 portrait; margin: 15mm 12mm 12mm 12mm`
- `[data-print-area]` article에 `print:p-0 print:shadow-none print:border-0 print:rounded-none print:ring-0 print:gap-6`
- break-inside 적용 위치: header(`print:break-inside-avoid print:break-after-avoid`), 거래당사자 section, 합계 section, 메모 section
- 항목 테이블 section은 `print:break-inside-auto` (항목 많을 때 페이지 전환 허용), tbody tr는 CSS에서 개별 행 break-inside:avoid
- 합계 박스: `print-total-box` 클래스로 `print:w-full print:min-w-0`
- 색 보존: `[data-print-area] * { print-color-adjust: exact }` — 배지·합계 배경 유지
- h1: `22pt`, h2: `7.5pt`, body: `10pt` 인쇄 전용 크기 조정
- 주의: screen 레이아웃 변경 없음 — @media print / print: 변형으로만 격리

## 어드민 셸 (V2-1 F007 이후)
- 어드민 라우트 그룹: `src/app/(admin)/` — `layout.tsx`에 AdminSidebar + AdminHeader + main 셸
- 레이아웃: `h-dvh overflow-hidden` 루트 flex, main은 `overflow-y-auto` 내부 스크롤
- AdminSidebar: `"use client"`, `bg-sidebar` / `text-sidebar-foreground` CSS 변수 사용, 데스크톱 `w-64 hidden md:flex`
- AdminHeader: RSC. 클라이언트 상태(드로어)는 MobileNav 서브컴포넌트로 분리
- MobileNav: `"use client"`, Sheet 기반 오프캔버스, md:hidden 햄버거 버튼, mainNav 단일 소스 공유
- sheet.tsx: radix-ui Dialog primitive 재활용, side prop(left/right/top/bottom) 지원

## 어드민 견적 테이블 (V2-2 F008 이후)
- 파일: `src/components/dashboard/quote-table.tsx` — 1행 `"use no memo"`, 2행 `"use client"` 필수
- 테이블 헤더 배경: `<TableHeader className="[&_tr]:bg-muted/30">` 패턴으로 헤더 행 구분
- 정렬 헤더 버튼: `cn()` 조합으로 활성/비활성 스타일 분기. 활성=`font-medium text-foreground`, 비활성=`text-muted-foreground`
- aria-sort: `<TableHead aria-sort={...}>` — "ascending"|"descending"|"none". ColumnDef.header가 ReactNode이므로 aria-label은 `typeof header === "string"` 가드 필수
- 셀 스타일 패턴: 견적번호=`font-mono text-xs font-medium tracking-wider`, 발행일=`tabular-nums text-muted-foreground`, 합계=`tabular-nums font-medium`
- 페이지네이션 버튼: ChevronLeft/ChevronRight 아이콘 + `aria-label` + `<span className="sr-only">` 패턴
- 빈 상태: `<EmptyState icon={FilterX} ...>` (quote-list-client와 동일 패턴)
- table.tsx 내장 overflow-x-auto: Table 컴포넌트 자체가 `relative w-full overflow-x-auto` div 래퍼 포함

**Why:** 기능 E2E는 완성된 상태에서 마크업·스타일만 고도화하는 작업이었음
**How to apply:** 이 프로젝트에서 스타일 수정 시 로직/데이터 흐름 불변 원칙 준수, 색상은 테마 토큰만 사용
