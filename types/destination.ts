export interface Destination {
  id?: number
  name: string
  address: string
  image: string
  cluster: number
  departure_location: string
  drive_time: number
  transit_time: number
  description?: string
}

export interface SearchParams {
  location: string
  minTravelTime: number
  maxTravelTime: number
  transportMode: "publicTransport" | "car"
  excludeId?: number
  excludeJeju?: boolean | string
}
