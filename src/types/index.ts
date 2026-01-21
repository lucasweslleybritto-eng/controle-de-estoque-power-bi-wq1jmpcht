export interface Street {
  id: string
  name: string
  totalSlots: number
}

export interface Location {
  id: string
  streetId: string
  name: string
}

export interface Pallet {
  id: string
  locationId: string
  materialName: string
  description: string
  quantity: number
  entryDate: string
}

export interface Equipment {
  id: string
  name: string
  status: 'available' | 'in-use' | 'maintenance'
  imageQuery: string
}
