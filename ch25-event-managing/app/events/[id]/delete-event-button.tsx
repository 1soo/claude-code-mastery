"use client";

import { useTransition } from "react";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function DeleteEventButton({
  eventId,
  deleteAction,
}: {
  eventId: string;
  deleteAction: (id: string) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteAction(eventId);
        // 성공 시 서버 액션이 redirect하므로 여기 이후 코드는 실행되지 않는다.
      } catch (error) {
        // redirect()는 throw로 전파된다 — 실패가 아니므로 다시 던져 Next가 처리하게 한다.
        if (isRedirectError(error)) throw error;
        toast.error("삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      }
    });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive"
          disabled={isPending}
        >
          <Trash2 className="size-4" />
          삭제
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>이벤트를 삭제할까요?</AlertDialogTitle>
          <AlertDialogDescription>
            삭제하면 모든 응답과 공지가 함께 삭제되며 되돌릴 수 없습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>취소</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={handleDelete}
          >
            삭제
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
