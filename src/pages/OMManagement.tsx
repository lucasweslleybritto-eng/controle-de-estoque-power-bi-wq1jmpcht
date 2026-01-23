import { useState } from 'react'
import {
  Plus,
  Trash2,
  FileText,
  Building,
  CheckCircle2,
  Clock,
  CircleDashed,
  MoreVertical,
  Download,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import useInventoryStore from '@/stores/useInventoryStore'
import { useToast } from '@/hooks/use-toast'
import { GuiaStatus } from '@/types'
import { fileToBase64, cn } from '@/lib/utils'
import { ImagePreview } from '@/components/ui/image-preview'

export default function OMManagement() {
  const {
    oms,
    addOM,
    updateOM,
    deleteOM,
    guias,
    addGuia,
    updateGuia,
    deleteGuia,
    currentUser,
    getGuiasByOM,
  } = useInventoryStore()
  const { toast } = useToast()

  const [isAddOMOpen, setIsAddOMOpen] = useState(false)
  const [newOMName, setNewOMName] = useState('')
  const [newOMImage, setNewOMImage] = useState('')
  const [isLoadingImage, setIsLoadingImage] = useState(false)

  const [activeOMForGuia, setActiveOMForGuia] = useState<string | null>(null)
  const [newGuiaTitle, setNewGuiaTitle] = useState('')
  const [newGuiaFile, setNewGuiaFile] = useState('')

  const canEdit =
    currentUser?.role === 'ADMIN' || currentUser?.role === 'OPERATOR'

  const handleAddOM = () => {
    if (!newOMName.trim()) return
    addOM({
      name: newOMName,
      image: newOMImage || 'https://img.usecurling.com/i?q=military&color=gray',
    })
    setNewOMName('')
    setNewOMImage('')
    setIsAddOMOpen(false)
    toast({ title: 'OM Adicionada' })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setIsLoadingImage(true)
      const base64 = await fileToBase64(file)
      setNewOMImage(base64)
      toast({ title: 'Imagem carregada' })
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao carregar imagem' })
    } finally {
      setIsLoadingImage(false)
    }
  }

  const handleAddGuia = () => {
    if (!newGuiaTitle.trim() || !activeOMForGuia) return
    addGuia({
      omId: activeOMForGuia,
      title: newGuiaTitle,
      pdfUrl: newGuiaFile,
      status: 'pending',
    })
    setNewGuiaTitle('')
    setNewGuiaFile('')
    setActiveOMForGuia(null)
    toast({ title: 'Guia Adicionada' })
  }

  const handleGuiaFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      toast({ variant: 'destructive', title: 'Apenas PDF' })
      return
    }
    try {
      setIsLoadingImage(true)
      const base64 = await fileToBase64(file)
      setNewGuiaFile(base64)
      toast({ title: 'PDF carregado' })
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao carregar PDF' })
    } finally {
      setIsLoadingImage(false)
    }
  }

  const getStatusColor = (status: GuiaStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200 dark:bg-green-900/40 dark:text-green-300'
      case 'separating':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300'
      default:
        return 'bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
    }
  }

  const getStatusLabel = (status: GuiaStatus) => {
    switch (status) {
      case 'completed':
        return 'Separado'
      case 'separating':
        return 'Separando'
      default:
        return 'Não separado'
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de OMs</h1>
          <p className="text-muted-foreground">
            Controle visual de Organizações Militares e separação de material.
          </p>
        </div>
        {canEdit && (
          <Dialog open={isAddOMOpen} onOpenChange={setIsAddOMOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-sm">
                <Plus className="mr-2 h-4 w-4" /> Nova OM
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Nova OM</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome da OM</Label>
                  <Input
                    value={newOMName}
                    onChange={(e) => setNewOMName(e.target.value)}
                    placeholder="Ex: 12º GAC"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Brasão / Imagem</Label>
                  <div className="flex items-center gap-3">
                    {newOMImage && (
                      <img
                        src={newOMImage}
                        alt="Preview"
                        className="h-10 w-10 object-cover rounded"
                      />
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isLoadingImage}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddOM} disabled={isLoadingImage}>
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {oms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-lg bg-muted/20">
          <Building className="h-16 w-16 text-muted-foreground opacity-20 mb-4" />
          <h3 className="text-lg font-medium">Nenhuma OM cadastrada</h3>
          <p className="text-muted-foreground mb-4">
            Adicione uma Organização Militar para começar.
          </p>
          {canEdit && (
            <Button variant="outline" onClick={() => setIsAddOMOpen(true)}>
              Adicionar OM
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {oms.map((om) => {
            const omGuias = getGuiasByOM(om.id)
            const completedGuias = omGuias.filter(
              (g) => g.status === 'completed',
            ).length
            const totalGuias = omGuias.length
            const progress =
              totalGuias > 0 ? (completedGuias / totalGuias) * 100 : 0

            return (
              <Card
                key={om.id}
                className="flex flex-col h-[600px] overflow-hidden group hover:shadow-lg transition-all duration-300 border-muted"
              >
                <CardHeader className="pb-3 bg-muted/30">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <ImagePreview
                        src={om.image}
                        className="h-12 w-12 rounded-lg bg-white p-0.5 border shadow-sm overflow-hidden shrink-0"
                      />
                      <div className="overflow-hidden">
                        <CardTitle className="truncate text-lg" title={om.name}>
                          {om.name}
                        </CardTitle>
                        <CardDescription className="text-xs flex items-center gap-1">
                          {totalGuias} Guias &bull; {Math.round(progress)}%
                          Concluído
                        </CardDescription>
                      </div>
                    </div>
                    {canEdit && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive -mr-2 -mt-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Excluir {om.name}?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação removerá a OM e todas as suas guias
                              associadas permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteOM(om.id)}
                              className="bg-destructive"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex-1 p-0 flex flex-col min-h-0 bg-card">
                  <div className="p-3 border-b bg-slate-50 dark:bg-slate-900/20 flex justify-between items-center">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                      Guias de Separação
                    </h4>
                    {canEdit && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={() => setActiveOMForGuia(om.id)}
                      >
                        <Plus className="mr-1 h-3 w-3" /> Adicionar
                      </Button>
                    )}
                  </div>

                  <ScrollArea className="flex-1">
                    <div className="p-3 space-y-2">
                      {omGuias.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                          <FileText className="h-8 w-8 mx-auto opacity-20 mb-2" />
                          Nenhuma guia
                        </div>
                      ) : (
                        omGuias.map((guia) => (
                          <div
                            key={guia.id}
                            className="flex flex-col gap-2 p-3 rounded-lg border bg-background shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start gap-2">
                              <span
                                className="font-medium text-sm line-clamp-2"
                                title={guia.title}
                              >
                                {guia.title}
                              </span>
                              {canEdit && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 -mt-1 -mr-1"
                                    >
                                      <MoreVertical className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => deleteGuia(guia.id)}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />{' '}
                                      Excluir Guia
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>

                            <div className="flex items-center justify-between gap-2 mt-1">
                              {canEdit ? (
                                <Select
                                  value={guia.status}
                                  onValueChange={(v: GuiaStatus) =>
                                    updateGuia(guia.id, { status: v })
                                  }
                                >
                                  <SelectTrigger
                                    className={cn(
                                      'h-7 text-xs flex-1 border-0 focus:ring-0',
                                      getStatusColor(guia.status),
                                    )}
                                  >
                                    <div className="flex items-center gap-1.5 overflow-hidden">
                                      {guia.status === 'completed' && (
                                        <CheckCircle2 className="h-3 w-3 shrink-0" />
                                      )}
                                      {guia.status === 'separating' && (
                                        <Clock className="h-3 w-3 shrink-0" />
                                      )}
                                      {guia.status === 'pending' && (
                                        <CircleDashed className="h-3 w-3 shrink-0" />
                                      )}
                                      <span className="truncate">
                                        {getStatusLabel(guia.status)}
                                      </span>
                                    </div>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">
                                      <div className="flex items-center gap-2">
                                        <CircleDashed className="h-3 w-3" /> Não
                                        separado
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="separating">
                                      <div className="flex items-center gap-2">
                                        <Clock className="h-3 w-3" /> Separando
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="completed">
                                      <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-3 w-3" />{' '}
                                        Separado
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    'text-xs font-normal',
                                    getStatusColor(guia.status),
                                  )}
                                >
                                  {guia.status === 'completed' && (
                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                  )}
                                  {guia.status === 'separating' && (
                                    <Clock className="mr-1 h-3 w-3" />
                                  )}
                                  {guia.status === 'pending' && (
                                    <CircleDashed className="mr-1 h-3 w-3" />
                                  )}
                                  {getStatusLabel(guia.status)}
                                </Badge>
                              )}

                              {guia.pdfUrl && (
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7 shrink-0"
                                  asChild
                                  title="Baixar PDF"
                                >
                                  <a
                                    href={guia.pdfUrl}
                                    download={`Guia-${guia.title}.pdf`}
                                  >
                                    <Download className="h-3 w-3" />
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>

                {canEdit && (
                  <CardFooter className="p-3 border-t bg-muted/10">
                    <Button
                      className="w-full"
                      variant="secondary"
                      onClick={() => setActiveOMForGuia(om.id)}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Adicionar Guia
                    </Button>
                  </CardFooter>
                )}
              </Card>
            )
          })}
        </div>
      )}

      <Dialog
        open={!!activeOMForGuia}
        onOpenChange={(open) => !open && setActiveOMForGuia(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Guia de Separação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Título / Número da Guia</Label>
              <Input
                value={newGuiaTitle}
                onChange={(e) => setNewGuiaTitle(e.target.value)}
                placeholder="Ex: Guia 001/2024"
              />
            </div>
            <div className="space-y-2">
              <Label>Arquivo PDF (Opcional)</Label>
              <Input
                type="file"
                accept="application/pdf"
                onChange={handleGuiaFileUpload}
                disabled={isLoadingImage}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleAddGuia}
              disabled={isLoadingImage || !newGuiaTitle.trim()}
            >
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
