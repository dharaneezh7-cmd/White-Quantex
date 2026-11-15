import { useState, useEffect, useSyncExternalStore } from "react"
import { springApi } from "@/services/api/client"

export interface LiveStockQuote {
  id?: string
  ticker: string
  name: string
  shortName: string
  sector: string
  logoColor: string
  price: number
  priceStr: string
  changePercent: number
  changePercentStr: string
  changeAmount: number
  changeAmountStr: string
  isPositive: boolean
  direction: "UP" | "DOWN" | "FLAT"
  high24h: number
  low24h: number
  high52w: number
  low52w: number
  volume: number
  volumeStr: string
  openPrice: number
  isVenture: boolean
  roundOrTier?: string
  lastUpdated?: string
}

export interface MarketIndex {
  symbol: string
  name: string
  value: number
  valueStr: string
  changePercent: number
  changeStr: string
  isPositive: boolean
  volume: string
}

export interface MarketUpdateEvent {
  tick: number
  timestamp: string
  indices: MarketIndex[]
  updates: Record<string, LiveStockQuote>
}

// ─────────────────────────────────────────────────────────────────────────────
// Global In-Memory Reactive Store (Shared between all tabs and pages)
// ─────────────────────────────────────────────────────────────────────────────
class MarketPriceStore {
  private quotes: Record<string, LiveStockQuote> = {}
  private indices: MarketIndex[] = [
    { symbol: "WQ100", name: "WQ Composite 100", value: 4892.4, valueStr: "4,892.40", changePercent: 1.24, changeStr: "+1.24%", isPositive: true, volume: "$1.48B" },
    { symbol: "WQAI", name: "WQ DeepTech AI Index", value: 6214.15, valueStr: "6,214.15", changePercent: 2.01, changeStr: "+2.01%", isPositive: true, volume: "$642.1M" },
    { symbol: "WQXF", name: "WQ Fintech 25", value: 3410.8, valueStr: "3,410.80", changePercent: -0.42, changeStr: "-0.42%", isPositive: false, volume: "$489.3M" },
    { symbol: "WQGRN", name: "WQ CleanEnergy", value: 1984.3, valueStr: "1,984.30", changePercent: 0.78, changeStr: "+0.78%", isPositive: true, volume: "$310.5M" },
  ]
  private flashStates: Record<string, "up" | "down"> = {}
  private isConnected = false
  private lastTick = 0
  private subscribers = new Set<() => void>()
  private eventSource: EventSource | null = null
  private pollTimer: any = null
  private flashClearTimer: any = null
  private initialized = false

  constructor() {
    if (typeof window !== "undefined") {
      this.initConnection()
    }
  }

  public subscribe(callback: () => void) {
    this.subscribers.add(callback)
    if (!this.initialized) {
      this.initConnection()
    }
    return () => {
      this.subscribers.delete(callback)
    }
  }

  public getSnapshot() {
    return {
      quotes: this.quotes,
      indices: this.indices,
      flashStates: this.flashStates,
      isConnected: this.isConnected,
      lastTick: this.lastTick,
    }
  }

  private notify() {
    this.subscribers.forEach((cb) => cb())
  }

  private initConnection() {
    if (this.initialized) return
    this.initialized = true

    // 1. Initial REST fetch for immediate instant data
    this.fetchRestSnapshot()

    // 2. Open Server-Sent Events (SSE) Stream
    this.connectSse()
  }

  private async fetchRestSnapshot() {
    try {
      const res = await springApi.get<{ data: Record<string, LiveStockQuote> }>("/market/prices")
      if (res.data?.data) {
        this.quotes = { ...this.quotes, ...res.data.data }
        this.notify()
      }
    } catch {
      // Backend might still be starting; polling will handle it
    }
  }

  private connectSse() {
    if (typeof window === "undefined") return

    try {
      // Connect through Vite proxy /api/spring/market/stream
      const sseUrl = "/api/spring/market/stream"
      this.eventSource = new EventSource(sseUrl)

      this.eventSource.addEventListener("open", () => {
        this.isConnected = true
        this.stopPolling()
        this.notify()
      })

      this.eventSource.addEventListener("market-init", (e: MessageEvent) => {
        try {
          const data: MarketUpdateEvent = JSON.parse(e.data)
          if (data.updates) {
            this.quotes = { ...this.quotes, ...data.updates }
          }
          if (data.indices && data.indices.length > 0) {
            this.indices = data.indices
          }
          this.lastTick = data.tick
          this.isConnected = true
          this.notify()
        } catch {
          // ignore parsing error
        }
      })

      this.eventSource.addEventListener("market-tick", (e: MessageEvent) => {
        try {
          const data: MarketUpdateEvent = JSON.parse(e.data)

          if (data.updates) {
            this.quotes = { ...this.quotes, ...data.updates }
          }

          if (data.indices && data.indices.length > 0) {
            this.indices = data.indices
          }

          this.lastTick = data.tick
          this.flashStates = {}
          this.notify()
        } catch {
          // ignore parsing error
        }
      })

      this.eventSource.addEventListener("error", () => {
        this.isConnected = false
        if (this.eventSource) {
          this.eventSource.close()
          this.eventSource = null
        }
        this.notify()
        this.startPolling()
        // Retry SSE in 5s
        setTimeout(() => {
          this.connectSse()
        }, 5000)
      })
    } catch {
      this.startPolling()
    }
  }

  private startPolling() {
    if (this.pollTimer) return
    this.pollTimer = setInterval(async () => {
      try {
        const res = await springApi.get<{ data: Record<string, LiveStockQuote> }>("/market/prices")
        if (res.data?.data) {
          this.quotes = { ...this.quotes, ...res.data.data }
          this.notify()
        }
      } catch {
        // quiet retry
      }
    }, 2500)
  }

  private stopPolling() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer)
      this.pollTimer = null
    }
  }

  public getQuote(ticker: string | undefined): LiveStockQuote | undefined {
    if (!ticker) return undefined
    return this.quotes[ticker.toUpperCase()]
  }
}

// Global Singleton Instance
export const marketStore = new MarketPriceStore()

/**
 * Custom React Hook that automatically subscribes to Spring Boot real-time live prices
 */
export function useMarketPrices() {
  const [state, setState] = useState(() => marketStore.getSnapshot())

  useEffect(() => {
    return marketStore.subscribe(() => {
      setState(marketStore.getSnapshot())
    })
  }, [])

  return {
    ...state,
    getQuote: (ticker: string | undefined) => marketStore.getQuote(ticker),
  }
}
