"use client";

import * as React from "react";
import { FilterX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { QuoteCard } from "@/components/quotes/quote-card";
import { quoteStatusLabel } from "@/lib/types";
import type { Quote, QuoteStatus } from "@/lib/types";

// 필터 키: 'all'(전체) + QuoteStatus 4종 + 'unclassified'(status === null).
type FilterKey = "all" | QuoteStatus | "unclassified";

// 필터 탭 정의 (라벨은 quoteStatusLabel 재사용 — 중복 매핑 금지).
const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "issued", label: quoteStatusLabel.issued },
  { key: "reviewing", label: quoteStatusLabel.reviewing },
  { key: "approved", label: quoteStatusLabel.approved },
  { key: "expired", label: quoteStatusLabel.expired },
  { key: "unclassified", label: "미분류" },
];

interface QuoteListClientProps {
  quotes: Quote[];
}

// 견적서 목록 + 상태 필터 (F001).
// 데이터는 RSC(page.tsx)에서 getQuotes()로 받아 props 로 전달받으며,
// 여기서는 클라이언트 상태(선택 필터)로 단순 배열 filter 만 수행한다.
// ⚠️ TanStack Table 미사용(단순 filter) — React Compiler 함정 회피.
export function QuoteListClient({ quotes }: QuoteListClientProps) {
  const [filter, setFilter] = React.useState<FilterKey>("all");

  // 선택된 필터에 따라 견적서 배열을 거른다.
  // all=전체, unclassified=status === null, 그 외=status === key.
  const filteredQuotes = quotes.filter((quote) => {
    if (filter === "all") return true;
    if (filter === "unclassified") return quote.status === null;
    return quote.status === filter;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* 상태 필터 탭 — 활성 항목은 default(강조), 비활성은 outline(중립) */}
      {/* 모바일에서 flex-wrap으로 자동 줄바꿈, gap으로 버튼 간격 정돈 */}
      <div className="flex flex-wrap gap-1.5 pb-1">
        {FILTERS.map(({ key, label }) => (
          <Button
            key={key}
            type="button"
            size="sm"
            variant={filter === key ? "default" : "outline"}
            onClick={() => setFilter(key)}
            aria-pressed={filter === key}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* 카드 그리드 (반응형: 모바일 1열 / sm 2열 / lg 3열) 또는 빈 결과 안내 */}
      {filteredQuotes.length === 0 ? (
        <EmptyState
          icon={FilterX}
          title="해당 상태의 견적서가 없습니다"
          description="다른 상태 필터를 선택하거나 노션 데이터를 확인하세요."
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredQuotes.map((quote) => (
            <QuoteCard key={quote.id} quote={quote} />
          ))}
        </div>
      )}
    </div>
  );
}
