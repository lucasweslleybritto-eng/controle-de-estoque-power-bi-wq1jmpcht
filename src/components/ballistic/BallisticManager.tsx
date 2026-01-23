import { useState } from 'react'
import {
  Plus,
  Trash2,
  Building,
  Shield,
  HardHat,
  Search,
  Pencil,
  CheckCircle2,
  AlertTriangle,
  Archive,
  Clock,
  XCircle,
  HelpCircle,
  AlertOctagon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import useInventoryStore from '@/stores/useInventoryStore'
import { useToast } from '@/hooks/use-toast'
import { BallisticCategory, BallisticStatus } from '@/types'
import { ImagePreview } from '@/components/ui/image-preview'
import { cn } from '@/lib/utils'

interface BallisticManagerProps {
  category: BallisticCategory
  title: string
  description: string
}

export function BallisticManager({
  category,
  title,
  description,
}: BallisticManagerProps) {
  const {
    oms,
    ballisticItems,
    addBallisticItem,
    updateBallisticItem,
    deleteBallisticItem,
    currentUser,
  } = useInventoryStore()
  const { toast } = useToast()

  const [selectedOM, setSelectedOM] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [formData, setFormData] = useState({
    status: 'active' as BallisticStatus,
    serialNumber: '',
    identification: '',
    model: '',
    image: '',
    notes: '',
    omId: '',
  })

  const canEdit =
    currentUser?.role === 'ADMIN' || currentUser?.role === 'OPERATOR'

  // Filter items by category
  const categoryItems = ballisticItems.filter((i) => i.category === category)

  // Items for selected OM
  const omItems = categoryItems.filter((i) => i.omId === selectedOM)

  // Items without OM (for "Sem OM" view)
  const unassignedItems = categoryItems.filter(
    (i) => !i.omId || !oms.find((o) => o.id === i.omId),
  )

  const handleOpenDialog = (item?: any, preSelectedOmId?: string) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        status: item.status,
        serialNumber: item.serialNumber,
        identification: item.identification,
        model: item.model || '',
        image: item.image || '',
        notes: item.notes || '',
        omId: item.omId || '',
      })
    } else {
      setEditingItem(null)
      setFormData({
        status: 'active',
        serialNumber: '',
        identification: '',
        model: '',
        image: '',
        notes: '',
        omId: preSelectedOmId || selectedOM || '',
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

    const itemData = {
      ...formData,
      category,
    }

    if (editingItem) {
      updateBallisticItem(editingItem.id, itemData)
      toast({ title: 'Item atualizado' })
    } else {
      addBallisticItem(itemData)
      toast({ title: 'Item adicionado' })
    }
    setIsDialogOpen(false)
  }

  const getStatusColor = (status: BallisticStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300'
      case 'in-use':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300'
      case 'reserved':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300'
      case 'obsolete':
        return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300'
      case 'condemned':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300'
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300'
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
    }
  }

  const getStatusLabel = (status: BallisticStatus) => {
    const map: Record<BallisticStatus, string> = {
      active: 'Disponível',
      'in-use': 'Em Uso',
      reserved: 'Reservado',
      obsolete: 'Obsoleto',
      condemned: 'Baixado',
      maintenance: 'Manutenção',
      lost: 'Extraviado',
    }
    return map[status] || status
  }

  const getStatusIcon = (status: BallisticStatus) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="w-3 h-3 mr-1" />
      case 'in-use':
        return <Shield className="w-3 h-3 mr-1" />
      case 'reserved':
        return <Clock className="w-3 h-3 mr-1" />
      case 'maintenance':
        return <AlertTriangle className="w-3 h-3 mr-1" />
      case 'condemned':
        return <XCircle className="w-3 h-3 mr-1" />
      case 'obsolete':
        return <Archive className="w-3 h-3 mr-1" />
      case 'lost':
        return <AlertOctagon className="w-3 h-3 mr-1" />
      default:
        return <HelpCircle className="w-3 h-3 mr-1" />
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            {category === 'vest' ? (
              <Shield className="h-8 w-8" />
            ) : (
              <HardHat className="h-8 w-8" />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
        </div>
        {canEdit && (
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" /> Novo Item
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {oms.map((om) => {
          const count = categoryItems.filter((i) => i.omId === om.id).length
          return (
            <Card
              key={om.id}
              className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer border-muted"
              onClick={() => setSelectedOM(om.id)}
            >
              <CardHeader className="pb-3 flex flex-row items-center gap-4 bg-muted/20">
                <ImagePreview
                  src={om.image}
                  className="h-14 w-14 rounded-lg bg-white p-0.5 border shadow-sm object-cover"
                  enablePreview={false}
                />
                <div className="overflow-hidden">
                  <CardTitle className="truncate text-lg">{om.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="font-normal">
                      {count} {count === 1 ? 'Item' : 'Itens'}
                    </Badge>
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <p className="text-xs text-muted-foreground mt-2">
                  Clique para ver detalhes
                </p>
              </CardContent>
            </Card>
          )
        })}

        {/* Unassigned Items Card */}
        {unassignedItems.length > 0 && (
          <Card
            className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer border-dashed border-2"
            onClick={() => setSelectedOM('unassigned')}
          >
            <CardHeader className="pb-3 flex flex-row items-center gap-4">
              <div className="h-14 w-14 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center border">
                <HelpCircle className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="truncate text-lg">
                  Sem OM Definida
                </CardTitle>
                <CardDescription>
                  <Badge variant="secondary" className="font-normal">
                    {unassignedItems.length} Itens
                  </Badge>
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        )}
      </div>

      {/* OM Detail Dialog */}
      <Dialog
        open={!!selectedOM}
        onOpenChange={(open) => !open && setSelectedOM(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-2xl flex items-center gap-3">
              {selectedOM === 'unassigned' ? (
                <>Itens sem OM Definida</>
              ) : (
                <>
                  {oms.find((o) => o.id === selectedOM)?.name}
                  <Badge variant="outline" className="ml-2 font-normal">
                    {selectedOM === 'unassigned'
                      ? unassignedItems.length
                      : omItems.length}{' '}
                    Itens
                  </Badge>
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="flex items-center justify-between py-4 gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por serial ou identificação..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {canEdit && selectedOM !== 'unassigned' && (
              <Button onClick={() => handleOpenDialog(undefined, selectedOM!)}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar
              </Button>
            )}
          </div>

          <ScrollArea className="flex-1 -mx-6 px-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Img</TableHead>
                  <TableHead>Identificação</TableHead>
                  <TableHead>Nº Série</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(selectedOM === 'unassigned' ? unassignedItems : omItems)
                  .filter(
                    (i) =>
                      i.serialNumber
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      i.identification
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()),
                  )
                  .map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <ImagePreview
                          src={item.image}
                          className="h-10 w-10 rounded border bg-white"
                          fallbackText={category.substring(0, 2).toUpperCase()}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.identification}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {item.serialNumber}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {item.model || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            'font-normal',
                            getStatusColor(item.status),
                          )}
                        >
                          {getStatusIcon(item.status)}
                          {getStatusLabel(item.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {canEdit && (
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleOpenDialog(item)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Excluir Item?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    Cancelar
                                  </AlertDialogCancel>
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
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Item Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Editar Item' : 'Novo Item'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Organização Militar (OM)</Label>
                <Select
                  value={formData.omId}
                  onValueChange={(v) => setFormData({ ...formData, omId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a OM" />
                  </SelectTrigger>
                  <SelectContent>
                    {oms.map((om) => (
                      <SelectItem key={om.id} value={om.id}>
                        {om.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Situação</Label>
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
                    <SelectItem value="active">Disponível</SelectItem>
                    <SelectItem value="in-use">Em Uso</SelectItem>
                    <SelectItem value="reserved">Reservado</SelectItem>
                    <SelectItem value="maintenance">Manutenção</SelectItem>
                    <SelectItem value="condemned">Baixado</SelectItem>
                    <SelectItem value="obsolete">Obsoleto</SelectItem>
                    <SelectItem value="lost">Extraviado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Identificação <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Ex: ID-001"
                  value={formData.identification}
                  onChange={(e) =>
                    setFormData({ ...formData, identification: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>
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
              <Label>Modelo</Label>
              <Input
                placeholder="Ex: Modelo Padrão 2024"
                value={formData.model}
                onChange={(e) =>
                  setFormData({ ...formData, model: e.target.value })
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
