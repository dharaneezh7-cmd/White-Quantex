import React, { useState, useMemo, useEffect, useCallback } from "react"
import { Link } from "react-router"
import {
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowUpDown,
  Search,
  Filter,
  DollarSign,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
  Layers,
  Sparkles,
  Zap,
  Clock,
  X,
  Building2,
  RefreshCw,
  Globe2,
  Star,
  Radio,
} from "lucide-react"
import { type CompanySummary } from "../../../services/explore/exploreService"
import { getCompanyLogoStyle } from "../utils/exploreUtils"
import { useMarketPrices } from "../../../services/market/useMarketPrices"
import { GrowwStockListCard } from "./GrowwStockListCard"

interface ExploreMarketTabProps {
  allCompanies: CompanySummary[]
  onOpenDossier?: (identifier: string) => void
  onToast?: (message: string) => void
}

// ── Sparkline mini SVG chart ───────────────────────────────────────────
function MiniSparkline({ hash, positive, width = 72, height = 24 }: { hash: number; positive: boolean; width?: number; height?: number }) {
  const points = useMemo(() => {
    const pts: number[] = []
    let val = 50
    for (let i = 0; i < 10; i++) {
      val += ((hash * (i + 5) * 3) % 11) - 5
      pts.push(Math.max(10, Math.min(90, val)))
    }
    return pts
  }, [hash])
  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = max - min || 1
  const svgPoints = points.map((p, i) => {
    const x = (i / (points.length - 1)) * width
    const y = height - ((p - min) / range) * (height - 4) - 2
    return `${x},${y}`
  }).join(" ")
  const color = positive ? "#10b981" : "#f43f5e"
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="shrink-0">
      <polyline points={svgPoints} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}


// Generate realistic simulated stock quote pricing for each company from its valuation / seed
function getCompanyStockQuote(c: CompanySummary) {
  if (!c) {
    return {
      price: "0.00",
      priceNum: 0,
      changePercent: "0.00",
      changePercentNum: 0,
      changeAmount: "+0.00",
      isPositive: true,
      openPrice: "0.00",
      high24h: "0.00",
      low24h: "0.00",
      volumeShares: "0",
      bidPrice: 0,
      askPrice: 0,
      high52w: "0.00",
      low52w: "0.00",
    }
  }

  const hash = (c.ticker || c.name || "WQ").split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  
  // Stock price range between $14.50 and $480.00
  const basePrice = Number((hash % 450) + 18) + Number((hash % 99) / 100)
  
  // 24h change: derived from company's real metrics if available and not null/NaN, or deterministic fluctuation
  let changePercent: number
  if (c.changePercent !== undefined && c.changePercent !== null && !isNaN(Number(c.changePercent))) {
    changePercent = Number(c.changePercent)
  } else {
    changePercent = ((hash % 1500) - 650) / 100 // -6.50% to +8.50%
  }

  const isPositive = changePercent >= 0
  const changeAmount = (basePrice * (changePercent / 100))
  const openPrice = basePrice - changeAmount
  const high24h = Math.max(basePrice, openPrice) * (1 + (hash % 40) / 1000)
  const low24h = Math.min(basePrice, openPrice) * (1 - (hash % 40) / 1000)

  // Volume
  const volumeShares = ((hash * 1337) % 850000) + 50000
  const bidPrice = +(basePrice - 0.05).toFixed(2)
  const askPrice = +(basePrice + 0.05).toFixed(2)

  // 52W High / Low
  const high52w = (basePrice * 1.35).toFixed(2)
  const low52w = (basePrice * 0.72).toFixed(2)

  return {
    price: Number(basePrice || 0).toFixed(2),
    priceNum: basePrice,
    changePercent: Math.abs(Number(changePercent || 0)).toFixed(2),
    changePercentNum: changePercent,
    changeAmount: ((changeAmount >= 0 ? "+" : "") + Number(changeAmount || 0).toFixed(2)),
    isPositive,
    openPrice: Number(openPrice || 0).toFixed(2),
    high24h: Number(high24h || 0).toFixed(2),
    low24h: Number(low24h || 0).toFixed(2),
    volumeShares: volumeShares.toLocaleString(),
    bidPrice,
    askPrice,
    high52w,
    low52w,
  }
}

// Sector badge colors
const SECTOR_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Fintech: { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20" },
  "AI & ML": { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
  CleanTech: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  SaaS: { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/20" },
  Biotech: { bg: "bg-pink-500/10", text: "text-pink-400", border: "border-pink-500/20" },
  SpaceTech: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
}

export function ExploreMarketTab({ allCompanies, onOpenDossier, onToast }: ExploreMarketTabProps) {
  // Spring Boot Real-time SSE Live Prices Hook
  const {
    quotes: backendQuotes,
    indices: backendIndices,
    isConnected: sseConnected,
    lastTick,
  } = useMarketPrices()

  // State
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSector, setSelectedSector] = useState("ALL")
  const [selectedTier, setSelectedTier] = useState("ALL")
  const [sortField, setSortField] = useState<"volume" | "gainers" | "losers" | "price" | "marketCap" | "ticker">("volume")
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")

  // Trade Modal State
  const [tradeModalCompany, setTradeModalCompany] = useState<CompanySummary | null>(null)
  const [orderSide, setOrderSide] = useState<"BUY" | "SELL">("BUY")
  const [orderType, setOrderType] = useState<"MARKET" | "LIMIT">("MARKET")
  const [sharesQuantity, setSharesQuantity] = useState<number>(100)
  const [limitPrice, setLimitPrice] = useState<string>("")
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)

  // Sectors list extracted from companies
  const sectors = useMemo(() => {
    const set = new Set<string>()
    allCompanies.forEach((c) => {
      if (c.sector) set.add(c.sector)
    })
    return ["ALL", ...Array.from(set)]
  }, [allCompanies])

  // Helper: live stock quote powered by Spring Boot backend SSE
  const getLiveQuote = useCallback(
    (c: CompanySummary) => {
      const backendQ = backendQuotes[c.ticker?.toUpperCase()]
      if (backendQ) {
        const pNum = Number(backendQ.price) || 0
        const chgNum = Number(backendQ.changePercent) || 0
        const chgAmt = Number(backendQ.changeAmount) || 0
        return {
          price: pNum.toFixed(2),
          priceNum: pNum,
          changePercent: Math.abs(chgNum).toFixed(2),
          changePercentNum: chgNum,
          changeAmount: (chgAmt >= 0 ? "+" : "") + chgAmt.toFixed(2),
          isPositive: backendQ.isPositive ?? chgNum >= 0,
          openPrice: Number(backendQ.openPrice || pNum - chgAmt).toFixed(2),
          high24h: Number(backendQ.high24h || pNum * 1.02).toFixed(2),
          low24h: Number(backendQ.low24h || pNum * 0.98).toFixed(2),
          volumeShares: backendQ.volumeStr || (backendQ.volume ? backendQ.volume.toLocaleString() : "85,400"),
          bidPrice: +(pNum - 0.05).toFixed(2),
          askPrice: +(pNum + 0.05).toFixed(2),
          high52w: Number(backendQ.high52w || pNum * 1.35).toFixed(2),
          low52w: Number(backendQ.low52w || pNum * 0.72).toFixed(2),
        }
      }

      // Fallback deterministic quote if backend quote is loading
      return getCompanyStockQuote(c)
    },
    [backendQuotes]
  )

  // Map companies with live market quotes
  const marketListedCompanies = useMemo(() => {
    return allCompanies.map((c) => ({
      ...c,
      quote: getLiveQuote(c),
    }))
  }, [allCompanies, getLiveQuote])

  // Filtered and sorted listings
  const filteredListings = useMemo(() => {
    let result = marketListedCompanies

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.ticker.toLowerCase().includes(q) ||
          (c.shortName && c.shortName.toLowerCase().includes(q)) ||
          (c.subIndustry && c.subIndustry.toLowerCase().includes(q))
      )
    }

    // Sector filter
    if (selectedSector !== "ALL") {
      result = result.filter((c) => c.sector?.toLowerCase() === selectedSector.toLowerCase())
    }

    // Exchange Tier filter
    if (selectedTier !== "ALL") {
      result = result.filter((c) => c.exchangeTier?.toLowerCase() === selectedTier.toLowerCase())
    }

    // Sorting
    return [...result].sort((a, b) => {
      switch (sortField) {
        case "gainers":
          return b.quote.changePercentNum - a.quote.changePercentNum
        case "losers":
          return a.quote.changePercentNum - b.quote.changePercentNum
        case "price":
          return b.quote.priceNum - a.quote.priceNum
        case "marketCap":
          return (b.valuationNum || 0) - (a.valuationNum || 0)
        case "ticker":
          return a.ticker.localeCompare(b.ticker)
        case "volume":
        default:
          return (b.valuationNum || 0) - (a.valuationNum || 0)
      }
    })
  }, [marketListedCompanies, searchTerm, selectedSector, selectedTier, sortField])

  // Major Indices aggregates directly from Spring Boot backend or calculated
  const marketIndices = useMemo(() => {
    if (backendIndices && backendIndices.length > 0) {
      return backendIndices.map((idx) => ({
        symbol: idx.symbol,
        name: idx.name,
        value: idx.valueStr || String(idx.value),
        change: idx.changeStr || `${idx.changePercent >= 0 ? "+" : ""}${idx.changePercent}%`,
        isPositive: idx.isPositive,
        volume: idx.volume || "$1.2B",
      }))
    }
    return [
      { name: "WQ Composite 100", symbol: "WQ100", value: "4,892.40", change: "+1.24%", isPositive: true, volume: "$1.48B" },
      { name: "WQ DeepTech AI Index", symbol: "WQAI", value: "6,214.15", change: "+2.01%", isPositive: true, volume: "$642.1M" },
      { name: "WQ Fintech 25", symbol: "WQXF", value: "3,410.80", change: "-0.42%", isPositive: false, volume: "$489.3M" },
      { name: "WQ CleanEnergy", symbol: "WQGRN", value: "1,984.30", change: "+0.78%", isPositive: true, volume: "$310.5M" },
    ]
  }, [backendIndices])

  // Groww Top Gainers & Losers Lists
  const topGainersList = useMemo(() => {
    return [...marketListedCompanies]
      .sort((a, b) => b.quote.changePercentNum - a.quote.changePercentNum)
      .slice(0, 5)
      .map((c) => ({
        id: c.id,
        ticker: c.ticker,
        name: c.name,
        shortName: c.shortName,
        sector: c.sector,
        logoColor: c.logoColor,
        price: c.quote.priceNum,
        changePercent: c.quote.changePercentNum,
        isPositive: c.quote.isPositive,
      }))
  }, [marketListedCompanies])

  const topLosersList = useMemo(() => {
    return [...marketListedCompanies]
      .sort((a, b) => a.quote.changePercentNum - b.quote.changePercentNum)
      .slice(0, 5)
      .map((c) => ({
        id: c.id,
        ticker: c.ticker,
        name: c.name,
        shortName: c.shortName,
        sector: c.sector,
        logoColor: c.logoColor,
        price: c.quote.priceNum,
        changePercent: c.quote.changePercentNum,
        isPositive: c.quote.isPositive,
      }))
  }, [marketListedCompanies])

  // Handle Order Execution Simulation
  const handleExecuteTrade = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tradeModalCompany) return
    setIsSubmittingOrder(true)

    const quote = getLiveQuote(tradeModalCompany)
    const executedPrice = orderType === "MARKET" ? quote.priceNum : parseFloat(limitPrice) || quote.priceNum
    const totalVal = (executedPrice * sharesQuantity).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    })

    setTimeout(() => {
      setIsSubmittingOrder(false)
      setTradeModalCompany(null)
      const msg = `Successfully executed ${orderSide} order: ${sharesQuantity} shares of ${tradeModalCompany.ticker} (${tradeModalCompany.shortName || tradeModalCompany.name}) at $${executedPrice.toFixed(2)} [Total: ${totalVal}]`
      if (onToast) {
        onToast(msg)
      } else {
        alert(msg)
      }
    }, 600)
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* ───────────────────────────────────────────────────────────────── */}
      {/* 1. TOP MARKET INDICES TICKER TAPE                                 */}
      {/* ───────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {marketIndices.map((idx) => (
          <div
            key={idx.symbol}
            className="p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/50 hover:bg-slate-100/70 dark:hover:bg-zinc-800/60 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                {idx.symbol}
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded ${
                  idx.isPositive
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                }`}
              >
                {idx.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {idx.change}
              </span>
            </div>
            <div className="mt-2">
              <div className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-mono">
                {idx.value}
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                <span className="truncate">{idx.name}</span>
                <span className="font-mono">{idx.volume}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* 2. LIVE STOCK MARKET STATUS & BANNER                              */}
      {/* ───────────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 bg-gradient-to-r from-slate-900 via-zinc-900 to-slate-950 text-white p-5 sm:p-6 shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00d09c]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${sseConnected ? "bg-[#00d09c] animate-ping" : "bg-amber-400"}`} />
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-widest uppercase bg-[#00d09c]/20 text-[#00d09c] border border-[#00d09c]/30">
                {sseConnected ? "SPRING BOOT SSE LIVE" : "SPRING BOOT AUTO-POLLING"}
              </span>
              <span className="text-xs text-zinc-400 hidden sm:inline">
                • Continuous Real-Time Tick #{lastTick}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              White Quantex Stock Market
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                {marketListedCompanies.length} Verified Issuers
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl">
              Real-time equity quotes streamed directly from the Spring Boot financial engine, continuous limit order matching, and institutional execution.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="px-3.5 py-2 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-right flex-1 sm:flex-initial">
              <div className="text-[10px] text-zinc-400 uppercase font-semibold">Today's Exchange Volume</div>
              <div className="text-sm sm:text-base font-extrabold font-mono text-[#00d09c]">$2,419,850,200</div>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-right flex-1 sm:flex-initial">
              <div className="text-[10px] text-zinc-400 uppercase font-semibold">Live Backend Stream</div>
              <div className="text-sm sm:text-base font-extrabold font-mono text-white flex items-center justify-end gap-1">
                <Radio className={`h-3.5 w-3.5 ${sseConnected ? "text-emerald-400 animate-pulse" : "text-amber-400"}`} />
                {sseConnected ? "Connected" : "Syncing"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* 2.5. GROWW-STYLE TOP GAINERS & TOP LOSERS CARDS                   */}
      {/* ───────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GrowwStockListCard
          title="Top Gainers"
          icon={<span className="text-base select-none">🔥 🔥</span>}
          items={topGainersList}
          onSeeAll={() => setSortField("gainers")}
          onSelect={(item) => onOpenDossier && onOpenDossier(item.ticker)}
        />
        <GrowwStockListCard
          title="Top Losers"
          icon={<span className="text-base select-none">🔻</span>}
          items={topLosersList}
          onSeeAll={() => setSortField("losers")}
          onSelect={(item) => onOpenDossier && onOpenDossier(item.ticker)}
        />
      </div>

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* 3. CONTROLS, SEARCH, AND FILTER BAR                               */}
      {/* ───────────────────────────────────────────────────────────────── */}
      <div className="p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/40 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by company name, ticker (e.g. KIEX), or industry..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#00d09c]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Sort Options */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400 flex items-center gap-1 shrink-0">
              <ArrowUpDown className="h-3.5 w-3.5" /> Sort:
            </span>
            {[
              { id: "volume", label: "Volume / Cap" },
              { id: "gainers", label: "Top Gainers" },
              { id: "losers", label: "Top Losers" },
              { id: "price", label: "Stock Price" },
              { id: "ticker", label: "Ticker Symbol" },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setSortField(s.id as any)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  sortField === s.id
                    ? "bg-[#00d09c] text-zinc-950 shadow-xs font-bold"
                    : "bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {s.label}
              </button>
            ))}

            {/* View Mode Toggle */}
            <div className="flex items-center border border-slate-200 dark:border-zinc-800 rounded-lg p-0.5 bg-white dark:bg-zinc-950 ml-auto shrink-0">
              <button
                onClick={() => setViewMode("table")}
                title="Table View"
                className={`p-1.5 rounded text-xs transition-all ${
                  viewMode === "table"
                    ? "bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white"
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                title="Cards View"
                className={`p-1.5 rounded text-xs transition-all ${
                  viewMode === "grid"
                    ? "bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white"
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Sector and Tier Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Sectors:
          </span>
          {sectors.map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSector(sec)}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                selectedSector === sec
                  ? "bg-slate-900 text-white dark:bg-white dark:text-zinc-950"
                  : "bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {sec}
            </button>
          ))}

          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 ml-2 mr-1">
            Exchange Tier:
          </span>
          {["ALL", "Tier-1 Institutional", "Tier-2 Growth"].map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                selectedTier === tier
                  ? "bg-indigo-600 text-white"
                  : "bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {tier === "ALL" ? "All Tiers" : tier}
            </button>
          ))}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* 4. STOCK LISTINGS (TABLE OR GRID VIEW)                           */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {viewMode === "table" ? (
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-zinc-800/80 bg-slate-50/75 dark:bg-zinc-900/60 text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-zinc-400">
                <th className="py-3 px-4">Company / Symbol</th>
                <th className="py-3 px-3">Sector</th>
                <th className="py-3 px-3 text-right">Price</th>
                <th className="py-3 px-3 text-right">24h Change</th>
                <th className="py-3 px-3 text-right hidden sm:table-cell">24h High / Low</th>
                <th className="py-3 px-3 text-right hidden md:table-cell">Valuation / Cap</th>
                <th className="py-3 px-3 text-right hidden lg:table-cell">Volume</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50 text-xs">
              {filteredListings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-zinc-500">
                    No listed companies match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredListings.map((c) => {
                  const quote = c.quote
                  const isPositive = quote.isPositive
                  const secColor = SECTOR_COLORS[c.sector] || {
                    bg: "bg-slate-500/10",
                    text: "text-slate-400",
                    border: "border-slate-500/20",
                  }

                  return (
                    <tr
                      key={c.id || c.ticker}
                      className="hover:bg-slate-50/80 dark:hover:bg-zinc-900/60 transition-colors group cursor-pointer"
                      onClick={() => onOpenDossier && onOpenDossier(c.ticker || c.id)}
                    >
                      {/* Company Name & Ticker */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            style={getCompanyLogoStyle(c.logoColor, c.ticker)}
                            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white uppercase shrink-0 shadow-xs"
                          >
                            {(c.shortName || c.name || "W").slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-extrabold text-slate-900 dark:text-white group-hover:text-[#00d09c] transition-colors">
                                {c.ticker}
                              </span>
                              <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                                {c.exchangeTier?.includes("Tier-1") ? "T-1" : "T-2"}
                              </span>
                            </div>
                            <div className="text-slate-600 dark:text-zinc-400 truncate max-w-[180px] sm:max-w-xs text-[11px]">
                              {c.name}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Sector */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${secColor.bg} ${secColor.text} ${secColor.border}`}
                        >
                          {c.sector || "Enterprise"}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-3 text-right font-mono font-extrabold text-sm text-slate-900 dark:text-white">
                        ${quote.price}
                      </td>

                      {/* 24h Change */}
                      <td className="py-3 px-3 text-right">
                        <div
                          className={`inline-flex items-center font-mono font-bold text-xs px-2 py-0.5 rounded ${
                            isPositive
                              ? "text-emerald-600 dark:text-[#00d09c] bg-emerald-500/10"
                              : "text-rose-600 dark:text-rose-400 bg-rose-500/10"
                          }`}
                        >
                          <span>{isPositive ? "+" : "-"}{quote.changePercent}%</span>
                        </div>
                      </td>

                      {/* 24h High / Low */}
                      <td className="py-3 px-3 text-right hidden sm:table-cell font-mono text-[11px] text-slate-500 dark:text-zinc-400">
                        <div>H: ${quote.high24h}</div>
                        <div>L: ${quote.low24h}</div>
                      </td>

                      {/* Valuation / Market Cap */}
                      <td className="py-3 px-3 text-right hidden md:table-cell font-mono font-semibold text-slate-900 dark:text-zinc-200">
                        {c.valuation || "N/A"}
                      </td>

                      {/* Volume */}
                      <td className="py-3 px-3 text-right hidden lg:table-cell font-mono text-slate-500 dark:text-zinc-400 text-[11px]">
                        {quote.volumeShares}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setTradeModalCompany(c)
                              setOrderSide("BUY")
                              setLimitPrice(quote.price)
                            }}
                            className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#00d09c] text-zinc-950 hover:bg-[#00b98a] transition-all cursor-pointer shadow-xs"
                          >
                            Trade
                          </button>
                          <button
                            onClick={() => onOpenDossier && onOpenDossier(c.ticker || c.id)}
                            title="View Corporate Dossier"
                            className="p-1 rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* SQUARE BOX CARDS GRID VIEW */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filteredListings.map((c) => {
            const quote = c.quote
            const isPositive = quote.isPositive
            const hash = (c.ticker || c.name || "WQ").split("").reduce((a, x) => a + x.charCodeAt(0), 0)

            return (
              <div
                key={c.id || c.ticker}
                onClick={() => onOpenDossier && onOpenDossier(c.ticker || c.id)}
                className="aspect-square flex flex-col justify-between p-3 sm:p-3.5 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 hover:border-[#00d09c]/50 hover:shadow-md transition-all cursor-pointer group shadow-xs"
              >
                {/* Top: Logo + Sector */}
                <div className="flex items-start justify-between">
                  <div
                    style={getCompanyLogoStyle(c.logoColor, c.ticker)}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-xs shrink-0"
                  >
                    {(c.shortName || c.name || "W").slice(0, 2)}
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 truncate max-w-[70px]">
                    {c.sector || "Tech"}
                  </span>
                </div>

                {/* Middle: Sparkline */}
                <div className="my-1 flex items-center justify-center">
                  <MiniSparkline hash={hash} positive={isPositive} width={80} height={26} />
                </div>

                {/* Bottom: Info + Price + Action */}
                <div>
                  <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white font-mono group-hover:text-[#00d09c] transition-colors truncate">
                    {c.ticker}
                  </div>
                  <div className="flex items-baseline justify-between mt-0.5">
                    <span className="font-black font-mono text-xs sm:text-sm text-slate-900 dark:text-white">
                      ${quote.price}
                    </span>
                    <span
                      className={`font-mono font-bold text-[10px] sm:text-[11px] ${
                        isPositive ? "text-emerald-500 dark:text-[#00d09c]" : "text-rose-500"
                      }`}
                    >
                      {isPositive ? "+" : "-"}{quote.changePercent}%
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        setTradeModalCompany(c)
                        setOrderSide("BUY")
                        setLimitPrice(quote.price)
                      }}
                      className="w-full py-1 rounded-lg text-[10px] sm:text-xs font-bold bg-[#00d09c] text-zinc-950 hover:bg-[#00b98a] transition-all cursor-pointer shadow-xs"
                    >
                      Trade
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* 5. INTERACTIVE STOCK ORDER / TRADE MODAL                          */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {tradeModalCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-5 sm:p-6 shadow-2xl relative space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs text-white uppercase ${
                    tradeModalCompany.logoColor || "bg-indigo-600"
                  }`}
                >
                  {(tradeModalCompany.shortName || tradeModalCompany.name || "W").slice(0, 2)}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    {tradeModalCompany.ticker}
                    <span className="text-xs font-normal text-slate-500 dark:text-zinc-400">
                      • {tradeModalCompany.name}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
                    Market Quote: ${getCompanyStockQuote(tradeModalCompany).price} USD
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTradeModalCompany(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Buy / Sell Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-zinc-900 rounded-xl">
              <button
                type="button"
                onClick={() => setOrderSide("BUY")}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  orderSide === "BUY"
                    ? "bg-[#00d09c] text-zinc-950 shadow-xs"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Buy {tradeModalCompany.ticker}
              </button>
              <button
                type="button"
                onClick={() => setOrderSide("SELL")}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  orderSide === "SELL"
                    ? "bg-rose-500 text-white shadow-xs"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Sell {tradeModalCompany.ticker}
              </button>
            </div>

            {/* Order Form */}
            <form onSubmit={handleExecuteTrade} className="space-y-4">
              {/* Order Type */}
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-600 dark:text-zinc-400">
                  Execution Type
                </label>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-900 p-0.5 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setOrderType("MARKET")}
                    className={`px-2.5 py-1 rounded-md font-semibold ${
                      orderType === "MARKET"
                        ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Market
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType("LIMIT")}
                    className={`px-2.5 py-1 rounded-md font-semibold ${
                      orderType === "LIMIT"
                        ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Limit
                  </button>
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-zinc-400">
                  <span>Number of Shares</span>
                  <span className="font-mono text-[11px] text-slate-400">Min 1 Share</span>
                </div>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={sharesQuantity}
                  onChange={(e) => setSharesQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#00d09c]"
                />
              </div>

              {/* Limit Price Input if Limit Order */}
              {orderType === "LIMIT" && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-zinc-400">
                    <span>Limit Price ($)</span>
                    <span className="font-mono text-[11px] text-slate-400">
                      Quote: ${getCompanyStockQuote(tradeModalCompany).price}
                    </span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#00d09c]"
                  />
                </div>
              )}

              {/* Summary Breakdown */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500 dark:text-zinc-400">
                  <span>Estimated Unit Price:</span>
                  <span className="font-mono text-slate-900 dark:text-white font-semibold">
                    ${orderType === "MARKET" ? getCompanyStockQuote(tradeModalCompany).price : limitPrice || "0.00"}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-zinc-400">
                  <span>Clearing & Exchange Fee:</span>
                  <span className="font-mono text-emerald-500 font-semibold">$0.00 (Zero Fee)</span>
                </div>
                <div className="pt-1.5 border-t border-slate-200 dark:border-zinc-800 flex justify-between text-slate-900 dark:text-white font-bold">
                  <span>Total Order Consideration:</span>
                  <span className="font-mono text-[#00d09c] text-sm">
                    {(
                      (orderType === "MARKET"
                        ? getCompanyStockQuote(tradeModalCompany).priceNum
                        : parseFloat(limitPrice) || 0) * sharesQuantity
                    ).toLocaleString("en-US", { style: "currency", currency: "USD" })}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmittingOrder}
                className={`w-full py-2.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  orderSide === "BUY"
                    ? "bg-[#00d09c] text-zinc-950 hover:bg-[#00b98a]"
                    : "bg-rose-500 text-white hover:bg-rose-600"
                } ${isSubmittingOrder ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {isSubmittingOrder ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Executing via Match Engine...
                  </>
                ) : (
                  <>
                    {orderSide === "BUY" ? "Confirm & Place Buy Order" : "Confirm & Place Sell Order"}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
