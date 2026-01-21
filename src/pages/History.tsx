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
import { Search, FilterX, Download, AlertCircle } from 'lucide-react'
import useInventoryStore from '@/stores/useInventoryStore'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { exportToCSV, cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { LogType } from '@/types'

export default function History() {
  const { history, currentUser } = useInventoryStore()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'ALL' | LogType>('ALL')

  // RBAC: Maybe allow only Admin/Operator to export?
  // User Story says Viewer has "Read-only access to inventory and reports".
  // So Viewer can see history, but typically export is also read-access. We'll allow it.
  const canExport = true

  const filteredHistory = history.filter((log) => {
    // Search in relevant fields including new description
    const contentToSearch = [
      log.materialName,
      log.user,
      log.locationName,
      log.description,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    const matchesSearch = contentToSearch.includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === 'ALL' || log.type === typeFilter

    return matchesSearch && matchesType
  })

  const handleExport = () => {
    if (filteredHistory.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Erro na exportação',
        description: 'Não há dados para exportar com os filtros atuais.',
      })
      return
    }

    try {
      const dataToExport = filteredHistory.map((log) => ({
        Data: format(new Date(log.date), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
        Tipo:
          log.type === 'ENTRY'
            ? 'ENTRADA'
            : log.type === 'EXIT'
              ? 'SAÍDA'
              : 'SISTEMA',
        Usuário: log.user,
        Detalhes: log.description || log.materialName,
        Quantidade: log.quantity || '-',
        Local: log.locationName || '-',
        Rua: log.streetName || '-',
      }))

      exportToCSV(
        dataToExport,
        `historico-completo-${format(new Date(), 'dd-MM-yyyy')}`,
      )

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

  const getTypeBadgeColor = (type: LogType) => {
    switch (type) {
      case 'ENTRY':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'EXIT':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'SYSTEM':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeLabel = (type: LogType) => {
    switch (type) {
      case 'ENTRY':
        return 'ENTRADA'
      case 'EXIT':
        return 'SAÍDA'
      case 'SYSTEM':
        return 'SISTEMA'
      default:
        return type
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Histórico de Atividades
          </h1>
          <p className="text-muted-foreground">
            Log completo de Entradas, Saídas e Alterações do Sistema.
          </p>
        </div>
        {canExport && (
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" /> Exportar Histórico
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-4 border-b">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filtrar por material, usuário, local ou descrição..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Select
                value={typeFilter}
                onValueChange={(v: any) => setTypeFilter(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de Evento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos Eventos</SelectItem>
                  <SelectItem value="ENTRY">Entrada de Estoque</SelectItem>
                  <SelectItem value="EXIT">Saída de Estoque</SelectItem>
                  <SelectItem value="SYSTEM">Sistema / Estrutura</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(searchTerm || typeFilter !== 'ALL') && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchTerm('')
                  setTypeFilter('ALL')
                }}
              >
                <FilterX className="h-4 w-4 mr-2" /> Limpar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-md border-0">
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Detalhes da Ação</TableHead>
                  <TableHead>Qtd</TableHead>
                  <TableHead>Localização</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center h-32 text-muted-foreground"
                    >
                      Nenhum registro encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHistory.map((log) => (
                    <TableRow
                      key={log.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-900/50"
                    >
                      <TableCell className="text-xs font-medium whitespace-nowrap">
                        {format(new Date(log.date), 'dd/MM/yy HH:mm', {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {log.user}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            'px-2 py-1 rounded-full text-xs font-bold',
                            getTypeBadgeColor(log.type),
                          )}
                        >
                          {getTypeLabel(log.type)}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        {log.type === 'SYSTEM' ? (
                          <span className="flex items-center text-sm text-slate-700 dark:text-slate-300">
                            <AlertCircle className="h-3 w-3 mr-2 text-blue-500" />
                            {log.description}
                          </span>
                        ) : (
                          <div>
                            <span className="font-medium text-sm">
                              {log.materialName}
                            </span>
                            {log.description && (
                              <p className="text-xs text-muted-foreground truncate">
                                {log.description}
                              </p>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-bold">
                        {log.quantity ? log.quantity : '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {log.locationName !== 'N/A' ? (
                          <>
                            {log.locationName}{' '}
                            {log.streetName ? `(${log.streetName})` : ''}
                          </>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
