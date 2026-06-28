import { RsvpStatusBadge } from "@/components/events/rsvp-status-badge";
import type { Rsvp, RsvpStatus } from "@/lib/types";

const GROUP_ORDER: RsvpStatus[] = ["going", "maybe", "not_going"];

export function AttendeeList({ rsvps }: { rsvps: Rsvp[] }) {
  if (rsvps.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        아직 응답한 사람이 없어요.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {GROUP_ORDER.map((status) => {
        const group = rsvps.filter((r) => r.status === status);
        if (group.length === 0) return null;
        return (
          <div key={status} className="space-y-2">
            <div className="flex items-center gap-2">
              <RsvpStatusBadge status={status} />
              <span className="text-xs text-muted-foreground">
                {group.length}명
              </span>
            </div>
            <ul className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
              {group.map((rsvp) => (
                <li key={rsvp.id}>
                  {rsvp.name}
                  {rsvp.party_size > 1 && (
                    <span className="text-muted-foreground">
                      {" "}
                      +{rsvp.party_size - 1}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
