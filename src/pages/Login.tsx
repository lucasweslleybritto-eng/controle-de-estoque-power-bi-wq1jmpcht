import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, User } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import useInventoryStore from '@/stores/useInventoryStore'
import logo8BSup from '@/assets/8-b-sup.jpg'

export default function Login() {
  const { users, login, addUser, currentUser } = useInventoryStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (currentUser) {
      navigate('/')
    }
  }, [currentUser, navigate])

  const handleRoleSelect = (role: 'ADMIN' | 'VIEWER') => {
    const name = role === 'ADMIN' ? 'Administrador' : 'Visitante'
    // Find generic user for this role or create if not exists
    const existingUser = users.find((u) => u.name === name && u.role === role)

    if (existingUser) {
      login(existingUser)
    } else {
      const newUser = addUser({
        name,
        email: `${role.toLowerCase()}@sistema.com`,
        role,
        preferences: {
          lowStockAlerts: true,
          movementAlerts: true,
          emailNotifications: false,
        },
      })
      // Immediately login with the new user object
      login(newUser)
    }
    navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 p-4 animate-fade-in">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8">
        <div className="md:col-span-2 text-center mb-8">
          <div className="mx-auto w-24 h-24 mb-4 rounded-full overflow-hidden border-4 border-slate-200 dark:border-slate-800 bg-black shadow-lg">
            <img
              src={logo8BSup}
              alt="Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Estoque Classe 2
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Selecione seu perfil de acesso
          </p>
        </div>

        {/* Admin Card */}
        <Card
          className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer border-t-4 border-t-primary"
          onClick={() => handleRoleSelect('ADMIN')}
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <ShieldCheck className="w-32 h-32" />
          </div>
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl">Administrador</CardTitle>
            <CardDescription>Acesso total ao sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6">
              Gerenciamento completo de estoque, usuários, relatórios e
              configurações do sistema.
            </p>
            <Button className="w-full" size="lg">
              Entrar como Adm
            </Button>
          </CardContent>
        </Card>

        {/* Visitor Card */}
        <Card
          className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer border-t-4 border-t-slate-500"
          onClick={() => handleRoleSelect('VIEWER')}
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <User className="w-32 h-32" />
          </div>
          <CardHeader>
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-4 text-slate-600 dark:text-slate-400">
              <User className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl">Visitante</CardTitle>
            <CardDescription>Acesso somente leitura</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6">
              Visualização de mapas, relatórios e status do estoque sem
              permissão de edição.
            </p>
            <Button variant="secondary" className="w-full" size="lg">
              Entrar como Visitante
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
