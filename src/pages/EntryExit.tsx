import { useState } from 'react'
import { ArrowDownToLine, ArrowUpFromLine, Lock } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EntryForm } from '@/components/movements/EntryForm'
import { ExitForm } from '@/components/movements/ExitForm'
import useInventoryStore from '@/stores/useInventoryStore'

export default function EntryExit() {
  const [activeTab, setActiveTab] = useState('entry')
  const { currentUser } = useInventoryStore()

  const canMove =
    currentUser?.role === 'ADMIN' || currentUser?.role === 'OPERATOR'

  if (!canMove) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-10 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-center">
          Acesso Somente Leitura
        </h1>
        <p className="text-muted-foreground text-center max-w-md">
          Seu perfil de usuário ({currentUser?.role}) não tem permissão para
          registrar entradas ou saídas de materiais. Contate um administrador se
          precisar de acesso.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Entrada e Saída de Materiais
        </h1>
        <p className="text-muted-foreground mt-1">
          Registro de movimentações (TRP e TRD)
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-14">
          <TabsTrigger
            value="entry"
            className="text-lg gap-2 data-[state=active]:bg-green-100 data-[state=active]:text-green-800 dark:data-[state=active]:bg-green-900/40 dark:data-[state=active]:text-green-300"
          >
            <ArrowDownToLine className="h-5 w-5" /> Registrar Entrada
          </TabsTrigger>
          <TabsTrigger
            value="exit"
            className="text-lg gap-2 data-[state=active]:bg-red-100 data-[state=active]:text-red-800 dark:data-[state=active]:bg-red-900/40 dark:data-[state=active]:text-red-300"
          >
            <ArrowUpFromLine className="h-5 w-5" /> Registrar Saída (TRD)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="entry" className="mt-6">
          <EntryForm />
        </TabsContent>

        <TabsContent value="exit" className="mt-6">
          <ExitForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}
