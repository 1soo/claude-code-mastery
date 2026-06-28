# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 개요

Next.js 16 App Router 기반 웹 개발 스타터 킷. 랜딩/대시보드/소개/컴포넌트 쇼케이스
데모 페이지가 포함되어 있으며, 모든 데모 라우트는 정적 프리렌더(SSG)된다.

## 명령어

패키지 매니저는 **pnpm** 고정 (corepack 으로 활성화: `corepack enable pnpm`).

| 명령어 | 설명 |
| --- | --- |
| `pnpm dev` | 개발 서버 (Turbopack, http://localhost:3000) |
| `pnpm build` | 프로덕션 빌드 (Turbopack) |
| `pnpm start` | 프로덕션 서버 |
| `pnpm lint` | ESLint |
| `pnpm exec tsc --noEmit` | 타입 검사 (lint/build와 별개로 직접 실행) |
| `pnpm dlx shadcn@latest add <name>` | shadcn/ui 컴포넌트 추가 (`components/ui/`에 생성) |

- **Node.js 20.9+ 필요.**
- 테스트 프레임워크는 설정되어 있지 않다.
- Next 16부터 `next build`는 린트를 자동 실행하지 않으므로 `pnpm lint`를 별도로 돌려야 한다.

## 핵심 아키텍처 (비자명한 부분)

### shadcn/ui는 Radix가 아니라 Base UI 기반이다
`components.json`의 `style`이 **`base-nova`**다. 이 스타일의 `components/ui/*` 컴포넌트는
대부분 `@radix-ui/*`가 아니라 **`@base-ui/react`** 프리미티브로 구현되어 있다. 새 UI를
다룰 때 Radix 관용구가 아닌 Base UI 관용구를 따라야 한다:

- **`render` prop으로 합성** (Radix의 `asChild` 아님). 예: `<DialogTrigger render={<Button />}>`.
- **`Button`이 앵커를 렌더링할 때 `nativeButton={false}` 필수.** Base UI Button은 기본적으로
  네이티브 `<button>`을 기대하므로, `render={<Link .../>}` 같이 `<a>`를 렌더링하면
  `nativeButton={false}`를 주지 않을 경우 접근성 경고가 발생한다. (`components/site-header.tsx`,
  `app/page.tsx` 참고)
- 제어 컴포넌트는 `value`/`onValueChange`(Select·Tabs), `checked`/`onCheckedChange`(Checkbox·Switch)
  시그니처를 쓴다.

### 폼: 레지스트리에 없어 수동 구성됨
`form` 컴포넌트는 base-nova 레지스트리에 없어서 **수동으로 추가**되었다:
- `components/ui/form.tsx`는 표준 shadcn Form 래퍼이며 `@radix-ui/react-slot`을 사용한다
  (base-nova에서 유일하게 Radix 의존하는 부분).
- 검증은 **react-hook-form + zod 4**. resolver는 **`zodResolver`가 아니라 `standardSchemaResolver`**
  (`@hookform/resolvers/standard-schema`)를 사용한다 — zod 4.x와 `zodResolver`의 타입이 호환되지
  않아 의도적으로 선택한 것이니 되돌리지 말 것. (`components/demo/contact-form.tsx` 참고)

### 스타일링: Tailwind v4, 설정 파일 없음
`tailwind.config.js`가 **없다** (의도적). 모든 설정은 `app/globals.css`에 있다:
- `@import "tailwindcss"` + `@import "shadcn/tailwind.css"`
- `@theme inline { ... }`에서 디자인 토큰 → Tailwind 유틸 매핑
- `:root` / `.dark`의 CSS 변수(oklch)로 테마 제어, `@custom-variant dark`로 다크 변형 정의
- 새 컴포넌트는 색상을 하드코딩하지 말고 `bg-background`, `text-foreground` 등 토큰 클래스를
  쓰면 다크 모드에 자동 대응된다.

### 테마 / 레이아웃 합성
`app/layout.tsx`가 `ThemeProvider`(next-themes) → `TooltipProvider` → `SiteHeader` →
`{children}` → `Toaster`(sonner) 순으로 전체를 감싼다. `<html>`에 `suppressHydrationWarning`이
필요하다(테마 클래스 주입 때문). 새 페이지는 헤더/토스트/테마가 이미 제공된다고 가정하면 된다.

### 디렉토리 규칙
- `components/ui/` — shadcn/ui 생성물 (소유 코드, 자유롭게 수정 가능)
- `components/` 루트 — 앱 전용 컴포넌트(`site-header`, `mode-toggle`, `theme-provider`)
- `components/demo/` — 데모용 컴포넌트(쇼케이스, 폼)
- `lib/utils.ts` — `cn()` 유틸. 모든 커스텀 컴포넌트에서 className 병합에 재사용할 것
- 경로 별칭 `@/*` → 프로젝트 루트
- `pnpm-workspace.yaml`의 `allowBuilds`에 sharp/unrs-resolver 빌드가 허용되어 있다
  (pnpm이 네이티브 빌드 스크립트를 기본 차단하므로 필요). 설치 시 빌드가 막히면 여기를 확인.

## 코드 컨벤션
- 주석/문서는 한국어, 변수·함수명은 영어(camelCase / 컴포넌트는 PascalCase), 들여쓰기 2칸.
- 인터랙티브 컴포넌트(테마 토글, 폼, 오버레이 등)는 `"use client"` 필수. `metadata`를 export하는
  페이지는 서버 컴포넌트여야 하므로, 클라이언트 인터랙션은 별도 컴포넌트로 분리한다
  (`app/components/page.tsx` ↔ `components/demo/component-showcase.tsx` 패턴 참고).
