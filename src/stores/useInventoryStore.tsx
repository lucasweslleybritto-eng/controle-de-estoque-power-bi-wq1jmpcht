import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react'
import { Street, Location, Pallet, MovementLog, MaterialType } from '@/types'

// Mock Data Setup
const INITIAL_STREETS: Street[] = [
  { id: 'rua-a', name: 'Rua A' },
  { id: 'rua-b', name: 'Rua B' },
]

const INITIAL_LOCATIONS: Location[] = [
  { id: 'loc-a-1', streetId: 'rua-a', name: 'A-001', needsVerification: false },
  { id: 'loc-a-2', streetId: 'rua-a', name: 'A-002', needsVerification: true },
  { id: 'loc-b-1', streetId: 'rua-b', name: 'B-001', needsVerification: false },
]

const INITIAL_PALLETS: Pallet[] = [
  {
    id: 'plt-1',
    locationId: 'loc-a-1',
    materialName: 'Motor WEG',
    description: 'Motor 5CV',
    quantity: 10,
    entryDate: new Date().toISOString(),
    type: 'TRD',
  },
  {
    id: 'plt-2',
    locationId: 'TRP_AREA',
    materialName: 'Cabo 5mm',
    description: 'Bobina chegada',
    quantity: 50,
    entryDate: new Date().toISOString(),
    type: 'TRP',
  },
]

interface InventoryContextType {
  streets: Street[]
  locations: Location[]
  pallets: Pallet[]
  history: MovementLog[]

  // Getters
  getLocationsByStreet: (streetId: string) => Location[]
  getPalletsByLocation: (locationId: string) => Pallet[]
  getLocationStatus: (
    locationId: string,
  ) => 'occupied' | 'empty' | 'verification'
  getStreetName: (streetId: string) => string
  getLocationName: (locationId: string) => string

  // Street CRUD
  addStreet: (name: string) => void
  updateStreet: (id: string, name: string) => void
  deleteStreet: (id: string) => void

  // Location CRUD
  addLocation: (streetId: string, name: string) => void
  updateLocation: (id: string, name: string, needsVerification: boolean) => void
  deleteLocation: (id: string) => void

  // Pallet/Movement Actions
  addPallet: (pallet: Omit<Pallet, 'id' | 'entryDate'>) => void
  updatePallet: (id: string, updates: Partial<Pallet>) => void
  movePallet: (id: string, newLocationId: string) => void
  removePallet: (id: string, user: string) => void // Exit
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
  const [streets, setStreets] = useState<Street[]>(INITIAL_STREETS)
  const [locations, setLocations] = useState<Location[]>(INITIAL_LOCATIONS)
  const [pallets, setPallets] = useState<Pallet[]>(INITIAL_PALLETS)
  const [history, setHistory] = useState<MovementLog[]>([])

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
      const loc = locations.find((l) => l.id === locationId)
      if (loc?.needsVerification) return 'verification'
      const hasPallet = pallets.some((p) => p.locationId === locationId)
      return hasPallet ? 'occupied' : 'empty'
    },
    [locations, pallets],
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
    // Cascade delete locations and pallets
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
      { id: crypto.randomUUID(), streetId, name, needsVerification: false },
    ])
  }

  const updateLocation = (
    id: string,
    name: string,
    needsVerification: boolean,
  ) => {
    setLocations((prev) =>
      prev.map((l) => (l.id === id ? { ...l, name, needsVerification } : l)),
    )
  }

  const deleteLocation = (id: string) => {
    setLocations((prev) => prev.filter((l) => l.id !== id))
    setPallets((prev) => prev.filter((p) => p.locationId !== id))
  }

  // Pallet Actions
  const addPallet = (palletData: Omit<Pallet, 'id' | 'entryDate'>) => {
    const newPallet: Pallet = {
      ...palletData,
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
      prev.map((p) => {
        if (p.id === id) {
          // Ideally log move? Requirement says Movement History for Entry/Exit.
          // We can treat move as simple update for now or specialized log if needed.
          // But strict requirement is Entry/Exit.
          return { ...p, locationId: newLocationId }
        }
        return p
      }),
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
      getLocationsByStreet,
      getPalletsByLocation,
      getLocationStatus,
      getStreetName,
      getLocationName,
      addStreet,
      updateStreet,
      deleteStreet,
      addLocation,
      updateLocation,
      deleteLocation,
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
      getLocationsByStreet,
      getPalletsByLocation,
      getLocationStatus,
      getStreetName,
      getLocationName,
      addStreet,
      updateStreet,
      deleteStreet,
      addLocation,
      updateLocation,
      deleteLocation,
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
