import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Package, Box, ArrowRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import useInventoryStore from '@/stores/useInventoryStore'
import { cn } from '@/lib/utils'

export default function Index() {
  const { streets, pallets, locations, getLocationsByStreet } =
    useInventoryStore()
  const [searchQuery, setSearchQuery] = useState('')

  const totalCapacity = locations.length
  const occupiedSlots = pallets.length
  const emptySlots = totalCapacity - occupiedSlots
  const occupancyRate = Math.round((occupiedSlots / totalCapacity) * 100)

  const filteredStreets = streets.filter((street) =>
    street.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Visão Geral do Armazém
          </h1>
          <p className="text-muted-foreground mt-1">
            Selecione uma rua para gerenciar o estoque.
          </p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar rua, material ou ID..."
            className="pl-10 bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ocupação Total
            </CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupancyRate}%</div>
            <p className="text-xs text-muted-foreground">
              {occupiedSlots} posições ocupadas
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Posições Livres
            </CardTitle>
            <Box className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {emptySlots}
            </div>
            <p className="text-xs text-muted-foreground">
              Disponíveis para armazenamento
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Ruas
            </CardTitle>
            <ArrowRight className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {streets.length}
            </div>
            <p className="text-xs text-muted-foreground">Setores ativos</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredStreets.map((street) => {
          const streetLocations = getLocationsByStreet(street.id)
          const streetOccupied = streetLocations.filter((l) =>
            pallets.some((p) => p.locationId === l.id),
          ).length
          const streetTotal = streetLocations.length
          const streetOccupancy = Math.round(
            (streetOccupied / streetTotal) * 100,
          )

          return (
            <Link
              key={street.id}
              to={`/street/${street.id}`}
              className="group block h-full"
            >
              <Card className="h-full hover:border-primary/50 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden border-t-4 border-t-slate-200 group-hover:border-t-primary">
                <CardHeader className="bg-slate-50 border-b pb-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-2xl font-bold text-slate-800">
                      {street.name}
                    </CardTitle>
                    <span className="text-xs font-semibold px-2 py-1 bg-white border rounded-full text-slate-600">
                      {streetTotal} Slots
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Ocupação</span>
                        <span className="font-medium">{streetOccupancy}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full transition-all duration-500',
                            streetOccupancy > 80
                              ? 'bg-red-500'
                              : streetOccupancy > 50
                                ? 'bg-yellow-500'
                                : 'bg-green-500',
                          )}
                          style={{ width: `${streetOccupancy}%` }}
                        />
                      </div>
                    </div>
                    <div className="pt-2 flex items-center text-primary text-sm font-medium group-hover:translate-x-1 transition-transform">
                      Ver Detalhes <ArrowRight className="ml-1 h-3 w-3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
