import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function EventDetailLoading() {
  return (
    <div className="mx-auto max-w-5xl p-5 pb-16">
      <div className="space-y-8">
        {/* 헤더 */}
        <header className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-56" />
              <Skeleton className="h-4 w-72" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="flex shrink-0 gap-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </header>

        {/* 집계 요약 카드 3개 */}
        <section className="space-y-3">
          <Skeleton className="h-5 w-48" />
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border p-6">
                <Skeleton className="mb-3 h-4 w-12" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        </section>

        <Separator />

        {/* 명단 테이블 */}
        <section className="space-y-3">
          <Skeleton className="h-6 w-40" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
