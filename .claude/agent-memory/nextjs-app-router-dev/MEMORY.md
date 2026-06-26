# Agent Memory Index

## 프로젝트 컨텍스트
- [견적서 앱 정체성 / CLAUDE.md 구버전 주의](project_quote_app_identity.md) — ch18은 어드민 대시보드가 아니라 Notion 견적서 공개 서비스. 규칙 우선순위: 실제 코드 > shrimp-rules.md > CLAUDE.md
- [vitest 테스트 인프라](project_test_infra_vitest.md) — node 환경, @/* alias, server-only 셰임으로 notion.ts 테스트 가능하게 처리

## 컴포넌트 / 라우트 패턴
- [견적서 컴포넌트 구조](project_quote_components.md) — quotes/ 디렉토리, StatusBadge 공용화, 상세 data-print-area 인쇄 컨테이너, 만료 배지 판정
- [상세 page.tsx 데이터 흐름](project_detail_page_data.md) — revalidate=300, await params, getQuote→notFound, generateMetadata 패턴
- [F003 PDF 인쇄](project_pdf_print_f003.md) — react-to-print v3.3.0 contentRef API, reactCompiler 환경서 "use no memo" 불필요(검증), useRef<HTMLDivElement> TS통과
