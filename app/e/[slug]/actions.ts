"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { RsvpStatus } from "@/lib/types";
import type { MyRsvp } from "./types";

export async function submitRsvp(
  slug: string,
  input: { name: string; status: RsvpStatus; companions: number },
): Promise<MyRsvp> {
  const jar = await cookies();

  let token = jar.get("guest_token")?.value;
  if (!token) {
    token = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, "");
    jar.set("guest_token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("submit_rsvp", {
    p_slug: slug,
    p_name: input.name,
    p_status: input.status,
    p_party_size: 1 + input.companions,
    p_guest_token: token,
  });

  if (error) {
    throw new Error("응답 저장에 실패했어요. 잠시 후 다시 시도해주세요.");
  }

  revalidatePath(`/e/${slug}`);
  return data as unknown as MyRsvp;
}
