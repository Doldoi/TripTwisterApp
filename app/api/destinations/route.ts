import { type NextRequest, NextResponse } from "next/server"
import { getDestinationByParams, getDestinationById } from "@/lib/database"
import type { SearchParams } from "@/types/destination"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // destinationId가 있으면 해당 여행지를 직접 조회
    if (body.destinationId) {
      const destination = await getDestinationById(body.destinationId)
      return NextResponse.json({ destination })
    }

    const params: SearchParams = {
      location: body.location,
      minTravelTime: body.minTravelTime,
      maxTravelTime: body.maxTravelTime,
      transportMode: body.transportMode,
      excludeId: body.excludeId,
      excludeJeju: body.excludeJeju,
    }

    const destination = await getDestinationByParams(params)

    return NextResponse.json({ destination })
  } catch (error) {
    console.error("API 오류:", error)
    return NextResponse.json({ error: "여행지 검색 중 오류가 발생했습니다." }, { status: 500 })
  }
}
