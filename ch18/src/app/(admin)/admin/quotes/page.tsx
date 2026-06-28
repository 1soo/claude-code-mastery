import type { Metadata } from "next";
import { Table2 } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { QuoteTable } from "@/components/dashboard/quote-table";
import { getQuotes } from "@/lib/notion";

export const metadata: Metadata = {
  title: "견적 관리",
};

// ISR 재검증 주기(초). 공개 목록(60초)과 동일하게 둔다.
export const revalidate = 60;

// 어드민 견적 관리 페이지 (F008, RSC).
// getQuotes()는 server-only 모듈이므로 RSC 에서만 호출하고,
// 결과 배열만 클라이언트 테이블(QuoteTable)에 props 로 전달한다.
export default async function AdminQuotesPage() {
  const quotes = await getQuotes();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 md:px-6 md:py-10">
      <PageHeader
        title="견적 관리"
        description="발행된 견적서를 한눈에 관리합니다."
      />

      {quotes.length === 0 ? (
        <EmptyState
          icon={Table2}
          title="등록된 견적서가 없습니다"
          description="노션 데이터베이스에 견적서를 추가하면 여기에 표시됩니다."
        />
      ) : (
        <QuoteTable quotes={quotes} />
      )}
    </div>
  );
}
