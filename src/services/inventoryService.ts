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

interface QueueItem {
  table: string
  action: 'UPSERT' | 'DELETE'
  data: any
  id: string
}

class InventoryService {
  private listeners: ((event: ServiceEvent) => void)[] = []
  private syncStatus: SyncStatus = 'offline'
  private lastSync: Date = new Date()
  private isOnline: boolean = navigator.onLine
  private queue: QueueItem[] = []
  private isProcessingQueue = false
  private realtimeChannel: any = null

  private cache: {
    streets: Street[]
    locations: Location[]
    materials: Material[]
    pallets: Pallet[]
    history: MovementLog[]
    equipments: Equipment[]
    settings: SystemSettings
    users: User[]
    [key: string]: any
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
    this.loadFromLocalStorage()
  }

  public async init() {
    if (this.isOnline) {
      this.subscribeToRealtime()
      await this.fetchAll()
      this.processQueue()
    }
  }

  private setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.setSyncStatus('syncing')
      this.subscribeToRealtime()
      this.processQueue()
      this.fetchAll()
    })
    window.addEventListener('offline', () => {
      this.isOnline = false
      this.setSyncStatus('offline')
      if (this.realtimeChannel) {
        supabase.removeChannel(this.realtimeChannel)
        this.realtimeChannel = null
      }
    })
  }

  private toDb(table: string, data: any): any {
    const mapKeys = (obj: any): any => {
      const newObj: any = {}
      for (const key in obj) {
        const newKey = key.replace(
          /[A-Z]/g,
          (letter: string) => `_${letter.toLowerCase()}`,
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
        const newKey = key.replace(/_([a-z])/g, (g: string) =>
          g[1].toUpperCase(),
        )
        newObj[newKey] = obj[key]
      }
      return newObj
    }
    if (Array.isArray(data)) return data.map(mapKeys)
    return mapKeys(data)
  }

  private async fetchAll() {
    this.setSyncStatus('syncing')
    try {
      const tables = Object.values(KEYS)

      await Promise.all(
        tables.map(async (table) => {
          const { data, error } = await supabase.from(table).select('*')
          if (!error && data) {
            if (table === KEYS.SETTINGS) {
              if (data.length > 0)
                this.cache.settings = this.fromDb(table, data[0])
            } else {
              const list = this.fromDb(table, data)
              if (table === KEYS.STREETS) {
                list.sort((a: Street, b: Street) => a.order - b.order)
              }
              this.cache[table] = [...list]
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

  private subscribeToRealtime() {
    if (this.realtimeChannel) return

    this.realtimeChannel = supabase
      .channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        this.handleRealtimeEvent(payload)
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Realtime connected')
        }
      })
  }

  private handleRealtimeEvent(payload: any) {
    const table = payload.table
    const eventType = payload.eventType
    const newRecord = payload.new ? this.fromDb(table, payload.new) : null
    const oldRecord = payload.old ? this.fromDb(table, payload.old) : null

    // Ensure we are tracking this table
    if (!Object.values(KEYS).includes(table)) return

    if (table === KEYS.SETTINGS) {
      if (newRecord) this.cache.settings = newRecord
    } else {
      let list = [...((this.cache[table] as any[]) || [])]

      if (eventType === 'INSERT') {
        const idx = list.findIndex((i) => i.id === newRecord.id)
        if (idx >= 0) {
          // Update existing (echo or conflict)
          list[idx] = newRecord
        } else {
          list.push(newRecord)
        }
      } else if (eventType === 'UPDATE') {
        const index = list.findIndex((i) => i.id === newRecord.id)
        if (index !== -1) {
          // Merge to handle potential partial updates, though Supabase usually sends full row
          // Prioritize newRecord
          list[index] = { ...list[index], ...newRecord }
        } else {
          // Edge case: Update came but we don't have it? Treat as insert if possible
          list.push(newRecord)
        }
      } else if (eventType === 'DELETE') {
        list = list.filter((i) => i.id !== oldRecord.id)
      }

      if (table === KEYS.STREETS) {
        list.sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
      }

      this.cache[table] = list
    }

    this.notifyChange(table)
    this.saveToLocalStorage()
  }

  private async processQueue() {
    if (this.isProcessingQueue || this.queue.length === 0 || !this.isOnline)
      return

    this.isProcessingQueue = true
    this.setSyncStatus('syncing')

    const queueCopy = [...this.queue]
    this.queue = []
    this.saveToLocalStorage()

    for (let i = 0; i < queueCopy.length; i++) {
      const item = queueCopy[i]
      try {
        if (item.action === 'UPSERT') {
          const dbData = this.toDb(item.table, item.data)
          const { error } = await supabase.from(item.table).upsert(dbData)
          if (error) throw error
        } else if (item.action === 'DELETE') {
          const { error } = await supabase
            .from(item.table)
            .delete()
            .eq('id', item.id)
          if (error) throw error
        }
      } catch (error: any) {
        console.error('Queue processing error', error)

        // Check for specific network error "Failed to fetch"
        const isNetworkError =
          error?.message === 'Failed to fetch' ||
          error?.message?.includes('NetworkError') ||
          (error instanceof TypeError && error.message === 'Failed to fetch')

        if (isNetworkError) {
          console.log(
            'Network error detected during queue processing. Pausing.',
          )
          // Restore remaining items to the front of the queue to preserve order
          const remaining = queueCopy.slice(i)
          this.queue = [...remaining, ...this.queue]
          this.setSyncStatus('error')
          this.isProcessingQueue = false
          this.saveToLocalStorage()
          return
        }

        // For non-network errors, we move the item to the end of the queue (retry later)
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
    this.queue = this.queue.filter(
      (q) => !(q.table === item.table && q.id === item.id),
    )
    this.queue.push(item)
    this.processQueue()
    this.saveToLocalStorage()
  }

  public get<T>(key: string): T {
    return this.cache[key]
  }

  public async upsertItem(table: string, item: any) {
    // Optimistic Update
    if (table === KEYS.SETTINGS) {
      this.cache.settings = item
    } else {
      const list = [...((this.cache[table] as any[]) || [])]
      const idx = list.findIndex((i) => i.id === item.id)
      if (idx >= 0) list[idx] = item
      else list.push(item)
      this.cache[table] = list
    }
    this.notifyChange(table)
    this.saveToLocalStorage()

    this.addToQueue({
      table,
      action: 'UPSERT',
      data: item,
      id: item.id || 'settings',
    })
  }

  public async deleteItem(table: string, id: string) {
    // Optimistic Update
    const list = [...((this.cache[table] as any[]) || [])]
    this.cache[table] = list.filter((i) => i.id !== id)
    this.notifyChange(table)
    this.saveToLocalStorage()

    this.addToQueue({ table, action: 'DELETE', data: null, id })
  }

  public async upsertMany(table: string, items: any[]) {
    // Optimistic Update
    const list = [...((this.cache[table] as any[]) || [])]
    items.forEach((item) => {
      const idx = list.findIndex((i) => i.id === item.id)
      if (idx >= 0) list[idx] = item
      else list.push(item)

      this.addToQueue({
        table,
        action: 'UPSERT',
        data: item,
        id: item.id,
      })
    })
    this.cache[table] = list
    this.notifyChange(table)
    this.saveToLocalStorage()
  }

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
    const fakeLog: MovementLog = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      user: 'Remote User (Simulated)',
      type: 'SYSTEM',
      description: 'Simulated remote update event received',
      locationName: 'N/A',
      streetName: 'N/A',
    }

    this.handleRealtimeEvent({
      table: KEYS.HISTORY,
      eventType: 'INSERT',
      new: this.toDb(KEYS.HISTORY, fakeLog),
    })

    this.notifyEvent('Atualização remota recebida', 'system')
  }

  public resetDatabase(userId: string) {
    console.log('Reset requested by', userId)
    const tables = Object.values(KEYS)
    tables.forEach((table) => {
      if (table !== KEYS.SETTINGS && table !== KEYS.USERS) {
        // @ts-expect-error - Dynamic access to cache
        const items = this.cache[table] || []
        items.forEach((i: any) => this.deleteItem(table, i.id))
      }
    })
    this.notifyEvent('Sistema resetado localmente', 'system', 'destructive')
  }
}

export const inventoryService = new InventoryService()
