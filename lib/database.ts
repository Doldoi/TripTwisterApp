import { supabase } from "./supabase"
import type { Destination, SearchParams } from "@/types/destination"

export async function getDestinationByParams(params: SearchParams): Promise<Destination | null> {
  try {
    const { location, minTravelTime, maxTravelTime, transportMode, excludeId, excludeJeju } = params
    console.log("=== 데이터베이스 조회 시작 ===")
    console.log("검색 조건:", { location, minTravelTime, maxTravelTime, transportMode, excludeId, excludeJeju })

    // 교통수단에 따른 시간 컬럼 선택
    const timeColumn = transportMode === "car" ? "drive_time" : "transit_time"
    console.log("사용할 시간 컬럼:", timeColumn)

    // 1단계: 먼저 travel_time 테이블에서 조건에 맞는 클러스터 ID 목록 가져오기
    const { data: timeData, error: timeError } = await supabase
      .from("travel_time")
      .select("cluster")
      .eq("departure_location", location)
      .gte(timeColumn, minTravelTime)
      .lte(timeColumn, maxTravelTime)
      .not(timeColumn, "is", null)

    if (timeError) {
      console.error("travel_time 조회 오류:", timeError)
      return null
    }

    console.log("조건에 맞는 travel_time 데이터:", timeData?.length || 0, "개")
    
    if (!timeData || timeData.length === 0) {
      console.log("조건에 맞는 travel_time 데이터가 없습니다")
      return null
    }

    // 클러스터 ID 목록 추출
    const clusterIds = timeData.map(item => item.cluster)
    console.log("클러스터 ID 목록:", clusterIds.slice(0, 5), "... 외", clusterIds.length, "개")

    // 2단계: travel_place 테이블에서 해당 클러스터 ID에 해당하는 장소 정보 가져오기
    let placeQuery = supabase
      .from("travel_place")
      .select("*")
      .in("cluster", clusterIds)

    // 제주도 제외 조건
    if (excludeJeju === true || excludeJeju === "true") {
      placeQuery = placeQuery.not("is_jeju", "eq", true).not("cluster", "eq", 100)
      console.log("제주도 제외 조건 적용")
    }

    // 제외할 ID 조건
    if (excludeId) {
      placeQuery = placeQuery.neq("id", excludeId)
      console.log("제외할 ID:", excludeId)
    }

    const { data: placeData, error: placeError } = await placeQuery

    if (placeError) {
      console.error("travel_place 조회 오류:", placeError)
      return null
    }

    console.log("조건에 맞는 travel_place 데이터:", placeData?.length || 0, "개")
    
    if (!placeData || placeData.length === 0) {
      console.log("조건에 맞는 travel_place 데이터가 없습니다")
      return null
    }

    // 3단계: 랜덤으로 장소 선택
    const randomIndex = Math.floor(Math.random() * placeData.length)
    const selectedPlace = placeData[randomIndex]
    console.log("선택된 장소:", selectedPlace.name)

    // 4단계: 선택된 장소의 클러스터에 해당하는 시간 정보 가져오기
    const { data: selectedTimeData, error: selectedTimeError } = await supabase
      .from("travel_time")
      .select("*")
      .eq("cluster", selectedPlace.cluster)
      .eq("departure_location", location)
      .single()

    if (selectedTimeError) {
      console.error("선택된 장소의 시간 정보 조회 오류:", selectedTimeError)
      // 시간 정보가 없어도 장소 정보는 반환
      return {
        id: selectedPlace.id,
        name: selectedPlace.name,
        address: selectedPlace.address,
        image: selectedPlace.image,
        cluster: selectedPlace.cluster,
        departure_location: location,
        drive_time: null,
        transit_time: null,
        description: selectedPlace.description,
      }
    }

    // 5단계: 장소 정보와 시간 정보 결합하여 반환
    return {
      id: selectedPlace.id,
      name: selectedPlace.name,
      address: selectedPlace.address,
      image: selectedPlace.image,
      cluster: selectedPlace.cluster,
      departure_location: selectedTimeData.departure_location,
      drive_time: selectedTimeData.drive_time,
      transit_time: selectedTimeData.transit_time,
      description: selectedPlace.description,
    }
  } catch (error) {
    console.error("데이터 조회 오류:", error)
    return null
  }
}

// 특정 ID로 여행지 조회하는 함수 (JOIN 대신 두 번의 쿼리 사용)
export async function getDestinationById(id: string): Promise<Destination | null> {
  try {
    console.log("ID로 여행지 조회:", id)
    
    // 1단계: travel_place 테이블에서 장소 정보 조회
    const { data: placeData, error: placeError } = await supabase
      .from("travel_place")
      .select("*")
      .eq("id", id)
      .single()

    if (placeError) {
      console.error("장소 정보 조회 오류:", placeError)
      return null
    }

    if (!placeData) {
      console.log("해당 ID의 장소 정보가 없습니다:", id)
      return null
    }

    console.log("장소 정보 조회 성공:", placeData.name)

    // 2단계: travel_time 테이블에서 시간 정보 조회 (첫 번째 결과만 사용)
    const { data: timeData, error: timeError } = await supabase
      .from("travel_time")
      .select("*")
      .eq("cluster", placeData.cluster)
      .limit(1)

    if (timeError) {
      console.error("시간 정보 조회 오류:", timeError)
      // 시간 정보가 없어도 장소 정보는 반환
      return {
        id: placeData.id,
        name: placeData.name,
        address: placeData.address,
        image: placeData.image,
        cluster: placeData.cluster,
        departure_location: "", // 기본값
        drive_time: null, // 기본값
        transit_time: null, // 기본값
        description: placeData.description,
      }
    }

    if (!timeData || timeData.length === 0) {
      console.log("해당 클러스터의 시간 정보가 없습니다:", placeData.cluster)
      // 시간 정보가 없어도 장소 정보는 반환
      return {
        id: placeData.id,
        name: placeData.name,
        address: placeData.address,
        image: placeData.image,
        cluster: placeData.cluster,
        departure_location: "", // 기본값
        drive_time: null, // 기본값
        transit_time: null, // 기본값
        description: placeData.description,
      }
    }

    console.log("시간 정보 조회 성공:", timeData[0].departure_location)

    // 3단계: 두 테이블의 정보 결합
    return {
      id: placeData.id,
      name: placeData.name,
      address: placeData.address,
      image: placeData.image,
      cluster: placeData.cluster,
      departure_location: timeData[0].departure_location,
      drive_time: timeData[0].drive_time,
      transit_time: timeData[0].transit_time,
      description: placeData.description,
    }
  } catch (error) {
    console.error("ID로 여행지 조회 오류:", error)
    return null
  }
}

export function closeDatabase() {
  // Supabase는 자동으로 연결 관리하므로 불필요
}