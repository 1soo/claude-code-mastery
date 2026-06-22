import type { Metadata } from "next";
import { FileText } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "견적서 목록",
};

// 견적서 목록 페이지 — 앱 진입점 (F001 / F004 / F005).
// RSC로 노션 데이터소스를 조회(ISR 60초)해 견적서 카드 목록을 렌더링한다.
// TODO(노션 연동): getQuotes()로 Quote[]를 가져와 카드 그리드로 표시.
//   - 상태 필터 탭(전체/발행/승인/만료)은 클라이언트 컴포넌트로 분리
//   - 각 카드에 "견적서 보기" 링크 + "링크 복사" 버튼(sonner 토스트) 배치
// export const revalidate = 60;
export default function QuoteListPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="견적서 목록"
          description={siteConfig.description}
        />
        <ThemeToggle />
      </div>

      {/* TODO: 노션 연동 후 견적서 카드 그리드로 교체 */}
      <EmptyState
        icon={FileText}
        title="견적서가 없습니다"
        description="노션 연동을 완료하면 발행된 견적서 목록이 여기에 표시됩니다."
      />
    </div>
  );
}
