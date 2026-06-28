---
name: tanstack-table-no-memo
description: TanStack Table + reactCompiler 환경에서 "use no memo" 스모크 검증 결과 (V2-0)
metadata:
  type: project
---

`@tanstack/react-table@8.21.3` 설치됨(V2-0, 2026-06-27). 후속 V2-2 견적서 테이블에 사용 예정.

CLAUDE.md는 `useReactTable`을 쓰는 클라이언트 컴포넌트에 `"use no memo";`가 없으면 React Compiler 비호환 런타임 오류가 난다고 명시. 그러나 **이 환경(Next 16.2.9 + Turbopack, React 19.2.4, babel-plugin-react-compiler@1.0.0)에서는 지시어 없이도 오류가 재현되지 않음.**

**검증 방법:** 임시 라우트 `src/app/smoke-table`에 `useReactTable` 최소 컴포넌트("use no memo" 미포함) 배치 → `npm run build` 성공 + dev 서버 Playwright 렌더 시 콘솔 에러 0건, 테이블 정상 렌더. 검증 후 임시 파일 전부 삭제.

**주의 — Next 16 private 폴더:** `__`로 시작하는 app 폴더(`__smoke-table`)는 private 폴더로 라우팅 제외되어 페이지가 생성 안 됨. 검증 라우트는 `__` 접두사 금지.

**How to apply:**
- V2-2에서 테이블 컴포넌트는 일단 CLAUDE.md 규칙대로 `"use no memo";`를 **선반영**(안전). 비용 거의 없고 문서 규칙과 일관.
- 단, 누락했다고 즉시 크래시하는 건 아님 — 런타임 오류가 안 나면 React Compiler 버전/Turbopack 동작 차이일 수 있음. 디버깅 시 이 지시어를 1순위 원인으로 단정하지 말 것.
- 이는 [[pdf-print-f003]]의 react-to-print "use no memo" 불필요 검증과 동일 패턴 — 이 환경 전반에서 reactCompiler가 서드파티 훅과 비교적 잘 공존.

관련: [[pdf-print-f003]], [[quote-app-identity]]
