import { Suspense } from "react";
import { notFound } from "next/navigation";

import { EventForm } from "@/components/events/event-form";
import { getEventById } from "@/lib/mock-data";

export default function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="mx-auto max-w-lg p-5">
      <h1 className="mb-6 text-2xl font-bold">이벤트 수정</h1>
      <Suspense
        fallback={<p className="text-muted-foreground">불러오는 중…</p>}
      >
        <EditEventForm params={params} />
      </Suspense>
    </div>
  );
}

async function EditEventForm({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = getEventById(id);

  if (!event) {
    notFound();
  }

  return <EventForm initialEvent={event} submitLabel="변경 저장" />;
}
