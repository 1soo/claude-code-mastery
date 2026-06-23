"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { useReactToPrint } from "react-to-print";

import { Button } from "@/components/ui/button";

interface QuotePrintFrameProps {
  // 인쇄 문서 타이틀(견적번호)에 사용. 파일명에도 반영된다.
  quoteNumber: string;
  // 인쇄 대상이 되는 견적서 본문(서버 컴포넌트 QuoteDetail).
  children: React.ReactNode;
}

// PDF 다운로드(인쇄) 프레임 (F003).
// 인쇄 대상(children)을 ref div로 감싸 react-to-print 로 인쇄한다.
// 액션 바(뒤로가기 + PDF 버튼)는 print:hidden 으로 인쇄에서 제외한다.
// getQuote(노션 접근)는 호출하지 않는다 — RSC인 page.tsx 에서만 조회한다.
export function QuotePrintFrame({
  quoteNumber,
  children,
}: QuotePrintFrameProps) {
  // 인쇄 대상 컨테이너 ref. QuoteDetail 의 <article data-print-area> 를 감싼다.
  const ref = useRef<HTMLDivElement>(null);

  // useReactToPrint v3: contentRef 로 인쇄 대상을 지정하고 트리거 함수를 반환받는다.
  const handlePrint = useReactToPrint({
    contentRef: ref,
    documentTitle: "견적서_" + quoteNumber,
    // 인쇄 완료 후 E2E 트리거 검증용 플래그를 window 에 심는다.
    onAfterPrint: () => {
      if (typeof window !== "undefined") {
        (window as unknown as { __printed?: boolean }).__printed = true;
      }
    },
  });

  return (
    <div className="flex flex-col gap-6">
      {/* 액션 바: 인쇄 대상 아님(print:hidden) */}
      <div className="flex items-center justify-between print:hidden">
        {/* 좌측: 목록으로 돌아가기 */}
        <Button asChild variant="ghost" size="sm">
          <Link href="/">
            <ArrowLeft />
            목록으로
          </Link>
        </Button>

        {/* 우측: PDF 저장(인쇄) 트리거 */}
        <Button size="sm" onClick={() => handlePrint()}>
          <Printer />
          PDF로 저장
        </Button>
      </div>

      {/* 인쇄 대상 컨테이너 — react-to-print 가 이 ref 를 인쇄 */}
      <div ref={ref}>{children}</div>
    </div>
  );
}
