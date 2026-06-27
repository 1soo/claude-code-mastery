# ROADMAP — 모임 이벤트 관리 웹 (MVP)

> 본 로드맵은 [`docs/PRD.md`](./PRD.md)의 MVP 범위를 구현 단계로 분해한 것이다.
> **제품 한 줄 정의:** "링크 하나로 끝내는 모임 참석 집계."

- **문서 버전:** v0.1
- **작성일:** 2026-06-27
- **기술 전제:** Next.js 15 App Router + Supabase (쿠키 기반 SSR 인증)
- **진행 표기:** `[ ]` 미착수 · `[~]` 진행 중 · `✅` 완료

---

## 개발 워크플로우

각 작업(Task)은 아래 4단계 사이클을 따른다.

```
1. 작업 계획   → 무엇을, 왜, 어떤 파일을 건드릴지 정의 (성공 기준 명시)
2. 작업 생성   → Task 단위로 쪼개고 의존성 정리
3. 구현 및 테스트 → 코드 작성 → npm run lint / typecheck / build 통과 → 동작 검증
4. 로드맵 업데이트 → 완료 작업을 본 문서에서 ✅로 표시
```

**규칙**

- 한 작업이 끝날 때마다 반드시 4단계(로드맵 ✅ 표시)까지 완료한다.
- 각 작업은 검증 가능한 성공 기준이 있어야 한다 ("동작함"이 아니라 "X 페이지에서 Y가 보인다").
- Phase는 순차적이다. 단, Phase 2(UI)는 더미 데이터로 진행해 Phase 3(백엔드)과 독립적으로 검증한다.

---

## Phase 1 — 애플리케이션 골격 구축

> 목표: 라우팅과 타입 뼈대를 세워, 이후 모든 작업이 올라갈 토대를 만든다.
>
> **역할 정의:** `주최자(host)` = 본인 이벤트를 생성·운영. `관리자(admin)` = 모든 이벤트를 집계하고 임의 이벤트의 상세를 **읽기 전용**으로 열람. 식별은 `profiles.role`(`'host' | 'admin'`)로 한다.

### 1.1 프로젝트 구조 및 라우팅 설정 (우선순위)

- ✅ 스타터 잔재 정리: `components/tutorial/*`, `components/hero.tsx`, `components/next-logo.tsx`, `components/supabase-logo.tsx`, `components/deploy-button.tsx` 제거 대상 식별
- ✅ 라우트 골격 생성 (더미 페이지로 먼저 뼈대만)
  - ✅ `app/dashboard/page.tsx` — 주최자 대시보드 (보호 라우트)
  - ✅ `app/events/new/page.tsx` — 이벤트 생성
  - ✅ `app/events/[id]/page.tsx` — 주최자 이벤트 상세
  - ✅ `app/events/[id]/edit/page.tsx` — 이벤트 수정
  - ✅ `app/e/[slug]/page.tsx` — 공개 RSVP 페이지 (인증 불필요)
  - ✅ `app/admin/page.tsx` — 관리자 대시보드 (전체 이벤트 집계, admin 전용 보호 라우트)
  - ✅ `app/admin/events/[id]/page.tsx` — 관리자 이벤트 상세 (읽기 전용)
- ✅ `proxy.ts`의 인증 리다이렉트 정책 확인: `/e/[slug]`가 **비로그인 접근 허용** 경로에 포함되는지 검증
- ✅ `proxy.ts`: `/admin/*`가 보호 라우트인지 확인 (비공개 경로라 비로그인 시 `/auth/login` 리다이렉트; admin **role 체크**는 Phase 3)
- ✅ 검증: 각 라우트가 200으로 렌더되고, 보호 라우트는 비로그인 시 `/auth/login`으로 리다이렉트

### 1.2 타입 정의 및 인터페이스 설계

- ✅ 도메인 타입 정의 파일 생성 (`lib/types.ts` 또는 `types/`)
  - ✅ `Event` (id, host_id, slug, title, starts_at, ends_at, location, capacity, description)
  - ✅ `Rsvp` (id, event_id, guest_token, name, status, party_size)
  - ✅ `RsvpStatus` = `'going' | 'not_going' | 'maybe'`
  - ✅ `Announcement` (id, event_id, body, created_at)
  - ✅ 집계 뷰 타입 `EventSummary` (goingCount, notGoingCount, maybeCount, totalAttendees)
  - ✅ `UserRole` = `'host' | 'admin'` (역할 구분)
  - ✅ `Profile` (id, role: UserRole) — 사용자 역할 표현 (Phase 3 `profiles.role`과 정합)
- ✅ Phase 3에서 `lib/database.types.ts` 재생성 후 도메인 타입과 정합성 맞추는 지점 표시
- ✅ 검증: `npm run typecheck` 통과

---

## Phase 2 — UI/UX 완성 (더미 데이터 활용)

> 목표: 백엔드 없이 더미 데이터로 모든 화면을 완성한다. 모바일 우선, 데스크톱은 주최자·관리자 관리 화면.

### 2.1 공통 컴포넌트 라이브러리 구현

- ✅ 더미 데이터 모듈 작성 (`lib/mock-data.ts`) — Phase 3에서 제거 대상으로 명시
- ✅ 공통 컴포넌트
  - ✅ `EventCard` — 대시보드 이벤트 카드
  - ✅ `RsvpStatusBadge` — 참석/불참/미정 상태 뱃지 (shadcn `badge` 활용)
  - ✅ `AttendeeList` — 참석자 이름 명단
  - ✅ `RsvpCounterSummary` — 응답자 수 / 총 참석 인원(동반 합산) 표시
  - ✅ `AnnouncementBanner` — 최신 공지 노출
  - ✅ `ShareLinkButton` — 공유 링크 복사
- ✅ 필요 shadcn 컴포넌트 추가 (예: `textarea`, `dialog`, `sonner` 등)
- ✅ 검증: 각 컴포넌트가 더미 props로 렌더됨

### 2.2 주최자 모바일 UI/UX 완성

- ✅ 대시보드: 내 이벤트 카드 목록 + "새 이벤트" FAB/버튼
- ✅ 이벤트 생성 폼: 제목 / 시작·종료 일시 / 장소 / 정원(선택) / 설명
- ✅ 이벤트 수정 폼 (생성 폼 재사용)
- ✅ 모바일 한 손 조작 기준 레이아웃 (하단 고정 FAB + `pb-24`)
- ✅ 검증: 더미 데이터로 생성→목록→상세 이동 흐름이 시각적으로 완결 (Playwright 육안 검증 완료)

### 2.3 참여자 모바일 UI/UX 완성

- ✅ 공개 RSVP 페이지 (`/e/[slug]`)
  - ✅ 이벤트 정보 (시작·종료 시각, 장소)
  - ✅ 최신 공지 배너
  - ✅ RSVP 폼: 이름(닉네임 허용) + 참석/불참/미정 + 동반 인원(+N)
  - ✅ 프라이버시 고지 ("입력한 이름이 참석자 명단에 공개됩니다")
  - ✅ 현재 참석 수(응답자/총인원) + 참석자 이름 명단
  - ✅ 응답 완료 후 상태 표시 (재방문 시 수정 UI)
- [ ] 카톡 인앱 브라우저 호환성 점검 (실제 인앱 환경 점검 대기)
- ✅ 검증: 더미 데이터로 응답 → 완료 → 명단 반영(목업) 흐름 완결 (Playwright 육안 검증 완료: 제출→완료 패널→수정 토글 prefill 확인)

### 2.4 주최자 데스크톱 이벤트 상세 UI/UX 완성

> `/events/[id]` — **주최자 본인** 이벤트의 운영 화면 (수정·공지 작성·공유 가능). 관리자 화면(2.5)과 구분.

- ✅ 주최자 이벤트 상세(데스크톱): 집계 요약 + 명단 테이블 + 공지 작성 영역 + 공유 링크
- ✅ 명단 테이블: 이름 / 상태 / 동반 인원 / 응답 시각
- ✅ 반응형: 모바일↔데스크톱 레이아웃 (`max-w-5xl`, `flex-col sm:flex-row`, 테이블 `overflow-x-auto`)
- ✅ 검증: 더미 데이터로 집계/명단/공지 UI가 데스크톱에서 완결 (Playwright 육안 검증 완료: 공지 작성 다이얼로그 동작 확인)

### 2.5 관리자(Admin) 데스크톱 UI/UX 완성

> 목표: 관리자가 **모든 주최자의 모든 이벤트**를 집계·열람하는 **읽기 전용** 화면. 주최자 화면과 분리.

- ✅ 더미 데이터 확장(`lib/mock-data.ts`): 복수 주최자(김주최/이모임)의 이벤트 추가. `mockEvents`는 본인 이벤트만, `getAllEvents()`로 합산 (대시보드 회귀 방지)
- ✅ 관리자 대시보드 (`/admin`): 전체 이벤트 목록 + 전체 집계(이벤트 수 / 총 응답자 / 총 참석 인원)
- ✅ 관리자 이벤트 상세 (`/admin/events/[id]`): 집계 요약 + 명단 테이블 (**읽기 전용** — 수정/공유/공지 작성 버튼 미노출)
- ✅ 주최자 화면과 명확히 구분 ("관리자"·"읽기 전용" 배지, 관리 액션 없음, 전(全) 이벤트 접근)
- ✅ 검증: 더미로 관리자가 여러 주최자의 모든 이벤트를 집계·열람하는 흐름이 데스크톱에서 완결 (Playwright: /admin 5개/15명/17명, /admin/events/[id] 타 주최자 이벤트 읽기 전용 확인; 주최자 대시보드 회귀 없음)

---

## Phase 3 — 데이터베이스 설정 및 핵심 기능 구현

> 목표: 더미를 실제 Supabase 데이터로 교체하고 핵심 기능을 작동시킨다.

### 3.1 데이터베이스 스키마 및 Supabase 초기 설정

- ✅ 마이그레이션 작성 (`supabase/migrations/`) — MCP `apply_migration` 원격 적용 + 로컬 파일 동기
  - ✅ `events` 테이블 (+ `slug` unique, `gen_event_slug()` default, `updated_at` 트리거)
  - ✅ `rsvps` 테이블 (+ `status` enum, `party_size` default 1, `unique(event_id, guest_token)`)
  - ✅ `announcements` 테이블
  - ✅ `profiles.role`(`user_role` enum) 추가 + `is_admin()` 헬퍼 (역할 식별)
- ✅ `lib/database.types.ts` 재생성 (직접 편집 금지)
- ✅ 검증: `mcp__supabase__get_advisors`로 보안/성능 경고 확인 (RLS 미적용 경고 0, `gen_event_slug` search_path 보정; 잔여 6건은 공개 RPC·RLS 헬퍼의 의도된 SECURITY DEFINER 노출)

### 3.2 인증 시스템 및 권한 관리 (RLS)

- ✅ RLS 정책
  - ✅ `events`: 쓰기/수정/삭제는 `host_id = auth.uid()`
  - ✅ `events` 공개 읽기: slug 기반 조회 전용 RPC `get_public_event` (직접 SELECT 정책 없음 → enumerate 차단)
  - ✅ `rsvps`: 가입 없는 insert/update는 **slug 검증 RPC** `submit_rsvp` 경유만 허용 (anon insert/update 정책 없음)
  - ✅ `rsvps`: 주최자는 본인 이벤트 rsvp 전체 조회 가능 + admin 전체 읽기(`is_admin()`)
  - ✅ `announcements`: 쓰기는 주최자, 읽기는 slug 보유자(RPC) + admin 전체 읽기
- ✅ 가입 없는 쓰기 어뷰징 방어: slug 검증 + guest_token 길이/입력 검증 + 2초 연타 가드 (IP/Redis rate limit은 Phase 4)
- ✅ 검증: `submit_rsvp` upsert(행 1개)·`get_public_event` 민감필드(host_id/guest_token) 미노출 수동 시나리오 통과 (Server Action 배선은 3.3~3.4)

### 3.3 이벤트 CRUD 및 초대(공유 링크) 시스템

- ✅ Server Action: 이벤트 생성/수정/삭제 (`app/events/actions.ts`, 서버 클라이언트 `lib/supabase/server.ts` 사용; 읽기 계층 `lib/queries.ts` 신설)
- ✅ `slug` 생성 로직 (추측 불가 토큰 — `gen_event_slug()` DB default)
- ✅ 공유 링크 발급 및 복사 기능 실연결 (`headers()`로 절대 URL 구성 → `ShareLinkButton`)
- ✅ 검증: 생성한 이벤트가 DB에 저장되고 대시보드·상세·`/e/[slug]`로 접근됨 (Playwright E2E)

### 3.4 참여자 관리 (RSVP)

- ✅ Server Action/RPC: slug 기반 RSVP insert/update (`app/e/[slug]/actions.ts` → `submit_rsvp` RPC upsert)
- ✅ `guest_token` 쿠키 발급·식별 로직 (httpOnly 1년, 재방문 시 `get_my_rsvp`로 prefill·수정)
- ✅ 실시간 집계 쿼리: 응답자 수 + 총 참석 인원(`party_size` 합산) — `get_public_event` + `summarize`
- ✅ 정원(capacity) 도달 시 처리 (P1: 마감) — submit_rsvp RPC capacity 체크(서버 강제) + 공개 RSVP 마감 배지·going 비활성. 대기(waitlist)는 범위 외(Phase 4에서 "마감만" 결정). Playwright+RPC 직접 호출로 거부 검증
- ✅ 검증: 비로그인 브라우저에서 RSVP → 명단·집계 반영, 재방문 prefill, 다중 게스트 분리 집계 확인 (Playwright E2E)

### 3.5 관리자 대시보드 백엔드 구현

- ✅ 대시보드: 주최자 본인 이벤트 목록 실제 쿼리 (`getMyEvents`)
- ✅ 이벤트 상세: 집계·명단·공지 실제 데이터 바인딩 (host: `getEventForHost`, admin: `getEventDetailByIdAdmin`)
- ✅ 공지 작성 Server Action (`createAnnouncement` → `AnnouncementComposer` 배선)
- ✅ 검증: 더미 데이터 모듈(`lib/mock-data.ts`) 완전 제거 (코드 참조 0, build 통과)

### 3.6 핵심 기능 통합 테스트

- ✅ 시나리오: 주최자 로그인→이벤트 생성→링크 공유→참여자 RSVP→집계 확인→공지→참여자 공지 열람 (Playwright + Supabase MCP)
- ✅ 다중 기기/브라우저 응답 식별 검증 (서로 다른 `guest_token` → 응답 분리 집계, "내 응답"은 본인 것만)
- ✅ 검증: PRD North Star 흐름(RSVP 수집)이 끝까지 동작; 검증 후 시드 데이터 전량 정리(0건 확인)

---

## Phase 4 — 고급 기능 및 최적화

> 목표: 출시 품질로 다듬는다. PRD의 로드맵(P2)은 여기 또는 v1.1+로 분류.

### 4.1 사용자 경험 향상

- ✅ 로딩/에러/빈 상태(empty state) 처리 — `loading.tsx`×5(shadcn skeleton), `error.tsx`/`not-found.tsx`(전역) + `e/[slug]/not-found.tsx`(공개 전용), `EmptyState` 컴포넌트(대시보드 CTA·관리자 안내). Playwright: 공개/전역 404 표시, 빈 대시보드 EmptyState 확인
- ✅ 토스트 알림(응답 완료, 복사 성공 등) — sonner 토스트 정중체 통일(RSVP/공지/복사/저장 실패). `deleteEvent`는 호출 UI 부재로 삭제 토스트 보류(삭제 UI 신설은 MVP 범위 외)
- ✅ 폼 유효성 검증 및 친절한 에러 메시지 — event-form(제목/종료>시작/정원), rsvp-form(이름) 클라 인라인(aria-invalid) + Server Action 서버 재검증. Playwright: 종료<시작·빈 이름 차단 확인
- ✅ 다크모드 점검 (next-themes) — 신규 UI 전부 muted/border 토큰만 사용, 다크모드 404 캡처로 대비 확인
- ✅ 이벤트 삭제 UI — 상세 페이지 헤더에 AlertDialog 확인 다이얼로그 + 삭제 버튼(기존 deleteEvent 배선). Playwright: 다이얼로그→취소→확정→/dashboard 이동·DB 삭제 검증
- [ ] (P2 후보) 동반 인원 마감 로직, 공지 이력 타임라인

### 4.2 성능 최적화 및 SEO

- ✅ 공개 RSVP 페이지 메타데이터/OG 이미지 (카톡 공유 시 미리보기) — `e/[slug]` `generateMetadata`(og/twitter) + `opengraph-image.tsx`(ImageResponse 1200×630). 루트 metadata "모임 이벤트 관리"로 교체. Playwright: og 메타·OG 이미지 200/PNG 한글 렌더 확인
- ✅ 서버 컴포넌트 우선, 클라이언트 컴포넌트 최소화 점검 — `'use client'` 22개 점검, 신규 UI는 서버 컴포넌트(error.tsx만 클라, 규약 필수), 나머지는 폼/Radix로 정당
- ✅ 이미지/폰트 최적화, 불필요 리렌더 제거 — Geist `next/font`(display:swap) 적용, 일반 이미지 없음(OG만 ImageResponse)
- ✅ 검증: Lighthouse 모바일 점수 점검 — 로컬 prod 서버(`npm run start`) + 시스템 Chrome으로 `/e/[slug]` 측정. **Performance 94 / Accessibility 96 / Best Practices 100 / SEO 82** (FCP 0.8s, LCP 2.8s, CLS 0). 개선 후보는 모두 보류: meta-description 0점은 오탐(초기 SSR HTML에 정상 존재 확인), robots.txt 0점은 robots.ts+proxy 공개경로 예외 동반 필요(인증 흐름 리스크로 별도 사안), color-contrast 1건(shadcn Badge 토큰, 전역 영향), JS 번들 항목은 프레임워크 영역

### 4.3 배포 및 모니터링

- ✅ 환경 변수 설정 (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) — Vercel 배포 동작으로 확인
- ✅ 프로덕션 빌드 검증 (`npm run build`)
- ✅ 배포 (Vercel) — https://claude-code-mastery-ch25-event-mana.vercel.app
- ✅ Supabase advisor 최종 점검 (보안/성능) — ERROR 0. WARN은 모두 의도된 설계(공개 RPC의 SECURITY DEFINER 노출, admin+host 분리 RLS의 multiple permissive policies). leaked-password-protection은 대시보드 설정 권장사항
- ✅ 배포 환경 검증(Playwright) — 공개 RSVP 페이지 렌더, 정원 잔여 표시, **OG 한글 폰트가 Vercel(Linux)에서 임베딩 폰트로 정상 렌더**(폰트 임베딩 실효 확인), og/twitter 메타 채워짐

> **발견된 후속 이슈(이번 범위 밖, 별도 수정 권장):**
> - **타임존**: `Intl.DateTimeFormat`에 `timeZone` 미지정 → 서버(Vercel UTC) 기준 포맷. 한국 이벤트 시각이 9시간 어긋나 표시됨(예: KST 11:00 → "AM 2:00"). `timeZone: "Asia/Seoul"` 고정 필요.
> - **metadataBase**: `layout.tsx`가 `VERCEL_URL`(배포별 고유 URL) 기반이라 og:image가 production alias가 아닌 deployment URL을 가리킴. `VERCEL_PROJECT_PRODUCTION_URL` 또는 고정 도메인 권장.

---

## 기술 스택 체크리스트

| 항목        | 스택                                   | 비고                      |
| ----------- | -------------------------------------- | ------------------------- |
| 프레임워크  | Next.js 15 (App Router)                | `latest`                  |
| 언어        | TypeScript 5                           | strict                    |
| UI          | React 19                               |                           |
| 스타일      | Tailwind CSS 3.4 + tailwindcss-animate |                           |
| 컴포넌트    | shadcn/ui (new-york)                   | `components/ui/`          |
| 아이콘      | lucide-react                           |                           |
| 다크모드    | next-themes                            |                           |
| 백엔드/DB   | Supabase (Postgres + Auth + RLS)       | `@supabase/ssr`           |
| 인증        | 쿠키 기반 SSR (이메일 + Google OAuth)  | 가입 사용자 역할: host/admin (`profiles.role`) |
| 린트/포맷   | ESLint 9 (flat) + Prettier             | `eslint-config-next`      |
| Git 훅      | Husky + lint-staged                    | pre-commit                |
| 테스트 러너 | **미설정**                             | 수동 검증 + 통합 시나리오 |

**Supabase 클라이언트 선택 (반드시 컨텍스트에 맞게)**

| 실행 위치                                     | 사용 파일                |
| --------------------------------------------- | ------------------------ |
| 클라이언트 컴포넌트(브라우저)                 | `lib/supabase/client.ts` |
| 서버 컴포넌트 / Server Action / Route Handler | `lib/supabase/server.ts` |
| proxy(미들웨어) 세션 갱신                     | `lib/supabase/proxy.ts`  |

---

## 품질 체크리스트

각 작업 완료(워크플로우 3단계) 시 다음을 통과해야 한다.

- [ ] `npm run lint` 통과 (경고 0 지향)
- [ ] `npm run typecheck` 통과
- [ ] `npm run build` 성공
- [ ] `npm run format:check` 통과
- [ ] 변경된 라인이 모두 작업 목표에 직접 연결됨 (불필요한 리팩터링 없음)
- [ ] 모바일 화면(주최자/참여자)에서 한 손 조작 가능
- [ ] 보호 라우트는 비로그인 접근 시 리다이렉트, 공개 라우트(`/e/[slug]`)는 비로그인 접근 가능
- [ ] (Phase 3+) RLS로 타인 데이터 접근 차단 확인
- [ ] (Phase 3+) `mcp__supabase__get_advisors` 경고 해소

---

## 주의사항

> 잘못 건드리면 사용자가 무작위로 로그아웃되거나 보안 구멍이 생긴다. 반드시 준수.

### 인증 / proxy (치명적)

- ⚠️ `lib/supabase/proxy.ts`에서 `createServerClient`와 `getClaims()` 호출 **사이에 코드를 넣지 말 것.**
- ⚠️ `updateSession`이 반환하는 `supabaseResponse` 객체를 **그대로 반환**할 것 (쿠키 동기화).
- ⚠️ Supabase 클라이언트를 **전역 변수에 두지 말 것** (Fluid compute). 매 요청/함수마다 새로 생성.
- `/e/[slug]` 공개 페이지가 proxy 리다이렉트에 걸리지 않도록 예외 경로 처리 확인.

### 데이터 / 마이그레이션

- ⚠️ `lib/database.types.ts`는 **생성 파일**이다. 직접 편집 금지, 스키마 변경 후 재생성.
- ⚠️ MCP `apply_migration`은 **원격 프로젝트에 직접 적용**된다. 신중히.
- 가입 없는 RSVP 쓰기는 반드시 **slug 검증 Server Action/RPC**를 거친다. 클라이언트에서 직접 테이블 insert 금지.
- 참여자 식별은 `guest_token` 쿠키 기반 → 기기 변경 시 수정 불가가 의도된 한계임.

### 코드 / 범위

- 환경 변수 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`는 **새 publishable 키 형식** (대시보드의 `ANON_KEY` 값).
- 경로 별칭 `@/*` → 프로젝트 루트 사용.
- MVP 범위 엄수: **정산·카풀·알림·반복 이벤트는 구현하지 않는다** (PRD 로드맵 P2).
- 기존 스타일/컨벤션을 따른다. 요청되지 않은 "개선"·리팩터링 금지.

---

## 진행 현황 요약

| Phase                 | 상태 | 비고          |
| --------------------- | ---- | ------------- |
| Phase 1 — 골격        | ✅   | 라우팅 + 타입 (주최자 + 관리자 역할) |
| Phase 2 — UI/UX       | [~]  | 주최자·관리자 UI 완료, 카톡 인앱 점검만 남음 |
| Phase 3 — DB/핵심     | ✅   | 스키마/RLS/RPC + CRUD·RSVP·공지 실연결 + mock 제거 완료. capacity 마감(P1)은 Phase 4에서 구현 완료 |
| Phase 4 — 고급/최적화 | ✅   | 4.1·4.2·4.3 완료. Vercel 배포 + 배포 환경 검증(OG 한글 폰트 실효·advisor ERROR 0). 타임존·metadataBase는 후속 권장 |
