import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { WarehouseMap } from '@/components/dashboard/WarehouseMap'
import useInventoryStore from '@/stores/useInventoryStore'
import { Skeleton } from '@/components/ui/skeleton'

export default function Index() {
  const { isLoading } = useInventoryStore()

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-12 w-48" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-40 w-full rounded-lg" />
            ))}
          </div>
        </div>
        <div className="border-t pt-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <WarehouseMap />
      <DashboardStats />
    </div>
  )
}
