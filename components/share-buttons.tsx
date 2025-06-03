"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Copy, MessageCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"

interface ShareButtonsProps {
  title: string
  destinationName: string
}

export default function ShareButtons({ title, destinationName }: ShareButtonsProps) {
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)

  // 클라이언트 사이드에서만 실행되도록 함
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href)
    toast({
      title: "URL이 복사되었습니다",
      description: "친구에게 공유할 수 있습니다.",
    })
  }

  const handleKakaoShare = () => {
    if (window.Kakao && window.Kakao.Share) {
      try {
        window.Kakao.Share.sendDefault({
          objectType: "feed",
          content: {
            title: title,
            description: `Trip Twister에서 ${destinationName}을(를) 추천받았어요!`,
            imageUrl: `${window.location.origin}/images/share-image.png`, // 공유용 이미지 경로
            link: {
              mobileWebUrl: window.location.href,
              webUrl: window.location.href,
            },
          },
          buttons: [
            {
              title: "여행지 확인하기",
              link: {
                mobileWebUrl: window.location.href,
                webUrl: window.location.href,
              },
            },
          ],
        })
      } catch (error) {
        console.error("카카오톡 공유 에러:", error)
        // 카카오 SDK 초기화 실패 시 대체 방법으로 URL 열기
        const kakaoShareUrl = `https://accounts.kakao.com/login/?continue=https://sharer.kakao.com/talk/friends/picker/link?app_key=87cf62c1a95e5582b7e342d76fbc8f96&text=${encodeURIComponent(
          `Trip Twister - ${destinationName} 여행지 추천`,
        )}&url=${encodeURIComponent(window.location.href)}`
        window.open(kakaoShareUrl, "_blank")
      }
    } else {
      // 카카오 SDK가 로드되지 않은 경우 대체 방법으로 URL 열기
      const kakaoShareUrl = `https://accounts.kakao.com/login/?continue=https://sharer.kakao.com/talk/friends/picker/link?app_key=87cf62c1a95e5582b7e342d76fbc8f96&text=${encodeURIComponent(
        `Trip Twister - ${destinationName} 여행지 추천`,
      )}&url=${encodeURIComponent(window.location.href)}`
      window.open(kakaoShareUrl, "_blank")
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2 py-6 border-blue-200 text-blue-600 hover:bg-blue-50 rounded-xl"
          onClick={handleCopyUrl}
        >
          <Copy className="h-5 w-5" />
          <span className="font-medium">URL 복사하기</span>
        </Button>
      </motion.div>

      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          className="w-full flex items-center justify-center gap-2 py-6 bg-yellow-400 hover:bg-yellow-500 text-black rounded-xl"
          onClick={handleKakaoShare}
        >
          <MessageCircle className="h-5 w-5" />
          <span className="font-medium">카카오톡 공유</span>
        </Button>
      </motion.div>
    </div>
  )
}
