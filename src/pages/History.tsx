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
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Search, FilterX } from 'lucide-react'
import useInventoryStore from '@/stores/useInventoryStore'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function History() {
  const { history } = useInventoryStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'ENTRY' | 'EXIT'>('ALL')
  const [materialTypeFilter, setMaterialTypeFilter] = useState<
    'ALL' | 'TRP' | 'TRD'
  >('ALL')

  const filteredHistory = history.filter((log) => {
    const matchesSearch =
      log.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.locationName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === 'ALL' || log.type === typeFilter
    const matchesMatType =
      materialTypeFilter === 'ALL' || log.materialType === materialTypeFilter

    return matchesSearch && matchesType && matchesMatType
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Histórico de Movimentações
        </h1>
        <p className="text-muted-foreground">
          Log completo de Entradas e Saídas.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4 border-b">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filtrar por material, usuário ou local..."
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
                  <SelectValue placeholder="Tipo de Movimento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos Movimentos</SelectItem>
                  <SelectItem value="ENTRY">Entrada</SelectItem>
                  <SelectItem value="EXIT">Saída</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select
                value={materialTypeFilter}
                onValueChange={(v: any) => setMaterialTypeFilter(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de Material" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos Tipos</SelectItem>
                  <SelectItem value="TRP">TRP</SelectItem>
                  <SelectItem value="TRD">TRD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(searchTerm ||
              typeFilter !== 'ALL' ||
              materialTypeFilter !== 'ALL') && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchTerm('')
                  setTypeFilter('ALL')
                  setMaterialTypeFilter('ALL')
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
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Qtd</TableHead>
                  <TableHead>Class.</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead>Usuário</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center h-32 text-muted-foreground"
                    >
                      Nenhum registro encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHistory.map((log) => (
                    <TableRow key={log.id} className="hover:bg-slate-50">
                      <TableCell className="text-xs font-medium">
                        {format(new Date(log.date), 'dd/MM/yy HH:mm', {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            'px-2 py-1 rounded-full text-xs font-bold',
                            log.type === 'ENTRY'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800',
                          )}
                        >
                          {log.type === 'ENTRY' ? 'ENTRADA' : 'SAÍDA'}
                        </span>
                      </TableCell>
                      <TableCell>{log.materialName}</TableCell>
                      <TableCell className="font-bold">
                        {log.quantity}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs border px-1 rounded bg-slate-100">
                          {log.materialType}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {log.locationName}{' '}
                        {log.streetName ? `(${log.streetName})` : ''}
                      </TableCell>
                      <TableCell className="text-sm">{log.user}</TableCell>
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
