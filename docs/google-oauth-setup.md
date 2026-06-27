# Google 로그인(OAuth) 설정 안내

코드(콜백 라우트 `app/auth/callback/route.ts`, 버튼 `components/google-sign-in-button.tsx`)는 이미 추가되어 있다. 아래 두 곳의 설정을 **반드시 먼저** 완료해야 Google 로그인이 동작한다.

> 흐름: 브라우저에서 `signInWithOAuth({ provider: 'google' })` → Google 동의 화면 → Google이 **Supabase** 콜백(`https://<project-ref>.supabase.co/auth/v1/callback`)으로 리다이렉트 → Supabase가 우리 앱의 `/auth/callback?code=...`로 리다이렉트 → `exchangeCodeForSession`으로 세션 쿠키 저장 → `/protected`.

---

## 1. Google Cloud Console

1. <https://console.cloud.google.com> 접속 → 프로젝트 생성(또는 기존 프로젝트 선택).
2. **APIs & Services → OAuth consent screen**
   - User Type: **External** 선택.
   - 앱 이름, 사용자 지원 이메일, 개발자 연락처 입력 후 저장.
   - (개발 단계에서는 테스트 사용자에 본인 Google 계정을 추가해 두면 편하다.)
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
   - Application type: **Web application**.
   - **Authorized redirect URIs**에 아래를 추가 (← Supabase 콜백, 앱 도메인이 아님에 주의):
     ```
     https://<PROJECT_REF>.supabase.co/auth/v1/callback
     ```
     `<PROJECT_REF>`는 Supabase 대시보드 프로젝트 URL의 서브도메인이다.
4. 생성 후 표시되는 **Client ID**와 **Client Secret**을 복사한다.

---

## 2. Supabase 대시보드

1. **Authentication → Sign In / Providers → Google**
   - 토글을 켜고, 위에서 복사한 **Client ID / Client Secret** 입력 → **Save**.
2. **Authentication → URL Configuration → Redirect URLs**
   - 우리 앱의 콜백 경로를 허용 목록에 추가한다:
     ```
     http://localhost:3000/auth/callback        # 로컬 개발
     https://<배포-도메인>/auth/callback         # 프로덕션
     ```

> ⚠️ Provider 설정은 Supabase **대시보드 전용**이며 MCP의 `apply_migration` / `execute_sql`로는 변경할 수 없다.

---

## 3. 동작 확인

1. `npm run dev` 실행.
2. `http://localhost:3000/auth/login` → **Sign in with Google** 클릭.
3. Google 동의 화면 → 로그인 → `/protected`로 이동하고 상단에 이메일이 표시되면 성공.
4. 신규 Google 계정으로 첫 로그인 시, DB 트리거 `handle_new_user`가 `profiles` 테이블에 행을 자동 생성한다.

## 문제 해결

- **`redirect_uri_mismatch`** (Google 에러): 1-3단계의 Authorized redirect URI가 `https://<PROJECT_REF>.supabase.co/auth/v1/callback`와 정확히 일치하는지 확인.
- **`/auth/error`로 이동 + "No code provided"**: Supabase Redirect URLs 허용 목록에 `…/auth/callback`이 빠졌을 가능성이 높다.
- **로그인 직후 다시 로그아웃**: `proxy.ts` 세션 갱신 흐름은 변경하지 않았으므로, 보통 위 Redirect URL 설정 누락이 원인이다.
