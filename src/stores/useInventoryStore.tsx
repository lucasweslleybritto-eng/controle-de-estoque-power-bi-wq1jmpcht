import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react'
import { Street, Location, Pallet } from '@/types'
import { format } from 'date-fns'

// Mock Data Setup
const INITIAL_STREETS: Street[] = [
  { id: 'rua-a', name: 'Rua A', totalSlots: 24 },
  { id: 'rua-b', name: 'Rua B', totalSlots: 24 },
  { id: 'rua-c', name: 'Rua C', totalSlots: 24 },
  { id: 'rua-d', name: 'Rua D', totalSlots: 24 },
]

const generateLocations = (streets: Street[]): Location[] => {
  const locations: Location[] = []
  streets.forEach((street) => {
    for (let i = 1; i <= street.totalSlots; i++) {
      // Format: A-101, A-102, etc.
      const suffix = 100 + i
      const letter = street.name.split(' ')[1]
      locations.push({
        id: `${street.id}-${suffix}`,
        streetId: street.id,
        name: `${letter}${suffix}`,
      })
    }
  })
  return locations
}

const generatePallets = (locations: Location[]): Pallet[] => {
  const pallets: Pallet[] = []
  const materials = [
    { name: 'Motor Elétrico WEG', desc: 'Motor trifásico 5CV' },
    { name: 'Rolamento SKF', desc: 'Rolamento de esferas 6205' },
    { name: 'Cabo de Aço', desc: 'Bobina 500m 1/2 pol' },
    { name: 'Parafuso Sextavado', desc: 'Caixa com 1000un M10' },
    { name: 'Óleo Hidráulico', desc: 'Tambor 200L ISO 68' },
    { name: 'Filtro de Ar', desc: 'Filtro industrial P500' },
  ]

  // Fill about 60% of locations
  locations.forEach((loc) => {
    if (Math.random() > 0.4) {
      const mat = materials[Math.floor(Math.random() * materials.length)]
      pallets.push({
        id: `plt-${Math.random().toString(36).substr(2, 9)}`,
        locationId: loc.id,
        materialName: mat.name,
        description: mat.desc,
        quantity: Math.floor(Math.random() * 50) + 1,
        entryDate: new Date(
          Date.now() - Math.floor(Math.random() * 10000000000),
        ).toISOString(),
      })
    }
  })
  return pallets
}

interface InventoryContextType {
  streets: Street[]
  locations: Location[]
  pallets: Pallet[]
  getLocationsByStreet: (streetId: string) => Location[]
  getPalletsByLocation: (locationId: string) => Pallet[]
  getLocationStatus: (locationId: string) => 'occupied' | 'empty'
  addPallet: (pallet: Pallet) => void
  updatePallet: (id: string, updates: Partial<Pallet>) => void
  movePallet: (id: string, newLocationId: string) => void
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
  const [streets] = useState<Street[]>(INITIAL_STREETS)
  const [locations] = useState<Location[]>(() =>
    generateLocations(INITIAL_STREETS),
  )
  const [pallets, setPallets] = useState<Pallet[]>(() =>
    generatePallets(locations),
  )

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

  const addPallet = useCallback((pallet: Pallet) => {
    setPallets((prev) => [...prev, pallet])
  }, [])

  const updatePallet = useCallback((id: string, updates: Partial<Pallet>) => {
    setPallets((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    )
  }, [])

  const movePallet = useCallback((id: string, newLocationId: string) => {
    setPallets((prev) =>
      prev.map((p) => (p.id === id ? { ...p, locationId: newLocationId } : p)),
    )
  }, [])

  const clearLocation = useCallback((locationId: string) => {
    setPallets((prev) => prev.filter((p) => p.locationId !== locationId))
  }, [])

  const value = useMemo(
    () => ({
      streets,
      locations,
      pallets,
      getLocationsByStreet,
      getPalletsByLocation,
      getLocationStatus,
      addPallet,
      updatePallet,
      movePallet,
      clearLocation,
    }),
    [
      streets,
      locations,
      pallets,
      getLocationsByStreet,
      getPalletsByLocation,
      getLocationStatus,
      addPallet,
      updatePallet,
      movePallet,
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
