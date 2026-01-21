import { useState } from 'react'
import { User, Shield, Mail, Plus, Trash2, Pencil } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
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
import useInventoryStore from '@/stores/useInventoryStore'
import { UserRole } from '@/types'
import { useToast } from '@/hooks/use-toast'

export default function Users() {
  const { users, addUser, updateUser, deleteUser, currentUser } =
    useInventoryStore()
  const { toast } = useToast()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'VIEWER' as UserRole,
  })

  // Security check (should be handled by layout/route, but extra safety)
  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Acesso Negado</h1>
        <p className="text-muted-foreground">
          Você não tem permissão para acessar esta página.
        </p>
      </div>
    )
  }

  const handleSubmit = () => {
    if (!formData.name || !formData.email) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios.',
      })
      return
    }

    if (editingUser) {
      updateUser(editingUser.id, formData)
      toast({ title: 'Usuário atualizado com sucesso' })
    } else {
      addUser({
        ...formData,
        avatar: `https://img.usecurling.com/ppl/thumbnail?seed=${Date.now()}`,
      })
      toast({ title: 'Usuário criado com sucesso' })
    }
    setIsDialogOpen(false)
    setEditingUser(null)
    setFormData({ name: '', email: '', role: 'VIEWER' })
  }

  const openEdit = (user: any) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
    })
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestão de Usuários
          </h1>
          <p className="text-muted-foreground">
            Controle de acesso e permissões do sistema.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingUser(null)
                setFormData({ name: '', email: '', role: 'VIEWER' })
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Editar Usuário' : 'Criar Novo Usuário'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ex: João Silva"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Ex: joao@sistema.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Função / Permissão</Label>
                <Select
                  value={formData.role}
                  onValueChange={(v: UserRole) =>
                    setFormData({ ...formData, role: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                    <SelectItem value="OPERATOR">Operador</SelectItem>
                    <SelectItem value="VIEWER">Visualizador</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  <strong>Admin:</strong> Acesso total.{' '}
                  <strong>Operador:</strong> Movimentação de estoque.{' '}
                  <strong>Visualizador:</strong> Apenas leitura.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSubmit}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <Card key={user.id} className="overflow-hidden">
            <CardHeader className="pb-3 border-b bg-muted/30">
              <div className="flex justify-between items-start">
                <div className="flex gap-3 items-center">
                  <div className="h-10 w-10 rounded-full overflow-hidden border bg-background">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <CardTitle className="text-base">{user.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-0.5">
                      <Mail className="h-3 w-3" /> {user.email}
                    </CardDescription>
                  </div>
                </div>
                <div
                  className={`px-2 py-1 rounded text-xs font-bold border ${
                    user.role === 'ADMIN'
                      ? 'bg-purple-100 text-purple-800 border-purple-200'
                      : user.role === 'OPERATOR'
                        ? 'bg-blue-100 text-blue-800 border-blue-200'
                        : 'bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  {user.role}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center text-sm text-muted-foreground mb-4">
                <Shield className="h-4 w-4 mr-2" />
                {user.role === 'ADMIN' && 'Controle total do sistema'}
                {user.role === 'OPERATOR' && 'Gestão de estoque e ruas'}
                {user.role === 'VIEWER' && 'Acesso somente leitura'}
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEdit(user)}
                >
                  <Pencil className="h-3 w-3 mr-1" /> Editar
                </Button>
                {user.id !== currentUser?.id && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-3 w-3 mr-1" /> Remover
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Usuário?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Essa ação removerá o acesso de{' '}
                          <strong>{user.name}</strong> ao sistema
                          permanentemente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive"
                          onClick={() => deleteUser(user.id)}
                        >
                          Confirmar Exclusão
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
