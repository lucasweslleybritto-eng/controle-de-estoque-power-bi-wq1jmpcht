import { useState, useRef } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Image as ImageIcon,
  Upload,
  FileSpreadsheet,
  AlertCircle,
  Download,
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
  DialogDescription,
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
import { z } from 'zod'

const importSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  type: z.enum(['TRP', 'TRD']).default('TRP'),
  minStock: z.number().min(0).default(0),
  initialQuantity: z.number().min(0).default(0),
})

export function MaterialsTab() {
  const {
    materials,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    importMaterials,
    currentUser,
  } = useInventoryStore()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [isLoadingImage, setIsLoadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (
      !file.name.endsWith('.csv') &&
      file.type !== 'text/csv' &&
      file.type !== 'application/vnd.ms-excel'
    ) {
      toast({
        variant: 'destructive',
        title: 'Formato não suportado',
        description:
          'Por favor, envie um arquivo CSV. Suporte a Excel (.xlsx) em breve.',
      })
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    try {
      const text = await file.text()
      const lines = text.split('\n')
      // Remove header if it exists (simple check)
      if (lines.length > 0 && lines[0].toLowerCase().includes('name')) {
        lines.shift()
      }

      const parsedItems = lines
        .map((line) => {
          if (!line.trim()) return null
          // Basic CSV regex split that handles quotes
          const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g
          const matches = []
          let match
          while ((match = regex.exec(line))) {
            if (match[1] !== undefined) {
              matches.push(match[1].replace(/^"|"$/g, '').replace(/""/g, '"'))
            }
          }

          // Fallback if regex fails or simple structure
          const cols = matches.length > 1 ? matches : line.split(',')

          if (cols.length < 1) return null

          // Expected: Name, Description, Type, MinStock, InitialQuantity
          const name = cols[0]?.trim()
          if (!name) return null

          return {
            name,
            description: cols[1]?.trim() || '',
            type: (cols[2]?.trim().toUpperCase() === 'TRD' ? 'TRD' : 'TRP') as
              | 'TRP'
              | 'TRD',
            minStock: parseInt(cols[3]?.trim() || '0') || 0,
            initialQuantity: parseInt(cols[4]?.trim() || '0') || 0,
          }
        })
        .filter(Boolean) as z.infer<typeof importSchema>[]

      const validItems = parsedItems.filter((item) => {
        const result = importSchema.safeParse(item)
        return result.success
      })

      if (validItems.length === 0) {
        toast({
          variant: 'destructive',
          title: 'Erro na importação',
          description: 'Nenhum item válido encontrado no arquivo.',
        })
        return
      }

      importMaterials(
        validItems.map((item) => ({
          material: {
            name: item.name,
            description: item.description,
            type: item.type,
            minStock: item.minStock,
          },
          initialQuantity: item.initialQuantity,
        })),
      )

      toast({
        title: 'Importação Concluída',
        description: `${validItems.length} materiais processados com sucesso.`,
      })
      setIsImportOpen(false)
    } catch (error) {
      console.error('Import error', error)
      toast({
        variant: 'destructive',
        title: 'Erro ao ler arquivo',
        description: 'Verifique se o arquivo está formatado corretamente.',
      })
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const downloadTemplate = () => {
    const header = 'Name,Description,Type,MinStock,InitialQuantity\n'
    const example = 'Exemplo Item,Descrição do item,TRP,10,50'
    const blob = new Blob([header + example], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'template_importacao.csv'
    link.click()
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
          <div className="flex gap-2">
            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FileSpreadsheet className="mr-2 h-4 w-4" /> Importar Itens
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Importação em Massa (CSV)</DialogTitle>
                  <DialogDescription>
                    Carregue um arquivo CSV para adicionar múltiplos materiais
                    de uma vez.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md text-sm space-y-2 border">
                    <p className="font-medium flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-blue-500" />
                      Instruções:
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-1">
                      <li>O arquivo deve ser .csv (separado por vírgulas)</li>
                      <li>
                        Colunas: Nome, Descrição, Tipo (TRP/TRD), Estoque Mín.,
                        Qtd Inicial
                      </li>
                      <li>A primeira linha (cabeçalho) é ignorada</li>
                    </ul>
                    <Button
                      variant="link"
                      className="h-auto p-0 text-blue-600"
                      onClick={downloadTemplate}
                    >
                      <Download className="mr-1 h-3 w-3" /> Baixar Modelo CSV
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="import-file">Selecione o Arquivo</Label>
                    <Input
                      id="import-file"
                      type="file"
                      accept=".csv,text/csv,application/vnd.ms-excel"
                      onChange={handleImportFile}
                      ref={fileInputRef}
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button onClick={() => setIsAddOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Novo Material
            </Button>
          </div>
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
