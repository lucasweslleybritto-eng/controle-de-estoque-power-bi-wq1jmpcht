import { useState, useRef } from 'react'
import {
  Plus,
  Trash2,
  FileText,
  Upload,
  ExternalLink,
  Edit2,
  Building,
  CheckCircle2,
  Clock,
  CircleDashed,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import useInventoryStore from '@/stores/useInventoryStore'
import { useToast } from '@/hooks/use-toast'
import { OM, Guia, GuiaStatus } from '@/types'
import { fileToBase64, cn } from '@/lib/utils'
import { ImagePreview } from '@/components/ui/image-preview'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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
  } = useInventoryStore()
  const { toast } = useToast()

  const [activeOM, setActiveOM] = useState<string | null>(null)
  const [isAddOMOpen, setIsAddOMOpen] = useState(false)
  const [newOMName, setNewOMName] = useState('')
  const [newOMImage, setNewOMImage] = useState('')
  const [isLoadingImage, setIsLoadingImage] = useState(false)

  const [isAddGuiaOpen, setIsAddGuiaOpen] = useState(false)
  const [newGuiaTitle, setNewGuiaTitle] = useState('')
  const [newGuiaFile, setNewGuiaFile] = useState('')
  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(
    null,
  )

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
    if (!newGuiaTitle.trim() || !activeOM) return
    addGuia({
      omId: activeOM,
      title: newGuiaTitle,
      pdfUrl: newGuiaFile,
      status: 'pending',
    })
    setNewGuiaTitle('')
    setNewGuiaFile('')
    setIsAddGuiaOpen(false)
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
        return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
      case 'separating':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
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
      <div className="flex justify-between items-center border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestão de OMs e Guias
          </h1>
          <p className="text-muted-foreground">
            Gerencie Organizações Militares e suas guias de separação.
          </p>
        </div>
        {canEdit && (
          <Dialog open={isAddOMOpen} onOpenChange={setIsAddOMOpen}>
            <DialogTrigger asChild>
              <Button>
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
        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/20">
          <Building className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-3" />
          <p className="text-muted-foreground">Nenhuma OM cadastrada.</p>
        </div>
      ) : (
        <Tabs
          defaultValue={oms[0]?.id}
          onValueChange={setActiveOM}
          className="w-full"
        >
          <div className="flex items-center justify-between mb-4 overflow-x-auto pb-2">
            <TabsList className="bg-transparent h-auto p-0 gap-2">
              {oms.map((om) => (
                <TabsTrigger
                  key={om.id}
                  value={om.id}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-card hover:bg-accent px-4 py-2 h-auto"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={om.image}
                      alt={om.name}
                      className="h-6 w-6 rounded-full object-cover bg-white"
                    />
                    <span>{om.name}</span>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {oms.map((om) => (
            <TabsContent
              key={om.id}
              value={om.id}
              className="animate-fade-in-up"
            >
              <div className="grid gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-4">
                      <ImagePreview
                        src={om.image}
                        className="h-16 w-16 rounded-lg bg-white border"
                      />
                      <div>
                        <CardTitle>{om.name}</CardTitle>
                        <CardDescription>
                          {guias.filter((g) => g.omId === om.id).length} Guias
                          registradas
                        </CardDescription>
                      </div>
                    </div>
                    {canEdit && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="mr-2 h-4 w-4" /> Remover OM
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Excluir {om.name}?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Todas as guias associadas serão perdidas.
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
                  </CardHeader>
                </Card>

                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Guias de Separação</h3>
                  {canEdit && (
                    <Dialog
                      open={isAddGuiaOpen}
                      onOpenChange={setIsAddGuiaOpen}
                    >
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="mr-2 h-4 w-4" /> Nova Guia
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Anexar Guia para {om.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Título / Número</Label>
                            <Input
                              value={newGuiaTitle}
                              onChange={(e) => setNewGuiaTitle(e.target.value)}
                              placeholder="Ex: Guia 001/2024"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Arquivo PDF</Label>
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
                            disabled={isLoadingImage || !newGuiaFile}
                          >
                            Salvar
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {guias
                    .filter((g) => g.omId === om.id)
                    .map((guia) => (
                      <Card
                        key={guia.id}
                        className="group relative overflow-hidden"
                      >
                        <div
                          className={`absolute top-0 left-0 w-1 h-full ${
                            guia.status === 'completed'
                              ? 'bg-green-500'
                              : guia.status === 'separating'
                                ? 'bg-blue-500'
                                : 'bg-slate-300'
                          }`}
                        />
                        <CardHeader className="pb-2 pl-6">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-base truncate pr-2">
                              {guia.title}
                            </CardTitle>
                            {canEdit && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 -mt-1 -mr-2 text-muted-foreground hover:text-destructive"
                                onClick={() => deleteGuia(guia.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          <CardDescription className="text-xs">
                            Criado em{' '}
                            {format(new Date(guia.createdAt), 'dd/MM/yyyy', {
                              locale: ptBR,
                            })}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pl-6 pb-2">
                          <div className="flex items-center gap-2 mb-3">
                            {guia.status === 'completed' && (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            )}
                            {guia.status === 'separating' && (
                              <Clock className="h-4 w-4 text-blue-500" />
                            )}
                            {guia.status === 'pending' && (
                              <CircleDashed className="h-4 w-4 text-slate-400" />
                            )}

                            {canEdit ? (
                              <Select
                                value={guia.status}
                                onValueChange={(v: GuiaStatus) =>
                                  updateGuia(guia.id, { status: v })
                                }
                              >
                                <SelectTrigger className="h-7 text-xs w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">
                                    Não separado
                                  </SelectItem>
                                  <SelectItem value="separating">
                                    Separando
                                  </SelectItem>
                                  <SelectItem value="completed">
                                    Separado
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <span
                                className={cn(
                                  'text-xs font-medium px-2 py-0.5 rounded',
                                  getStatusColor(guia.status),
                                )}
                              >
                                {getStatusLabel(guia.status)}
                              </span>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="pl-6 pt-0">
                          {guia.pdfUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full gap-2"
                              asChild
                            >
                              <a
                                href={guia.pdfUrl}
                                download={`Guia-${guia.title}.pdf`}
                              >
                                <FileText className="h-3 w-3" /> Baixar PDF
                              </a>
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    ))}
                  {guias.filter((g) => g.omId === om.id).length === 0 && (
                    <div className="col-span-full py-8 text-center text-muted-foreground text-sm border border-dashed rounded bg-muted/20">
                      Nenhuma guia anexada.
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}
