import Link from "next/link";
import { ArrowRight, Boxes } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { siteConfig } from "@/config/site";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex h-16 items-center justify-between border-b px-6">
        <div className="flex items-center gap-2 font-semibold">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Boxes className="size-4" />
          </div>
          {siteConfig.name}
        </div>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            모던 웹 스타터킷
          </h1>
          <p className="mx-auto max-w-xl text-balance text-lg text-muted-foreground">
            {siteConfig.description}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/dashboard">
              대시보드 시작하기
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/users">사용자 예제 보기</Link>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Next.js · TypeScript · Tailwind CSS · shadcn/ui · lucide-react
        </p>
      </main>
    </div>
  );
}
