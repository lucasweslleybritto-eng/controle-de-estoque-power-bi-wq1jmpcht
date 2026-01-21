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
} from '@/types'
import { inventoryService } from '@/services/inventoryService'
import { useToast } from '@/hooks/use-toast'

interface InventoryContextType {
  streets: Street[]
  locations: Location[]
  pallets: Pallet[]
  history: MovementLog[]
  materials: Material[]
  equipments: Equipment[]
  settings: SystemSettings

  // Getters
  getLocationsByStreet: (streetId: string) => Location[]
  getPalletsByLocation: (locationId: string) => Pallet[]
  getLocationStatus: (locationId: string) => 'occupied' | 'empty'
  getStreetName: (streetId: string) => string
  getLocationName: (locationId: string) => string
  getMaterialImage: (materialName: string) => string | undefined

  // Street CRUD
  addStreet: (name: string) => void
  updateStreet: (id: string, name: string) => void
  deleteStreet: (id: string) => void
  moveStreet: (id: string, direction: 'up' | 'down') => void

  // Location CRUD
  addLocation: (streetId: string, name: string) => void
  updateLocation: (id: string, name: string) => void
  deleteLocation: (id: string) => void
  moveLocation: (locationId: string, direction: 'up' | 'down') => void
  changeLocationStreet: (locationId: string, newStreetId: string) => void

  // Material CRUD
  addMaterial: (material: Omit<Material, 'id'>) => void
  updateMaterial: (id: string, material: Partial<Material>) => void
  deleteMaterial: (id: string) => void

  // Equipment CRUD
  addEquipment: (equipment: Omit<Equipment, 'id'>) => void
  deleteEquipment: (id: string) => void

  // System Settings
  updateSettings: (settings: Partial<SystemSettings>) => void

  // Pallet/Movement Actions
  addPallet: (pallet: Omit<Pallet, 'id' | 'entryDate'>, user?: string) => void
  updatePallet: (id: string, updates: Partial<Pallet>) => void
  movePallet: (id: string, newLocationId: string) => void
  removePallet: (id: string, user: string) => void
  clearLocation: (locationId: string) => void
}

const InventoryContext = createContext<InventoryContextType | undefined>(
  undefined,
)

export const InventoryProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const { toast } = useToast()

  // Initialize state from Service
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

  // Subscription to Service Updates (Real-Time Sync)
  useEffect(() => {
    const unsubscribe = inventoryService.subscribe((event) => {
      if (event.type === 'UPDATE') {
        switch (event.key) {
          case inventoryService.keys.STREETS:
            setStreets(inventoryService.getStreets())
            break
          case inventoryService.keys.LOCATIONS:
            setLocations(inventoryService.getLocations())
            break
          case inventoryService.keys.MATERIALS:
            setMaterials(inventoryService.getMaterials())
            break
          case inventoryService.keys.EQUIPMENTS:
            setEquipments(inventoryService.getEquipments())
            break
          case inventoryService.keys.SETTINGS:
            setSettings(inventoryService.getSettings())
            break
          case inventoryService.keys.PALLETS:
            setPallets(inventoryService.getPallets())
            break
          case inventoryService.keys.HISTORY:
            setHistory(inventoryService.getHistory())
            break
        }
      } else if (event.type === 'NOTIFICATION') {
        toast({
          title: 'Atualização Remota',
          description: event.message,
          variant: event.variant,
        })
      }
    })
    return unsubscribe
  }, [toast])

  // Getters
  const getLocationsByStreet = useCallback(
    (streetId: string) => locations.filter((l) => l.streetId === streetId),
    [locations],
  )

  const getPalletsByLocation = useCallback(
    (locationId: string) => pallets.filter((p) => p.locationId === locationId),
    [pallets],
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

  const _persistHistory = (logs: MovementLog[]) => {
    setHistory(logs)
    inventoryService.saveHistory(logs)
  }

  // Helper to add logs (Internal)
  const addLog = (
    type: LogType,
    params: {
      pallet?: Pallet
      details?: string
    },
    user: string = 'Sistema',
  ) => {
    const { pallet, details } = params
    let locName = 'N/A'
    let streetName = 'N/A'
    let image = undefined
    let materialName = undefined
    let materialType = undefined
    let quantity = undefined

    if (pallet) {
      const currentLocations = inventoryService.getLocations()
      const currentStreets = inventoryService.getStreets()
      const loc = currentLocations.find((l) => l.id === pallet.locationId)
      locName = loc
        ? loc.name
        : pallet.locationId === 'TRP_AREA'
          ? 'Zona TRP'
          : 'N/A'
      streetName = loc
        ? currentStreets.find((s) => s.id === loc.streetId)?.name || 'N/A'
        : 'Zona de Entrada'
      image = pallet.image || getMaterialImage(pallet.materialName)
      materialName = pallet.materialName
      materialType = pallet.type
      quantity = pallet.quantity
    }

    const log: MovementLog = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
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

    const newHistory = [log, ...inventoryService.getHistory()]
    _persistHistory(newHistory)
  }

  // Street CRUD
  const addStreet = (name: string) => {
    const newStreets = [...streets, { id: crypto.randomUUID(), name }]
    setStreets(newStreets)
    inventoryService.saveStreets(newStreets)
    addLog('SYSTEM', { details: `Rua criada: ${name}` }, 'Gerente')
    inventoryService.notifyEvent(`Nova rua criada: ${name}`)
  }

  const updateStreet = (id: string, name: string) => {
    const oldName = streets.find((s) => s.id === id)?.name
    const newStreets = streets.map((s) => (s.id === id ? { ...s, name } : s))
    setStreets(newStreets)
    inventoryService.saveStreets(newStreets)
    addLog(
      'SYSTEM',
      { details: `Rua renomeada: ${oldName} -> ${name}` },
      'Gerente',
    )
    inventoryService.notifyEvent(`Rua ${oldName} renomeada para ${name}`)
  }

  const deleteStreet = (id: string) => {
    const streetName = streets.find((s) => s.id === id)?.name || 'Unknown'
    const newStreets = streets.filter((s) => s.id !== id)
    setStreets(newStreets)
    inventoryService.saveStreets(newStreets)

    // Cleanup dependencies
    const streetLocations = locations.filter((l) => l.streetId === id)
    const streetLocationIds = streetLocations.map((l) => l.id)
    const newLocations = locations.filter((l) => l.streetId !== id)
    setLocations(newLocations)
    inventoryService.saveLocations(newLocations)

    const newPallets = pallets.filter(
      (p) => !streetLocationIds.includes(p.locationId),
    )
    setPallets(newPallets)
    inventoryService.savePallets(newPallets)

    addLog('SYSTEM', { details: `Rua excluída: ${streetName}` }, 'Gerente')
    inventoryService.notifyEvent(`Rua ${streetName} excluída`, 'destructive')
  }

  const moveStreet = (id: string, direction: 'up' | 'down') => {
    const index = streets.findIndex((s) => s.id === id)
    if (index === -1) return
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === streets.length - 1) return

    const newStreets = [...streets]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    ;[newStreets[index], newStreets[swapIndex]] = [
      newStreets[swapIndex],
      newStreets[index],
    ]
    setStreets(newStreets)
    inventoryService.saveStreets(newStreets)
    addLog(
      'SYSTEM',
      {
        details: `Rua ${newStreets[swapIndex].name} reordenada (${direction})`,
      },
      'Gerente',
    )
  }

  // Location CRUD
  const addLocation = (streetId: string, name: string) => {
    const street = streets.find((s) => s.id === streetId)
    const newLocations = [
      ...locations,
      { id: crypto.randomUUID(), streetId, name },
    ]
    setLocations(newLocations)
    inventoryService.saveLocations(newLocations)
    addLog(
      'SYSTEM',
      { details: `Local ${name} criado na rua ${street?.name}` },
      'Gerente',
    )
    inventoryService.notifyEvent(`Novo local ${name} em ${street?.name}`)
  }

  const updateLocation = (id: string, name: string) => {
    const oldName = locations.find((l) => l.id === id)?.name
    const newLocations = locations.map((l) =>
      l.id === id ? { ...l, name } : l,
    )
    setLocations(newLocations)
    inventoryService.saveLocations(newLocations)
    addLog(
      'SYSTEM',
      { details: `Local renomeado: ${oldName} -> ${name}` },
      'Gerente',
    )
  }

  const deleteLocation = (id: string) => {
    const locName = locations.find((l) => l.id === id)?.name || 'Unknown'
    const newLocations = locations.filter((l) => l.id !== id)
    setLocations(newLocations)
    inventoryService.saveLocations(newLocations)

    const newPallets = pallets.filter((p) => p.locationId !== id)
    setPallets(newPallets)
    inventoryService.savePallets(newPallets)
    addLog('SYSTEM', { details: `Local excluído: ${locName}` }, 'Gerente')
    inventoryService.notifyEvent(`Local ${locName} excluído`, 'destructive')
  }

  const moveLocation = (locationId: string, direction: 'up' | 'down') => {
    const location = locations.find((l) => l.id === locationId)
    if (!location) return
    const streetLocations = locations.filter(
      (l) => l.streetId === location.streetId,
    )
    const indexInStreet = streetLocations.findIndex((l) => l.id === locationId)
    if (direction === 'up' && indexInStreet === 0) return
    if (direction === 'down' && indexInStreet === streetLocations.length - 1)
      return

    const swapIndex = direction === 'up' ? indexInStreet - 1 : indexInStreet + 1
    const temp = streetLocations[indexInStreet]
    streetLocations[indexInStreet] = streetLocations[swapIndex]
    streetLocations[swapIndex] = temp

    const otherLocations = locations.filter(
      (l) => l.streetId !== location.streetId,
    )
    const newLocations = [...otherLocations, ...streetLocations]
    setLocations(newLocations)
    inventoryService.saveLocations(newLocations)
    addLog(
      'SYSTEM',
      { details: `Local ${location.name} reordenado (${direction})` },
      'Gerente',
    )
  }

  const changeLocationStreet = (locationId: string, newStreetId: string) => {
    const loc = locations.find((l) => l.id === locationId)
    const newStreet = streets.find((s) => s.id === newStreetId)
    const newLocations = locations.map((l) =>
      l.id === locationId ? { ...l, streetId: newStreetId } : l,
    )
    setLocations(newLocations)
    inventoryService.saveLocations(newLocations)
    addLog(
      'SYSTEM',
      {
        details: `Local ${loc?.name} movido para rua ${newStreet?.name}`,
      },
      'Gerente',
    )
    inventoryService.notifyEvent(
      `Local ${loc?.name} movido para ${newStreet?.name}`,
    )
  }

  // Material CRUD
  const addMaterial = (material: Omit<Material, 'id'>) => {
    const newMaterials = [
      ...materials,
      { ...material, id: crypto.randomUUID() },
    ]
    setMaterials(newMaterials)
    inventoryService.saveMaterials(newMaterials)
  }

  const updateMaterial = (id: string, updates: Partial<Material>) => {
    const newMaterials = materials.map((m) =>
      m.id === id ? { ...m, ...updates } : m,
    )
    setMaterials(newMaterials)
    inventoryService.saveMaterials(newMaterials)
  }

  const deleteMaterial = (id: string) => {
    const newMaterials = materials.filter((m) => m.id !== id)
    setMaterials(newMaterials)
    inventoryService.saveMaterials(newMaterials)
  }

  // Equipment CRUD
  const addEquipment = (equipment: Omit<Equipment, 'id'>) => {
    const newEquipments = [
      ...equipments,
      { ...equipment, id: crypto.randomUUID() },
    ]
    setEquipments(newEquipments)
    inventoryService.saveEquipments(newEquipments)
  }

  const deleteEquipment = (id: string) => {
    const newEquipments = equipments.filter((e) => e.id !== id)
    setEquipments(newEquipments)
    inventoryService.saveEquipments(newEquipments)
  }

  // Settings
  const updateSettings = (updates: Partial<SystemSettings>) => {
    const newSettings = { ...settings, ...updates }
    setSettings(newSettings)
    inventoryService.saveSettings(newSettings)
    addLog(
      'SYSTEM',
      { details: 'Configurações do sistema atualizadas' },
      'Admin',
    )
  }

  // Pallet Actions
  const addPallet = (
    palletData: Omit<Pallet, 'id' | 'entryDate'>,
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
      entryDate: new Date().toISOString(),
    }

    const newPallets = [...pallets, newPallet]
    setPallets(newPallets)
    inventoryService.savePallets(newPallets)
    addLog('ENTRY', { pallet: newPallet }, user)
    inventoryService.notifyEvent(
      `Nova entrada: ${palletData.materialName} (${palletData.quantity})`,
    )
  }

  const updatePallet = (id: string, updates: Partial<Pallet>) => {
    const newPallets = pallets.map((p) =>
      p.id === id ? { ...p, ...updates } : p,
    )
    setPallets(newPallets)
    inventoryService.savePallets(newPallets)
    // Could log update if needed
  }

  const movePallet = (id: string, newLocationId: string) => {
    const newPallets = pallets.map((p) =>
      p.id === id ? { ...p, locationId: newLocationId } : p,
    )
    setPallets(newPallets)
    inventoryService.savePallets(newPallets)
  }

  const removePallet = (id: string, user: string) => {
    const pallet = pallets.find((p) => p.id === id)
    if (pallet) {
      addLog('EXIT', { pallet }, user)
      const newPallets = pallets.filter((p) => p.id !== id)
      setPallets(newPallets)
      inventoryService.savePallets(newPallets)
      inventoryService.notifyEvent(
        `Saída de material: ${pallet.materialName} (${pallet.quantity})`,
        'destructive',
      )
    }
  }

  const clearLocation = (locationId: string) => {
    const locationPallets = pallets.filter((p) => p.locationId === locationId)
    locationPallets.forEach((p) =>
      addLog('EXIT', { pallet: p }, 'Sistema - Esvaziar'),
    )

    const newPallets = pallets.filter((p) => p.locationId !== locationId)
    setPallets(newPallets)
    inventoryService.savePallets(newPallets)
    inventoryService.notifyEvent('Localização esvaziada', 'destructive')
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
      getLocationsByStreet,
      getPalletsByLocation,
      getLocationStatus,
      getStreetName,
      getLocationName,
      getMaterialImage,
      addStreet,
      updateStreet,
      deleteStreet,
      moveStreet,
      addLocation,
      updateLocation,
      deleteLocation,
      moveLocation,
      changeLocationStreet,
      addMaterial,
      updateMaterial,
      deleteMaterial,
      addEquipment,
      deleteEquipment,
      updateSettings,
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
      getLocationsByStreet,
      getPalletsByLocation,
      getLocationStatus,
      getStreetName,
      getLocationName,
      getMaterialImage,
      addStreet,
      updateStreet,
      deleteStreet,
      moveStreet,
      addLocation,
      updateLocation,
      deleteLocation,
      moveLocation,
      changeLocationStreet,
      addMaterial,
      updateMaterial,
      deleteMaterial,
      addEquipment,
      deleteEquipment,
      updateSettings,
      addPallet,
      updatePallet,
      movePallet,
      removePallet,
      clearLocation,
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
