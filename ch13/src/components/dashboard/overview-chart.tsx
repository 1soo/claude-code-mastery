"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { monthlyData } from "@/lib/mock-data";

// 차트 색상/라벨 설정 (CSS 변수 --chart-* 사용 → 다크모드 자동 대응)
const chartConfig = {
  revenue: { label: "매출", color: "var(--chart-1)" },
  orders: { label: "주문", color: "var(--chart-2)" },
} satisfies ChartConfig;

// 월별 매출/주문 막대 차트 (recharts)
export function OverviewChart() {
  return (
    <Card className="col-span-full lg:col-span-4">
      <CardHeader>
        <CardTitle>매출 개요</CardTitle>
        <CardDescription>최근 7개월 매출 및 주문 추이</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart accessibilityLayer data={monthlyData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            {/* 매출(좌)·주문(우) 스케일이 약 10배 차이나므로 축을 분리해 두 시리즈를 모두 보이게 함 */}
            <YAxis
              yAxisId="revenue"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={40}
            />
            <YAxis
              yAxisId="orders"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={40}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              yAxisId="revenue"
              dataKey="revenue"
              fill="var(--color-revenue)"
              radius={4}
            />
            <Bar
              yAxisId="orders"
              dataKey="orders"
              fill="var(--color-orders)"
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
