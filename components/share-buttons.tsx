"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Copy, MessageCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"

interface ShareButtonsProps {
  title: string
  destinationName: string
  destinationId: string
}

export default function ShareButtons({ title, destinationName, destinationId }: ShareButtonsProps) {
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
    // 현재 URL의 기본 부분만 사용하고 destinationId만 추가
    const baseUrl = `${window.location.origin}/result`
    const shareUrl = `${baseUrl}?destinationId=${destinationId}`

    console.log("복사할 URL:", shareUrl)
    console.log("destinationId:", destinationId)

    navigator.clipboard.writeText(shareUrl)
    toast({
      title: "URL이 복사되었습니다",
      description: "친구에게 공유할 수 있습니다.",
    })
  }

  const handleKakaoShare = () => {
    const shareUrl = `${window.location.origin}/result?destinationId=${destinationId}`

    if (window.Kakao && window.Kakao.Share) {
      try {
        window.Kakao.Share.sendDefault({
          objectType: "feed",
          content: {
            title: title,
            description: `Trip Twister에서 ${destinationName}을(를) 추천받았어요!`,
            imageUrl: `${window.location.origin}/images/share-image.png`,
            link: {
              mobileWebUrl: shareUrl,
              webUrl: shareUrl,
            },
          },
          buttons: [
            {
              title: "여행지 확인하기",
              link: {
                mobileWebUrl: shareUrl,
                webUrl: shareUrl,
              },
            },
          ],
        })
      } catch (error) {
        console.error("카카오톡 공유 에러:", error)
        const kakaoShareUrl = `https://accounts.kakao.com/login/?continue=https://sharer.kakao.com/talk/friends/picker/link?app_key=87cf62c1a95e5582b7e342d76fbc8f96&text=${encodeURIComponent(
          `Trip Twister - ${destinationName} 여행지 추천`,
        )}&url=${encodeURIComponent(shareUrl)}`
        window.open(kakaoShareUrl, "_blank")
      }
    } else {
      const kakaoShareUrl = `https://accounts.kakao.com/login/?continue=https://sharer.kakao.com/talk/friends/picker/link?app_key=87cf62c1a95e5582b7e342d76fbc8f96&text=${encodeURIComponent(
        `Trip Twister - ${destinationName} 여행지 추천`,
      )}&url=${encodeURIComponent(shareUrl)}`
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
