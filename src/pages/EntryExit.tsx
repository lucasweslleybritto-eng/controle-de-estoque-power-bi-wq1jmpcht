import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowDownToLine, ArrowUpFromLine, Check } from 'lucide-react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

const exitSchema = z.object({
  palletId: z.string().min(1, 'Selecione um item'),
  user: z.string().min(2, 'Nome do operador obrigatório'),
})

export default function EntryExit() {
  const { toast } = useToast()
  const {
    streets,
    getLocationsByStreet,
    addPallet,
    pallets,
    removePallet,
    getStreetName,
    getLocationName,
  } = useInventoryStore()
  const [activeTab, setActiveTab] = useState('entry')

  // Entry Form
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

  // Exit Form
  const exitForm = useForm<z.infer<typeof exitSchema>>({
    resolver: zodResolver(exitSchema),
    defaultValues: {
      user: '',
    },
  })

  // Filter only TRD pallets for Exit, as requested: "Only TRD materials ... eligible for Exit"
  const trdPallets = pallets.filter((p) => p.type === 'TRD')

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

  const onExitSubmit = (data: z.infer<typeof exitSchema>) => {
    removePallet(data.palletId, data.user)
    toast({
      title: 'Saída Registrada',
      description: 'Material removido do estoque.',
    })
    exitForm.reset({ user: '' })
  }

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
                            variant={
                              field.value === 'TRP' ? 'default' : 'outline'
                            }
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
                            variant={
                              field.value === 'TRD' ? 'default' : 'outline'
                            }
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
                </div>

                <Button type="submit" className="w-full md:w-auto" size="lg">
                  <Check className="mr-2 h-4 w-4" /> Confirmar Entrada
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exit" className="mt-6">
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
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="h-auto py-3">
                            <SelectValue placeholder="Buscar item no estoque..." />
                          </SelectTrigger>
                          <SelectContent className="max-h-80">
                            {trdPallets.length === 0 ? (
                              <div className="p-2 text-sm text-muted-foreground">
                                Nenhum item TRD disponível.
                              </div>
                            ) : (
                              trdPallets.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                  <span className="font-bold">
                                    {p.materialName}
                                  </span>{' '}
                                  - {p.quantity} un -{' '}
                                  {getLocationName(p.locationId)} (
                                  {getStreetName(
                                    useInventoryStore
                                      .getState()
                                      .locations.find(
                                        (l) => l.id === p.locationId,
                                      )?.streetId || '',
                                  )}
                                  )
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
