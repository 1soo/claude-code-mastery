// ⚠️ Phase 3에서 제거 대상 — 실제 Supabase 데이터로 교체

import type { Announcement, Event, EventSummary, Rsvp } from "@/lib/types";

const HOST_ID = "host-0001";

export const mockEvents: Event[] = [
  {
    id: "evt-001",
    host_id: HOST_ID,
    slug: "summer-bbq-2026",
    title: "여름 한강 바베큐 모임",
    starts_at: "2026-07-18T11:00:00+09:00",
    ends_at: "2026-07-18T15:00:00+09:00",
    location: "여의도 한강공원 2번 그늘막",
    capacity: 20,
    description: "고기는 준비됩니다. 음료만 각자 챙겨오세요!",
  },
  {
    id: "evt-002",
    host_id: HOST_ID,
    slug: "board-game-night",
    title: "보드게임 번개",
    starts_at: "2026-07-02T19:30:00+09:00",
    ends_at: "2026-07-02T22:30:00+09:00",
    location: null,
    capacity: null,
    description: null,
  },
  {
    id: "evt-003",
    host_id: HOST_ID,
    slug: "spring-picnic-2026",
    title: "봄 소풍 (지난 모임)",
    starts_at: "2026-04-05T10:00:00+09:00",
    ends_at: "2026-04-05T14:00:00+09:00",
    location: "올림픽공원 들꽃마루",
    capacity: 12,
    description: "벚꽃 보러 갔던 봄 소풍이에요.",
  },
];

export const mockRsvps: Rsvp[] = [
  // evt-001
  {
    id: "rsvp-001",
    event_id: "evt-001",
    guest_token: "tok-aaa",
    name: "민트초코러버",
    status: "going",
    party_size: 2,
    created_at: "2026-06-20T09:12:00+09:00",
  },
  {
    id: "rsvp-002",
    event_id: "evt-001",
    guest_token: "tok-bbb",
    name: "한강불주먹",
    status: "going",
    party_size: 3,
    created_at: "2026-06-21T13:45:00+09:00",
  },
  {
    id: "rsvp-003",
    event_id: "evt-001",
    guest_token: "tok-ccc",
    name: "고기파괴자",
    status: "maybe",
    party_size: 1,
    created_at: "2026-06-22T18:05:00+09:00",
  },
  {
    id: "rsvp-004",
    event_id: "evt-001",
    guest_token: "tok-ddd",
    name: "주말집순이",
    status: "not_going",
    party_size: 1,
    created_at: "2026-06-23T08:30:00+09:00",
  },
  // evt-002
  {
    id: "rsvp-005",
    event_id: "evt-002",
    guest_token: "tok-eee",
    name: "전략가김씨",
    status: "going",
    party_size: 1,
    created_at: "2026-06-25T21:00:00+09:00",
  },
  {
    id: "rsvp-006",
    event_id: "evt-002",
    guest_token: "tok-fff",
    name: "주사위요정",
    status: "going",
    party_size: 2,
    created_at: "2026-06-26T10:15:00+09:00",
  },
  {
    id: "rsvp-007",
    event_id: "evt-002",
    guest_token: "tok-ggg",
    name: "야근중",
    status: "maybe",
    party_size: 1,
    created_at: "2026-06-26T22:40:00+09:00",
  },
  // evt-003 (지난 모임)
  {
    id: "rsvp-008",
    event_id: "evt-003",
    guest_token: "tok-hhh",
    name: "벚꽃엔딩",
    status: "going",
    party_size: 2,
    created_at: "2026-03-28T11:20:00+09:00",
  },
  {
    id: "rsvp-009",
    event_id: "evt-003",
    guest_token: "tok-iii",
    name: "돗자리장인",
    status: "going",
    party_size: 3,
    created_at: "2026-03-30T16:50:00+09:00",
  },
];

export const mockAnnouncements: Announcement[] = [
  {
    id: "ann-001",
    event_id: "evt-001",
    body: "비 예보가 있어 그늘막 위치를 2번으로 변경했습니다.",
    created_at: "2026-06-24T09:00:00+09:00",
  },
  {
    id: "ann-002",
    event_id: "evt-001",
    body: "주차 자리가 협소하니 대중교통 이용 부탁드려요.",
    created_at: "2026-06-26T12:30:00+09:00",
  },
  {
    id: "ann-003",
    event_id: "evt-003",
    body: "즐거운 소풍이었습니다. 다음에 또 만나요!",
    created_at: "2026-04-05T15:00:00+09:00",
  },
];

/** status별 응답 건수와 총 참석 인원(동반 합산)을 계산하는 순수 헬퍼. */
export function summarize(rsvps: Rsvp[]): EventSummary {
  return rsvps.reduce<EventSummary>(
    (acc, rsvp) => {
      if (rsvp.status === "going") {
        acc.goingCount += 1;
        acc.totalAttendees += rsvp.party_size;
      } else if (rsvp.status === "not_going") {
        acc.notGoingCount += 1;
      } else {
        acc.maybeCount += 1;
      }
      return acc;
    },
    { goingCount: 0, notGoingCount: 0, maybeCount: 0, totalAttendees: 0 },
  );
}

export function getEventById(id: string): Event | undefined {
  return mockEvents.find((e) => e.id === id);
}

export function getEventBySlug(slug: string): Event | undefined {
  return mockEvents.find((e) => e.slug === slug);
}

export function getRsvpsByEventId(eventId: string): Rsvp[] {
  return mockRsvps.filter((r) => r.event_id === eventId);
}

export function getAnnouncementsByEventId(eventId: string): Announcement[] {
  return mockAnnouncements
    .filter((a) => a.event_id === eventId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

/** 최신 공지 1건 (없으면 null). */
export function getLatestAnnouncement(eventId: string): Announcement | null {
  return getAnnouncementsByEventId(eventId)[0] ?? null;
}

export interface EventDetail {
  event: Event;
  rsvps: Rsvp[];
  announcements: Announcement[];
  summary: EventSummary;
}

/** slug로 이벤트 + rsvps + announcements + 집계를 한 번에 조회 (없으면 null). */
export function getEventDetailBySlug(slug: string): EventDetail | null {
  const event = getEventBySlug(slug);
  if (!event) return null;
  const rsvps = getRsvpsByEventId(event.id);
  return {
    event,
    rsvps,
    announcements: getAnnouncementsByEventId(event.id),
    summary: summarize(rsvps),
  };
}
