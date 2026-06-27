import Link from "next/link";
import { SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center px-4 py-8 text-center">
      <div className="space-y-6">
        <div className="flex justify-center">
          <SearchX className="size-12 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">페이지를 찾을 수 없어요</h1>
          <p className="text-sm text-muted-foreground">
            요청하신 페이지가 존재하지 않거나 이동되었습니다.
          </p>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Button asChild>
            <Link href="/dashboard">대시보드로</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">홈으로</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
