"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { mainNav, siteConfig } from "@/config/site";

// 어드민 셸 좌측 사이드바 (데스크톱 고정, md:flex / 모바일은 MobileNav 드로어 사용).
// mainNav 단일 소스를 매핑해 항목을 렌더하고, usePathname으로 현재 경로를 활성 강조한다.
// sidebar CSS 변수(bg-sidebar, text-sidebar-foreground 등) 활용 — 임의 색상 하드코딩 없음.
export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        // 모바일 숨김, 데스크톱 고정 사이드바
        "hidden md:flex",
        "w-64 shrink-0 flex-col",
        // sidebar 전용 CSS 변수 토큰 사용
        "border-r bg-sidebar text-sidebar-foreground",
      )}
      aria-label="어드민 사이드바"
    >
      {/* ── 브랜드 영역 ── */}
      <div className="flex h-14 shrink-0 items-center border-b border-sidebar-border px-5">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight hover:opacity-80 transition-opacity"
        >
          {/* TODO: 로고 이미지 추가 시 여기에 삽입 */}
          <span>{siteConfig.name}</span>
        </Link>
      </div>

      {/* ── 네비게이션 ── */}
      <nav
        className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3"
        aria-label="어드민 메뉴"
      >
        {/* 메뉴 그룹 레이블 */}
        <p className="mb-1 px-3 text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider select-none">
          메뉴
        </p>

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
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? // 활성 상태: sidebar-accent 배경 + sidebar-accent-foreground 텍스트
                    "bg-sidebar-accent text-sidebar-accent-foreground"
                  : // 비활성: 흐린 텍스트, hover 시 accent/50
                    "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className={cn(
                  "size-4 shrink-0 transition-colors",
                  isActive
                    ? "text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/50 group-hover:text-sidebar-accent-foreground",
                )}
              />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── 사이드바 하단 여백 ── */}
      <div className="h-4 shrink-0" />
    </aside>
  );
}
