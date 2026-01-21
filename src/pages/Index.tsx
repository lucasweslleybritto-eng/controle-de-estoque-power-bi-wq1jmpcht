import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  Package,
  Box,
  ArrowRight,
  Plus,
  Pencil,
  Trash2,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  Building,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { Label } from '@/components/ui/label'
import useInventoryStore from '@/stores/useInventoryStore'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

export default function Index() {
  const {
    streets,
    pallets,
    locations,
    getLocationsByStreet,
    addStreet,
    updateStreet,
    deleteStreet,
    moveStreet,
    currentUser,
  } = useInventoryStore()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newStreetName, setNewStreetName] = useState('')
  const [editStreet, setEditStreet] = useState<{
    id: string
    name: string
  } | null>(null)

  const canEdit =
    currentUser?.role === 'ADMIN' || currentUser?.role === 'OPERATOR'

  const totalCapacity = locations.length
  const occupiedSlots = pallets.filter(
    (p) => p.locationId !== 'TRP_AREA',
  ).length
  const emptySlots = totalCapacity - occupiedSlots
  const occupancyRate =
    totalCapacity > 0 ? Math.round((occupiedSlots / totalCapacity) * 100) : 0

  const filteredStreets = streets.filter((street) =>
    street.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddStreet = () => {
    if (newStreetName.trim()) {
      addStreet(newStreetName)
      setNewStreetName('')
      setIsAddOpen(false)
      toast({
        title: 'Rua adicionada',
        description: `Rua ${newStreetName} criada com sucesso.`,
      })
    }
  }

  const handleUpdateStreet = () => {
    if (editStreet && editStreet.name.trim()) {
      updateStreet(editStreet.id, editStreet.name)
      setEditStreet(null)
      toast({ title: 'Rua atualizada', description: 'Nome da rua alterado.' })
    }
  }

  const handleMoveStreet = (
    id: string,
    direction: 'up' | 'down',
    e: React.MouseEvent,
  ) => {
    e.preventDefault()
    e.stopPropagation()
    moveStreet(id, direction)
  }

  if (streets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center animate-fade-in">
        <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-full">
          <Building className="h-12 w-12 text-slate-400" />
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="text-2xl font-bold tracking-tight">
            O armazém está vazio
          </h2>
          <p className="text-muted-foreground">
            Parece que não há ruas cadastradas no momento. Comece criando a
            estrutura do seu armazém para gerenciar o estoque.
          </p>
        </div>
        {canEdit && (
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="mt-4">
                <Plus className="mr-2 h-4 w-4" /> Criar Primeira Rua
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Nova Rua</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <Label>Nome da Rua</Label>
                <Input
                  value={newStreetName}
                  onChange={(e) => setNewStreetName(e.target.value)}
                  placeholder="Ex: Rua A"
                  className="mt-2"
                />
              </div>
              <DialogFooter>
                <Button onClick={handleAddStreet}>Criar Rua</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <LayoutDashboard className="h-8 w-8 text-primary" />
            Estoque Classe 2
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestão de Ruas e Armazenamento
          </p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar rua..."
              className="pl-10 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {canEdit && (
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" /> Nova Rua
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Nova Rua</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <Label>Nome da Rua</Label>
                  <Input
                    value={newStreetName}
                    onChange={(e) => setNewStreetName(e.target.value)}
                    placeholder="Ex: Rua A"
                    className="mt-2"
                  />
                </div>
                <DialogFooter>
                  <Button onClick={handleAddStreet}>Salvar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ocupação TRD
            </CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupancyRate}%</div>
            <p className="text-xs text-muted-foreground">
              {occupiedSlots} de {totalCapacity} slots ocupados
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-600 shadow-sm hover:shadow-md transition-shadow">
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
              Disponíveis nas ruas
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-600 shadow-sm hover:shadow-md transition-shadow">
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
        {filteredStreets.map((street, index) => {
          const streetLocations = getLocationsByStreet(street.id)
          const streetOccupied = streetLocations.filter((l) =>
            pallets.some((p) => p.locationId === l.id),
          ).length
          const streetTotal = streetLocations.length
          const streetOccupancy =
            streetTotal > 0
              ? Math.round((streetOccupied / streetTotal) * 100)
              : 0

          const isFirst = index === 0
          const isLast = index === filteredStreets.length - 1

          return (
            <div key={street.id} className="group relative block h-full">
              {canEdit && (
                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex flex-wrap justify-end gap-1">
                  {/* Reordering Controls */}
                  <div className="flex bg-background/80 backdrop-blur-sm rounded-md border shadow-sm mr-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-6 hover:bg-accent rounded-l-md rounded-r-none"
                      onClick={(e) => handleMoveStreet(street.id, 'up', e)}
                      disabled={isFirst || searchQuery !== ''}
                      title="Mover para trás"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="w-[1px] bg-border h-full" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-6 hover:bg-accent rounded-r-md rounded-l-none"
                      onClick={(e) => handleMoveStreet(street.id, 'down', e)}
                      disabled={isLast || searchQuery !== ''}
                      title="Mover para frente"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  <Dialog
                    open={editStreet?.id === street.id}
                    onOpenChange={(open) => !open && setEditStreet(null)}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          setEditStreet({ id: street.id, name: street.name })
                        }
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Editar Rua</DialogTitle>
                      </DialogHeader>
                      <div className="py-4">
                        <Label>Nome</Label>
                        <Input
                          value={editStreet?.name || ''}
                          onChange={(e) =>
                            setEditStreet((prev) =>
                              prev ? { ...prev, name: e.target.value } : null,
                            )
                          }
                        />
                      </div>
                      <DialogFooter>
                        <Button onClick={handleUpdateStreet}>Salvar</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Rua?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Isso removerá a rua, todas as suas localizações e
                          materiais alocados.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive hover:bg-destructive/90"
                          onClick={() => {
                            deleteStreet(street.id)
                            toast({
                              title: 'Rua removida',
                              variant: 'destructive',
                            })
                          }}
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
              <Link to={`/street/${street.id}`} className="block h-full">
                <Card className="h-full hover:border-primary/50 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden border-t-4 border-t-muted group-hover:border-t-primary">
                  <CardHeader className="bg-muted/20 border-b pb-4">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-2xl font-bold">
                        {street.name}
                      </CardTitle>
                      <span className="text-xs font-semibold px-2 py-1 bg-background border rounded-full text-muted-foreground">
                        {streetTotal} Slots
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Ocupação
                          </span>
                          <span className="font-medium">
                            {streetOccupancy}%
                          </span>
                        </div>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full transition-all duration-500',
                              streetOccupancy > 90
                                ? 'bg-green-600'
                                : streetOccupancy < 10
                                  ? 'bg-red-500'
                                  : 'bg-green-500',
                            )}
                            style={{ width: `${streetOccupancy}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-muted-foreground px-1">
                          <span>Vazio (Vermelho)</span>
                          <span>Cheio (Verde)</span>
                        </div>
                      </div>
                      <div className="pt-2 flex items-center text-primary text-sm font-medium group-hover:translate-x-1 transition-transform">
                        Ver Detalhes <ArrowRight className="ml-1 h-3 w-3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
