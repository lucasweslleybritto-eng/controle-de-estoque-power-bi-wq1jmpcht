import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowUpFromLine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Combobox } from '@/components/Combobox'
import { useToast } from '@/hooks/use-toast'
import useInventoryStore from '@/stores/useInventoryStore'

const exitSchema = z.object({
  palletId: z.string().min(1, 'Selecione um item'),
  user: z.string().min(2, 'Nome do operador obrigatório'),
})

export function ExitForm() {
  const { toast } = useToast()
  const { pallets, removePallet, getStreetName, getLocationName, locations } =
    useInventoryStore()

  const exitForm = useForm<z.infer<typeof exitSchema>>({
    resolver: zodResolver(exitSchema),
    defaultValues: {
      user: '',
    },
  })

  // Filter only TRD pallets for Exit, as requested: "Only TRD materials ... eligible for Exit"
  const trdPallets = pallets.filter((p) => p.type === 'TRD')

  // Map pallets to Combobox options
  const palletOptions = trdPallets.map((p) => {
    const location = locations.find((l) => l.id === p.locationId)
    const streetId = location?.streetId || ''
    const locationInfo = `${getLocationName(p.locationId)} (${getStreetName(streetId)})`

    return {
      value: p.id,
      label: `${p.materialName} - ${p.quantity} un - ${locationInfo}`,
    }
  })

  const onExitSubmit = (data: z.infer<typeof exitSchema>) => {
    removePallet(data.palletId, data.user)
    toast({
      title: 'Saída Registrada',
      description: 'Material removido do estoque.',
    })
    exitForm.reset({ user: '' })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Saída</CardTitle>
        <CardDescription>
          Remoção de material TRD (alocado em rua).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={exitForm.handleSubmit(onExitSubmit)}
          className="space-y-6"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Selecione o Item para Saída</Label>
              <Controller
                name="palletId"
                control={exitForm.control}
                render={({ field }) => (
                  <Combobox
                    options={palletOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Buscar item no estoque..."
                    emptyText="Nenhum item TRD disponível."
                    className="h-auto py-3"
                  />
                )}
              />
              {exitForm.formState.errors.palletId && (
                <span className="text-xs text-red-500">
                  {exitForm.formState.errors.palletId.message}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <Label>Operador Responsável</Label>
              <Input
                {...exitForm.register('user')}
                placeholder="Nome do operador"
              />
              {exitForm.formState.errors.user && (
                <span className="text-xs text-red-500">
                  {exitForm.formState.errors.user.message}
                </span>
              )}
            </div>
          </div>

          <Button
            type="submit"
            variant="destructive"
            className="w-full md:w-auto"
            size="lg"
          >
            <ArrowUpFromLine className="mr-2 h-4 w-4" /> Confirmar Saída
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
