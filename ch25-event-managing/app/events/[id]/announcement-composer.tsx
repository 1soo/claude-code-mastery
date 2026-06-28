"use client";

import { useState, useTransition } from "react";
import { Megaphone } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

import { createAnnouncement } from "./announcement-actions";

export function AnnouncementComposer({ eventId }: { eventId: string }) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    const trimmed = body.trim();
    if (!trimmed) {
      toast.error("공지 내용을 입력해 주세요");
      return;
    }
    startTransition(async () => {
      try {
        await createAnnouncement(eventId, trimmed);
        toast.success("공지가 등록되었습니다");
        setBody("");
        setOpen(false);
      } catch {
        toast.error("공지 등록에 실패했습니다");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Megaphone className="size-4" />새 공지
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>공지 작성</DialogTitle>
          <DialogDescription>
            참석자에게 전달할 공지를 작성하세요.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="예) 장소가 변경되었습니다. 시간 엄수 부탁드려요."
          rows={5}
          disabled={isPending}
        />
        <DialogFooter>
          <Button type="button" onClick={handleSubmit} disabled={isPending}>
            등록
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
