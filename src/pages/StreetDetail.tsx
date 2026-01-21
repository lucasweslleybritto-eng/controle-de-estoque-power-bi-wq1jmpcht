import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Filter, ArrowLeft, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import useInventoryStore from '@/stores/useInventoryStore'
import { cn } from '@/lib/utils'

export default function StreetDetail() {
  const { id } = useParams<{ id: string }>()
  const {
    streets,
    getLocationsByStreet,
    getPalletsByLocation,
    getLocationStatus,
  } = useInventoryStore()
  const [showEmptyOnly, setShowEmptyOnly] = useState(false)
  const [showOccupiedOnly, setShowOccupiedOnly] = useState(false)

  const street = streets.find((s) => s.id === id)

  if (!street) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Rua não encontrada
      </div>
    )
  }

  const locations = getLocationsByStreet(street.id)

  const filteredLocations = locations.filter((loc) => {
    const status = getLocationStatus(loc.id)
    if (showEmptyOnly && status !== 'empty') return false
    if (showOccupiedOnly && status !== 'occupied') return false
    return true
  })

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <Layers className="h-8 w-8 text-slate-400" />
              {street.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerenciamento de posições • {locations.length} Total
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-lg border shadow-sm">
          <div className="flex items-center space-x-2">
            <Switch
              id="show-empty"
              checked={showEmptyOnly}
              onCheckedChange={(checked) => {
                setShowEmptyOnly(checked)
                if (checked) setShowOccupiedOnly(false)
              }}
            />
            <Label htmlFor="show-empty" className="text-sm cursor-pointer">
              Apenas Vazios
            </Label>
          </div>
          <div className="h-4 w-[1px] bg-border hidden sm:block" />
          <div className="flex items-center space-x-2">
            <Switch
              id="show-occupied"
              checked={showOccupiedOnly}
              onCheckedChange={(checked) => {
                setShowOccupiedOnly(checked)
                if (checked) setShowEmptyOnly(false)
              }}
            />
            <Label htmlFor="show-occupied" className="text-sm cursor-pointer">
              Apenas Ocupados
            </Label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {filteredLocations.map((location) => {
          const status = getLocationStatus(location.id)
          const pallets = getPalletsByLocation(location.id)
          const isOccupied = status === 'occupied'

          return (
            <Link key={location.id} to={`/location/${location.id}`}>
              <Button
                variant="outline"
                className={cn(
                  'w-full h-32 flex flex-col items-center justify-center gap-2 relative transition-all duration-300 hover:scale-[1.03] border-2',
                  isOccupied
                    ? 'bg-green-50/50 hover:bg-green-100 border-green-200 hover:border-green-400 text-green-900'
                    : 'bg-red-50/50 hover:bg-red-100 border-red-200 hover:border-red-400 text-red-900',
                )}
              >
                <span className="text-2xl font-bold tracking-tighter">
                  {location.name}
                </span>

                {isOccupied ? (
                  <div className="flex flex-col items-center gap-1">
                    <Badge
                      variant="secondary"
                      className="bg-green-200/50 text-green-800 hover:bg-green-300/50 border-0 text-[10px] px-1.5 h-5"
                    >
                      {pallets.length} Palete{pallets.length > 1 ? 's' : ''}
                    </Badge>
                    <span className="text-[10px] opacity-70 truncate max-w-[90%] text-center px-1">
                      {pallets[0]?.materialName}
                    </span>
                  </div>
                ) : (
                  <Badge
                    variant="outline"
                    className="border-red-200 bg-red-100/50 text-red-700 text-[10px] px-2 h-5"
                  >
                    Vazio
                  </Badge>
                )}

                <div
                  className={cn(
                    'absolute top-2 right-2 w-2 h-2 rounded-full',
                    isOccupied ? 'bg-green-500 animate-pulse' : 'bg-red-500',
                  )}
                />
              </Button>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
