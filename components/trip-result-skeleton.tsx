import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export default function TripResultSkeleton() {
  return (
    <Card className="overflow-hidden bg-white shadow-xl rounded-xl border-0">
      <Skeleton className="h-72 md:h-96 w-full" />
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-28" />
        </div>

        <div className="flex items-start gap-2 mb-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-5 w-full" />
        </div>

        <div className="flex items-start gap-2 mb-6">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-5 w-3/4" />
        </div>

        <Skeleton className="h-32 w-full mb-6" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </Card>
  )
}
