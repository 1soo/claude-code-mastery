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
  // 서버측 재검증(보안 경계). 클라이언트 검증을 우회한 입력을 거른다.
  const trimmedName = input.name.trim();
  if (trimmedName === "") {
    throw new Error("이름을 입력해 주세요.");
  }
  if (trimmedName.length > 50) {
    throw new Error("이름은 50자 이내로 입력해 주세요.");
  }
  if (!Number.isInteger(input.companions) || input.companions < 0) {
    throw new Error("동반 인원이 올바르지 않습니다.");
  }

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
    p_name: trimmedName,
    p_status: input.status,
    p_party_size: 1 + input.companions,
    p_guest_token: token,
  });

  if (error) {
    // RPC가 raise한 '정원이 마감되었습니다'는 PostgrestError.message로 전달된다.
    // 마감 메시지는 그대로 노출하고, 그 외에는 일반 메시지로 덮는다.
    if (error.message.includes("정원이 마감되었습니다")) {
      throw new Error("정원이 마감되었습니다");
    }
    throw new Error("응답 저장에 실패했어요. 잠시 후 다시 시도해주세요.");
  }

  revalidatePath(`/e/${slug}`);
  return data as unknown as MyRsvp;
}
