import { Suspense } from "react"
import TripForm from "@/components/trip-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Trip Twister - 랜덤 여행지 추천",
  description: "조건에 맞는 국내 여행지를 랜덤으로 추천해드리는 Trip Twister입니다.",
}

export default function Home() {
  return (
      <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-6xl font-fredoka text-transparent bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-600 bg-clip-text mb-4">
                Trip Twister
              </h1>
              <p className="text-gray-600 text-base md:text-lg">조건에 맞는 랜덤 여행지를 추천해드려요</p>
            </div>

            <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">여행 조건 입력</h2>
                    <p style={{ fontSize: '13px', color: '#888', marginTop: '1rem' }}>
                      Trip Twister는 출발 지역, 이동 시간, 교통 수단에 따라 여행지 정보를 랜덤으로 추천해주는 서비스입니다.
                      전국 여행지 10,000여 개의 사진과 설명, 이동 시간 정보를 제공하며, 추천 결과 페이지에서 자세히 확인할 수 있습니다.
                    </p>
                </div>
                <Suspense fallback={<div>로딩 중...</div>}>
                  <TripForm />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </main>
  )
}
