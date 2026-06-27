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
  const [errors, setErrors] = useState<{
    title?: string;
    ends_at?: string;
    capacity?: string;
  }>({});
  const [isPending, startTransition] = useTransition();

  /** 클라이언트 즉시 검증. 통과하면 빈 객체, 아니면 필드별 한국어 메시지. */
  function validate() {
    const next: { title?: string; ends_at?: string; capacity?: string } = {};

    if (title.trim() === "") {
      next.title = "제목을 입력해 주세요.";
    } else if (title.trim().length > 100) {
      next.title = "제목은 100자 이내로 입력해 주세요.";
    }

    if (startsAt !== "" && endsAt !== "") {
      if (new Date(endsAt).getTime() <= new Date(startsAt).getTime()) {
        next.ends_at = "종료 시각은 시작 시각보다 늦어야 합니다.";
      }
    }

    if (capacity.trim() !== "") {
      const n = Number(capacity);
      if (!Number.isInteger(n) || n < 1) {
        next.capacity = "정원은 1명 이상이어야 합니다.";
      }
    }

    return next;
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

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
        toast.error("저장에 실패했습니다. 잠시 후 다시 시도해 주세요.");
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
          maxLength={100}
          aria-invalid={errors.title ? true : undefined}
        />
        {errors.title && (
          <p className="text-destructive text-sm">{errors.title}</p>
        )}
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
          aria-invalid={errors.ends_at ? true : undefined}
        />
        {errors.ends_at && (
          <p className="text-destructive text-sm">{errors.ends_at}</p>
        )}
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
          step={1}
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          aria-invalid={errors.capacity ? true : undefined}
        />
        {errors.capacity && (
          <p className="text-destructive text-sm">{errors.capacity}</p>
        )}
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
