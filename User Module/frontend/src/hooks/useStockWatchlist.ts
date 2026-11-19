import { useState, useEffect, useCallback } from "react"

const STORAGE_KEY = "wq_market_watchlist"
const LEGACY_STORAGE_KEY = "wq_corporate_watchlist"

export function useStockWatchlist() {
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    if (typeof window === "undefined") return []
    try {
      const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return Array.isArray(parsed) ? parsed.map((s) => String(s).toUpperCase()) : []
      }
    } catch {
      // fallback
    }
    return ["HETH", "GGRID", "ZEROP"]
  })

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist))
    } catch {
      // ignore
    }
  }, [watchlist])

  const isWatched = useCallback(
    (symbol: string) => {
      if (!symbol) return false
      return watchlist.includes(symbol.toUpperCase().trim())
    },
    [watchlist]
  )

  const toggleWatchlist = useCallback((symbol: string) => {
    if (!symbol) return
    const clean = symbol.toUpperCase().trim()
    setWatchlist((prev) => {
      const next = prev.includes(clean) ? prev.filter((s) => s !== clean) : [...prev, clean]
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // ignore
      }
      return next
    })
  }, [])

  return {
    watchlist,
    isWatched,
    toggleWatchlist,
  }
}
