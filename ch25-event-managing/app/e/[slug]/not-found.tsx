import Link from "next/link";
import { SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function EventNotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center px-4 py-8 text-center">
      <div className="space-y-6">
        <div className="flex justify-center">
          <SearchX className="size-12 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">이벤트를 찾을 수 없어요</h1>
          <p className="text-sm text-muted-foreground">
            존재하지 않거나 종료된 이벤트입니다. 주소를 다시 확인해 주세요.
          </p>
        </div>
        <div className="flex items-center justify-center">
          <Button variant="outline" asChild>
            <Link href="/">홈으로</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
