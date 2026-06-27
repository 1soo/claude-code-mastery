"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { RsvpStatusBadge } from "@/components/events/rsvp-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RsvpStatus } from "@/lib/types";
import type { MyRsvp } from "./types";

// party_size는 "본인 포함" 인원 (AttendeeList가 +{party_size - 1}로 표시).
// 동반 인원(+N)을 0~5로 받아 party_size = 1 + companions 로 저장 의미를 맞춘다.
const COMPANION_OPTIONS = [0, 1, 2, 3, 4, 5];

interface RsvpFormProps {
  slug: string;
  submitRsvpAction: (
    slug: string,
    input: { name: string; status: RsvpStatus; companions: number },
  ) => Promise<MyRsvp>;
  initialRsvp: MyRsvp | null;
  isFull: boolean;
  remaining: number | null;
}

export function RsvpForm({
  slug,
  submitRsvpAction,
  initialRsvp,
  isFull,
  remaining,
}: RsvpFormProps) {
  const [submitted, setSubmitted] = useState<MyRsvp | null>(initialRsvp);
  const [isPending, startTransition] = useTransition();

  // 폼 입력 상태 (재방문 prefill).
  const [name, setName] = useState(initialRsvp?.name ?? "");
  const [status, setStatus] = useState<RsvpStatus>(
    initialRsvp?.status ?? "going",
  );
  const [companions, setCompanions] = useState(
    initialRsvp ? initialRsvp.party_size - 1 : 0,
  );
  const [nameError, setNameError] = useState<string | undefined>(undefined);

  // 마감 시 going 잠금: 단, 본인이 이미 going으로 응답해 둔 경우는 수정 허용.
  const alreadyGoing = initialRsvp?.status === "going";
  const goingLocked = isFull && !alreadyGoing;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError("이름을 입력해 주세요.");
      return;
    }
    if (trimmed.length > 50) {
      setNameError("이름은 50자 이내로 입력해 주세요.");
      return;
    }
    setNameError(undefined);
    startTransition(async () => {
      try {
        const result = await submitRsvpAction(slug, {
          name: trimmed,
          status,
          companions,
        });
        setSubmitted(result);
        toast.success("응답이 저장되었습니다.");
      } catch (err) {
        // 마감(서버 거절)은 그 사유를 그대로, 그 외는 일반 메시지.
        const message =
          err instanceof Error && err.message === "정원이 마감되었습니다"
            ? "정원이 마감되었습니다."
            : "응답 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.";
        toast.error(message);
      }
    });
  }

  function handleEdit() {
    if (submitted) {
      setName(submitted.name);
      setStatus(submitted.status);
      setCompanions(submitted.party_size - 1);
    }
    setSubmitted(null);
  }

  // 응답 완료 상태: 내 응답 요약 + 수정 버튼
  if (submitted) {
    const extra = submitted.party_size - 1;
    return (
      <div className="space-y-3 rounded-lg border p-4">
        <p className="text-sm font-medium">내 응답</p>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold">{submitted.name}</span>
          <RsvpStatusBadge status={submitted.status} />
          {extra > 0 && (
            <span className="text-muted-foreground">동반 +{extra}명</span>
          )}
        </div>
        <Button type="button" variant="outline" onClick={handleEdit}>
          응답 수정하기
        </Button>
      </div>
    );
  }

  // 입력 폼
  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border p-4">
      <div className="space-y-2">
        <Label htmlFor="rsvp-name">이름 (닉네임 가능)</Label>
        <Input
          id="rsvp-name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (nameError) setNameError(undefined);
          }}
          placeholder="예: 한강불주먹"
          autoComplete="off"
          maxLength={50}
          aria-invalid={nameError ? true : undefined}
        />
        {nameError && (
          <p className="text-destructive text-sm">{nameError}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label>참석 여부</Label>
          {goingLocked && <Badge variant="secondary">마감되었습니다</Badge>}
        </div>
        {remaining !== null && !goingLocked && (
          <p className="text-xs text-muted-foreground">남은 자리 {remaining}명</p>
        )}
        <RadioGroup
          value={status}
          onValueChange={(v) => setStatus(v as RsvpStatus)}
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem
              value="going"
              id="status-going"
              disabled={goingLocked}
            />
            <Label
              htmlFor="status-going"
              className="font-normal data-[disabled]:opacity-50"
              data-disabled={goingLocked ? "" : undefined}
            >
              참석
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="not_going" id="status-not_going" />
            <Label htmlFor="status-not_going" className="font-normal">
              불참
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="maybe" id="status-maybe" />
            <Label htmlFor="status-maybe" className="font-normal">
              미정
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="rsvp-companions">동반 인원 (본인 외 추가 인원)</Label>
        <Select
          value={String(companions)}
          onValueChange={(v) => setCompanions(Number(v))}
        >
          <SelectTrigger id="rsvp-companions" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COMPANION_OPTIONS.map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n === 0 ? "나 혼자" : `+${n}명 동반`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-muted-foreground">
        입력한 이름이 참석자 명단에 공개됩니다.
      </p>

      <Button
        type="submit"
        className="w-full"
        disabled={isPending || (goingLocked && status === "going")}
      >
        {isPending ? "제출 중…" : "응답 제출"}
      </Button>
    </form>
  );
}
