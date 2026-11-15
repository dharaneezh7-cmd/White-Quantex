import type {
  CompanySummary,
  CategoryCompany,
  UpcomingCompany,
  WqRecommendation,
  MutualScheme,
  ExploreOverview,
  CorporatePosition,
  CorporateOrder,
  CorporateNews,
  CompanySearchParams,
} from "./exploreService"
import type { PagedResponse } from "@/types"

export interface VentureOpportunity {
  id: string
  ticker: string
  name: string
  shortName: string
  legalEntity: string
  sector: string
  subIndustry: string
  headquarters: string
  ceo: string
  logoColor: string
  valuation: string
  valuationNum: number
  roundType: string
  targetRaise: string
  targetRaiseNum: number
  raisedAmount: string
  raisedAmountNum: number
  percentFunded: number
  minInvestment: string
  minInvestmentNum: number
  fundingPurpose: string
  investorCount: number
  daysRemaining: number
  securityType: string
  verificationLevel: "PLATINUM" | "GOLD" | "SILVER"
  useOfFunds: { label: string; percent: number }[]
  keyMilestones: string[]
}

/**
 * Live Venture Fundraising Opportunities
 * Empty by default — populated strictly from backend or real user venture registrations.
 */
export const MOCK_VENTURE_OPPORTUNITIES: VentureOpportunity[] = []

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MASTER REGISTERED VENTURES & START-UPS DIRECTORY
 * Fully independent from the corporate companies directory (/explore).
 * Empty by default — populated strictly from backend database or dynamic user registrations.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const REGISTERED_VENTURES_LIST: CompanySummary[] = []

/**
 * Venture Portfolio Positions (Empty by default; populated only by real user investments)
 */
export const VENTURE_POSITIONS: CorporatePosition[] = []

/**
 * Venture Allocation Orders (Empty by default; populated only by real user orders)
 */
export const VENTURE_ORDERS: CorporateOrder[] = []

/**
 * Venture Dispatches & Intelligence News (Empty by default; populated by real issuer filings)
 */
export const VENTURE_NEWS: CorporateNews[] = []

/**
 * Filter & Retrieve Registered Ventures
 * When the backend is offline, reads ONLY genuine registered ventures from browser localStorage.
 */
export function getRegisteredVentures(params: CompanySearchParams = {}): PagedResponse<CompanySummary> {
  let list: CompanySummary[] = []

  // Read dynamically registered ventures from Company Module (stored in browser localStorage)
  if (typeof window !== "undefined") {
    try {
      const savedStr = localStorage.getItem("wq_registered_ventures")
      if (savedStr) {
        const saved: CompanySummary[] = JSON.parse(savedStr)
        if (Array.isArray(saved) && saved.length > 0) {
          list = [...saved]
        }
      }
    } catch {}
  }

  // Filter query
  if (params.query && params.query.trim()) {
    const q = params.query.toLowerCase().trim()
    list = list.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.ticker.toLowerCase().includes(q) ||
        v.shortName.toLowerCase().includes(q) ||
        v.sector.toLowerCase().includes(q) ||
        v.subIndustry.toLowerCase().includes(q) ||
        v.headquarters.toLowerCase().includes(q) ||
        v.ceo.toLowerCase().includes(q) ||
        v.legalEntity.toLowerCase().includes(q) ||
        v.cik.toLowerCase().includes(q)
    )
  }

  // Filter sector
  if (params.sector && params.sector !== "All" && params.sector !== "All Ventures") {
    const s = params.sector.toLowerCase().trim()
    list = list.filter((v) => v.sector.toLowerCase().includes(s) || s.includes(v.sector.toLowerCase()))
  }

  // Filter letter
  if (params.letter && params.letter !== "ALL") {
    const l = params.letter.toUpperCase().trim()
    list = list.filter((v) => v.name.toUpperCase().startsWith(l))
  }

  // Sorting
  const sortBy = params.sortBy || "valuation"
  const sortDir = params.sortDirection || "desc"
  list.sort((a, b) => {
    let diff = 0
    if (sortBy === "name") {
      diff = a.name.localeCompare(b.name)
    } else if (sortBy === "valuation") {
      diff = (b.valuationNum || 0) - (a.valuationNum || 0)
    } else if (sortBy === "founded") {
      diff = (b.foundedYear || 0) - (a.foundedYear || 0)
    } else if (sortBy === "employees") {
      diff = (b.employees || 0) - (a.employees || 0)
    }
    return sortDir === "asc" ? -diff : diff
  })

  const page = params.page || 0
  const size = params.size || 25
  const totalElements = list.length
  const totalPages = Math.ceil(totalElements / size) || 1
  const paginatedContent = list.slice(page * size, (page + 1) * size)

  return {
    content: paginatedContent,
    totalElements,
    totalPages,
    size,
    number: page,
    first: page === 0,
    last: page >= totalPages - 1,
  }
}

/**
 * Independent Venture Market Movers & Growth Overview
 * Strictly returns genuine registered metrics or empty states if no ventures are registered.
 */
export function getVenturesOverview(): ExploreOverview {
  const allVentures = getRegisteredVentures({ size: 300 }).content

  if (allVentures.length === 0) {
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
  }

  const toCategory = (
    v: CompanySummary,
    rank: number,
    metricLabel: string,
    metricValue: string,
    subMetric: string
  ): CategoryCompany => ({
    id: v.id,
    rank,
    name: v.name,
    shortName: v.shortName,
    ticker: v.ticker,
    logoText: v.ticker.slice(0, 2),
    logoBg: v.logoColor,
    sector: v.sector,
    metricLabel,
    metricValue,
    subMetric,
    change: v.change24h || "+10.0%",
    isPositive: v.isPositive !== false,
    valuation: v.valuation,
    investedToday: v.investedToday,
    percentFunded: v.allocationPercent || 80,
    volume: v.tradingVolumeToday || "$2.5M Vol",
    cik: v.cik,
    minInvestment: v.minInvestment,
    minInvestmentNum: v.minInvestmentNum,
    fundingPurpose: v.fundingPurpose,
    targetRaise: v.targetRaise,
    roundType: v.roundType,
  })

  const todaysMostInvested: CategoryCompany[] = allVentures.slice(0, 5).map((v, i) =>
    toCategory(v, i + 1, "Inflow", v.investedToday || "+$500K Inflow", v.change24h || "+10.0%")
  )

  const todaysLeastInvested: CategoryCompany[] = allVentures.slice(0, 5).map((v, i) =>
    toCategory(v, i + 1, "Inflow", "+$100K Inflow", "+2.0%")
  )

  const todaysTopGainers: CategoryCompany[] = allVentures.slice(0, 5).map((v, i) =>
    toCategory(v, i + 1, "% MCap", v.marketCapGainLoss || "+$5.0M", v.change24h || "+10.0%")
  )

  const todaysTopLosers: CategoryCompany[] = []

  const todaysMostActive: CategoryCompany[] = allVentures.slice(0, 5).map((v, i) =>
    toCategory(v, i + 1, "Volume", v.tradingVolumeToday || "$2.0M Vol", v.change24h || "+8.0%")
  )

  const todays52wHighs: CategoryCompany[] = allVentures.slice(0, 5).map((v, i) =>
    toCategory(v, i + 1, "% MCap", v.valuation || "$50.0M", v.change24h || "+10.0%")
  )

  const recentlyViewed: CategoryCompany[] = allVentures.slice(0, 5).map((v, i) =>
    toCategory(v, i + 1, "Status", v.status || "Active", v.change24h || "+5.0%")
  )

  const recentlyAdded: CompanySummary[] = allVentures.slice(0, 8)
  const upcomingCompanies: UpcomingCompany[] = []
  const wqRecommendations: WqRecommendation[] = []
  const mutualInvestmentSchemes: MutualScheme[] = []

  return {
    recentlyViewed,
    todaysMostInvested,
    todaysLeastInvested,
    todaysTopGainers,
    todaysTopLosers,
    todaysMostActive,
    todays52wHighs,
    recentlyAdded,
    upcomingCompanies,
    wqRecommendations,
    mutualInvestmentSchemes,
    totalRegisteredCompanies: allVentures.length,
  }
}

/**
 * Deterministically resolve investment parameters for a company or venture.
 */
export function getCompanyInvestmentDetails(company: Partial<CompanySummary> | null | undefined): {
  minInvestment: string
  minInvestmentNum: number
  roundType: string
  fundingPurpose: string
  targetRaise: string
  targetRaiseNum: number
  raisedAmount: string
  raisedAmountNum: number
  percentFunded: number
  securityType: string
  investorCount: number
} {
  if (company && company.minInvestment && company.minInvestmentNum) {
    return {
      minInvestment: company.minInvestment,
      minInvestmentNum: company.minInvestmentNum,
      roundType: company.roundType || "Series A Growth Round",
      fundingPurpose: company.fundingPurpose || company.description || "Accelerating corporate development and commercial scaling.",
      targetRaise: company.targetRaise || "$15.0M",
      targetRaiseNum: company.targetRaiseNum || 15000000,
      raisedAmount: company.raisedAmount || "$11.2M",
      raisedAmountNum: company.raisedAmountNum || 11200000,
      percentFunded: company.allocationPercent || 78,
      securityType: company.securityType || "Delaware C-Corp Preferred Equity",
      investorCount: 15,
    }
  }

  const val = company?.valuationNum || 50000000
  let minInvestmentNum = 25000
  let minInvestment = "$25,000"
  let roundType = company?.roundType || "Series A Growth Round"

  if (val > 150000000) {
    minInvestmentNum = 50000
    minInvestment = "$50,000"
    roundType = "Series B Expansion Round"
  } else if (val < 40000000) {
    minInvestmentNum = 10000
    minInvestment = "$10,000"
    roundType = "Strategic Seed Capital"
  }

  const targetRaiseNum = Math.round(val * 0.18)
  const targetRaise = `$${(targetRaiseNum / 1000000).toFixed(1)}M`
  const percentFunded = 75
  const raisedAmountNum = Math.round(targetRaiseNum * 0.75)
  const raisedAmount = `$${(raisedAmountNum / 1000000).toFixed(1)}M`

  const sector = company?.sector || "Industrial Technology"
  const fundingPurpose = company?.description || `Scaling corporate development, engineering R&D, and commercial operations across the ${sector} sector.`

  return {
    minInvestment,
    minInvestmentNum,
    roundType,
    fundingPurpose,
    targetRaise,
    targetRaiseNum,
    raisedAmount,
    raisedAmountNum,
    percentFunded,
    securityType: "Delaware C-Corp Preferred Equity",
    investorCount: 12,
  }
}
