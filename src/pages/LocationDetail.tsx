import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Box, Trash2, Edit2, AlertTriangle } from 'lucide-react'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import useInventoryStore from '@/stores/useInventoryStore'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function LocationDetail() {
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()
  const {
    locations,
    getPalletsByLocation,
    getLocationStatus,
    updatePallet,
    clearLocation,
  } = useInventoryStore()

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedPallet, setSelectedPallet] = useState<any>(null)
  const [editForm, setEditForm] = useState({ quantity: 0, description: '' })

  const location = locations.find((l) => l.id === id)

  if (!location) return <div>Localização não encontrada</div>

  const locationPallets = getPalletsByLocation(location.id)
  const status = getLocationStatus(location.id)
  const isOccupied = status === 'occupied'
  const isVerification = status === 'verification'

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
            {isVerification ? (
              <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Necessita Verificação
              </Badge>
            ) : (
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
            )}
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
              <CardTitle>Conteúdo Atual (TRD)</CardTitle>
            </CardHeader>
            <CardContent>
              {locationPallets.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
                  <Box className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>Nenhum material alocado nesta localização</p>
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
                            <Badge
                              variant="outline"
                              className="mt-1 text-[10px]"
                            >
                              {pallet.type}
                            </Badge>
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
                      Isso removerá todos os materiais desta localização. Esta
                      ação será registrada como SAÍDA no histórico.
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Informações</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span>
                  {isVerification
                    ? 'Verificar'
                    : isOccupied
                      ? 'Ocupado'
                      : 'Livre'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo</span>
                <span>TRD (Rua)</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
