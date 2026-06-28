import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="flex w-full flex-1 flex-col items-center gap-20">
        <nav className="flex h-16 w-full justify-center border-b border-b-foreground/10">
          <div className="flex w-full max-w-5xl items-center justify-between p-3 px-5 text-sm">
            <div className="flex items-center gap-5 font-semibold">
              <Link href={"/"}>모임 이벤트 관리</Link>
            </div>
            {!hasEnvVars ? (
              <EnvVarWarning />
            ) : (
              <Suspense>
                <AuthButton />
              </Suspense>
            )}
          </div>
        </nav>
        <div className="flex max-w-5xl flex-1 flex-col items-center gap-8 p-5 text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">
            링크 하나로 끝내는 모임 참석 집계
          </h1>
          <p className="max-w-xl text-foreground/70">
            이벤트를 만들고 공유 링크를 보내면, 참여자는 가입 없이 참석 여부를
            응답합니다. 응답 현황과 참석 인원을 한눈에 확인하세요.
          </p>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/dashboard">대시보드로 이동</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/auth/login">로그인</Link>
            </Button>
          </div>
        </div>

        <footer className="mx-auto flex w-full items-center justify-center gap-8 border-t py-16 text-center text-xs">
          <p>
            Powered by{" "}
            <a
              href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              Supabase
            </a>
          </p>
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}
