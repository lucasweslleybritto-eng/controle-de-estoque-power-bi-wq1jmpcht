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
} from '@/types'
import { inventoryService } from '@/services/inventoryService'

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

  // Location CRUD
  addLocation: (streetId: string, name: string) => void
  updateLocation: (id: string, name: string) => void
  deleteLocation: (id: string) => void

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
  addPallet: (pallet: Omit<Pallet, 'id' | 'entryDate'>) => void
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
  // Initialize state from Service (simulating Cloud/DB fetch)
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
    const unsubscribe = inventoryService.subscribe((key) => {
      switch (key) {
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
    })
    return unsubscribe
  }, [])

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

  // Helper to persist history
  const _persistHistory = (logs: MovementLog[]) => {
    setHistory(logs)
    inventoryService.saveHistory(logs)
  }

  // Actions
  const addLog = (
    type: 'ENTRY' | 'EXIT',
    pallet: Pallet,
    user: string = 'Operador',
  ) => {
    // Re-fetch location/street data to ensure log accuracy even if state is slightly stale
    const currentLocations = inventoryService.getLocations()
    const currentStreets = inventoryService.getStreets()

    const loc = currentLocations.find((l) => l.id === pallet.locationId)
    const locName = loc
      ? loc.name
      : pallet.locationId === 'TRP_AREA'
        ? 'Zona TRP'
        : 'N/A'
    const streetName = loc
      ? currentStreets.find((s) => s.id === loc.streetId)?.name || 'N/A'
      : 'Zona de Entrada'

    // Determine image source: pallet specific or material default
    const image = pallet.image || getMaterialImage(pallet.materialName)

    const log: MovementLog = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      user,
      type,
      materialType: pallet.type,
      materialName: pallet.materialName,
      quantity: pallet.quantity,
      locationName: locName,
      streetName,
      image,
    }

    const newHistory = [log, ...inventoryService.getHistory()]
    _persistHistory(newHistory)
  }

  // Street CRUD
  const addStreet = (name: string) => {
    const newStreets = [...streets, { id: crypto.randomUUID(), name }]
    setStreets(newStreets)
    inventoryService.saveStreets(newStreets)
  }

  const updateStreet = (id: string, name: string) => {
    const newStreets = streets.map((s) => (s.id === id ? { ...s, name } : s))
    setStreets(newStreets)
    inventoryService.saveStreets(newStreets)
  }

  const deleteStreet = (id: string) => {
    // Logic to cascade delete
    const newStreets = streets.filter((s) => s.id !== id)
    setStreets(newStreets)
    inventoryService.saveStreets(newStreets)

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
  }

  // Location CRUD
  const addLocation = (streetId: string, name: string) => {
    const newLocations = [
      ...locations,
      { id: crypto.randomUUID(), streetId, name },
    ]
    setLocations(newLocations)
    inventoryService.saveLocations(newLocations)
  }

  const updateLocation = (id: string, name: string) => {
    const newLocations = locations.map((l) =>
      l.id === id ? { ...l, name } : l,
    )
    setLocations(newLocations)
    inventoryService.saveLocations(newLocations)
  }

  const deleteLocation = (id: string) => {
    const newLocations = locations.filter((l) => l.id !== id)
    setLocations(newLocations)
    inventoryService.saveLocations(newLocations)

    const newPallets = pallets.filter((p) => p.locationId !== id)
    setPallets(newPallets)
    inventoryService.savePallets(newPallets)
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
  }

  // Pallet Actions
  const addPallet = (palletData: Omit<Pallet, 'id' | 'entryDate'>) => {
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

    // Optimistic Update
    const newPallets = [...pallets, newPallet]
    setPallets(newPallets)
    inventoryService.savePallets(newPallets)
    addLog('ENTRY', newPallet)
  }

  const updatePallet = (id: string, updates: Partial<Pallet>) => {
    const newPallets = pallets.map((p) =>
      p.id === id ? { ...p, ...updates } : p,
    )
    setPallets(newPallets)
    inventoryService.savePallets(newPallets)
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
      addLog('EXIT', pallet, user)
      const newPallets = pallets.filter((p) => p.id !== id)
      setPallets(newPallets)
      inventoryService.savePallets(newPallets)
    }
  }

  const clearLocation = (locationId: string) => {
    const locationPallets = pallets.filter((p) => p.locationId === locationId)
    locationPallets.forEach((p) => addLog('EXIT', p, 'Sistema - Esvaziar'))

    const newPallets = pallets.filter((p) => p.locationId !== locationId)
    setPallets(newPallets)
    inventoryService.savePallets(newPallets)
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
      addLocation,
      updateLocation,
      deleteLocation,
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
      addLocation,
      updateLocation,
      deleteLocation,
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
