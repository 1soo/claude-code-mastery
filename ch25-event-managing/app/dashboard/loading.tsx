import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="p-5 pb-24">
      {/* 타이틀 + 새 이벤트 버튼 */}
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>

      {/* 이벤트 카드 3개 */}
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <EventCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function EventCardSkeleton() {
  return (
    <div className="rounded-xl border p-6">
      <Skeleton className="mb-4 h-6 w-48" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-4 w-40" />
      </div>
      <Skeleton className="mt-4 h-5 w-32" />
    </div>
  );
}
