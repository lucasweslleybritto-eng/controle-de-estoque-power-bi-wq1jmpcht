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
import { supabase } from '@/lib/supabase'

const KEYS = {
  STREETS: 'streets',
  LOCATIONS: 'locations',
  MATERIALS: 'materials',
  PALLETS: 'pallets',
  HISTORY: 'history',
  EQUIPMENTS: 'equipments',
  SETTINGS: 'settings',
  USERS: 'users',
}

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

// Offline Queue Type
interface QueueItem {
  table: string
  action: 'UPSERT' | 'DELETE'
  data: any
  id: string // For deduplication/removal
}

class InventoryService {
  private listeners: ((event: ServiceEvent) => void)[] = []
  private syncStatus: SyncStatus = 'offline'
  private lastSync: Date = new Date()
  private isOnline: boolean = navigator.onLine
  private queue: QueueItem[] = []
  private isProcessingQueue = false

  // Local Cache
  private cache: {
    streets: Street[]
    locations: Location[]
    materials: Material[]
    pallets: Pallet[]
    history: MovementLog[]
    equipments: Equipment[]
    settings: SystemSettings
    users: User[]
  } = {
    streets: [],
    locations: [],
    materials: [],
    pallets: [],
    history: [],
    equipments: [],
    settings: {
      systemName: 'Depósito de Fardamento',
      lowStockThreshold: 10,
      highOccupancyThreshold: 80,
    },
    users: [],
  }

  constructor() {
    this.setupNetworkListeners()
    this.loadFromLocalStorage() // Load initial offline data
  }

  public async init() {
    if (this.isOnline) {
      await this.fetchAll()
      this.subscribeToRealtime()
      this.processQueue()
    }
  }

  private setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.setSyncStatus('syncing')
      this.processQueue()
      this.fetchAll().then(() => {
        this.subscribeToRealtime()
      })
    })
    window.addEventListener('offline', () => {
      this.isOnline = false
      this.setSyncStatus('offline')
      if (this.realtimeChannel) {
        this.realtimeChannel.unsubscribe()
        this.realtimeChannel = null
      }
    })
  }

  // --- Data Mapping (CamelCase <-> SnakeCase) ---
  // Simplified: assumes Supabase tables use snake_case
  private toDb(table: string, data: any): any {
    const mapKeys = (obj: any): any => {
      const newObj: any = {}
      for (const key in obj) {
        const newKey = key.replace(
          /[A-Z]/g,
          (letter) => `_${letter.toLowerCase()}`,
        )
        newObj[newKey] = obj[key]
      }
      return newObj
    }
    if (Array.isArray(data)) return data.map(mapKeys)
    return mapKeys(data)
  }

  private fromDb(table: string, data: any): any {
    const mapKeys = (obj: any): any => {
      const newObj: any = {}
      for (const key in obj) {
        const newKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase())
        newObj[newKey] = obj[key]
      }
      return newObj
    }
    if (Array.isArray(data)) return data.map(mapKeys)
    return mapKeys(data)
  }

  // --- CRUD Operations ---

  private async fetchAll() {
    this.setSyncStatus('syncing')
    try {
      const tables = [
        KEYS.STREETS,
        KEYS.LOCATIONS,
        KEYS.MATERIALS,
        KEYS.PALLETS,
        KEYS.HISTORY,
        KEYS.EQUIPMENTS,
        KEYS.SETTINGS,
        KEYS.USERS,
      ]

      await Promise.all(
        tables.map(async (table) => {
          const { data, error } = await supabase.from(table).select('*')
          if (!error && data) {
            // Special handling for settings (singleton)
            if (table === KEYS.SETTINGS) {
              if (data.length > 0)
                this.cache.settings = this.fromDb(table, data[0])
            } else {
              // @ts-expect-error - Dynamic key access
              this.cache[table] = this.fromDb(table, data)
              // Sort streets by order
              if (table === KEYS.STREETS) {
                this.cache.streets.sort((a, b) => a.order - b.order)
              }
            }
            this.notifyChange(table)
          }
        }),
      )
      this.saveToLocalStorage()
      this.setSyncStatus('synced')
    } catch (error) {
      console.error('Fetch error:', error)
      this.setSyncStatus('error')
    }
  }

  private realtimeChannel: any = null

  private subscribeToRealtime() {
    if (this.realtimeChannel) return

    this.realtimeChannel = supabase
      .channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        this.handleRealtimeEvent(payload)
      })
      .subscribe()
  }

  private handleRealtimeEvent(payload: any) {
    const table = payload.table
    const eventType = payload.eventType
    const newRecord = payload.new ? this.fromDb(table, payload.new) : null
    const oldRecord = payload.old ? this.fromDb(table, payload.old) : null

    // @ts-expect-error - Dynamic key access
    let list = this.cache[table] as any[]

    if (table === KEYS.SETTINGS) {
      if (newRecord) this.cache.settings = newRecord
    } else {
      if (eventType === 'INSERT') {
        // Prevent duplicates
        if (!list.find((i) => i.id === newRecord.id)) {
          list.push(newRecord)
        }
      } else if (eventType === 'UPDATE') {
        const index = list.findIndex((i) => i.id === newRecord.id)
        if (index !== -1) list[index] = newRecord
      } else if (eventType === 'DELETE') {
        list = list.filter((i) => i.id !== oldRecord.id)
      }

      // Sort if needed
      if (table === KEYS.STREETS) {
        list.sort((a: Street, b: Street) => a.order - b.order)
      }

      // @ts-expect-error - Dynamic key access
      this.cache[table] = list
    }

    this.notifyChange(table)
    this.saveToLocalStorage()
  }

  // --- Queue & Sync ---

  private async processQueue() {
    if (this.isProcessingQueue || this.queue.length === 0 || !this.isOnline)
      return

    this.isProcessingQueue = true
    this.setSyncStatus('syncing')

    const queueCopy = [...this.queue]
    // Clear queue momentarily, if fail we add back
    this.queue = []
    this.saveToLocalStorage() // Update storage

    for (const item of queueCopy) {
      try {
        if (item.action === 'UPSERT') {
          const dbData = this.toDb(item.table, item.data)
          // Handle Settings singleton
          if (item.table === KEYS.SETTINGS) {
            // Assuming settings table has 1 row with ID 1 or unique constraint
            const { error } = await supabase.from(item.table).upsert(dbData)
            if (error) throw error
          } else {
            const { error } = await supabase.from(item.table).upsert(dbData)
            if (error) throw error
          }
        } else if (item.action === 'DELETE') {
          const { error } = await supabase
            .from(item.table)
            .delete()
            .eq('id', item.id)
          if (error) throw error
        }
      } catch (error) {
        console.error('Queue processing error', error)
        // Add back to front of queue if failed? Or back?
        // Simple retry logic: just push back
        this.queue.push(item)
        this.setSyncStatus('error')
      }
    }

    this.isProcessingQueue = false
    this.saveToLocalStorage()
    if (this.queue.length === 0) {
      this.setSyncStatus('synced')
    }
  }

  private addToQueue(item: QueueItem) {
    // Remove existing item for same ID to keep only latest state
    this.queue = this.queue.filter(
      (q) => !(q.table === item.table && q.id === item.id),
    )
    this.queue.push(item)
    this.processQueue()
    this.saveToLocalStorage()
  }

  // --- Public Methods for Store ---

  public get<T>(key: string): T {
    // @ts-expect-error - Dynamic access
    return this.cache[key]
  }

  public async save(key: string, data: any) {
    // 1. Optimistic Update
    // @ts-expect-error - Dynamic access
    this.cache[key] = data
    this.notifyChange(key)
    this.saveToLocalStorage()

    // 2. Identify Changes
    // For simplicity, we assume 'data' is the full list.
    // In a real app, we should pass the delta.
    // Here we will map the specific methods to queue actions.
    // BUT, the store calls saveStreets(streets).
    // We need to differentiate inserts/updates/deletes.
    // FOR THIS IMPLEMENTATION:
    // We will rely on specific methods (addStreet, updateStreet) calling a specific 'upsert' method here.
    // However, the interface is generic 'saveStreets'.
    // Let's change the pattern: The Store calls 'saveStreets' passing the WHOLE list.
    // This is inefficient for DB.
    // We should refactor store to call upsert/delete.
    // GIVEN constraint: I can rewrite store or service.
    // Better to handle list diffing here or just update logic in Store to call specific methods?
    // Let's add specific methods in Service and call them from Store.
  }

  // Generalized Upsert
  public async upsertItem(table: string, item: any) {
    // Update Cache
    if (table === KEYS.SETTINGS) {
      this.cache.settings = item
    } else {
      // @ts-expect-error - Dynamic access
      const list = this.cache[table] as any[]
      const idx = list.findIndex((i) => i.id === item.id)
      if (idx >= 0) list[idx] = item
      else list.push(item)
    }
    this.notifyChange(table)
    this.saveToLocalStorage()

    // Queue DB Action
    this.addToQueue({
      table,
      action: 'UPSERT',
      data: item,
      id: item.id || 'settings',
    })
  }

  // Generalized Delete
  public async deleteItem(table: string, id: string) {
    // Update Cache
    // @ts-expect-error - Dynamic access
    const list = this.cache[table] as any[]
    // @ts-expect-error - Dynamic access
    this.cache[table] = list.filter((i) => i.id !== id)
    this.notifyChange(table)
    this.saveToLocalStorage()

    // Queue DB Action
    this.addToQueue({ table, action: 'DELETE', data: null, id })
  }

  // Bulk Upsert (for reordering or imports)
  public async upsertMany(table: string, items: any[]) {
    items.forEach((item) => this.upsertItem(table, item))
  }

  // --- Specific Accessors (matching store calls) ---

  getStreets() {
    return this.cache.streets
  }
  getLocations() {
    return this.cache.locations
  }
  getMaterials() {
    return this.cache.materials
  }
  getPallets() {
    return this.cache.pallets
  }
  getHistory() {
    return this.cache.history
  }
  getEquipments() {
    return this.cache.equipments
  }
  getSettings() {
    return this.cache.settings
  }
  getUsers() {
    return this.cache.users
  }

  // --- Utils ---

  private notifyChange(key: string) {
    this.listeners.forEach((l) => l({ type: 'UPDATE', key }))
  }

  public subscribe(callback: (event: ServiceEvent) => void) {
    this.listeners.push(callback)
    callback({
      type: 'SYNC_STATUS',
      status: this.syncStatus,
      lastSync: this.lastSync,
    })
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback)
    }
  }

  private setSyncStatus(status: SyncStatus) {
    this.syncStatus = status
    if (status === 'synced') this.lastSync = new Date()
    this.listeners.forEach((l) =>
      l({ type: 'SYNC_STATUS', status, lastSync: this.lastSync }),
    )
  }

  public notifyEvent(
    message: string,
    category: NotificationCategory,
    variant: 'default' | 'destructive' = 'default',
  ) {
    this.listeners.forEach((l) =>
      l({ type: 'NOTIFICATION', message, category, variant }),
    )
  }

  public getStatus() {
    return {
      status: this.syncStatus,
      isOnline: this.isOnline,
      lastSync: this.lastSync,
    }
  }

  // Local Storage persistence for offline capabilities
  private saveToLocalStorage() {
    localStorage.setItem('inventory_cache', JSON.stringify(this.cache))
    localStorage.setItem('inventory_queue', JSON.stringify(this.queue))
  }

  private loadFromLocalStorage() {
    const cached = localStorage.getItem('inventory_cache')
    if (cached) {
      try {
        this.cache = { ...this.cache, ...JSON.parse(cached) }
      } catch (e) {
        console.error('Cache load error', e)
      }
    }
    const queued = localStorage.getItem('inventory_queue')
    if (queued) {
      try {
        this.queue = JSON.parse(queued)
      } catch (e) {
        console.error('Queue load error', e)
      }
    }
  }

  public get keys() {
    return KEYS
  }

  public simulateRemoteUpdate() {
    // No-op or implementation if needed for demo
  }

  public resetDatabase(userId: string) {
    // Implementation for reset would go here
    // For now, alerting user functionality is limited
    console.log('Reset requested by', userId)
  }
}

export const inventoryService = new InventoryService()
