import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { recentSales } from "@/lib/mock-data";

// 금액 포맷터 (KRW)
const currency = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
  maximumFractionDigits: 0,
});

// 최근 판매 목록 위젯
export function RecentSales() {
  return (
    <Card className="col-span-full lg:col-span-3">
      <CardHeader>
        <CardTitle>최근 판매</CardTitle>
        <CardDescription>이번 달 {recentSales.length}건의 판매</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {recentSales.map((sale) => (
          <div key={sale.id} className="flex items-center gap-4">
            <Avatar className="size-9">
              <AvatarFallback>{sale.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-0.5">
              <p className="text-sm font-medium leading-none">{sale.name}</p>
              <p className="text-xs text-muted-foreground">{sale.email}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium tabular-nums">
                {currency.format(sale.amount)}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(parseISO(sale.date), "M월 d일", { locale: ko })}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
