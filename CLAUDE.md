# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # 개발 서버 (http://localhost:3000)
npm run build    # 프로덕션 빌드
npm run start    # 빌드된 앱 실행
npm run lint     # ESLint (eslint-config-next, flat config)
```

테스트 러너는 설정되어 있지 않다.

## 환경 변수

`.env.local`에 두 값이 필요하다 (`.env.example` 참고):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — Supabase의 **새 publishable 키 형식**. 대시보드가 `ANON_KEY`로 표시해도 그 값을 이 변수에 넣으면 동작한다.

`lib/utils.ts`의 `hasEnvVars`가 두 변수 존재 여부를 확인하며, 미설정 시 `proxy.ts`의 인증 검사가 건너뛰어진다.

## 아키텍처

Next.js 15 App Router + Supabase 쿠키 기반 SSR 인증 스타터 킷. 핵심은 **컨텍스트별로 분리된 3개의 Supabase 클라이언트 팩토리**다 — 어떤 환경에서 코드가 실행되는지에 따라 올바른 것을 골라야 한다.

| 파일                     | 사용처                                        | 생성 함수                                    |
| ------------------------ | --------------------------------------------- | -------------------------------------------- |
| `lib/supabase/client.ts` | 클라이언트 컴포넌트 (브라우저)                | `createBrowserClient`                        |
| `lib/supabase/server.ts` | 서버 컴포넌트 / Server Action / Route Handler | `createServerClient` + `cookies()`           |
| `lib/supabase/proxy.ts`  | proxy(미들웨어)에서 세션 갱신                 | `createServerClient` + request/response 쿠키 |

### 인증 흐름 (proxy.ts)

루트의 `proxy.ts`는 Next.js의 **proxy** (구 `middleware` — 이름이 바뀐 새 패턴)다. `config.matcher`에 매칭되는 모든 요청에서 실행되며 `lib/supabase/proxy.ts`의 `updateSession()`을 호출한다. 이 함수는:

1. 매 요청마다 새 Supabase 클라이언트를 생성하고 (Fluid compute 때문에 전역 변수 금지)
2. `supabase.auth.getClaims()`로 세션을 갱신하며
3. 로그인하지 않은 사용자가 `/`, `/login`, `/auth/*` 외 경로에 접근하면 `/auth/login`으로 리다이렉트한다.

⚠️ 수정 시 주의할 두 가지 (잘못하면 사용자가 무작위로 로그아웃됨):

- `createServerClient`와 `getClaims()` 호출 사이에 코드를 넣지 말 것.
- `updateSession`이 반환하는 `supabaseResponse` 객체를 그대로 반환할 것 (쿠키 동기화).

이메일 OTP 확인은 `app/auth/confirm/route.ts`의 Route Handler가 `verifyOtp`로 처리한다.

### 데이터베이스

- 마이그레이션: `supabase/migrations/`. 첫 마이그레이션이 `profiles` 테이블(RLS 활성, 본인 데이터만 접근), 회원가입 시 프로필 자동 생성 트리거(`handle_new_user`), `updated_at` 자동 갱신 트리거를 정의한다. 트리거 전용 함수는 RPC 직접 호출 권한을 회수해 둔 상태다.
- 타입: `lib/database.types.ts`는 Supabase에서 **생성된** 파일이다. 스키마 변경 후 재생성하며, 직접 편집하지 않는다.

### UI

shadcn/ui (new-york 스타일, `components/ui/`) + Tailwind CSS + lucide 아이콘 + next-themes 다크모드. `components/tutorial/`의 컴포넌트들은 스타터 킷 안내용이므로 실제 기능 구현 시 제거 대상이다.

경로 별칭: `@/*` → 프로젝트 루트 (`tsconfig.json`).

## MCP

`.mcp.json`에 supabase(특정 project_ref에 연결됨), playwright, context7, shadcn, sequential-thinking, shrimp-task-manager 서버가 설정되어 있다. Supabase 스키마 작업 시 MCP의 `apply_migration`은 **원격 프로젝트에 직접 적용**되므로 주의한다.
