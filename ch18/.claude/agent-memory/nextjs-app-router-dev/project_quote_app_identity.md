---
name: project-quote-app-identity
description: ch18은 어드민 대시보드가 아니라 Notion 견적서 열람/PDF 공개 서비스이며 CLAUDE.md가 구버전이라는 사실
metadata:
  type: project
---

ch18 프로젝트의 실제 정체성은 **Notion DB 견적서를 웹에서 열람하고 PDF로 저장하는 공개·무인증 서비스**(`siteConfig.name` = "견적서 공유"). 화면은 단 2개: 목록(`/`) + 상세(`/quotes/[id]`).

**Why:** 프로젝트가 ch13 어드민 대시보드 스타터킷에서 전환되었으나(커밋 b13f8b5), `CLAUDE.md`에는 구버전 설명(TanStack Table·react-hook-form·zod·recharts·`(dashboard)` 라우트 그룹·`mock-data.ts`)이 남아 있다. 이것들은 **현재 프로젝트에 존재하지 않는다**.

**How to apply:**
- 규칙 충돌 시 우선순위: **실제 코드 > `shrimp-rules.md` > `CLAUDE.md`**.
- CLAUDE.md의 React Compiler + TanStack Table `"use no memo"` 함정은 이 프로젝트엔 TanStack Table이 없어 무관. 단 `reactCompiler: true`는 유효.
- 미설치 패키지(`@tanstack/react-table`, `react-hook-form`, `zod`, `recharts`, `@tabler/icons-react`) 임의 추가 금지 — 필요 시 사용자 확인.
- 권위 있는 규칙 문서는 `shrimp-rules.md`(AI 전용 운영 규칙)다. 관련: [[project-test-infra-vitest]]
