export interface Street {
  id: string
  name: string
}

export interface Location {
  id: string
  streetId: string
  name: string
  // needsVerification removed from logic, keeping optional for backward compatibility if needed, but we will ignore it.
  needsVerification?: boolean
}

export type MaterialType = 'TRP' | 'TRD'

export interface Material {
  id: string
  name: string
  type: MaterialType
  description?: string
  image?: string
}

export interface SystemSettings {
  systemName: string
  lowStockThreshold: number
  highOccupancyThreshold: number
}

export interface Pallet {
  id: string
  locationId: string | 'TRP_AREA'
  materialName: string
  description: string
  quantity: number
  entryDate: string
  type: MaterialType
  // Helper to link back to material definition for image
  materialId?: string
  image?: string
}

export interface MovementLog {
  id: string
  date: string
  user: string
  type: 'ENTRY' | 'EXIT'
  materialType: MaterialType
  materialName: string
  quantity: number
  locationName: string
  streetName?: string
  image?: string
}

export interface Equipment {
  id: string
  name: string
  status: 'available' | 'in-use' | 'maintenance'
  image: string
  model?: string
  operator?: string | null
}
