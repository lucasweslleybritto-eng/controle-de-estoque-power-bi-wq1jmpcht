import { useState } from 'react'
import {
  ShieldAlert,
  Plus,
  Search,
  Pencil,
  Trash2,
  Filter,
  CheckCircle2,
  Shield,
  Clock,
  UserCheck,
  HardHat,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { useToast } from '@/hooks/use-toast'
import { BallisticStatus, BallisticCategory } from '@/types'
import { cn } from '@/lib/utils'

export default function BallisticControl() {
  const {
    ballisticItems,
    oms,
    addBallisticItem,
    updateBallisticItem,
    deleteBallisticItem,
    currentUser,
  } = useInventoryStore()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'vest' | 'helmet'>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  const [formData, setFormData] = useState({
    category: 'vest' as BallisticCategory,
    status: 'active' as BallisticStatus,
    serialNumber: '',
    identification: '',
    model: '',
    omId: '',
    notes: '',
  })

  const canEdit =
    currentUser?.role === 'ADMIN' || currentUser?.role === 'OPERATOR'

  // Filter Logic:
  // 1. Must be Helmet or Vest
  // 2. Must NOT be obsolete/condemned/lost (User Story: separate from obsolete)
  const activeItems = ballisticItems.filter((item) => {
    const isBallistic = item.category === 'vest' || item.category === 'helmet'
    const isNotObsolete = !['obsolete', 'condemned', 'lost'].includes(
      item.status,
    )
    return isBallistic && isNotObsolete
  })

  const filteredItems = activeItems.filter((item) => {
    const matchesSearch =
      item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.identification.toLowerCase().includes(searchTerm.toLowerCase()) ||
      oms
        .find((o) => o.id === item.omId)
        ?.name.toLowerCase()
        .includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === 'all' || item.category === typeFilter

    return matchesSearch && matchesType
  })

  const handleOpenDialog = (item?: any) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        category: item.category,
        status: item.status,
        serialNumber: item.serialNumber,
        identification: item.identification,
        model: item.model || '',
        omId: item.omId || '',
        notes: item.notes || '',
      })
    } else {
      setEditingItem(null)
      setFormData({
        category: 'vest',
        status: 'active',
        serialNumber: '',
        identification: '',
        model: '',
        omId: '',
        notes: '',
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (!formData.serialNumber || !formData.identification) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Número de Série e Identificação são obrigatórios.',
      })
      return
    }

    if (editingItem) {
      updateBallisticItem(editingItem.id, formData)
      toast({ title: 'Item atualizado com sucesso' })
    } else {
      addBallisticItem(formData)
      toast({ title: 'Novo item adicionado' })
    }
    setIsDialogOpen(false)
  }

  const getStatusConfig = (status: BallisticStatus) => {
    switch (status) {
      case 'active':
        return {
          label: 'Disponível',
          color:
            'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300',
          icon: CheckCircle2,
        }
      case 'in-use':
        return {
          label: 'Em uso',
          color:
            'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300',
          icon: Shield,
        }
      case 'reserved':
        return {
          label: 'Reservado',
          color:
            'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300',
          icon: Clock,
        }
      case 'distributed':
        return {
          label: 'Distribuído',
          color:
            'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300',
          icon: UserCheck,
        }
      default:
        return {
          label: status,
          color: 'bg-slate-100 text-slate-800',
          icon: Shield,
        }
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ShieldAlert className="h-8 w-8 text-primary" />
            Controle Balístico
          </h1>
          <p className="text-muted-foreground">
            Painel unificado para gestão de Coletes e Capacetes.
          </p>
        </div>
        {canEdit && (
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" /> Adicionar Item
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-4 border-b">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por serial, ID ou OM..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={typeFilter}
                onValueChange={(v: any) => setTypeFilter(v)}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Tipo de Material" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="vest">Coletes</SelectItem>
                  <SelectItem value="helmet">Capacetes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-md border-0 w-full overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Tipo do Material</TableHead>
                  <TableHead>Identificação / Serial</TableHead>
                  <TableHead>OM Vinculada</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center h-32 text-muted-foreground"
                    >
                      Nenhum item balístico encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => {
                    const statusConfig = getStatusConfig(item.status)
                    const StatusIcon = statusConfig.icon
                    const omName =
                      oms.find((o) => o.id === item.omId)?.name ||
                      'Não vinculada'

                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="p-2 rounded bg-slate-100 dark:bg-slate-800 w-fit">
                            {item.category === 'vest' ? (
                              <Shield className="h-4 w-4 text-slate-500" />
                            ) : (
                              <HardHat className="h-4 w-4 text-slate-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {item.category === 'vest' ? 'Colete' : 'Capacete'}
                          </span>
                          {item.model && (
                            <div className="text-xs text-muted-foreground">
                              {item.model}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {item.identification}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            SN: {item.serialNumber}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {item.omId ? (
                              <Badge variant="outline" className="font-normal">
                                {omName}
                              </Badge>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                -
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              'font-normal flex w-fit items-center gap-1',
                              statusConfig.color,
                            )}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig.label}
                          </Badge>
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
                                    <AlertDialogTitle>
                                      Excluir Item?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta ação removerá permanentemente o item
                                      do inventário.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancelar
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-destructive"
                                      onClick={() =>
                                        deleteBallisticItem(item.id)
                                      }
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
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Editar Item Balístico' : 'Novo Item Balístico'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo do Material</Label>
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
                    <SelectItem value="in-use">Em uso</SelectItem>
                    <SelectItem value="reserved">Reservado</SelectItem>
                    <SelectItem value="distributed">Distribuído</SelectItem>
                    <SelectItem value="maintenance">Manutenção</SelectItem>
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
                    setFormData({
                      ...formData,
                      identification: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>
                  Número de Série <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Ex: SN-123456"
                  value={formData.serialNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, serialNumber: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>OM Vinculada</Label>
              <Select
                value={formData.omId}
                onValueChange={(v) => setFormData({ ...formData, omId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a Organização Militar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Sem vínculo</SelectItem>
                  {oms.map((om) => (
                    <SelectItem key={om.id} value={om.id}>
                      {om.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Modelo (Opcional)</Label>
              <Input
                placeholder="Ex: Modelo 2024 Padrão"
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
