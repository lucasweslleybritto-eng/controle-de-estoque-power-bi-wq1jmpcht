export interface Street {
  id: string
  name: string
  // Removing fixed totalSlots in favor of dynamic locations
}

export interface Location {
  id: string
  streetId: string
  name: string
  needsVerification: boolean
}

export type MaterialType = 'TRP' | 'TRD'

export interface Pallet {
  id: string
  locationId: string | 'TRP_AREA'
  materialName: string
  description: string
  quantity: number
  entryDate: string
  type: MaterialType
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
}

export interface Equipment {
  id: string
  name: string
  status: 'available' | 'in-use' | 'maintenance'
  imageQuery: string
  model?: string
  operator?: string | null
}
