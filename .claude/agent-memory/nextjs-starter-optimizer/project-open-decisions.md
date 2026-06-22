---
name: project-open-decisions
description: 견적서 앱 노션 연동 구현 전 사용자가 확정해야 할 미해결 결정 사항
metadata:
  type: project
---

스타터 정리 시점(2026-06-23)에 골격만 만들었고, 다음 항목은 사용자 결정 대기 중이다.

**Why:** 임의로 가정하면 잘못된 방향으로 구현될 수 있어 보류함. PRD에도 "택1"로 열려 있는 항목.

**How to apply (노션 연동 구현 착수 전 반드시 확인):**
1. **견적 항목 저장 방식** — 방식 A(JSON 코드 블록, PRD 권장) vs 방식 B(노션 테이블 블록 파싱). `getQuote`의 본문 파싱 구현이 이 선택에 따라 갈림. 방식 B는 헤더 텍스트 기반 동적 매핑 + 통화/콤마 제거 파서 필요.
2. **노션 env 설정** — `.env.example` 생성함. 실제 `NOTION_TOKEN`, `NOTION_DATA_SOURCE_ID`를 `.env.local`에 채워야 동작. data source ID는 빌드 시 1회 `databases.retrieve`로 조회해 고정.
3. **PDF 방식** — MVP는 방식 1(`window.print()`). 브랜딩 자동 PDF 필요 시 방식 2(puppeteer)로 격상. 방식 3(@react-pdf/renderer)은 한글 리스크로 부적합.

관련 [[project-quote-app]].
