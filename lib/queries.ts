// 서버 전용 데이터 접근 계층 (Phase 3.3).
// 클라이언트에서 테이블에 직접 접근하지 말고, 읽기는 이 모듈을 통해서만 한다.

import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Announcement, Event, EventSummary, Rsvp } from "@/lib/types";

/** status별 응답 건수와 총 참석 인원(going의 동반 합산)을 계산하는 순수 헬퍼. */
export function summarize(rsvps: Pick<Rsvp, "status" | "party_size">[]): EventSummary {
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

export interface EventWithSummary {
  event: Event;
  summary: EventSummary;
}

/**
 * 로그인한 호스트 본인의 이벤트 목록 + 각 이벤트의 RSVP 집계.
 * host_id 필터는 RLS(host_id = auth.uid())가 처리한다.
 * rsvps는 event_id IN (...)으로 한 번에 가져와 그룹핑(N+1 회피).
 */
export async function getMyEvents(): Promise<EventWithSummary[]> {
  const supabase = await createClient();

  const { data: events, error } = await supabase
    .from("events")
    .select("id, host_id, slug, title, starts_at, ends_at, location, capacity, description")
    .order("starts_at", { ascending: true });

  if (error) throw error;
  if (!events || events.length === 0) return [];

  const eventIds = events.map((e) => e.id);
  const { data: rsvps, error: rsvpError } = await supabase
    .from("rsvps")
    .select("event_id, status, party_size")
    .in("event_id", eventIds);

  if (rsvpError) throw rsvpError;

  const byEvent = new Map<string, { status: Rsvp["status"]; party_size: number }[]>();
  for (const rsvp of rsvps ?? []) {
    const list = byEvent.get(rsvp.event_id);
    if (list) list.push(rsvp);
    else byEvent.set(rsvp.event_id, [rsvp]);
  }

  return events.map((event) => ({
    event,
    summary: summarize(byEvent.get(event.id) ?? []),
  }));
}

export interface EventDetail {
  event: Event;
  rsvps: Rsvp[];
  announcements: Announcement[];
  summary: EventSummary;
}

/** 호스트 상세 페이지용: 이벤트 단건 + rsvps + announcements(최신순) + 집계. 없으면 null. */
export async function getEventForHost(id: string): Promise<EventDetail | null> {
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("id, host_id, slug, title, starts_at, ends_at, location, capacity, description")
    .eq("id", id)
    .maybeSingle();

  if (!event) return null;

  const [{ data: rsvps }, { data: announcements }] = await Promise.all([
    supabase
      .from("rsvps")
      .select("id, event_id, guest_token, name, status, party_size, created_at")
      .eq("event_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("announcements")
      .select("id, event_id, body, created_at")
      .eq("event_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const rsvpList = rsvps ?? [];

  return {
    event,
    rsvps: rsvpList,
    announcements: announcements ?? [],
    summary: summarize(rsvpList),
  };
}

/** 수정 폼 prefill용: 이벤트 단건. 없으면 null. */
export async function getEventForEdit(id: string): Promise<Event | null> {
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("id, host_id, slug, title, starts_at, ends_at, location, capacity, description")
    .eq("id", id)
    .maybeSingle();

  return event ?? null;
}

// ── 관리자(admin) 전용 쿼리 ──────────────────────────────────────────────
// 모든 주최자의 이벤트를 읽기 전용으로 집계/열람. RLS의 is_admin() 정책이
// admin에게만 전체 SELECT를 허용한다.

export interface AdminEventListItem {
  event: Event;
  hostName: string;
  summary: EventSummary;
}

/**
 * 모든 이벤트 + 주최자 표시명(profiles.full_name) + RSVP 집계.
 * profiles / rsvps는 각각 IN(...)으로 한 번에 가져와 그룹핑(N+1 회피).
 */
export async function getAllEventsAdmin(): Promise<AdminEventListItem[]> {
  const supabase = await createClient();

  const { data: events, error } = await supabase
    .from("events")
    .select("id, host_id, slug, title, starts_at, ends_at, location, capacity, description")
    .order("starts_at", { ascending: true });

  if (error) throw error;
  if (!events || events.length === 0) return [];

  const hostIds = [...new Set(events.map((e) => e.host_id))];
  const eventIds = events.map((e) => e.id);

  const [{ data: profiles }, { data: rsvps }] = await Promise.all([
    supabase.from("profiles").select("id, full_name").in("id", hostIds),
    supabase.from("rsvps").select("event_id, status, party_size").in("event_id", eventIds),
  ]);

  const nameById = new Map<string, string>();
  for (const profile of profiles ?? []) {
    nameById.set(profile.id, profile.full_name ?? profile.id);
  }

  const rsvpsByEvent = new Map<string, { status: Rsvp["status"]; party_size: number }[]>();
  for (const rsvp of rsvps ?? []) {
    const list = rsvpsByEvent.get(rsvp.event_id);
    if (list) list.push(rsvp);
    else rsvpsByEvent.set(rsvp.event_id, [rsvp]);
  }

  return events.map((event) => ({
    event,
    hostName: nameById.get(event.host_id) ?? event.host_id,
    summary: summarize(rsvpsByEvent.get(event.id) ?? []),
  }));
}

export interface GlobalSummary {
  eventCount: number;
  totalRespondents: number;
  totalAttendees: number;
}

/** 전체 집계: 이벤트 수 / 총 응답자(rsvp 건수) / 총 참석 인원(going의 party_size 합). */
export async function getGlobalSummary(): Promise<GlobalSummary> {
  const supabase = await createClient();

  const [{ count: eventCount }, { data: rsvps }] = await Promise.all([
    supabase.from("events").select("id", { count: "exact", head: true }),
    supabase.from("rsvps").select("status, party_size"),
  ]);

  const rsvpList = rsvps ?? [];

  return {
    eventCount: eventCount ?? 0,
    totalRespondents: rsvpList.length,
    totalAttendees: rsvpList
      .filter((r) => r.status === "going")
      .reduce((sum, r) => sum + r.party_size, 0),
  };
}

export interface AdminEventDetail extends EventDetail {
  hostName: string;
}

/** 관리자 상세 페이지용: 이벤트 단건 + 주최자명 + rsvps + announcements(최신순) + 집계. 없으면 null. */
export async function getEventDetailByIdAdmin(id: string): Promise<AdminEventDetail | null> {
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("id, host_id, slug, title, starts_at, ends_at, location, capacity, description")
    .eq("id", id)
    .maybeSingle();

  if (!event) return null;

  const [{ data: profile }, { data: rsvps }, { data: announcements }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", event.host_id).maybeSingle(),
    supabase
      .from("rsvps")
      .select("id, event_id, guest_token, name, status, party_size, created_at")
      .eq("event_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("announcements")
      .select("id, event_id, body, created_at")
      .eq("event_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const rsvpList = rsvps ?? [];

  return {
    event,
    hostName: profile?.full_name ?? event.host_id,
    rsvps: rsvpList,
    announcements: announcements ?? [],
    summary: summarize(rsvpList),
  };
}
