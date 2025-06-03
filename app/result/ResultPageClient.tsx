"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import TripResult from "@/components/trip-result"
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

  useEffect(() => {
    // 페이지 로드 시 스크롤 위치를 상단으로 설정
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const destinationId = searchParams.destinationId as string
    const location = searchParams.location as string
    const minTravelTime = searchParams.minTravelTime as string
    const maxTravelTime = searchParams.maxTravelTime as string
    const transportMode = searchParams.transportMode as string

    console.log("=== ResultPageClient useEffect 실행 ===")
    console.log("받은 searchParams:", searchParams)
    console.log("destinationId:", destinationId)
    console.log("location:", location)

    // destinationId가 있으면 해당 여행지만 조회
    if (destinationId && destinationId !== "undefined") {
      console.log("특정 여행지 조회 모드")
      const fetchSpecificDestination = async () => {
        try {
          console.log("API 호출 시작 - 특정 여행지")
          setLoading(true)
          const response = await fetch("/api/destinations", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ destinationId }),
          })

          console.log("API 응답 상태:", response.status)
          const result = await response.json()
          console.log("API 응답 결과:", result)

          if (!response.ok) {
            throw new Error(result.error || "여행지 검색 실패")
          }

          if (!result.destination) {
            setError("해당 여행지를 찾을 수 없습니다.")
          } else {
            setDestination(result.destination)
          }
        } catch (error: any) {
          console.error("특정 여행지 조회 에러:", error)
          setError(error.message || "여행지를 불러오는 중 오류가 발생했습니다.")
        } finally {
          setLoading(false)
        }
      }

      fetchSpecificDestination()
      return
    }

    // destinationId가 없으면 기존 랜덤 검색 로직
    if (!location || !minTravelTime || !maxTravelTime || !transportMode) {
      console.log("필수 파라미터 누락, 홈으로 리다이렉트")
      console.log(
        "location:",
        location,
        "minTravelTime:",
        minTravelTime,
        "maxTravelTime:",
        maxTravelTime,
        "transportMode:",
        transportMode,
      )
      router.push("/")
      return
    }

    console.log("랜덤 검색 모드")
    const fetchDestination = async () => {
      try {
        console.log("API 호출 시작 - 랜덤 검색")
        setLoading(true)
        const params = {
          location: searchParams.location as string,
          minTravelTime: Number.parseInt(searchParams.minTravelTime as string),
          maxTravelTime: Number.parseInt(searchParams.maxTravelTime as string),
          transportMode: searchParams.transportMode as string,
          excludeJeju: searchParams.excludeJeju as string,
        }

        console.log("API 호출 파라미터:", params)

        const response = await fetch("/api/destinations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(params),
        })

        console.log("API 응답 상태:", response.status)
        const result = await response.json()
        console.log("API 응답 결과:", result)

        if (!response.ok) {
          throw new Error(result.error || "여행지 검색 실패")
        }

        if (!result.destination) {
          setError("조건에 맞는 여행지가 없습니다.")
        } else {
          setDestination(result.destination)
        }
      } catch (error: any) {
        console.error("랜덤 검색 에러:", error)
        setError(error.message || "여행지를 불러오는 중 오류가 발생했습니다.")
      } finally {
        setLoading(false)
      }
    }

    fetchDestination()
  }, [searchParams, router])

  // 검색 파라미터를 URL로 변환
  const searchParamsString = new URLSearchParams(searchParams as Record<string, string>).toString()

  // 에러 메시지에 따른 안내 문구 생성
  const getErrorGuidance = (errorMessage: string) => {
    if (errorMessage.includes("조건에 맞는 여행지가 없습니다")) {
      return "이동시간을 늘리거나 다른 출발지를 선택해보세요."
    } else if (errorMessage.includes("해당 여행지를 찾을 수 없습니다")) {
      return "공유받은 링크가 만료되었거나 잘못된 링크일 수 있습니다."
    } else {
      return "잠시 후 다시 시도하거나 조건을 변경해보세요."
    }
  }

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
            <div className="bg-white rounded-xl shadow-xl p-8 text-center">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-gray-600">여행지를 찾고 있습니다...</p>
              </div>
            </div>
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
              <p className="text-gray-600 mb-2">{error}</p>
              <p className="text-sm text-gray-500 mb-6">{getErrorGuidance(error)}</p>
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
              <p className="text-gray-600 mb-2">조건에 맞는 여행지가 없습니다.</p>
              <p className="text-sm text-gray-500 mb-6">이동시간을 늘리거나 다른 출발지를 선택해보세요.</p>
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
