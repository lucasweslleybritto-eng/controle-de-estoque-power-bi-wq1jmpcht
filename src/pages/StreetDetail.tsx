import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Layers,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowRightCircle,
  Save,
  AlertTriangle,
} from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
    moveLocation,
    changeLocationStreet,
    currentUser,
  } = useInventoryStore()
  const { toast } = useToast()

  const [showEmptyOnly, setShowEmptyOnly] = useState(false)
  const [showOccupiedOnly, setShowOccupiedOnly] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newLocationName, setNewLocationName] = useState('')
  const [editLocation, setEditLocation] = useState<{
    id: string
    name: string
    needsRecount?: boolean
  } | null>(null)
  const [moveLocationDialog, setMoveLocationDialog] = useState<{
    locationId: string
    locationName: string
  } | null>(null)
  const [targetStreetId, setTargetStreetId] = useState<string>('')

  const canEdit =
    currentUser?.role === 'ADMIN' || currentUser?.role === 'OPERATOR'

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

  const isFiltering = showEmptyOnly || showOccupiedOnly

  const handleAddLocation = () => {
    if (newLocationName.trim()) {
      addLocation(street.id, newLocationName)
      setNewLocationName('')
      setIsAddOpen(false)
      toast({
        title: 'Salvo com sucesso',
        description: `Local ${newLocationName} adicionado.`,
      })
    }
  }

  const handleUpdateLocation = () => {
    if (editLocation && editLocation.name.trim()) {
      updateLocation(editLocation.id, {
        name: editLocation.name,
        needsRecount: editLocation.needsRecount,
      })
      setEditLocation(null)
      toast({
        title: 'Alterações salvas',
        description: 'Local atualizado.',
      })
    }
  }

  const handleMoveLocationOrder = (
    locationId: string,
    direction: 'up' | 'down',
    e: React.MouseEvent,
  ) => {
    e.preventDefault()
    e.stopPropagation()
    moveLocation(locationId, direction)
  }

  const handleChangeStreet = () => {
    if (moveLocationDialog && targetStreetId) {
      changeLocationStreet(moveLocationDialog.locationId, targetStreetId)
      toast({
        title: 'Local Movido',
        description: `${moveLocationDialog.locationName} transferido com sucesso.`,
      })
      setMoveLocationDialog(null)
      setTargetStreetId('')
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
          {canEdit && (
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
                  <Button onClick={handleAddLocation}>
                    <Save className="w-4 h-4 mr-2" /> Salvar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

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
        {filteredLocations.map((location, index) => {
          const status = getLocationStatus(location.id)
          const pallets = getPalletsByLocation(location.id)
          const isOccupied = status === 'occupied'
          const needsRecount = location.needsRecount
          const isFirst = index === 0
          const isLast = index === filteredLocations.length - 1

          return (
            <div key={location.id} className="relative group">
              {canEdit && (
                <div className="absolute top-2 right-2 z-20 flex flex-wrap justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!isFiltering && (
                    <div className="flex bg-background/90 backdrop-blur-sm rounded-md border shadow-sm mr-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-5 hover:bg-accent rounded-l-md rounded-r-none"
                        onClick={(e) =>
                          handleMoveLocationOrder(location.id, 'up', e)
                        }
                        disabled={isFirst}
                        title="Mover para trás"
                      >
                        <ChevronLeft className="h-3 w-3" />
                      </Button>
                      <div className="w-[1px] bg-border h-full" />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-5 hover:bg-accent rounded-r-md rounded-l-none"
                        onClick={(e) =>
                          handleMoveLocationOrder(location.id, 'down', e)
                        }
                        disabled={isLast}
                        title="Mover para frente"
                      >
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  )}

                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-6 w-6 shadow-sm"
                    title="Mover para outra Rua"
                    onClick={(e) => {
                      e.preventDefault()
                      setMoveLocationDialog({
                        locationId: location.id,
                        locationName: location.name,
                      })
                    }}
                  >
                    <ArrowRightCircle className="h-3 w-3" />
                  </Button>

                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-6 w-6 shadow-sm"
                    title="Editar"
                    onClick={(e) => {
                      e.preventDefault()
                      setEditLocation({
                        id: location.id,
                        name: location.name,
                        needsRecount: location.needsRecount,
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
                        title="Excluir"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Excluir Localização?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação removerá o local e todos os materiais
                          contidos nele.
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
              )}

              <Link to={`/location/${location.id}`} className="block">
                <Button
                  variant="outline"
                  className={cn(
                    'w-full h-32 flex flex-col items-center justify-center gap-2 relative transition-all duration-300 hover:scale-[1.03] border-2 shadow-sm',
                    needsRecount
                      ? 'bg-yellow-100 border-yellow-500 hover:bg-yellow-200 text-yellow-900 dark:bg-yellow-900/40 dark:text-yellow-200'
                      : isOccupied
                        ? 'bg-green-600/20 dark:bg-green-900/40 hover:bg-green-600/30 border-green-600 text-green-800 dark:text-green-300'
                        : 'bg-red-600/10 dark:bg-red-900/20 hover:bg-red-600/20 border-red-600 text-red-800 dark:text-red-400',
                  )}
                >
                  <span className="text-2xl font-bold tracking-tighter">
                    {location.name}
                  </span>

                  {needsRecount && (
                    <div className="absolute top-2 right-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    </div>
                  )}

                  {isOccupied ? (
                    <div className="flex flex-col items-center gap-1">
                      <Badge
                        variant="secondary"
                        className={cn(
                          'text-white border-0 text-[10px] px-1.5 h-5 pointer-events-none',
                          needsRecount ? 'bg-yellow-600' : 'bg-green-600',
                        )}
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
                      className="border-red-600 bg-red-600 text-white text-[10px] px-2 h-5 pointer-events-none"
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
            <div className="flex items-center space-x-2">
              <Switch
                id="needs-recount"
                checked={editLocation?.needsRecount || false}
                onCheckedChange={(c) =>
                  setEditLocation((prev) =>
                    prev ? { ...prev, needsRecount: c } : null,
                  )
                }
              />
              <Label
                htmlFor="needs-recount"
                className="flex items-center gap-2"
              >
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                Necessita Recontagem
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateLocation}>
              <Save className="w-4 h-4 mr-2" /> Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!moveLocationDialog}
        onOpenChange={(open) => !open && setMoveLocationDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mover Local para outra Rua</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Selecione a nova rua para o local{' '}
              <strong>{moveLocationDialog?.locationName}</strong>.
            </p>
            <div className="space-y-2">
              <Label>Nova Rua de Destino</Label>
              <Select value={targetStreetId} onValueChange={setTargetStreetId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a rua..." />
                </SelectTrigger>
                <SelectContent>
                  {streets
                    .filter((s) => s.id !== street.id)
                    .map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleChangeStreet} disabled={!targetStreetId}>
              <Save className="w-4 h-4 mr-2" /> Confirmar Mudança
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
