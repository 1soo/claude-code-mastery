import type { Metadata } from "next";
import { FileText } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { QuoteListClient } from "@/components/quotes/quote-list-client";
import { getQuotes } from "@/lib/notion";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "견적서 목록",
};

// 견적서 목록 페이지 — 앱 진입점 (F001 / F005).
// RSC로 노션 데이터소스를 조회(ISR 60초)해 견적서 카드 목록을 렌더링한다.
// getQuotes()는 server-only 모듈이므로 반드시 이 RSC 안에서만 호출하고,
// 결과(Quote[])만 클라이언트 컴포넌트(QuoteListClient)에 props 로 전달한다.
export const revalidate = 60;

export default async function QuoteListPage() {
  const quotes = await getQuotes();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 md:px-6 md:py-10">
      {/* 페이지 헤더 영역 — 제목/설명과 테마 토글, border-b 로 컨텐츠 영역과 수직 분리 */}
      <div className="flex items-center justify-between border-b pb-6">
        <PageHeader title="견적서 목록" description={siteConfig.description} />
        <ThemeToggle />
      </div>

      {quotes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="견적서가 없습니다"
          description="노션 연동을 완료하면 발행된 견적서 목록이 여기에 표시됩니다."
        />
      ) : (
        <QuoteListClient quotes={quotes} />
      )}
    </div>
  );
}
