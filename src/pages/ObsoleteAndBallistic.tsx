import { useState } from 'react'
import {
  Shield,
  Search,
  Plus,
  Trash2,
  Pencil,
  AlertTriangle,
  Archive,
  HardHat,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
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
import { useToast } from '@/hooks/use-toast'
import { BallisticCategory, BallisticStatus } from '@/types'
import { ImagePreview } from '@/components/ui/image-preview'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function ObsoleteAndBallistic() {
  const {
    ballisticItems,
    addBallisticItem,
    updateBallisticItem,
    deleteBallisticItem,
    currentUser,
  } = useInventoryStore()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  // Default new item state
  const [formData, setFormData] = useState({
    category: 'vest' as BallisticCategory,
    status: 'active' as BallisticStatus,
    serialNumber: '',
    identification: '',
    model: '',
    image: '',
    notes: '',
    expirationDate: '',
    manufacturingDate: '',
  })

  const canEdit =
    currentUser?.role === 'ADMIN' || currentUser?.role === 'OPERATOR'

  const handleOpenDialog = (item?: any) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        category: item.category,
        status: item.status,
        serialNumber: item.serialNumber,
        identification: item.identification,
        model: item.model || '',
        image: item.image || '',
        notes: item.notes || '',
        expirationDate: item.expirationDate || '',
        manufacturingDate: item.manufacturingDate || '',
      })
    } else {
      setEditingItem(null)
      setFormData({
        category: 'vest',
        status: 'active',
        serialNumber: '',
        identification: '',
        model: '',
        image: '',
        notes: '',
        expirationDate: '',
        manufacturingDate: '',
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (!formData.serialNumber || !formData.identification) {
      toast({
        variant: 'destructive',
        title: 'Campos Obrigatórios',
        description: 'Preencha o Número de Série e a Identificação.',
      })
      return
    }

    if (editingItem) {
      updateBallisticItem(editingItem.id, formData)
      toast({ title: 'Item atualizado com sucesso' })
    } else {
      addBallisticItem(formData)
      toast({ title: 'Item adicionado com sucesso' })
    }
    setIsDialogOpen(false)
  }

  const filteredItems = ballisticItems.filter((item) => {
    const term = searchTerm.toLowerCase()
    return (
      item.serialNumber.toLowerCase().includes(term) ||
      item.identification.toLowerCase().includes(term) ||
      item.model?.toLowerCase().includes(term)
    )
  })

  const getStatusColor = (status: BallisticStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
      case 'obsolete':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300'
      case 'condemned':
        return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
      case 'lost':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  const getStatusLabel = (status: BallisticStatus) => {
    const map: Record<BallisticStatus, string> = {
      active: 'Ativo',
      obsolete: 'Obsoleto',
      condemned: 'Baixado/Condenado',
      maintenance: 'Manutenção',
      lost: 'Perdido/Extraviado',
    }
    return map[status] || status
  }

  const renderTable = (categoryFilter: string | string[]) => {
    const items = filteredItems.filter((i) =>
      Array.isArray(categoryFilter)
        ? categoryFilter.includes(i.category)
        : i.category === categoryFilter,
    )

    if (items.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground bg-slate-50 dark:bg-slate-900/20 rounded-lg border border-dashed">
          <Archive className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p>Nenhum item encontrado nesta categoria.</p>
        </div>
      )
    }

    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">Img</TableHead>
              <TableHead>Identificação</TableHead>
              <TableHead>Série</TableHead>
              <TableHead>Modelo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Validade</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <ImagePreview
                    src={item.image}
                    fallbackText={item.category.substring(0, 2)}
                    className="h-10 w-10 rounded border bg-white"
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {item.identification}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {item.serialNumber}
                </TableCell>
                <TableCell>{item.model || '-'}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={getStatusColor(item.status)}
                  >
                    {getStatusLabel(item.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {item.expirationDate
                    ? format(new Date(item.expirationDate), 'dd/MM/yyyy')
                    : '-'}
                </TableCell>
                <TableCell className="text-right">
                  {canEdit && (
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Item?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação é irreversível. O item será removido
                              permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive"
                              onClick={() => deleteBallisticItem(item.id)}
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
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Materiais Obsoletos / Itens Balísticos
          </h1>
          <p className="text-muted-foreground">
            Controle de Coletes, Capacetes e itens fora de operação.
          </p>
        </div>
        {canEdit && (
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" /> Novo Item
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por número de série, identificação ou modelo..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="vests" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="vests" className="gap-2">
                <Shield className="h-4 w-4" /> Coletes
              </TabsTrigger>
              <TabsTrigger value="helmets" className="gap-2">
                <HardHat className="h-4 w-4" /> Capacetes
              </TabsTrigger>
              <TabsTrigger value="others" className="gap-2">
                <Archive className="h-4 w-4" /> Outros / Obsoletos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="vests" className="space-y-4 animate-fade-in">
              {renderTable('vest')}
            </TabsContent>
            <TabsContent value="helmets" className="space-y-4 animate-fade-in">
              {renderTable('helmet')}
            </TabsContent>
            <TabsContent value="others" className="space-y-4 animate-fade-in">
              {renderTable(['plate', 'other'])}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Editar Item' : 'Novo Item Balístico / Obsoleto'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v: BallisticCategory) =>
                    setFormData({ ...formData, category: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vest">Colete Balístico</SelectItem>
                    <SelectItem value="helmet">Capacete Balístico</SelectItem>
                    <SelectItem value="plate">Placa Balística</SelectItem>
                    <SelectItem value="other">
                      Outro / Material Obsoleto
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v: BallisticStatus) =>
                    setFormData({ ...formData, status: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="obsolete">Obsoleto</SelectItem>
                    <SelectItem value="condemned">
                      Baixado (Condenado)
                    </SelectItem>
                    <SelectItem value="maintenance">Manutenção</SelectItem>
                    <SelectItem value="lost">Extraviado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  Identificação <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Ex: Patrimônio 12345"
                  value={formData.identification}
                  onChange={(e) =>
                    setFormData({ ...formData, identification: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  Número de Série <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Ex: SN-987654"
                  value={formData.serialNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, serialNumber: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Modelo / Descrição</Label>
              <Input
                placeholder="Ex: Colete Nível IIIA - Tamanho G"
                value={formData.model}
                onChange={(e) =>
                  setFormData({ ...formData, model: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data Fabricação</Label>
                <Input
                  type="date"
                  value={formData.manufacturingDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      manufacturingDate: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Data Validade</Label>
                <Input
                  type="date"
                  value={formData.expirationDate}
                  onChange={(e) =>
                    setFormData({ ...formData, expirationDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>URL da Imagem</Label>
              <Input
                placeholder="https://..."
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Observações</Label>
              <Input
                placeholder="Detalhes adicionais..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
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
