import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "견적서 상세",
};

// 견적서 상세 페이지 — 핵심 페이지 (F002 / F003 / F004).
// RSC로 노션 페이지를 조회(ISR 300초)해 견적서 전체 내용을 인쇄 품질로 렌더링한다.
// TODO(노션 연동):
//   1. getQuote(id)로 Quote 조회 → 없으면 notFound()
//   2. 헤더(회사/고객 정보) + 항목 테이블(ui/table) + 합계 + 조건/메모 렌더링
//   3. 유효기간 만료 시 "만료" 배지 표시(열람은 허용)
//   4. PDF 다운로드 버튼(클라이언트 컴포넌트): window.print() + @media print + react-to-print
//   5. 목록으로 돌아가는 뒤로가기 링크
// export const revalidate = 300;
export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-4 md:p-6">
      <PageHeader
        title="견적서 상세"
        description={`견적서 ID: ${id} (노션 연동 후 실제 내용으로 교체)`}
      />
      {/* TODO: 노션 연동 후 견적서 본문 + PDF 다운로드 버튼 렌더링 */}
    </div>
  );
}
