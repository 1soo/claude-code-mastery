---
name: pdf-print-f003
description: F003 PDF 인쇄 기능 — react-to-print v3.3.0 API와 reactCompiler 호환성 검증 결과
metadata:
  type: project
---

견적서 상세(`/quotes/[id]`)의 PDF 저장은 react-to-print **v3.3.0**으로 구현됨. 인쇄 대상은 QuoteDetail의 `<article data-print-area>`.

**Why:** PRD F003 + shrimp-rules의 PDF 규칙(react-to-print + window.print + @media print, 다른 PDF 라이브러리 금지).

**How to apply:**
- v3 API는 `useReactToPrint({ contentRef: RefObject, documentTitle, onAfterPrint })` — `content`가 아니라 **contentRef**. 트리거 함수를 반환하므로 `onClick={() => handlePrint()}`.
- 설치 타입상 `contentRef`는 `RefObject<Element|Text|null|undefined>`지만, `useRef<HTMLDivElement>(null)`을 그대로 넘겨도 **TS strict 빌드 통과**(검증 완료). 별도 캐스팅 불필요.
- **reactCompiler:true 환경에서 `"use no memo"` 불필요** — `npm run build` 무오류 검증됨. react-to-print를 쓰는 클라이언트 컴포넌트(QuotePrintFrame)에 지시어 넣지 말 것. (런타임 오류 시에만 재검토)
- QuoteDetail은 서버 컴포넌트 유지 — children으로 QuotePrintFrame(클라이언트)에 전달. getQuote는 page.tsx(RSC)에서만.
- 인쇄 액션 바(뒤로가기 + PDF 버튼)는 QuotePrintFrame에 있고 `print:hidden`. globals.css 하단 `@media print` 블록이 `.print\:hidden`, `[data-print-area]` box-shadow/border 제거, break-inside, print-color-adjust:exact 처리.
- E2E 검증용: onAfterPrint에서 `window.__printed = true` 플래그를 심음.

관련: [[detail-page-data]], [[quote-components]]
