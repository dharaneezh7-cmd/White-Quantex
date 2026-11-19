import React, { useState, useMemo } from "react"
import { useNavigate, useSearchParams } from "react-router"
import { useQuery } from "@tanstack/react-query"
import { exploreService } from "../../services/explore/exploreService"
import { useRecentlyVisited, recentVisitsService } from "../../services/explore/recentVisitsService"
import { useMarketPrices } from "../../services/market/useMarketPrices"
import { useStockWatchlist } from "../../hooks/useStockWatchlist"
import { MarketIndicesTicker } from "../../components/market/MarketIndicesTicker"
import { StockScreenerTable, type StockTableItem } from "../../components/market/StockScreenerTable"
import { StockMetricCards } from "../../components/market/StockMetricCards"
import { StockDetailView } from "../../components/market/StockDetailView"
import { AppErrorBoundary } from "../../components/common/AppErrorBoundary"
import { ExplorePositionsTab } from "../explore/components/ExplorePositionsTab"
import { ExploreOrdersTab } from "../explore/components/ExploreOrdersTab"
import { ExploreIndexTab } from "../explore/components/ExploreIndexTab"
import { ExploreWatchlistsTab } from "../explore/components/ExploreWatchlistsTab"
import {
  BarChart3,
  LayoutGrid,
  Table as TableIcon,
  X,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  Eye,
  Briefcase,
  FileCheck,
  Bookmark,
  Layers,
  TrendingUp,
  Activity,
  ArrowRight,
} from "lucide-react"

export default function MarketsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // ── Tab Navigation State: Screener | Index | Holdings | Orders | Watchlist ──
  const tabParam = searchParams.get("tab")
  const activeNavTab: "screener" | "index" | "positions" | "orders" | "watchlist" = useMemo(() => {
    if (!tabParam || tabParam === "screener" || tabParam === "search") return "screener"
    if (tabParam === "index") return "index"
    if (tabParam === "positions" || tabParam === "holding" || tabParam === "holdings") return "positions"
    if (tabParam === "orders" || tabParam === "order") return "orders"
    if (tabParam === "watchlist" || tabParam === "my_watchlist" || tabParam === "all_watchlist") return "watchlist"
    return "screener"
  }, [tabParam])

  const handleTabChange = (newTab: string) => {
    const nextParams = new URLSearchParams(searchParams)
    if (newTab === "screener") {
      nextParams.delete("tab")
    } else {
      nextParams.set("tab", newTab)
    }
    setSearchParams(nextParams)
  }

  const [viewMode, setViewMode] = useState<"table" | "cards">("table")
  const [inspectorSymbol, setInspectorSymbol] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // ── Recently Viewed Stocks (Stored in User's System Only to Reduce Server Load) ──
  const recentStocks = useRecentlyVisited({ type: "stock", limit: 8 })

  // 1. Spring Boot Real-time SSE Live Prices & Indices Stream
  const {
    quotes: backendQuotes,
    indices: backendIndices,
    isConnected: sseConnected,
    lastTick,
  } = useMarketPrices()

  // 2. Fetch Authoritative Stock Issuers from Spring Boot PostgreSQL
  const { data: companiesData, isLoading, refetch } = useQuery({
    queryKey: ["explore", "companies-all"],
    queryFn: () => exploreService.getCompanies({ size: 300 }),
    staleTime: 60_000,
  })
  const companies = companiesData?.content || []

  // 3. User Stock Watchlist Hook
  const { watchlist, isWatched, toggleWatchlist } = useStockWatchlist()

  // 4. Fetch User Positions (Holdings) from Spring Boot
  const { data: backendPositions = [] } = useQuery({
    queryKey: ["explore", "positions"],
    queryFn: () => exploreService.getPositions(),
    staleTime: 30_000,
  })

  // 5. Fetch User Orders from Spring Boot
  const { data: backendOrders = [] } = useQuery({
    queryKey: ["explore", "orders"],
    queryFn: () => exploreService.getOrders("ALL"),
    staleTime: 30_000,
  })

  // 6. Fetch Overview Metrics (Total counts, aggregate valuation, trust score)
  const { data: backendOverview } = useQuery({
    queryKey: ["explore", "overview"],
    queryFn: () => exploreService.getOverview(),
    staleTime: 60_000,
  })

  // ── Computed Portfolio / Holdings KPIs ──
  const livePositions = useMemo(() => {
    return (backendPositions || []).map((pos) => ({
      name: pos.companyName,
      ticker: pos.ticker,
      ind: pos.sector,
      eq: `${pos.ownershipPercent ? pos.ownershipPercent.toFixed(2) : "0.00"}%`,
      shares: pos.shares ? pos.shares.toLocaleString() : "0",
      inv: `$${pos.costBasis ? pos.costBasis.toLocaleString() : "0"}`,
      val: `$${pos.currentValue ? pos.currentValue.toLocaleString() : "0"}`,
      ret: `${(pos.unrealizedPlPercent ?? 0) >= 0 ? "+" : ""}${(pos.unrealizedPlPercent ?? 0).toFixed(1)}%`,
      isPositive: (pos.unrealizedPlPercent ?? 0) >= 0,
      st: "Active",
    }))
  }, [backendPositions])

  const totalInvested = useMemo(
    () => (backendPositions || []).reduce((acc, p) => acc + (p.costBasis || 0), 0),
    [backendPositions]
  )
  const portfolioValue = useMemo(
    () => (backendPositions || []).reduce((acc, p) => acc + (p.currentValue || 0), 0),
    [backendPositions]
  )
  const unrealizedGain = portfolioValue - totalInvested
  const totalReturnPercent = totalInvested > 0 ? (unrealizedGain / totalInvested) * 100 : 0

  // ── Computed Orders Dataset ──
  const [orderFilter, setOrderFilter] = useState<"ALL" | "FILLED" | "PENDING">("ALL")
  const liveOrders = useMemo(() => {
    return (backendOrders || []).map((ord) => ({
      id: ord.orderNumber || ord.id,
      company: ord.companyName,
      instrument: ord.shareClass || "Class A Common",
      amount: `$${(ord.totalAmount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      shares: `${(ord.shares ?? 0).toLocaleString()} @ $${(ord.pricePerShare ?? 0).toFixed(2)}`,
      date: ord.executedAt ? ord.executedAt.replace("T", " ").slice(0, 19) : "Recently",
      status: ord.status,
      statusLabel: ord.status === "FILLED" ? "Executed & Settled" : "Pending Escrow Signature",
      badge: ord.status === "FILLED" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500",
    }))
  }, [backendOrders])

  // ── Equities Market Index State & Filtering (tab === "index") ──
  const [indexSearchQuery, setIndexSearchQuery] = useState("")
  const [indexSortBy, setIndexSortBy] = useState<"name" | "valuation" | "founded" | "employees">("valuation")
  const [indexViewMode, setIndexViewMode] = useState<"table" | "grid">("table")
  const [indexSelectedLetter, setIndexSelectedLetter] = useState("ALL")
  const [indexSelectedSector, setIndexSelectedSector] = useState("All")
  const indexSectorList = ["All", "AI & ML", "CleanTech", "Fintech", "SpaceTech", "Biotech", "SaaS", "Robotics"]
  const alphabetLetters = ["ALL", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")]

  const filteredCompaniesIndex = useMemo(() => {
    return companies
      .filter((comp) => {
        const q = indexSearchQuery.toLowerCase().trim()
        const matchesQuery =
          !q ||
          (comp.name || "").toLowerCase().includes(q) ||
          (comp.ticker || "").toLowerCase().includes(q) ||
          (comp.sector || "").toLowerCase().includes(q) ||
          (comp.subIndustry || "").toLowerCase().includes(q) ||
          (comp.ceo || "").toLowerCase().includes(q) ||
          (comp.headquarters || "").toLowerCase().includes(q)

        const matchesLetter =
          indexSelectedLetter === "ALL" ||
          (comp.name || "").toUpperCase().startsWith(indexSelectedLetter)

        const matchesSector =
          indexSelectedSector === "All" || comp.sector === indexSelectedSector

        return matchesQuery && matchesLetter && matchesSector
      })
      .sort((a, b) => {
        if (indexSortBy === "name") {
          return (a.name || "").localeCompare(b.name || "")
        } else if (indexSortBy === "valuation") {
          return (b.valuationNum || 0) - (a.valuationNum || 0)
        } else if (indexSortBy === "founded") {
          return (b.foundedYear || 0) - (a.foundedYear || 0)
        } else if (indexSortBy === "employees") {
          return (b.employees || 0) - (a.employees || 0)
        }
        return 0
      })
  }, [companies, indexSearchQuery, indexSelectedLetter, indexSelectedSector, indexSortBy])

  const handleToggleWatchlist = (sym: string) => {
    toggleWatchlist(sym)
    const watchedNow = !isWatched(sym)
    triggerToast(watchedNow ? `Added ${sym} to Watchlist` : `Removed ${sym} from Watchlist`)
  }

  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleSelectStock = (sym: string) => {
    setInspectorSymbol(sym)
    const comp = companies.find((c) => (c.ticker || "").toUpperCase() === sym.toUpperCase())
    recentVisitsService.recordVisit({
      id: sym,
      ticker: sym,
      name: comp?.name || sym,
      shortName: comp?.shortName || sym,
      sector: comp?.sector || "Public Equities",
      valuation: comp?.valuation,
      logoColor: comp?.logoColor,
      type: "stock",
    })
  }

  // Enriched stock items for card view
  const stockItems: StockTableItem[] = useMemo(() => {
    return companies.map((c) => {
      const ticker = (c.ticker || "").toUpperCase()
      const q = backendQuotes[ticker]

      const hash = (ticker + (c.name || "WQ")).split("").reduce((a, ch) => a + ch.charCodeAt(0), 0)
      const fallbackPrice = Number((hash % 450) + 18) + Number((hash % 99) / 100)
      const fallbackChangePercent = ((hash % 1500) - 650) / 100
      const fallbackChangeAmt = fallbackPrice * (fallbackChangePercent / 100)

      const price = q ? Number(q.price) : fallbackPrice
      const changePercent = q ? Number(q.changePercent) : fallbackChangePercent
      const changeAmount = q ? Number(q.changeAmount) : fallbackChangeAmt
      const isPositive = q ? q.isPositive : changePercent >= 0

      const dayLow = q && q.low24h ? Number(q.low24h) : Math.min(price, price - changeAmount) * 0.985
      const dayHigh = q && q.high24h ? Number(q.high24h) : Math.max(price, price - changeAmount) * 1.015
      const low52w = q && q.low52w ? Number(q.low52w) : price * 0.72
      const high52w = q && q.high52w ? Number(q.high52w) : price * 1.35
      const volume = q && q.volume ? Number(q.volume) : ((hash * 1337) % 850000) + 50000
      const volumeStr = q && q.volumeStr ? q.volumeStr : volume.toLocaleString()

      return {
        id: c.id,
        ticker,
        name: c.name || ticker,
        shortName: c.shortName || ticker,
        sector: c.sector || "General",
        exchangeTier: c.exchangeTier || "Tier-1 Institutional",
        logoColor: c.logoColor || "bg-emerald-600",
        valuation: c.valuation || "$100.0M",
        valuationNum: c.valuationNum || 100000000,
        price,
        changeAmount,
        changePercent,
        isPositive,
        dayLow,
        dayHigh,
        low52w,
        high52w,
        volume,
        volumeStr,
        marketCap: c.valuation || `$${((price * 2500000) / 1e6).toFixed(1)}M`,
        peRatio: ((hash % 30) + 12).toFixed(1),
      }
    })
  }, [companies, backendQuotes])

  return (
    <div className="w-full min-h-screen bg-[var(--wq-bg)]">
      {/* ── TOP LIVE MARKET INDICES TICKER: DIRECTLY BELOW MAIN NAVBAR ── */}
      <div className="sticky top-16 z-20 bg-[var(--wq-bg)]/95 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800/80 shadow-2xs">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-1.5">
          <AppErrorBoundary
            title="Market Indices Unavailable"
            fallbackMessage="Live market composite telemetry temporarily unavailable."
          >
            <MarketIndicesTicker
              indices={backendIndices}
              isConnected={sseConnected}
              lastTick={lastTick}
            />
          </AppErrorBoundary>
        </div>
      </div>

      <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* ── TOP HERO BANNER: MARKET TITLE & SUB-NAV CONTROLS ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#00d09c]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#00d09c] font-mono">
                White Quantex Public Equities Terminal
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Stock Market Operations & Terminal
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
              Institutional equities trading, market indices composite, verified cap-table holdings, and real-time order depth.
            </p>
          </div>

          {/* Top Refresh & Secondary Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                refetch()
                triggerToast("Market data refreshed from PostgreSQL")
              }}
              title="Refresh market data"
              className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* ── SUB-NAVIGATION TABS BAR (SCREENER, INDEX, HOLDINGS, ORDERS, WATCHLIST) ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-1.5 rounded-2xl bg-slate-100/80 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800/80">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {[
              { id: "screener", label: "Stock Screener", icon: BarChart3, count: companies.length },
              { id: "index", label: "Market Indices & Index", icon: Layers, count: backendIndices.length },
              { id: "positions", label: "Stock Holdings", icon: Briefcase, count: livePositions.length },
              { id: "orders", label: "Market Orders", icon: FileCheck, count: liveOrders.length },
              { id: "watchlist", label: "Watchlist", icon: Bookmark, count: watchlist.length },
            ].map((tab) => {
              const isActive = activeNavTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                    isActive
                      ? "bg-slate-900 text-white dark:bg-white dark:text-zinc-950 shadow-xs font-bold"
                      : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-zinc-800/60"
                  }`}
                >
                  <tab.icon className={`h-4 w-4 ${isActive ? "text-[#00d09c]" : "text-slate-400 dark:text-zinc-500"}`} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? "bg-emerald-500/20 text-[#00d09c]"
                          : "bg-slate-200/80 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Screener View Mode Toggle (Shown on Screener Tab) */}
          {activeNavTab === "screener" && (
            <div className="inline-flex p-1 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === "table"
                    ? "bg-slate-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <TableIcon className="h-3.5 w-3.5" />
                <span>Screener</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === "cards"
                    ? "bg-slate-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>Cards</span>
              </button>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 1. TAB: SCREENER (CORE MARKET SCREENER & RECENTLY VIEWED STOCKS)     */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeNavTab === "screener" && (
          <div className="space-y-6">
            {/* Recently Viewed Stocks Row */}
            <div className="p-3.5 sm:p-4 space-y-3 bg-white dark:bg-zinc-900/40 border border-slate-200/80 dark:border-zinc-800/60 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-emerald-500/10 flex items-center justify-center">
                    <Eye className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Recently Viewed Stocks
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                  {recentStocks.length} Tracked
                </span>
              </div>

              {recentStocks.length === 0 ? (
                <div className="py-6 px-4 text-center rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-dashed border-slate-200 dark:border-zinc-800 my-1">
                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                    No recently viewed stocks yet. Click on any equity in the screener to inspect its order book and live trajectory.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1.5 sm:gap-2.5 lg:gap-3 py-1">
                  {recentStocks.map((stk, idx) => {
                    const liveQ = backendQuotes[stk.ticker?.toUpperCase()]
                    const changeText = liveQ ? liveQ.changePercentStr : (stk.change || "+0.0%")
                    const isPos = liveQ ? liveQ.isPositive : (stk.isPositive !== false)

                    return (
                      <button
                        key={`${stk.ticker}-${idx}`}
                        type="button"
                        onClick={() => handleSelectStock(stk.ticker)}
                        className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-slate-100/80 dark:hover:bg-zinc-800/60 border border-transparent hover:border-slate-200/80 dark:hover:border-zinc-700/50 transition-all text-center group cursor-pointer w-full"
                      >
                        <div
                          className={`h-11 w-11 rounded-full flex items-center justify-center text-white font-extrabold text-xs shadow-xs mb-1.5 group-hover:scale-105 transition-transform ring-2 ring-slate-200/90 dark:ring-zinc-800 shrink-0 ${stk.logoColor || "bg-indigo-600"}`}
                        >
                          {stk.ticker.substring(0, 2)}
                        </div>
                        <span className="font-bold text-slate-900 dark:text-zinc-200 text-[11px] sm:text-xs truncate w-full group-hover:text-emerald-600 dark:group-hover:text-[#00d09c] transition-colors">
                          {stk.shortName || stk.name || stk.ticker}
                        </span>
                        <span
                          className={`text-[11px] sm:text-xs font-extrabold mt-0.5 ${
                            isPos ? "text-emerald-600 dark:text-[#00d09c]" : "text-rose-600 dark:text-rose-500"
                          }`}
                        >
                          {changeText}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Primary Stock Screener / Cards View */}
            <AppErrorBoundary
              title="Stock Screener Error"
              fallbackMessage="An error occurred while loading the stock screener. Please refresh."
            >
              {viewMode === "table" ? (
                <StockScreenerTable
                  companies={companies}
                  quotes={backendQuotes}
                  watchlist={watchlist}
                  onToggleWatchlist={handleToggleWatchlist}
                  onSelectStock={handleSelectStock}
                />
              ) : (
                <StockMetricCards
                  items={stockItems}
                  watchlist={watchlist}
                  onToggleWatchlist={handleToggleWatchlist}
                  onSelectStock={handleSelectStock}
                />
              )}
            </AppErrorBoundary>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 2. TAB: INDEX (COMPOSITE INDICES & EQUITIES MARKET INDEX DIRECTORY)  */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeNavTab === "index" && (
          <div className="space-y-6">
            {/* Composite Market Indices Telemetry Cards */}
            <div className="p-4 sm:p-6 bg-white dark:bg-[#07090b] rounded-2xl shadow-xs border border-slate-200/80 dark:border-zinc-800/60 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-[#00d09c]" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Institutional Benchmark Indices Telemetry
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  Continuous SSE Synced • {backendIndices.length} Benchmark Indicators
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {backendIndices.map((idx) => {
                  const isPos = idx.isPositive ?? (idx.changePercent ? Number(idx.changePercent) >= 0 : true)
                  return (
                    <div
                      key={idx.symbol}
                      className="p-4 rounded-xl bg-slate-50/80 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800/60 space-y-2 hover:border-[#00d09c]/40 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-slate-500 uppercase">{idx.symbol}</span>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            isPos
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-[#00d09c]"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {isPos ? <TrendingUp className="h-3 w-3" /> : <TrendingUp className="h-3 w-3 rotate-180" />}
                          {idx.changeStr || (idx.changePercent ? `${Number(idx.changePercent).toFixed(2)}%` : "+0.00%")}
                        </span>
                      </div>
                      <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        {idx.valueStr || (idx.value ? Number(idx.value).toLocaleString() : "4,897.65")}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 pt-1 border-t border-slate-200/40 dark:border-zinc-800/40">
                        <span className="truncate">{idx.name}</span>
                        <span className="font-mono font-semibold">{idx.volume || "$1.48B"}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Complete Equities Market Index Directory */}
            <AppErrorBoundary
              title="Equities Index Error"
              fallbackMessage="An error occurred while loading the equities index."
            >
              <div className="bg-white dark:bg-[#07090b] rounded-2xl shadow-xs border border-slate-200/80 dark:border-zinc-800/60 overflow-hidden">
                <ExploreIndexTab
                  allCompanies={companies}
                  filteredCompaniesIndex={filteredCompaniesIndex}
                  totalRegisteredCount={backendOverview?.totalRegisteredCompanies || companies.length || 0}
                  aggregateValuation={backendOverview?.aggregateValuation}
                  legalEntitiesRatio={backendOverview?.legalEntitiesRatio}
                  averageTrustScore={backendOverview?.averageTrustScore}
                  indexSearchQuery={indexSearchQuery}
                  setIndexSearchQuery={setIndexSearchQuery}
                  indexSortBy={indexSortBy}
                  setIndexSortBy={setIndexSortBy}
                  indexViewMode={indexViewMode}
                  setIndexViewMode={setIndexViewMode}
                  indexSelectedLetter={indexSelectedLetter}
                  setIndexSelectedLetter={setIndexSelectedLetter}
                  indexSelectedSector={indexSelectedSector}
                  setIndexSelectedSector={setIndexSelectedSector}
                  alphabetLetters={alphabetLetters}
                  indexSectorList={indexSectorList}
                  onSelectCompany={(comp) => handleSelectStock(comp.ticker)}
                  entityLabel="Public Equities"
                />
              </div>
            </AppErrorBoundary>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 3. TAB: HOLDINGS (VERIFIED STOCK POSITIONS & CAP-TABLE ALLOCATION)    */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeNavTab === "positions" && (
          <AppErrorBoundary
            title="Stock Holdings Error"
            fallbackMessage="An error occurred while loading stock holdings."
          >
            <div className="bg-white dark:bg-[#07090b] rounded-2xl shadow-xs border border-slate-200/80 dark:border-zinc-800/60 overflow-hidden">
              <ExplorePositionsTab
                portfolioValue={portfolioValue}
                totalInvested={totalInvested}
                unrealizedGain={unrealizedGain}
                totalReturnPercent={totalReturnPercent}
                livePositions={livePositions}
                onOpenDossier={(pos) => handleSelectStock(pos.ticker)}
                entityLabel="Stocks"
              />
            </div>
          </AppErrorBoundary>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 4. TAB: ORDERS (MARKET ORDER EXECUTIONS & SETTLEMENT AUDIT TRAIL)    */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeNavTab === "orders" && (
          <AppErrorBoundary
            title="Market Orders Error"
            fallbackMessage="An error occurred while loading market orders."
          >
            <div className="bg-white dark:bg-[#07090b] rounded-2xl shadow-xs border border-slate-200/80 dark:border-zinc-800/60 overflow-hidden">
              <ExploreOrdersTab
                liveOrders={liveOrders}
                orderFilter={orderFilter}
                entityLabel="Stocks"
              />
            </div>
          </AppErrorBoundary>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* 5. TAB: WATCHLIST (EQUITIES WATCHLIST & CURATED BASKETS)             */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeNavTab === "watchlist" && (
          <AppErrorBoundary
            title="Stock Watchlist Error"
            fallbackMessage="An error occurred while loading your stock watchlist."
          >
            <div className="bg-white dark:bg-[#07090b] rounded-2xl shadow-xs border border-slate-200/80 dark:border-zinc-800/60 overflow-hidden">
              <ExploreWatchlistsTab
                activeNavTab="my_watchlist"
                allCompanies={companies}
                onOpenDossier={(c) => handleSelectStock(c.ticker || c.id)}
                entityLabel="Stocks"
              />
            </div>
          </AppErrorBoundary>
        )}
      </div>

      {/* ── MODAL / SLIDE-OUT DRAWER FOR STOCK INSPECTION ── */}
      {inspectorSymbol && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-slate-50 dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl p-4 sm:p-6 space-y-4">
            {/* Top Close & Full Page Link */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                Instant Stock Dossier Inspector
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate(`/markets/${inspectorSymbol}`)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-zinc-950 text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5"
                >
                  <span>Open Full Page</span>
                  <ExternalLink className="h-3 w-3" />
                </button>

                <button
                  type="button"
                  onClick={() => setInspectorSymbol(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                  title="Close Inspector"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Embedded Dedicated Stock Detail View */}
            <AppErrorBoundary
              title="Stock Detail Error"
              fallbackMessage="Unable to load stock details."
            >
              <StockDetailView
                symbol={inspectorSymbol}
                isWatched={isWatched(inspectorSymbol)}
                onToggleWatchlist={handleToggleWatchlist}
                onClose={() => setInspectorSymbol(null)}
              />
            </AppErrorBoundary>
          </div>
        </div>
      )}

      {/* ── GLOBAL TOAST NOTIFICATION ── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-3.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-zinc-950 shadow-2xl flex items-center gap-2 text-xs font-bold border border-slate-800 dark:border-zinc-200 animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="h-4 w-4 text-[#00d09c]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}
