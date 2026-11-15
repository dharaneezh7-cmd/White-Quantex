import { springApi } from "@/services/api/client"
import { ApiResponse, PagedResponse } from "@/types"
import {
  type VentureOpportunity,
  MOCK_VENTURE_OPPORTUNITIES,
  REGISTERED_VENTURES_LIST,
  VENTURE_POSITIONS,
  VENTURE_ORDERS,
  VENTURE_NEWS,
  getRegisteredVentures,
  getVenturesOverview,
  getCompanyInvestmentDetails,
} from "./ventureData"

export interface CategoryCompany {
  id: string
  rank?: number
  name: string
  shortName: string
  ticker: string
  logoText: string
  logoBg: string
  sector: string
  metricLabel?: string
  metricValue?: string
  subMetric?: string
  change?: string
  isPositive?: boolean
  valuation?: string
  investedToday?: string
  percentFunded?: number
  volume?: string
  cik?: string
  minInvestment?: string
  minInvestmentNum?: number
  fundingPurpose?: string
  targetRaise?: string
  roundType?: string
}

export interface CompanySummary {
  id: string
  ticker: string
  name: string
  shortName: string
  legalEntity: string
  cik: string
  sector: string
  subIndustry: string
  headquarters: string
  region: string
  foundedYear: number
  ceo: string
  employees: number
  valuation: string
  valuationNum: number
  annualRevenue: string
  annualRevenueNum: number
  verificationLevel: string
  trustScore: number
  description: string
  logoColor: string
  status: string
  exchangeTier: string
  change24h?: string
  changePercent?: number
  isPositive?: boolean
  marketCapGainLoss?: string
  investedToday?: string
  allocationPercent?: number
  tradingVolumeToday?: string
  minInvestment?: string
  minInvestmentNum?: number
  fundingPurpose?: string
  targetRaise?: string
  targetRaiseNum?: number
  raisedAmount?: string
  raisedAmountNum?: number
  roundType?: string
  securityType?: string
}

export interface UpcomingCompany {
  id: string
  name: string
  shortName: string
  ticker: string
  sector: string
  targetValuation: string
  expectedDate: string
  readiness: string
  trustScore: number
  description: string
  logoBg: string
  legalEntity: string
  headquarters: string
  ceo: string
  displayOrder?: number
}

export interface WqRecommendation {
  id: string
  name: string
  shortName: string
  ticker: string
  sector: string
  rating: "Strong Buy" | "Top Pick" | "High Conviction" | "Growth Outperformer" | "Value Buy" | string
  upside: string
  quantScore: number
  valuation: string
  annualRevenue: string
  thesis: string
  logoBg: string
  legalEntity: string
  cik: string
  ceo: string
  displayOrder?: number
}

export interface MutualScheme {
  id: string
  code: string
  name: string
  strategy: string
  nav: string
  oneYearReturn: string
  minInvestment: string
  aum: string
  riskLevel: "Low" | "Low-Medium" | "Moderate" | "Medium-High" | "High" | string
  manager: string
  topHoldings: string[]
  description: string
  benchmark: string
  expenseRatio: string
  displayOrder?: number
}

export interface ExploreOverview {
  recentlyViewed: CategoryCompany[]
  todaysMostInvested: CategoryCompany[]
  todaysLeastInvested: CategoryCompany[]
  todaysTopGainers: CategoryCompany[]
  todaysTopLosers: CategoryCompany[]
  todaysMostActive: CategoryCompany[]
  todays52wHighs: CategoryCompany[]
  recentlyAdded: CompanySummary[]
  upcomingCompanies?: UpcomingCompany[]
  wqRecommendations?: WqRecommendation[]
  mutualInvestmentSchemes?: MutualScheme[]
  totalRegisteredCompanies: number
  aggregateValuation?: string
  aggregateValuationNum?: number
  legalEntitiesRatio?: string
  averageTrustScore?: string
  averageTrustScoreNum?: number
}

export interface CorporatePosition {
  id: string
  companyId: string
  companyName: string
  ticker: string
  logoColor: string
  sector: string
  shares: number
  shareClass: string
  costBasis: number
  currentValue: number
  unrealizedPl: number
  unrealizedPlPercent: number
  ownershipPercent: number
}

export interface CorporateOrder {
  id: string
  companyId: string
  companyName: string
  ticker: string
  logoColor: string
  orderNumber: string
  type: string
  shareClass: string
  shares: number
  pricePerShare: number
  totalAmount: number
  status: string
  settlementStatus: string
  executedAt: string
}

export interface CorporateNews {
  id: string
  companyId: string
  companyName: string
  ticker: string
  logoColor: string
  category: string
  title: string
  snippet: string
  sentiment: string
  impactMetric?: string
  source: string
  readTime?: string
  urgency?: string
  dueDate?: string
  isActionRequired: boolean
  actionLabel?: string
  actionType?: string
  publishedAt: string
}

export interface CompanySearchParams {
  query?: string
  sector?: string
  tier?: string
  minValuation?: number
  maxValuation?: number
  letter?: string
  sortBy?: string
  sortDirection?: "asc" | "desc"
  page?: number
  size?: number
}

export const exploreService = {
  // ── Explore Overview (Corporate Companies) ──────────────────────────────
  async getOverview(): Promise<ExploreOverview> {
    try {
      const res = await springApi.get<ApiResponse<ExploreOverview>>("/explore/overview")
      if (res.data?.data) {
        return res.data.data
      }
    } catch {
      // Fallback
    }
    return {
      recentlyViewed: [],
      todaysMostInvested: [],
      todaysLeastInvested: [],
      todaysTopGainers: [],
      todaysTopLosers: [],
      todaysMostActive: [],
      todays52wHighs: [],
      recentlyAdded: [],
      upcomingCompanies: [],
      wqRecommendations: [],
      mutualInvestmentSchemes: [],
      totalRegisteredCompanies: 0,
    }
  },

  // ── Explore Companies (Corporate Issuers) ───────────────────────────────
  async getCompanies(params: CompanySearchParams = {}): Promise<PagedResponse<CompanySummary>> {
    let result: PagedResponse<CompanySummary>
    try {
      const res = await springApi.get<ApiResponse<PagedResponse<CompanySummary>>>("/explore/companies", {
        params,
      })
      result = res.data.data
    } catch {
      result = {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: params.size || 25,
        number: params.page || 0,
        first: true,
        last: true,
      }
    }

    // Merge any dynamically registered corporate companies from Company Module (localStorage)
    if (typeof window !== "undefined") {
      try {
        const savedCompaniesStr = localStorage.getItem("wq_registered_companies")
        if (savedCompaniesStr) {
          const savedCompanies: CompanySummary[] = JSON.parse(savedCompaniesStr)
          if (Array.isArray(savedCompanies) && savedCompanies.length > 0) {
            const existingIds = new Set(result.content.map((c) => c.id))
            const existingTickers = new Set(result.content.map((c) => c.ticker.toUpperCase()))
            const newEntries = savedCompanies.filter(
              (c) => !existingIds.has(c.id) && !existingTickers.has(c.ticker.toUpperCase())
            )
            result.content = [...newEntries, ...result.content]
            result.totalElements += newEntries.length
          }
        }
      } catch {}
    }

    return result
  },

  // ── Company / Venture Dossier Detail ─────────────────────────────────────
  async getCompanyById(id: string): Promise<CompanySummary> {
    try {
      const res = await springApi.get<ApiResponse<CompanySummary>>(`/explore/companies/${encodeURIComponent(id)}`)
      if (res.data?.data) {
        return res.data.data
      }
    } catch {
      // Fallback
    }

    const cleanId = id.toUpperCase().trim()

    // 1. Check browser dynamic registrations
    if (typeof window !== "undefined") {
      try {
        const savedVenturesStr = localStorage.getItem("wq_registered_ventures")
        if (savedVenturesStr) {
          const savedVentures: CompanySummary[] = JSON.parse(savedVenturesStr)
          const matched = savedVentures.find(
            (v) =>
              v.id === id ||
              v.ticker.toUpperCase() === cleanId ||
              v.cik.toUpperCase() === cleanId ||
              v.name.toLowerCase() === id.toLowerCase()
          )
          if (matched) return matched
        }
        const savedCompaniesStr = localStorage.getItem("wq_registered_companies")
        if (savedCompaniesStr) {
          const savedCompanies: CompanySummary[] = JSON.parse(savedCompaniesStr)
          const matched = savedCompanies.find(
            (c) =>
              c.id === id ||
              c.ticker.toUpperCase() === cleanId ||
              c.cik.toUpperCase() === cleanId ||
              c.name.toLowerCase() === id.toLowerCase()
          )
          if (matched) return matched
        }
      } catch {}
    }

    throw new Error(`Corporate/Venture issuer not found: ${id}`)
  },

  // ── Ventures & Start-ups Directory (Completely Independent from Companies) ──
  async getVentures(params: CompanySearchParams = {}): Promise<PagedResponse<CompanySummary>> {
    try {
      const res = await springApi.get<ApiResponse<PagedResponse<CompanySummary>>>("/explore/ventures", {
        params,
      })
      if (res.data?.data?.content && res.data.data.content.length > 0) {
        return res.data.data
      }
    } catch {
      // Fallback
    }
    return getRegisteredVentures(params)
  },

  // ── Ventures Overview Metrics ────────────────────────────────────────────
  async getVenturesOverview(): Promise<ExploreOverview> {
    try {
      const res = await springApi.get<ApiResponse<ExploreOverview>>("/explore/ventures/overview")
      if (res.data?.data) {
        return res.data.data
      }
    } catch {
      // Fallback
    }
    return getVenturesOverview()
  },

  // ── Ventures Portfolio Positions ─────────────────────────────────────────
  async getVenturePositions(): Promise<CorporatePosition[]> {
    try {
      const res = await springApi.get<ApiResponse<CorporatePosition[]>>("/explore/ventures/positions")
      if (res.data?.data && res.data.data.length > 0) {
        return res.data.data
      }
    } catch {
      // Fallback to real user investments in localStorage
    }
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("wq_venture_positions")
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) return parsed
        }
      } catch {}
    }
    return []
  },

  // ── Ventures Order Book ──────────────────────────────────────────────────
  async getVentureOrders(status = "ALL"): Promise<CorporateOrder[]> {
    try {
      const res = await springApi.get<ApiResponse<CorporateOrder[]>>(`/explore/ventures/orders?status=${status}`)
      if (res.data?.data && res.data.data.length > 0) {
        return res.data.data
      }
    } catch {
      // Fallback to real user orders in localStorage
    }
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("wq_venture_orders")
        if (saved) {
          const parsed: CorporateOrder[] = JSON.parse(saved)
          if (Array.isArray(parsed)) {
            return status === "ALL" ? parsed : parsed.filter((o) => o.status === status)
          }
        }
      } catch {}
    }
    return []
  },

  // ── Ventures News & Notifications ────────────────────────────────────────
  async getVentureNews(ticker = "ALL", category = "ALL"): Promise<CorporateNews[]> {
    try {
      const res = await springApi.get<ApiResponse<CorporateNews[]>>(
        `/explore/ventures/news?ticker=${ticker}&category=${category}`
      )
      if (res.data?.data && res.data.data.length > 0) {
        return res.data.data
      }
    } catch {
      // Fallback
    }
    return []
  },

  // ── Corporate Positions (Explore) ────────────────────────────────────────
  async getPositions(): Promise<CorporatePosition[]> {
    try {
      const res = await springApi.get<ApiResponse<CorporatePosition[]>>("/explore/positions")
      if (res.data?.data) {
        return res.data.data
      }
    } catch {}
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("wq_corporate_positions")
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) return parsed
        }
      } catch {}
    }
    return []
  },

  // ── Corporate Orders (Explore) ───────────────────────────────────────────
  async getOrders(status = "ALL"): Promise<CorporateOrder[]> {
    try {
      const res = await springApi.get<ApiResponse<CorporateOrder[]>>(`/explore/orders?status=${status}`)
      if (res.data?.data) {
        return res.data.data
      }
    } catch {}
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("wq_corporate_orders")
        if (saved) {
          const parsed: CorporateOrder[] = JSON.parse(saved)
          if (Array.isArray(parsed)) {
            return status === "ALL" ? parsed : parsed.filter((o) => o.status === status)
          }
        }
      } catch {}
    }
    return []
  },

  // ── Corporate News (Explore) ─────────────────────────────────────────────
  async getNews(ticker = "ALL", category = "ALL"): Promise<CorporateNews[]> {
    try {
      const res = await springApi.get<ApiResponse<CorporateNews[]>>(
        `/explore/news?ticker=${ticker}&category=${category}`
      )
      if (res.data?.data) {
        return res.data.data
      }
    } catch {}
    return []
  },

  // ── Upcoming Companies ───────────────────────────────────────────────────
  async getUpcomingCompanies(): Promise<UpcomingCompany[]> {
    try {
      const res = await springApi.get<ApiResponse<UpcomingCompany[]>>("/explore/upcoming")
      return res.data?.data || []
    } catch {
      return []
    }
  },

  // ── WQ Recommendations ───────────────────────────────────────────────────
  async getRecommendations(): Promise<WqRecommendation[]> {
    try {
      const res = await springApi.get<ApiResponse<WqRecommendation[]>>("/explore/recommendations")
      return res.data?.data || []
    } catch {
      return []
    }
  },

  // ── Mutual Investment Schemes ────────────────────────────────────────────
  async getMutualSchemes(): Promise<MutualScheme[]> {
    try {
      const res = await springApi.get<ApiResponse<MutualScheme[]>>("/explore/schemes")
      return res.data?.data || []
    } catch {
      return []
    }
  },

  async getSchemeById(identifier: string): Promise<MutualScheme> {
    try {
      const res = await springApi.get<ApiResponse<MutualScheme>>(`/explore/schemes/${identifier}`)
      if (res.data?.data) {
        return res.data.data
      }
    } catch {}
    throw new Error(`Mutual Scheme not found: ${identifier}`)
  },

  async recordRecentlyViewed(tickerOrId: string): Promise<void> {
    try {
      await springApi.post(`/explore/recently-viewed/${encodeURIComponent(tickerOrId)}`)
    } catch {
      // Non-blocking telemetry
    }
  },

  async getVentureOpportunities(): Promise<VentureOpportunity[]> {
    try {
      const res = await springApi.get<ApiResponse<VentureOpportunity[]>>("/explore/ventures")
      if (res.data?.data && res.data.data.length > 0) {
        return res.data.data
      }
    } catch {
      // Fallback
    }
    if (typeof window !== "undefined") {
      try {
        const savedStr = localStorage.getItem("wq_registered_ventures")
        if (savedStr) {
          const saved: CompanySummary[] = JSON.parse(savedStr)
          if (Array.isArray(saved) && saved.length > 0) {
            return saved.map((v) => ({
              id: v.id,
              ticker: v.ticker,
              name: v.name,
              shortName: v.shortName,
              legalEntity: v.legalEntity,
              sector: v.sector,
              subIndustry: v.subIndustry,
              headquarters: v.headquarters,
              ceo: v.ceo,
              logoColor: v.logoColor,
              valuation: v.valuation,
              valuationNum: v.valuationNum,
              roundType: v.roundType || "Capital Raise",
              targetRaise: v.targetRaise || "$10,000,000",
              targetRaiseNum: v.targetRaiseNum || 10000000,
              raisedAmount: v.raisedAmount || "$5,000,000",
              raisedAmountNum: v.raisedAmountNum || 5000000,
              percentFunded: v.allocationPercent || 50,
              minInvestment: v.minInvestment || "$25,000",
              minInvestmentNum: v.minInvestmentNum || 25000,
              fundingPurpose: v.fundingPurpose || v.description,
              investorCount: 10,
              daysRemaining: 45,
              securityType: v.securityType || "Delaware C-Corp Preferred Equity",
              verificationLevel: (v.verificationLevel as any) || "GOLD",
              useOfFunds: [
                { label: "Engineering & Product R&D", percent: 45 },
                { label: "Go-to-Market Expansion", percent: 35 },
                { label: "Working Capital & Reserve", percent: 20 },
              ],
              keyMilestones: [
                "Delaware corporate filing completed",
                "SEC Reg D compliance registration initiated",
              ],
            }))
          }
        }
      } catch {}
    }
    return []
  },
}

export type { VentureOpportunity } from "./ventureData"
export {
  MOCK_VENTURE_OPPORTUNITIES,
  REGISTERED_VENTURES_LIST,
  VENTURE_POSITIONS,
  VENTURE_ORDERS,
  VENTURE_NEWS,
  getRegisteredVentures,
  getVenturesOverview,
  getCompanyInvestmentDetails,
} from "./ventureData"
