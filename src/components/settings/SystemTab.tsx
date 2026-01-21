import { useState } from 'react'
import { Save, AlertTriangle, Trash2, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
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
import { useToast } from '@/hooks/use-toast'

export function SystemTab() {
  const { settings, updateSettings, resetSystem, currentUser } =
    useInventoryStore()
  const { toast } = useToast()

  const [formData, setFormData] = useState(settings)

  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="text-center p-8 text-muted-foreground">
        Acesso restrito a administradores.
      </div>
    )
  }

  const handleSave = () => {
    updateSettings(formData)
    toast({
      title: 'Configurações Salvas',
      description: 'As alterações foram aplicadas ao sistema.',
    })
  }

  const handleReset = () => {
    resetSystem()
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Preferências do Sistema</h3>
        <p className="text-sm text-muted-foreground">
          Configurações globais e parâmetros de alerta.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Identidade</CardTitle>
            <CardDescription>
              Nome exibido no cabeçalho e relatórios.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nome do Sistema</Label>
              <Input
                value={formData.systemName}
                onChange={(e) =>
                  setFormData({ ...formData, systemName: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Limites e Alertas (Global)</CardTitle>
            <CardDescription>
              Defina os gatilhos padrões para alertas de estoque.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Bell className="h-4 w-4" /> Alerta de Estoque Baixo (Qtd)
              </Label>
              <Input
                type="number"
                value={formData.lowStockThreshold}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    lowStockThreshold: parseInt(e.target.value) || 0,
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                Gatilho global. Se um material não tiver limite específico, este
                valor será usado.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Alerta de Ocupação da Rua (%)</Label>
              <Input
                type="number"
                value={formData.highOccupancyThreshold}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    highOccupancyThreshold: parseInt(e.target.value) || 0,
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                Ruas com ocupação acima deste valor serão destacadas.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          <Save className="mr-2 h-4 w-4" /> Salvar Configurações Globais
        </Button>
      </div>

      <div className="pt-8 border-t">
        <h3 className="text-lg font-medium text-destructive mb-4">
          Zona de Perigo
        </h3>
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Reset Global do Sistema
            </CardTitle>
            <CardDescription>
              Esta ação apagará <strong>permanentemente</strong> todos os dados
              do sistema, incluindo:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Todo o histórico de movimentações</li>
                <li>Todo o catálogo de materiais e equipamentos</li>
                <li>Todas as ruas e localizações</li>
                <li>Todos os usuários (exceto você)</li>
              </ul>
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-end">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Resetar Sistema Completo
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Você tem certeza absoluta?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso excluirá
                    permanentemente todos os registros, configurações e dados de
                    estoque do banco de dados local. O sistema retornará ao
                    estado inicial vazio.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive hover:bg-destructive/90"
                    onClick={handleReset}
                  >
                    Sim, apagar tudo
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
