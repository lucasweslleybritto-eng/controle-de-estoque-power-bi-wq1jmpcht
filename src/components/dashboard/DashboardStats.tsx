import { useMemo } from 'react'
import { Package, TrendingUp, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { subDays, isAfter } from 'date-fns'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts'
import { ChartContainer } from '@/components/ui/chart'
import useInventoryStore from '@/stores/useInventoryStore'

export function DashboardStats() {
  const { pallets, history, materials, isLowStock } = useInventoryStore()

  const stats = useMemo(() => {
    const totalItems = pallets.reduce((acc, p) => acc + p.quantity, 0)
    const lowStockItems = materials.filter((m) => isLowStock(m.id)).length
    const thirtyDaysAgo = subDays(new Date(), 30)
    const movementsLast30Days = history.filter((h) =>
      isAfter(new Date(h.date), thirtyDaysAgo),
    ).length
    const healthyItems = materials.length - lowStockItems

    return {
      totalItems,
      lowStockItems,
      movementsLast30Days,
      stockHealthData: [
        { name: 'Saudável', value: healthyItems },
        { name: 'Estoque Baixo', value: lowStockItems },
      ],
    }
  }, [pallets, materials, history, isLowStock])

  return (
    <div className="border-t pt-8">
      <h2 className="text-xl font-semibold mb-6 text-muted-foreground">
        Indicadores de Performance
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-l-4 border-l-blue-600 bg-slate-50/50 dark:bg-slate-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Itens
            </CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
            <p className="text-xs text-muted-foreground">Unidades em estoque</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-red-500 bg-slate-50/50 dark:bg-slate-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Alertas de Estoque
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.lowStockItems}
            </div>
            <p className="text-xs text-muted-foreground">Abaixo do mínimo</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-green-600 bg-slate-50/50 dark:bg-slate-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Movimentação (30d)
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.movementsLast30Days}
            </div>
            <p className="text-xs text-muted-foreground">Entradas e saídas</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Saúde do Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              {materials.length === 0 ? (
                <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                  Sem dados.
                </div>
              ) : (
                <ChartContainer
                  config={{
                    healthy: {
                      label: 'Saudável',
                      color: 'hsl(var(--chart-2))',
                    },
                    low: { label: 'Baixo', color: 'hsl(var(--destructive))' },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.stockHealthData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell key="cell-0" fill="hsl(var(--chart-2))" />
                        <Cell key="cell-1" fill="hsl(var(--destructive))" />
                      </Pie>
                      <RechartsTooltip />
                      <Legend verticalAlign="middle" align="right" />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
