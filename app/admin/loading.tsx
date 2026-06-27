import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="mx-auto max-w-5xl p-5 pb-16">
      {/* 헤더 (타이틀 + 관리자 배지) */}
      <header className="mb-6 flex items-center gap-2">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-6 w-20" />
      </header>

      <div className="space-y-8">
        {/* 전체 집계 카드 3개 */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border p-6">
              <Skeleton className="mb-3 h-4 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </section>

        {/* 전체 이벤트 목록 */}
        <section className="space-y-3">
          <Skeleton className="h-6 w-28" />
          <ul className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="rounded-xl border p-6">
                <Skeleton className="mb-2 h-4 w-32" />
                <Skeleton className="mb-3 h-6 w-56" />
                <Skeleton className="mb-2 h-4 w-48" />
                <Skeleton className="h-5 w-40" />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
