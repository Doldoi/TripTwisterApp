"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import TripResult from "@/components/trip-result"
import TripResultSkeleton from "@/components/trip-result-skeleton"
import type { Destination } from "@/types/destination"

export default function ResultPageClient({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const router = useRouter()
  const [destination, setDestination] = useState<Destination | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [apiResponse, setApiResponse] = useState<any>(null)

  useEffect(() => {
    // 페이지 로드 시 스크롤 위치를 상단으로 설정
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    // searchParams 유효성 검사 - 필수 파라미터가 없으면 홈으로 리다이렉트
    const location = searchParams.location as string
    const minTravelTime = searchParams.minTravelTime as string
    const maxTravelTime = searchParams.maxTravelTime as string
    const transportMode = searchParams.transportMode as string

    if (!location || !minTravelTime || !maxTravelTime || !transportMode) {
      console.log("필수 파라미터 누락, 홈으로 리다이렉트")
      router.push("/")
      return
    }

    const fetchDestination = async () => {
      try {
        setLoading(true)
        const params = {
          location: searchParams.location as string,
          minTravelTime: Number.parseInt(searchParams.minTravelTime as string),
          maxTravelTime: Number.parseInt(searchParams.maxTravelTime as string),
          transportMode: searchParams.transportMode as string,
          excludeJeju: searchParams.excludeJeju as string,
        }

        console.log("API 요청 파라미터:", params)

        const response = await fetch("/api/destinations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(params),
        })

        const result = await response.json()
        setApiResponse(result) // 디버깅용 API 응답 저장

        console.log("API 응답 결과:", result)

        if (!response.ok) {
          throw new Error(result.error || "여행지 검색 실패")
        }

        if (!result.destination) {
          setError("조건에 맞는 여행지가 없습니다. 다른 조건으로 시도해보세요.")
        } else {
          setDestination(result.destination)
        }
      } catch (error: any) {
        console.error("여행지 검색 오류:", error)
        setError(error.message || "여행지를 불러오는 중 오류가 발생했습니다.")
      } finally {
        setLoading(false)
      }
    }

    fetchDestination()
  }, [searchParams, router])

  // 필수 파라미터가 없으면 아무것도 렌더링하지 않음
  const location = searchParams.location as string
  const minTravelTime = searchParams.minTravelTime as string
  const maxTravelTime = searchParams.maxTravelTime as string
  const transportMode = searchParams.transportMode as string

  if (!location || !minTravelTime || !maxTravelTime || !transportMode) {
    return null
  }

  // 검색 파라미터를 URL로 변환
  const searchParamsString = new URLSearchParams(searchParams as Record<string, string>).toString()

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <Link
            href={`/?${searchParamsString}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            조건 수정하기
          </Link>

          {loading ? (
            <TripResultSkeleton />
          ) : error ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">여행지를 찾을 수 없습니다</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              {apiResponse && (
                <div className="mb-6 text-left bg-gray-50 p-4 rounded-lg overflow-auto max-h-40">
                  <p className="text-xs text-gray-500 mb-2">디버깅 정보:</p>
                  <pre className="text-xs">{JSON.stringify(apiResponse, null, 2)}</pre>
                </div>
              )}
              <button
                onClick={() => router.push("/")}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                조건 수정하기
              </button>
            </div>
          ) : destination ? (
            <TripResult destination={destination} searchParams={searchParams} />
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">여행지를 찾을 수 없습니다</h2>
              <p className="text-gray-600 mb-6">조건에 맞는 여행지가 없습니다. 조건을 변경해보세요.</p>
              {apiResponse && (
                <div className="mb-6 text-left bg-gray-50 p-4 rounded-lg overflow-auto max-h-40">
                  <p className="text-xs text-gray-500 mb-2">디버깅 정보:</p>
                  <pre className="text-xs">{JSON.stringify(apiResponse, null, 2)}</pre>
                </div>
              )}
              <button
                onClick={() => router.push("/")}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                조건 수정하기
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
