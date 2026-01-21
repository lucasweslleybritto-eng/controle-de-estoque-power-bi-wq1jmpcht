import {
  Street,
  Location,
  Pallet,
  MovementLog,
  Material,
  SystemSettings,
  Equipment,
  User,
  SyncStatus,
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

export type NotificationCategory = 'movement' | 'low-stock' | 'system'

export type ServiceEvent =
  | { type: 'UPDATE'; key: string }
  | { type: 'SYNC_STATUS'; status: SyncStatus; lastSync?: Date }
  | {
      type: 'NOTIFICATION'
      message: string
      variant?: 'default' | 'destructive'
      category: NotificationCategory
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

const DEFAULT_PREFERENCES = {
  lowStockAlerts: true,
  movementAlerts: true,
  emailNotifications: false,
}

const INITIAL_USERS: User[] = [
  {
    id: 'admin-1',
    name: 'Administrador',
    email: 'admin@sistema.com',
    role: 'ADMIN',
    preferences: DEFAULT_PREFERENCES,
  },
  {
    id: 'op-1',
    name: 'Operador Padrão',
    email: 'operador@sistema.com',
    role: 'OPERATOR',
    preferences: DEFAULT_PREFERENCES,
  },
  {
    id: 'viewer-1',
    name: 'Visitante',
    email: 'visitante@sistema.com',
    role: 'VIEWER',
    preferences: DEFAULT_PREFERENCES,
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
  private syncStatus: SyncStatus = 'synced'
  private isOnline: boolean = navigator.onLine
  private lastSync: Date = new Date()

  constructor() {
    this.channel = new BroadcastChannel(CHANNEL_NAME)
    this.setupNetworkListeners()
    this.setupStorageListener()
  }

  private setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.setSyncStatus('syncing')
      setTimeout(() => this.setSyncStatus('synced'), 1500)
    })
    window.addEventListener('offline', () => {
      this.isOnline = false
      this.setSyncStatus('offline')
    })
  }

  private setupStorageListener() {
    // Listens for changes in OTHER tabs/windows
    window.addEventListener('storage', (event) => {
      if (event.key && Object.values(KEYS).includes(event.key)) {
        this.notifyChange(event.key, false) // false = don't re-emit to storage
      }
    })

    // Listens for BroadcastChannel messages
    this.channel.addEventListener('message', (event) => {
      if (event.data?.type === 'UPDATE') {
        // Just trigger the callback, data is already in localStorage
      }
    })
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
      this.notifyChange(key, true)
      this.simulateCloudSync()
    } catch (error) {
      console.error(`Error writing key ${key}:`, error)
    }
  }

  private notifyChange(key: string, emitToChannel = true) {
    if (emitToChannel) {
      this.channel.postMessage({ type: 'UPDATE', key })
    }
    // We don't need to manually dispatch to subscribers here if they are using the subscription model below
    // But for single-page reactivity without reload, we need to ensure the store updates
  }

  private setSyncStatus(status: SyncStatus) {
    this.syncStatus = status
    if (status === 'synced') {
      this.lastSync = new Date()
    }
    this.channel.postMessage({
      type: 'SYNC_STATUS',
      status,
      lastSync: this.lastSync,
    })
  }

  private simulateCloudSync() {
    if (!this.isOnline) {
      this.setSyncStatus('offline')
      return
    }

    this.setSyncStatus('syncing')
    const delay = Math.floor(Math.random() * 500) + 300

    setTimeout(() => {
      this.setSyncStatus('synced')
    }, delay)
  }

  public simulateRemoteUpdate() {
    if (!this.isOnline) return

    this.setSyncStatus('syncing')
    setTimeout(() => {
      const currentPallets = this.getPallets()
      const materials = this.getMaterials()
      const material = materials[0] || INITIAL_MATERIALS[0]

      const newPallet: Pallet = {
        id: crypto.randomUUID(),
        locationId: 'TRP_AREA',
        materialName: material.name,
        description: 'Recebido Remotamente (Simulação)',
        quantity: Math.floor(Math.random() * 50) + 1,
        entryDate: new Date().toISOString(),
        type: 'TRP',
        materialId: material.id,
      }

      const updatedPallets = [newPallet, ...currentPallets]
      localStorage.setItem(KEYS.PALLETS, JSON.stringify(updatedPallets))

      const currentHistory = this.getHistory()
      const newLog: MovementLog = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        user: 'Sistema Remoto',
        type: 'ENTRY',
        materialName: material.name,
        quantity: newPallet.quantity,
        description: 'Sincronização Cloud',
        locationName: 'Zona TRP',
      }
      localStorage.setItem(
        KEYS.HISTORY,
        JSON.stringify([newLog, ...currentHistory]),
      )

      this.notifyChange(KEYS.PALLETS)
      this.notifyChange(KEYS.HISTORY)
      this.setSyncStatus('synced')

      this.notifyEvent(
        `Atualização remota recebida: ${material.name} (+${newPallet.quantity})`,
        'system',
      )
    }, 1500)
  }

  public notifyEvent(
    message: string,
    category: NotificationCategory = 'system',
    variant: 'default' | 'destructive' = 'default',
  ) {
    this.channel.postMessage({
      type: 'NOTIFICATION',
      message,
      variant,
      category,
    })
  }

  public subscribe(callback: (event: ServiceEvent) => void) {
    const handleMessage = (event: MessageEvent) => {
      if (
        event.data?.type === 'UPDATE' ||
        event.data?.type === 'NOTIFICATION' ||
        event.data?.type === 'SYNC_STATUS'
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

    callback({
      type: 'SYNC_STATUS',
      status: this.syncStatus,
      lastSync: this.lastSync,
    })

    return () => {
      this.channel.removeEventListener('message', handleMessage)
      window.removeEventListener('storage', handleStorage)
    }
  }

  resetDatabase(currentUserId?: string) {
    this.set(KEYS.STREETS, [])
    this.set(KEYS.LOCATIONS, [])
    this.set(KEYS.MATERIALS, [])
    this.set(KEYS.PALLETS, [])
    this.set(KEYS.HISTORY, [])
    this.set(KEYS.EQUIPMENTS, [])
    this.set(KEYS.SETTINGS, INITIAL_SETTINGS)

    const currentUsers = this.getUsers()
    let newUsers: User[] = []

    if (currentUserId) {
      const currentUser = currentUsers.find((u) => u.id === currentUserId)
      if (currentUser) {
        newUsers = [currentUser]
      }
    }

    if (newUsers.length === 0) {
      newUsers = [INITIAL_USERS[0]]
    }

    this.set(KEYS.USERS, newUsers)
    Object.values(KEYS).forEach((key) => this.notifyChange(key))

    this.notifyEvent(
      'Sistema resetado. Todos os dados foram apagados.',
      'system',
      'destructive',
    )
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

  public getStatus() {
    return {
      status: this.syncStatus,
      isOnline: this.isOnline,
      lastSync: this.lastSync,
    }
  }
}

export const inventoryService = new InventoryService()
