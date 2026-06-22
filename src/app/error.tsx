"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";

// 전역 에러 경계 (F006) — 노션 API 오류 등 서버/렌더 오류 발생 시 표시.
// error.tsx는 반드시 클라이언트 컴포넌트여야 한다.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO: 운영 환경에서는 에러 로깅 서비스로 전송
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <EmptyState
        icon={AlertTriangle}
        title="문제가 발생했습니다"
        description="견적서를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => reset()}>
            다시 시도
          </Button>
          <Button asChild>
            <Link href="/">목록으로 돌아가기</Link>
          </Button>
        </div>
      </EmptyState>
    </div>
  );
}
