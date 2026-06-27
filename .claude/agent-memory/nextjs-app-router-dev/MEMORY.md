# Agent Memory Index

## 프로젝트 컨텍스트
- [견적서 앱 정체성 / CLAUDE.md 구버전 주의](project_quote_app_identity.md) — ch18은 어드민 대시보드가 아니라 Notion 견적서 공개 서비스. 규칙 우선순위: 실제 코드 > shrimp-rules.md > CLAUDE.md
- [vitest 테스트 인프라](project_test_infra_vitest.md) — node 환경, @/* alias, server-only 셰임으로 notion.ts 테스트 가능하게 처리

## 컴포넌트 / 라우트 패턴
- [견적서 컴포넌트 구조](project_quote_components.md) — quotes/ 디렉토리, StatusBadge 공용화, 상세 data-print-area 인쇄 컨테이너, 만료 배지 판정
- [상세 page.tsx 데이터 흐름](project_detail_page_data.md) — revalidate=300, await params, getQuote→notFound, generateMetadata 패턴
- [F003 PDF 인쇄](project_pdf_print_f003.md) — react-to-print v3.3.0 contentRef API, reactCompiler 환경서 "use no memo" 불필요(검증), useRef<HTMLDivElement> TS통과
- [F010 다크모드 인쇄 마감](project_print_light_tokens_f010.md) — @media print 상단에 :root,.dark 토큰 라이트 재정의로 다크 인쇄가 라이트로 나가게(react-to-print는 .dark 보존)
- [TanStack Table + use no memo](project_tanstack_table_no_memo.md) — v8.21.3 설치(V2-0), 이 환경선 지시어 없이도 오류 미재현. V2-2 선반영 권장. __접두사 폴더는 라우팅 제외 주의
- [V2-1 어드민 셸(F007)](project_admin_shell_v2_1.md) — (admin) 그룹 + /admin/quotes, 경량 자작 사이드바, mainNav 혼재(section 필드), .next stale 타입캐시 함정
- [V2-2 어드민 테이블(F008)](project_admin_quote_table_f008.md) — quote-table.ts 순수함수 + TanStack manual 모드(내장 sortingFn null규칙 깨짐), status 정렬순서, use no memo는 warning이 정상신호
- [V2-3 공유 URL(F009)](project_share_url_f009.md) — lib/share.ts buildShareUrl 단일소스, 행 액션 메뉴(QuoteRowActions, row.original props로 ID혼선 차단), 토스트 문구 고정
