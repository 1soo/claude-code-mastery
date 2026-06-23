# 📝 로드맵 핵심 순서

Phase0: **기술 검증 & 의사결정** — 노션 API·인쇄·빌드 호환성을 코드 작성 전 확인하고, 견적 항목 저장 방식을 확정 (이후 전 단계의 전제)

Phase1~2: **데이터 계층** — 노션에서 견적서를 가져와 앱 타입으로 변환하고 캐싱하는 백엔드 토대

Phase3~4: **화면** — 견적서 목록(진입점)과 상세(핵심 가치) 페이지

Phase5: **PDF** — 상세 화면을 인쇄로 저장하는 두 번째 핵심 가치

Phase6: **에러 처리** — 실패 상황의 사용자 안내 마감

Phase7: **배포 & 검수** — Vercel 출시 후 성공 기준 검증

---

한마디로: **검증 → 데이터 → 화면 → PDF → 에러 → 배포** 순서로, 뒤로 갈수록 앞 단계에 의존합니다. 핵심 가치는 Phase 4(상세)와 Phase 5(PDF)에 있습니다.

---

## ✅ Phase 0 종료 (2026-06-23) — 게이트 통과, Phase 1 착수 가능

6개 검증 항목 모두 통과 + 견적 항목 저장 방식 확정. 상세 근거는 `docs/ROADMAP.md`의 "Phase 0 진행 현황" 참조.

- **노션 연동(T1)**: `@notionhq/client` v5 + `2025-09-03`에서 `dataSources.query` 정상. `NOTION_DATA_SOURCE_ID`에 database ID가 들어간 문제를 잡아 실제 data source ID로 교정.
- **DB 스키마(T2)**: 9개 프로퍼티 확인. ⚠️ `제목`=rich_text / `견적번호`=title (PRD 가정과 반대). select 4옵션 일치. → 매핑 단일소스 `src/lib/notion-schema.ts` + 가이드 `docs/notion-schema.md` 생성.
- **인쇄·빌드(T3)**: `reactCompiler:true` + `react-to-print` 빌드·런타임 정상 → `"use no memo"` 불필요.
- **저장 방식(T4)**: **방식 A(JSON 코드 블록)** 확정.
- **무오염**: 임시 검증 코드(`/api/verify`, `/verify-print`) 전부 삭제. 영구 산출물만 잔존.

**Phase 1 인계**: (1) `normalizeQuote`는 `NOTION_PROP_TYPE`로 title↔rich_text 추출, (2) 항목 파서는 방식 A(JSON), (3) DB에 견적 1건 추가 후 한글 왕복·fetch 재확인.

---

## ✅ MVP 전체 완료 (Phase 0~7)

| Phase | 내용 | 상태 | 커밋 |
|---|---|---|---|
| 0 | 착수 전 기술 검증 | ✅ | `0f4ac3b` |
| 1 | 노션 정규화 레이어 (F004) | ✅ | `1a58d60` |
| 2 | 데이터 fetch (F004) | ✅ | `29de282` |
| 3 | 목록 페이지 (F001/F005) | ✅ | `c35527a` |
| 4 | 상세 페이지 (F002) | ✅ | `e88207e` |
| 5 | PDF 다운로드 (F003) | ✅ | `7345b87` |
| 6 | 에러 처리 (F006) | ✅ | `92c4d77` |
| 7 | 배포 & 검수 (로컬) | ✅ 로컬 검증 | (이 커밋) |

- **검증**: vitest 단위 43개 통과 + Playwright E2E(목록/필터/공유복사/상세/만료/PDF 트리거/404) 통과 + `npm run build`(React Compiler)·`lint` 무오류.
- **노션 데이터**: 테스트 견적 10건(상태 4종/이메일 null 3/만료 2) 생성해 실데이터로 검증.
- **개발 방식**: 각 Phase = shrimp plan_task → nextjs-app-router-dev(기능) → ui-markup-specialist(UI 고도화) → Playwright 검증 → git commit → ROADMAP 체크.

### 운영자 잔여 작업 (Phase 7 그룹 B — 실배포)
`docs/deploy.md` 참조. Vercel 환경변수 설정 + 실배포 후 배포 URL에서 성공 기준 6개(60초 반영·PDF 한글·404·공유링크 접근·UUID·에러 미노출) 확인. ROADMAP의 해당 항목은 실배포 후 체크.
