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

    // 먼저 travel_time 테이블에 해당 출발지 데이터가 있는지 확인
    const { data: timeCheck, error: timeCheckError } = await supabase
      .from("travel_time")
      .select("*")
      .eq("departure_location", location)
      .limit(5)

    console.log("travel_time 테이블 확인:", timeCheck?.length || 0, "개")
    if (timeCheck && timeCheck.length > 0) {
      console.log("샘플 데이터:", timeCheck[0])
    }

    // travel_place 테이블 확인
    const { data: placeCheck, error: placeCheckError } = await supabase.from("travel_place").select("*").limit(5)

    console.log("travel_place 테이블 확인:", placeCheck?.length || 0, "개")
    if (placeCheck && placeCheck.length > 0) {
      console.log("샘플 장소 데이터:", placeCheck[0])
    }

    // JOIN 쿼리 실행
    let query = supabase
      .from("travel_time")
      .select(`
        id,
        cluster,
        departure_location,
        drive_time,
        transit_time,
        travel_place!inner(id, name, address, image, description, is_jeju, cluster)
      `)
      .eq("departure_location", location)
      .gte(timeColumn, minTravelTime)
      .lte(timeColumn, maxTravelTime)
      .not(timeColumn, "is", null)

    console.log("JOIN 쿼리 조건:", {
      departure_location: location,
      [`${timeColumn}_gte`]: minTravelTime,
      [`${timeColumn}_lte`]: maxTravelTime,
    })

    // 제외할 ID 조건
    if (excludeId) {
      query = query.not("travel_place.id", "eq", excludeId)
      console.log("제외할 ID:", excludeId)
    }

    // 제주도 제외 조건
    if (excludeJeju === true || excludeJeju === "true") {
      query = query.not("travel_place.is_jeju", "eq", true).not("travel_place.cluster", "eq", 100)
      console.log("제주도 제외 조건 적용")
    }

    const { data, error } = await query

    console.log("=== 쿼리 결과 ===")
    console.log("에러:", error)
    console.log("결과 개수:", data?.length || 0)

    if (data && data.length > 0) {
      console.log("첫 번째 결과:", data[0])
    }

    if (error) {
      console.error("Supabase 조회 오류:", error)
      return null
    }

    if (!data || data.length === 0) {
      console.log("조건에 맞는 데이터가 없습니다")
      return null
    }

    // 클러스터별로 그룹화
    const destinationsByCluster = groupByCluster(data)
    console.log("클러스터별 그룹화 결과:", Object.keys(destinationsByCluster))

    // 클러스터 기반 랜덤 선택
    return selectRandomDestinationByCluster(destinationsByCluster)
  } catch (error) {
    console.error("데이터 조회 오류:", error)
    return null
  }
}

// 클러스터별로 여행지 그룹화 (JOIN 결과에 맞게 수정)
function groupByCluster(destinations: any[]): Record<string, any[]> {
  return destinations.reduce(
    (acc, destination) => {
      // travel_place 테이블의 cluster 사용
      const cluster = destination.travel_place?.cluster?.toString() || "unknown"
      if (!acc[cluster]) {
        acc[cluster] = []
      }
      acc[cluster].push(destination)
      return acc
    },
    {} as Record<string, any[]>,
  )
}

// 클러스터 기반 랜덤 선택 (JOIN 결과에 맞게 수정)
function selectRandomDestinationByCluster(destinationsByCluster: Record<string, any[]>): Destination {
  // 클러스터 목록
  const clusters = Object.keys(destinationsByCluster)

  // 클러스터 랜덤 선택
  const randomClusterIndex = Math.floor(Math.random() * clusters.length)
  const selectedCluster = clusters[randomClusterIndex]

  // 선택된 클러스터 내에서 여행지 랜덤 선택
  const clusterDestinations = destinationsByCluster[selectedCluster]
  const randomDestinationIndex = Math.floor(Math.random() * clusterDestinations.length)
  const result = clusterDestinations[randomDestinationIndex]

  console.log("선택된 클러스터:", selectedCluster)
  console.log("선택된 여행지:", result.travel_place?.name)

  // JOIN 결과에서 데이터 추출
  return {
    id: result.travel_place.id, // travel_place의 ID 사용
    name: result.travel_place.name,
    address: result.travel_place.address,
    image: result.travel_place.image,
    cluster: result.travel_place.cluster,
    departure_location: result.departure_location,
    drive_time: result.drive_time,
    transit_time: result.transit_time,
    description: result.travel_place.description,
  }
}

// 특정 ID로 여행지 조회하는 함수 (JOIN 사용)
export async function getDestinationById(id: string): Promise<Destination | null> {
  try {
    // travel_place 테이블에서 장소 정보 조회
    const { data: placeData, error: placeError } = await supabase.from("travel_place").select("*").eq("id", id).single()

    if (placeError || !placeData) {
      console.error("장소 정보 조회 오류:", placeError)
      return null
    }

    // travel_time 테이블에서 시간 정보 조회 (첫 번째 결과만 사용)
    const { data: timeData, error: timeError } = await supabase
      .from("travel_time")
      .select("*")
      .eq("cluster", placeData.cluster)
      .limit(1)
      .single()

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

    // 두 테이블의 정보 결합
    return {
      id: placeData.id,
      name: placeData.name,
      address: placeData.address,
      image: placeData.image,
      cluster: placeData.cluster,
      departure_location: timeData?.departure_location || "",
      drive_time: timeData?.drive_time || null,
      transit_time: timeData?.transit_time || null,
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
