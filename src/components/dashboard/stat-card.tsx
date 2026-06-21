import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Stat } from "@/lib/mock-data";

// 단일 통계 카드: 제목/값/증감률/아이콘
export function StatCard({ title, value, change, icon: Icon }: Stat) {
  const isPositive = change >= 0;

  return (
    <Card>
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums">
          {value}
        </CardTitle>
        <div className="absolute right-6 top-6 text-muted-foreground">
          <Icon className="size-5" />
        </div>
      </CardHeader>
      <CardContent>
        <p
          className={cn(
            "flex items-center gap-1 text-xs font-medium",
            isPositive ? "text-emerald-600 dark:text-emerald-500" : "text-destructive",
          )}
        >
          {isPositive ? (
            <ArrowUpRight className="size-3.5" />
          ) : (
            <ArrowDownRight className="size-3.5" />
          )}
          {isPositive ? "+" : ""}
          {change}%
          <span className="text-muted-foreground">전월 대비</span>
        </p>
      </CardContent>
    </Card>
  );
}
