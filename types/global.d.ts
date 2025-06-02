interface Window {
  Kakao?: {
    init: (appKey: string) => void
    isInitialized: () => boolean
    Share?: {
      sendDefault: (options: any) => void
    }
    maps?: any
  }
}
