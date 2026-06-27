"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/** EventForm이 제출하는 원시 폼 값 (datetime-local / 빈 문자열 포함). */
export interface EventFormValues {
  title: string;
  starts_at: string; // datetime-local 문자열
  ends_at: string; // datetime-local 문자열
  location: string;
  capacity: string;
  description: string;
}

/** 폼 원시 값을 DB 컬럼 형태로 정규화 (빈 문자열 → null, capacity → number|null, 일시 → ISO). */
function normalize(values: EventFormValues) {
  return {
    title: values.title,
    starts_at: new Date(values.starts_at).toISOString(),
    ends_at: new Date(values.ends_at).toISOString(),
    location: values.location.trim() === "" ? null : values.location,
    capacity: values.capacity.trim() === "" ? null : Number(values.capacity),
    description: values.description.trim() === "" ? null : values.description,
  };
}

export async function createEvent(values: EventFormValues) {
  const supabase = await createClient();

  const { data: claims } = await supabase.auth.getClaims();
  const hostId = claims?.claims.sub;
  if (!hostId) throw new Error("로그인이 필요합니다.");

  // slug는 DB default(gen_event_slug)로 자동 생성되므로 넣지 않는다.
  const { data, error } = await supabase
    .from("events")
    .insert({ host_id: hostId, ...normalize(values) })
    .select("id")
    .single();

  if (error) throw error;

  revalidatePath("/dashboard");
  redirect(`/events/${data.id}`);
}

export async function updateEvent(id: string, values: EventFormValues) {
  const supabase = await createClient();

  // RLS(host_id = auth.uid())가 소유권을 검증한다.
  const { error } = await supabase.from("events").update(normalize(values)).eq("id", id);

  if (error) throw error;

  revalidatePath("/dashboard");
  revalidatePath(`/events/${id}`);
  redirect(`/events/${id}`);
}

export async function deleteEvent(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("events").delete().eq("id", id);

  if (error) throw error;

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
