import { useState } from 'react'
import { Plus, Pencil, Trash2, ChevronRight, Building } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import useInventoryStore from '@/stores/useInventoryStore'
import { useToast } from '@/hooks/use-toast'

export function WarehouseTab() {
  const {
    streets,
    getLocationsByStreet,
    addStreet,
    updateStreet,
    deleteStreet,
    addLocation,
    updateLocation,
    deleteLocation,
    currentUser,
  } = useInventoryStore()
  const { toast } = useToast()

  const [editStreet, setEditStreet] = useState<{
    id: string
    name: string
  } | null>(null)
  const [newStreetName, setNewStreetName] = useState('')
  const [isAddStreetOpen, setIsAddStreetOpen] = useState(false)

  const [editingLocation, setEditingLocation] = useState<{
    id: string
    name: string
  } | null>(null)
  const [newLocation, setNewLocation] = useState<{
    streetId: string
    name: string
  } | null>(null)

  // Roles permissions
  const canEdit =
    currentUser?.role === 'ADMIN' || currentUser?.role === 'OPERATOR'
  const canDelete = currentUser?.role === 'ADMIN'

  const handleAddStreet = () => {
    if (newStreetName.trim()) {
      addStreet(newStreetName)
      setNewStreetName('')
      setIsAddStreetOpen(false)
      toast({ title: 'Rua adicionada com sucesso' })
    }
  }

  const handleUpdateStreet = () => {
    if (editStreet && editStreet.name.trim()) {
      updateStreet(editStreet.id, editStreet.name)
      setEditStreet(null)
      toast({ title: 'Rua atualizada' })
    }
  }

  const handleAddLocation = () => {
    if (newLocation && newLocation.name.trim()) {
      addLocation(newLocation.streetId, newLocation.name)
      setNewLocation(null)
      toast({ title: 'Local adicionado' })
    }
  }

  const handleUpdateLocation = () => {
    if (editingLocation && editingLocation.name.trim()) {
      updateLocation(editingLocation.id, editingLocation.name)
      setEditingLocation(null)
      toast({ title: 'Local atualizado' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Estrutura do Armazém</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie ruas, prédios e locais de armazenamento.
          </p>
        </div>
        {canEdit && (
          <Dialog open={isAddStreetOpen} onOpenChange={setIsAddStreetOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Nova Rua
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Nova Rua</DialogTitle>
              </DialogHeader>
              <div className="py-4 space-y-2">
                <Label>Nome da Rua</Label>
                <Input
                  value={newStreetName}
                  onChange={(e) => setNewStreetName(e.target.value)}
                  placeholder="Ex: Rua C"
                />
              </div>
              <DialogFooter>
                <Button onClick={handleAddStreet}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Accordion type="multiple" className="w-full space-y-4">
        {streets.map((street) => (
          <AccordionItem
            key={street.id}
            value={street.id}
            className="border rounded-lg px-4 bg-card"
          >
            <div className="flex items-center justify-between py-2">
              <AccordionTrigger className="hover:no-underline py-2">
                <span className="font-semibold text-lg flex items-center">
                  <Building className="mr-2 h-5 w-5 text-muted-foreground" />
                  {street.name}
                  <span className="ml-2 text-xs font-normal text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    {getLocationsByStreet(street.id).length} Locais
                  </span>
                </span>
              </AccordionTrigger>
              <div className="flex items-center gap-2 mr-4">
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditStreet(street)
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                {canDelete && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Rua?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação excluirá a rua{' '}
                          <strong>{street.name}</strong> e todos os seus locais
                          e materiais associados. Essa ação não pode ser
                          desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive hover:bg-destructive/90"
                          onClick={() => deleteStreet(street.id)}
                        >
                          Sim, Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
            <AccordionContent className="pb-4 pt-2">
              <div className="space-y-2 pl-4 border-l-2 border-slate-100 dark:border-slate-800 ml-2">
                {getLocationsByStreet(street.id).map((location) => (
                  <div
                    key={location.id}
                    className="flex items-center justify-between group p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-md transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="font-medium">{location.name}</span>
                      </div>
                    </div>
                    {canEdit && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditingLocation(location)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Excluir Local?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Remover o local <strong>{location.name}</strong>
                                ? Materiais neste local serão perdidos.
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
                  </div>
                ))}
                {canEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 border-dashed text-muted-foreground hover:text-primary"
                    onClick={() =>
                      setNewLocation({ streetId: street.id, name: '' })
                    }
                  >
                    <Plus className="mr-2 h-3 w-3" /> Adicionar Local em{' '}
                    {street.name}
                  </Button>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Edit Street Dialog */}
      <Dialog
        open={!!editStreet}
        onOpenChange={(open) => !open && setEditStreet(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Rua</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label>Nome da Rua</Label>
            <Input
              value={editStreet?.name || ''}
              onChange={(e) =>
                setEditStreet((prev) =>
                  prev ? { ...prev, name: e.target.value } : null,
                )
              }
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateStreet}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Location Dialog */}
      <Dialog
        open={!!newLocation}
        onOpenChange={(open) => !open && setNewLocation(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Local</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label>Nome do Local</Label>
            <Input
              value={newLocation?.name || ''}
              onChange={(e) =>
                setNewLocation((prev) =>
                  prev ? { ...prev, name: e.target.value } : null,
                )
              }
              placeholder="Ex: A-101"
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button onClick={handleAddLocation}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Location Dialog */}
      <Dialog
        open={!!editingLocation}
        onOpenChange={(open) => !open && setEditingLocation(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Local</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={editingLocation?.name || ''}
                onChange={(e) =>
                  setEditingLocation((prev) =>
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
