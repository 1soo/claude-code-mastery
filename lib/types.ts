// 도메인 타입 정의 (Phase 1).
// Phase 3에서 `lib/database.types.ts`를 재생성한 후, 이 도메인 타입과
// 실제 DB 스키마(컬럼명/nullable 여부 등)의 정합성을 반드시 맞출 것.

export type RsvpStatus = "going" | "not_going" | "maybe";

export interface Event {
  id: string;
  host_id: string;
  slug: string;
  title: string;
  starts_at: string; // ISO 8601
  ends_at: string; // ISO 8601
  location: string | null;
  capacity: number | null;
  description: string | null;
}

export interface Rsvp {
  id: string;
  event_id: string;
  guest_token: string;
  name: string;
  status: RsvpStatus;
  party_size: number;
  created_at: string; // ISO 8601
}

export interface Announcement {
  id: string;
  event_id: string;
  body: string;
  created_at: string; // ISO 8601
}

export interface EventSummary {
  goingCount: number;
  notGoingCount: number;
  maybeCount: number;
  totalAttendees: number;
}
