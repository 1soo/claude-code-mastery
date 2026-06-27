"use client";

import { useState, useTransition, type FormEvent } from "react";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { EventFormValues } from "@/app/events/actions";
import type { Event } from "@/lib/types";

/** ISO 8601 문자열을 datetime-local input 값(YYYY-MM-DDTHH:mm)으로 변환. */
function toDateTimeLocal(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

export function EventForm({
  initialEvent,
  submitLabel = "저장",
  onSubmitAction,
}: {
  initialEvent?: Partial<Event>;
  submitLabel?: string;
  onSubmitAction: (values: EventFormValues) => Promise<void>;
}) {
  const [title, setTitle] = useState(initialEvent?.title ?? "");
  const [startsAt, setStartsAt] = useState(
    toDateTimeLocal(initialEvent?.starts_at),
  );
  const [endsAt, setEndsAt] = useState(toDateTimeLocal(initialEvent?.ends_at));
  const [location, setLocation] = useState(initialEvent?.location ?? "");
  const [capacity, setCapacity] = useState(
    initialEvent?.capacity != null ? String(initialEvent.capacity) : "",
  );
  const [description, setDescription] = useState(
    initialEvent?.description ?? "",
  );
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await onSubmitAction({
          title,
          starts_at: startsAt,
          ends_at: endsAt,
          location,
          capacity,
          description,
        });
        // 성공 시 서버 액션이 redirect하므로 여기 이후 코드는 실행되지 않는다.
      } catch (error) {
        // redirect()는 throw로 전파된다 — 실패가 아니므로 다시 던져 Next가 처리하게 한다.
        if (isRedirectError(error)) throw error;
        toast.error("저장에 실패했습니다. 다시 시도해 주세요.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">제목</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="starts_at">시작 일시</Label>
        <Input
          id="starts_at"
          type="datetime-local"
          value={startsAt}
          onChange={(e) => setStartsAt(e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="ends_at">종료 일시</Label>
        <Input
          id="ends_at"
          type="datetime-local"
          value={endsAt}
          onChange={(e) => setEndsAt(e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="location">장소 (선택)</Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="capacity">정원 (선택)</Label>
        <Input
          id="capacity"
          type="number"
          min={1}
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">설명 (선택)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "저장 중…" : submitLabel}
      </Button>
    </form>
  );
}
