import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock, MapPin, Megaphone, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RsvpCounterSummary } from "@/components/events/rsvp-counter-summary";
import { RsvpStatusBadge } from "@/components/events/rsvp-status-badge";
import { ShareLinkButton } from "@/components/events/share-link-button";
import {
  getAnnouncementsByEventId,
  getEventById,
  getRsvpsByEventId,
  summarize,
} from "@/lib/mock-data";

import { AnnouncementComposer } from "./announcement-composer";

const dateTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "long",
  timeStyle: "short",
});

const shortDateTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="mx-auto max-w-5xl p-5 pb-16">
      <Suspense fallback={<h1 className="text-2xl font-bold">이벤트 상세</h1>}>
        <EventDetailContent params={params} />
      </Suspense>
    </div>
  );
}

async function EventDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = getEventById(id);
  if (!event) notFound();

  const rsvps = getRsvpsByEventId(event.id);
  const announcements = getAnnouncementsByEventId(event.id);
  const summary = summarize(rsvps);

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <header className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{event.title}</h1>
            <div className="space-y-1 text-sm text-muted-foreground">
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
          <div className="flex shrink-0 gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/events/${event.id}/edit`}>
                <Pencil className="size-4" />
                수정
              </Link>
            </Button>
            <ShareLinkButton url={`/e/${event.slug}`} className="h-9" />
          </div>
        </div>
        {event.description && (
          <p className="text-sm text-foreground/80">{event.description}</p>
        )}
      </header>

      {/* 집계 요약 */}
      <section className="space-y-3">
        <RsvpCounterSummary summary={summary} />
        <div className="grid grid-cols-3 gap-3">
          <SummaryCard label="참석" value={summary.goingCount} />
          <SummaryCard label="미정" value={summary.maybeCount} />
          <SummaryCard label="불참" value={summary.notGoingCount} />
        </div>
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

      {/* 공지 */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">공지</h2>
          <AnnouncementComposer />
        </div>
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

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}명</p>
      </CardContent>
    </Card>
  );
}
