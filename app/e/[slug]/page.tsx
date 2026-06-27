import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, Users } from "lucide-react";

import { AnnouncementBanner } from "@/components/events/announcement-banner";
import { AttendeeList } from "@/components/events/attendee-list";
import { RsvpCounterSummary } from "@/components/events/rsvp-counter-summary";
import { Separator } from "@/components/ui/separator";
import { getEventDetailBySlug, getLatestAnnouncement } from "@/lib/mock-data";

import { RsvpForm } from "./rsvp-form";

const dateTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "long",
  timeStyle: "short",
});

const timeFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeStyle: "short",
});

export default function PublicRsvpPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <main className="mx-auto w-full max-w-xl px-4 py-8">
      <Suspense
        fallback={<p className="text-muted-foreground">불러오는 중…</p>}
      >
        <RsvpContent params={params} />
      </Suspense>
    </main>
  );
}

async function RsvpContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const detail = getEventDetailBySlug(slug);
  if (!detail) notFound();

  const { event, rsvps, summary } = detail;
  const announcement = getLatestAnnouncement(event.id);

  return (
    <div className="space-y-8">
      {/* 1. 이벤트 정보 */}
      <header className="space-y-3">
        <h1 className="text-2xl font-bold">{event.title}</h1>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <CalendarDays className="mt-0.5 size-4 shrink-0" />
            <span>
              {dateTimeFormatter.format(new Date(event.starts_at))}
              {" ~ "}
              {timeFormatter.format(new Date(event.ends_at))}
            </span>
          </div>
          {event.location && (
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              <span>{event.location}</span>
            </div>
          )}
          {event.capacity !== null && (
            <div className="flex items-start gap-2">
              <Users className="mt-0.5 size-4 shrink-0" />
              <span>정원 {event.capacity}명</span>
            </div>
          )}
        </div>
        {event.description && <p className="text-sm">{event.description}</p>}
      </header>

      {/* 2. 최신 공지 */}
      <AnnouncementBanner announcement={announcement} />

      {/* 3. RSVP 폼 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">참석 응답</h2>
        <RsvpForm />
      </section>

      <Separator />

      {/* 4. 참석 현황 */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">참석 현황</h2>
        <RsvpCounterSummary summary={summary} />
        <AttendeeList rsvps={rsvps} />
      </section>
    </div>
  );
}
