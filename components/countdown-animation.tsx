"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface CountdownAnimationProps {
  onComplete: () => void
  isActive: boolean
}

export default function CountdownAnimation({ onComplete, isActive }: CountdownAnimationProps) {
  const [count, setCount] = useState(3)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const isRunningRef = useRef(false)

  // 카운트다운 로직
  useEffect(() => {
    // isActive가 true로 변경될 때만 카운트다운 시작
    if (isActive && !isRunningRef.current) {
      // 초기 상태로 리셋
      setCount(3)
      isRunningRef.current = true

      // 카운트다운 함수 정의
      const countdownTimer = () => {
        // 3초 카운트다운 (각 1초씩)
        timerRef.current = setTimeout(() => {
          setCount(2)

          timerRef.current = setTimeout(() => {
            setCount(1)

            timerRef.current = setTimeout(() => {
              isRunningRef.current = false
              onComplete()
            }, 1000)
          }, 1000)
        }, 1000)
      }

      // 카운트다운 시작
      countdownTimer()
    }

    // 컴포넌트 언마운트 또는 isActive가 false로 변경될 때 타이머 정리
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      // isActive가 false로 변경되면 실행 상태도 리셋
      if (!isActive) {
        isRunningRef.current = false
      }
    }
  }, [isActive, onComplete])

  // isActive가 false면 아무것도 렌더링하지 않음
  if (!isActive) return null

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center z-50">
      <AnimatePresence mode="wait" initial={false}>
        {count > 0 ? (
          <motion.div
            key={`count-${count}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{
              opacity: { duration: 0.15 },
              scale: { duration: 0.15 },
            }}
            className="relative"
          >
            <motion.div
              className="text-white text-8xl md:text-9xl font-bold"
              style={{
                textShadow: "0 0 20px rgba(255,255,255,0.5)",
                WebkitTextStroke: "1px rgba(255,255,255,0.2)",
              }}
            >
              {count}
            </motion.div>
            <motion.div
              className="absolute -inset-8 rounded-full border-4 border-white/30"
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.15 }}
            />
            <motion.div
              className="absolute -inset-16 rounded-full border border-white/10"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{
              opacity: { duration: 0.15 },
              scale: { duration: 0.15 },
            }}
            className="flex flex-col items-center"
          >
            <motion.div
              className="relative w-20 h-20"
              animate={{ rotate: 360 }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            >
              <div className="absolute inset-0 rounded-full border-4 border-t-4 border-white opacity-20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-4 border-white border-opacity-80"></div>
              <div
                className="absolute inset-0 rounded-full border-4 border-t-4 border-blue-300 border-opacity-80"
                style={{ clipPath: "polygon(0 0, 50% 0, 50% 50%, 0 50%)" }}
              ></div>
              <div
                className="absolute inset-0 rounded-full border-4 border-t-4 border-blue-400 border-opacity-80"
                style={{ clipPath: "polygon(50% 0, 100% 0, 100% 50%, 50% 50%)" }}
              ></div>
            </motion.div>
            <motion.div
              className="text-white text-2xl md:text-3xl font-bold mt-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
            >
              여행지 찾는 중...
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
