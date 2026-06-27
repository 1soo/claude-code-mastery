import type { EventSummary } from "@/lib/types";

export function RsvpCounterSummary({ summary }: { summary: EventSummary }) {
  return (
    <div className="flex items-baseline gap-1.5 text-sm">
      <span className="text-muted-foreground">응답자</span>
      <span className="font-semibold">{summary.goingCount}명</span>
      <span className="text-muted-foreground">·</span>
      <span className="text-muted-foreground">총 참석 인원</span>
      <span className="font-semibold">{summary.totalAttendees}명</span>
    </div>
  );
}
