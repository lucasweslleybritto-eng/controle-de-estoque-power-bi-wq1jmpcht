import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  ArrowLeft,
  Box,
  Move,
  Trash2,
  Edit2,
  Plus,
  Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import useInventoryStore from '@/stores/useInventoryStore'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function LocationDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const {
    locations,
    pallets,
    getPalletsByLocation,
    getLocationStatus,
    updatePallet,
    movePallet,
    clearLocation,
    addPallet,
  } = useInventoryStore()

  const [isMoveOpen, setIsMoveOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedPallet, setSelectedPallet] = useState<any>(null)

  // Forms states
  const [moveTargetId, setMoveTargetId] = useState('')
  const [editForm, setEditForm] = useState({ quantity: 0, description: '' })
  const [newPalletForm, setNewPalletForm] = useState({
    materialName: '',
    description: '',
    quantity: 1,
  })
  const [isAddOpen, setIsAddOpen] = useState(false)

  const location = locations.find((l) => l.id === id)

  if (!location) return <div>Localização não encontrada</div>

  const locationPallets = getPalletsByLocation(location.id)
  const status = getLocationStatus(location.id)
  const isOccupied = status === 'occupied'

  // Available locations for moving (naive implementation for demo)
  const availableLocations = locations.filter(
    (l) => getLocationStatus(l.id) === 'empty' && l.id !== location.id,
  )

  const handleMove = () => {
    if (selectedPallet && moveTargetId) {
      movePallet(selectedPallet.id, moveTargetId)
      setIsMoveOpen(false)
      toast({
        title: 'Palete Movido',
        description: `Palete movido para ${locations.find((l) => l.id === moveTargetId)?.name}`,
      })
      navigate(`/street/${location.streetId}`)
    }
  }

  const handleEdit = () => {
    if (selectedPallet) {
      updatePallet(selectedPallet.id, editForm)
      setIsEditOpen(false)
      toast({
        title: 'Atualizado',
        description: 'Informações do palete atualizadas.',
      })
    }
  }

  const handleClear = () => {
    clearLocation(location.id)
    toast({
      title: 'Localização Esvaziada',
      description: 'Todos os paletes foram removidos.',
    })
  }

  const handleAdd = () => {
    addPallet({
      id: `plt-${Date.now()}`,
      locationId: location.id,
      materialName: newPalletForm.materialName,
      description: newPalletForm.description,
      quantity: newPalletForm.quantity,
      entryDate: new Date().toISOString(),
    })
    setIsAddOpen(false)
    setNewPalletForm({ materialName: '', description: '', quantity: 1 })
    toast({
      title: 'Palete Adicionado',
      description: 'Novo material registrado na localização.',
    })
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <Link to={`/street/${location.streetId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Localização {location.name}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge
              variant={isOccupied ? 'default' : 'destructive'}
              className={cn(
                'text-sm px-3 py-0.5',
                isOccupied
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700',
              )}
            >
              {isOccupied ? 'Ocupado' : 'Vazio'}
            </Badge>
            <span className="text-muted-foreground text-sm">
              ID: {location.id}
            </span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Conteúdo Atual</CardTitle>
              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-primary">
                    <Plus className="h-4 w-4 mr-2" /> Adicionar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Palete</DialogTitle>
                    <DialogDescription>
                      Insira os dados do novo material.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Material</Label>
                      <Input
                        value={newPalletForm.materialName}
                        onChange={(e) =>
                          setNewPalletForm({
                            ...newPalletForm,
                            materialName: e.target.value,
                          })
                        }
                        placeholder="Ex: Motor WEG"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Descrição</Label>
                      <Input
                        value={newPalletForm.description}
                        onChange={(e) =>
                          setNewPalletForm({
                            ...newPalletForm,
                            description: e.target.value,
                          })
                        }
                        placeholder="Detalhes..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Quantidade</Label>
                      <Input
                        type="number"
                        value={newPalletForm.quantity}
                        onChange={(e) =>
                          setNewPalletForm({
                            ...newPalletForm,
                            quantity: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAdd}>Salvar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {locationPallets.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
                  <Box className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>Nenhum palete nesta localização</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Material</TableHead>
                        <TableHead>Qtd</TableHead>
                        <TableHead className="hidden sm:table-cell">
                          Entrada
                        </TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {locationPallets.map((pallet) => (
                        <TableRow key={pallet.id}>
                          <TableCell>
                            <div className="font-medium">
                              {pallet.materialName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {pallet.description}
                            </div>
                          </TableCell>
                          <TableCell className="font-bold">
                            {pallet.quantity}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                            {format(new Date(pallet.entryDate), 'dd/MM/yyyy', {
                              locale: ptBR,
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Dialog
                                open={isEditOpen}
                                onOpenChange={setIsEditOpen}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setSelectedPallet(pallet)
                                      setEditForm({
                                        quantity: pallet.quantity,
                                        description: pallet.description,
                                      })
                                    }}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Editar Palete</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <Label>Descrição</Label>
                                      <Input
                                        value={editForm.description}
                                        onChange={(e) =>
                                          setEditForm({
                                            ...editForm,
                                            description: e.target.value,
                                          })
                                        }
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Quantidade</Label>
                                      <Input
                                        type="number"
                                        value={editForm.quantity}
                                        onChange={(e) =>
                                          setEditForm({
                                            ...editForm,
                                            quantity: parseInt(e.target.value),
                                          })
                                        }
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button onClick={handleEdit}>
                                      Salvar Alterações
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>

                              <Dialog
                                open={isMoveOpen}
                                onOpenChange={setIsMoveOpen}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setSelectedPallet(pallet)}
                                  >
                                    <Move className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Mover Palete</DialogTitle>
                                    <DialogDescription>
                                      Selecione o novo destino para o palete.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="py-4">
                                    <Label>Nova Localização</Label>
                                    <Select onValueChange={setMoveTargetId}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecione um local vazio..." />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {availableLocations.map((loc) => (
                                          <SelectItem
                                            key={loc.id}
                                            value={loc.id}
                                          >
                                            {loc.name} (Vazio)
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <DialogFooter>
                                    <Button
                                      onClick={handleMove}
                                      disabled={!moveTargetId}
                                    >
                                      Confirmar Movimentação
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-50">
            <CardHeader>
              <CardTitle className="text-lg">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="w-full justify-start"
                    disabled={!isOccupied}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Esvaziar Localização
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Isso removerá todos os paletes desta localização. Esta
                      ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClear}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Sim, esvaziar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button
                variant="outline"
                className="w-full justify-start text-muted-foreground"
                disabled
              >
                <Calendar className="h-4 w-4 mr-2" /> Agendar Inventário
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Informações</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Capacidade</span>
                <span>1 Palete</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo</span>
                <span>Standard Rack</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Zona</span>
                <span>Seca</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
