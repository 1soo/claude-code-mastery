"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

interface QuoteShareButtonProps {
  quoteId: string;
}

// 견적서 공유 링크 복사 버튼 (F005).
// 클릭 시 견적서 상세 절대 URL 을 클립보드에 복사하고 토스트로 알린다.
// 클립보드/토스트는 브라우저 API 이므로 클라이언트 컴포넌트로 분리한다.
export function QuoteShareButton({ quoteId }: QuoteShareButtonProps) {
  async function handleCopy() {
    // siteConfig.url 을 기준으로 상세 페이지 절대 URL 을 만든다(단일 소스 재사용).
    const shareUrl = `${siteConfig.url}/quotes/${quoteId}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("링크가 복사되었습니다");
    } catch {
      // clipboard 미지원/권한 거부 등 실패 시 안내.
      toast.error("링크 복사에 실패했습니다");
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      aria-label="공유 링크 복사"
    >
      <Copy />
      링크 복사
    </Button>
  );
}
