export interface Street {
  id: string
  name: string
  order: number
}

export interface Location {
  id: string
  streetId: string
  name: string
  needsVerification?: boolean
  needsRecount?: boolean
}

export type MaterialType = 'TRP' | 'TRD'

export interface Material {
  id: string
  name: string
  type: MaterialType
  description?: string
  image?: string
  minStock?: number
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
  materialType?: MaterialType
  materialName?: string
  quantity?: number
  streetName?: string
  locationName?: string
  image?: string
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

export type UserRole = 'ADMIN' | 'OPERATOR' | 'VIEWER'

export interface UserPreferences {
  lowStockAlerts: boolean
  movementAlerts: boolean
  emailNotifications: boolean
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  preferences: UserPreferences
}

export interface OM {
  id: string
  name: string
  image: string
}

export type GuiaStatus = 'pending' | 'separating' | 'completed'

export interface Guia {
  id: string
  omId: string
  title: string
  pdfUrl?: string
  status: GuiaStatus
  createdAt: string
  updatedAt?: string
}

export type SyncStatus = 'synced' | 'syncing' | 'error' | 'offline'

export type BallisticCategory = 'vest' | 'helmet' | 'plate' | 'other'
export type BallisticStatus =
  | 'active'
  | 'obsolete'
  | 'condemned'
  | 'maintenance'
  | 'lost'

export interface BallisticItem {
  id: string
  category: BallisticCategory
  status: BallisticStatus
  serialNumber: string
  identification: string
  model?: string
  manufacturingDate?: string
  expirationDate?: string
  image?: string
  notes?: string
  location?: string
  createdAt: string
  updatedAt: string
}
