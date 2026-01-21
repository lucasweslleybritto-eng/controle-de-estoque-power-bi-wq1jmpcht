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

// Mock Data Setup
const INITIAL_STREETS: Street[] = [
  { id: 'rua-a', name: 'Rua A' },
  { id: 'rua-b', name: 'Rua B' },
]

const INITIAL_LOCATIONS: Location[] = [
  { id: 'loc-a-1', streetId: 'rua-a', name: 'A-001' },
  { id: 'loc-a-2', streetId: 'rua-a', name: 'A-002' },
  { id: 'loc-b-1', streetId: 'rua-b', name: 'B-001' },
]

const INITIAL_MATERIALS: Material[] = [
  {
    id: 'mat-1',
    name: 'Gandola Camuflada',
    type: 'TRD',
    description: 'Tamanho M - Padrão Exército',
    image: 'https://img.usecurling.com/p/200/200?q=camo%20jacket',
  },
  {
    id: 'mat-2',
    name: 'Coturno Tático',
    type: 'TRP',
    description: 'Preto - Tamanho 42',
    image: 'https://img.usecurling.com/p/200/200?q=combat%20boots',
  },
  {
    id: 'mat-3',
    name: 'Cinto NA',
    type: 'TRP',
    description: 'Verde Oliva',
    image: 'https://img.usecurling.com/p/200/200?q=military%20belt',
  },
]

const INITIAL_EQUIPMENTS: Equipment[] = [
  {
    id: '1',
    name: 'Empilhadeira Elétrica 01',
    model: 'Toyota 8FBE',
    status: 'available',
    image: 'https://img.usecurling.com/p/300/200?q=forklift&color=yellow',
    operator: null,
  },
  {
    id: '2',
    name: 'Paleteira Manual 05',
    model: 'Standard',
    status: 'in-use',
    image:
      'https://img.usecurling.com/p/300/200?q=hand%20pallet%20truck&color=blue',
    operator: 'Sd. Silva',
  },
]

const INITIAL_SETTINGS: SystemSettings = {
  systemName: 'Depósito de Fardamento',
  lowStockThreshold: 10,
  highOccupancyThreshold: 80,
}

const INITIAL_PALLETS: Pallet[] = [
  {
    id: 'plt-1',
    locationId: 'loc-a-1',
    materialName: 'Gandola Camuflada',
    description: 'Lote 2024',
    quantity: 50,
    entryDate: new Date().toISOString(),
    type: 'TRD',
    materialId: 'mat-1',
  },
  {
    id: 'plt-2',
    locationId: 'TRP_AREA',
    materialName: 'Coturno Tático',
    description: 'Recebimento Pendente',
    quantity: 20,
    entryDate: new Date().toISOString(),
    type: 'TRP',
    materialId: 'mat-2',
  },
]

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
  const [streets, setStreets] = useState<Street[]>(() => {
    const saved = localStorage.getItem('inventory_streets')
    return saved ? JSON.parse(saved) : INITIAL_STREETS
  })
  const [locations, setLocations] = useState<Location[]>(() => {
    const saved = localStorage.getItem('inventory_locations')
    return saved ? JSON.parse(saved) : INITIAL_LOCATIONS
  })
  const [materials, setMaterials] = useState<Material[]>(() => {
    const saved = localStorage.getItem('inventory_materials')
    return saved ? JSON.parse(saved) : INITIAL_MATERIALS
  })
  const [equipments, setEquipments] = useState<Equipment[]>(() => {
    const saved = localStorage.getItem('inventory_equipments')
    return saved ? JSON.parse(saved) : INITIAL_EQUIPMENTS
  })
  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('inventory_settings')
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS
  })
  const [pallets, setPallets] = useState<Pallet[]>(INITIAL_PALLETS)
  const [history, setHistory] = useState<MovementLog[]>([])

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('inventory_streets', JSON.stringify(streets))
  }, [streets])

  useEffect(() => {
    localStorage.setItem('inventory_locations', JSON.stringify(locations))
  }, [locations])

  useEffect(() => {
    localStorage.setItem('inventory_materials', JSON.stringify(materials))
  }, [materials])

  useEffect(() => {
    localStorage.setItem('inventory_equipments', JSON.stringify(equipments))
  }, [equipments])

  useEffect(() => {
    localStorage.setItem('inventory_settings', JSON.stringify(settings))
  }, [settings])

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
      // Removed verification logic as per user story requirement
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

  // Actions
  const addLog = (
    type: 'ENTRY' | 'EXIT',
    pallet: Pallet,
    user: string = 'Operador',
  ) => {
    const locName = getLocationName(pallet.locationId)
    const loc = locations.find((l) => l.id === pallet.locationId)
    const streetName = loc ? getStreetName(loc.streetId) : 'Zona de Entrada'

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
    }
    setHistory((prev) => [log, ...prev])
  }

  // Street CRUD
  const addStreet = (name: string) => {
    setStreets((prev) => [...prev, { id: crypto.randomUUID(), name }])
  }

  const updateStreet = (id: string, name: string) => {
    setStreets((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)))
  }

  const deleteStreet = (id: string) => {
    setStreets((prev) => prev.filter((s) => s.id !== id))
    const streetLocations = locations.filter((l) => l.streetId === id)
    const streetLocationIds = streetLocations.map((l) => l.id)
    setLocations((prev) => prev.filter((l) => l.streetId !== id))
    setPallets((prev) =>
      prev.filter((p) => !streetLocationIds.includes(p.locationId)),
    )
  }

  // Location CRUD
  const addLocation = (streetId: string, name: string) => {
    setLocations((prev) => [
      ...prev,
      { id: crypto.randomUUID(), streetId, name },
    ])
  }

  const updateLocation = (id: string, name: string) => {
    setLocations((prev) => prev.map((l) => (l.id === id ? { ...l, name } : l)))
  }

  const deleteLocation = (id: string) => {
    setLocations((prev) => prev.filter((l) => l.id !== id))
    setPallets((prev) => prev.filter((p) => p.locationId !== id))
  }

  // Material CRUD
  const addMaterial = (material: Omit<Material, 'id'>) => {
    setMaterials((prev) => [...prev, { ...material, id: crypto.randomUUID() }])
  }

  const updateMaterial = (id: string, updates: Partial<Material>) => {
    setMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    )
  }

  const deleteMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id))
  }

  // Equipment CRUD
  const addEquipment = (equipment: Omit<Equipment, 'id'>) => {
    setEquipments((prev) => [
      ...prev,
      { ...equipment, id: crypto.randomUUID() },
    ])
  }

  const deleteEquipment = (id: string) => {
    setEquipments((prev) => prev.filter((e) => e.id !== id))
  }

  // Settings
  const updateSettings = (updates: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }))
  }

  // Pallet Actions
  const addPallet = (palletData: Omit<Pallet, 'id' | 'entryDate'>) => {
    // Try to find material ID if not provided
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
    setPallets((prev) => [...prev, newPallet])
    addLog('ENTRY', newPallet)
  }

  const updatePallet = (id: string, updates: Partial<Pallet>) => {
    setPallets((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    )
  }

  const movePallet = (id: string, newLocationId: string) => {
    setPallets((prev) =>
      prev.map((p) => (p.id === id ? { ...p, locationId: newLocationId } : p)),
    )
  }

  const removePallet = (id: string, user: string) => {
    const pallet = pallets.find((p) => p.id === id)
    if (pallet) {
      addLog('EXIT', pallet, user)
      setPallets((prev) => prev.filter((p) => p.id !== id))
    }
  }

  const clearLocation = (locationId: string) => {
    const locationPallets = pallets.filter((p) => p.locationId === locationId)
    locationPallets.forEach((p) => addLog('EXIT', p, 'Sistema - Esvaziar'))
    setPallets((prev) => prev.filter((p) => p.locationId !== locationId))
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
