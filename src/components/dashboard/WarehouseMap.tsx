import { useState, useEffect, useRef } from 'react'
import {
  Building,
  ArrowRight,
  Plus,
  LayoutDashboard,
  GripVertical,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import useInventoryStore from '@/stores/useInventoryStore'
import { cn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'

export function WarehouseMap() {
  const {
    streets,
    getLocationsByStreet,
    addStreet,
    pallets,
    currentUser,
    reorderStreets,
  } = useInventoryStore()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [orderedStreets, setOrderedStreets] = useState(streets)
  const [newStreetName, setNewStreetName] = useState('')
  const [isAddStreetOpen, setIsAddStreetOpen] = useState(false)
  const [draggedId, setDraggedId] = useState<string | null>(null)

  const canEdit =
    currentUser?.role === 'ADMIN' || currentUser?.role === 'OPERATOR'

  useEffect(() => {
    if (!draggedId) {
      setOrderedStreets(streets)
    }
  }, [streets, draggedId])

  const handleAddStreet = () => {
    if (newStreetName.trim()) {
      addStreet(newStreetName)
      setNewStreetName('')
      setIsAddStreetOpen(false)
      toast({
        title: 'Rua criada',
        description: `Rua ${newStreetName} adicionada com sucesso.`,
      })
    }
  }

  // HTML5 Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id)
    e.dataTransfer.effectAllowed = 'move'
    // Optional: Set custom drag image if needed, but default is usually fine
  }

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'

    if (!draggedId || draggedId === targetId) return

    const oldIndex = orderedStreets.findIndex((s) => s.id === draggedId)
    const newIndex = orderedStreets.findIndex((s) => s.id === targetId)

    if (oldIndex === -1 || newIndex === -1) return

    // Optimistic reorder
    const newOrder = [...orderedStreets]
    const [movedItem] = newOrder.splice(oldIndex, 1)
    newOrder.splice(newIndex, 0, movedItem)
    setOrderedStreets(newOrder)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (draggedId) {
      reorderStreets(orderedStreets)
      setDraggedId(null)
    }
  }

  // Touch Support
  const touchStartItemRef = useRef<string | null>(null)

  const handleTouchStart = (id: string) => {
    touchStartItemRef.current = id
    setDraggedId(id)
    // Prevent scrolling during drag
    document.body.style.overflow = 'hidden'
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartItemRef.current) return
    const touch = e.touches[0]
    const element = document.elementFromPoint(touch.clientX, touch.clientY)
    const card = element?.closest('[data-street-id]') as HTMLElement

    if (card) {
      const targetId = card.getAttribute('data-street-id')
      if (targetId && targetId !== touchStartItemRef.current) {
        // Swap logic similar to dragOver
        const oldIndex = orderedStreets.findIndex(
          (s) => s.id === touchStartItemRef.current,
        )
        const newIndex = orderedStreets.findIndex((s) => s.id === targetId)

        if (oldIndex !== -1 && newIndex !== -1) {
          const newOrder = [...orderedStreets]
          const [movedItem] = newOrder.splice(oldIndex, 1)
          newOrder.splice(newIndex, 0, movedItem)
          setOrderedStreets(newOrder)
        }
      }
    }
  }

  const handleTouchEnd = () => {
    touchStartItemRef.current = null
    setDraggedId(null)
    document.body.style.overflow = ''
    reorderStreets(orderedStreets)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <LayoutDashboard className="h-8 w-8 text-primary" />
            Mapa do Armazém
          </h1>
          <p className="text-muted-foreground mt-1">
            Visualização e gestão prioritária de ruas e corredores.
          </p>
        </div>
        {canEdit && (
          <Dialog open={isAddStreetOpen} onOpenChange={setIsAddStreetOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="shadow-sm">
                <Plus className="mr-2 h-5 w-5" /> Adicionar Nova Rua
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Rua / Corredor</DialogTitle>
              </DialogHeader>
              <div className="py-4 space-y-2">
                <Label>Nome da Rua</Label>
                <Input
                  value={newStreetName}
                  onChange={(e) => setNewStreetName(e.target.value)}
                  placeholder="Ex: Rua C, Corredor 4"
                />
              </div>
              <DialogFooter>
                <Button onClick={handleAddStreet}>Criar Rua</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {orderedStreets.map((street) => {
          const streetLocations = getLocationsByStreet(street.id)
          const streetOccupied = streetLocations.filter((l) =>
            pallets.some((p) => p.locationId === l.id),
          ).length
          const streetTotal = streetLocations.length
          const streetOccupancy =
            streetTotal > 0
              ? Math.round((streetOccupied / streetTotal) * 100)
              : 0

          const isDragging = draggedId === street.id

          return (
            <div
              key={street.id}
              data-street-id={street.id}
              draggable={canEdit}
              onDragStart={(e) => handleDragStart(e, street.id)}
              onDragOver={(e) => handleDragOver(e, street.id)}
              onDrop={handleDrop}
              className={cn(
                'h-full transition-transform duration-200',
                isDragging ? 'opacity-50 scale-105 z-50' : '',
              )}
            >
              <Card
                className={cn(
                  'h-full border-t-8 transition-all duration-300 overflow-hidden relative bg-card flex flex-col',
                  !isDragging && 'hover:shadow-xl hover:-translate-y-1',
                )}
                onClick={() => navigate(`/street/${street.id}`)}
              >
                <div
                  className={cn(
                    'absolute top-0 left-0 right-0 h-2',
                    streetOccupancy > 90
                      ? 'bg-green-600'
                      : streetOccupancy < 10
                        ? 'bg-red-500'
                        : 'bg-blue-500',
                  )}
                />
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                      <Building className="h-6 w-6 text-muted-foreground" />
                      {street.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {canEdit && (
                        <div
                          className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
                          onClick={(e) => e.stopPropagation()}
                          onTouchStart={(e) => {
                            e.stopPropagation()
                            handleTouchStart(street.id)
                          }}
                          onTouchMove={(e) => {
                            e.stopPropagation()
                            handleTouchMove(e)
                          }}
                          onTouchEnd={(e) => {
                            e.stopPropagation()
                            handleTouchEnd()
                          }}
                          style={{ touchAction: 'none' }}
                        >
                          <GripVertical className="h-5 w-5 text-muted-foreground/50 hover:text-foreground" />
                        </div>
                      )}
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">
                        Capacidade: {streetTotal} locais
                      </span>
                      <span
                        className={cn(
                          'font-bold px-2 py-0.5 rounded text-xs',
                          streetOccupancy > 90
                            ? 'bg-green-100 text-green-800'
                            : 'bg-slate-100 text-slate-800',
                        )}
                      >
                        {streetOccupancy}% Ocupado
                      </span>
                    </div>

                    <div className="flex gap-1 flex-wrap mt-2">
                      {streetLocations.slice(0, 12).map((loc) => {
                        const isLocOccupied = pallets.some(
                          (p) => p.locationId === loc.id,
                        )
                        return (
                          <div
                            key={loc.id}
                            className={cn(
                              'h-3 w-3 rounded-sm',
                              isLocOccupied ? 'bg-green-500' : 'bg-red-200',
                            )}
                            title={`${loc.name}: ${isLocOccupied ? 'Ocupado' : 'Vazio'}`}
                          />
                        )
                      })}
                      {streetLocations.length > 12 && (
                        <div className="h-3 w-3 rounded-full bg-slate-200 text-[8px] flex items-center justify-center text-slate-500">
                          +
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        })}
        {orderedStreets.length === 0 && (
          <div className="col-span-full py-16 text-center border-2 border-dashed rounded-lg bg-muted/20">
            <Building className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-xl font-semibold">Nenhuma rua configurada</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2">
              Comece criando ruas para organizar seu layout de armazém.
            </p>
            {canEdit && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsAddStreetOpen(true)}
              >
                Criar Primeira Rua
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
