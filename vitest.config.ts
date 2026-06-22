import { fileURLToPath } from "node:url";

import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

// vitest 단위 테스트 설정 (Next 빌드와 독립).
// 대상: Phase 1~2의 순수 함수(정규화/파서/포맷터) 단위 테스트.
export default defineConfig({
  // vite-tsconfig-paths: tsconfig.json의 paths(@/* → src/*)를 테스트에서 해석.
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      // server-only 셰임:
      // src/lib/notion.ts 최상단 `import "server-only"`는 node 환경에서 throw하므로,
      // 테스트에서만 빈 모듈(no-op)로 대체해 안전하게 import되도록 한다.
      "server-only": fileURLToPath(
        new URL("./test/shims/server-only.ts", import.meta.url),
      ),
    },
  },
  test: {
    // 순수 함수 대상 — DOM이 필요 없으므로 node 환경 사용.
    environment: "node",
    // 테스트 파일 위치 규약: src/**/__tests__/**/*.test.ts
    include: ["src/**/*.test.ts", "src/**/__tests__/**/*.test.ts"],
    globals: true,
  },
});
