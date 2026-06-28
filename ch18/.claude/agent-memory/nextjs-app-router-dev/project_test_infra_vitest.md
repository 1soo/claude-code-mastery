---
name: project-test-infra-vitest
description: vitest 단위 테스트 인프라 구성 — node 환경, @/* alias, server-only 셰임 처리 방식
metadata:
  type: project
---

ch18에 vitest 단위 테스트 인프라가 도입됨(2026-06-23). Phase 1~2의 순수 함수(정규화/파서/포맷터) 테스트 대상.

**구성 결정:**
- `vitest.config.ts`: `test.environment: 'node'`(순수 함수 대상, DOM 불필요), `globals: true`, include `src/**/*.test.ts` + `src/**/__tests__/**/*.test.ts`.
- `@/*` alias 해석: `vite-tsconfig-paths` 플러그인 사용.
- **server-only 함정 해결**: `src/lib/notion.ts` 최상단 `import "server-only"`는 node 환경에서 throw하므로, `resolve.alias`로 `server-only` → `test/shims/server-only.ts`(빈 no-op 모듈)로 매핑. 이 셰임은 테스트에만 적용되고 Next 빌드/런타임엔 무영향.
- scripts: `test`(vitest run), `test:watch`(vitest).
- 테스트 픽스처 위치: `src/lib/__tests__/fixtures/`. 환경 검증용 `src/lib/__tests__/sanity.test.ts`는 삭제하지 말 것.

**Why:** Next 빌드와 독립적인 단위 테스트 환경이 필요했고, notion.ts의 server-only 가드가 node 테스트를 막는 문제를 셰임으로 우회.

**정규화 레이어 분리 결정(2026-06-23, Phase 1):**
- `normalizeQuote`/`parseQuoteItems`는 `src/lib/normalize.ts`(server-only 의존 없는 순수 함수)에 두고 `notion.ts`가 re-export한다. 테스트는 `@/lib/normalize`를 직접 import해 셰임 없이 격리. notion.ts의 `getQuotes`/`getQuote` stub은 미구현 throw 유지(Phase 2).
- 노션 page fixture는 실제 properties 타입을 반드시 따른다: `견적번호`=title, `제목`=rich_text(PRD와 반대), 빈 텍스트는 빈 배열(`title: []`), email/number/date/select 미입력은 각 필드 null. select.name이 STATUS_FROM_NOTION에 없으면 null. fixture 빌더는 `src/lib/__tests__/fixtures/notion-pages.ts`·`notion-blocks.ts`.

**notion.ts fetch 테스트 패턴(2026-06-23, Phase 2):**
- `getQuotes`/`getQuote` 에러 분기 테스트는 실 API 금지 — `vi.spyOn(notion.dataSources,'query')`, `vi.spyOn(notion.pages,'retrieve')`, `vi.spyOn(notion.blocks.children,'list')`로 모킹. server-only 셰임 덕에 `@/lib/notion`을 직접 import 가능. 테스트 파일: `src/lib/__tests__/notion-fetch.test.ts`.
- `APIResponseError`(코드의 `instanceof` 분기와 일치)는 실제 클래스로 생성: `new APIResponseError({ code, status, message, headers: new Headers(), rawBodyText: "{}", additional_data: undefined, request_id: undefined })`. v5(5.22.0)에서 검증됨.
- rate_limited 백오프(`withRetry`, 300ms*2^n) 테스트는 `vi.useFakeTimers()` + `await vi.runAllTimersAsync()`로 대기를 흘려보낸다(실제 sleep 금지). 재시도 소진 케이스는 reject assertion을 runAllTimersAsync 전에 걸어 unhandled rejection 경고를 막는다.
- env 누락 케이스는 `vi.stubEnv("NOTION_DATA_SOURCE_ID","")`. `afterEach`에 `vi.restoreAllMocks()`+`vi.unstubAllEnvs()`+`vi.useRealTimers()` 필수.

**How to apply:**
- 새 순수 함수 테스트는 `src/lib/__tests__/`에 `*.test.ts`로 작성, `@/...` import 사용.
- 참고 경고: vitest 4(Vite 7+)는 native `resolve.tsconfigPaths: true`를 지원하므로 향후 플러그인 제거 가능. 현재는 플러그인 유지.
- 관련: [[project-quote-app-identity]]
