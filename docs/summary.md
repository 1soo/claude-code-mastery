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
