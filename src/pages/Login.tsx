import { useState } from 'react'
import {
  Check,
  User,
  Shield,
  Search,
  Loader2,
  RefreshCw,
  LogIn,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import useInventoryStore from '@/stores/useInventoryStore'
import logo8BSup from '@/assets/8-b-sup.jpg'
import { cn } from '@/lib/utils'

export default function Login() {
  const { users, login, syncStatus } = useInventoryStore()
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const handleLogin = () => {
    if (selectedUserId) {
      login(selectedUserId)
    }
  }

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const isLoading = users.length === 0 && syncStatus === 'syncing'

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300'
      case 'OPERATOR':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300'
      case 'VIEWER':
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 p-4 animate-fade-in">
      <Card className="w-full max-w-lg shadow-2xl border-t-8 border-t-primary">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-24 h-24 mb-4 rounded-full overflow-hidden border-4 border-slate-200 dark:border-slate-800 bg-black shadow-lg">
            <img
              src={logo8BSup}
              alt="Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">
            Estoque Classe 2
          </CardTitle>
          <CardDescription className="text-base">
            Selecione seu perfil para acessar o sistema
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10"
            />
          </div>

          <ScrollArea className="h-[300px] pr-4 rounded-md border p-2 bg-slate-50/50 dark:bg-slate-900/20">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p>Carregando usuários...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                <User className="h-8 w-8 opacity-20" />
                <p>Nenhum usuário encontrado</p>
                {users.length === 0 && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => window.location.reload()}
                  >
                    <RefreshCw className="mr-2 h-3 w-3" /> Recarregar
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-2">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUserId(user.id)}
                    className={cn(
                      'flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-all duration-200',
                      selectedUserId === user.id
                        ? 'bg-primary/5 border-primary shadow-sm ring-1 ring-primary'
                        : 'bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-slate-800/50 border-transparent hover:border-slate-200 dark:hover:border-slate-700',
                    )}
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12 border-2 border-slate-100 dark:border-slate-800">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback
                          className={cn(
                            'font-bold text-lg',
                            selectedUserId === user.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-slate-200 dark:bg-slate-700',
                          )}
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {selectedUserId === user.id && (
                        <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-0.5 shadow-sm">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'font-semibold truncate',
                          selectedUserId === user.id
                            ? 'text-primary'
                            : 'text-foreground',
                        )}
                      >
                        {user.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>

                    <Badge
                      variant="outline"
                      className={cn(
                        'shrink-0 text-[10px] uppercase tracking-wider font-bold',
                        getRoleBadgeColor(user.role),
                      )}
                    >
                      {user.role}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>

        <CardFooter className="flex-col gap-4 bg-slate-50 dark:bg-slate-900/30 pt-6">
          <Button
            className="w-full h-12 text-base font-semibold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
            onClick={handleLogin}
            disabled={!selectedUserId}
          >
            <LogIn className="mr-2 h-5 w-5" /> Acessar Painel
          </Button>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            <span>Acesso seguro e monitorado</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
