import { EventForm } from "@/components/events/event-form";

export default function NewEventPage() {
  return (
    <div className="mx-auto max-w-lg p-5">
      <h1 className="mb-6 text-2xl font-bold">새 이벤트</h1>
      <EventForm submitLabel="이벤트 만들기" />
    </div>
  );
}
