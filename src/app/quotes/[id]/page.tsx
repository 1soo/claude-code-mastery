import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { QuoteDetail } from "@/components/quotes/quote-detail";
import { QuotePrintFrame } from "@/components/quotes/quote-print-frame";
import { getQuote } from "@/lib/notion";

// ISR 재검증 주기(상세): 300초. (목록은 60초)
export const revalidate = 300;

// 견적번호를 문서 타이틀로 사용. 없는 견적서면 기본 타이틀.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const quote = await getQuote(id);

  if (!quote) {
    return { title: "견적서를 찾을 수 없습니다" };
  }

  return { title: `견적서 ${quote.quoteNumber}` };
}

// 견적서 상세 페이지 — 핵심 페이지 (F002 / F003 / F004).
// RSC로 노션 페이지를 조회(ISR 300초)해 견적서 전체 내용을 인쇄 품질로 렌더링한다.
// getQuote(노션 접근)는 RSC인 이 page.tsx에서만 호출한다.
// PDF 다운로드(F003)는 클라이언트 컴포넌트 QuotePrintFrame 이 담당한다.
// 액션 바(뒤로가기 + PDF 버튼)는 QuotePrintFrame 으로 이전했으므로
// 서버 컴포넌트 QuoteDetail 은 인쇄 본문(<article data-print-area>)만 렌더한다.
export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quote = await getQuote(id);

  // 없는 견적서(잘못된 ID 포함)면 404 화면(not-found.tsx) 렌더.
  if (!quote) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col p-4 md:px-6 md:py-10">
      <QuotePrintFrame quoteNumber={quote.quoteNumber}>
        <QuoteDetail quote={quote} />
      </QuotePrintFrame>
    </div>
  );
}
