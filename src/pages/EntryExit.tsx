import { useState } from 'react'
import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EntryForm } from '@/components/movements/EntryForm'
import { ExitForm } from '@/components/movements/ExitForm'

export default function EntryExit() {
  const [activeTab, setActiveTab] = useState('entry')

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
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
            className="text-lg gap-2 data-[state=active]:bg-green-100 data-[state=active]:text-green-800"
          >
            <ArrowDownToLine className="h-5 w-5" /> Registrar Entrada
          </TabsTrigger>
          <TabsTrigger
            value="exit"
            className="text-lg gap-2 data-[state=active]:bg-red-100 data-[state=active]:text-red-800"
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
