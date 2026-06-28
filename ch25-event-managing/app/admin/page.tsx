import { Suspense } from "react";
import Link from "next/link";
import { CalendarDays, ShieldCheck, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RsvpCounterSummary } from "@/components/events/rsvp-counter-summary";
import { EmptyState } from "@/components/events/empty-state";
import { getAllEventsAdmin, getGlobalSummary } from "@/lib/queries";

const dateTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Asia/Seoul",
});

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-5xl p-5 pb-16">
      <header className="mb-6 flex items-center gap-2">
        <h1 className="text-2xl font-bold">관리자 대시보드</h1>
        <Badge variant="secondary" className="gap-1">
          <ShieldCheck className="size-3.5" />
          관리자
        </Badge>
      </header>

      <Suspense
        fallback={<p className="text-muted-foreground">불러오는 중…</p>}
      >
        <AdminDashboardContent />
      </Suspense>
    </div>
  );
}

async function AdminDashboardContent() {
  const [summary, events] = await Promise.all([
    getGlobalSummary(),
    getAllEventsAdmin(),
  ]);

  return (
    <div className="space-y-8">
      {/* 전체 집계 */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="이벤트 수" value={summary.eventCount} unit="개" />
        <StatCard
          label="총 응답자"
          value={summary.totalRespondents}
          unit="명"
        />
        <StatCard
          label="총 참석 인원"
          value={summary.totalAttendees}
          unit="명"
        />
      </section>

      {/* 모든 주최자의 이벤트 목록 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">전체 이벤트</h2>
        {events.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="등록된 이벤트가 없습니다"
            description="주최자가 이벤트를 만들면 여기에 표시됩니다."
          />
        ) : (
          <ul className="space-y-3">
            {events.map(({ event, hostName, summary: eventSummary }) => (
              <li key={event.id}>
                <Link href={`/admin/events/${event.id}`} className="block">
                  <Card className="transition-colors hover:bg-muted/50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="size-4 shrink-0" />
                        <span>{hostName}</span>
                      </div>
                      <CardTitle>{event.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays className="size-4 shrink-0" />
                        <span>
                          {dateTimeFormatter.format(new Date(event.starts_at))}
                        </span>
                      </div>
                      <RsvpCounterSummary summary={eventSummary} />
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  unit,
}: {
  label: string;
  value: number;
  unit: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">
          {value}
          {unit}
        </p>
      </CardContent>
    </Card>
  );
}
