import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WarehouseTab } from '@/components/settings/WarehouseTab'
import { MaterialsTab } from '@/components/settings/MaterialsTab'
import { SystemTab } from '@/components/settings/SystemTab'
import {
  Settings as SettingsIcon,
  Database,
  LayoutGrid,
  Sliders,
} from 'lucide-react'
import useInventoryStore from '@/stores/useInventoryStore'

export default function Settings() {
  const { currentUser } = useInventoryStore()
  const isAdmin = currentUser?.role === 'ADMIN'

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center gap-3 border-b pb-6">
        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <SettingsIcon className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Configurações Globais
          </h1>
          <p className="text-muted-foreground">
            Gerenciamento centralizado do sistema Estoque Classe 2.
          </p>
        </div>
      </div>

      <Tabs defaultValue="warehouse" className="space-y-6">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 h-auto md:h-14 bg-muted p-1 gap-1">
          <TabsTrigger
            value="warehouse"
            className="text-sm md:text-base data-[state=active]:bg-background data-[state=active]:shadow-sm py-2 md:py-0"
          >
            <LayoutGrid className="mr-2 h-4 w-4" /> Ruas e Prédios
          </TabsTrigger>
          <TabsTrigger
            value="materials"
            className="text-sm md:text-base data-[state=active]:bg-background data-[state=active]:shadow-sm py-2 md:py-0"
          >
            <Database className="mr-2 h-4 w-4" /> Catálogo de Materiais
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger
              value="system"
              className="text-sm md:text-base data-[state=active]:bg-background data-[state=active]:shadow-sm py-2 md:py-0"
            >
              <Sliders className="mr-2 h-4 w-4" /> Preferências
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="warehouse" className="animate-fade-in-up">
          <WarehouseTab />
        </TabsContent>

        <TabsContent value="materials" className="animate-fade-in-up">
          <MaterialsTab />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="system" className="animate-fade-in-up">
            <SystemTab />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
