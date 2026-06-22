"use client";

import { usePathname } from "next/navigation";
import { LogOut, User as UserIcon } from "lucide-react";

import { mainNav } from "@/config/site";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// 상단 헤더: 사이드바 토글 + 현재 페이지 브레드크럼 + 테마 토글 + 사용자 메뉴
export function AppHeader() {
  const pathname = usePathname();
  const current = mainNav.find(
    (item) =>
      pathname === item.href || pathname.startsWith(`${item.href}/`),
  );

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>{current?.title ?? "홈"}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="size-8 rounded-full p-0"
              aria-label="사용자 메뉴"
            >
              <Avatar className="size-8">
                <AvatarImage src="" alt="사용자" />
                <AvatarFallback>SK</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">관리자</span>
                <span className="text-xs text-muted-foreground">
                  admin@example.com
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserIcon className="size-4" />
              프로필
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive">
              <LogOut className="size-4" />
              로그아웃
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
