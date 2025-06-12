import type React from "react";
import type { Metadata } from "next";
import { Inter, Fredoka as Fredoka_One } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Script from "next/script";
import { GoogleAnalytics } from "@next/third-parties/google";

const inter = Inter({ subsets: ["latin"] });
const fredoka = Fredoka_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-fredoka",
});

export const metadata: Metadata = {
  title: "Trip Twister - 랜덤 여행지 추천",
  description: "조건에 맞는 국내 여행지를 랜덤으로 추천해드리는 Trip Twister",
  keywords: "여행지 추천, 국내여행, 랜덤여행, 여행계획",
  openGraph: {
    title: "Trip Twister - 랜덤 여행지 추천",
    description: "조건에 맞는 국내 여행지를 랜덤으로 추천해드리는 Trip Twister",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${fredoka.variable}`}>
      <head>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID as string} />
        {/* Kakao SDK */}
        <Script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.5.0/kakao.min.js"
          integrity="sha384-kYPsUbBPlktXsY6/oNHSUDZoTX6+YI51f63jCPEIPFP09ttByAdxd2mEjKuhdqn4"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
        <Script id="kakao-init" strategy="afterInteractive">
          {`
            if (typeof window !== 'undefined' && window.Kakao && !window.Kakao.isInitialized()) {
              try {
                window.Kakao.init('${process.env.NEXT_PUBLIC_KAKAO_APP_KEY}');
              } catch (error) {
                console.error('카카오 SDK 초기화 실패:', error);
              }
            }
          `}
        </Script>

        {/* Google Analytics */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-LPBJPD1M6Y"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-LPBJPD1M6Y');
          `}
        </Script>
      </head>
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}