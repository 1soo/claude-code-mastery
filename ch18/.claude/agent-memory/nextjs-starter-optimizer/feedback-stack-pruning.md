---
name: feedback-stack-pruning
description: 견적서 앱은 읽기전용 단순 구조라 폼/테이블/차트 관련 스택을 제거하는 판단을 내림
metadata:
  type: feedback
---

견적서 앱(읽기 전용, 공개 2페이지)에 맞춰 어드민 스타터의 무거운 스택을 의존성+코드까지 제거했다.

**제거한 의존성과 근거(사용처 매핑):**
- `recharts` → `overview-chart`(대시보드 데모)에서만 사용. PRD에 차트 없음.
- `@tanstack/react-table` + `data-table.tsx`/`columns.tsx` → 사용자 테이블 데모 전용. PRD 목록은 카드 형태. (이 제거로 React Compiler `"use no memo"` 함정도 소멸)
- `react-hook-form`/`@hookform/resolvers`/`zod` → `settings-form` 데모 전용. 읽기 전용 앱이라 폼 입력 없음.
- `@tabler/icons-react` → 코드에서 미사용(lucide만 사용).
- sidebar 의존 ui 프리미티브(sidebar/sheet/skeleton/input + 사용처 없던 avatar/breadcrumb/chart/switch/textarea/label/select/checkbox/alert-dialog/tabs)와 `use-mobile` 훅도 제거.

**Why:** PRD가 인증 없는 단순 조회 앱이라 어드민 셸(사이드바/다중 메뉴/폼/차트)은 과한 보일러플레이트. 추가 설치: `@notionhq/client` v5+, `react-to-print`, `server-only`.

**How to apply:** 향후 이 스택이 다시 필요하면 재설치/`npx shadcn@latest add`로 복구. 견적 항목 테이블 렌더링용 `ui/table`, 상태 배지 `ui/badge`, 카드 `ui/card`는 의도적으로 남겨둠. zod는 노션 정규화 검증에 유용할 수 있으나 일단 제거(필요시 재도입).

**검증 함정:** 라우트 삭제 후 `next build`가 stale `.next` 타입 캐시 때문에 삭제된 라우트(`(dashboard)/dashboard/page.js`)를 못 찾아 실패함 → `.next` 삭제 후 재빌드로 해결.
