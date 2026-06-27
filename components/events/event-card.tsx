import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RsvpCounterSummary } from "@/components/events/rsvp-counter-summary";
import type { Event, EventSummary } from "@/lib/types";

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "long",
  timeStyle: "short",
});

export function EventCard({
  event,
  summary,
}: {
  event: Event;
  summary: EventSummary;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Link href={`/events/${event.id}`} className="hover:underline">
            {event.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 shrink-0" />
          <span>{dateFormatter.format(new Date(event.starts_at))}</span>
        </div>
        {event.location && (
          <div className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0" />
            <span>{event.location}</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <RsvpCounterSummary summary={summary} />
      </CardFooter>
    </Card>
  );
}
