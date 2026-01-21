import { useState, useMemo } from 'react'
import {
  Package,
  TrendingUp,
  AlertTriangle,
  LayoutDashboard,
  Building,
  Plus,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import useInventoryStore from '@/stores/useInventoryStore'
import { cn } from '@/lib/utils'
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
import { Link } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'

export default function Index() {
  const {
    pallets,
    history,
    materials,
    isLowStock,
    streets,
    getLocationsByStreet,
    addStreet,
    currentUser,
  } = useInventoryStore()
  const { toast } = useToast()

  const [newStreetName, setNewStreetName] = useState('')
  const [isAddStreetOpen, setIsAddStreetOpen] = useState(false)

  const canEdit =
    currentUser?.role === 'ADMIN' || currentUser?.role === 'OPERATOR'

  const handleAddStreet = () => {
    if (newStreetName.trim()) {
      addStreet(newStreetName)
      setNewStreetName('')
      setIsAddStreetOpen(false)
      toast({
        title: 'Rua criada',
        description: `Rua ${newStreetName} adicionada com sucesso.`,
      })
    }
  }

  // Dashboard Stats
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
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <LayoutDashboard className="h-8 w-8 text-primary" />
            Mapa do Armazém
          </h1>
          <p className="text-muted-foreground mt-1">
            Visualização e gestão prioritária de ruas e corredores.
          </p>
        </div>
        {canEdit && (
          <Dialog open={isAddStreetOpen} onOpenChange={setIsAddStreetOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="shadow-sm">
                <Plus className="mr-2 h-5 w-5" /> Adicionar Nova Rua
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Rua / Corredor</DialogTitle>
              </DialogHeader>
              <div className="py-4 space-y-2">
                <Label>Nome da Rua</Label>
                <Input
                  value={newStreetName}
                  onChange={(e) => setNewStreetName(e.target.value)}
                  placeholder="Ex: Rua C, Corredor 4"
                />
              </div>
              <DialogFooter>
                <Button onClick={handleAddStreet}>Criar Rua</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Warehouse Map - Priority Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
              <Card className="h-full border-t-8 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1 relative bg-card">
                <div
                  className={cn(
                    'absolute top-0 left-0 right-0 h-2',
                    streetOccupancy > 90
                      ? 'bg-green-600'
                      : streetOccupancy < 10
                        ? 'bg-red-500'
                        : 'bg-blue-500',
                  )}
                />
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                      <Building className="h-6 w-6 text-muted-foreground" />
                      {street.name}
                    </CardTitle>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">
                        Capacidade: {streetTotal} locais
                      </span>
                      <span
                        className={cn(
                          'font-bold px-2 py-0.5 rounded text-xs',
                          streetOccupancy > 90
                            ? 'bg-green-100 text-green-800'
                            : 'bg-slate-100 text-slate-800',
                        )}
                      >
                        {streetOccupancy}% Ocupado
                      </span>
                    </div>

                    {/* Visual Mini-Map of Locations */}
                    <div className="flex gap-1 flex-wrap mt-2">
                      {streetLocations.slice(0, 12).map((loc) => {
                        const isLocOccupied = pallets.some(
                          (p) => p.locationId === loc.id,
                        )
                        return (
                          <div
                            key={loc.id}
                            className={cn(
                              'h-3 w-3 rounded-sm',
                              isLocOccupied ? 'bg-green-500' : 'bg-red-200',
                            )}
                            title={`${loc.name}: ${isLocOccupied ? 'Ocupado' : 'Vazio'}`}
                          />
                        )
                      })}
                      {streetLocations.length > 12 && (
                        <div className="h-3 w-3 rounded-full bg-slate-200 text-[8px] flex items-center justify-center text-slate-500">
                          +
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
        {streets.length === 0 && (
          <div className="col-span-full py-16 text-center border-2 border-dashed rounded-lg bg-muted/20">
            <Building className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-xl font-semibold">Nenhuma rua configurada</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2">
              Comece criando ruas para organizar seu layout de armazém.
            </p>
            {canEdit && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsAddStreetOpen(true)}
              >
                Criar Primeira Rua
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="border-t pt-8">
        <h2 className="text-xl font-semibold mb-6 text-muted-foreground">
          Indicadores de Performance
        </h2>
        {/* KPI Cards */}
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
              <p className="text-xs text-muted-foreground">
                Unidades em estoque
              </p>
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

        {/* Chart Section */}
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
    </div>
  )
}
