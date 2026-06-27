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

### 1.1 프로젝트 구조 및 라우팅 설정 (우선순위)

- ✅ 스타터 잔재 정리: `components/tutorial/*`, `components/hero.tsx`, `components/next-logo.tsx`, `components/supabase-logo.tsx`, `components/deploy-button.tsx` 제거 대상 식별
- ✅ 라우트 골격 생성 (더미 페이지로 먼저 뼈대만)
  - ✅ `app/dashboard/page.tsx` — 주최자 대시보드 (보호 라우트)
  - ✅ `app/events/new/page.tsx` — 이벤트 생성
  - ✅ `app/events/[id]/page.tsx` — 주최자 이벤트 상세
  - ✅ `app/events/[id]/edit/page.tsx` — 이벤트 수정
  - ✅ `app/e/[slug]/page.tsx` — 공개 RSVP 페이지 (인증 불필요)
- ✅ `proxy.ts`의 인증 리다이렉트 정책 확인: `/e/[slug]`가 **비로그인 접근 허용** 경로에 포함되는지 검증
- ✅ 검증: 각 라우트가 200으로 렌더되고, 보호 라우트는 비로그인 시 `/auth/login`으로 리다이렉트

### 1.2 타입 정의 및 인터페이스 설계

- ✅ 도메인 타입 정의 파일 생성 (`lib/types.ts` 또는 `types/`)
  - ✅ `Event` (id, host_id, slug, title, starts_at, ends_at, location, capacity, description)
  - ✅ `Rsvp` (id, event_id, guest_token, name, status, party_size)
  - ✅ `RsvpStatus` = `'going' | 'not_going' | 'maybe'`
  - ✅ `Announcement` (id, event_id, body, created_at)
  - ✅ 집계 뷰 타입 `EventSummary` (goingCount, notGoingCount, maybeCount, totalAttendees)
- ✅ Phase 3에서 `lib/database.types.ts` 재생성 후 도메인 타입과 정합성 맞추는 지점 표시
- ✅ 검증: `npm run typecheck` 통과

---

## Phase 2 — UI/UX 완성 (더미 데이터 활용)

> 목표: 백엔드 없이 더미 데이터로 모든 화면을 완성한다. 모바일 우선, 데스크톱은 관리 화면만.

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

### 2.4 관리자 데스크톱 페이지 UI/UX 완성

- ✅ 주최자 이벤트 상세(데스크톱): 집계 요약 + 명단 테이블 + 공지 작성 영역 + 공유 링크
- ✅ 명단 테이블: 이름 / 상태 / 동반 인원 / 응답 시각
- ✅ 반응형: 모바일↔데스크톱 레이아웃 (`max-w-5xl`, `flex-col sm:flex-row`, 테이블 `overflow-x-auto`)
- ✅ 검증: 더미 데이터로 집계/명단/공지 UI가 데스크톱에서 완결 (Playwright 육안 검증 완료: 공지 작성 다이얼로그 동작 확인)

---

## Phase 3 — 데이터베이스 설정 및 핵심 기능 구현

> 목표: 더미를 실제 Supabase 데이터로 교체하고 핵심 기능을 작동시킨다.

### 3.1 데이터베이스 스키마 및 Supabase 초기 설정

- [ ] 마이그레이션 작성 (`supabase/migrations/`)
  - [ ] `events` 테이블 (+ `slug` unique, `updated_at` 트리거)
  - [ ] `rsvps` 테이블 (+ `status` enum, `party_size` default 1)
  - [ ] `announcements` 테이블
- [ ] `lib/database.types.ts` 재생성 (직접 편집 금지)
- [ ] 검증: `mcp__supabase__get_advisors`로 보안/성능 경고 확인

### 3.2 인증 시스템 및 권한 관리 (RLS)

- [ ] RLS 정책
  - [ ] `events`: 쓰기/수정/삭제는 `host_id = auth.uid()`
  - [ ] `events` 공개 읽기: slug 기반 조회 전용 경로/RPC (직접 SELECT 제한)
  - [ ] `rsvps`: 가입 없는 insert/update는 **slug 검증 Server Action/RPC** 경유만 허용
  - [ ] `rsvps`: 주최자는 본인 이벤트 rsvp 전체 조회 가능
  - [ ] `announcements`: 쓰기는 주최자, 읽기는 slug 보유자
- [ ] 가입 없는 쓰기 어뷰징 방어: slug 검증 + rate limit
- [ ] 검증: 비인가 사용자가 타인 이벤트 수정/조회 불가 (수동 시나리오 테스트)

### 3.3 이벤트 CRUD 및 초대(공유 링크) 시스템

- [ ] Server Action: 이벤트 생성/수정/삭제 (서버 클라이언트 `lib/supabase/server.ts` 사용)
- [ ] `slug` 생성 로직 (추측 불가 토큰)
- [ ] 공유 링크 발급 및 복사 기능 실연결
- [ ] 검증: 생성한 이벤트가 DB에 저장되고 `/e/[slug]`로 접근됨

### 3.4 참여자 관리 (RSVP)

- [ ] Server Action/RPC: slug 기반 RSVP insert/update
- [ ] `guest_token` 쿠키 발급·식별 로직 (재방문 시 응답 수정)
- [ ] 실시간 집계 쿼리: 응답자 수 + 총 참석 인원(`party_size` 합산)
- [ ] 정원(capacity) 도달 시 처리 (P1: 마감/대기)
- [ ] 검증: 비로그인 브라우저에서 RSVP → 명단·집계 반영 확인

### 3.5 관리자 대시보드 백엔드 구현

- [ ] 대시보드: 주최자 본인 이벤트 목록 실제 쿼리
- [ ] 이벤트 상세: 집계·명단·공지 실제 데이터 바인딩
- [ ] 공지 작성 Server Action
- [ ] 검증: 더미 데이터 모듈(`lib/mock-data.ts`) 완전 제거

### 3.6 핵심 기능 통합 테스트

- [ ] 시나리오: 주최자 가입→이벤트 생성→링크 공유→참여자 RSVP→집계 확인→공지→참여자 공지 열람
- [ ] 다중 기기/브라우저 응답 식별 검증
- [ ] 검증: PRD North Star 흐름(RSVP 수집)이 끝까지 동작

---

## Phase 4 — 고급 기능 및 최적화

> 목표: 출시 품질로 다듬는다. PRD의 로드맵(P2)은 여기 또는 v1.1+로 분류.

### 4.1 사용자 경험 향상

- [ ] 로딩/에러/빈 상태(empty state) 처리
- [ ] 토스트 알림(응답 완료, 복사 성공 등)
- [ ] 폼 유효성 검증 및 친절한 에러 메시지
- [ ] 다크모드 점검 (next-themes)
- [ ] (P2 후보) 동반 인원 마감 로직, 공지 이력 타임라인

### 4.2 성능 최적화 및 SEO

- [ ] 공개 RSVP 페이지 메타데이터/OG 이미지 (카톡 공유 시 미리보기)
- [ ] 서버 컴포넌트 우선, 클라이언트 컴포넌트 최소화 점검
- [ ] 이미지/폰트 최적화, 불필요 리렌더 제거
- [ ] 검증: Lighthouse 모바일 점수 점검

### 4.3 배포 및 모니터링

- [ ] 환경 변수 설정 (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)
- [ ] 프로덕션 빌드 검증 (`npm run build`)
- [ ] 배포 (Vercel 등)
- [ ] Supabase advisor 최종 점검 (보안/성능)

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
| 인증        | 쿠키 기반 SSR (이메일 + Google OAuth)  | 주최자만 가입             |
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
| Phase 1 — 골격        | ✅   | 라우팅 + 타입 |
| Phase 2 — UI/UX       | [~]  | 구현·육안 검증 완료, 카톡 인앱 점검만 남음 |
| Phase 3 — DB/핵심     | [ ]  | Supabase 연동 |
| Phase 4 — 고급/최적화 | [ ]  | 출시 준비     |
