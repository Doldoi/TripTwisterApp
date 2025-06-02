import type { Metadata } from "next"
import ResultPageClient from "./ResultPageClient"

export const metadata: Metadata = {
  title: "여행지 추천 결과 - Trip Twister",
  description: "Trip Twister에서 추천하는 여행지를 확인해보세요.",
}

export default async function ResultPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams
  return <ResultPageClient searchParams={resolvedParams} />
}
