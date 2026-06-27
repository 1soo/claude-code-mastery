# Development Guidelines (shrimp-rules.md)

> 본 문서는 **AI Agent 전용** 프로젝트 규칙이다. 일반 개발 지식은 포함하지 않는다.
> 코딩 작업 전 반드시 이 문서의 규칙을 적용한다.

---

## 프로젝트 개요

- **제품:** 모임 이벤트 관리 웹 MVP — "링크 하나로 끝내는 모임 참석 집계".
- **스택:** Next.js 15 (App Router) · React 19 · TypeScript 5 · Tailwind 3.4 · shadcn/ui(new-york) · Supabase(SSR 쿠키 인증).
- **기획 문서:** `docs/PRD.md` (요구사항), `docs/ROADMAP.md` (구현 단계). **기능 작업 전 두 문서를 먼저 확인한다.**

---

## 프로젝트 아키텍처

### 디렉터리 역할

| 경로 | 역할 | 규칙 |
| --- | --- | --- |
| `app/` | App Router 라우트 | 서버 컴포넌트 기본. 클라이언트 전환 시에만 `"use client"` |
| `app/auth/` | 인증 라우트/핸들러 | 기존 흐름 유지. 임의 변경 금지 |
| `components/` | 도메인/기능 컴포넌트 | 신규 기능 컴포넌트 위치 |
| `components/ui/` | shadcn/ui 원자 컴포넌트 | **직접 수정 금지.** shadcn CLI로만 추가/갱신 |
| `components/tutorial/` | 스타터 잔재 | 기능 구현 시 **제거 대상** |
| `lib/supabase/` | Supabase 클라이언트 팩토리 3종 | 아래 "클라이언트 선택" 규칙 절대 준수 |
| `lib/` | 유틸/타입/도메인 로직 | 도메인 타입은 `lib/types.ts`에 정의 |
| `supabase/migrations/` | SQL 마이그레이션 | 신규 테이블/RLS는 여기에 작성 |

---

## Supabase 클라이언트 선택 (절대 규칙)

**실행 컨텍스트별로 반드시 아래 파일을 골라 import 한다. 혼용 금지.**

| 실행 위치 | import 대상 | 함수 |
| --- | --- | --- |
| 클라이언트 컴포넌트(브라우저) | `lib/supabase/client.ts` | `createClient()` |
| 서버 컴포넌트 / Server Action / Route Handler | `lib/supabase/server.ts` | `await createClient()` (async) |
| proxy(미들웨어) | `lib/supabase/proxy.ts` | `updateSession()` |

- DO: 서버 컴포넌트에서 `import { createClient } from "@/lib/supabase/server"` 후 `await createClient()`.
- DON'T: 서버 코드에서 `lib/supabase/client.ts`를 import.
- DON'T: Supabase 클라이언트를 모듈 전역 변수에 저장 (Fluid compute). 매 함수/요청마다 새로 생성.

---

## proxy / 세션 갱신 (치명적 — 위반 시 무작위 로그아웃)

`lib/supabase/proxy.ts` 수정 시:

- DON'T: `createServerClient`와 `supabase.auth.getClaims()` 호출 **사이에 코드 삽입**.
- DON'T: `getClaims()` 제거.
- DO: 함수 끝에서 `supabaseResponse` 객체를 **그대로 return**.
- 새 응답 객체를 만들면 반드시 request 전달 + 기존 쿠키 복사 후 반환.

### 공개 라우트 예외 처리

- 현재 redirect 허용 경로: `/`, `/login*`, `/auth*` (그 외 비로그인 접근은 `/auth/login`으로 redirect).
- **공개 RSVP 페이지 `/e/[slug]`는 비로그인 접근이 필수다.** 이 라우트 구현 시 `lib/supabase/proxy.ts`의 redirect 조건에 `/e` 예외를 **반드시 추가**한다. (`request.nextUrl.pathname.startsWith("/e")`)
- DON'T: 이 예외 없이 `/e/[slug]`를 배포 (참여자가 로그인 화면으로 튕긴다).

---

## 데이터베이스 / 마이그레이션

- 신규 테이블: `events`, `rsvps`, `announcements` (스키마는 `docs/PRD.md` 6장 기준).
- DO: 마이그레이션 파일을 `supabase/migrations/`에 `YYYYMMDDHHMMSS_description.sql` 형식으로 추가.
- DO: 모든 신규 테이블에 RLS 활성화 + 정책 작성. 기존 `profiles` 마이그레이션의 패턴을 참고.
- DO: 스키마 변경 후 `lib/database.types.ts`를 **재생성**.
- DON'T: `lib/database.types.ts`를 **손으로 편집** (생성 파일).
- DON'T: MCP `apply_migration`을 검증 없이 호출 (**원격 프로젝트에 직접 적용됨**).

### RLS 필수 규칙

- `events` 쓰기/수정/삭제: `host_id = auth.uid()` 조건.
- `rsvps` 가입 없는 insert/update: 클라이언트 직접 테이블 접근 금지. **slug 검증 Server Action 또는 RPC 경유만** 허용.
- DON'T: 클라이언트 컴포넌트에서 `supabase.from("rsvps").insert(...)` 직접 호출.

---

## 기능 구현 표준

### 타입

- DO: 도메인 타입(`Event`, `Rsvp`, `RsvpStatus`, `Announcement`)을 `lib/types.ts`에 정의.
- DO: DB 행 타입이 필요하면 `lib/database.types.ts`의 생성 타입을 import해 파생.
- `RsvpStatus`는 `'going' | 'not_going' | 'maybe'` 리터럴 유니온으로 고정.

### 참여자 식별

- DO: 가입 없는 참여자는 `guest_token` 쿠키로 식별. RSVP 수정은 같은 토큰일 때만.
- 집계 시 참석 인원은 `party_size` **합산** 기준 (응답자 수와 별개로 둘 다 표시).

### UI

- DO: 신규 UI 원자는 shadcn CLI로 추가 (예: `textarea`, `dialog`). `components/ui/`를 손으로 만들지 않는다.
- DO: 클래스 병합은 `cn()` (`lib/utils.ts`) 사용.
- DO: 주최자/참여자 화면은 **모바일 우선**, 관리자 상세는 데스크톱 대응.
- 경로 별칭: `@/*` → 프로젝트 루트.

---

## 환경 변수

- 필수 2종: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`에는 **새 publishable 키 형식**을 넣는다 (대시보드의 `ANON_KEY` 값을 그대로 사용 가능).
- DON'T: 이 변수명을 변경. `lib/utils.ts`의 `hasEnvVars`와 `lib/supabase/*`가 이 이름에 의존.

---

## 워크플로우 표준

기능 작업 1건의 순서:

```
1. docs/PRD.md + docs/ROADMAP.md 확인 (범위·성공기준 파악)
2. 코드 구현 (위 규칙 준수)
3. 품질 게이트 통과: npm run lint → npm run typecheck → npm run build → npm run format:check
4. docs/ROADMAP.md 해당 작업을 ✅로 갱신
```

- 테스트 러너 없음. 검증은 품질 게이트 + 수동 시나리오로 한다.
- Git: Husky pre-commit이 lint-staged(eslint --fix + prettier) 실행. 커밋 전 통과 보장.

---

## 핵심 파일 동시 수정 규칙

| 변경 행위 | 동시에 갱신할 대상 |
| --- | --- |
| DB 스키마 변경 (마이그레이션 추가) | `lib/database.types.ts` 재생성 |
| 새 보호 라우트 추가 | proxy redirect 정책이 의도대로인지 확인 |
| 공개 라우트(`/e/[slug]` 등) 추가 | `lib/supabase/proxy.ts` redirect 예외 추가 |
| 기능 작업 완료 | `docs/ROADMAP.md` 체크박스 ✅ |
| `components/tutorial/*` 의존 제거 | 해당 import·참조 동시 제거 |

---

## AI 의사결정 기준

- Supabase 클라이언트가 헷갈리면: "이 코드는 브라우저에서 도는가?" → 예: `client.ts`, 아니오: `server.ts`. proxy 내부면 `proxy.ts`.
- RSVP 관련 쓰기 작업이면: 무조건 Server Action/RPC 경유 (직접 insert 금지).
- 범위가 PRD의 P2(정산·카풀·알림·반복 이벤트)에 속하면: **구현하지 말고** ROADMAP 로드맵 항목으로만 둔다.
- 요청이 모호하면: PRD/ROADMAP에서 근거를 먼저 찾고, 없으면 가정을 명시한 뒤 진행.

---

## 금지 사항 (Prohibited)

- ❌ `lib/supabase/proxy.ts`에서 `createServerClient`~`getClaims()` 사이 코드 삽입.
- ❌ `lib/database.types.ts` 수동 편집.
- ❌ `components/ui/` 파일 수동 생성/편집.
- ❌ Supabase 클라이언트 전역 변수화.
- ❌ 클라이언트에서 `rsvps`/`events` 직접 insert·update.
- ❌ 환경 변수명(`NEXT_PUBLIC_SUPABASE_*`) 변경.
- ❌ 요청되지 않은 인접 코드 리팩터링/스타일 변경.
- ❌ MVP 범위 밖(정산·카풀·알림·반복 이벤트) 선구현.
- ❌ 검증 없이 MCP `apply_migration` 원격 적용.
