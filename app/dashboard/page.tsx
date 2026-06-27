import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/events/event-card";
import { getRsvpsByEventId, mockEvents, summarize } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <div className="p-5 pb-24">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">내 이벤트</h1>
        <Button asChild size="sm">
          <Link href="/events/new">
            <Plus className="size-4" />새 이벤트
          </Link>
        </Button>
      </div>

      <Suspense
        fallback={<p className="text-muted-foreground">불러오는 중…</p>}
      >
        <EventSections />
      </Suspense>

      <Button
        asChild
        size="icon"
        className="fixed bottom-6 right-6 size-14 rounded-full shadow-lg"
      >
        <Link href="/events/new" aria-label="새 이벤트 만들기">
          <Plus className="size-6" />
        </Link>
      </Button>
    </div>
  );
}

async function EventSections() {
  await connection();
  const now = Date.now();
  const events = mockEvents.map((event) => ({
    event,
    summary: summarize(getRsvpsByEventId(event.id)),
    isPast: new Date(event.ends_at).getTime() < now,
  }));

  const upcoming = events.filter((e) => !e.isPast);
  const past = events.filter((e) => e.isPast);

  if (events.length === 0) {
    return (
      <p className="text-muted-foreground">
        아직 만든 이벤트가 없습니다. 새 이벤트를 만들어 보세요.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {upcoming.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">
            예정된 이벤트
          </h2>
          {upcoming.map(({ event, summary }) => (
            <EventCard key={event.id} event={event} summary={summary} />
          ))}
        </section>
      )}

      {past.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">
            지난 이벤트
          </h2>
          {past.map(({ event, summary }) => (
            <EventCard key={event.id} event={event} summary={summary} />
          ))}
        </section>
      )}
    </div>
  );
}
