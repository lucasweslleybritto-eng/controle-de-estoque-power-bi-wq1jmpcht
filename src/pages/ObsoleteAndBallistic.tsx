import { useState } from 'react'
import { Search, Plus, Trash2, Pencil, Archive, Layers } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

  const [formData, setFormData] = useState({
    category: 'other' as BallisticCategory,
    status: 'obsolete' as BallisticStatus,
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
        category: 'other',
        status: 'obsolete',
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
    if (!formData.identification) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Identificação é obrigatória.',
      })
      return
    }

    if (editingItem) {
      updateBallisticItem(editingItem.id, formData)
      toast({ title: 'Item atualizado' })
    } else {
      addBallisticItem(formData)
      toast({ title: 'Item adicionado' })
    }
    setIsDialogOpen(false)
  }

  // Filter only obsolete relevant items
  const filteredItems = ballisticItems.filter((item) => {
    // Show plates, others, OR any item marked as obsolete/condemned/lost
    const isRelevant =
      ['plate', 'other'].includes(item.category) ||
      ['obsolete', 'condemned', 'lost'].includes(item.status)

    const term = searchTerm.toLowerCase()
    const matchesSearch =
      item.serialNumber.toLowerCase().includes(term) ||
      item.identification.toLowerCase().includes(term) ||
      item.model?.toLowerCase().includes(term)

    return isRelevant && matchesSearch
  })

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
          <p>Nenhum item encontrado.</p>
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
              <TableHead>Categoria</TableHead>
              <TableHead>Modelo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
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
                  <div className="text-xs text-muted-foreground">
                    {item.serialNumber}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs font-normal">
                    {item.category === 'plate'
                      ? 'Placa'
                      : item.category === 'vest'
                        ? 'Colete'
                        : item.category === 'helmet'
                          ? 'Capacete'
                          : 'Outro'}
                  </Badge>
                </TableCell>
                <TableCell>{item.model || '-'}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="bg-slate-100 dark:bg-slate-800"
                  >
                    {item.status}
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
            Materiais Obsoletos
          </h1>
          <p className="text-muted-foreground">
            Controle de placas balísticas e outros materiais fora de uso.
          </p>
        </div>
        {canEdit && (
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" /> Novo Obsoleto
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="plates" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="plates" className="gap-2">
                <Layers className="h-4 w-4" /> Placas Balísticas
              </TabsTrigger>
              <TabsTrigger value="others" className="gap-2">
                <Archive className="h-4 w-4" /> Outros / Diversos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="plates" className="space-y-4 animate-fade-in">
              {renderTable('plate')}
            </TabsContent>
            <TabsContent value="others" className="space-y-4 animate-fade-in">
              {renderTable(['other', 'vest', 'helmet'])}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Editar Obsoleto' : 'Novo Material Obsoleto'}
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
                    <SelectItem value="plate">Placa Balística</SelectItem>
                    <SelectItem value="other">Outro Material</SelectItem>
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
                    <SelectItem value="obsolete">Obsoleto</SelectItem>
                    <SelectItem value="condemned">Baixado</SelectItem>
                    <SelectItem value="lost">Extraviado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Identificação</Label>
                <Input
                  value={formData.identification}
                  onChange={(e) =>
                    setFormData({ ...formData, identification: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Nº Série (Opcional)</Label>
                <Input
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
                value={formData.model}
                onChange={(e) =>
                  setFormData({ ...formData, model: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Observações</Label>
              <Input
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
