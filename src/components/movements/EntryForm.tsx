import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Check } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import useInventoryStore from '@/stores/useInventoryStore'
import { cn } from '@/lib/utils'

const entrySchema = z
  .object({
    materialType: z.enum(['TRP', 'TRD']),
    materialName: z.string().min(2, 'Nome do material é obrigatório'),
    description: z.string(),
    quantity: z.coerce.number().min(1, 'Quantidade mínima é 1'),
    streetId: z.string().optional(),
    locationId: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.materialType === 'TRD') {
        return !!data.streetId && !!data.locationId
      }
      return true
    },
    {
      message: 'Rua e Localização são obrigatórios para TRD',
      path: ['locationId'],
    },
  )

export function EntryForm() {
  const { toast } = useToast()
  const { streets, getLocationsByStreet, addPallet } = useInventoryStore()

  const entryForm = useForm<z.infer<typeof entrySchema>>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      materialType: 'TRP',
      materialName: '',
      description: '',
      quantity: 1,
    },
  })

  const materialType = entryForm.watch('materialType')
  const selectedStreetId = entryForm.watch('streetId')

  const onEntrySubmit = (data: z.infer<typeof entrySchema>) => {
    addPallet({
      locationId: data.materialType === 'TRP' ? 'TRP_AREA' : data.locationId!,
      materialName: data.materialName,
      description: data.description,
      quantity: data.quantity,
      type: data.materialType,
    })
    toast({
      title: 'Entrada Registrada',
      description: `Material ${data.materialName} (${data.materialType}) adicionado.`,
    })
    entryForm.reset({
      materialType: 'TRP',
      materialName: '',
      description: '',
      quantity: 1,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova Entrada</CardTitle>
        <CardDescription>
          Preencha os dados para registrar recebimento de material.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={entryForm.handleSubmit(onEntrySubmit)}
          className="space-y-6"
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Tipo de Material</Label>
              <Controller
                name="materialType"
                control={entryForm.control}
                render={({ field }) => (
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant={field.value === 'TRP' ? 'default' : 'outline'}
                      className={cn(
                        'flex-1',
                        field.value === 'TRP' &&
                          'bg-blue-600 hover:bg-blue-700',
                      )}
                      onClick={() => field.onChange('TRP')}
                    >
                      TRP (Entrada)
                    </Button>
                    <Button
                      type="button"
                      variant={field.value === 'TRD' ? 'default' : 'outline'}
                      className={cn(
                        'flex-1',
                        field.value === 'TRD' &&
                          'bg-green-600 hover:bg-green-700',
                      )}
                      onClick={() => field.onChange('TRD')}
                    >
                      TRD (Rua)
                    </Button>
                  </div>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Nome do Material</Label>
              <Input
                {...entryForm.register('materialName')}
                placeholder="Ex: Motor Elétrico"
              />
              {entryForm.formState.errors.materialName && (
                <span className="text-xs text-red-500">
                  {entryForm.formState.errors.materialName.message}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <Label>Descrição / Detalhes</Label>
              <Input
                {...entryForm.register('description')}
                placeholder="Ex: Lote 123, Fornecedor X"
              />
            </div>

            <div className="space-y-2">
              <Label>Quantidade</Label>
              <Input type="number" {...entryForm.register('quantity')} />
            </div>

            {materialType === 'TRD' && (
              <>
                <div className="space-y-2">
                  <Label>Rua</Label>
                  <Controller
                    name="streetId"
                    control={entryForm.control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a Rua" />
                        </SelectTrigger>
                        <SelectContent>
                          {streets.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Localização</Label>
                  <Controller
                    name="locationId"
                    control={entryForm.control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!selectedStreetId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o Local" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedStreetId &&
                            getLocationsByStreet(selectedStreetId).map((l) => (
                              <SelectItem key={l.id} value={l.id}>
                                {l.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {entryForm.formState.errors.locationId && (
                    <span className="text-xs text-red-500">
                      {entryForm.formState.errors.locationId.message}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>

          <Button type="submit" className="w-full md:w-auto" size="lg">
            <Check className="mr-2 h-4 w-4" /> Confirmar Entrada
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
