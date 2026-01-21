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
  Image as ImageIcon,
} from 'lucide-react'
import useInventoryStore from '@/stores/useInventoryStore'
import { useToast } from '@/hooks/use-toast'
import logo8BSup from '@/assets/8-b-sup.jpg'

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
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b pb-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-primary/20 shadow-sm bg-black">
            <img
              src={logo8BSup}
              alt="Logo"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Gestão de Equipamentos
            </h1>
            <p className="text-muted-foreground">
              Controle de frota e ferramentas do 8º B Sup Sl.
            </p>
          </div>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="shadow-sm">
              <Plus className="mr-2 h-5 w-5" /> Adicionar Equipamento
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {equipments.map((eq) => (
          <Card
            key={eq.id}
            className="overflow-hidden hover:shadow-lg transition-all duration-300 group relative border-muted bg-card"
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

            <div className="aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-900 flex items-center justify-center border-b">
              {eq.image ? (
                <img
                  src={eq.image}
                  alt={eq.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Truck className="h-12 w-12 opacity-50" />
                  <span className="text-xs">Sem imagem</span>
                </div>
              )}
            </div>
            <CardHeader className="pb-2 pt-4">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <CardTitle className="text-lg truncate" title={eq.name}>
                    {eq.name}
                  </CardTitle>
                  <CardDescription className="truncate" title={eq.model}>
                    {eq.model || 'Modelo não especificado'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                {eq.status === 'available' && (
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                  >
                    Disponível
                  </Badge>
                )}
                {eq.status === 'in-use' && (
                  <Badge
                    variant="outline"
                    className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
                  >
                    Em Uso
                  </Badge>
                )}
                {eq.status === 'maintenance' && (
                  <Badge
                    variant="outline"
                    className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                  >
                    Manutenção
                  </Badge>
                )}
              </div>

              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center">
                  {eq.status === 'available' ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-green-600" />
                      Pronto para operação
                    </>
                  ) : eq.status === 'in-use' ? (
                    <>
                      <Clock className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                      Operador: {eq.operator || 'Não informado'}
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5 mr-1.5 text-red-600" />
                      Indisponível
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {equipments.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/50">
            <Truck className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>Nenhum equipamento cadastrado.</p>
            <Button
              variant="link"
              onClick={() => setIsAddOpen(true)}
              className="mt-2"
            >
              Adicionar o primeiro
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
