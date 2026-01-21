import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Plus,
  Trash2,
  Truck,
} from 'lucide-react'
import useInventoryStore from '@/stores/useInventoryStore'
import { useToast } from '@/hooks/use-toast'

export default function Equipment() {
  const { equipments, addEquipment, deleteEquipment } = useInventoryStore()
  const { toast } = useToast()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newEquipment, setNewEquipment] = useState({
    name: '',
    model: '',
    image: '',
    status: 'available',
  })

  const handleAdd = () => {
    if (!newEquipment.name) {
      toast({
        title: 'Erro',
        description: 'Nome do equipamento é obrigatório.',
        variant: 'destructive',
      })
      return
    }

    addEquipment({
      name: newEquipment.name,
      model: newEquipment.model,
      image:
        newEquipment.image ||
        'https://img.usecurling.com/p/300/200?q=military%20equipment&color=gray',
      status: newEquipment.status as 'available' | 'in-use' | 'maintenance',
    })

    setNewEquipment({
      name: '',
      model: '',
      image: '',
      status: 'available',
    })
    setIsAddOpen(false)
    toast({ title: 'Equipamento adicionado' })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestão de Equipamentos
          </h1>
          <p className="text-muted-foreground">
            Controle de frota e ferramentas do depósito.
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Adicionar Equipamento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Equipamento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome do Equipamento</Label>
                <Input
                  value={newEquipment.name}
                  onChange={(e) =>
                    setNewEquipment({ ...newEquipment, name: e.target.value })
                  }
                  placeholder="Ex: Empilhadeira Elétrica 03"
                />
              </div>
              <div className="space-y-2">
                <Label>Modelo / Detalhes</Label>
                <Input
                  value={newEquipment.model}
                  onChange={(e) =>
                    setNewEquipment({ ...newEquipment, model: e.target.value })
                  }
                  placeholder="Ex: Toyota 8FBE"
                />
              </div>
              <div className="space-y-2">
                <Label>URL da Imagem</Label>
                <Input
                  value={newEquipment.image}
                  onChange={(e) =>
                    setNewEquipment({ ...newEquipment, image: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label>Status Inicial</Label>
                <Select
                  value={newEquipment.status}
                  onValueChange={(v) =>
                    setNewEquipment({ ...newEquipment, status: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Disponível</SelectItem>
                    <SelectItem value="in-use">Em Uso</SelectItem>
                    <SelectItem value="maintenance">Manutenção</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAdd}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipments.map((eq) => (
          <Card
            key={eq.id}
            className="overflow-hidden hover:shadow-lg transition-shadow group relative"
          >
            <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8 shadow-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remover Equipamento?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Isso excluirá permanentemente o equipamento{' '}
                      <strong>{eq.name}</strong>.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive"
                      onClick={() => {
                        deleteEquipment(eq.id)
                        toast({ title: 'Equipamento removido' })
                      }}
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="aspect-video w-full overflow-hidden bg-slate-900 flex items-center justify-center">
              {eq.image ? (
                <img
                  src={eq.image}
                  alt={eq.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              ) : (
                <Truck className="h-16 w-16 text-slate-700" />
              )}
            </div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{eq.name}</CardTitle>
                  <CardDescription>{eq.model}</CardDescription>
                </div>
                {eq.status === 'available' && (
                  <Badge className="bg-green-600 hover:bg-green-700">
                    Disponível
                  </Badge>
                )}
                {eq.status === 'in-use' && (
                  <Badge
                    variant="secondary"
                    className="bg-yellow-200 text-yellow-900 hover:bg-yellow-300"
                  >
                    Em Uso
                  </Badge>
                )}
                {eq.status === 'maintenance' && (
                  <Badge variant="destructive">Manutenção</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-muted-foreground">
                  {eq.status === 'available' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />{' '}
                      Pronto para uso
                    </>
                  ) : eq.status === 'in-use' ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 text-yellow-500" />{' '}
                      Operador: {eq.operator || 'N/A'}
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 mr-2 text-red-500" />{' '}
                      Indisponível
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
