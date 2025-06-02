"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Destination } from "@/types/destination"

interface ErrorReportModalProps {
  isOpen: boolean
  onClose: () => void
  destination: Destination
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function ErrorReportModal({ isOpen, onClose, destination, searchParams }: ErrorReportModalProps) {
  const { toast } = useToast()
  const [errorType, setErrorType] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!errorType || !description.trim()) {
      toast({
        title: "필수 항목을 입력해주세요",
        description: "오류 유형과 상세 설명을 모두 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // 구글폼 URL - 실제 구글폼 ID로 교체해야 합니다
      const GOOGLE_FORM_ID = "@구글폼ID입력@" // 실제 구글폼 ID로 교체

      // 구글폼 필드 entry ID들 - 실제 구글폼의 entry ID로 교체해야 합니다
      const formData = new URLSearchParams({
        "entry.@여행지명필드ID입력@": destination.name, // 여행지명 필드
        "entry.@주소필드ID입력@": destination.address, // 주소 필드
        "entry.@오류유형필드ID입력@": errorType, // 오류유형 필드
        "entry.@상세설명필드ID입력@": description, // 상세설명 필드
        "entry.@출발지필드ID입력@": searchParams.location as string, // 출발지 필드
        "entry.@검색조건필드ID입력@": JSON.stringify(searchParams), // 검색조건 필드
        "entry.@페이지URL필드ID입력@": window.location.href, // 페이지URL 필드
        "entry.@신고시간필드ID입력@": new Date().toLocaleString("ko-KR"), // 신고시간 필드
      })

      // 구글폼 URL 생성
      const googleFormUrl = `https://docs.google.com/forms/d/e/${GOOGLE_FORM_ID}/viewform?${formData.toString()}`

      // 새 창에서 구글폼 열기
      window.open(googleFormUrl, "_blank", "width=800,height=600")

      toast({
        title: "오류 신고 페이지가 열렸습니다",
        description: "새 창에서 구글폼을 작성해주세요. 소중한 의견 감사합니다.",
      })

      onClose()
      setErrorType("")
      setDescription("")
    } catch (error) {
      console.error("구글폼 열기 실패:", error)
      toast({
        title: "페이지 열기에 실패했습니다",
        description: "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white rounded-xl shadow-xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <h2 className="text-lg font-semibold text-gray-800">오류 신고</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>여행지:</strong> {destination.name}
            </p>
            <p className="text-sm text-gray-600">
              <strong>주소:</strong> {destination.address}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="errorType" className="text-sm font-medium text-gray-700">
                오류 유형 *
              </Label>
              <Select value={errorType} onValueChange={setErrorType}>
                <SelectTrigger id="errorType" className="mt-1">
                  <SelectValue placeholder="오류 유형을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="잘못된 이미지">잘못된 이미지</SelectItem>
                  <SelectItem value="잘못된 주소">잘못된 주소</SelectItem>
                  <SelectItem value="잘못된 설명">잘못된 설명</SelectItem>
                  <SelectItem value="잘못된 이동시간">잘못된 이동시간</SelectItem>
                  <SelectItem value="오래된 정보">오래된 정보</SelectItem>
                  <SelectItem value="기타">기타</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                상세 설명 *
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="어떤 부분이 잘못되었는지 자세히 설명해주세요..."
                className="mt-1 min-h-[100px]"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">{description.length}/500자</p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isSubmitting ? "페이지 여는 중..." : "구글폼으로 신고하기"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                취소
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}
