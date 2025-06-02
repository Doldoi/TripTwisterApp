export interface Destination {
  id?: number
  name: string
  address: string
  image: string
  cluster: number
  출발지: string
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
