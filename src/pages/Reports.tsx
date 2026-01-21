import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import useInventoryStore from '@/stores/useInventoryStore'
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import {
  TrendingUp,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  FileText,
} from 'lucide-react'
import { format, subDays, startOfDay, isAfter } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { exportToCSV } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

export default function Reports() {
  const { history, pallets, materials } = useInventoryStore()
  const { toast } = useToast()

  // 1. Calculate Stock Value (Total Items)
  const totalItems = pallets.reduce((sum, p) => sum + p.quantity, 0)

  // 2. Calculate Movements (Last 7 Days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i)
    return format(d, 'dd/MM')
  })

  const movementData = last7Days.map((dayStr) => {
    // Find logs for this day
    const logs = history.filter((log) => {
      return format(new Date(log.date), 'dd/MM') === dayStr
    })

    const entries = logs
      .filter((l) => l.type === 'ENTRY')
      .reduce((sum, l) => sum + (l.quantity || 0), 0)
    const exits = logs
      .filter((l) => l.type === 'EXIT')
      .reduce((sum, l) => sum + (l.quantity || 0), 0)

    return {
      date: dayStr,
      Entrada: entries,
      Saida: exits,
    }
  })

  // 3. Turnover (Top moved items)
  const itemMovements: Record<string, number> = {}
  history.forEach((log) => {
    if (log.type === 'EXIT' && log.materialName) {
      itemMovements[log.materialName] =
        (itemMovements[log.materialName] || 0) + (log.quantity || 0)
    }
  })

  const turnoverData = Object.entries(itemMovements)
    .map(([name, qtd]) => ({ name, qtd }))
    .sort((a, b) => b.qtd - a.qtd)
    .slice(0, 5)

  // 4. Low Stock Count
  const lowStockCount = materials.filter((m) => {
    if (!m.minStock) return false
    const total = pallets
      .filter((p) => p.materialName === m.name) // Using name for safety, ideal is ID
      .reduce((sum, p) => sum + p.quantity, 0)
    return total <= m.minStock
  }).length

  const handleExportCSV = () => {
    const reportData = history.map((log) => ({
      Data: format(new Date(log.date), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
      Tipo: log.type,
      Material: log.materialName || '-',
      Quantidade: log.quantity || 0,
      Usuario: log.user,
      Detalhes: log.description || '-',
    }))

    exportToCSV(
      reportData,
      `relatorio-completo-${format(new Date(), 'dd-MM-yyyy')}`,
    )
    toast({
      title: 'CSV Gerado',
      description: 'Relatório baixado com sucesso.',
    })
  }

  const handleExportPDF = () => {
    window.print()
    toast({
      title: 'Modo Impressão',
      description: 'Use a opção "Salvar como PDF" do seu navegador.',
    })
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Relatórios e Análises
          </h1>
          <p className="text-muted-foreground">
            Visão geral da performance do armazém.
          </p>
        </div>
        <div className="flex gap-2 print:hidden">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" /> Exportar CSV
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <FileText className="mr-2 h-4 w-4" /> Imprimir / PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Itens em Estoque
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">Quantidade total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Movimentações</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{history.length}</div>
            <p className="text-xs text-muted-foreground">Logs registrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Alertas de Estoque
            </CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {lowStockCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Itens abaixo do min.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Valor Agregado
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{materials.length}</div>
            <p className="text-xs text-muted-foreground">SKUs Cadastrados</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6 print:block print:space-y-6">
        <Card className="print:break-inside-avoid">
          <CardHeader>
            <CardTitle>Fluxo de Entrada e Saída (7 Dias)</CardTitle>
            <CardDescription>
              Comparativo diário de movimentações.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={movementData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="Entrada"
                    fill="hsl(var(--chart-2))"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="Saida"
                    fill="hsl(var(--chart-1))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="print:break-inside-avoid">
          <CardHeader>
            <CardTitle>Top Saídas (Giro de Estoque)</CardTitle>
            <CardDescription>
              Materiais com maior volume de saída.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={turnoverData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                    }}
                  />
                  <Bar
                    dataKey="qtd"
                    fill="hsl(var(--chart-4))"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
