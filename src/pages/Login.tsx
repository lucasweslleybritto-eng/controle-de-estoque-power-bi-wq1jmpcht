import { useState } from 'react'
import { Check, ShieldCheck, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import useInventoryStore from '@/stores/useInventoryStore'
import logo8BSup from '@/assets/8-b-sup.jpg'

export default function Login() {
  const { users, login } = useInventoryStore()
  const [selectedUserId, setSelectedUserId] = useState('')

  const handleLogin = () => {
    if (selectedUserId) {
      login(selectedUserId)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-24 h-24 mb-4 rounded-full overflow-hidden border-4 border-slate-200 dark:border-slate-800 bg-black">
            <img
              src={logo8BSup}
              alt="Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <CardTitle className="text-2xl font-bold">Estoque Classe 2</CardTitle>
          <p className="text-muted-foreground">Sistema de Gestão de Armazém</p>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex gap-3 items-start">
            <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-300">
              <p className="font-semibold mb-1">Acesso Restrito</p>
              <p>
                Selecione seu usuário abaixo para acessar o sistema.
                Funcionalidades serão limitadas conforme seu perfil.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Selecione o Usuário</label>
            <Select onValueChange={setSelectedUserId} value={selectedUserId}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Escolha seu perfil..." />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                        <User className="w-4 h-4 text-slate-500" />
                      </div>
                      <span className="font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground ml-1 uppercase border px-1 rounded">
                        {user.role}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            className="w-full h-12 text-base"
            onClick={handleLogin}
            disabled={!selectedUserId}
          >
            Entrar no Sistema <Check className="ml-2 w-4 h-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
