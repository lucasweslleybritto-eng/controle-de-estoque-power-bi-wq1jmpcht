import { useState, useMemo } from 'react'
import {
  Package,
  TrendingUp,
  AlertTriangle,
  History,
  LayoutDashboard,
  ArrowRight,
  TrendingDown,
  Building,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import useInventoryStore from '@/stores/useInventoryStore'
import { cn } from '@/lib/utils'
import { format, subDays, isAfter } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { Link } from 'react-router-dom'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export default function Index() {
  const {
    pallets,
    history,
    materials,
    isLowStock,
    streets,
    getLocationsByStreet,
    currentUser,
  } = useInventoryStore()

  // Dashboard Stats
  const stats = useMemo(() => {
    const totalItems = pallets.reduce((acc, p) => acc + p.quantity, 0)

    const lowStockItems = materials.filter((m) => isLowStock(m.id)).length

    const thirtyDaysAgo = subDays(new Date(), 30)
    const movementsLast30Days = history.filter((h) =>
      isAfter(new Date(h.date), thirtyDaysAgo),
    ).length

    const recentMovements = history.slice(0, 5)

    const healthyItems = materials.length - lowStockItems

    return {
      totalItems,
      lowStockItems,
      movementsLast30Days,
      recentMovements,
      stockHealthData: [
        { name: 'Saudável', value: healthyItems },
        { name: 'Estoque Baixo', value: lowStockItems },
      ],
    }
  }, [pallets, materials, history, isLowStock])

  // Warehouse Map Logic (Collapsible)
  const totalCapacity = useMemo(
    () =>
      streets.reduce((acc, s) => acc + getLocationsByStreet(s.id).length, 0),
    [streets, getLocationsByStreet],
  )
  const occupiedSlots = pallets.filter(
    (p) => p.locationId !== 'TRP_AREA',
  ).length

  const occupancyRate =
    totalCapacity > 0 ? Math.round((occupiedSlots / totalCapacity) * 100) : 0

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <LayoutDashboard className="h-8 w-8 text-primary" />
            Dashboard Geral
          </h1>
          <p className="text-muted-foreground mt-1">
            Visão geral do armazém e indicadores de performance.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-l-4 border-l-blue-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Itens em Estoque
            </CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
            <p className="text-xs text-muted-foreground">Unidades totais</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Abaixo do Mínimo
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.lowStockItems}
            </div>
            <p className="text-xs text-muted-foreground">
              Materiais precisam de reposição
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-green-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Movimentações (30 dias)
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.movementsLast30Days}
            </div>
            <p className="text-xs text-muted-foreground">
              Entradas e Saídas recentes
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Movements List */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" /> Movimentações Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead className="text-right">Qtd</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentMovements.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground py-8"
                    >
                      Nenhuma movimentação registrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  stats.recentMovements.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs">
                        {format(new Date(log.date), 'dd/MM HH:mm', {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] px-1.5',
                            log.type === 'ENTRY'
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : log.type === 'EXIT'
                                ? 'bg-red-100 text-red-800 border-red-200'
                                : 'bg-gray-100 text-gray-800',
                          )}
                        >
                          {log.type === 'ENTRY'
                            ? 'ENTRADA'
                            : log.type === 'EXIT'
                              ? 'SAÍDA'
                              : 'SISTEMA'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {log.materialName || log.description}
                      </TableCell>
                      <TableCell className="text-right font-bold text-sm">
                        {log.quantity || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="mt-4 text-right">
              <Link to="/history">
                <Button variant="ghost" size="sm" className="text-primary">
                  Ver Histórico Completo <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Stock Health Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Saúde do Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
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
                    low: {
                      label: 'Baixo',
                      color: 'hsl(var(--destructive))',
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.stockHealthData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell key="cell-0" fill="hsl(var(--chart-2))" />
                        <Cell key="cell-1" fill="hsl(var(--destructive))" />
                      </Pie>
                      <RechartsTooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Itens Saudáveis</span>
                <span className="font-bold">
                  {stats.stockHealthData[0].value}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Itens em Alerta</span>
                <span className="font-bold text-destructive">
                  {stats.stockHealthData[1].value}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warehouse Map (Legacy Index View) - Collapsed by default if simpler dashboard is preferred, but let's keep it visible as it is useful */}
      <div className="pt-4">
        <Accordion type="single" collapsible defaultValue="map">
          <AccordionItem value="map" className="border-none">
            <AccordionTrigger className="hover:no-underline py-2">
              <div className="flex items-center gap-2 text-xl font-bold">
                <Building className="h-6 w-6" /> Mapa do Armazém (Ruas e
                Ocupação)
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
                {streets.map((street) => {
                  const streetLocations = getLocationsByStreet(street.id)
                  const streetOccupied = streetLocations.filter((l) =>
                    pallets.some((p) => p.locationId === l.id),
                  ).length
                  const streetTotal = streetLocations.length
                  const streetOccupancy =
                    streetTotal > 0
                      ? Math.round((streetOccupied / streetTotal) * 100)
                      : 0

                  return (
                    <Link
                      to={`/street/${street.id}`}
                      key={street.id}
                      className="block h-full group"
                    >
                      <Card className="h-full hover:border-primary/50 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden border-t-4 border-t-muted group-hover:border-t-primary">
                        <CardHeader className="bg-muted/20 border-b pb-4">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-xl font-bold">
                              {street.name}
                            </CardTitle>
                            <span className="text-xs font-semibold px-2 py-1 bg-background border rounded-full text-muted-foreground">
                              {streetTotal} Slots
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                  Ocupação
                                </span>
                                <span className="font-medium">
                                  {streetOccupancy}%
                                </span>
                              </div>
                              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                <div
                                  className={cn(
                                    'h-full transition-all duration-500',
                                    streetOccupancy > 90
                                      ? 'bg-green-600'
                                      : streetOccupancy < 10
                                        ? 'bg-red-500'
                                        : 'bg-green-500',
                                  )}
                                  style={{ width: `${streetOccupancy}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
                {streets.length === 0 && (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    Nenhuma rua cadastrada. Vá em Configurações &gt; Ruas para
                    começar.
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}
