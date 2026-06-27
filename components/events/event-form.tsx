"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
}: {
  initialEvent?: Partial<Event>;
  submitLabel?: string;
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

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Phase 3 전: 실제 저장 없음.
    toast.success("(더미) 저장되었습니다");
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

      <Button type="submit" className="w-full">
        {submitLabel}
      </Button>
    </form>
  );
}
