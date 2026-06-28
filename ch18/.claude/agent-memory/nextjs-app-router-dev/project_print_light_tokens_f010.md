---
name: project-print-light-tokens-f010
description: F010 다크모드 인쇄 마감 — globals.css @media print 안에서 :root,.dark 토큰을 라이트로 재정의해 다크 인쇄가 라이트로 나가게 함
metadata:
  type: project
---

다크모드(`<html class="dark">`)로 인쇄해도 PDF가 항상 라이트로 나가도록, `src/app/globals.css`의 `@media print` 블록 **최상단**에 `:root, .dark { ... }` 테마 토큰 라이트 재정의를 추가했다(F010 V2-4).

**Why:** react-to-print는 인쇄 시 `.dark` 클래스가 DOM에 살아있는 상태로 렌더한다. 기존 print 규칙은 `html,body`와 `[data-print-area]` 루트의 bg/color만 #fff/#000으로 강제했을 뿐, 카드/배지/구분선/합계박스 등 `var(--card)`/`var(--muted)`/`var(--primary)` 등 토큰을 직접 참조하는 내부 요소는 다크 oklch 값 그대로 렌더됐고, `[data-print-area] *{print-color-adjust:exact}`가 그 어두운 배경을 실제로 인쇄해버렸다.

**How to apply:**
- 토큰 재정의는 `:root`의 라이트 정의를 그대로 사용하되 `--muted-foreground`만 0.45로 진하게(인쇄 가독성). 임의 색 하드코딩 금지, 기존 oklch 라이트 체계 유지.
- 반드시 `@media print` 블록 **상단**에 둘 것. 이후의 `#fff`/`[data-print-area]` 규칙과 상호 보완(무력화 없음)된다.
- 합계박스(`bg-primary`+`text-primary-foreground`)가 다크 토큰에선 밝은박스+어두운글자라 흰 종이서 대비가 죽는데, 라이트 토큰 재정의로 진한박스+흰글자가 되어 자연 해결됨. 배지 4종(default/secondary/outline/destructive) 모두 토큰 의존이라 추가 보정 불필요.
- 인쇄 트리거(`useReactToPrint`)/`data-print-area`는 공개 상세 `/quotes/[id]`에만 존재. 어드민 셸은 인쇄 트리거가 없어 충돌 없음 — `print:hidden` 보강 불필요.
- 관련: [[project_pdf_print_f003]] (기존 print 규칙 원본), [[project_quote_components]]
