import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Layers, Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import useInventoryStore from '@/stores/useInventoryStore'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

export default function StreetDetail() {
  const { id } = useParams<{ id: string }>()
  const {
    streets,
    getLocationsByStreet,
    getPalletsByLocation,
    getLocationStatus,
    addLocation,
    updateLocation,
    deleteLocation,
  } = useInventoryStore()
  const { toast } = useToast()

  const [showEmptyOnly, setShowEmptyOnly] = useState(false)
  const [showOccupiedOnly, setShowOccupiedOnly] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newLocationName, setNewLocationName] = useState('')
  const [editLocation, setEditLocation] = useState<{
    id: string
    name: string
  } | null>(null)

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

  const handleAddLocation = () => {
    if (newLocationName.trim()) {
      addLocation(street.id, newLocationName)
      setNewLocationName('')
      setIsAddOpen(false)
      toast({
        title: 'Localização criada',
        description: `Local ${newLocationName} adicionado à rua.`,
      })
    }
  }

  const handleUpdateLocation = () => {
    if (editLocation && editLocation.name.trim()) {
      updateLocation(editLocation.id, editLocation.name)
      setEditLocation(null)
      toast({ title: 'Localização atualizada' })
    }
  }

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
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Layers className="h-8 w-8 text-muted-foreground" />
              {street.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerenciamento de posições • {locations.length} Total
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Adicionar Prédio/Local
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Local em {street.name}</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <Label>Nome do Local (Ex: A-101)</Label>
                <Input
                  value={newLocationName}
                  onChange={(e) => setNewLocationName(e.target.value)}
                  className="mt-2"
                />
              </div>
              <DialogFooter>
                <Button onClick={handleAddLocation}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="flex items-center gap-4 bg-card p-3 rounded-lg border shadow-sm">
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
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {filteredLocations.map((location) => {
          const status = getLocationStatus(location.id)
          const pallets = getPalletsByLocation(location.id)
          const isOccupied = status === 'occupied'

          return (
            <div key={location.id} className="relative group">
              <div className="absolute top-2 right-2 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-6 w-6 shadow-sm"
                  onClick={(e) => {
                    e.preventDefault()
                    setEditLocation({
                      id: location.id,
                      name: location.name,
                    })
                  }}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-6 w-6 shadow-sm"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir Localização?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação removerá o local e todos os materiais contidos
                        nele.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive"
                        onClick={() => deleteLocation(location.id)}
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <Link to={`/location/${location.id}`} className="block">
                <Button
                  variant="outline"
                  className={cn(
                    'w-full h-32 flex flex-col items-center justify-center gap-2 relative transition-all duration-300 hover:scale-[1.03] border-2 shadow-sm',
                    isOccupied
                      ? 'bg-green-600/10 dark:bg-green-900/20 hover:bg-green-600/20 border-green-600 text-green-700 dark:text-green-400'
                      : 'bg-red-600/10 dark:bg-red-900/20 hover:bg-red-600/20 border-red-600 text-red-700 dark:text-red-400',
                  )}
                >
                  <span className="text-2xl font-bold tracking-tighter">
                    {location.name}
                  </span>

                  {isOccupied ? (
                    <div className="flex flex-col items-center gap-1">
                      <Badge
                        variant="secondary"
                        className="bg-green-600 text-white hover:bg-green-700 border-0 text-[10px] px-1.5 h-5"
                      >
                        {pallets.length} Item{pallets.length > 1 ? 's' : ''}
                      </Badge>
                      <span className="text-[10px] opacity-90 truncate max-w-[90%] text-center px-1 font-medium">
                        {pallets[0]?.materialName}
                      </span>
                    </div>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-red-600 bg-red-600 text-white text-[10px] px-2 h-5"
                    >
                      Vazio
                    </Badge>
                  )}
                </Button>
              </Link>
            </div>
          )
        })}
      </div>

      <Dialog
        open={!!editLocation}
        onOpenChange={(open) => !open && setEditLocation(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Localização</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={editLocation?.name || ''}
                onChange={(e) =>
                  setEditLocation((prev) =>
                    prev ? { ...prev, name: e.target.value } : null,
                  )
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateLocation}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
