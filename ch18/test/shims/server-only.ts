// vitest(node) 환경 전용 server-only 셰임(no-op).
//
// 실제 `server-only` 패키지는 클라이언트 번들에 포함되면 throw하도록 설계돼 있어,
// node 환경의 vitest에서 `src/lib/notion.ts`(최상단 `import "server-only"`)를 import하면 에러가 난다.
// vitest.config.ts의 resolve.alias로 `server-only` → 이 빈 모듈을 매핑해
// 순수 함수(정규화/파서/포맷터) 테스트에서 notion.ts를 안전하게 import할 수 있게 한다.
//
// 주의: 이 셰임은 테스트에만 적용되며 Next 빌드/런타임에는 영향을 주지 않는다.
export {};
