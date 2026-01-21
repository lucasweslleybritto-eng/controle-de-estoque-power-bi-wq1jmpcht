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
import { useEffect } from 'react'

const entrySchema = z
  .object({
    materialType: z.enum(['TRP', 'TRD']),
    materialName: z.string().min(2, 'Selecione um material'),
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
  const { streets, getLocationsByStreet, addPallet, materials } =
    useInventoryStore()

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
  const materialName = entryForm.watch('materialName')

  // Reset material selection when type changes to ensure consistency
  useEffect(() => {
    entryForm.setValue('materialName', '')
  }, [materialType, entryForm.setValue])

  const availableMaterials = materials.filter((m) => m.type === materialType)
  const selectedMaterial = materials.find((m) => m.name === materialName)

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
          Selecione o material e preencha os dados de recebimento.
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
              <Label>Material</Label>
              <Controller
                name="materialName"
                control={entryForm.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o Material" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableMaterials.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                          Sem materiais {materialType} cadastrados
                        </div>
                      ) : (
                        availableMaterials.map((m) => (
                          <SelectItem key={m.id} value={m.name}>
                            {m.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {entryForm.formState.errors.materialName && (
                <span className="text-xs text-red-500">
                  {entryForm.formState.errors.materialName.message}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <Label>Descrição / Lote</Label>
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

          {/* Visual Preview Section */}
          {materialName && (
            <div className="rounded-lg border bg-slate-50/50 p-4 mt-6 flex flex-col sm:flex-row items-center gap-6 animate-fade-in">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md border bg-white shadow-sm">
                {selectedMaterial?.image ? (
                  <img
                    src={selectedMaterial.image}
                    alt={materialName}
                    className="h-full w-full object-contain p-1"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted text-xs text-muted-foreground text-center p-1">
                    Sem Imagem
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-1 text-center sm:text-left">
                <h4 className="font-semibold text-sm">Confirmação Visual</h4>
                <p className="text-sm text-muted-foreground">
                  Você selecionou:{' '}
                  <span className="font-medium text-foreground">
                    {materialName}
                  </span>
                </p>
                {selectedMaterial?.description && (
                  <p className="text-xs text-muted-foreground italic">
                    {selectedMaterial.description}
                  </p>
                )}
              </div>
            </div>
          )}

          <Button type="submit" className="w-full md:w-auto mt-6" size="lg">
            <Check className="mr-2 h-4 w-4" /> Confirmar Entrada
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
