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
    // 원본 에러(노션 토큰·내부 정보 포함 가능)는 화면에 노출하지 않고 콘솔로만 로깅한다.
    // digest 는 서버 측 에러를 식별하는 해시 — 함께 기록해 추적에 활용한다.
    // TODO: 운영 환경에서는 에러 로깅 서비스(Sentry 등)로 전송
    console.error(error);
    if (error.digest) {
      console.error("error.digest:", error.digest);
    }
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <EmptyState
        icon={AlertTriangle}
        title="문제가 발생했습니다"
        description="일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
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
