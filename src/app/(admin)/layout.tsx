import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminHeader } from "@/components/layout/admin-header";

// 어드민 셸 레이아웃 (RSC).
// 좌측 고정 사이드바(데스크톱) + 우측 세로 스택(헤더 + main).
// h-dvh + overflow-hidden으로 셸 자체는 뷰포트 고정, main 영역만 스크롤.
// 루트 layout 하위 중첩이므로 Providers(테마/툴팁/토스트) 컨텍스트를 자동 상속한다.
export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 뷰포트 높이 고정, 사이드바+본문 가로 배치
    <div className="flex h-dvh overflow-hidden">
      {/* 좌측 고정 사이드바 (md 이상에서만 표시) */}
      <AdminSidebar />

      {/* 우측 세로 스택: 헤더 + 스크롤 가능한 본문 */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader />
        {/* main: 콘텐츠가 길어져도 셸을 벗어나지 않고 내부 스크롤 */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
