import { useState } from 'react'
import { Bell, Mail, Save } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import useInventoryStore from '@/stores/useInventoryStore'
import { useToast } from '@/hooks/use-toast'

export function PreferencesTab() {
  const { currentUser, updateUserPreferences } = useInventoryStore()
  const { toast } = useToast()

  // Initialize with current user preferences or defaults
  const [prefs, setPrefs] = useState({
    lowStockAlerts: currentUser?.preferences?.lowStockAlerts ?? true,
    movementAlerts: currentUser?.preferences?.movementAlerts ?? true,
    emailNotifications: currentUser?.preferences?.emailNotifications ?? false,
  })

  const handleSave = () => {
    updateUserPreferences(prefs)
    toast({
      title: 'Preferências salvas',
      description: 'Suas configurações de notificação foram atualizadas.',
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Notificações</h3>
        <p className="text-sm text-muted-foreground">
          Gerencie como e quando você deseja ser notificado.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" /> Alertas no Sistema
            </CardTitle>
            <CardDescription>
              Configure quais tipos de alertas você deseja ver na interface
              (toasts).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-1">
                <Label htmlFor="low-stock" className="text-base">
                  Estoque Baixo
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receber alertas quando materiais atingirem o estoque mínimo.
                </p>
              </div>
              <Switch
                id="low-stock"
                checked={prefs.lowStockAlerts}
                onCheckedChange={(checked) =>
                  setPrefs({ ...prefs, lowStockAlerts: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-1">
                <Label htmlFor="movement" className="text-base">
                  Movimentações de Estoque
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receber alertas de entradas e saídas de materiais.
                </p>
              </div>
              <Switch
                id="movement"
                checked={prefs.movementAlerts}
                onCheckedChange={(checked) =>
                  setPrefs({ ...prefs, movementAlerts: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" /> Notificações por Email
            </CardTitle>
            <CardDescription>
              Receba resumos diários e alertas críticos no seu email cadastrado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-1">
                <Label htmlFor="email-notif" className="text-base">
                  Habilitar envio de emails
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enviaremos notificações para{' '}
                  <strong>{currentUser?.email}</strong>.
                </p>
              </div>
              <Switch
                id="email-notif"
                checked={prefs.emailNotifications}
                onCheckedChange={(checked) =>
                  setPrefs({ ...prefs, emailNotifications: checked })
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          <Save className="mr-2 h-4 w-4" /> Salvar Preferências
        </Button>
      </div>
    </div>
  )
}
