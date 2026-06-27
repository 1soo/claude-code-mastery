import { ThemeToggle } from "@/components/common/theme-toggle";
import { MobileNav } from "@/components/layout/mobile-nav";

// 어드민 셸 상단 헤더 (서버 컴포넌트).
// 좌측: 모바일 햄버거(MobileNav — 클라이언트 컴포넌트, md:hidden) + 정적 브레드크럼.
// 우측: ThemeToggle.
// 클라이언트 상태(드로어 개폐)는 MobileNav 내부에서만 처리 — 헤더 자체는 RSC 유지.
export function AdminHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4 md:px-6">
      {/* 모바일 햄버거 버튼 (MobileNav 내부에서 md:hidden 처리) */}
      <MobileNav />

      {/* 정적 브레드크럼 — 현재 섹션 컨텍스트 표시 */}
      <nav aria-label="브레드크럼" className="flex items-center gap-1.5 text-sm">
        <span className="font-medium text-foreground">어드민</span>
        <span className="text-muted-foreground" aria-hidden="true">/</span>
        <span className="text-muted-foreground">견적 관리</span>
      </nav>

      {/* 우측 액션 영역 */}
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
