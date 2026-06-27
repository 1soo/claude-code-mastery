import { Suspense } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, Users } from "lucide-react";

import { AnnouncementBanner } from "@/components/events/announcement-banner";
import { AttendeeList } from "@/components/events/attendee-list";
import { RsvpCounterSummary } from "@/components/events/rsvp-counter-summary";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/server";
import { summarize } from "@/lib/queries";
import type { Announcement, Event, Rsvp } from "@/lib/types";

import { RsvpForm } from "./rsvp-form";
import { submitRsvp } from "./actions";
import type { MyRsvp } from "./types";

// get_public_event RPC 반환 형태 (event는 host_id 제거, rsvps는 guest_token 제외).
interface PublicEvent {
  event: Omit<Event, "host_id">;
  announcements: Announcement[];
  rsvps: Omit<Rsvp, "event_id" | "guest_token">[];
}

const dateTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "long",
  timeStyle: "short",
});

const timeFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeStyle: "short",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_public_event", {
    p_slug: slug,
  });
  if (error || !data) {
    return { title: "이벤트를 찾을 수 없습니다" };
  }

  const { event } = data as unknown as PublicEvent;
  const title = event.title;
  const description = event.description ?? "모임 참석 여부를 알려주세요.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

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
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_public_event", {
    p_slug: slug,
  });
  if (error || !data) notFound();

  const { event, announcements, rsvps } = data as unknown as PublicEvent;
  const announcement = announcements[0] ?? null;
  const summary = summarize(rsvps);

  // 정원 마감 여부와 잔여 자리 (capacity가 null이면 무제한 → 마감 없음).
  const isFull =
    event.capacity !== null && summary.totalAttendees >= event.capacity;
  const remaining =
    event.capacity !== null
      ? Math.max(0, event.capacity - summary.totalAttendees)
      : null;

  // guest_token 쿠키가 있으면 기존 응답을 조회해 폼을 prefill.
  let initialRsvp: MyRsvp | null = null;
  const guestToken = (await cookies()).get("guest_token")?.value;
  if (guestToken) {
    const { data: mine } = await supabase.rpc("get_my_rsvp", {
      p_slug: slug,
      p_guest_token: guestToken,
    });
    if (mine) initialRsvp = mine as unknown as MyRsvp;
  }

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
        <RsvpForm
          slug={slug}
          submitRsvpAction={submitRsvp}
          initialRsvp={initialRsvp}
          isFull={isFull}
          remaining={remaining}
        />
      </section>

      <Separator />

      {/* 4. 참석 현황 */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">참석 현황</h2>
        <RsvpCounterSummary summary={summary} />
        <AttendeeList rsvps={rsvps as Rsvp[]} />
      </section>
    </div>
  );
}
