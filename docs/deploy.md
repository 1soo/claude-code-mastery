# 배포 가이드 (Vercel)

견적서 공유 웹앱을 Vercel에 배포하는 절차와 배포 후 검수 체크리스트입니다.
(로컬 검증은 Phase 7에서 완료됨 — 빌드/lint/단위 테스트/E2E 회귀 통과. 실배포는 운영자가 직접 수행)

---

## 1. 사전 준비 (노션)

1. **노션 통합(integration) 생성** — [notion.so/my-integrations](https://www.notion.so/my-integrations)에서 Internal Integration 생성 → **시크릿 토큰** 확보(`NOTION_TOKEN`).
2. **DB에 통합 공유** — 견적서 데이터베이스 페이지 우상단 `...` → **연결(Connections)** → 생성한 통합 추가. (이게 안 되면 `object_not_found` 발생)
3. **data source ID 확보** — ⚠️ **중요(Phase 0 교훈)**: 2025-09-03 API부터 database ID와 **data source ID는 다르다**. 노션 URL에서 복사한 ID는 보통 database ID다.
   - `databases.retrieve({ database_id })` 응답의 `data_sources[]`에서 실제 **data source ID**를 추출해 `NOTION_DATA_SOURCE_ID`로 사용한다.
   - 현재 프로젝트 기준: database ID `387de2a3-846c-8050-9ae2-e5a99575084a` → data source ID `387de2a3-846c-80a4-97a2-000bf4b4b3f7`. 상세는 `docs/notion-schema.md` 참조.

### 노션 DB 스키마 (필수 프로퍼티)
`docs/notion-schema.md`의 구조와 정확히 일치해야 한다. 특히 **`견적번호`=title, `제목`=rich_text**(PRD 가정과 반대), 상태 select 옵션은 `발행/검토중/승인/만료`. 매핑 단일 소스는 `src/lib/notion-schema.ts`.

견적 항목은 견적서 페이지 **본문에 `json` 코드 블록**으로 저장(방식 A): `[{ "name": "...", "quantity": 1, "unitPrice": 1000, "amount": 1000, "note": "선택" }]`.

---

## 2. Vercel 환경변수

Vercel 프로젝트 Settings → Environment Variables에 등록:

| 변수 | 필수 | 설명 |
|---|:--:|---|
| `NOTION_TOKEN` | ✅ | 노션 통합 시크릿 토큰 |
| `NOTION_DATA_SOURCE_ID` | ✅ | **data source ID**(database ID 아님) |
| `NEXT_PUBLIC_SITE_URL` | ➖ | 메타데이터용(선택). 공유 링크는 런타임 `window.location.origin`을 쓰므로 미설정해도 정상 동작 |

> `.env.local`은 `.gitignore`에 포함되어 커밋되지 않는다(`.env*`). 시크릿을 코드/저장소에 넣지 말 것.

---

## 3. 배포 절차

1. GitHub 저장소를 Vercel에 **Import**.
2. Framework Preset: **Next.js** 자동 인식(`npm run build`).
3. 위 **환경변수** 입력.
4. **Deploy**.

> 빌드는 `next build`(React Compiler 활성). 로컬에서 `npm run build` 무오류를 이미 확인함.

---

## 4. 캐시(ISR) 동작

- 목록 페이지(`/`): `revalidate = 60` — 노션 변경이 **최대 60초** 내 반영.
- 상세 페이지(`/quotes/[id]`): `revalidate = 300` — 최대 5분 내 반영.
- 즉시 반영이 필요하면 향후 `revalidateTag`/온디맨드 재검증 도입 검토(현재 범위 외).

---

## 5. 배포 후 성공 기준 체크리스트 (운영자 확인용)

배포 URL에서 다음을 확인:

- [ ] 노션에서 견적서 값 변경 후 **60초 내** 목록에 반영(ISR)
- [ ] 상세 페이지에서 **PDF로 저장** → 파일 정상 저장 + **한글/₩ 깨짐 없음**
- [ ] 존재하지 않는 URL(`/quotes/없는id`) → **"견적서를 찾을 수 없습니다"**(not-found)
- [ ] **공유 링크 복사** → 링크가 **배포 도메인** 기준(localhost 아님) + 그 링크로 클라이언트가 접근 가능
- [ ] 견적서 상세 URL이 **노션 UUID**(순차 ID 아님 → 추측 불가)
- [ ] 노션 통합 미공유/토큰 오류 시 사용자 화면에 **일반 안내**만 노출(원본 오류 미노출)

---

## 6. 주의사항

- `.env.local`/시크릿 토큰을 저장소에 커밋하지 말 것. 노출 시 노션에서 토큰 **재발급(rotate)**.
- 노션 통합을 DB에 공유하지 않으면 `object_not_found` — 사전 준비 2번 필수.
- 견적 항목 JSON이 깨지면 해당 견적의 항목은 빈 배열로 처리되고(상세 페이지는 깨지지 않음) 서버 로그에 기록된다.
- 공유 링크는 **인증 없는 공개 접근**이다(URL을 아는 사람은 열람 가능). 보안 요구가 높아지면 접근 통제 별도 도입 필요(MVP 범위 외).
