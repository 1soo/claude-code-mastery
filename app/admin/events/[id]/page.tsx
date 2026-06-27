import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  CalendarClock,
  MapPin,
  Megaphone,
  ShieldCheck,
  User,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AttendeeList } from "@/components/events/attendee-list";
import { RsvpCounterSummary } from "@/components/events/rsvp-counter-summary";
import { RsvpStatusBadge } from "@/components/events/rsvp-status-badge";
import { getEventDetailByIdAdmin } from "@/lib/queries";

const dateTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "long",
  timeStyle: "short",
});

const shortDateTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default function AdminEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="mx-auto max-w-5xl p-5 pb-16">
      <Suspense fallback={<h1 className="text-2xl font-bold">이벤트 상세</h1>}>
        <AdminEventDetailContent params={params} />
      </Suspense>
    </div>
  );
}

async function AdminEventDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getEventDetailByIdAdmin(id);
  if (!detail) notFound();

  const { event, hostName, rsvps, announcements, summary } = detail;

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <header className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <ShieldCheck className="size-3.5" />
              관리자 · 읽기 전용
            </Badge>
          </div>
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p className="flex items-center gap-1.5">
              <User className="size-4 shrink-0" />
              <span>주최자 {hostName}</span>
            </p>
            <p className="flex items-center gap-1.5">
              <CalendarClock className="size-4 shrink-0" />
              <span>
                {dateTimeFormatter.format(new Date(event.starts_at))}
                {" ~ "}
                {shortDateTimeFormatter.format(new Date(event.ends_at))}
              </span>
            </p>
            {event.location && (
              <p className="flex items-center gap-1.5">
                <MapPin className="size-4 shrink-0" />
                <span>{event.location}</span>
              </p>
            )}
          </div>
        </div>
        {event.description && (
          <p className="text-sm text-foreground/80">{event.description}</p>
        )}
      </header>

      {/* 집계 요약 */}
      <section>
        <RsvpCounterSummary summary={summary} />
      </section>

      <Separator />

      {/* 명단 테이블 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">
          참석자 명단{" "}
          <span className="text-sm font-normal text-muted-foreground">
            ({rsvps.length}명)
          </span>
        </h2>
        {rsvps.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            아직 응답한 사람이 없어요.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>동반 인원</TableHead>
                <TableHead>응답 시각</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rsvps.map((rsvp) => (
                <TableRow key={rsvp.id}>
                  <TableCell className="font-medium">{rsvp.name}</TableCell>
                  <TableCell>
                    <RsvpStatusBadge status={rsvp.status} />
                  </TableCell>
                  <TableCell>{rsvp.party_size}명</TableCell>
                  <TableCell className="text-muted-foreground">
                    {shortDateTimeFormatter.format(new Date(rsvp.created_at))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>

      <Separator />

      {/* 상태별 명단 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">상태별 명단</h2>
        <AttendeeList rsvps={rsvps} />
      </section>

      <Separator />

      {/* 공지 (읽기 전용 타임라인) */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">공지</h2>
        {announcements.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            아직 등록된 공지가 없습니다.
          </p>
        ) : (
          <ul className="space-y-3">
            {announcements.map((announcement) => (
              <li
                key={announcement.id}
                className="flex gap-3 rounded-lg border bg-muted/50 p-4"
              >
                <Megaphone className="mt-0.5 size-5 shrink-0 text-primary" />
                <div className="space-y-1">
                  <p className="text-sm">{announcement.body}</p>
                  <p className="text-xs text-muted-foreground">
                    {shortDateTimeFormatter.format(
                      new Date(announcement.created_at),
                    )}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
