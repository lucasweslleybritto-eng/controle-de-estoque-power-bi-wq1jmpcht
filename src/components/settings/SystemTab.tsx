import { useState } from 'react'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import useInventoryStore from '@/stores/useInventoryStore'
import { useToast } from '@/hooks/use-toast'

export function SystemTab() {
  const { settings, updateSettings } = useInventoryStore()
  const { toast } = useToast()

  const [formData, setFormData] = useState(settings)

  const handleSave = () => {
    updateSettings(formData)
    toast({
      title: 'Configurações Salvas',
      description: 'As alterações foram aplicadas ao sistema.',
    })
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
            <CardTitle>Limites e Alertas</CardTitle>
            <CardDescription>
              Defina quando o sistema deve alertar os operadores.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Alerta de Estoque Baixo (Qtd)</Label>
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
                Materiais com quantidade abaixo deste valor serão marcados em
                vermelho.
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
                Ruas com ocupação acima deste valor serão marcadas como
                críticas.
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
    </div>
  )
}
