import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminEventDetailLoading() {
  return (
    <div className="mx-auto max-w-5xl p-5 pb-16">
      <div className="space-y-8">
        {/* 헤더 */}
        <header className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-72" />
          </div>
        </header>

        {/* 집계 요약 */}
        <section>
          <Skeleton className="h-5 w-48" />
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
