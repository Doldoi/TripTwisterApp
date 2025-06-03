import { type NextRequest, NextResponse } from "next/server"
import { getDestinationByParams, getDestinationById } from "@/lib/database"
import type { SearchParams } from "@/types/destination"

export async function POST(request: NextRequest) {
  try {
    console.log("=== API 라우트 호출됨 ===")
    const body = await request.json()
    console.log("받은 요청 body:", body)

    // destinationId가 있으면 해당 여행지를 직접 조회
    if (body.destinationId) {
      console.log("destinationId로 조회:", body.destinationId)
      const destination = await getDestinationById(body.destinationId)
      console.log("조회 결과:", destination)
      return NextResponse.json({ destination })
    }

    console.log("파라미터 기반 검색 시작")
    const params: SearchParams = {
      location: body.location,
      minTravelTime: body.minTravelTime,
      maxTravelTime: body.maxTravelTime,
      transportMode: body.transportMode,
      excludeId: body.excludeId,
      excludeJeju: body.excludeJeju,
    }

    console.log("검색 파라미터:", params)
    const destination = await getDestinationByParams(params)
    console.log("검색 결과:", destination)

    return NextResponse.json({ destination })
  } catch (error) {
    console.error("API 오류:", error)
    return NextResponse.json({ error: "여행지 검색 중 오류가 발생했습니다." }, { status: 500 })
  }
}
