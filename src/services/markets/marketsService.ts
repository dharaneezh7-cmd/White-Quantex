import { springApi } from "@/services/api/client"
import { Market, ApiResponse } from "@/types"

export const marketsService = {
  async getMarkets(): Promise<Market[]> {
    const res = await springApi.get<ApiResponse<Market[]>>("/markets")
    return res.data.data
  },

  async getMarketBySymbol(symbol: string): Promise<Market> {
    const res = await springApi.get<ApiResponse<Market>>(`/markets/${symbol}`)
    return res.data.data
  },
}
