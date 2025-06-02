import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase 환경 변수가 설정되지 않았습니다")
  throw new Error("Supabase 환경 변수가 필요합니다")
}

export const supabase = createClient(supabaseUrl, supabaseKey)
