import Link from "next/link";
import { FileQuestion } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";

// 404 에러 페이지 (F006) — 존재하지 않는 견적서/경로 접근 시 표시.
export default function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <EmptyState
        icon={FileQuestion}
        title="견적서를 찾을 수 없습니다"
        description="요청하신 견적서가 존재하지 않거나 삭제되었을 수 있습니다."
      >
        <Button asChild>
          <Link href="/">목록으로 돌아가기</Link>
        </Button>
      </EmptyState>
    </div>
  );
}
