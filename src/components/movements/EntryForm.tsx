import { useState, ChangeEvent } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Check, Upload, Image as ImageIcon } from 'lucide-react'
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
import { cn, fileToBase64 } from '@/lib/utils'

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
  const [previewImage, setPreviewImage] = useState<string | null>(null)

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

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const base64 = await fileToBase64(file)
        setPreviewImage(base64)
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Erro no upload',
          description: 'Não foi possível processar a imagem.',
        })
      }
    }
  }

  const onEntrySubmit = (data: z.infer<typeof entrySchema>) => {
    addPallet({
      locationId: data.materialType === 'TRP' ? 'TRP_AREA' : data.locationId!,
      materialName: data.materialName,
      description: data.description,
      quantity: data.quantity,
      type: data.materialType,
      image: previewImage || undefined,
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
    setPreviewImage(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova Entrada</CardTitle>
        <CardDescription>
          Digite o nome do material, adicione uma foto e preencha os dados.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={entryForm.handleSubmit(onEntrySubmit)}
          className="space-y-6"
        >
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column: Material Info */}
            <div className="space-y-4">
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
                  placeholder="Digite o nome do material..."
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
                <Label>Foto do Material</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Location & Qty & Preview */}
            <div className="space-y-4">
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
                              getLocationsByStreet(selectedStreetId).map(
                                (l) => (
                                  <SelectItem key={l.id} value={l.id}>
                                    {l.name}
                                  </SelectItem>
                                ),
                              )}
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

              {/* Preview Section */}
              <div className="rounded-lg border bg-slate-50 p-4 mt-4">
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" /> Pré-visualização
                </h4>
                <div className="flex gap-4 items-start">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md border bg-white shadow-sm flex items-center justify-center">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Upload className="h-8 w-8 text-slate-300" />
                    )}
                  </div>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Material:</span>{' '}
                      {materialName || '...'}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="font-medium">Tipo:</span> {materialType}
                    </p>
                    {previewImage ? (
                      <span className="inline-flex items-center text-xs text-green-600 font-medium">
                        <Check className="mr-1 h-3 w-3" /> Imagem carregada
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        Sem imagem selecionada
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full md:w-auto mt-6" size="lg">
            <Check className="mr-2 h-4 w-4" /> Confirmar Entrada
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
