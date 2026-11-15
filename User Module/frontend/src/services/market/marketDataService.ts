import { springApi } from "../api/client"

export interface PricePoint {
  timestamp: string
  price: number
  volume?: number
}

export interface MarketHistoryResponse {
  instrumentId: string
  symbol: string
  companyName: string
  currency: string
  range: "1D" | "1M" | "1Y" | "5Y" | "ALL"
  interval: string
  dataStatus: "LIVE" | "DELAYED" | "HISTORICAL" | "SIMULATED" | "UNAVAILABLE"
  source: string
  lastUpdated: string
  currentPrice: number
  periodStartPrice: number
  periodChange: number
  periodChangePercent: number
  periodHigh: number
  periodLow: number
  totalVolume: number
  pointCount: number
  points: PricePoint[]
}

export interface MarketStatistics {
  symbol: string
  currentPrice: number
  dayOpen: number
  dayHigh: number
  dayLow: number
  prevClose: number
  changeAmount: number
  changePercent: number
  high52w: number
  low52w: number
  volume: number
  marketCap: string
  peRatio: string
  beta: string
  currency: string
  marketStatus: string
  exchange: string
}

export interface MarketDataStatus {
  symbol: string
  status: string
  provider: string
  lastUpdated: string
  isTradingOpen: boolean
  exchange: string
  message: string
}

export const marketDataService = {
  async getLatestPrice(symbol: string): Promise<any> {
    const res = await springApi.get<{ success: boolean; data: any }>(
      `/v1/market-data/instruments/${encodeURIComponent(symbol)}/latest`
    )
    return res.data?.data
  },

  async getHistory(
    symbol: string,
    range: "1D" | "1M" | "1Y" | "5Y" | "ALL" = "1M"
  ): Promise<MarketHistoryResponse> {
    const res = await springApi.get<{ success: boolean; data: MarketHistoryResponse }>(
      `/v1/market-data/instruments/${encodeURIComponent(symbol)}/history`,
      { params: { range } }
    )
    return res.data?.data
  },

  async getStatistics(symbol: string): Promise<MarketStatistics> {
    const res = await springApi.get<{ success: boolean; data: MarketStatistics }>(
      `/v1/market-data/instruments/${encodeURIComponent(symbol)}/statistics`
    )
    return res.data?.data
  },

  async getStatus(symbol: string): Promise<MarketDataStatus> {
    const res = await springApi.get<{ success: boolean; data: MarketDataStatus }>(
      `/v1/market-data/instruments/${encodeURIComponent(symbol)}/status`
    )
    return res.data?.data
  },
}
