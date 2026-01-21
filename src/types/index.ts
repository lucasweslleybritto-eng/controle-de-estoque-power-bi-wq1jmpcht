export interface Street {
  id: string
  name: string
}

export interface Location {
  id: string
  streetId: string
  name: string
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
  materialId?: string
  image?: string
}

export type LogType = 'ENTRY' | 'EXIT' | 'SYSTEM'

export interface MovementLog {
  id: string
  date: string
  user: string
  type: LogType
  // Material/Stock specific fields (optional)
  materialType?: MaterialType
  materialName?: string
  quantity?: number
  streetName?: string
  locationName?: string
  image?: string
  // System specific fields
  description?: string
}

export interface Equipment {
  id: string
  name: string
  status: 'available' | 'in-use' | 'maintenance'
  image: string
  model?: string
  operator?: string | null
}
