import { type NextRequest, NextResponse } from "next/server"
import { getDestinationByParams } from "@/lib/database"
import type { SearchParams } from "@/types/destination"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("API 요청 받음:", body)

    const params: SearchParams = {
      location: body.location,
      minTravelTime: body.minTravelTime,
      maxTravelTime: body.maxTravelTime,
      transportMode: body.transportMode,
      excludeId: body.excludeId,
      excludeJeju: body.excludeJeju, // 이 줄이 빠져있었습니다!
    }

    const destination = getDestinationByParams(params)
    console.log("API 응답:", destination ? "여행지 찾음" : "여행지 없음")

    return NextResponse.json({ destination })
  } catch (error) {
    console.error("API 오류:", error)
    return NextResponse.json({ error: "여행지 검색 중 오류가 발생했습니다." }, { status: 500 })
  }
}
