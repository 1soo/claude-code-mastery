"use client";

import { Link2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function ShareLinkButton({
  url,
  className,
}: {
  url: string;
  className?: string;
}) {
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("링크가 복사되었습니다");
    } catch {
      toast.error("링크 복사에 실패했습니다");
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleCopy}
      className={className}
    >
      <Link2 />
      공유 링크 복사
    </Button>
  );
}
