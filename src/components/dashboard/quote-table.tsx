"use no memo";
"use client";

// 어드민 견적서 데이터테이블 (F008).
// "use no memo": React Compiler + TanStack Table(useReactTable) 비호환 회피(필수, CLAUDE.md 함정).
//
// 설계: 헤더 클릭 정렬 토글·렌더링·페이지 표시는 useReactTable 로 다루되,
// 실제 정렬/검색/페이지 슬라이싱 규칙은 순수 함수(lib/quote-table.ts)로 통일한다.
// → TanStack 내장 모델(sorted/filtered/pagination RowModel)은 manual 모드로 끄고,
//   미리 가공(sort→filter→paginate)한 배열만 table 에 전달해 단위 테스트와 런타임 동작을 일치시킨다.

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ExternalLink,
  FilterX,
  Link as LinkIcon,
  MoreHorizontal,
  Search,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { buildShareUrl } from "@/lib/share";
import { StatusBadge } from "@/components/quotes/status-badge";
import { EmptyState } from "@/components/common/empty-state";
import { formatKRW } from "@/lib/format";
import {
  filterQuotes,
  paginate,
  sortQuotes,
} from "@/lib/quote-table";
import type { SortDirection, SortKey } from "@/lib/quote-table";
import { quoteStatusLabel } from "@/lib/types";
import type { Quote, QuoteStatus } from "@/lib/types";

// 상태 필터 키: 'all'(전체) + QuoteStatus 4종 + 'unclassified'(status === null).
type StatusFilterKey = "all" | QuoteStatus | "unclassified";

// 상태 필터 탭 정의 (라벨은 quoteStatusLabel 재사용 — 중복 매핑 금지).
const STATUS_FILTERS: { key: StatusFilterKey; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "issued", label: quoteStatusLabel.issued },
  { key: "reviewing", label: quoteStatusLabel.reviewing },
  { key: "approved", label: quoteStatusLabel.approved },
  { key: "expired", label: quoteStatusLabel.expired },
  { key: "unclassified", label: "미분류" },
];

// 페이지당 행 수.
const PAGE_SIZE = 10;

// 내부 정렬 상태(헤더 토글). 정렬 비활성(기본 발행일 정렬 표시)은 null.
interface SortState {
  key: SortKey;
  direction: SortDirection;
}

interface QuoteTableProps {
  quotes: Quote[];
}

export function QuoteTable({ quotes }: QuoteTableProps) {
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] =
    React.useState<StatusFilterKey>("all");
  const [sort, setSort] = React.useState<SortState>({
    key: "issuedAt",
    direction: "desc",
  });
  const [page, setPage] = React.useState(1);

  // 검색어/상태필터/정렬이 바뀌면 1페이지로 되돌린다.
  React.useEffect(() => {
    setPage(1);
  }, [query, statusFilter, sort]);

  // 1) 상태 필터 → 2) 검색 → 3) 정렬 (순수 함수로 통일).
  const statusFiltered = quotes.filter((q) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "unclassified") return q.status === null;
    return q.status === statusFilter;
  });
  const searched = filterQuotes(statusFiltered, query);
  const sorted = sortQuotes(searched, sort.key, sort.direction);

  // 4) 페이지네이션(경계 보정 포함).
  const { slice, totalPages, page: safePage } = paginate(
    sorted,
    page,
    PAGE_SIZE,
  );

  // 컬럼 정의. 정렬 가능한 컬럼은 meta.sortKey 로 정렬 키를 표기한다.
  const columns = React.useMemo<ColumnDef<Quote>[]>(
    () => [
      {
        accessorKey: "quoteNumber",
        header: "견적번호",
        cell: ({ row }) => (
          // 견적번호: 모노스페이스 + 중간 굵기로 식별성 강화
          <span className="font-mono text-xs font-medium tracking-wider text-foreground">
            {row.original.quoteNumber}
          </span>
        ),
      },
      {
        accessorKey: "clientName",
        header: "고객명",
        cell: ({ row }) => row.original.clientName,
      },
      {
        accessorKey: "issuedAt",
        header: "발행일",
        meta: { sortKey: "issuedAt" satisfies SortKey },
        cell: ({ row }) => (
          // 발행일: tabular-nums 로 날짜 자릿수 정렬
          <span className="tabular-nums text-muted-foreground">
            {row.original.issuedAt
              ? format(new Date(row.original.issuedAt), "yyyy.MM.dd")
              : "-"}
          </span>
        ),
      },
      {
        accessorKey: "totalAmount",
        header: "합계",
        meta: { sortKey: "totalAmount" satisfies SortKey, align: "right" },
        cell: ({ row }) => (
          // 합계: tabular-nums + 중간 굵기로 금액 가독성 강화
          <span className="tabular-nums font-medium">
            {formatKRW(row.original.totalAmount)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "상태",
        meta: { sortKey: "status" satisfies SortKey },
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        // 접근성: sr-only 라벨로 스크린 리더에 컬럼 목적 전달
        header: () => <span className="sr-only">작업</span>,
        meta: { align: "right" },
        // 행 액션(F009): 각 행의 quote.id 를 props 로 전달해 행/ID 혼선을 차단한다.
        cell: ({ row }) => <QuoteRowActions quote={row.original} />,
      },
    ],
    [],
  );

  // TanStack: 코어 모델만 사용(정렬/필터/페이지는 위에서 수동 처리).
  const table = useReactTable({
    data: slice,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // 헤더 클릭 → 같은 키면 방향 토글, 다른 키면 그 키로 desc 시작.
  function toggleSort(key: SortKey) {
    setSort((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "desc" },
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 검색 + 상태 필터 컨트롤 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="견적번호·고객명 검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8"
            aria-label="견적서 검색"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map(({ key, label }) => (
            <Button
              key={key}
              type="button"
              size="sm"
              variant={statusFilter === key ? "default" : "outline"}
              onClick={() => setStatusFilter(key)}
              aria-pressed={statusFilter === key}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* 테이블 또는 빈 결과 */}
      {sorted.length === 0 ? (
        <EmptyState
          icon={FilterX}
          title="검색 결과가 없습니다"
          description="검색어나 상태 필터를 변경해 보세요."
        />
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              {/* 헤더 행: bg-muted/30 으로 본문과 시각 구분 */}
              <TableHeader className="[&_tr]:bg-muted/30">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      const meta = header.column.columnDef.meta as
                        | { sortKey?: SortKey; align?: "right" }
                        | undefined;
                      const sortKey = meta?.sortKey;
                      // 접근성: 활성 정렬 컬럼에 aria-sort 방향 표기
                      const ariaSort = sortKey
                        ? sort.key === sortKey
                          ? sort.direction === "asc"
                            ? ("ascending" as const)
                            : ("descending" as const)
                          : ("none" as const)
                        : undefined;
                      // 활성 정렬 컬럼 여부 (헤더 버튼 강조용)
                      const isActiveSortCol =
                        !!sortKey && sort.key === sortKey;
                      return (
                        <TableHead
                          key={header.id}
                          aria-sort={ariaSort}
                          className={
                            meta?.align === "right" ? "text-right" : ""
                          }
                        >
                          {sortKey ? (
                            <button
                              type="button"
                              onClick={() => toggleSort(sortKey)}
                              // header가 string 리터럴인 경우에만 aria-label 생성 (타입 안전)
                              aria-label={
                                typeof header.column.columnDef.header ===
                                "string"
                                  ? `${header.column.columnDef.header} 기준으로 정렬`
                                  : undefined
                              }
                              className={cn(
                                // 정렬 버튼 공통: 인라인 flex, 둥근 모서리, 전환 애니메이션
                                "inline-flex items-center gap-1 rounded-sm px-0.5 py-0.5 transition-colors",
                                // hover: 배경 미세하게 + 텍스트 강조
                                "hover:bg-muted hover:text-foreground",
                                // 활성 정렬 컬럼: 텍스트 강조 + 중간 굵기
                                isActiveSortCol
                                  ? "font-medium text-foreground"
                                  : "text-muted-foreground",
                              )}
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                              <SortIcon
                                active={isActiveSortCol}
                                direction={sort.direction}
                              />
                            </button>
                          ) : (
                            flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )
                          )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => {
                      const meta = cell.column.columnDef.meta as
                        | { align?: "right" }
                        | undefined;
                      return (
                        <TableCell
                          key={cell.id}
                          className={meta?.align === "right" ? "text-right" : ""}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* 페이지네이션 컨트롤 */}
          <div className="flex items-center justify-between gap-4">
            {/* 좌측: 현재 페이지 / 전체 페이지 · 총 건수 */}
            <span className="text-sm text-muted-foreground">
              {safePage} / {totalPages} 페이지 · 총{" "}
              <span className="tabular-nums">{sorted.length}</span>건
            </span>
            {/* 우측: 이전/다음 버튼 */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p - 1)}
                disabled={safePage <= 1}
                aria-label="이전 페이지"
              >
                <ChevronLeft className="size-4" aria-hidden />
                <span className="sr-only">이전</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={safePage >= totalPages}
                aria-label="다음 페이지"
              >
                <ChevronRight className="size-4" aria-hidden />
                <span className="sr-only">다음</span>
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// 정렬 방향 인디케이터. 활성 컬럼만 방향 화살표, 비활성은 양방향 아이콘.
function SortIcon({
  active,
  direction,
}: {
  active: boolean;
  direction: SortDirection;
}) {
  if (!active) {
    return <ChevronsUpDown className="size-3.5 text-muted-foreground/60" />;
  }
  return direction === "asc" ? (
    <ArrowUp className="size-3.5" />
  ) : (
    <ArrowDown className="size-3.5" />
  );
}

// 행 단위 액션 메뉴(F009). quote 를 props 로 받아 클로저가 해당 행의 id 만 참조하도록 한다.
// (행/ID 혼선 방지: 각 행 셀이 자기 quote.original 로 이 컴포넌트를 렌더한다.)
// 메뉴 비주얼/항목 정렬은 후속 UI 단계에서 다듬는다 — 여기서는 동작 가능한 최소 마크업.
function QuoteRowActions({ quote }: { quote: Quote }) {
  // 공개 공유 버튼(F005)과 동일한 복사 동작·토스트 문구를 재사용한다.
  async function handleCopyLink() {
    const shareUrl = buildShareUrl(quote.id, window.location.origin);
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("링크가 복사되었습니다");
    } catch {
      toast.error("링크 복사에 실패했습니다");
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* 아이콘 전용 정사각 버튼(size="icon-sm") — theme-toggle의 size="icon" 패턴과 일관 */}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="행 작업 메뉴 열기"
        >
          <MoreHorizontal className="size-4" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {/* 공유 링크 복사: Link 아이콘 + 텍스트 — theme-toggle 항목 패턴과 일관 */}
        <DropdownMenuItem onSelect={handleCopyLink}>
          <LinkIcon className="size-4" aria-hidden />
          공유 링크 복사
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {/* 견적서 보기: ExternalLink 아이콘 + 텍스트, 새 탭 */}
        <DropdownMenuItem asChild>
          <Link
            href={`/quotes/${quote.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="size-4" aria-hidden />
            견적서 보기
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
