import Database from "better-sqlite3"
import path from "path"
import type { Destination, SearchParams } from "@/types/destination"

// 데이터베이스 연결
const dbPath = path.join(process.cwd(), "lib", "data.db")
let db: any = null

try {
  db = new Database(dbPath, { readonly: true })
  console.log("데이터베이스 연결 성공:", dbPath)

  // 테이블 구조 확인
  const tableInfo = db.prepare("PRAGMA table_info(datatable)").all()
  console.log(
    "테이블 구조:",
    tableInfo.map((col: any) => col.name),
  )

  // 출발지 값 확인
  const locations = db.prepare("SELECT DISTINCT departure_location FROM datatable").all()
  console.log(
    "사용 가능한 출발지:",
    locations.map((loc: any) => loc.departure_location),
  )
} catch (error) {
  console.error("데이터베이스 연결 오류:", error)
}

// 여행지 검색 함수
export function getDestinationByParams(params: SearchParams): Destination | null {
  try {
    if (!db) {
      console.error("데이터베이스 연결이 없습니다.")
      return null
    }

    const { location, minTravelTime, maxTravelTime, transportMode, excludeId, excludeJeju } = params
    console.log("검색 조건:", { location, minTravelTime, maxTravelTime, transportMode, excludeId, excludeJeju })

    // 교통수단에 따른 시간 컬럼 선택
    const timeColumn = transportMode === "car" ? "drive_time" : "drive_time"

    let query = `
      SELECT rowid, * FROM datatable 
      WHERE departure_location = ? 
      AND ${timeColumn} >= ? 
      AND ${timeColumn} <= ?
      AND ${timeColumn} IS NOT NULL
    `

    const queryParams: any[] = [location, minTravelTime, maxTravelTime]

    // 제주도 제외 옵션이 활성화된 경우
    if (excludeJeju === true || excludeJeju === "true") {
      query += ` AND is_jeju = 0`
      console.log("제주도 제외 조건 적용됨")
    }

    // 제외할 ID가 있는 경우
    if (excludeId) {
      query += ` AND rowid != ?`
      queryParams.push(excludeId)
    }

    query += ` ORDER BY RANDOM() LIMIT 1`

    console.log("실행 쿼리:", query)
    console.log("쿼리 파라미터:", queryParams)

    const stmt = db.prepare(query)
    const result = stmt.get(...queryParams) as any

    console.log("쿼리 결과:", result)

    if (!result) return null

    return {
      id: result.rowid,
      name: result.name,
      address: result.address,
      image: result.image,
      cluster: result.cluster,
      departure_location: result.departure_location,
      drive_time: result.drive_time,
      transit_time: result.transit_time,
      description: result.description,
    }
  } catch (error) {
    console.error("데이터베이스 조회 오류:", error)
    return null
  }
}

// 데이터베이스 연결 종료
export function closeDatabase() {
  if (db) {
    db.close()
    console.log("데이터베이스 연결 종료")
  }
}