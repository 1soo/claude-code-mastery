"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

/** 공지 작성. body는 trim 검증, insert 소유권은 RLS(host 본인 이벤트만)가 검증한다. */
export async function createAnnouncement(eventId: string, body: string) {
  const trimmed = body.trim();
  if (!trimmed) throw new Error("공지 내용을 입력해 주세요.");

  const supabase = await createClient();

  const { error } = await supabase
    .from("announcements")
    .insert({ event_id: eventId, body: trimmed });

  if (error) throw error;

  revalidatePath(`/events/${eventId}`);
}
