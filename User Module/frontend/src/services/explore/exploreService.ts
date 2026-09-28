import { springApi } from "@/services/api/client"
import { ApiResponse, PagedResponse } from "@/types"

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
  async getOverview(): Promise<ExploreOverview> {
    const res = await springApi.get<ApiResponse<ExploreOverview>>("/explore/overview")
    return res.data.data
  },

  async getCompanies(params: CompanySearchParams = {}): Promise<PagedResponse<CompanySummary>> {
    const res = await springApi.get<ApiResponse<PagedResponse<CompanySummary>>>("/explore/companies", {
      params,
    })
    return res.data.data
  },

  async getCompanyById(id: string): Promise<CompanySummary> {
    const res = await springApi.get<ApiResponse<CompanySummary>>(`/explore/companies/${id}`)
    return res.data.data
  },

  async getPositions(): Promise<CorporatePosition[]> {
    const res = await springApi.get<ApiResponse<CorporatePosition[]>>("/explore/positions")
    return res.data.data
  },

  async getOrders(status = "ALL"): Promise<CorporateOrder[]> {
    const res = await springApi.get<ApiResponse<CorporateOrder[]>>(`/explore/orders?status=${status}`)
    return res.data.data
  },

  async getNews(ticker = "ALL", category = "ALL"): Promise<CorporateNews[]> {
    const res = await springApi.get<ApiResponse<CorporateNews[]>>(
      `/explore/news?ticker=${ticker}&category=${category}`
    )
    return res.data.data
  },

  async getUpcomingCompanies(): Promise<UpcomingCompany[]> {
    const res = await springApi.get<ApiResponse<UpcomingCompany[]>>("/explore/upcoming")
    return res.data.data
  },

  async getRecommendations(): Promise<WqRecommendation[]> {
    const res = await springApi.get<ApiResponse<WqRecommendation[]>>("/explore/recommendations")
    return res.data.data
  },

  async getMutualSchemes(): Promise<MutualScheme[]> {
    const res = await springApi.get<ApiResponse<MutualScheme[]>>("/explore/schemes")
    return res.data.data
  },

  async getSchemeById(identifier: string): Promise<MutualScheme> {
    const res = await springApi.get<ApiResponse<MutualScheme>>(`/explore/schemes/${identifier}`)
    return res.data.data
  },

  async recordRecentlyViewed(tickerOrId: string): Promise<void> {
    try {
      await springApi.post(`/explore/recently-viewed/${encodeURIComponent(tickerOrId)}`)
    } catch {
      // Non-blocking telemetry
    }
  },
}
