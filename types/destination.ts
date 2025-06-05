export interface Destination {
  id: number
  name: string
  address: string
  image: string | null
  cluster: number | null
  departure_location: string
  drive_time: number | null
  transit_time: number | null
  description: string | null
}

export interface SearchParams {
  location: string
  minTravelTime: number
  maxTravelTime: number
  transportMode: "car" | "publicTransport"
  excludeId?: number
  excludeJeju?: boolean | string
}
