"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { cn } from "@/lib/utils";
import { mainNav, siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// 모바일 네비게이션 드로어 (md 미만에서만 표시).
// 헤더 좌측에 위치하는 햄버거 버튼 + Sheet 기반 오프캔버스 사이드 메뉴.
// mainNav 단일 소스를 AdminSidebar와 공유하므로 네비 항목 이중 정의 없음.
export function MobileNav() {
  const pathname = usePathname();
  // 드로어 개폐 상태 (클라이언트 전용)
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* 햄버거 버튼: md 이상에서는 숨김 */}
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="메뉴 열기"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>

      {/* 왼쪽 슬라이드 드로어 */}
      <SheetContent
        side="left"
        showCloseButton={true}
        className="w-64 p-0"
        aria-label="모바일 네비게이션"
      >
        {/* 브랜드 영역 */}
        <SheetHeader className="border-b px-4 py-3.5">
          <SheetTitle asChild>
            <Link
              href="/"
              className="text-sm font-semibold tracking-tight"
              onClick={() => setOpen(false)}
            >
              {siteConfig.name}
            </Link>
          </SheetTitle>
        </SheetHeader>

        {/* 네비게이션 목록 */}
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {mainNav.map((item) => {
            const Icon = item.icon;
            // 루트("/")는 정확 일치, 그 외는 접두사 일치로 하위 경로까지 활성 처리
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? // 활성 상태: sidebar-accent 배경 — AdminSidebar와 동일한 토큰으로 다크/라이트 일관성 확보
                      "bg-sidebar-accent text-sidebar-accent-foreground"
                    : // 비활성: sidebar-accent 호버도 동일하게 맞춤
                      "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="size-4 shrink-0" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
