import Link from "next/link";
import { format } from "date-fns";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuoteShareButton } from "@/components/quotes/quote-share-button";
import { StatusBadge } from "@/components/quotes/status-badge";
import { formatKRW } from "@/lib/format";
import type { Quote } from "@/lib/types";

interface QuoteCardProps {
  quote: Quote;
}

// 견적서 단건 카드 (목록 그리드 셀). 인터랙션이 없는 서버 컴포넌트(RSC).
// 공유 버튼(QuoteShareButton)만 클라이언트 컴포넌트로 분리되어 있다.
export function QuoteCard({ quote }: QuoteCardProps) {
  const { id, quoteNumber, title, clientName, issuedAt, totalAmount, status } =
    quote;

  // 발행일: ISO 문자열 → 'yyyy.MM.dd', 미입력(null)이면 '-'.
  const issuedLabel = issuedAt
    ? format(new Date(issuedAt), "yyyy.MM.dd")
    : "-";

  // hover 시 미세한 elevation 효과로 카드 클릭 가능성 암시
  return (
    <Card className="h-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:ring-foreground/20">
      <CardHeader>
        {/* 견적번호(식별자) + 상태 배지: 상단 행 */}
        <div className="flex items-start justify-between gap-2">
          <span className="font-mono text-xs tracking-wider text-muted-foreground/80">
            {quoteNumber}
          </span>
          <StatusBadge status={status} />
        </div>
        {/* 제목: 주 정보, 최대 2줄 */}
        <CardTitle className="mt-0.5 line-clamp-2">{title}</CardTitle>
        {/* 고객명: 보조 정보, 넘치면 말줄임 */}
        <CardDescription className="truncate">{clientName}</CardDescription>
      </CardHeader>

      {/* 발행일/합계 메타 섹션 — border-t 로 헤더 영역과 시각 분리 */}
      <CardContent className="flex flex-col gap-2 border-t pt-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">발행일</span>
          <span className="text-sm">{issuedLabel}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">합계</span>
          {/* tabular-nums: 숫자 폭 균일, semibold: 합계 강조 */}
          <span className="tabular-nums text-sm font-semibold">{formatKRW(totalAmount)}</span>
        </div>
      </CardContent>

      <CardFooter className="justify-between gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={`/quotes/${id}`}>견적서 보기</Link>
        </Button>
        <QuoteShareButton quoteId={id} />
      </CardFooter>
    </Card>
  );
}
