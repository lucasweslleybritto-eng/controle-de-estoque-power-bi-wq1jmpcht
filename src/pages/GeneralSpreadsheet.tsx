import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import {
  Download,
  Search,
  FilterX,
  Trash2,
  AlertTriangle,
  ArrowDownCircle,
} from 'lucide-react'
import useInventoryStore from '@/stores/useInventoryStore'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { exportToCSV, cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export default function GeneralSpreadsheet() {
  const {
    pallets,
    locations,
    streets,
    getLocationName,
    removePallet,
    currentUser,
    isLowStock,
  } = useInventoryStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [streetFilter, setStreetFilter] = useState('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { toast } = useToast()

  const canEdit =
    currentUser?.role === 'ADMIN' || currentUser?.role === 'OPERATOR'

  const getStreetName = (locId: string) => {
    if (locId === 'TRP_AREA') return 'Entrada'
    const loc = locations.find((l) => l.id === locId)
    return streets.find((s) => s.id === loc?.streetId)?.name || 'N/A'
  }

  const filteredPallets = pallets.filter((pallet) => {
    const matchesSearch =
      pallet.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pallet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pallet.id.toLowerCase().includes(searchTerm.toLowerCase())

    const loc = locations.find((l) => l.id === pallet.locationId)
    const matchesStreet =
      streetFilter === 'all' ||
      (streetFilter === 'TRP_AREA' && pallet.locationId === 'TRP_AREA') ||
      loc?.streetId === streetFilter

    return matchesSearch && matchesStreet
  })

  const handleDelete = () => {
    if (deleteId) {
      removePallet(deleteId, currentUser?.name || 'Gerente')
      setDeleteId(null)
    }
  }

  const handleExport = () => {
    if (filteredPallets.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Erro na exportação',
        description: 'Não há dados para exportar com os filtros atuais.',
      })
      return
    }

    try {
      const dataToExport = filteredPallets.map((p) => ({
        ID: p.id,
        Tipo: p.type,
        Material: p.materialName,
        'Descrição/Lote': p.description,
        Rua: getStreetName(p.locationId),
        Localização: getLocationName(p.locationId),
        Quantidade: p.quantity,
        'Data Entrada': format(new Date(p.entryDate), 'dd/MM/yyyy HH:mm', {
          locale: ptBR,
        }),
      }))

      exportToCSV(dataToExport, `estoque-${format(new Date(), 'dd-MM-yyyy')}`)

      toast({
        title: 'Exportação Concluída',
        description: 'O arquivo CSV foi baixado com sucesso.',
      })
    } catch (error) {
      console.error('Export failed', error)
      toast({
        variant: 'destructive',
        title: 'Erro na exportação',
        description: 'Ocorreu um erro ao gerar o arquivo.',
      })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Planilha Geral de Estoque
          </h1>
          <p className="text-muted-foreground">
            Visualização completa de todos os materiais (TRP e TRD).
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={handleExport}>
          <Download className="h-4 w-4" /> Exportar Relatório
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4 border-b">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filtrar por nome, descrição ou ID..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-64">
              <Select value={streetFilter} onValueChange={setStreetFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por Rua/Setor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Ruas</SelectItem>
                  <SelectItem value="TRP_AREA">Zona TRP (Entrada)</SelectItem>
                  {streets.map((street) => (
                    <SelectItem key={street.id} value={street.id}>
                      {street.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(searchTerm || streetFilter !== 'all') && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchTerm('')
                  setStreetFilter('all')
                }}
              >
                <FilterX className="h-4 w-4 mr-2" /> Limpar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-md border-0 w-full overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="w-[100px]">Tipo</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Setor</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Entrada
                  </TableHead>
                  <TableHead className="w-[50px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPallets.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center h-32 text-muted-foreground"
                    >
                      Nenhum resultado encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPallets.map((pallet) => {
                    const lowStock =
                      pallet.materialId && isLowStock(pallet.materialId)
                    return (
                      <TableRow
                        key={pallet.id}
                        className={cn(
                          'hover:bg-slate-50',
                          lowStock && 'bg-red-50 hover:bg-red-100/50',
                        )}
                      >
                        <TableCell>
                          <span className="font-bold text-xs border px-1 rounded bg-slate-100">
                            {pallet.type}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {lowStock && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <AlertTriangle className="h-4 w-4 text-red-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Estoque total abaixo do mínimo!</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                            <div>
                              <div
                                className={cn(
                                  'font-medium',
                                  lowStock && 'text-red-700',
                                )}
                              >
                                {pallet.materialName}
                              </div>
                              <div className="text-xs text-muted-foreground max-w-[200px] truncate">
                                {pallet.description}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStreetName(pallet.locationId)}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {getLocationName(pallet.locationId)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {pallet.quantity}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {format(
                            new Date(pallet.entryDate),
                            'dd/MM/yy HH:mm',
                            {
                              locale: ptBR,
                            },
                          )}
                        </TableCell>
                        <TableCell>
                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                              onClick={() => setDeleteId(pallet.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Excluir</span>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="text-xs text-center text-muted-foreground">
        Mostrando {filteredPallets.length} de {pallets.length} registros
      </div>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Material?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá o material da planilha e do estoque
              permanentemente. Tem certeza que deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
