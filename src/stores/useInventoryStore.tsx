import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from 'react'
import {
  Street,
  Location,
  Pallet,
  MovementLog,
  Material,
  SystemSettings,
  Equipment,
  LogType,
  User,
  UserPreferences,
  SyncStatus,
  OM,
  Guia,
  BallisticItem,
  BallisticStatus,
} from '@/types'
import { inventoryService } from '@/services/inventoryService'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'

interface InventoryContextType {
  streets: Street[]
  locations: Location[]
  pallets: Pallet[]
  history: MovementLog[]
  materials: Material[]
  equipments: Equipment[]
  settings: SystemSettings
  users: User[]
  oms: OM[]
  guias: Guia[]
  ballisticItems: BallisticItem[]
  currentUser: User | null
  alerts: Array<{ id: string; message: string; type: 'low-stock' | 'system' }>
  syncStatus: SyncStatus
  lastSync: Date
  isOnline: boolean
  isLoading: boolean

  getLocationsByStreet: (streetId: string) => Location[]
  getPalletsByLocation: (locationId: string) => Pallet[]
  getLocationStatus: (locationId: string) => 'occupied' | 'empty'
  getStreetName: (streetId: string) => string
  getLocationName: (locationId: string) => string
  getMaterialImage: (materialName: string) => string | undefined
  getMaterialTotalStock: (materialId: string) => number
  isLowStock: (materialId: string) => boolean
  getGuiasByOM: (omId: string) => Guia[]

  addStreet: (name: string) => void
  updateStreet: (id: string, name: string) => void
  deleteStreet: (id: string) => void
  moveStreet: (id: string, direction: 'up' | 'down') => void
  reorderStreets: (newStreets: Street[]) => void

  addLocation: (streetId: string, name: string) => void
  updateLocation: (id: string, updates: Partial<Location>) => void
  deleteLocation: (id: string) => void
  moveLocation: (locationId: string, direction: 'up' | 'down') => void
  changeLocationStreet: (locationId: string, newStreetId: string) => void

  addMaterial: (material: Omit<Material, 'id'>) => void
  updateMaterial: (id: string, material: Partial<Material>) => void
  deleteMaterial: (id: string) => void
  importMaterials: (
    data: { material: Omit<Material, 'id'>; initialQuantity: number }[],
  ) => void

  addEquipment: (equipment: Omit<Equipment, 'id'>) => void
  deleteEquipment: (id: string) => void

  addOM: (om: Omit<OM, 'id'>) => void
  updateOM: (id: string, updates: Partial<OM>) => void
  deleteOM: (id: string) => void

  addGuia: (guia: Omit<Guia, 'id' | 'createdAt'>) => void
  updateGuia: (id: string, updates: Partial<Guia>) => void
  deleteGuia: (id: string) => void

  addBallisticItem: (
    item: Omit<BallisticItem, 'id' | 'createdAt' | 'updatedAt'>,
  ) => void
  updateBallisticItem: (id: string, updates: Partial<BallisticItem>) => void
  deleteBallisticItem: (id: string) => void

  setSessionUser: (user: User) => void
  logout: () => void
  addUser: (user: Omit<User, 'id'>) => User
  updateUser: (id: string, user: Partial<User>) => void
  deleteUser: (id: string) => void
  updateUserPreferences: (prefs: Partial<UserPreferences>) => void

  updateSettings: (settings: Partial<SystemSettings>) => void
  resetSystem: () => void
  simulateRemoteUpdate: () => void
  retryConnection: () => void

  addPallet: (
    pallet: Omit<Pallet, 'id' | 'entryDate'> & { entryDate?: string },
    user?: string,
  ) => void
  updatePallet: (id: string, updates: Partial<Pallet>) => void
  movePallet: (id: string, newLocationId: string) => void
  removePallet: (id: string, user: string) => void
  clearLocation: (locationId: string) => void
}

const InventoryContext = createContext<InventoryContextType | undefined>(
  undefined,
)

const translateBallisticStatus = (status: BallisticStatus) => {
  const map: Record<BallisticStatus, string> = {
    active: 'Disponível',
    'in-use': 'Em uso',
    reserved: 'Reservado',
    obsolete: 'Obsoleto',
    condemned: 'Condenado',
    maintenance: 'Manutenção',
    lost: 'Extraviado',
    distributed: 'Distribuído',
  }
  return map[status] || status
}

export const InventoryProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const { toast } = useToast()
  const { user, loading: authLoading } = useAuth()

  const [streets, setStreets] = useState<Street[]>(() =>
    inventoryService.getStreets(),
  )
  const [locations, setLocations] = useState<Location[]>(() =>
    inventoryService.getLocations(),
  )
  const [materials, setMaterials] = useState<Material[]>(() =>
    inventoryService.getMaterials(),
  )
  const [equipments, setEquipments] = useState<Equipment[]>(() =>
    inventoryService.getEquipments(),
  )
  const [settings, setSettings] = useState<SystemSettings>(() =>
    inventoryService.getSettings(),
  )
  const [pallets, setPallets] = useState<Pallet[]>(() =>
    inventoryService.getPallets(),
  )
  const [history, setHistory] = useState<MovementLog[]>(() =>
    inventoryService.getHistory(),
  )
  const [users, setUsers] = useState<User[]>(() => inventoryService.getUsers())
  const [oms, setOms] = useState<OM[]>(() => inventoryService.getOMs())
  const [guias, setGuias] = useState<Guia[]>(() => inventoryService.getGuias())
  const [ballisticItems, setBallisticItems] = useState<BallisticItem[]>(() =>
    inventoryService.getBallisticItems(),
  )

  const [currentUser, setCurrentUser] = useState<User | null>(null)

  const [syncStatus, setSyncStatus] = useState<SyncStatus>(
    inventoryService.getStatus().status,
  )
  const [lastSync, setLastSync] = useState<Date>(
    inventoryService.getStatus().lastSync,
  )
  const [isOnline, setIsOnline] = useState<boolean>(
    inventoryService.getStatus().isOnline,
  )
  const [isLoading, setIsLoading] = useState<boolean>(
    inventoryService.getIsLoading(),
  )

  // Initialize service only after user is authenticated to respect RLS
  useEffect(() => {
    if (user && !authLoading) {
      inventoryService.init()
    }
  }, [user, authLoading])

  useEffect(() => {
    const unsubscribe = inventoryService.subscribe((event) => {
      if (event.type === 'UPDATE') {
        switch (event.key) {
          case inventoryService.keys.STREETS:
            setStreets([...inventoryService.getStreets()])
            break
          case inventoryService.keys.LOCATIONS:
            setLocations([...inventoryService.getLocations()])
            break
          case inventoryService.keys.MATERIALS:
            setMaterials([...inventoryService.getMaterials()])
            break
          case inventoryService.keys.EQUIPMENTS:
            setEquipments([...inventoryService.getEquipments()])
            break
          case inventoryService.keys.SETTINGS:
            setSettings({ ...inventoryService.getSettings() })
            break
          case inventoryService.keys.PALLETS:
            setPallets([...inventoryService.getPallets()])
            break
          case inventoryService.keys.HISTORY:
            setHistory([...inventoryService.getHistory()])
            break
          case inventoryService.keys.USERS:
            setUsers([...inventoryService.getUsers()])
            break
          case inventoryService.keys.OMS:
            setOms([...inventoryService.getOMs()])
            break
          case inventoryService.keys.GUIAS:
            setGuias([...inventoryService.getGuias()])
            break
          case 'ballisticItems':
          case inventoryService.keys.BALLISTIC_ITEMS:
            setBallisticItems([...inventoryService.getBallisticItems()])
            break
        }
      } else if (event.type === 'SYNC_STATUS') {
        setSyncStatus(event.status)
        if (event.lastSync) setLastSync(event.lastSync)
        setIsOnline(event.status !== 'offline')
      } else if (event.type === 'LOADING_CHANGE') {
        setIsLoading(event.isLoading)
      } else if (event.type === 'NOTIFICATION') {
        if (currentUser) {
          const { preferences } = currentUser
          if (event.category === 'low-stock' && !preferences.lowStockAlerts)
            return
          if (event.category === 'movement' && !preferences.movementAlerts)
            return
        }

        toast({
          title: 'Notificação',
          description: event.message,
          variant: event.variant,
        })
      }
    })
    return unsubscribe
  }, [toast, currentUser])

  const getLocationsByStreet = useCallback(
    (streetId: string) => locations.filter((l) => l.streetId === streetId),
    [locations],
  )

  const getPalletsByLocation = useCallback(
    (locationId: string) => pallets.filter((p) => p.locationId === locationId),
    [pallets],
  )

  const getGuiasByOM = useCallback(
    (omId: string) => guias.filter((g) => g.omId === omId),
    [guias],
  )

  const getLocationStatus = useCallback(
    (locationId: string) => {
      const hasPallet = pallets.some((p) => p.locationId === locationId)
      return hasPallet ? 'occupied' : 'empty'
    },
    [pallets],
  )

  const getStreetName = useCallback(
    (streetId: string) => streets.find((s) => s.id === streetId)?.name || 'N/A',
    [streets],
  )

  const getLocationName = useCallback(
    (locationId: string) =>
      locations.find((l) => l.id === locationId)?.name ||
      (locationId === 'TRP_AREA' ? 'Zona TRP' : 'N/A'),
    [locations],
  )

  const getMaterialImage = useCallback(
    (materialName: string) => {
      const mat = materials.find((m) => m.name === materialName)
      return mat?.image
    },
    [materials],
  )

  const getMaterialTotalStock = useCallback(
    (materialId: string) => {
      return pallets
        .filter((p) => p.materialId === materialId)
        .reduce((sum, p) => sum + p.quantity, 0)
    },
    [pallets],
  )

  const isLowStock = useCallback(
    (materialId: string) => {
      const material = materials.find((m) => m.id === materialId)
      const threshold =
        material?.minStock !== undefined
          ? material.minStock
          : settings.lowStockThreshold

      if (!material) return false
      const total = getMaterialTotalStock(materialId)
      return total <= threshold
    },
    [materials, getMaterialTotalStock, settings.lowStockThreshold],
  )

  const alerts = useMemo(() => {
    const stockAlerts = materials
      .filter((m) => isLowStock(m.id))
      .map((m) => ({
        id: `low-${m.id}`,
        message: `Estoque baixo: ${m.name} (${getMaterialTotalStock(m.id)} unidades)`,
        type: 'low-stock' as const,
      }))
    return stockAlerts
  }, [materials, isLowStock, getMaterialTotalStock])

  const addLog = (
    type: LogType,
    params: { pallet?: Pallet; details?: string; date?: string },
    user: string = 'Sistema',
  ) => {
    const { pallet, details, date } = params
    let locName = 'N/A'
    let streetName = 'N/A'
    let image = undefined
    let materialName = undefined
    let materialType = undefined
    let quantity = undefined

    if (pallet) {
      const loc = locations.find((l) => l.id === pallet.locationId)
      locName = loc
        ? loc.name
        : pallet.locationId === 'TRP_AREA'
          ? 'Zona TRP'
          : 'N/A'
      streetName = loc
        ? streets.find((s) => s.id === loc.streetId)?.name || 'N/A'
        : 'Zona de Entrada'
      image = pallet.image || getMaterialImage(pallet.materialName)
      materialName = pallet.materialName
      materialType = pallet.type
      quantity = pallet.quantity
    }

    const log: MovementLog = {
      id: crypto.randomUUID(),
      date: date || new Date().toISOString(),
      user,
      type,
      materialType,
      materialName,
      quantity,
      locationName: locName,
      streetName,
      image,
      description: details,
    }

    inventoryService.upsertItem(inventoryService.keys.HISTORY, log)
  }

  const setSessionUser = (user: User) => {
    setCurrentUser(user)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setCurrentUser(null)
    toast({ title: 'Logout realizado' })
  }

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser = { ...userData, id: crypto.randomUUID() }
    inventoryService.upsertItem(inventoryService.keys.USERS, newUser)
    return newUser
  }

  const updateUser = (id: string, updates: Partial<User>) => {
    const user = users.find((u) => u.id === id)
    if (user) {
      inventoryService.upsertItem(inventoryService.keys.USERS, {
        ...user,
        ...updates,
      })
    }
  }

  const deleteUser = (id: string) => {
    inventoryService.deleteItem(inventoryService.keys.USERS, id)
  }

  const updateUserPreferences = (prefs: Partial<UserPreferences>) => {
    if (!currentUser) return
    const updatedUser = {
      ...currentUser,
      preferences: { ...currentUser.preferences, ...prefs },
    }
    updateUser(currentUser.id, updatedUser)
    setCurrentUser(updatedUser)
  }

  const addStreet = (name: string) => {
    const maxOrder = Math.max(...streets.map((s) => s.order || 0), -1)
    const newStreet = { id: crypto.randomUUID(), name, order: maxOrder + 1 }
    inventoryService.upsertItem(inventoryService.keys.STREETS, newStreet)
    addLog(
      'SYSTEM',
      { details: `Rua criada: ${name}` },
      currentUser?.name || 'Gerente',
    )
    inventoryService.notifyEvent(`Nova rua criada: ${name}`, 'system')
  }

  const updateStreet = (id: string, name: string) => {
    const street = streets.find((s) => s.id === id)
    if (street) {
      inventoryService.upsertItem(inventoryService.keys.STREETS, {
        ...street,
        name,
      })
      addLog(
        'SYSTEM',
        { details: `Rua renomeada: ${street.name} -> ${name}` },
        currentUser?.name || 'Gerente',
      )
    }
  }

  const deleteStreet = (id: string) => {
    const streetName = streets.find((s) => s.id === id)?.name || 'Unknown'

    const streetLocations = locations.filter((l) => l.streetId === id)
    const streetLocationIds = streetLocations.map((l) => l.id)
    const palletsToDelete = pallets.filter((p) =>
      streetLocationIds.includes(p.locationId),
    )
    palletsToDelete.forEach((p) =>
      inventoryService.deleteItem(inventoryService.keys.PALLETS, p.id),
    )

    streetLocations.forEach((l) =>
      inventoryService.deleteItem(inventoryService.keys.LOCATIONS, l.id),
    )

    inventoryService.deleteItem(inventoryService.keys.STREETS, id)

    addLog(
      'SYSTEM',
      { details: `Rua excluída: ${streetName}` },
      currentUser?.name || 'Gerente',
    )
    inventoryService.notifyEvent(
      `Rua ${streetName} excluída`,
      'system',
      'destructive',
    )
  }

  const moveStreet = (id: string, direction: 'up' | 'down') => {
    const index = streets.findIndex((s) => s.id === id)
    if (index === -1) return
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === streets.length - 1) return

    const newStreets = [...streets]
    const swapIndex = direction === 'up' ? index - 1 : index + 1

    const streetA = newStreets[index]
    const streetB = newStreets[swapIndex]
    const orderA = streetA.order
    const orderB = streetB.order

    const updatedA = { ...streetA, order: orderB }
    const updatedB = { ...streetB, order: orderA }

    inventoryService.upsertItem(inventoryService.keys.STREETS, updatedA)
    inventoryService.upsertItem(inventoryService.keys.STREETS, updatedB)
  }

  const reorderStreets = (newStreets: Street[]) => {
    const updates = newStreets.map((s, index) => ({ ...s, order: index }))
    setStreets(updates)
    inventoryService.upsertMany(inventoryService.keys.STREETS, updates)
  }

  const addLocation = (streetId: string, name: string) => {
    const street = streets.find((s) => s.id === streetId)
    const newLocation = { id: crypto.randomUUID(), streetId, name }
    inventoryService.upsertItem(inventoryService.keys.LOCATIONS, newLocation)
    addLog(
      'SYSTEM',
      { details: `Local ${name} criado na rua ${street?.name}` },
      currentUser?.name || 'Gerente',
    )
  }

  const updateLocation = (id: string, updates: Partial<Location>) => {
    const location = locations.find((l) => l.id === id)
    if (location) {
      inventoryService.upsertItem(inventoryService.keys.LOCATIONS, {
        ...location,
        ...updates,
      })
      if (updates.name) {
        addLog(
          'SYSTEM',
          { details: `Local renomeado: ${location.name} -> ${updates.name}` },
          currentUser?.name || 'Gerente',
        )
      }
    }
  }

  const deleteLocation = (id: string) => {
    const locName = locations.find((l) => l.id === id)?.name || 'Unknown'
    inventoryService.deleteItem(inventoryService.keys.LOCATIONS, id)

    const palletsToDelete = pallets.filter((p) => p.locationId === id)
    palletsToDelete.forEach((p) =>
      inventoryService.deleteItem(inventoryService.keys.PALLETS, p.id),
    )

    addLog(
      'SYSTEM',
      { details: `Local excluído: ${locName}` },
      currentUser?.name || 'Gerente',
    )
  }

  const moveLocation = (locationId: string, direction: 'up' | 'down') => {
    console.warn('Location reorder not fully supported in persistent mode')
  }

  const changeLocationStreet = (locationId: string, newStreetId: string) => {
    const loc = locations.find((l) => l.id === locationId)
    const newStreet = streets.find((s) => s.id === newStreetId)
    if (loc) {
      inventoryService.upsertItem(inventoryService.keys.LOCATIONS, {
        ...loc,
        streetId: newStreetId,
      })
      addLog(
        'SYSTEM',
        { details: `Local ${loc.name} movido para rua ${newStreet?.name}` },
        currentUser?.name || 'Gerente',
      )
    }
  }

  const addMaterial = (material: Omit<Material, 'id'>) => {
    const newMaterial = { ...material, id: crypto.randomUUID() }
    inventoryService.upsertItem(inventoryService.keys.MATERIALS, newMaterial)
  }

  const updateMaterial = (id: string, updates: Partial<Material>) => {
    const mat = materials.find((m) => m.id === id)
    if (mat)
      inventoryService.upsertItem(inventoryService.keys.MATERIALS, {
        ...mat,
        ...updates,
      })
  }

  const deleteMaterial = (id: string) => {
    inventoryService.deleteItem(inventoryService.keys.MATERIALS, id)
  }

  const importMaterials = (
    data: { material: Omit<Material, 'id'>; initialQuantity: number }[],
  ) => {
    data.forEach(({ material, initialQuantity }) => {
      const existing = materials.find((m) => m.name === material.name)
      let materialId = existing?.id
      if (!existing) {
        materialId = crypto.randomUUID()
        inventoryService.upsertItem(inventoryService.keys.MATERIALS, {
          ...material,
          id: materialId,
        })
      }

      if (initialQuantity > 0 && materialId) {
        const pallet: Pallet = {
          id: crypto.randomUUID(),
          locationId: 'TRP_AREA',
          materialName: material.name,
          description: 'Importação em Massa',
          quantity: initialQuantity,
          entryDate: new Date().toISOString(),
          type: material.type,
          materialId: materialId,
        }
        inventoryService.upsertItem(inventoryService.keys.PALLETS, pallet)

        const log: MovementLog = {
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
          user: currentUser?.name || 'Sistema (Import)',
          type: 'ENTRY',
          materialType: material.type,
          materialName: material.name,
          quantity: initialQuantity,
          locationName: 'Zona TRP',
          streetName: 'Zona de Entrada',
          description: 'Importação via Planilha',
        }
        inventoryService.upsertItem(inventoryService.keys.HISTORY, log)
      }
    })
    inventoryService.notifyEvent(
      `${data.length} materiais processados`,
      'system',
    )
  }

  const addEquipment = (equipment: Omit<Equipment, 'id'>) => {
    const newEq = { ...equipment, id: crypto.randomUUID() }
    inventoryService.upsertItem(inventoryService.keys.EQUIPMENTS, newEq)
  }

  const deleteEquipment = (id: string) => {
    inventoryService.deleteItem(inventoryService.keys.EQUIPMENTS, id)
  }

  const addOM = (om: Omit<OM, 'id'>) => {
    const newOM = { ...om, id: crypto.randomUUID() }
    inventoryService.upsertItem(inventoryService.keys.OMS, newOM)
    inventoryService.notifyEvent(`Nova OM: ${om.name}`, 'system')
  }

  const updateOM = (id: string, updates: Partial<OM>) => {
    const om = oms.find((o) => o.id === id)
    if (om) {
      inventoryService.upsertItem(inventoryService.keys.OMS, {
        ...om,
        ...updates,
      })
    }
  }

  const deleteOM = (id: string) => {
    inventoryService.deleteItem(inventoryService.keys.OMS, id)
    const guiasToDelete = guias.filter((g) => g.omId === id)
    guiasToDelete.forEach((g) =>
      inventoryService.deleteItem(inventoryService.keys.GUIAS, g.id),
    )
  }

  const addGuia = (guia: Omit<Guia, 'id' | 'createdAt'>) => {
    const newGuia = {
      ...guia,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    inventoryService.upsertItem(inventoryService.keys.GUIAS, newGuia)
    inventoryService.notifyEvent(`Nova guia criada`, 'system')
  }

  const updateGuia = (id: string, updates: Partial<Guia>) => {
    const guia = guias.find((g) => g.id === id)
    if (guia) {
      inventoryService.upsertItem(inventoryService.keys.GUIAS, {
        ...guia,
        ...updates,
        updatedAt: new Date().toISOString(),
      })
    }
  }

  const deleteGuia = (id: string) => {
    inventoryService.deleteItem(inventoryService.keys.GUIAS, id)
  }

  const addBallisticItem = (
    item: Omit<BallisticItem, 'id' | 'createdAt' | 'updatedAt'>,
  ) => {
    const newItem: BallisticItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [
        {
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
          user: currentUser?.name || 'Sistema',
          action: 'Criação',
          details: 'Item adicionado ao inventário',
        },
      ],
    }
    inventoryService.upsertItem(inventoryService.keys.BALLISTIC_ITEMS, newItem)
    inventoryService.notifyEvent(`Novo item balístico/obsoleto`, 'system')
  }

  const updateBallisticItem = (id: string, updates: Partial<BallisticItem>) => {
    const item = ballisticItems.find((i) => i.id === id)
    if (item) {
      const changes: string[] = []

      if (updates.status && updates.status !== item.status) {
        changes.push(
          `Situação: '${translateBallisticStatus(item.status)}' -> '${translateBallisticStatus(updates.status)}'`,
        )
      }

      if (updates.omId && updates.omId !== item.omId) {
        const oldOmName =
          oms.find((o) => o.id === item.omId)?.name || 'Sem vínculo'
        const newOmName =
          oms.find((o) => o.id === updates.omId)?.name || 'Sem vínculo'
        changes.push(`OM: '${oldOmName}' -> '${newOmName}'`)
      }

      if (updates.serialNumber && updates.serialNumber !== item.serialNumber) {
        changes.push(`Serial: ${item.serialNumber} -> ${updates.serialNumber}`)
      }

      if (
        updates.identification &&
        updates.identification !== item.identification
      ) {
        changes.push(`ID: ${item.identification} -> ${updates.identification}`)
      }

      const newHistory = item.history ? [...item.history] : []

      if (changes.length > 0) {
        newHistory.push({
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
          user: currentUser?.name || 'Sistema',
          action: 'Atualização',
          details: changes.join('; '),
        })
      }

      inventoryService.upsertItem(inventoryService.keys.BALLISTIC_ITEMS, {
        ...item,
        ...updates,
        history: newHistory,
        updatedAt: new Date().toISOString(),
      })
    }
  }

  const deleteBallisticItem = (id: string) => {
    inventoryService.deleteItem(inventoryService.keys.BALLISTIC_ITEMS, id)
  }

  const updateSettings = (updates: Partial<SystemSettings>) => {
    const newSettings = { ...settings, ...updates }
    inventoryService.upsertItem(inventoryService.keys.SETTINGS, newSettings)
    addLog(
      'SYSTEM',
      { details: 'Configurações do sistema atualizadas' },
      currentUser?.name || 'Admin',
    )
  }

  const resetSystem = () => {
    if (!currentUser) return
    inventoryService.resetDatabase(currentUser.id)
  }

  const simulateRemoteUpdate = () => {
    inventoryService.simulateRemoteUpdate()
  }

  const retryConnection = () => {
    inventoryService.retryConnection()
  }

  const addPallet = (
    palletData: Omit<Pallet, 'id' | 'entryDate'> & { entryDate?: string },
    user: string = 'Operador',
  ) => {
    let materialId = palletData.materialId
    if (!materialId) {
      const mat = materials.find((m) => m.name === palletData.materialName)
      materialId = mat?.id
    }

    const newPallet: Pallet = {
      ...palletData,
      materialId,
      id: crypto.randomUUID(),
      entryDate: palletData.entryDate || new Date().toISOString(),
    }

    inventoryService.upsertItem(inventoryService.keys.PALLETS, newPallet)
    addLog('ENTRY', { pallet: newPallet, date: newPallet.entryDate }, user)
    inventoryService.notifyEvent(
      `Nova entrada: ${palletData.materialName}`,
      'movement',
    )
  }

  const updatePallet = (id: string, updates: Partial<Pallet>) => {
    const p = pallets.find((x) => x.id === id)
    if (p)
      inventoryService.upsertItem(inventoryService.keys.PALLETS, {
        ...p,
        ...updates,
      })
  }

  const movePallet = (id: string, newLocationId: string) => {
    const p = pallets.find((x) => x.id === id)
    if (p) {
      inventoryService.upsertItem(inventoryService.keys.PALLETS, {
        ...p,
        locationId: newLocationId,
      })
      inventoryService.notifyEvent('Material movimentado', 'movement')
    }
  }

  const removePallet = (id: string, user: string) => {
    const pallet = pallets.find((p) => p.id === id)
    if (pallet) {
      addLog('EXIT', { pallet }, user)
      inventoryService.deleteItem(inventoryService.keys.PALLETS, id)
      inventoryService.notifyEvent(
        `Saída: ${pallet.materialName}`,
        'movement',
        'destructive',
      )
    }
  }

  const clearLocation = (locationId: string) => {
    const locationPallets = pallets.filter((p) => p.locationId === locationId)
    locationPallets.forEach((p) => {
      addLog('EXIT', { pallet: p }, currentUser?.name || 'Sistema - Esvaziar')
      inventoryService.deleteItem(inventoryService.keys.PALLETS, p.id)
    })
    inventoryService.notifyEvent(
      'Localização esvaziada',
      'movement',
      'destructive',
    )
  }

  const value = useMemo(
    () => ({
      streets,
      locations,
      pallets,
      history,
      materials,
      equipments,
      settings,
      users,
      oms,
      guias,
      ballisticItems,
      currentUser,
      alerts,
      syncStatus,
      lastSync,
      isOnline,
      isLoading,
      getLocationsByStreet,
      getPalletsByLocation,
      getLocationStatus,
      getStreetName,
      getLocationName,
      getMaterialImage,
      getMaterialTotalStock,
      isLowStock,
      getGuiasByOM,
      addStreet,
      updateStreet,
      deleteStreet,
      moveStreet,
      reorderStreets,
      addLocation,
      updateLocation,
      deleteLocation,
      moveLocation,
      changeLocationStreet,
      addMaterial,
      updateMaterial,
      deleteMaterial,
      importMaterials,
      addEquipment,
      deleteEquipment,
      addOM,
      updateOM,
      deleteOM,
      addGuia,
      updateGuia,
      deleteGuia,
      addBallisticItem,
      updateBallisticItem,
      deleteBallisticItem,
      setSessionUser,
      logout,
      addUser,
      updateUser,
      deleteUser,
      updateUserPreferences,
      updateSettings,
      resetSystem,
      simulateRemoteUpdate,
      retryConnection,
      addPallet,
      updatePallet,
      movePallet,
      removePallet,
      clearLocation,
    }),
    [
      streets,
      locations,
      pallets,
      history,
      materials,
      equipments,
      settings,
      users,
      oms,
      guias,
      ballisticItems,
      currentUser,
      alerts,
      syncStatus,
      lastSync,
      isOnline,
      isLoading,
    ],
  )

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  )
}

export default function useInventoryStore() {
  const context = useContext(InventoryContext)
  if (!context) {
    throw new Error(
      'useInventoryStore must be used within an InventoryProvider',
    )
  }
  return context
}
