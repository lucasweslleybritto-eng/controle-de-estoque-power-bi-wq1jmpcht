import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowUpFromLine, Search, Package } from 'lucide-react'
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
import { useToast } from '@/hooks/use-toast'
import useInventoryStore from '@/stores/useInventoryStore'
import { cn } from '@/lib/utils'

const exitSchema = z.object({
  user: z.string().min(2, 'Nome do operador obrigatório'),
})

export function ExitForm() {
  const { toast } = useToast()
  const { pallets, removePallet, getStreetName, getLocationName, locations } =
    useInventoryStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPalletId, setSelectedPalletId] = useState<string | null>(null)

  const exitForm = useForm<z.infer<typeof exitSchema>>({
    resolver: zodResolver(exitSchema),
    defaultValues: {
      user: '',
    },
  })

  // Filter matching pallets
  const filteredPallets = pallets.filter((p) => {
    if (p.type !== 'TRD') return false
    if (!searchTerm) return false
    return p.materialName.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const handleSelectPallet = (id: string) => {
    setSelectedPalletId(id === selectedPalletId ? null : id)
  }

  const onExitSubmit = (data: z.infer<typeof exitSchema>) => {
    if (!selectedPalletId) {
      toast({
        variant: 'destructive',
        title: 'Selecione um item',
        description: 'Você precisa selecionar um item da lista para dar baixa.',
      })
      return
    }

    removePallet(selectedPalletId, data.user)
    toast({
      title: 'Saída Registrada',
      description: `Material removido do estoque por ${data.user}.`,
    })
    exitForm.reset({ user: '' })
    setSelectedPalletId(null)
    setSearchTerm('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Saída</CardTitle>
        <CardDescription>
          Busque pelo nome do material e selecione o lote para remover.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={exitForm.handleSubmit(onExitSubmit)}
          className="space-y-6"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome do Material</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Digite para buscar material no estoque..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setSelectedPalletId(null)
                  }}
                  className="pl-9"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Digite o nome do material para ver os itens disponíveis.
              </p>
            </div>

            {/* Results List */}
            {searchTerm && (
              <div className="space-y-2 max-h-[300px] overflow-y-auto rounded-md border p-2 bg-slate-50/50">
                {filteredPallets.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Nenhum material TRD encontrado com esse nome.
                  </div>
                ) : (
                  filteredPallets.map((p) => {
                    const location = locations.find(
                      (l) => l.id === p.locationId,
                    )
                    const streetId = location?.streetId || ''
                    const locName = getLocationName(p.locationId)
                    const strName = getStreetName(streetId)

                    return (
                      <div
                        key={p.id}
                        onClick={() => handleSelectPallet(p.id)}
                        className={cn(
                          'flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors',
                          selectedPalletId === p.id
                            ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                            : 'bg-white hover:bg-slate-50',
                        )}
                      >
                        <div className="h-10 w-10 shrink-0 rounded bg-slate-100 flex items-center justify-center overflow-hidden">
                          {p.image ? (
                            <img
                              src={p.image}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package className="h-5 w-5 text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {p.materialName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {p.description}
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-xs">
                            <span className="bg-slate-200 px-1.5 py-0.5 rounded">
                              Qtd: {p.quantity}
                            </span>
                            <span className="text-muted-foreground">
                              {strName} - {locName}
                            </span>
                          </div>
                        </div>
                        <div className="shrink-0">
                          <div
                            className={cn(
                              'h-4 w-4 rounded-full border border-primary flex items-center justify-center',
                              selectedPalletId === p.id
                                ? 'bg-primary'
                                : 'bg-transparent',
                            )}
                          >
                            {selectedPalletId === p.id && (
                              <div className="h-2 w-2 rounded-full bg-white" />
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}

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
            disabled={!selectedPalletId}
          >
            <ArrowUpFromLine className="mr-2 h-4 w-4" /> Confirmar Saída
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
