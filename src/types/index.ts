export type Street = {
  id: string
  name: string
  order: number
}

export type Location = {
  id: string
  streetId: string
  name: string
  needsRecount?: boolean
}

export type MaterialType = 'TRP' | 'TRD'

export type Material = {
  id: string
  name: string
  description?: string
  type: MaterialType
  minStock?: number
  image?: string
}

export type Pallet = {
  id: string
  locationId: string
  materialId?: string
  materialName: string
  description: string
  quantity: number
  type: MaterialType
  entryDate: string
  image?: string
}

export type LogType = 'ENTRY' | 'EXIT' | 'SYSTEM'

export type MovementLog = {
  id: string
  date: string
  user: string
  type: LogType
  materialType?: string
  materialName?: string
  quantity?: number
  locationName?: string
  streetName?: string
  image?: string
  description?: string
}

export type EquipmentStatus = 'available' | 'in-use' | 'maintenance'

export type Equipment = {
  id: string
  name: string
  model?: string
  image?: string
  status: EquipmentStatus
  operator?: string
}

export type SystemSettings = {
  systemName: string
  lowStockThreshold: number
  highOccupancyThreshold: number
}

export type UserRole = 'ADMIN' | 'OPERATOR' | 'VIEWER'

export type UserPreferences = {
  lowStockAlerts: boolean
  movementAlerts: boolean
  emailNotifications: boolean
}

export type User = {
  id: string
  name: string
  email: string
  role: UserRole
  preferences: UserPreferences
}

export type OM = {
  id: string
  name: string
  image?: string
}

export type GuiaStatus = 'pending' | 'separating' | 'completed'

export type Guia = {
  id: string
  omId: string
  title: string
  status: GuiaStatus
  pdfUrl?: string
  createdAt: string
  updatedAt?: string
}

export type BallisticCategory = 'vest' | 'helmet' | 'plate' | 'other'
export type BallisticStatus =
  | 'active'
  | 'in-use'
  | 'reserved'
  | 'obsolete'
  | 'condemned'
  | 'maintenance'
  | 'lost'
  | 'distributed'

export type BallisticHistoryEntry = {
  id: string
  date: string
  user: string
  action: string
  details: string
}

export type BallisticItem = {
  id: string
  category: BallisticCategory
  status: BallisticStatus
  serialNumber: string
  identification: string
  model?: string
  omId?: string
  notes?: string
  image?: string
  expirationDate?: string
  manufacturingDate?: string
  history?: BallisticHistoryEntry[]
  createdAt: string
  updatedAt: string
}

export type SyncStatus = 'synced' | 'syncing' | 'error' | 'offline'
