import type { Metadata } from "next";
import {
  ActivityIcon,
  DollarSignIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "대시보드",
};

// 통계 카드 데이터
const stats = [
  {
    label: "총 매출",
    value: "₩45,231,890",
    delta: "+20.1%",
    icon: DollarSignIcon,
  },
  { label: "신규 사용자", value: "+2,350", delta: "+18.2%", icon: UsersIcon },
  { label: "활성 세션", value: "12,234", delta: "+4.5%", icon: ActivityIcon },
  { label: "전환율", value: "3.24%", delta: "+1.1%", icon: TrendingUpIcon },
];

// 최근 활동 데이터
const activities = [
  { name: "김민준", action: "신규 주문을 생성했습니다", time: "방금 전" },
  { name: "이서연", action: "프로필을 업데이트했습니다", time: "12분 전" },
  { name: "박지호", action: "결제를 완료했습니다", time: "1시간 전" },
  { name: "최예은", action: "문의를 등록했습니다", time: "3시간 전" },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">대시보드</h1>
        <p className="text-sm text-muted-foreground">
          서비스 핵심 지표를 한눈에 확인하세요.
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardDescription className="flex items-center justify-between">
                {stat.label}
                <stat.icon className="size-4 text-muted-foreground" />
              </CardDescription>
              <CardTitle className="text-2xl">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary" className="text-emerald-600">
                {stat.delta}
              </Badge>
              <span className="ml-2 text-xs text-muted-foreground">
                지난달 대비
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 탭 영역 */}
      <div className="mt-8">
        <Tabs defaultValue="activity">
          <TabsList>
            <TabsTrigger value="activity">최근 활동</TabsTrigger>
            <TabsTrigger value="overview">개요</TabsTrigger>
          </TabsList>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>최근 활동</CardTitle>
                <CardDescription>
                  사용자들의 최근 활동 내역입니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-1">
                {activities.map((activity, index) => (
                  <div key={activity.name}>
                    {index > 0 && <Separator className="my-1" />}
                    <div className="flex items-center gap-3 py-2">
                      <Avatar>
                        <AvatarImage src="" alt={activity.name} />
                        <AvatarFallback>
                          {activity.name.slice(0, 1)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.action}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {activity.time}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>개요</CardTitle>
                <CardDescription>
                  이번 분기 주요 지표 요약입니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                매출과 사용자 수가 꾸준히 증가하고 있으며, 전환율 또한 안정적인
                상승세를 보이고 있습니다.
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
