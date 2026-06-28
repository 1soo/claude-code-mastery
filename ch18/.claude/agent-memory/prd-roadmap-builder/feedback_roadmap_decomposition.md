---
name: feedback-roadmap-decomposition
description: 이 프로젝트(Next.js 16 + React Compiler) 로드맵 작성 시 반복 고려할 기술 함정과 작업 분해 패턴.
metadata:
  type: feedback
---

ch18 계열(Next.js 16 App Router + React Compiler 활성화) 로드맵을 만들 때 반복적으로 반영할 패턴:

- **React Compiler + TanStack Table 함정**: `useReactTable` 사용 클라이언트 컴포넌트는 최상단 `"use no memo";` 필수(누락 시 런타임 오류). react-to-print 같은 다른 클라이언트 라이브러리도 빌드 호환 스모크 테스트를 초기 단계 작업으로 넣을 것. 단순 목록/필터는 TanStack Table 대신 배열 필터로 처리해 함정 자체를 회피하도록 권장.
- **RSC/CC 경계 명시**: 데이터 fetch=서버 컴포넌트, 상호작용(클립보드 복사·인쇄 트리거·필터 탭)만 "use client". 각 task에 어느 쪽인지 명시.
- **단일 소스 원칙을 task에 반영**: 네비=src/config/site.ts, 프로바이더=providers.tsx, 새 UI 프리미티브=`npx shadcn@latest add`. "직접 구현" 대신 표준 라이브러리(Intl.NumberFormat, date-fns 등) 사용을 task에 적어둘 것.
- **외부 API 의존 프로젝트의 게이트**: 노션처럼 외부 데이터 형식이 미확정이면 "착수 전 기술 검증"을 Phase 0로 독립시키고, 미확정 의사결정(예: 항목 저장 방식)을 후행 전부를 블록하는 게이트로 명시.

**Why:** 이 스택 고유 함정들이 로드맵에 안 들어가면 개발팀이 같은 곳에서 막힌다.
**How to apply:** Next.js 16 + React Compiler 프로젝트의 모든 로드맵/계획 작성 시 위 항목을 체크리스트로 적용.

관련: [[project-quote-app]]
