# Development Guidelines

> 이 문서는 **Coding Agent(AI) 전용 운영 규칙**이다. 일반 개발 상식은 다루지 않으며, **이 프로젝트에서만 통하는 규칙·금지·다중 파일 협업 지침**만 담는다.
> 명령형으로 읽고 따른다. 충돌 시 우선순위: **실제 코드 > 이 문서 > `CLAUDE.md`**.

---

## 프로젝트 개요

- 프로젝트명: **견적서 공유** (`siteConfig.name` = "견적서 공유").
- 정체성: **Notion DB의 견적서를 웹에서 열람하고 PDF로 저장**하는 **공개·무인증** 서비스.
- 화면은 **단 2개**: 견적서 목록(`/`) + 견적서 상세(`/quotes/[id]`). 새 라우트 추가 전 반드시 사용자 확인.
- **반드시 인지할 것**: `CLAUDE.md`는 구버전(ch13 어드민 대시보드 스타터킷) 설명이 남아 있다. 거기 적힌 TanStack Table·react-hook-form·zod·recharts·`(dashboard)` 라우트 그룹·`mock-data.ts`는 **현재 프로젝트에 존재하지 않는다**. 코드 판단은 항상 실제 파일을 우선한다.

---

## 기술 스택 (실제 설치된 것만)

- Next.js **16.2.9** App Router · React **19.2.4** · TypeScript strict.
- **React Compiler 활성화**: `next.config.ts`의 `reactCompiler: true`. ❌ 제거 금지.
- Tailwind CSS v4 + shadcn/ui (`components.json`: style `radix-nova`, baseColor `neutral`, iconLibrary `lucide`).
- Notion: `@notionhq/client` v5.
- PDF: `react-to-print`. 서버 전용 가드: `server-only`.
- 기타: `next-themes`, `sonner`, `date-fns`, `lucide-react`, `radix-ui`.
- ❌ **현재 미설치 패키지를 임의 추가 금지**: `@tanstack/react-table`, `react-hook-form`, `zod`, `recharts`, `@tabler/icons-react`. 필요하면 먼저 사용자에게 확인.

---

## 디렉토리 / 파일 구조 규칙

- 경로 별칭 `@/*` → `src/*`. import는 별칭으로 작성. ✅ `@/lib/types` / ❌ `../../lib/types`.
- 컴포넌트 계층 분리(상위→하위): `components/ui`(shadcn 프리미티브) → `components/providers` → `components/layout` → `components/common`(재사용 위젯) → 페이지 내부.
- `src/lib/` 역할 고정: `notion.ts`(Notion 접근), `types.ts`(도메인 타입), `utils.ts`(`cn` 등).
- `src/config/site.ts` = 사이트 메타·네비 단일 소스.
- 라우트 파일: `src/app/page.tsx`(목록), `src/app/quotes/[id]/page.tsx`(상세), `error.tsx`/`not-found.tsx`(에러 경계).

---

## Notion 연동 규칙 (가장 중요)

- ✅ Notion API 호출 코드는 **`src/lib/notion.ts` 안에만** 둔다. 페이지/컴포넌트에서 직접 `@notionhq/client`를 import 하지 않는다.
- ✅ `src/lib/notion.ts` 최상단 `import "server-only";` **유지**. ❌ 제거 금지(API 키 클라이언트 노출 방지).
- ✅ 데이터 조회는 **`notion.dataSources.query({ data_source_id })`** 와 **`notion.pages.retrieve()`** 를 사용한다.
- ❌ **구형 `notion.databases.query()` 사용 금지** (2025-09-03 버전부터 database/data source 분리).
- ❌ `new Client({ notionVersion: "2025-09-03" })`의 버전 문자열 변경 금지.
- ✅ 시크릿/ID는 **환경변수만** 사용: `NOTION_TOKEN`, `NOTION_DATA_SOURCE_ID`. ❌ 토큰·ID 하드코딩 금지.
- ✅ 조회 함수는 **`getQuotes()`(목록) / `getQuote(id)`(상세)** 시그니처를 유지한다. `getQuote`는 미존재 시 **`null` 반환**(호출부에서 `notFound()` 처리). 예외를 throw해 상세 페이지를 깨뜨리지 않는다.
- 현재 `getQuotes`/`getQuote`는 `throw new Error(... 미구현)` 상태이며 `normalizeQuote`는 주석 처리되어 있다. 연동 구현 시 이 TODO들을 채우되 위 규칙을 지킨다.

### ✅ 해야 함 / ❌ 금지 예시

```ts
// ✅ 올바름
const res = await notion.dataSources.query({ data_source_id: dataSourceId });
// ❌ 금지 (구형 API)
const res = await notion.databases.query({ database_id: dataSourceId });
```

---

## 도메인 타입 / 정규화 규칙

- ✅ 견적서 도메인 타입은 **`src/lib/types.ts`에만** 정의: `Quote`, `QuoteItem`, `QuoteStatus`, `quoteStatusLabel`.
- ✅ Notion 응답을 컴포넌트에 그대로 넘기지 않는다. **정규화 레이어(`normalizeQuote`)로 `Quote`/`QuoteItem`으로 변환** 후 사용한다.
- ✅ strict 모드 null 가드를 반드시 적용:
  - `email`/`number`/`date`/`select` 프로퍼티 → 미입력 시 **`null`** (`clientEmail`, `issuedAt`, `expiresAt`, `totalAmount`, `status`).
  - `title`/`rich_text` → 항상 배열(빈 배열 가능). 빈 `title`은 **'제목 없음' fallback**, 빈 메모는 `''`.
- ✅ 상태 한국어 표기는 **`quoteStatusLabel`을 재사용**한다. ❌ 컴포넌트마다 `issued→"발행"` 같은 매핑을 새로 만들지 않는다.
- ✅ `QuoteStatus` 값 집합은 `"issued" | "reviewing" | "approved" | "expired"` 4종. 값을 추가하면 `quoteStatusLabel`도 **동시에** 갱신(아래 협업 규칙 참조).

---

## 단일 소스 규칙

- 네비게이션 항목 → **`src/config/site.ts`의 `mainNav`** 한 곳에서만 정의.
- 사이트 메타(name/description/url) → **`siteConfig`** 한 곳.
- 전역 프로바이더(테마·툴팁·토스트 등) → **`src/components/providers/providers.tsx`** 한 곳에만 추가. ❌ `layout.tsx`나 개별 페이지에 프로바이더를 흩뿌리지 않는다.

---

## 라우팅 · 렌더링 규칙

- ✅ 페이지/컴포넌트는 **기본 RSC(서버 컴포넌트)**. 훅·이벤트 핸들러·브라우저 API를 쓸 때만 파일 최상단에 `"use client";` 선언.
- ✅ ISR 재검증 주기 고정: **목록 `revalidate = 60`**, **상세 `revalidate = 300`**. (현재 주석 처리됨 — 연동 시 활성화)
- ✅ 상세 페이지에서 견적서가 없으면 **`notFound()`** 호출.
- ✅ `error.tsx`는 **반드시 `"use client"`** (F006 에러 경계). `not-found.tsx`는 404 처리.
- ✅ 에러/빈 화면은 **`EmptyState`** 컴포넌트로 표시하고 "목록으로 돌아가기" 링크(`/`)를 둔다.
- 코드 주석의 PRD 기능코드(`F001`~`F006`) 컨벤션을 유지한다(예: 목록=F001, 상세=F002, PDF=F003).

---

## PDF 출력 규칙

- ✅ PDF 저장은 **`react-to-print` + `window.print()` + `@media print` CSS** 조합으로 구현하고, 해당 버튼은 **클라이언트 컴포넌트**로 분리한다.
- ❌ 다른 PDF 라이브러리(`jspdf`, `html2canvas`, `puppeteer` 등) 임의 추가 금지. 필요 시 사용자 확인.

---

## UI / 스타일 규칙

- ✅ 새 UI 프리미티브는 **`npx shadcn@latest add <component>`** 로만 추가(`components.json` 기준). ❌ `src/components/ui/` 직접 손으로 작성 금지.
- 현재 보유 `ui/`: `button`, `card`, `badge`, `table`, `dialog`, `dropdown-menu`, `separator`, `sonner`, `tooltip`. 신규 필요 시 위 명령으로 추가.
- ✅ 클래스명 병합은 항상 **`cn()`(`@/lib/utils`)** 사용. ❌ 문자열 직접 concat 금지.
- ✅ 빈 상태 → `EmptyState`, 페이지 상단 제목 → `PageHeader` 재사용. 같은 패턴을 새로 만들지 않는다.
- ✅ 아이콘은 **`lucide-react`**, 토스트는 **`sonner`**, 테마 전환은 `ThemeToggle`/`next-themes` 사용.
- ✅ 모든 **UI 텍스트·코드 주석·커밋 메시지는 한국어**. 변수/함수명은 영어(camelCase, 컴포넌트 PascalCase), 들여쓰기 2칸.
- ❌ `src/app/layout.tsx`의 `<html ... suppressHydrationWarning>` 제거 금지(`next-themes` 클래스 갱신 때문).

---

## 핵심 파일 동시 수정 규칙 (다중 파일 협업)

| 변경 대상 | 반드시 함께 점검/수정할 파일 |
|---|---|
| `src/lib/types.ts`의 `Quote`/`QuoteItem` 필드 | `src/lib/notion.ts`(정규화 매핑), 이를 렌더링하는 `src/app/page.tsx`·`src/app/quotes/[id]/page.tsx` |
| `QuoteStatus` 값 추가/변경 | 같은 파일의 `quoteStatusLabel`(누락 시 타입 에러), 상태 배지 사용처 |
| `src/config/site.ts`의 `mainNav`/`NavItem` | 이를 소비하는 헤더/네비 렌더링 컴포넌트 |
| 새 전역 컨텍스트/프로바이더 | `src/components/providers/providers.tsx`만 |
| 새 라우트 추가 | `mainNav` 노출 여부 검토 + `siteConfig` 영향 검토 |
| `package.json` 의존성 추가 | 사용자 확인 후, 관련 설정(`components.json`/`next.config.ts`) 동기화 |

---

## AI 의사결정 기준

1. **데이터를 읽어야 하나?** → `src/lib/notion.ts`의 `getQuotes`/`getQuote`를 통해서만. 직접 Notion SDK 호출 추가 금지.
2. **이 컴포넌트에 `"use client"`가 필요한가?** → 훅/이벤트/브라우저 API/`useTheme`/`window.print` 사용 시에만. 그 외엔 RSC 유지.
3. **타입을 어디에 둘까?** → 견적서 도메인이면 `src/lib/types.ts`. 그 외 컴포넌트 props는 해당 파일 내부.
4. **UI 프리미티브가 없다.** → 직접 만들지 말고 `npx shadcn@latest add`. 추가 후에도 `ui/` 수동 편집 지양.
5. **요구사항이 모호하다.** → 추측 금지. 먼저 실제 코드/`README.md`를 재확인하고, 그래도 불명확하면(예: 견적 항목을 Notion 본문에 JSON 블록으로 둘지 테이블 블록으로 둘지) 사용자에게 확인.
6. **`CLAUDE.md`와 실제 코드가 다르다.** → **실제 코드를 따른다**.

---

## 금지 사항 (요약)

- ❌ `notion.databases.query()` 사용 / `notionVersion` 변경 / `import "server-only"` 제거.
- ❌ 클라이언트 컴포넌트에서 `@notionhq/client` import, 토큰·ID 하드코딩.
- ❌ Notion 원본 응답을 정규화 없이 UI에 전달 / null 가드 누락.
- ❌ 상태 라벨·네비·프로바이더·도메인 타입을 단일 소스 밖에 중복 정의.
- ❌ `reactCompiler: true` 또는 `suppressHydrationWarning` 제거.
- ❌ `ui/` 컴포넌트 수동 작성, `cn()` 미사용 클래스 병합.
- ❌ 미설치 패키지(TanStack Table·react-hook-form·zod·recharts 등) 사용자 확인 없이 추가.
- ❌ UI 텍스트/주석을 한국어 외 언어로 작성.
- ❌ 요구사항이 모호할 때 추측으로 구현 진행.
