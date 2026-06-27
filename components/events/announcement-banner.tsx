import { Megaphone } from "lucide-react";

import type { Announcement } from "@/lib/types";

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function AnnouncementBanner({
  announcement,
}: {
  announcement: Announcement | null;
}) {
  if (!announcement) return null;

  return (
    <div className="flex gap-3 rounded-lg border bg-muted/50 p-4">
      <Megaphone className="mt-0.5 size-5 shrink-0 text-primary" />
      <div className="space-y-1">
        <p className="text-sm">{announcement.body}</p>
        <p className="text-xs text-muted-foreground">
          {dateFormatter.format(new Date(announcement.created_at))}
        </p>
      </div>
    </div>
  );
}
