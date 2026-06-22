import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { format, isBefore } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/quotes/status-badge";
import { formatKRW, sumAmount } from "@/lib/format";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import type { Quote } from "@/lib/types";

interface QuoteDetailProps {
  quote: Quote;
}

// ISO 8601 문자열 → 'yyyy.MM.dd' 포맷. 미입력(null)이면 '-'.
function formatDate(iso: string | null): string {
  return iso ? format(new Date(iso), "yyyy.MM.dd") : "-";
}

// 견적서 상세 본문 (F002). 인터랙션이 없는 서버 컴포넌트(RSC).
// <article data-print-area> 단일 컨테이너로 본문을 감싸 Phase 5의
// react-to-print 가 이 컨테이너를 ref 로 인쇄할 수 있게 한다.
// 뒤로가기 링크는 인쇄 대상이 아니므로 article 바깥에 배치한다.
export function QuoteDetail({ quote }: QuoteDetailProps) {
  const {
    quoteNumber,
    clientName,
    clientEmail,
    issuedAt,
    expiresAt,
    totalAmount,
    status,
    memo,
    items,
  } = quote;

  // 항목 소계(금액 합) — 항목이 비면 0.
  const subtotal = sumAmount(items);

  // 만료 판정: 유효기간(expiresAt)이 현재보다 과거면 만료.
  // 상태 select 의 '만료'(status)와는 별개 개념이므로 상태 배지와 구분 표기한다.
  // 만료여도 전체 내용 열람은 허용한다(차단하지 않음).
  const isExpired = expiresAt
    ? isBefore(new Date(expiresAt), new Date())
    : false;

  return (
    <div className="flex flex-col gap-6">
      {/* 뒤로가기: 인쇄 컨테이너 바깥(인쇄 대상 아님) */}
      <div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/">
            <ArrowLeft />
            목록으로
          </Link>
        </Button>
      </div>

      {/* 단일 인쇄 컨테이너 — Phase 5 react-to-print 가 이 ref 를 인쇄 */}
      <article
        data-print-area
        className="flex flex-col gap-10 rounded-xl border bg-card p-8 text-card-foreground shadow-lg ring-1 ring-border/40 md:p-12"
      >
        {/* ── 문서 헤더: 발행자 / 타이틀 / 견적번호·상태 / 일자 ── */}
        <header className="flex flex-col gap-6">
          {/* 상단 행: 견적서 타이틀(좌) + 식별정보(우) */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            {/* 발행자 + 문서 타이틀 */}
            <div className="space-y-1">
              {/* TODO(질문3): 발행자 정보 출처 확정 시 교체 (현재 siteConfig 기반 최소 표시) */}
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {siteConfig.name}
              </p>
              <h1 className="text-4xl font-bold tracking-tight">견적서</h1>
            </div>

            {/* 견적번호 + 상태 배지 */}
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <span
                className={cn(
                  "rounded-md bg-muted/60 px-3 py-1",
                  "font-mono text-xs tracking-widest text-muted-foreground",
                )}
              >
                {quoteNumber}
              </span>
              <StatusBadge status={status} />
            </div>
          </div>

          {/* 발행일 / 유효기간 — 라벨·값 세로 쌓기로 가독성 향상 */}
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div className="flex flex-col gap-0.5 border-l-2 border-border pl-3">
              <span className="text-xs text-muted-foreground">발행일</span>
              <span className="font-medium">{formatDate(issuedAt)}</span>
            </div>
            <div className="flex flex-col gap-0.5 border-l-2 border-border pl-3">
              <span className="text-xs text-muted-foreground">유효기간</span>
              <div className="flex items-center gap-1.5">
                <span className="font-medium">{formatDate(expiresAt)}</span>
                {/* 만료 배지: 상태 배지와 별개로 유효기간 옆에 표기 */}
                {isExpired ? (
                  <Badge variant="destructive" className="text-[10px]">
                    기한 만료
                  </Badge>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        <Separator />

        {/* ── 거래 당사자: 공급자(좌) / 고객(우) 2단 카드 ── */}
        <section className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            거래 당사자
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* 공급자 카드 */}
            <div className="rounded-md bg-muted/40 p-4 space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                공급자
              </p>
              <p className="font-semibold">{siteConfig.name}</p>
            </div>
            {/* 고객 카드 */}
            <div className="rounded-md bg-muted/40 p-4 space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                고객
              </p>
              <p className="font-semibold">{clientName || "-"}</p>
              <p className="text-sm text-muted-foreground">
                {clientEmail ?? "-"}
              </p>
            </div>
          </div>
        </section>

        <Separator />

        {/* ── 견적 항목 테이블 ── */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            견적 항목
          </h2>
          <Table>
            {/* 헤더 행 배경 강조: bg-muted/50으로 명확한 열 구분 */}
            <TableHeader className="[&>tr]:bg-muted/50">
              <TableRow>
                <TableHead className="font-semibold text-foreground">
                  품목명
                </TableHead>
                <TableHead className="text-right font-semibold text-foreground">
                  수량
                </TableHead>
                <TableHead className="text-right font-semibold text-foreground">
                  단가
                </TableHead>
                <TableHead className="text-right font-semibold text-foreground">
                  금액
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  비고
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-10 text-center text-muted-foreground"
                  >
                    등록된 항목이 없습니다
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, index) => (
                  <TableRow key={`${item.name}-${index}`}>
                    {/* 품목명: 좌측, 강조 */}
                    <TableCell className="font-medium">{item.name}</TableCell>
                    {/* 숫자 열: 우측정렬 + tabular-nums 유지 */}
                    <TableCell className="text-right tabular-nums">
                      {item.quantity.toLocaleString("ko-KR")}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatKRW(item.unitPrice)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium">
                      {formatKRW(item.amount)}
                    </TableCell>
                    {/* 비고: muted 톤 */}
                    <TableCell className="text-muted-foreground">
                      {item.note ?? "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            {/* 소계: 항목 금액 합(VAT 분리는 범위 외) */}
            {items.length > 0 ? (
              <TableFooter>
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-right font-semibold text-muted-foreground"
                  >
                    소계
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-semibold">
                    {formatKRW(subtotal)}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            ) : null}
          </Table>
        </section>

        {/* ── 합계 영역: 가장 강한 시각 위계 ── */}
        <section className="flex justify-end">
          {/* bg-primary / text-primary-foreground 로 문서 내 최상위 강조 */}
          <div
            className={cn(
              "w-full overflow-hidden rounded-md sm:w-auto sm:min-w-80",
              "border border-border",
            )}
          >
            <div className="flex items-center justify-between gap-8 bg-primary px-6 py-5">
              <span className="text-base font-semibold text-primary-foreground">
                합계금액
              </span>
              <span className="text-2xl font-bold tabular-nums text-primary-foreground">
                {formatKRW(totalAmount)}
              </span>
            </div>
          </div>
        </section>

        {/* ── 메모: 빈 문자열이면 영역 생략 ── */}
        {memo ? (
          <>
            <Separator />
            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                메모 / 특이사항
              </h2>
              {/* 메모 본문: muted 배경 박스로 시각 구분 */}
              <div className="rounded-md bg-muted/30 p-4">
                <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                  {memo}
                </p>
              </div>
            </section>
          </>
        ) : null}
      </article>
    </div>
  );
}
