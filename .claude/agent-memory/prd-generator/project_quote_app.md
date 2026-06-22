---
name: project-quote-app
description: 견적서 관리/공유 웹 애플리케이션 PRD 작성 — 노션 API 연동, PDF 다운로드, ch18 프로젝트 기반
metadata:
  type: project
---

견적서 공유 앱 PRD를 `docs/PRD.md`에 작성 완료 (2026-06-23).

**Why:** 운영자가 노션에서 견적서를 관리하고, 클라이언트가 웹에서 확인·PDF 다운로드하는 솔로 개발자용 MVP.

**핵심 설계 결정:**
- 데이터 소스: 노션 데이터베이스 단일 소스 (`@notionhq/client` SDK, 서버 컴포넌트에서만 호출)
- PDF 생성: `@react-pdf/renderer` (클라이언트사이드) 1순위, `puppeteer` 2순위
- 인증: MVP 범위 외 (URL 기반 공유만)
- 캐시: 목록 ISR 60초, 상세 ISR 300초

**기능 ID 매핑:**
- F001: 견적서 목록 조회 → 견적서 목록 페이지
- F002: 견적서 상세 조회 → 견적서 상세 페이지
- F003: PDF 다운로드 → 견적서 상세 페이지
- F004: 노션 API 연동 → 목록/상세 페이지 공통
- F005: 공유 링크 생성 → 견적서 목록 페이지
- F006: 에러 처리 → 에러 페이지

**How to apply:** 이 프로젝트 구현 시 PRD의 기능 ID와 페이지 구조를 참조할 것.
