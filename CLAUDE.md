# CLAUDE.md

Next.js 16 App Router 기반 **어드민 대시보드 스타터킷** (`ch13`).
글로벌 규칙(언어·커밋·들여쓰기·네이밍)은 `~/.claude/CLAUDE.md`를 따르며, 여기서는 이 프로젝트 고유 사항만 다룬다.

## 기술 스택

- **Next.js 16** (App Router) · **React 19.2** · **TypeScript** (strict)
- **React Compiler 활성화** (`next.config.ts`의 `reactCompiler: true`) — 아래 함정 참고
- **Tailwind CSS v4** + **shadcn/ui** (`radix-ui`, style: `radix-nova`, baseColor: `neutral`)
- 데이터테이블 `@tanstack/react-table` · 폼 `react-hook-form` + `zod` · 차트 `recharts`
- 테마 `next-themes` · 토스트 `sonner` · 날짜 `date-fns` · 아이콘 `lucide-react`(주) / `@tabler/icons-react`

## 명령어 (npm)

```bash
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드
npm start        # 프로덕션 실행
npm run lint     # ESLint (eslint-config-next)
```

## 디렉토리 구조

- `src/app/` — 라우트. 대시보드 화면은 `(dashboard)` 라우트 그룹(사이드바+헤더 공통 셸) 하위에 둔다.
- `src/components/` — **계층 순서로 분리**: `ui`(shadcn 프리미티브) → `providers` → `layout` → `common`(재사용 위젯) → `dashboard`(기능별) → 페이지 내부 컴포넌트
- `src/lib/` — `utils.ts`(cn 등), `mock-data.ts`
- `src/hooks/` · `src/config/` — 전역 설정
- 경로 별칭: `@/*` → `src/*`

## 핵심 규칙

- **단일 소스 원칙을 깨지 말 것**:
  - 네비게이션 항목 → `src/config/site.ts`의 `mainNav` (사이드바·브레드크럼이 공유)
  - 사이트 메타(name/description) → `src/config/site.ts`의 `siteConfig`
  - 전역 프로바이더 → `src/components/providers/providers.tsx` 한 곳에만 추가
- **유틸/기능을 직접 구현하지 말 것** — 위 표준 라이브러리를 우선 사용 (바퀴를 재발명하지 마라).
- 클래스명 병합은 항상 `cn()` (`@/lib/utils`) 사용.
- 새 UI 프리미티브는 `npx shadcn@latest add <component>`로 추가 (`components.json` 기준), `ui/` 직접 작성 지양.
- UI 텍스트는 한국어.

## 함정 (반드시 확인)

- **React Compiler + TanStack Table 비호환**: `useReactTable`을 쓰는 클라이언트 컴포넌트 최상단에 `"use no memo";` 지시어를 넣어야 한다 (예: `src/components/common/data-table.tsx`). 누락 시 런타임 오류.
- **RSC 기본**: 컴포넌트는 기본 서버 컴포넌트. 훅·이벤트·브라우저 API를 쓰면 `"use client"`를 명시한다. 폼·테이블·테마 토글 등은 클라이언트 컴포넌트다.
- `layout.tsx`의 `<html>`에 `suppressHydrationWarning`이 있는 이유는 `next-themes`가 클래스를 갱신하기 때문 — 제거하지 말 것.
