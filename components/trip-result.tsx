"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapPin, Bed, Navigation, RefreshCw, Share2, AlertTriangle } from "lucide-react"
import type { Destination } from "@/types/destination"
import { useToast } from "@/hooks/use-toast"
import ShareButtons from "@/components/share-buttons"
import ErrorReportModal from "@/components/error-report-modal"
import { motion } from "framer-motion"

interface TripResultProps {
  destination: Destination
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function TripResult({ destination, searchParams }: TripResultProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showErrorReport, setShowErrorReport] = useState(false)
  const [currentDestination, setCurrentDestination] = useState<Destination>(destination)
  const [imageLoading, setImageLoading] = useState(false)
  const [imageError, setImageError] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // destination이 변경될 때마다 currentDestination 업데이트
  useEffect(() => {
    setCurrentDestination(destination)
    setImageError(false) // 새 여행지로 변경될 때 이미지 에러 상태 초기화
  }, [destination])

  // destinationId가 있는지 확인 (공유 링크로 접근한 경우)
  const isSharedLink = searchParams.destinationId && searchParams.destinationId !== "undefined"

  // 안전 처리 추가 - destination이 없을 때
  if (!destination) {
    return (
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
        <h2 className="text-xl font-semibold text-gray-800 mb-2">여행지 정보를 불러올 수 없습니다</h2>
        <p className="text-gray-600 mb-6">조건에 맞는 여행지가 없거나 오류가 발생했습니다.</p>
        <button
          onClick={() => (window.location.href = "/")}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          다시 시도하기
        </button>
      </div>
    )
  }

  const handleTryAgain = async () => {
    setLoading(true)
    setImageLoading(true) // 이미지 로딩 상태 시작
    try {
      const params = {
        location: searchParams.location as string,
        minTravelTime: Number.parseInt(searchParams.minTravelTime as string) || 0,
        maxTravelTime: Number.parseInt(searchParams.maxTravelTime as string) || 5,
        transportMode: (searchParams.transportMode as "publicTransport" | "car") || "publicTransport",
        excludeId: currentDestination.id,
        excludeJeju: searchParams.excludeJeju as string,
      }

      const response = await fetch("/api/destinations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      })

      if (!response.ok) {
        throw new Error("여행지 검색 실패")
      }

      const result = await response.json()

      if (!result.destination) {
        setError("조건에 맞는 다른 여행지를 찾을 수 없습니다.")
        toast({
          title: "다른 여행지를 찾을 수 없습니다",
          description: "조건을 변경해보세요.",
          variant: "destructive",
        })
      } else {
        setCurrentDestination(result.destination)
        setError(null)
        setImageError(false) // 새 여행지 설정 시 이미지 에러 상태 초기화
      }
    } catch (err) {
      setError("여행지를 불러오는 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
      setImageLoading(false) // 이미지 로딩 상태 종료
    }
  }

  const kakaoMapUrl = `https://map.kakao.com/?sName=${encodeURIComponent(searchParams.location as string)}&eName=${encodeURIComponent(currentDestination.name)}`
  const accommodationUrl = `https://www.goodchoice.kr/product/search/2/${encodeURIComponent(currentDestination.name)}`

  // 이동시간 표시
  const travelTime =
    searchParams.transportMode === "car" ? currentDestination.drive_time : currentDestination.transit_time

  // 이미지 URL에 캐시 방지를 위한 파라미터 추가
  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) {
      return `/placeholder.svg?height=400&width=600&text=여행지 이미지&id=${currentDestination.id}`
    }

    // 이미지 URL에 destination ID를 파라미터로 추가하여 캐시 방지
    const separator = imageUrl.includes("?") ? "&" : "?"
    return `${imageUrl}${separator}v=${currentDestination.id}`
  }

  return (
    <motion.div
      key={currentDestination.id} // 여행지가 바뀔 때마다 컴포넌트 리렌더링 강제
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card className="overflow-hidden bg-white shadow-xl rounded-xl border-0">
        <div className="relative h-72 md:h-96">
          {imageLoading && (
            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          <Image
            key={`${currentDestination.id}-${Date.now()}`} // 강제 리렌더링을 위한 unique key
            src={
              imageError
                ? `/placeholder.svg?height=400&width=600&text=이미지 로딩 실패&id=${currentDestination.id}`
                : getImageUrl(currentDestination.image)
            }
            alt={`${currentDestination.name} 여행지 이미지`}
            fill
            className="object-cover"
            priority={false} // priority를 false로 설정하여 캐싱 이슈 방지
            unoptimized={true} // 이미지 최적화 비활성화로 캐싱 문제 해결
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageError(true)
              setImageLoading(false)
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-2 drop-shadow-sm">{currentDestination.name}</h2>
            <p className="text-white/90 flex items-center gap-1 drop-shadow-sm">
              <MapPin className="h-4 w-4" />
              {currentDestination.address}
            </p>
          </div>
          {/* 공유 링크가 아닐 때만 "다른 여행지" 버튼 표시 */}
          {!isSharedLink && (
            <div className="absolute top-4 right-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTryAgain}
                disabled={loading}
                className="bg-white/90 hover:bg-white text-gray-800 border-0 shadow-md"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-800"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    검색 중...
                  </span>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    다른 여행지
                  </>
                )}
              </Button>
            </div>
          )}
          <div className="absolute bottom-4 right-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowErrorReport(true)}
              className="bg-white/90 hover:bg-white text-gray-800 border-0 shadow-md"
            >
              <AlertTriangle className="h-4 w-4 mr-1 text-red-500" />
              오류신고
            </Button>
          </div>
        </div>

        <div className="p-6">
          {/* 공유 링크가 아닐 때만 여행 정보 표시 */}
          {!isSharedLink && (
            <div className="bg-blue-50 p-5 rounded-xl mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">여행 정보</h3>
              <div className="grid grid-cols-1 gap-3 text-sm bg-white p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span>이동시간: {travelTime}시간</span>
                </div>
                {/* 제주도 제외 조건 표시 제거 */}
              </div>
            </div>
          )}

          {/* 여행지 설명 추가 */}
          {currentDestination.description && (
            <div className="mb-6 bg-white p-5 rounded-xl border border-blue-100">
              <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-blue-500"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                여행지 설명
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                {currentDestination.description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Button
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 transition-colors"
              onClick={() => window.open(kakaoMapUrl, "_blank")}
            >
              <Navigation className="h-5 w-5" />
              <span>길찾기</span>
            </Button>

            <Button
              variant="outline"
              className="flex items-center justify-center gap-2 border-blue-200 text-blue-600 hover:bg-blue-50"
              onClick={() => window.open(accommodationUrl, "_blank")}
            >
              <Bed className="h-5 w-5" />
              <span>숙소 찾기</span>
            </Button>
          </div>

          <div className="bg-gray-50 p-5 rounded-xl">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Share2 className="h-5 w-5 text-blue-600" />
              <span>친구에게 공유하기</span>
            </h3>
            <ShareButtons
              title="Trip Twister - 랜덤 여행지 추천"
              destinationName={currentDestination.name}
              destinationId={currentDestination.id.toString()}
            />
          </div>
        </div>
      </Card>

      <ErrorReportModal
        isOpen={showErrorReport}
        onClose={() => setShowErrorReport(false)}
        destination={currentDestination}
        searchParams={searchParams}
      />
    </motion.div>
  )
}
