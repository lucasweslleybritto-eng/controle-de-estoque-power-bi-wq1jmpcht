import { useState } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Image as ImageIcon,
  Upload,
} from 'lucide-react'
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
import { fileToBase64 } from '@/lib/utils'

export function MaterialsTab() {
  const {
    materials,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    currentUser,
  } = useInventoryStore()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [isLoadingImage, setIsLoadingImage] = useState(false)

  const [formData, setFormData] = useState<{
    name: string
    type: MaterialType
    description: string
    image: string
    minStock: number
  }>({
    name: '',
    type: 'TRP',
    description: '',
    image: '',
    minStock: 0,
  })

  // RBAC Check
  const canEdit =
    currentUser?.role === 'ADMIN' || currentUser?.role === 'OPERATOR'

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
    setFormData({
      name: '',
      type: 'TRP',
      description: '',
      image: '',
      minStock: 0,
    })
  }

  const openEdit = (material: Material) => {
    setEditingMaterial(material)
    setFormData({
      name: material.name,
      type: material.type,
      description: material.description || '',
      image: material.image || '',
      minStock: material.minStock || 0,
    })
    setIsAddOpen(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'Arquivo inválido',
        description: 'Por favor, selecione uma imagem.',
      })
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'Arquivo muito grande',
        description: 'A imagem deve ter no máximo 2MB.',
      })
      return
    }

    try {
      setIsLoadingImage(true)
      const base64 = await fileToBase64(file)
      setFormData((prev) => ({ ...prev, image: base64 }))
      toast({ title: 'Imagem carregada com sucesso' })
    } catch (error) {
      console.error('Image upload failed', error)
      toast({
        variant: 'destructive',
        title: 'Erro no upload',
        description: 'Falha ao processar a imagem.',
      })
    } finally {
      setIsLoadingImage(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
          <h3 className="text-lg font-medium">Catálogo de Fardamento</h3>
          <p className="text-sm text-muted-foreground">
            Base de dados mestre para itens de estoque (TRP/TRD).
          </p>
        </div>
        {canEdit && (
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Novo Material
          </Button>
        )}
      </div>

      <div className="flex items-center space-x-2 bg-background p-2 rounded-md border">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar material..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-0 focus-visible:ring-0 shadow-none"
        />
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">Img</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Descrição Padrão</TableHead>
              <TableHead>Estoque Mín.</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMaterials.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  Nenhum material encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredMaterials.map((material) => (
                <TableRow key={material.id}>
                  <TableCell>
                    {material.image ? (
                      <div className="h-8 w-8 rounded overflow-hidden bg-slate-100">
                        <img
                          src={material.image}
                          alt={material.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center">
                        <ImageIcon className="h-4 w-4 text-slate-300" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{material.name}</TableCell>
                  <TableCell>{material.description}</TableCell>
                  <TableCell>
                    {material.minStock ? material.minStock : '-'}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        material.type === 'TRD'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                      }`}
                    >
                      {material.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {canEdit && (
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
                                Isso removerá <strong>{material.name}</strong>{' '}
                                do catálogo.
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
                    )}
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
                placeholder="Ex: Gandola Camuflada"
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
              <Label>Estoque Mínimo (Alerta)</Label>
              <Input
                type="number"
                value={formData.minStock}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minStock: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">
                Quantidade mínima para gerar alerta.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Imagem</Label>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 rounded border bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                    {formData.image ? (
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Label
                      htmlFor="image-upload"
                      className="cursor-pointer inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
                    >
                      <Upload className="h-4 w-4" />
                      {isLoadingImage
                        ? 'Carregando...'
                        : 'Carregar Foto do Dispositivo'}
                    </Label>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isLoadingImage}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Max: 2MB. A imagem será salva localmente.
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Ou use uma URL
                    </span>
                  </div>
                </div>

                <Input
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
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
