import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, LogIn, ShieldAlert } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import logo8BSup from '@/assets/8-b-sup.jpg'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function Login() {
  const { signIn, user, loading } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user && !loading) {
      navigate('/')
    }
  }, [user, loading, navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const { error } = await signIn(email, password)
      if (error) {
        throw error
      }
      toast({
        title: 'Login realizado com sucesso',
        description: 'Redirecionando para o painel...',
      })
    } catch (err: any) {
      console.error(err)
      setError(
        err.message === 'Invalid login credentials'
          ? 'Email ou senha inválidos.'
          : 'Erro ao conectar. Tente novamente.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 p-4 animate-fade-in">
      <Card className="w-full max-w-md shadow-2xl border-t-4 border-t-primary">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-24 h-24 rounded-full overflow-hidden border-4 border-slate-200 dark:border-slate-800 bg-black shadow-lg">
            <img
              src={logo8BSup}
              alt="Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold tracking-tight">
              Estoque Classe 2
            </CardTitle>
            <CardDescription className="text-lg mt-1">
              8º B Sup Sl - Depósito de Fardamento
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Erro de Acesso</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Institucional</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@organizacao.mil.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha de Acesso</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className="h-11"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Autenticando...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" /> Entrar no Sistema
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 text-center text-sm text-muted-foreground border-t pt-6">
          <p>Acesso restrito a pessoal autorizado.</p>
          <p className="text-xs opacity-70">
            Contate o administrador para solicitar credenciais.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
