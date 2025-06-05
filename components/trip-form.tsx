"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { MapPin, Clock, Car, Bus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import CountdownAnimation from "@/components/countdown-animation"

const LOCATIONS = [
  "서울특별시",
  "부산광역시",
  "대구광역시",
  "인천광역시",
  "광주광역시",
  "대전광역시",
  "울산광역시",
  "경기도",
  "강원도",
  "충청북도",
  "충청남도",
  "전라북도",
  "전라남도",
  "경상북도",
  "경상남도",
  "제주특별자치도",
]

export default function TripForm() {
  const [selectedLocation, setSelectedLocation] = useState<string>("")
  const [travelTime, setTravelTime] = useState([3]) // 3시간으로 변경
  const [transportMode, setTransportMode] = useState<"publicTransport" | "car">("publicTransport")
  const [excludeJeju, setExcludeJeju] = useState(true)
  const [showCountdown, setShowCountdown] = useState(false)
  const [apiResult, setApiResult] = useState<any>(null)
  const [apiLoading, setApiLoading] = useState(false)
  const [countdownComplete, setCountdownComplete] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  // URL 파라미터에서 이전 선택값 복원
  useEffect(() => {
    const location = searchParams.get("location")
    const maxTravelTime = searchParams.get("maxTravelTime")
    const transport = searchParams.get("transportMode")
    const excludeJejuParam = searchParams.get("excludeJeju")

    if (location) {
      setSelectedLocation(location)
    }
    if (maxTravelTime) {
      setTravelTime([Number.parseInt(maxTravelTime)])
    }
    if (transport) {
      setTransportMode(transport as "publicTransport" | "car")
    }
    if (excludeJejuParam) {
      setExcludeJeju(excludeJejuParam === "true")
    }

    // URL 파라미터가 있으면 깔끔한 URL로 변경
    if (location || maxTravelTime || transport || excludeJejuParam) {
      router.replace("/")
    }
  }, [searchParams, router])

  // API 호출과 카운트다운이 모두 완료되면 결과 페이지로 이동
  useEffect(() => {
    if (countdownComplete && !apiLoading) {
      if (apiResult) {
        // API 결과가 있으면 결과와 함께 이동
        const params = new URLSearchParams({
          location: selectedLocation,
          minTravelTime: "0",
          maxTravelTime: travelTime[0].toString(),
          transportMode,
          excludeJeju: excludeJeju.toString(),
          preloaded: "true", // 미리 로드된 데이터임을 표시
        })

        // 결과 데이터를 sessionStorage에 저장
        sessionStorage.setItem("preloadedDestination", JSON.stringify(apiResult))
        router.push(`/result?${params.toString()}`)
      } else {
        // API 실패 시 기존 방식으로 이동
        const params = new URLSearchParams({
          location: selectedLocation,
          minTravelTime: "0",
          maxTravelTime: travelTime[0].toString(),
          transportMode,
          excludeJeju: excludeJeju.toString(),
        })
        router.push(`/result?${params.toString()}`)
      }
    }
  }, [countdownComplete, apiLoading, apiResult, selectedLocation, travelTime, transportMode, excludeJeju, router])

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location)
  }

  const handleSubmit = () => {
    if (!selectedLocation) {
      toast({
        title: "출발지를 선택해주세요",
        description: "여행을 시작할 지역을 먼저 선택해주세요.",
        variant: "destructive",
      })
      return
    }

    setShowCountdown(true)
    setCountdownComplete(false)
    setApiResult(null)

    // 카운트다운과 동시에 API 호출 시작
    startApiCall()
  }

  const startApiCall = async () => {
    setApiLoading(true)
    try {
      const params = {
        location: selectedLocation,
        minTravelTime: 0,
        maxTravelTime: travelTime[0],
        transportMode,
        excludeJeju: excludeJeju.toString(),
      }

      const response = await fetch("/api/destinations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      })

      const result = await response.json()

      if (response.ok && result.destination) {
        setApiResult(result.destination)
      } else {
        setApiResult(null)
      }
    } catch (error) {
      console.error("API 호출 오류:", error)
      setApiResult(null)
    } finally {
      setApiLoading(false)
    }
  }

  const handleCountdownComplete = () => {
    setCountdownComplete(true)
  }

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto p-6 bg-white shadow-xl rounded-xl border-0">
        <div className="space-y-6">
          {/* 출발지 선택 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              출발지 선택
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {LOCATIONS.map((location) => (
                <Button
                  key={location}
                  variant={selectedLocation === location ? "default" : "outline"}
                  className={`text-sm h-10 ${
                    selectedLocation === location
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "border-gray-200 hover:bg-blue-50 hover:border-blue-300"
                  }`}
                  onClick={() => handleLocationSelect(location)}
                >
                  {location}
                </Button>
              ))}
            </div>
          </div>

          {/* 이동시간 설정 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              이동시간 설정
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">편도 이동시간</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {travelTime[0]}시간
                </Badge>
              </div>
              <Slider value={travelTime} onValueChange={setTravelTime} max={8} min={1} step={1} className="w-full" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1시간</span>
                <span>8시간</span>
              </div>
            </div>
          </div>

          {/* 교통수단 선택 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">교통수단 선택</h3>
            <Tabs value={transportMode} onValueChange={(value) => setTransportMode(value as "publicTransport" | "car")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="publicTransport" className="flex items-center gap-2">
                  <Bus className="h-4 w-4" />
                  대중교통
                </TabsTrigger>
                <TabsTrigger value="car" className="flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  자가용
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* 제주도 제외 옵션 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="excludeJeju"
                checked={excludeJeju}
                onCheckedChange={(checked) => setExcludeJeju(checked === true)}
              />
              <label
                htmlFor="excludeJeju"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                제주도 여행지 제외하기 (권장)
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2 ml-6">더 다양한 지역의 여행지를 추천받으려면 체크해주세요</p>
          </div>

          {/* 추천 받기 버튼 */}
          <Button
            onClick={handleSubmit}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold rounded-lg transition-colors"
            disabled={!selectedLocation}
          >
            여행지 추천 받기
          </Button>
        </div>
      </Card>

      <CountdownAnimation isActive={showCountdown} onComplete={handleCountdownComplete} />
    </>
  )
}
