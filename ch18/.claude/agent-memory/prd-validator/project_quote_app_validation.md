---
name: project-quote-app-validation
description: docs/PRD.md(견적서 공유 앱 MVP) 기술 검증 결과 — Critical/High 이슈와 판정
metadata:
  type: project
---

`docs/PRD.md`(견적서 관리/공유 앱 MVP) 기술 검증 완료 (2026-06-23). 관련: [[project-quote-app]], [[reference-notion-data-source-migration]].

**판정:** 조건부 통과(수정 후 구현 가능). 기술적 실현성은 높음, 단 두 가지 must-fix 존재.

**Critical 이슈:**
- Notion API 데이터 소스 전환: PRD가 구형 `databases.query` 전제. 2025-09-03부터 `dataSources.query` + `@notionhq/client` v5 필요. 상세는 [[reference-notion-data-source-migration]].
- PDF 전략 A 개념 오류: `@react-pdf/renderer`는 DOM/HTML/Tailwind를 쓰지 않고 자체 primitive(StyleSheet/Yoga)로 레이아웃을 별도 재구현해야 함. PRD의 "렌더링된 견적서 HTML을 PDF로 변환" 문구는 전략 A에 대해 거짓(전략 B/window.print에만 해당).

**High 이슈:**
- 솔로 MVP에는 PDF 1순위로 `window.print()` + print CSS 권장(한글 폰트 리스크·복잡도 최저, 기존 Tailwind UI 재사용). 전략 A는 한글 TTF Base64 임베드로 번들 ~5MB 비대.
- `@notionhq/client` 미설치(package.json에 없음) — 추가 필요.

**Why:** 솔로 개발자 프로젝트라 외부 의존성 함정(Notion API 버전, 한글 PDF)이 가장 큰 리스크.
**How to apply:** 이 앱 구현 착수 시 위 must-fix를 먼저 반영. PDF는 window.print 우선 검토.
