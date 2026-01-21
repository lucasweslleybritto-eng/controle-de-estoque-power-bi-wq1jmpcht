import {
  Street,
  Location,
  Pallet,
  MovementLog,
  Material,
  SystemSettings,
  Equipment,
  User,
} from '@/types'

const KEYS = {
  STREETS: 'inventory_streets',
  LOCATIONS: 'inventory_locations',
  MATERIALS: 'inventory_materials',
  PALLETS: 'inventory_pallets',
  HISTORY: 'inventory_history',
  EQUIPMENTS: 'inventory_equipments',
  SETTINGS: 'inventory_settings',
  USERS: 'inventory_users',
}

const CHANNEL_NAME = 'inventory_sync_channel'

export type ServiceEvent =
  | { type: 'UPDATE'; key: string }
  | {
      type: 'NOTIFICATION'
      message: string
      variant?: 'default' | 'destructive'
    }

// Mock Data
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
    minStock: 20,
  },
  {
    id: 'mat-2',
    name: 'Coturno Tático',
    type: 'TRP',
    description: 'Preto - Tamanho 42',
    image: 'https://img.usecurling.com/p/200/200?q=combat%20boots',
    minStock: 10,
  },
  {
    id: 'mat-3',
    name: 'Cinto NA',
    type: 'TRP',
    description: 'Verde Oliva',
    image: 'https://img.usecurling.com/p/200/200?q=military%20belt',
    minStock: 50,
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
]

const INITIAL_USERS: User[] = [
  {
    id: 'admin-1',
    name: 'Administrador',
    email: 'admin@sistema.com',
    role: 'ADMIN',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=1',
  },
  {
    id: 'op-1',
    name: 'Operador Padrão',
    email: 'operador@sistema.com',
    role: 'OPERATOR',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=2',
  },
  {
    id: 'viewer-1',
    name: 'Visitante',
    email: 'visitante@sistema.com',
    role: 'VIEWER',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=3',
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
]

class InventoryService {
  private channel: BroadcastChannel

  constructor() {
    this.channel = new BroadcastChannel(CHANNEL_NAME)
  }

  private get<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : defaultValue
    } catch (error) {
      console.error(`Error reading key ${key}:`, error)
      return defaultValue
    }
  }

  private set<T>(key: string, value: T) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      this.notifyChange(key)
    } catch (error) {
      console.error(`Error writing key ${key}:`, error)
    }
  }

  private notifyChange(key: string) {
    this.channel.postMessage({ type: 'UPDATE', key })
  }

  public notifyEvent(
    message: string,
    variant: 'default' | 'destructive' = 'default',
  ) {
    this.channel.postMessage({
      type: 'NOTIFICATION',
      message,
      variant,
    })
  }

  public subscribe(callback: (event: ServiceEvent) => void) {
    const handleMessage = (event: MessageEvent) => {
      if (
        event.data?.type === 'UPDATE' ||
        event.data?.type === 'NOTIFICATION'
      ) {
        callback(event.data)
      }
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key && Object.values(KEYS).includes(event.key)) {
        callback({ type: 'UPDATE', key: event.key })
      }
    }

    this.channel.addEventListener('message', handleMessage)
    window.addEventListener('storage', handleStorage)

    return () => {
      this.channel.removeEventListener('message', handleMessage)
      window.removeEventListener('storage', handleStorage)
    }
  }

  getStreets(): Street[] {
    return this.get(KEYS.STREETS, INITIAL_STREETS)
  }
  saveStreets(data: Street[]) {
    this.set(KEYS.STREETS, data)
  }

  getLocations(): Location[] {
    return this.get(KEYS.LOCATIONS, INITIAL_LOCATIONS)
  }
  saveLocations(data: Location[]) {
    this.set(KEYS.LOCATIONS, data)
  }

  getMaterials(): Material[] {
    return this.get(KEYS.MATERIALS, INITIAL_MATERIALS)
  }
  saveMaterials(data: Material[]) {
    this.set(KEYS.MATERIALS, data)
  }

  getPallets(): Pallet[] {
    return this.get(KEYS.PALLETS, INITIAL_PALLETS)
  }
  savePallets(data: Pallet[]) {
    this.set(KEYS.PALLETS, data)
  }

  getHistory(): MovementLog[] {
    return this.get(KEYS.HISTORY, [])
  }
  saveHistory(data: MovementLog[]) {
    this.set(KEYS.HISTORY, data)
  }

  getEquipments(): Equipment[] {
    return this.get(KEYS.EQUIPMENTS, INITIAL_EQUIPMENTS)
  }
  saveEquipments(data: Equipment[]) {
    this.set(KEYS.EQUIPMENTS, data)
  }

  getSettings(): SystemSettings {
    return this.get(KEYS.SETTINGS, INITIAL_SETTINGS)
  }
  saveSettings(data: SystemSettings) {
    this.set(KEYS.SETTINGS, data)
  }

  getUsers(): User[] {
    return this.get(KEYS.USERS, INITIAL_USERS)
  }
  saveUsers(data: User[]) {
    this.set(KEYS.USERS, data)
  }

  public get keys() {
    return KEYS
  }
}

export const inventoryService = new InventoryService()
