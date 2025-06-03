import type React from "react"
import type { Metadata } from "next"
import { Inter, Fredoka as Fredoka_One } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })
const fredoka = Fredoka_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-fredoka",
})

export const metadata: Metadata = {
  title: "Trip Twister - 랜덤 여행지 추천",
  description: "조건에 맞는 국내 여행지를 랜덤으로 추천해드리는 Trip Twister",
  keywords: "여행지 추천, 국내여행, 랜덤여행, 여행계획",
  openGraph: {
    title: "Trip Twister - 랜덤 여행지 추천",
    description: "조건에 맞는 국내 여행지를 랜덤으로 추천해드리는 Trip Twister",
    type: "website",
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className={`${fredoka.variable}`}>
      <head>
        <Script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.5.0/kakao.min.js"
          integrity="sha384-kYPsUbBPlktXsY6/oNHSUDZoTX6+YI51f63jCPEIPFP09ttByAdxd2mEjKuhdqn4"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
        <Script id="kakao-init">
          {`
            if (window.Kakao && !window.Kakao.isInitialized()) {
              window.Kakao.init('${process.env.NEXT_PUBLIC_KAKAO_APP_KEY}');
            }
          `}
        </Script>
      </head>
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
