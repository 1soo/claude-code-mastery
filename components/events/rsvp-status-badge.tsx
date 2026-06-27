import { Badge } from "@/components/ui/badge";
import type { RsvpStatus } from "@/lib/types";

const STATUS_CONFIG: Record<
  RsvpStatus,
  { label: string; variant: "default" | "destructive" | "secondary" }
> = {
  going: { label: "참석", variant: "default" },
  not_going: { label: "불참", variant: "destructive" },
  maybe: { label: "미정", variant: "secondary" },
};

export function RsvpStatusBadge({ status }: { status: RsvpStatus }) {
  const { label, variant } = STATUS_CONFIG[status];
  return <Badge variant={variant}>{label}</Badge>;
}
