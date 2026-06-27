"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center px-4 py-8 text-center">
      <div className="space-y-6">
        <div className="flex justify-center">
          <AlertTriangle className="size-12 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">문제가 발생했어요</h1>
          <p className="text-sm text-muted-foreground">
            요청을 처리하는 중에 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.
          </p>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Button onClick={() => reset()}>다시 시도</Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">대시보드로</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
