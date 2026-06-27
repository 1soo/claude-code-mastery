import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { createClient } from "@/lib/supabase/server";
import type { Announcement, Event, Rsvp } from "@/lib/types";

// 폰트는 모듈 스코프에서 한 번만 로드한다. 컴포넌트 내부에서 readFile 하면
// Cache Components 하에 동적 I/O로 취급되어 정적 생성에서 빠진다.
// process.cwd()는 Next.js 프로젝트 디렉터리이며, 이 경로는 prod 빌드에서도 유효하다.
const [notoBold, notoRegular] = await Promise.all([
  readFile(join(process.cwd(), "assets/fonts/NotoSansKR-Bold.ttf")),
  readFile(join(process.cwd(), "assets/fonts/NotoSansKR-Regular.ttf")),
]);

// get_public_event RPC 반환 형태 (page.tsx의 PublicEvent와 동일).
interface PublicEvent {
  event: Omit<Event, "host_id">;
  announcements: Announcement[];
  rsvps: Omit<Rsvp, "event_id" | "guest_token">[];
}

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const dateTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Asia/Seoul",
});

const PRODUCT_NAME = "모임 이벤트 관리";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_public_event", {
    p_slug: slug,
  });

  let title = PRODUCT_NAME;
  let when: string | null = null;

  if (!error && data) {
    const { event } = data as unknown as PublicEvent;
    title = event.title;
    when = dateTimeFormatter.format(new Date(event.starts_at));
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#0a0a0a",
          color: "#fafafa",
          fontFamily: "Noto Sans KR",
        }}
      >
        <div style={{ fontSize: 32, color: "#a1a1aa" }}>{PRODUCT_NAME}</div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            marginTop: 24,
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>
        {when && (
          <div style={{ fontSize: 40, color: "#a1a1aa", marginTop: 32 }}>
            {when}
          </div>
        )}
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Noto Sans KR", data: notoBold, weight: 700, style: "normal" },
        {
          name: "Noto Sans KR",
          data: notoRegular,
          weight: 400,
          style: "normal",
        },
      ],
    },
  );
}
