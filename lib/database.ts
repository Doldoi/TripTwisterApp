import { supabase } from "./supabase"
import type { Destination, SearchParams } from "@/types/destination"

export async function getDestinationByParams(params: SearchParams): Promise<Destination | null> {
  try {
    const { location, minTravelTime, maxTravelTime, transportMode, excludeId, excludeJeju } = params

    console.log("=== 검색 파라미터 ===")
    console.log("출발지:", location)
    console.log("최소 이동시간:", minTravelTime)
    console.log("최대 이동시간:", maxTravelTime)
    console.log("교통수단:", transportMode)
    console.log("제주도 제외:", excludeJeju)
    console.log("==================")

    // 교통수단에 따른 시간 컬럼 선택
    const timeColumn = transportMode === "car" ? "drive_time" : "transit_time"
    console.log("사용할 시간 컬럼:", timeColumn)

    // 먼저 전체 데이터 확인
    const { data: allData, error: allError } = await supabase
      .from("datatable")
      .select("*")
      .eq("departure_location", location)
      .limit(5)

    console.log("=== 전체 데이터 샘플 (최대 5개) ===")
    console.log("전체 데이터 조회 에러:", allError)
    console.log("전체 데이터 샘플:", allData)
    if (allData && allData.length > 0) {
      console.log("첫 번째 데이터 예시:", allData[0])
      console.log("사용 가능한 컬럼들:", Object.keys(allData[0]))
    }

    // 제주도 제외 옵션이 켜져 있으면 제주도 데이터 제외
    if (excludeJeju === true || excludeJeju === "true") {
      console.log("=== 제주도 제외 모드 ===")

      // 단계별로 쿼리 확인
      console.log("1단계: 출발지만 필터링")
      const { data: step1, error: step1Error } = await supabase
        .from("datatable")
        .select("*")
        .eq("departure_location", location)

      console.log("1단계 결과:", { count: step1?.length, error: step1Error })

      console.log("2단계: 시간 컬럼 null 제외")
      const { data: step2, error: step2Error } = await supabase
        .from("datatable")
        .select("*")
        .eq("departure_location", location)
        .not(timeColumn, "is", null)

      console.log("2단계 결과:", { count: step2?.length, error: step2Error })

      console.log("3단계: 시간 범위 필터링")
      const { data: step3, error: step3Error } = await supabase
        .from("datatable")
        .select("*")
        .eq("departure_location", location)
        .not(timeColumn, "is", null)
        .gte(timeColumn, minTravelTime)
        .lte(timeColumn, maxTravelTime)

      console.log("3단계 결과:", { count: step3?.length, error: step3Error })
      if (step3 && step3.length > 0) {
        console.log("시간 범위 내 데이터 예시:", step3[0])
        console.log(`${timeColumn} 값들:`, step3.map((d) => d[timeColumn]).slice(0, 10))
      }

      console.log("4단계: 제주도 제외")
      const { data, error } = await supabase
        .from("datatable")
        .select("*")
        .eq("departure_location", location)
        .gte(timeColumn, minTravelTime)
        .lte(timeColumn, maxTravelTime)
        .not(timeColumn, "is", null)
        .neq("cluster", "100") // 제주도 클러스터 제외
        .not("address", "ilike", "%제주%") // 주소에 제주가 포함된 데이터 제외

      console.log("최종 쿼리 결과:", { data: data?.length, error })

      if (error) {
        console.error("Supabase 조회 오류:", error)
        return null
      }

      if (!data || data.length === 0) {
        console.log("조건에 맞는 데이터가 없습니다.")
        return null
      }

      console.log(`총 ${data.length}개의 여행지를 찾았습니다.`)

      // 클러스터별로 그룹화
      const destinationsByCluster = groupByCluster(data)

      // 클러스터별 여행지 수 로깅
      logClusterDistribution(destinationsByCluster)

      // 클러스터 기반 랜덤 선택
      return selectRandomDestinationByCluster(destinationsByCluster)
    }
    // 제주도 포함 옵션일 경우
    else {
      console.log("=== 제주도 포함 모드 ===")
      // 1. 제주도 외 여행지 조회
      const { data: nonJejuData, error: nonJejuError } = await supabase
        .from("datatable")
        .select("*")
        .eq("departure_location", location)
        .gte(timeColumn, minTravelTime)
        .lte(timeColumn, maxTravelTime)
        .not(timeColumn, "is", null)
        .neq("cluster", "100") // 제주도 클러스터 제외
        .not("address", "ilike", "%제주%") // 주소에 제주가 포함된 데이터 제외

      if (nonJejuError) {
        console.error("Supabase 비제주 조회 오류:", nonJejuError)
        return null
      }

      // 2. 제주도 여행지 조회 (최대 50개만)
      const { data: jejuData, error: jejuError } = await supabase
        .from("datatable")
        .select("*")
        .eq("departure_location", location)
        .gte(timeColumn, minTravelTime)
        .lte(timeColumn, maxTravelTime)
        .not(timeColumn, "is", null)
        .or(`cluster.eq.100,address.ilike.%제주%`) // 제주도 클러스터 또는 주소에 제주 포함
        .limit(50) // 제주도 데이터는 최대 50개만 가져옴

      if (jejuError) {
        console.error("Supabase 제주 조회 오류:", jejuError)
        return null
      }

      // 3. 두 결과 합치기
      const allData = [...(nonJejuData || []), ...(jejuData || [])]

      if (!allData || allData.length === 0) {
        return null
      }

      // 클러스터별로 그룹화
      const destinationsByCluster = groupByCluster(allData)

      // 클러스터별 여행지 수 로깅
      logClusterDistribution(destinationsByCluster)

      // 클러스터 기반 랜덤 선택
      return selectRandomDestinationByCluster(destinationsByCluster)
    }
  } catch (error) {
    console.error("데이터 조회 오류:", error)
    return null
  }
}

// 클러스터별로 여행지 그룹화
function groupByCluster(destinations: any[]): Record<string, any[]> {
  return destinations.reduce(
    (acc, destination) => {
      // 클러스터가 없으면 주소의 첫 부분을 사용
      const cluster = destination.cluster || destination.address.split(" ")[0]
      if (!acc[cluster]) {
        acc[cluster] = []
      }
      acc[cluster].push(destination)
      return acc
    },
    {} as Record<string, any[]>,
  )
}

// 클러스터 기반 랜덤 선택
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
}

// 클러스터별 여행지 수 로깅 함수 추가
function logClusterDistribution(destinationsByCluster: Record<string, any[]>): void {
  console.log("=== 클러스터별 여행지 분포 ===")
  Object.entries(destinationsByCluster).forEach(([cluster, destinations]) => {
    console.log(`클러스터 ${cluster}: ${destinations.length}개`)
  })
  console.log("==============================")
}

// 특정 ID로 여행지 조회하는 함수 추가
export async function getDestinationById(id: string): Promise<Destination | null> {
  try {
    const { data, error } = await supabase.from("datatable").select("*").eq("id", id).single()

    if (error) {
      console.error("Supabase ID 조회 오류:", error)
      return null
    }

    return {
      id: data.id,
      name: data.name,
      address: data.address,
      image: data.image,
      cluster: data.cluster,
      departure_location: data.departure_location,
      drive_time: data.drive_time,
      transit_time: data.transit_time,
      description: data.description,
    }
  } catch (error) {
    console.error("ID로 여행지 조회 오류:", error)
    return null
  }
}

export function closeDatabase() {
  // Supabase는 자동으로 연결 관리하므로 불필요
}
