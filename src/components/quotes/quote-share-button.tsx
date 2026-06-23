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
    // 배포 도메인 자동 대응: 클라이언트 클릭 시점의 origin 사용(localhost/프로덕션 모두 정확).
    // 비브라우저 경로 방어를 위해 siteConfig.url 폴백.
    const origin =
      typeof window !== "undefined" ? window.location.origin : siteConfig.url;
    const shareUrl = `${origin}/quotes/${quoteId}`;

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
