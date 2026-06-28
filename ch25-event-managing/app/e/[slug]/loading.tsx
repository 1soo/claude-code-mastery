import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function PublicRsvpLoading() {
  return (
    <main className="mx-auto w-full max-w-xl px-4 py-8">
      <div className="space-y-8">
        {/* 이벤트 정보 헤더 */}
        <header className="space-y-3">
          <Skeleton className="h-8 w-3/4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-4 w-full" />
        </header>

        {/* RSVP 폼 영역 */}
        <section className="space-y-3">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-32" />
        </section>

        <Separator />

        {/* 참석 현황 */}
        <section className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-5 w-40" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
