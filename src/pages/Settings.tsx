import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WarehouseTab } from '@/components/settings/WarehouseTab'
import { MaterialsTab } from '@/components/settings/MaterialsTab'
import { SystemTab } from '@/components/settings/SystemTab'
import { PreferencesTab } from '@/components/settings/PreferencesTab'
import {
  Settings as SettingsIcon,
  Database,
  LayoutGrid,
  Sliders,
  UserCog,
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

      <Tabs defaultValue="preferences" className="space-y-6">
        <TabsList className="flex w-full flex-wrap h-auto bg-muted p-1 gap-1">
          <TabsTrigger
            value="preferences"
            className="flex-1 min-w-[120px] text-sm md:text-base data-[state=active]:bg-background data-[state=active]:shadow-sm py-2"
          >
            <UserCog className="mr-2 h-4 w-4" /> Preferências
          </TabsTrigger>
          <TabsTrigger
            value="warehouse"
            className="flex-1 min-w-[120px] text-sm md:text-base data-[state=active]:bg-background data-[state=active]:shadow-sm py-2"
          >
            <LayoutGrid className="mr-2 h-4 w-4" /> Ruas e Prédios
          </TabsTrigger>
          <TabsTrigger
            value="materials"
            className="flex-1 min-w-[120px] text-sm md:text-base data-[state=active]:bg-background data-[state=active]:shadow-sm py-2"
          >
            <Database className="mr-2 h-4 w-4" /> Catálogo
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger
              value="system"
              className="flex-1 min-w-[120px] text-sm md:text-base data-[state=active]:bg-background data-[state=active]:shadow-sm py-2"
            >
              <Sliders className="mr-2 h-4 w-4" /> Sistema
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="preferences" className="animate-fade-in-up">
          <PreferencesTab />
        </TabsContent>

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
