import { Badge } from "@/components/ui/badge";
import { quoteStatusLabel } from "@/lib/types";
import type { QuoteStatus } from "@/lib/types";

// 견적서 상태별 배지 variant 매핑 (단일 소스).
// 라벨은 quoteStatusLabel(types.ts)을 재사용하고, 여기서는 표시 스타일만 정의한다.
// status === null(미분류) 은 아래 STATUS_*_FALLBACK 사용.
// 의미론적 구분: 승인(강조/긍정) > 발행(정보/보통) > 검토중(중립/약함) > 만료(위험/경고)
const STATUS_BADGE_VARIANT: Record<
  QuoteStatus,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  approved: "default", // 승인 — primary(진한 강조), 긍정적 완결 상태
  issued: "secondary", // 발행 — secondary(연회색), 정보성 중간 강조
  reviewing: "outline", // 검토중 — outline(테두리만), 중립/진행중
  expired: "destructive", // 만료 — destructive(빨강), 위험/주의 경고
};

// status 가 null 일 때의 라벨/variant fallback.
const STATUS_LABEL_FALLBACK = "미분류";
const STATUS_BADGE_FALLBACK = "outline" as const;

interface StatusBadgeProps {
  status: QuoteStatus | null;
}

// 견적서 상태 배지 (카드·상세 공용). 인터랙션 없는 서버 컴포넌트(RSC).
// 라벨/variant 매핑을 한 곳에 모아 카드·상세에서 중복 정의되지 않도록 한다.
export function StatusBadge({ status }: StatusBadgeProps) {
  const label = status ? quoteStatusLabel[status] : STATUS_LABEL_FALLBACK;
  const variant = status ? STATUS_BADGE_VARIANT[status] : STATUS_BADGE_FALLBACK;

  return <Badge variant={variant}>{label}</Badge>;
}
