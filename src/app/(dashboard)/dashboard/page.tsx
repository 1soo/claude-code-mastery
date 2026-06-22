import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { RecentSales } from "@/components/dashboard/recent-sales";
import { stats } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "대시보드",
};

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="대시보드"
        description="서비스 핵심 지표를 한눈에 확인하세요."
      />

      {/* 통계 카드 그리드 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* 차트 + 최근 판매 */}
      <div className="grid gap-4 lg:grid-cols-7">
        <OverviewChart />
        <RecentSales />
      </div>
    </>
  );
}
