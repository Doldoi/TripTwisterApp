import { supabase } from "./supabase"
import type { Destination, SearchParams } from "@/types/destination"

export async function getDestinationByParams(params: SearchParams): Promise<Destination | null> {
  try {
    const { location, minTravelTime, maxTravelTime, transportMode, excludeId, excludeJeju } = params
    console.log("검색 조건:", { location, minTravelTime, maxTravelTime, transportMode, excludeId, excludeJeju })

    // 교통수단에 따른 시간 컬럼 선택
    const timeColumn = transportMode === "car" ? "drive_time" : "transit_time"

    let query = supabase
      .from("destinations")
      .select("*")
      .eq("출발지", location)
      .gte(timeColumn, minTravelTime)
      .lte(timeColumn, maxTravelTime)
      .not(timeColumn, "is", null)

    // 제주도 제외 조건
    if (excludeJeju === true || excludeJeju === "true") {
      query = query.eq("is_jeju", false)
    }

    // 제외할 ID 조건
    if (excludeId) {
      query = query.neq("id", excludeId)
    }

    const { data, error } = await query

    if (error) {
      console.error("Supabase 조회 오류:", error)
      return null
    }

    if (!data || data.length === 0) {
      console.log("조건에 맞는 여행지가 없습니다")
      return null
    }

    // 랜덤하게 하나 선택
    const randomIndex = Math.floor(Math.random() * data.length)
    const result = data[randomIndex]

    console.log("선택된 여행지:", result.name)

    return {
      id: result.id,
      name: result.name,
      address: result.address,
      image: result.image,
      cluster: result.cluster,
      departure_location: result.departure_location,
      drive_time: result.drive_time,
      transit_time: result.transit_time,
      description: result.description,
    }
  } catch (error) {
    console.error("데이터 조회 오류:", error)
    return null
  }
}

export function closeDatabase() {
  // Supabase는 자동으로 연결 관리하므로 불필요
}
