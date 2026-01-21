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
import { Download, Search, FilterX } from 'lucide-react'
import useInventoryStore from '@/stores/useInventoryStore'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function GeneralSpreadsheet() {
  const { pallets, locations, streets } = useInventoryStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [streetFilter, setStreetFilter] = useState('all')

  const getLocationName = (id: string) =>
    locations.find((l) => l.id === id)?.name || id
  const getStreetName = (locId: string) => {
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
      streetFilter === 'all' || loc?.streetId === streetFilter

    return matchesSearch && matchesStreet
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Planilha Geral de Estoque
          </h1>
          <p className="text-muted-foreground">
            Visualização completa de todos os materiais e localizações.
          </p>
        </div>
        <Button variant="outline" className="gap-2">
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
                  <SelectValue placeholder="Filtrar por Rua" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Ruas</SelectItem>
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
          <div className="rounded-md border-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="w-[150px]">ID Palete</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Rua</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Entrada
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPallets.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center h-32 text-muted-foreground"
                    >
                      Nenhum resultado encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPallets.map((pallet) => (
                    <TableRow key={pallet.id} className="hover:bg-slate-50">
                      <TableCell className="font-mono text-xs">
                        {pallet.id}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{pallet.materialName}</div>
                        <div className="text-xs text-muted-foreground max-w-[200px] truncate">
                          {pallet.description}
                        </div>
                      </TableCell>
                      <TableCell>{getStreetName(pallet.locationId)}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getLocationName(pallet.locationId)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {pallet.quantity}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {format(new Date(pallet.entryDate), 'dd/MM/yy HH:mm', {
                          locale: ptBR,
                        })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="text-xs text-center text-muted-foreground">
        Mostrando {filteredPallets.length} de {pallets.length} registros
      </div>
    </div>
  )
}
