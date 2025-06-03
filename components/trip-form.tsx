"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
  const [travelTime, setTravelTime] = useState([2])
  const [transportMode, setTransportMode] = useState<"publicTransport" | "car">("publicTransport")
  const [excludeJeju, setExcludeJeju] = useState(true) // 기본값을 true로 변경
  const [showCountdown, setShowCountdown] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location)
  }

  const handleSubmit = () => {
    console.log("=== 폼 제출 시작 ===")
    console.log("선택된 출발지:", selectedLocation)

    if (!selectedLocation) {
      console.log("출발지가 선택되지 않음")
      toast({
        title: "출발지를 선택해주세요",
        description: "여행을 시작할 지역을 먼저 선택해주세요.",
        variant: "destructive",
      })
      return
    }

    console.log("카운트다운 시작")
    setShowCountdown(true)
  }

  const handleCountdownComplete = () => {
    console.log("=== 카운트다운 완료 ===")
    const params = new URLSearchParams({
      location: selectedLocation,
      minTravelTime: "0",
      maxTravelTime: travelTime[0].toString(),
      transportMode,
      excludeJeju: excludeJeju.toString(),
    })

    console.log("생성된 파라미터:", params.toString())
    console.log("이동할 URL:", `/result?${params.toString()}`)

    router.push(`/result?${params.toString()}`)
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
                제주도 여행지 제외하기
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
