import type { RsvpStatus } from "@/lib/types";

// submit_rsvp / get_my_rsvp RPC가 반환하는 본인 응답 (guest_token 제외).
export interface MyRsvp {
  id: string;
  name: string;
  status: RsvpStatus;
  party_size: number; // 본인 포함
  created_at: string;
}
