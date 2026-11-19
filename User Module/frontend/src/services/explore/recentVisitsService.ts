import { useState, useEffect } from "react"
import { marketStore } from "@/services/market/useMarketPrices"

export interface VisitedEntity {
  id: string
  name: string
  shortName: string
  ticker: string
  sector?: string
  status?: string
  valuation?: string
  change?: string
  isPositive?: boolean
  logoColor?: string
  type: "company" | "venture" | "stock"
  visitedAt: number
}

const STORAGE_KEY = "wq_recently_visited_entities"
const MAX_RECENT_ITEMS = 60
const EVENT_NAME = "wq:recently-visited-updated"

/**
 * Curated initial default recently viewed companies (Explore section alone)
 */
export const DEFAULT_RECENT_COMPANIES: VisitedEntity[] = [
  {
    id: "TFLOW",
    ticker: "TFLOW",
    name: "TechFlow AI Solutions Inc.",
    shortName: "TechFlow AI",
    sector: "AI & ML",
    status: "Active Trading",
    valuation: "$4.8B",
    change: "+14.2%",
    isPositive: true,
    logoColor: "bg-indigo-600",
    type: "company",
    visitedAt: Date.now() - 1000 * 60 * 10,
  },
  {
    id: "GGRID",
    ticker: "GGRID",
    name: "GreenGrid Energy Systems",
    shortName: "GreenGrid",
    sector: "CleanTech",
    status: "Active Trading",
    valuation: "$2.9B",
    change: "+6.8%",
    isPositive: true,
    logoColor: "bg-emerald-600",
    type: "company",
    visitedAt: Date.now() - 1000 * 60 * 20,
  },
  {
    id: "NPAY",
    ticker: "NPAY",
    name: "NovaPay Technologies Ltd.",
    shortName: "NovaPay",
    sector: "Fintech",
    status: "Active Trading",
    valuation: "$3.4B",
    change: "+3.1%",
    isPositive: true,
    logoColor: "bg-cyan-600",
    type: "company",
    visitedAt: Date.now() - 1000 * 60 * 30,
  },
  {
    id: "STRAT",
    ticker: "STRAT",
    name: "Stratos Aerospace Dynamics",
    shortName: "Stratos Aero",
    sector: "SpaceTech",
    status: "Active Trading",
    valuation: "$5.1B",
    change: "+4.5%",
    isPositive: true,
    logoColor: "bg-rose-600",
    type: "company",
    visitedAt: Date.now() - 1000 * 60 * 40,
  },
  {
    id: "CYBER",
    ticker: "CYBER",
    name: "CyberShield Defense Systems",
    shortName: "CyberShield",
    sector: "Cybersecurity",
    status: "Active Trading",
    valuation: "$3.8B",
    change: "+5.9%",
    isPositive: true,
    logoColor: "bg-purple-600",
    type: "company",
    visitedAt: Date.now() - 1000 * 60 * 50,
  },
  {
    id: "AERO",
    ticker: "AERO",
    name: "AeroDynamics Propulsion Lab",
    shortName: "AeroDynamics",
    sector: "DefenseTech",
    status: "Active Trading",
    valuation: "$2.2B",
    change: "+8.3%",
    isPositive: true,
    logoColor: "bg-blue-600",
    type: "company",
    visitedAt: Date.now() - 1000 * 60 * 60,
  },
  {
    id: "PULSE",
    ticker: "PULSE",
    name: "PulseHealth Biomedical",
    shortName: "PulseHealth",
    sector: "Biotech",
    status: "Active Trading",
    valuation: "$1.9B",
    change: "+6.1%",
    isPositive: true,
    logoColor: "bg-teal-600",
    type: "company",
    visitedAt: Date.now() - 1000 * 60 * 70,
  },
  {
    id: "HYPER",
    ticker: "HYPER",
    name: "HyperScale Quantum Labs",
    shortName: "HyperScale",
    sector: "Quantum",
    status: "Active Trading",
    valuation: "$4.2B",
    change: "+11.7%",
    isPositive: true,
    logoColor: "bg-amber-600",
    type: "company",
    visitedAt: Date.now() - 1000 * 60 * 80,
  },
]

/**
 * Curated initial default recently viewed ventures (Venture section alone)
 */
export const DEFAULT_RECENT_VENTURES: VisitedEntity[] = [
  {
    id: "AETHE",
    ticker: "AETHE",
    name: "Aetheris AI Systems, Inc.",
    shortName: "Aetheris AI",
    sector: "AI & Machine Learning",
    status: "Active Series B",
    valuation: "$1.4B",
    change: "+8.6%",
    isPositive: true,
    logoColor: "bg-violet-600",
    type: "venture",
    visitedAt: Date.now() - 1000 * 60 * 10,
  },
  {
    id: "VORT",
    ticker: "VORT",
    name: "Vortex Fusion Energy Corp.",
    shortName: "Vortex Fusion",
    sector: "CleanTech & Energy",
    status: "Active Series A",
    valuation: "$850M",
    change: "+11.4%",
    isPositive: true,
    logoColor: "bg-amber-600",
    type: "venture",
    visitedAt: Date.now() - 1000 * 60 * 20,
  },
  {
    id: "HYPE",
    ticker: "HYPE",
    name: "HyperScale Quantum Labs, Inc.",
    shortName: "HyperScale",
    sector: "Quantum & Computing",
    status: "Active Seed",
    valuation: "$420M",
    change: "+18.9%",
    isPositive: true,
    logoColor: "bg-blue-600",
    type: "venture",
    visitedAt: Date.now() - 1000 * 60 * 30,
  },
  {
    id: "NEURO",
    ticker: "NEURO",
    name: "NeuroLink Cognition Systems",
    shortName: "NeuroLink",
    sector: "Biotech & HealthTech",
    status: "Active Series B",
    valuation: "$1.1B",
    change: "+7.2%",
    isPositive: true,
    logoColor: "bg-teal-600",
    type: "venture",
    visitedAt: Date.now() - 1000 * 60 * 40,
  },
  {
    id: "BIOC",
    ticker: "BIOC",
    name: "BioCellular Therapeutics",
    shortName: "BioCellular",
    sector: "Life Sciences",
    status: "Active Series A",
    valuation: "$620M",
    change: "+9.5%",
    isPositive: true,
    logoColor: "bg-emerald-600",
    type: "venture",
    visitedAt: Date.now() - 1000 * 60 * 50,
  },
  {
    id: "TERRA",
    ticker: "TERRA",
    name: "TerraPower Modular Nuclear",
    shortName: "TerraPower",
    sector: "Clean Energy",
    status: "Active Series B",
    valuation: "$1.8B",
    change: "+14.0%",
    isPositive: true,
    logoColor: "bg-orange-600",
    type: "venture",
    visitedAt: Date.now() - 1000 * 60 * 60,
  },
  {
    id: "ORBIT",
    ticker: "ORBIT",
    name: "OrbitX Commercial Launch",
    shortName: "OrbitX",
    sector: "Space Exploration",
    status: "Active Seed",
    valuation: "$310M",
    change: "+15.3%",
    isPositive: true,
    logoColor: "bg-indigo-600",
    type: "venture",
    visitedAt: Date.now() - 1000 * 60 * 70,
  },
  {
    id: "SYNTH",
    ticker: "SYNTH",
    name: "SynthBio Gene Editing",
    shortName: "SynthBio",
    sector: "Synthetic Biology",
    status: "Active Series A",
    valuation: "$740M",
    change: "+6.7%",
    isPositive: true,
    logoColor: "bg-rose-600",
    type: "venture",
    visitedAt: Date.now() - 1000 * 60 * 80,
  },
]

/**
 * Curated initial default recently viewed stocks (Market section alone)
 */
export const DEFAULT_RECENT_STOCKS: VisitedEntity[] = [
  {
    id: "TFLOW",
    ticker: "TFLOW",
    name: "TechFlow AI Solutions Inc.",
    shortName: "TechFlow AI",
    sector: "Public Equities",
    status: "Active Trading",
    valuation: "$4.8B",
    change: "+14.2%",
    isPositive: true,
    logoColor: "bg-indigo-600",
    type: "stock",
    visitedAt: Date.now() - 1000 * 60 * 10,
  },
  {
    id: "GGRID",
    ticker: "GGRID",
    name: "GreenGrid Energy Systems",
    shortName: "GreenGrid",
    sector: "Clean Energy",
    status: "Active Trading",
    valuation: "$2.9B",
    change: "+6.8%",
    isPositive: true,
    logoColor: "bg-emerald-600",
    type: "stock",
    visitedAt: Date.now() - 1000 * 60 * 20,
  },
  {
    id: "NPAY",
    ticker: "NPAY",
    name: "NovaPay Technologies Ltd.",
    shortName: "NovaPay",
    sector: "Fintech",
    status: "Active Trading",
    valuation: "$3.4B",
    change: "+3.1%",
    isPositive: true,
    logoColor: "bg-cyan-600",
    type: "stock",
    visitedAt: Date.now() - 1000 * 60 * 30,
  },
  {
    id: "STRAT",
    ticker: "STRAT",
    name: "Stratos Aerospace Dynamics",
    shortName: "Stratos Aero",
    sector: "Aerospace",
    status: "Active Trading",
    valuation: "$5.1B",
    change: "+4.5%",
    isPositive: true,
    logoColor: "bg-rose-600",
    type: "stock",
    visitedAt: Date.now() - 1000 * 60 * 40,
  },
  {
    id: "CYBER",
    ticker: "CYBER",
    name: "CyberShield Defense Systems",
    shortName: "CyberShield",
    sector: "Cybersecurity",
    status: "Active Trading",
    valuation: "$3.8B",
    change: "+5.9%",
    isPositive: true,
    logoColor: "bg-purple-600",
    type: "stock",
    visitedAt: Date.now() - 1000 * 60 * 50,
  },
  {
    id: "AERO",
    ticker: "AERO",
    name: "AeroDynamics Propulsion Lab",
    shortName: "AeroDynamics",
    sector: "Defense Equities",
    status: "Active Trading",
    valuation: "$2.2B",
    change: "+8.3%",
    isPositive: true,
    logoColor: "bg-blue-600",
    type: "stock",
    visitedAt: Date.now() - 1000 * 60 * 60,
  },
  {
    id: "PULSE",
    ticker: "PULSE",
    name: "PulseHealth Biomedical",
    shortName: "PulseHealth",
    sector: "Healthcare",
    status: "Active Trading",
    valuation: "$1.9B",
    change: "+6.1%",
    isPositive: true,
    logoColor: "bg-teal-600",
    type: "stock",
    visitedAt: Date.now() - 1000 * 60 * 70,
  },
  {
    id: "HYPER",
    ticker: "HYPER",
    name: "HyperScale Quantum Labs",
    shortName: "HyperScale",
    sector: "Quantum Tech",
    status: "Active Trading",
    valuation: "$4.2B",
    change: "+11.7%",
    isPositive: true,
    logoColor: "bg-amber-600",
    type: "stock",
    visitedAt: Date.now() - 1000 * 60 * 80,
  },
]

export const DEFAULT_RECENT_ENTITIES = [
  ...DEFAULT_RECENT_COMPANIES,
  ...DEFAULT_RECENT_VENTURES,
  ...DEFAULT_RECENT_STOCKS,
]

// Recognized venture tickers for strict cross-section separation
const KNOWN_VENTURE_TICKERS = new Set([
  "AETHE", "VORT", "HYPE", "NEURO", "BIOC", "TERRA", "ORBIT", "SYNTH", "CENT",
  "CHRO", "SYNA", "FLUX", "BLOC", "OMNIV", "SOLA", "NEUR"
])

const KNOWN_EXPLORE_COMPANY_TICKERS = new Set([
  "TFLOW", "GGRID", "NPAY", "STRAT", "CYBER", "AERO", "PULSE", "HYPER", "VOCL"
])

/**
 * Service to manage recently visited companies, ventures, and stocks
 * stored directly on the user's local system (localStorage) to reduce server load.
 * Scoped strictly so Explore shows companies, Ventures shows ventures, and Markets shows stocks.
 */
export const recentVisitsService = {
  /**
   * Save a visited entity into the user's system only
   */
  recordVisit(item: {
    id?: string
    ticker?: string
    name?: string
    shortName?: string
    sector?: string
    status?: string
    valuation?: string
    change?: string
    isPositive?: boolean
    logoColor?: string
    type?: "company" | "venture" | "stock"
  }): void {
    if (typeof window === "undefined") return

    const rawTicker = (item.ticker || item.id || "").trim()
    if (!rawTicker) return

    const ticker = rawTicker.toUpperCase()
    const id = String(item.id || ticker)
    const quote = marketStore.getQuote(ticker)

    const name = item.name || quote?.name || item.shortName || ticker
    const shortName = item.shortName || quote?.shortName || item.name || ticker
    
    // Strict type resolution
    const itemAny = item as any
    const isExplicitStock = item.type === "stock"
    const isVentureSignal = Boolean(
      item.type === "venture" ||
      KNOWN_VENTURE_TICKERS.has(ticker) ||
      quote?.isVenture ||
      itemAny.roundType ||
      itemAny.targetRaise ||
      itemAny.securityType ||
      itemAny.isVenture ||
      itemAny.entityType === "VENTURE" ||
      itemAny.exchangeTier?.toLowerCase().includes("venture")
    )

    let type: "company" | "venture" | "stock"
    if (isExplicitStock) {
      type = "stock"
    } else if (isVentureSignal && !KNOWN_EXPLORE_COMPANY_TICKERS.has(ticker)) {
      type = "venture"
    } else {
      type = "company"
    }

    const sector = item.sector || quote?.sector || (type === "venture" ? "Venture Capital" : type === "stock" ? "Public Equities" : "Private Equity")
    const status = item.status || "Active Trading"
    const valuation = item.valuation || "N/A"
    const change = item.change || quote?.changePercentStr || "+0.0%"
    const isPositive = item.isPositive !== undefined ? item.isPositive : (quote ? quote.isPositive : true)
    const logoColor = item.logoColor || quote?.logoColor || "bg-indigo-600"

    const newRecord: VisitedEntity = {
      id,
      name,
      shortName,
      ticker,
      sector,
      status,
      valuation,
      change,
      isPositive,
      logoColor,
      type,
      visitedAt: Date.now(),
    }

    try {
      const existingStr = localStorage.getItem(STORAGE_KEY)
      let list: VisitedEntity[] = existingStr ? JSON.parse(existingStr) : []

      // Strict cross-contamination cleanup:
      // If saving a venture, remove any accidental company record with this ticker
      // If saving a company, remove any accidental venture record with this ticker
      if (type === "venture") {
        list = list.filter((v) => !(v.ticker?.toUpperCase() === ticker && v.type === "company"))
      } else if (type === "company") {
        list = list.filter((v) => !(v.ticker?.toUpperCase() === ticker && v.type === "venture"))
      }

      // Filter out duplicates by ticker AND type so scoped sections remain clean
      list = list.filter(
        (v) => !(v.ticker?.toUpperCase() === ticker && v.type === type)
      )

      // Add to front of recent list
      list.unshift(newRecord)

      // Keep up to MAX_RECENT_ITEMS
      if (list.length > MAX_RECENT_ITEMS) {
        list = list.slice(0, MAX_RECENT_ITEMS)
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(list))

      // Notify any listeners within this window
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: newRecord }))
    } catch (e) {
      console.warn("[RecentVisits] Failed to save in user system storage:", e)
    }
  },

  /**
   * Retrieve recently visited entities from the user's system,
   * scoped strictly by entity type (company for explore, venture for ventures, stock for markets)
   */
  getRecentlyVisited(options?: {
    type?: "company" | "venture" | "stock" | "all"
    limit?: number
  }): VisitedEntity[] {
    const limit = options?.limit || 8
    const typeFilter = options?.type || "all"

    let defaultList: VisitedEntity[] = []
    if (typeFilter === "company") {
      defaultList = DEFAULT_RECENT_COMPANIES
    } else if (typeFilter === "venture") {
      defaultList = DEFAULT_RECENT_VENTURES
    } else if (typeFilter === "stock") {
      defaultList = DEFAULT_RECENT_STOCKS
    } else {
      defaultList = [...DEFAULT_RECENT_COMPANIES.slice(0, 4), ...DEFAULT_RECENT_VENTURES.slice(0, 4)]
    }

    if (typeof window === "undefined") return defaultList.slice(0, limit)

    try {
      const savedStr = localStorage.getItem(STORAGE_KEY)
      if (!savedStr) {
        return defaultList.slice(0, limit)
      }

      let list: VisitedEntity[] = JSON.parse(savedStr)
      if (!Array.isArray(list)) return defaultList.slice(0, limit)

      // Self-healing sanitization of any mistyped historical entities
      let changed = false
      list = list.map((v) => {
        const tick = (v.ticker || "").toUpperCase()
        if (v.type === "company" && KNOWN_VENTURE_TICKERS.has(tick)) {
          changed = true
          return { ...v, type: "venture" as const }
        }
        if (v.type === "venture" && KNOWN_EXPLORE_COMPANY_TICKERS.has(tick)) {
          changed = true
          return { ...v, type: "company" as const }
        }
        return v
      })
      if (changed) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
      }

      if (typeFilter !== "all") {
        const filtered = list.filter((v) => {
          if (v.type !== typeFilter) return false
          const tick = (v.ticker || "").toUpperCase()
          // Extra guarantee: never allow venture in company, or explore company in venture
          if (typeFilter === "company" && KNOWN_VENTURE_TICKERS.has(tick)) return false
          if (typeFilter === "venture" && KNOWN_EXPLORE_COMPANY_TICKERS.has(tick)) return false
          return true
        })

        if (filtered.length === 0) {
          return defaultList.slice(0, limit)
        }
        return filtered.slice(0, limit)
      }

      return list.slice(0, limit)
    } catch {
      return defaultList.slice(0, limit)
    }
  },

  /**
   * Clear all recently visited items from the user's system
   */
  clearRecentlyVisited(): void {
    if (typeof window === "undefined") return
    try {
      localStorage.removeItem(STORAGE_KEY)
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: null }))
    } catch {}
  },
}

/**
 * React hook to subscribe to recently visited entities in user's system
 */
export function useRecentlyVisited(options?: {
  type?: "company" | "venture" | "stock" | "all"
  limit?: number
}) {
  const [visited, setVisited] = useState<VisitedEntity[]>(() =>
    recentVisitsService.getRecentlyVisited(options)
  )

  useEffect(() => {
    const handleUpdate = () => {
      setVisited(recentVisitsService.getRecentlyVisited(options))
    }

    // Update on custom event or other tabs storage change
    window.addEventListener(EVENT_NAME, handleUpdate)
    window.addEventListener("storage", handleUpdate)

    return () => {
      window.removeEventListener(EVENT_NAME, handleUpdate)
      window.removeEventListener("storage", handleUpdate)
    }
  }, [options?.type, options?.limit])

  return visited
}
