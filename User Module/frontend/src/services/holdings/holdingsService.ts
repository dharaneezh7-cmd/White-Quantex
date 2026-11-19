import { springApi } from "@/services/api/client"
import { ApiResponse } from "@/types"

export type HoldingAssetType = "COMPANY" | "VENTURE" | "STOCK"

export interface HoldingItem {
  id: string
  assetId: string
  assetType: HoldingAssetType
  name: string
  symbol: string
  logoColor: string
  sector: string
  shares: number
  shareClass: string
  avgBuyPrice: number
  currentPrice: number
  costBasis: number
  currentValue: number
  unrealizedPl: number
  unrealizedPlPercent: number
  dayChangePercent?: number
  dayChangeAmount?: number
  monthChangePercent?: number
  monthChangeAmount?: number
  ownershipPercent?: number
  targetUrl: string
}

export interface HoldingsSummary {
  totalValue: number
  totalCostBasis: number
  totalUnrealizedPl: number
  totalUnrealizedPlPercent: number
  dayChangeAmount: number
  dayChangePercent: number
  monthChangeAmount: number
  monthChangePercent: number

  companiesValue: number
  companiesCount: number
  companiesPl: number
  companiesPlPercent: number
  companiesDayPl?: number
  companiesMonthPl?: number

  venturesValue: number
  venturesCount: number
  venturesPl: number
  venturesPlPercent: number
  venturesDayPl?: number
  venturesMonthPl?: number

  stocksValue: number
  stocksCount: number
  stocksPl: number
  stocksPlPercent: number
  stocksDayPl?: number
  stocksMonthPl?: number
}

export interface HoldingsResponse {
  summary: HoldingsSummary
  companies: HoldingItem[]
  ventures: HoldingItem[]
  stocks: HoldingItem[]
  all: HoldingItem[]
}

export const EMPTY_HOLDINGS: HoldingsResponse = {
  summary: {
    totalValue: 0,
    totalCostBasis: 0,
    totalUnrealizedPl: 0,
    totalUnrealizedPlPercent: 0,
    dayChangeAmount: 0,
    dayChangePercent: 0,
    monthChangeAmount: 0,
    monthChangePercent: 0,

    companiesValue: 0,
    companiesCount: 0,
    companiesPl: 0,
    companiesPlPercent: 0,
    companiesDayPl: 0,
    companiesMonthPl: 0,

    venturesValue: 0,
    venturesCount: 0,
    venturesPl: 0,
    venturesPlPercent: 0,
    venturesDayPl: 0,
    venturesMonthPl: 0,

    stocksValue: 0,
    stocksCount: 0,
    stocksPl: 0,
    stocksPlPercent: 0,
    stocksDayPl: 0,
    stocksMonthPl: 0,
  },
  companies: [],
  ventures: [],
  stocks: [],
  all: [],
}

export const holdingsService = {
  async getHoldings(): Promise<HoldingsResponse> {
    try {
      const res = await springApi.get<ApiResponse<HoldingsResponse>>("/holdings")
      if (res.data?.data && res.data.data.all && res.data.data.all.length > 0) {
        return res.data.data
      }
    } catch (e) {
      console.warn("Backend holdings query failed or returned no positions:", e)
    }

    // Check if user bought assets locally in this browser session
    if (typeof window !== "undefined") {
      try {
        const customCompRaw = localStorage.getItem("wq_corporate_positions")
        const customVentRaw = localStorage.getItem("wq_venture_positions")
        const localComp = customCompRaw ? JSON.parse(customCompRaw) : []
        const localVent = customVentRaw ? JSON.parse(customVentRaw) : []

        if (localComp.length > 0 || localVent.length > 0) {
          const companies: HoldingItem[] = localComp.map((p: any, idx: number) => {
            const shares = Number(p.shares) || 0
            const costBasis = Number(p.costBasis) || Number(p.totalAmount) || Number(p.amount) || 0
            const currentValue = Number(p.currentValue) || costBasis
            const unrealizedPl = currentValue - costBasis
            const unrealizedPlPercent = costBasis > 0 ? (unrealizedPl / costBasis) * 100 : 0
            const avgBuyPrice = shares > 0 ? costBasis / shares : 0
            const currentPrice = Number(p.currentPrice) || Number(p.pricePerShare) || avgBuyPrice

            return {
              id: p.id || `comp-${idx}`,
              assetId: p.companyId || p.ticker || `comp-${idx}`,
              assetType: "COMPANY",
              name: p.companyName || p.name || p.ticker || "Company",
              symbol: p.ticker || "WQ",
              logoColor: p.logoColor || "bg-indigo-600",
              sector: p.sector || "Delaware C-Corp",
              shares,
              shareClass: p.shareClass || "Class A Common Stock",
              avgBuyPrice,
              currentPrice,
              costBasis,
              currentValue,
              unrealizedPl,
              unrealizedPlPercent,
              dayChangePercent: 0,
              dayChangeAmount: 0,
              monthChangePercent: 0,
              monthChangeAmount: 0,
              ownershipPercent: Number(p.ownershipPercent) || 0,
              targetUrl: `/companies/${p.companyId || p.ticker}`,
            }
          })

          const ventures: HoldingItem[] = localVent.map((p: any, idx: number) => {
            const shares = Number(p.shares) || 0
            const costBasis = Number(p.costBasis) || Number(p.totalAmount) || Number(p.amount) || 0
            const currentValue = Number(p.currentValue) || costBasis
            const unrealizedPl = currentValue - costBasis
            const unrealizedPlPercent = costBasis > 0 ? (unrealizedPl / costBasis) * 100 : 0
            const avgBuyPrice = shares > 0 ? costBasis / shares : 0
            const currentPrice = Number(p.currentPrice) || Number(p.pricePerShare) || avgBuyPrice

            return {
              id: p.id || `vent-${idx}`,
              assetId: p.companyId || p.ticker || `vent-${idx}`,
              assetType: "VENTURE",
              name: p.companyName || p.name || p.ticker || "Venture Startup",
              symbol: p.ticker || "VNT",
              logoColor: p.logoColor || "bg-purple-600",
              sector: p.sector || "Venture Syndicate",
              shares,
              shareClass: p.shareClass || "Series Seed Preferred",
              avgBuyPrice,
              currentPrice,
              costBasis,
              currentValue,
              unrealizedPl,
              unrealizedPlPercent,
              dayChangePercent: 0,
              dayChangeAmount: 0,
              monthChangePercent: 0,
              monthChangeAmount: 0,
              ownershipPercent: Number(p.ownershipPercent) || 0,
              targetUrl: `/companies/${p.companyId || p.ticker}`,
            }
          })

          const all = [...companies, ...ventures]
          const totalVal = all.reduce((a, c) => a + c.currentValue, 0)
          const totalCost = all.reduce((a, c) => a + c.costBasis, 0)
          const totalPl = totalVal - totalCost
          const totalPlPct = totalCost > 0 ? (totalPl / totalCost) * 100 : 0

          const compVal = companies.reduce((a, c) => a + c.currentValue, 0)
          const compCost = companies.reduce((a, c) => a + c.costBasis, 0)
          const compPl = compVal - compCost
          const compPlPct = compCost > 0 ? (compPl / compCost) * 100 : 0

          const ventVal = ventures.reduce((a, c) => a + c.currentValue, 0)
          const ventCost = ventures.reduce((a, c) => a + c.costBasis, 0)
          const ventPl = ventVal - ventCost
          const ventPlPct = ventCost > 0 ? (ventPl / ventCost) * 100 : 0

          return {
            summary: {
              totalValue: totalVal,
              totalCostBasis: totalCost,
              totalUnrealizedPl: totalPl,
              totalUnrealizedPlPercent: totalPlPct,
              dayChangeAmount: 0,
              dayChangePercent: 0,
              monthChangeAmount: 0,
              monthChangePercent: 0,
              companiesValue: compVal,
              companiesCount: companies.length,
              companiesPl: compPl,
              companiesPlPercent: compPlPct,
              companiesDayPl: 0,
              companiesMonthPl: 0,
              venturesValue: ventVal,
              venturesCount: ventures.length,
              venturesPl: ventPl,
              venturesPlPercent: ventPlPct,
              venturesDayPl: 0,
              venturesMonthPl: 0,
              stocksValue: 0,
              stocksCount: 0,
              stocksPl: 0,
              stocksPlPercent: 0,
              stocksDayPl: 0,
              stocksMonthPl: 0,
            },
            companies,
            ventures,
            stocks: [],
            all,
          }
        }
      } catch (e) {
        console.warn("Failed to parse local purchased positions:", e)
      }
    }

    return EMPTY_HOLDINGS
  },
}
