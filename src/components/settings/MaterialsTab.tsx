import { useState } from 'react'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useInventoryStore from '@/stores/useInventoryStore'
import { useToast } from '@/hooks/use-toast'
import { Material, MaterialType } from '@/types'

export function MaterialsTab() {
  const { materials, addMaterial, updateMaterial, deleteMaterial } =
    useInventoryStore()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)

  const [formData, setFormData] = useState<{
    name: string
    type: MaterialType
    description: string
  }>({
    name: '',
    type: 'TRP',
    description: '',
  })

  const filteredMaterials = materials.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSave = () => {
    if (!formData.name.trim()) return

    if (editingMaterial) {
      updateMaterial(editingMaterial.id, formData)
      toast({ title: 'Material atualizado' })
    } else {
      addMaterial(formData)
      toast({ title: 'Material criado' })
    }
    closeDialog()
  }

  const closeDialog = () => {
    setIsAddOpen(false)
    setEditingMaterial(null)
    setFormData({ name: '', type: 'TRP', description: '' })
  }

  const openEdit = (material: Material) => {
    setEditingMaterial(material)
    setFormData({
      name: material.name,
      type: material.type,
      description: material.description || '',
    })
    setIsAddOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
          <h3 className="text-lg font-medium">Catálogo de Materiais</h3>
          <p className="text-sm text-muted-foreground">
            Base de dados mestre para itens de estoque (TRP/TRD).
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo Material
        </Button>
      </div>

      <div className="flex items-center space-x-2 bg-white p-2 rounded-md border">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar material..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-0 focus-visible:ring-0"
        />
      </div>

      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Descrição Padrão</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMaterials.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-muted-foreground"
                >
                  Nenhum material encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredMaterials.map((material) => (
                <TableRow key={material.id}>
                  <TableCell className="font-medium">{material.name}</TableCell>
                  <TableCell>{material.description}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        material.type === 'TRD'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {material.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(material)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Excluir Material?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Isso removerá <strong>{material.name}</strong> do
                              catálogo. Itens em estoque não serão afetados, mas
                              a referência será perdida.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive"
                              onClick={() => {
                                deleteMaterial(material.id)
                                toast({ title: 'Material removido' })
                              }}
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isAddOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingMaterial ? 'Editar Material' : 'Novo Material'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome do Material</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ex: Motor Elétrico"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição Padrão</Label>
              <Input
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Ex: Especificações técnicas..."
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo Padrão</Label>
              <Select
                value={formData.type}
                onValueChange={(v: MaterialType) =>
                  setFormData({ ...formData, type: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TRP">TRP (Entrada)</SelectItem>
                  <SelectItem value="TRD">TRD (Rua)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
