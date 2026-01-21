import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { WarehouseMap } from '@/components/dashboard/WarehouseMap'

export default function Index() {
  return (
    <div className="space-y-8 animate-fade-in">
      <WarehouseMap />
      <DashboardStats />
    </div>
  )
}
