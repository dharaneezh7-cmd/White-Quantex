import React, { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate, Link } from "react-router"
import {
  Briefcase,
  TrendingUp,
  TrendingDown,
  Building2,
  Rocket,
  LineChart,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  RefreshCw,
  PieChart,
  Sparkles,
  BarChart2,
  LayoutGrid,
  List,
  Calendar,
  Clock,
} from "lucide-react"
import { holdingsService, HoldingItem } from "@/services/holdings/holdingsService"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type PlStatus = "PROFIT" | "LOSS" | "NEUTRAL"
type DayChangeStatus = "UP" | "DOWN" | "NEUTRAL"

export default function HoldingsPage() {
  const navigate = useNavigate()

  // Local controls state
  const [activeDivisionTab, setActiveDivisionTab] = useState<"ALL" | "COMPANY" | "VENTURE" | "STOCK">("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"VALUE_DESC" | "PL_DESC" | "PL_ASC" | "NAME_ASC">("VALUE_DESC")
  const [viewMode, setViewMode] = useState<"table" | "cards">("table")

  // Query holdings data
  const { data: holdingsData, refetch, isFetching } = useQuery({
    queryKey: ["user-holdings"],
    queryFn: () => holdingsService.getHoldings(),
    staleTime: 30000,
  })

  const summary = holdingsData?.summary
  const companies = holdingsData?.companies || []
  const ventures = holdingsData?.ventures || []
  const stocks = holdingsData?.stocks || []
  const allHoldings = holdingsData?.all || []

  // Formatting helpers
  const formatCurrency = (val?: number) => {
    if (val === undefined || isNaN(val)) return "$0.00"
    return `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatPercent = (val?: number) => {
    if (val === undefined || isNaN(val)) return "0.00%"
    const sign = val > 0 ? "+" : ""
    return `${sign}${val.toFixed(2)}%`
  }

  // Display profit/loss amount only (no percentage)
  const formatProfitAmountOnly = (val?: number) => {
    if (val === undefined || isNaN(val) || val === 0) return "$0.00"
    const sign = val > 0 ? "+" : "-"
    const absVal = Math.abs(val)
    return `${sign}$${absVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  // Filter and sort items within a division
  const processHoldingsList = (list: HoldingItem[]) => {
    let result = list.filter((item) => {
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase().trim()
      return (
        item.name.toLowerCase().includes(q) ||
        item.symbol.toLowerCase().includes(q) ||
        item.sector.toLowerCase().includes(q)
      )
    })

    result.sort((a, b) => {
      if (sortBy === "VALUE_DESC") return b.currentValue - a.currentValue
      if (sortBy === "PL_DESC") return b.unrealizedPlPercent - a.unrealizedPlPercent
      if (sortBy === "PL_ASC") return a.unrealizedPlPercent - b.unrealizedPlPercent
      if (sortBy === "NAME_ASC") return a.name.localeCompare(b.name)
      return 0
    })

    return result
  }

  const filteredCompanies = useMemo(() => processHoldingsList(companies), [companies, searchQuery, sortBy])
  const filteredVentures = useMemo(() => processHoldingsList(ventures), [ventures, searchQuery, sortBy])
  const filteredStocks = useMemo(() => processHoldingsList(stocks), [stocks, searchQuery, sortBy])
  const filteredAll = useMemo(() => processHoldingsList(allHoldings), [allHoldings, searchQuery, sortBy])

  // Asset allocation percentages (0.0 if empty)
  const compAlloc = summary && summary.totalValue > 0 ? ((summary.companiesValue / summary.totalValue) * 100).toFixed(1) : "0.0"
  const ventAlloc = summary && summary.totalValue > 0 ? ((summary.venturesValue / summary.totalValue) * 100).toFixed(1) : "0.0"
  const stkAlloc = summary && summary.totalValue > 0 ? ((summary.stocksValue / summary.totalValue) * 100).toFixed(1) : "0.0"

  const determinePlStatus = (pl: number, cost: number): PlStatus => {
    if (cost === 0 && pl === 0) return "NEUTRAL"
    if (pl > 0) return "PROFIT"
    if (pl < 0) return "LOSS"
    return "NEUTRAL"
  }

  // Dynamic division-specific computed metrics for the 6 cards (including 1-Day & 1-Month profit amounts)
  const divisionMetrics = useMemo(() => {
    const compVal = summary?.companiesValue ?? companies.reduce((acc, c) => acc + c.currentValue, 0)
    const compCost = companies.reduce((acc, c) => acc + c.costBasis, 0)
    const compPl = summary?.companiesPl ?? (compVal - compCost)
    const compPlPct = summary?.companiesPlPercent ?? (compCost > 0 ? (compPl / compCost) * 100 : 0)
    const compShares = companies.reduce((acc, c) => acc + c.shares, 0)
    const compDayPl = summary?.companiesDayPl ?? 0
    const compMonthPl = summary?.companiesMonthPl ?? 0

    const ventVal = summary?.venturesValue ?? ventures.reduce((acc, v) => acc + v.currentValue, 0)
    const ventCost = ventures.reduce((acc, v) => acc + v.costBasis, 0)
    const ventPl = summary?.venturesPl ?? (ventVal - ventCost)
    const ventPlPct = summary?.venturesPlPercent ?? (ventCost > 0 ? (ventPl / ventCost) * 100 : 0)
    const ventShares = ventures.reduce((acc, v) => acc + v.shares, 0)
    const ventDayPl = summary?.venturesDayPl ?? 0
    const ventMonthPl = summary?.venturesMonthPl ?? 0

    const stkVal = summary?.stocksValue ?? stocks.reduce((acc, s) => acc + s.currentValue, 0)
    const stkCost = stocks.reduce((acc, s) => acc + s.costBasis, 0)
    const stkPl = summary?.stocksPl ?? (stkVal - stkCost)
    const stkPlPct = summary?.stocksPlPercent ?? (stkCost > 0 ? (stkPl / stkCost) * 100 : 0)
    const stkShares = stocks.reduce((acc, s) => acc + s.shares, 0)
    const stkDayPl = summary?.stocksDayPl ?? 0
    const stkMonthPl = summary?.stocksMonthPl ?? 0

    const allVal = summary?.totalValue ?? allHoldings.reduce((acc, a) => acc + a.currentValue, 0)
    const allCost = summary?.totalCostBasis ?? allHoldings.reduce((acc, a) => acc + a.costBasis, 0)
    const allPl = summary?.totalUnrealizedPl ?? (allVal - allCost)
    const allPlPct = summary?.totalUnrealizedPlPercent ?? (allCost > 0 ? (allPl / allCost) * 100 : 0)
    const allDayPl = summary?.dayChangeAmount ?? 0
    const allMonthPl = summary?.monthChangeAmount ?? 0

    if (activeDivisionTab === "COMPANY") {
      const plStatus = determinePlStatus(compPl, compCost)
      const dayStatus: PlStatus = compDayPl > 0 ? "PROFIT" : compDayPl < 0 ? "LOSS" : "NEUTRAL"
      const monthStatus: PlStatus = compMonthPl > 0 ? "PROFIT" : compMonthPl < 0 ? "LOSS" : "NEUTRAL"

      return {
        sectionTitle: "ESTABLISHED COMPANIES EQUITY PERFORMANCE",
        itemCountLabel: `${companies.length} Delaware C-Corp Positions`,
        cardValue: {
          label: "Companies Value",
          value: compVal,
          subText: compVal > 0 ? `${compAlloc}% of total portfolio` : "0.0% of portfolio",
        },
        cardTotalPl: {
          label: "Total Profit / Loss",
          value: compPl,
          percent: compPlPct,
          plStatus,
          subText: plStatus === "PROFIT" ? "Net Appreciation" : plStatus === "LOSS" ? "Net Drawdown" : "No active return",
        },
        cardDayPl: {
          label: "1-Day Profit / Loss",
          amount: compDayPl,
          status: dayStatus,
          subText: "24h profit amount",
        },
        cardMonthPl: {
          label: "1-Month Profit / Loss",
          amount: compMonthPl,
          status: monthStatus,
          subText: "30d profit amount",
        },
        cardCostBasis: {
          label: "Companies Cost Basis",
          value: compCost,
          subText: "Capital committed",
        },
        cardAllocation: {
          title: "Position Overview",
          metric1Label: "Delaware C-Corps",
          metric1Value: `${companies.length} Active`,
          metric2Label: "Total Shares",
          metric2Value: compShares.toLocaleString(),
          metric3Label: "Portfolio Share",
          metric3Value: `${compAlloc}%`,
        },
      }
    }

    if (activeDivisionTab === "VENTURE") {
      const plStatus = determinePlStatus(ventPl, ventCost)
      const dayStatus: PlStatus = ventDayPl > 0 ? "PROFIT" : ventDayPl < 0 ? "LOSS" : "NEUTRAL"
      const monthStatus: PlStatus = ventMonthPl > 0 ? "PROFIT" : ventMonthPl < 0 ? "LOSS" : "NEUTRAL"

      return {
        sectionTitle: "VENTURE CAPITAL & STARTUP PERFORMANCE",
        itemCountLabel: `${ventures.length} Startup Positions`,
        cardValue: {
          label: "Ventures Value",
          value: ventVal,
          subText: ventVal > 0 ? `${ventAlloc}% of total portfolio` : "0.0% of portfolio",
        },
        cardTotalPl: {
          label: "Total Profit / Loss",
          value: ventPl,
          percent: ventPlPct,
          plStatus,
          subText: plStatus === "PROFIT" ? "Net Appreciation" : plStatus === "LOSS" ? "Net Drawdown" : "No active return",
        },
        cardDayPl: {
          label: "1-Day Profit / Loss",
          amount: ventDayPl,
          status: dayStatus,
          subText: "24h profit amount",
        },
        cardMonthPl: {
          label: "1-Month Profit / Loss",
          amount: ventMonthPl,
          status: monthStatus,
          subText: "30d profit amount",
        },
        cardCostBasis: {
          label: "Ventures Cost Basis",
          value: ventCost,
          subText: "Capital committed",
        },
        cardAllocation: {
          title: "Position Overview",
          metric1Label: "Seed / SAFE Notes",
          metric1Value: `${ventures.length} Active`,
          metric2Label: "Total Units",
          metric2Value: ventShares.toLocaleString(),
          metric3Label: "Portfolio Share",
          metric3Value: `${ventAlloc}%`,
        },
      }
    }

    if (activeDivisionTab === "STOCK") {
      const plStatus = determinePlStatus(stkPl, stkCost)
      const dayStatus: PlStatus = stkDayPl > 0 ? "PROFIT" : stkDayPl < 0 ? "LOSS" : "NEUTRAL"
      const monthStatus: PlStatus = stkMonthPl > 0 ? "PROFIT" : stkMonthPl < 0 ? "LOSS" : "NEUTRAL"

      return {
        sectionTitle: "STOCK MARKET & LISTED EQUITIES PERFORMANCE",
        itemCountLabel: `${stocks.length} Market Equities Positions`,
        cardValue: {
          label: "Stock Market Value",
          value: stkVal,
          subText: stkVal > 0 ? `${stkAlloc}% of total portfolio` : "0.0% of portfolio",
        },
        cardTotalPl: {
          label: "Total Profit / Loss",
          value: stkPl,
          percent: stkPlPct,
          plStatus,
          subText: plStatus === "PROFIT" ? "Net Appreciation" : plStatus === "LOSS" ? "Net Drawdown" : "No active return",
        },
        cardDayPl: {
          label: "1-Day Profit / Loss",
          amount: stkDayPl,
          status: dayStatus,
          subText: "24h profit amount",
        },
        cardMonthPl: {
          label: "1-Month Profit / Loss",
          amount: stkMonthPl,
          status: monthStatus,
          subText: "30d profit amount",
        },
        cardCostBasis: {
          label: "Stock Market Cost Basis",
          value: stkCost,
          subText: "Capital committed",
        },
        cardAllocation: {
          title: "Position Overview",
          metric1Label: "Listed Equities",
          metric1Value: `${stocks.length} Active`,
          metric2Label: "Total Shares",
          metric2Value: stkShares.toLocaleString(),
          metric3Label: "Portfolio Share",
          metric3Value: `${stkAlloc}%`,
        },
      }
    }

    // Default "ALL"
    const plStatus = determinePlStatus(allPl, allCost)
    const dayStatus: PlStatus = allDayPl > 0 ? "PROFIT" : allDayPl < 0 ? "LOSS" : "NEUTRAL"
    const monthStatus: PlStatus = allMonthPl > 0 ? "PROFIT" : allMonthPl < 0 ? "LOSS" : "NEUTRAL"

    return {
      sectionTitle: "OVERALL PORTFOLIO PERFORMANCE & ASSET ALLOCATION",
      itemCountLabel: `${allHoldings.length} Total Registered Asset Positions`,
      cardValue: {
        label: "Total Holdings Value",
        value: allVal,
        subText: allVal > 0 ? "Active portfolio valuation" : "No portfolio valuation",
      },
      cardTotalPl: {
        label: "Total Profit / Loss",
        value: allPl,
        percent: allPlPct,
        plStatus,
        subText: plStatus === "PROFIT" ? "Net Capital Appreciation" : plStatus === "LOSS" ? "Net Capital Drawdown" : "No active capital return",
      },
      cardDayPl: {
        label: "1-Day Profit / Loss",
        amount: allDayPl,
        status: dayStatus,
        subText: "24h profit amount",
      },
      cardMonthPl: {
        label: "1-Month Profit / Loss",
        amount: allMonthPl,
        status: monthStatus,
        subText: "30d profit amount",
      },
      cardCostBasis: {
        label: "Total Invested (Cost Basis)",
        value: allCost,
        subText: "Principal capital committed",
      },
      cardAllocation: {
        title: "Active Division Holdings",
        metric1Label: "Companies:",
        metric1Value: `${companies.length} (${compAlloc}%)`,
        metric2Label: "Ventures:",
        metric2Value: `${ventures.length} (${ventAlloc}%)`,
        metric3Label: "Stocks:",
        metric3Value: `${stocks.length} (${stkAlloc}%)`,
      },
    }
  }, [activeDivisionTab, summary, companies, ventures, stocks, allHoldings, compAlloc, ventAlloc, stkAlloc])

  return (
    <div className="w-full min-h-screen bg-[var(--wq-bg)]">
      {/* ── TOP HOLDINGS SUB-NAVBAR (Directly below website main navbar) ── */}
      <div className="sticky top-16 z-30 bg-[var(--wq-bg)]/95 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left: Division Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setActiveDivisionTab("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeDivisionTab === "ALL"
                  ? "bg-[#00d09c] text-slate-950 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/60"
              }`}
            >
              <Briefcase className="h-3.5 w-3.5" />
              <span>All Holdings</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold ${
                activeDivisionTab === "ALL" ? "bg-slate-950/20 text-slate-950" : "bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-slate-400"
              }`}>
                {allHoldings.length}
              </span>
            </button>

            <button
              onClick={() => setActiveDivisionTab("COMPANY")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeDivisionTab === "COMPANY"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/60"
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>Companies</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold ${
                activeDivisionTab === "COMPANY" ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-slate-400"
              }`}>
                {companies.length}
              </span>
            </button>

            <button
              onClick={() => setActiveDivisionTab("VENTURE")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeDivisionTab === "VENTURE"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/60"
              }`}
            >
              <Rocket className="h-3.5 w-3.5" />
              <span>Ventures</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold ${
                activeDivisionTab === "VENTURE" ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-slate-400"
              }`}>
                {ventures.length}
              </span>
            </button>

            <button
              onClick={() => setActiveDivisionTab("STOCK")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeDivisionTab === "STOCK"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/60"
              }`}
            >
              <LineChart className="h-3.5 w-3.5" />
              <span>Stock Market</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold ${
                activeDivisionTab === "STOCK" ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-slate-400"
              }`}>
                {stocks.length}
              </span>
            </button>
          </div>

          {/* Right: Search, Sort, View Toggle, Refresh Quotes */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative w-36 sm:w-48">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search holdings..."
                className="h-8 pl-8 text-xs bg-slate-100 dark:bg-zinc-900/80 rounded-lg border-slate-200 dark:border-zinc-800"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-8 px-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900 text-xs text-slate-700 dark:text-slate-300 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="VALUE_DESC">Highest Value</option>
              <option value="PL_DESC">Highest Profit %</option>
              <option value="PL_ASC">Highest Loss %</option>
              <option value="NAME_ASC">Name (A-Z)</option>
            </select>

            <div className="flex items-center p-0.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900">
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  viewMode === "table" ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs" : "text-slate-400 hover:text-slate-200"
                }`}
                title="Table View"
              >
                <List className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  viewMode === "cards" ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs" : "text-slate-400 hover:text-slate-200"
                }`}
                title="Card Grid View"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => refetch()}
              disabled={isFetching}
              className="h-8 px-2.5 text-xs font-semibold gap-1 rounded-lg border-slate-200 dark:border-zinc-800 cursor-pointer"
              title="Refresh Quotes"
            >
              <RefreshCw className={`h-3 w-3 ${isFetching ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>

            <Link to="/explore">
              <Button
                size="sm"
                className="h-8 px-2.5 text-xs font-bold bg-[#00d09c] hover:bg-[#00b588] text-slate-950 gap-1 rounded-lg shadow-xs cursor-pointer"
              >
                <Sparkles className="h-3 w-3" />
                <span className="hidden sm:inline">Explore</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
        {/* ── 1. DYNAMIC COMPACT METRIC CARDS (With 1-Day & 1-Month Profit Amounts) ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart2 className="h-3.5 w-3.5 text-[#00d09c]" />
              {divisionMetrics.sectionTitle}
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">
              {divisionMetrics.itemCountLabel}
            </span>
          </div>

          {/* 6 Responsive Reduced-Size Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Card 1: Holdings Value */}
            <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111315] shadow-xs relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-semibold mb-1">
                  <span className="truncate">{divisionMetrics.cardValue.label}</span>
                  {divisionMetrics.cardValue.value > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  )}
                </div>
                <div className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {formatCurrency(divisionMetrics.cardValue.value)}
                </div>
              </div>
              <div className="text-[10px] text-slate-400 mt-2 truncate">
                {divisionMetrics.cardValue.subText}
              </div>
            </div>

            {/* Card 2: Total Profit / Loss (All-Time) */}
            <div className={`p-3.5 sm:p-4 rounded-xl border ${
              divisionMetrics.cardTotalPl.plStatus === "PROFIT"
                ? "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/10"
                : divisionMetrics.cardTotalPl.plStatus === "LOSS"
                ? "border-rose-500/30 bg-rose-500/5 dark:bg-rose-950/10"
                : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111315]"
            } shadow-xs relative overflow-hidden flex flex-col justify-between`}>
              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold mb-1 text-slate-500 dark:text-slate-400">
                  <span className="truncate">{divisionMetrics.cardTotalPl.label}</span>
                  <Badge className={`text-[8px] px-1 py-0 font-extrabold border shrink-0 ${
                    divisionMetrics.cardTotalPl.plStatus === "PROFIT"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : divisionMetrics.cardTotalPl.plStatus === "LOSS"
                      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                      : "bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-zinc-700"
                  }`}>
                    {divisionMetrics.cardTotalPl.plStatus === "PROFIT"
                      ? "PROFIT"
                      : divisionMetrics.cardTotalPl.plStatus === "LOSS"
                      ? "LOSS"
                      : "NO P&L"}
                  </Badge>
                </div>
                <div className={`text-lg sm:text-xl font-extrabold tracking-tight flex items-baseline gap-1 ${
                  divisionMetrics.cardTotalPl.plStatus === "PROFIT"
                    ? "text-emerald-500 dark:text-emerald-400"
                    : divisionMetrics.cardTotalPl.plStatus === "LOSS"
                    ? "text-rose-500 dark:text-rose-400"
                    : "text-slate-700 dark:text-slate-300"
                }`}>
                  <span>{formatCurrency(divisionMetrics.cardTotalPl.value)}</span>
                  <span className="text-[10px] font-semibold">
                    ({formatPercent(divisionMetrics.cardTotalPl.percent)})
                  </span>
                </div>
              </div>
              <div className={`flex items-center gap-1 mt-2 text-[10px] font-bold ${
                divisionMetrics.cardTotalPl.plStatus === "PROFIT"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : divisionMetrics.cardTotalPl.plStatus === "LOSS"
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-slate-400"
              }`}>
                {divisionMetrics.cardTotalPl.plStatus === "PROFIT" && <ArrowUpRight className="h-3 w-3 shrink-0" />}
                {divisionMetrics.cardTotalPl.plStatus === "LOSS" && <ArrowDownRight className="h-3 w-3 shrink-0" />}
                <span className="truncate">{divisionMetrics.cardTotalPl.subText}</span>
              </div>
            </div>

            {/* Card 3: 1-Day Profit or Loss (PROFIT AMOUNT ONLY) */}
            <div className={`p-3.5 sm:p-4 rounded-xl border ${
              divisionMetrics.cardDayPl.status === "PROFIT"
                ? "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/10"
                : divisionMetrics.cardDayPl.status === "LOSS"
                ? "border-rose-500/30 bg-rose-500/5 dark:bg-rose-950/10"
                : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111315]"
            } shadow-xs relative overflow-hidden flex flex-col justify-between`}>
              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold mb-1 text-slate-500 dark:text-slate-400">
                  <span className="truncate">1-Day Profit / Loss</span>
                  <Badge className={`text-[8px] px-1 py-0 font-extrabold border shrink-0 ${
                    divisionMetrics.cardDayPl.status === "PROFIT"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : divisionMetrics.cardDayPl.status === "LOSS"
                      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                      : "bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-zinc-700"
                  }`}>
                    1D
                  </Badge>
                </div>
                {/* Profit Amount Only */}
                <div className={`text-lg sm:text-xl font-extrabold tracking-tight ${
                  divisionMetrics.cardDayPl.status === "PROFIT"
                    ? "text-emerald-500 dark:text-emerald-400"
                    : divisionMetrics.cardDayPl.status === "LOSS"
                    ? "text-rose-500 dark:text-rose-400"
                    : "text-slate-700 dark:text-slate-300"
                }`}>
                  {formatProfitAmountOnly(divisionMetrics.cardDayPl.amount)}
                </div>
              </div>
              <div className={`flex items-center gap-1 mt-2 text-[10px] font-bold ${
                divisionMetrics.cardDayPl.status === "PROFIT"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : divisionMetrics.cardDayPl.status === "LOSS"
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-slate-400"
              }`}>
                {divisionMetrics.cardDayPl.status === "PROFIT" && <ArrowUpRight className="h-3 w-3 shrink-0" />}
                {divisionMetrics.cardDayPl.status === "LOSS" && <ArrowDownRight className="h-3 w-3 shrink-0" />}
                <span className="truncate">{divisionMetrics.cardDayPl.subText}</span>
              </div>
            </div>

            {/* Card 4: 1-Month Profit or Loss (PROFIT AMOUNT ONLY) */}
            <div className={`p-3.5 sm:p-4 rounded-xl border ${
              divisionMetrics.cardMonthPl.status === "PROFIT"
                ? "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/10"
                : divisionMetrics.cardMonthPl.status === "LOSS"
                ? "border-rose-500/30 bg-rose-500/5 dark:bg-rose-950/10"
                : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111315]"
            } shadow-xs relative overflow-hidden flex flex-col justify-between`}>
              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold mb-1 text-slate-500 dark:text-slate-400">
                  <span className="truncate">1-Month Profit / Loss</span>
                  <Badge className={`text-[8px] px-1 py-0 font-extrabold border shrink-0 ${
                    divisionMetrics.cardMonthPl.status === "PROFIT"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : divisionMetrics.cardMonthPl.status === "LOSS"
                      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                      : "bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-zinc-700"
                  }`}>
                    1M
                  </Badge>
                </div>
                {/* Profit Amount Only */}
                <div className={`text-lg sm:text-xl font-extrabold tracking-tight ${
                  divisionMetrics.cardMonthPl.status === "PROFIT"
                    ? "text-emerald-500 dark:text-emerald-400"
                    : divisionMetrics.cardMonthPl.status === "LOSS"
                    ? "text-rose-500 dark:text-rose-400"
                    : "text-slate-700 dark:text-slate-300"
                }`}>
                  {formatProfitAmountOnly(divisionMetrics.cardMonthPl.amount)}
                </div>
              </div>
              <div className={`flex items-center gap-1 mt-2 text-[10px] font-bold ${
                divisionMetrics.cardMonthPl.status === "PROFIT"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : divisionMetrics.cardMonthPl.status === "LOSS"
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-slate-400"
              }`}>
                {divisionMetrics.cardMonthPl.status === "PROFIT" && <ArrowUpRight className="h-3 w-3 shrink-0" />}
                {divisionMetrics.cardMonthPl.status === "LOSS" && <ArrowDownRight className="h-3 w-3 shrink-0" />}
                <span className="truncate">{divisionMetrics.cardMonthPl.subText}</span>
              </div>
            </div>

            {/* Card 5: Invested Cost Basis */}
            <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111315] shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mb-1 truncate">
                  {divisionMetrics.cardCostBasis.label}
                </div>
                <div className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {formatCurrency(divisionMetrics.cardCostBasis.value)}
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 truncate">
                {divisionMetrics.cardCostBasis.subText}
              </p>
            </div>

            {/* Card 6: Division Detail / Breakdown */}
            <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111315] shadow-xs flex flex-col justify-between">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mb-1 flex items-center justify-between">
                <span className="truncate">{divisionMetrics.cardAllocation.title}</span>
                <PieChart className="h-3 w-3 text-slate-400 shrink-0" />
              </div>
              <div className="space-y-0.5 text-xs">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-500 flex items-center gap-1 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block shrink-0" /> {divisionMetrics.cardAllocation.metric1Label}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">{divisionMetrics.cardAllocation.metric1Value}</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-500 flex items-center gap-1 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 inline-block shrink-0" /> {divisionMetrics.cardAllocation.metric2Label}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">{divisionMetrics.cardAllocation.metric2Value}</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-500 flex items-center gap-1 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0" /> {divisionMetrics.cardAllocation.metric3Label}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">{divisionMetrics.cardAllocation.metric3Value}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Allocation Progress Bar (only on ALL view when portfolio > 0) */}
          {activeDivisionTab === "ALL" && summary && summary.totalValue > 0 && (
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111315] space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                <span>Portfolio Asset Allocation Split</span>
                <span className="text-slate-400 font-mono text-[10px]">100% Fully Allocated</span>
              </div>
              <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-slate-100 dark:bg-zinc-800">
                <div
                  style={{ width: `${compAlloc}%` }}
                  className="bg-indigo-500 h-full transition-all duration-500"
                  title={`Companies: ${compAlloc}%`}
                />
                <div
                  style={{ width: `${ventAlloc}%` }}
                  className="bg-purple-500 h-full transition-all duration-500"
                  title={`Ventures: ${ventAlloc}%`}
                />
                <div
                  style={{ width: `${stkAlloc}%` }}
                  className="bg-emerald-500 h-full transition-all duration-500"
                  title={`Stock Market: ${stkAlloc}%`}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── 2. DETAILED HOLDINGS DIVISIONS LIST OR EXPLORE DEALS ── */}
        {allHoldings.length === 0 ? (
          /* ── ZERO HOLDINGS EMPTY STATE: EXPLORE DEALS ── */
          <div className="p-8 sm:p-12 rounded-2xl border border-dashed border-slate-300 dark:border-zinc-800 bg-white dark:bg-[#111315] text-center space-y-6">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#00d09c]/10 text-[#00d09c] border border-[#00d09c]/20 flex items-center justify-center">
              <Sparkles className="h-7 w-7" />
            </div>

            <div className="max-w-lg mx-auto space-y-2">
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                No Assets in Your Portfolio Yet
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                You have not purchased any assets on White Quantex yet. When you buy shares in Delaware C-Corp companies, venture startups, or stock market equities, your live holdings, 1-day profit, and 1-month profit will appear here.
              </p>
            </div>

            {/* Primary CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link to="/explore">
                <Button className="h-10 px-5 text-xs font-bold bg-[#00d09c] hover:bg-[#00b588] text-slate-950 gap-2 rounded-xl shadow-md cursor-pointer">
                  <Sparkles className="h-4 w-4" />
                  <span>Explore Investment Deals</span>
                </Button>
              </Link>
              <Link to="/ventures">
                <Button variant="outline" className="h-10 px-5 text-xs font-semibold gap-2 rounded-xl border-slate-200 dark:border-zinc-800 cursor-pointer">
                  <Rocket className="h-4 w-4 text-purple-500" />
                  <span>Browse Venture Rounds</span>
                </Button>
              </Link>
              <Link to="/markets">
                <Button variant="outline" className="h-10 px-5 text-xs font-semibold gap-2 rounded-xl border-slate-200 dark:border-zinc-800 cursor-pointer">
                  <LineChart className="h-4 w-4 text-emerald-500" />
                  <span>Stock Market Screener</span>
                </Button>
              </Link>
            </div>

            {/* Feature cards explaining the 3 asset classes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 max-w-4xl mx-auto border-t border-slate-100 dark:border-zinc-800/80 text-left">
              <div className="p-4 rounded-xl border border-slate-100 dark:border-zinc-800/60 bg-slate-50/60 dark:bg-zinc-900/40 space-y-1.5">
                <div className="flex items-center gap-2 text-indigo-500 font-bold text-xs">
                  <Building2 className="h-4 w-4" />
                  <span>Established Companies</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Acquire vetted equity in Delaware C-Corps with institutional board covenants and governance protections.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 dark:border-zinc-800/60 bg-slate-50/60 dark:bg-zinc-900/40 space-y-1.5">
                <div className="flex items-center gap-2 text-purple-500 font-bold text-xs">
                  <Rocket className="h-4 w-4" />
                  <span>Venture Capital & Startups</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Participate in SAFE agreements and Series Seed/A funding rounds alongside top syndicates.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 dark:border-zinc-800/60 bg-slate-50/60 dark:bg-zinc-900/40 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs">
                  <LineChart className="h-4 w-4" />
                  <span>Secondary Market Stocks</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Trade secondary market equities with real-time price discovery and order book execution.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* ── REAL HOLDINGS LIST (Only when user bought assets) ── */
          <div className="space-y-6">
            {/* DIVISION 1: ESTABLISHED COMPANIES HOLDINGS */}
            {(activeDivisionTab === "ALL" || activeDivisionTab === "COMPANY") && (
              <HoldingDivisionSection
                title="Established Companies Holdings"
                icon={<Building2 className="h-4 w-4 text-indigo-500" />}
                badgeColor="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
                description="Vetted private enterprise equity and Delaware C-Corp share allocations on White Quantex."
                items={filteredCompanies}
                viewMode={viewMode}
                emptyMessage="No company holdings found in your portfolio."
                onItemClick={(item) => navigate(item.targetUrl)}
              />
            )}

            {/* DIVISION 2: VENTURE CAPITAL & STARTUP HOLDINGS */}
            {(activeDivisionTab === "ALL" || activeDivisionTab === "VENTURE") && (
              <HoldingDivisionSection
                title="Venture Capital & Startup Holdings"
                icon={<Rocket className="h-4 w-4 text-purple-500" />}
                badgeColor="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                description="Early-stage venture allocations, SAFE agreements, and Series Seed/A syndicate equity."
                items={filteredVentures}
                viewMode={viewMode}
                emptyMessage="No venture holdings found in your portfolio."
                onItemClick={(item) => navigate(item.targetUrl)}
              />
            )}

            {/* DIVISION 3: SECONDARY MARKET STOCKS HOLDINGS */}
            {(activeDivisionTab === "ALL" || activeDivisionTab === "STOCK") && (
              <HoldingDivisionSection
                title="Stock Market & Listed Equities Holdings"
                icon={<LineChart className="h-4 w-4 text-emerald-500" />}
                badgeColor="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                description="Exchange-listed secondary instruments with real-time institutional price discovery."
                items={filteredStocks}
                viewMode={viewMode}
                emptyMessage="No stock market holdings found in your portfolio."
                onItemClick={(item) => navigate(item.targetUrl)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Reusable Division Section for Companies, Ventures, and Stocks
 */
function HoldingDivisionSection({
  title,
  icon,
  badgeColor,
  description,
  items,
  viewMode,
  emptyMessage,
  onItemClick,
}: {
  title: string
  icon: React.ReactNode
  badgeColor: string
  description: string
  items: HoldingItem[]
  viewMode: "table" | "cards"
  emptyMessage: string
  onItemClick: (item: HoldingItem) => void
}) {
  const formatCurrency = (val?: number) => {
    if (val === undefined || isNaN(val)) return "$0.00"
    return `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatPercent = (val?: number) => {
    if (val === undefined || isNaN(val)) return "0.00%"
    const sign = val > 0 ? "+" : ""
    return `${sign}${val.toFixed(2)}%`
  }

  // Calculate division sub-totals
  const totalVal = items.reduce((acc, i) => acc + i.currentValue, 0)
  const totalCost = items.reduce((acc, i) => acc + i.costBasis, 0)
  const totalPl = totalVal - totalCost
  const totalPlPct = totalCost > 0 ? (totalPl / totalCost) * 100 : 0
  const isDivisionProfit = totalPl > 0
  const isDivisionLoss = totalPl < 0

  return (
    <div className="p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111315] shadow-xs space-y-4">
      {/* Division Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              {title}
            </h3>
            <Badge className={`text-[10px] font-bold border ${badgeColor}`}>
              {items.length} POSITIONS
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {description}
          </p>
        </div>

        {/* Division Summary Quick Stats */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Value</span>
            <span className="font-extrabold text-slate-900 dark:text-white">
              {formatCurrency(totalVal)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Division Return</span>
            <span className={`font-extrabold flex items-center justify-end gap-1 ${
              isDivisionProfit ? "text-emerald-500" : isDivisionLoss ? "text-rose-500" : "text-slate-400"
            }`}>
              {isDivisionProfit && <TrendingUp className="h-3 w-3" />}
              {isDivisionLoss && <TrendingDown className="h-3 w-3" />}
              {formatPercent(totalPlPct)} ({formatCurrency(totalPl)})
            </span>
          </div>
        </div>
      </div>

      {/* Items Container */}
      {items.length === 0 ? (
        <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 text-slate-400 text-xs">
          {emptyMessage}
        </div>
      ) : viewMode === "table" ? (
        /* ── TABLE VIEW ── */
        <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-zinc-800/60">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50/75 dark:bg-zinc-900/60 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Asset / Entity</th>
                <th className="py-3 px-4 text-right">Shares Held</th>
                <th className="py-3 px-4 text-right">Avg Price</th>
                <th className="py-3 px-4 text-right">Current Price</th>
                <th className="py-3 px-4 text-right">Current Value</th>
                <th className="py-3 px-4 text-right">Profit / Loss (%)</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
              {items.map((item) => {
                const isProfit = item.unrealizedPl > 0
                const isLoss = item.unrealizedPl < 0
                return (
                  <tr
                    key={item.id}
                    onClick={() => onItemClick(item)}
                    className="hover:bg-slate-50/80 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer group"
                  >
                    {/* Asset Name & Ticker */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-extrabold text-xs shadow-xs shrink-0 ${item.logoColor}`}>
                          {item.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-slate-900 dark:text-white group-hover:text-[#00d09c] transition-colors">
                              {item.name}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-slate-400">
                              ({item.symbol})
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span>{item.sector}</span>
                            <span>·</span>
                            <span className="font-mono text-slate-500">{item.shareClass}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Shares Held */}
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                      {item.shares.toLocaleString()}
                    </td>

                    {/* Avg Buy Price */}
                    <td className="py-3 px-4 text-right font-mono text-slate-500">
                      {formatCurrency(item.avgBuyPrice)}
                    </td>

                    {/* Current Price */}
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {formatCurrency(item.currentPrice)}
                    </td>

                    {/* Current Value */}
                    <td className="py-3 px-4 text-right font-mono font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(item.currentValue)}
                    </td>

                    {/* Profit / Loss: Green for profit, Red for loss, Neutral for 0 */}
                    <td className="py-3 px-4 text-right">
                      <div className={`inline-flex flex-col items-end ${
                        isProfit ? "text-emerald-500 dark:text-emerald-400" : isLoss ? "text-rose-500 dark:text-rose-400" : "text-slate-400"
                      }`}>
                        <span className="font-extrabold text-xs flex items-center gap-0.5">
                          {isProfit && <ArrowUpRight className="h-3.5 w-3.5" />}
                          {isLoss && <ArrowDownRight className="h-3.5 w-3.5" />}
                          {formatPercent(item.unrealizedPlPercent)}
                        </span>
                        <span className="text-[10px] font-mono font-semibold">
                          {isProfit ? "+" : ""}{formatCurrency(item.unrealizedPl)}
                        </span>
                      </div>
                    </td>

                    {/* Navigation / Action */}
                    <td className="py-3 px-4 text-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          onItemClick(item)
                        }}
                        className="h-7 px-2 text-xs font-semibold text-slate-500 group-hover:text-[#00d09c] gap-1 cursor-pointer"
                      >
                        <span>View</span>
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* ── CARD GRID VIEW ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((item) => {
            const isProfit = item.unrealizedPl > 0
            const isLoss = item.unrealizedPl < 0
            return (
              <div
                key={item.id}
                onClick={() => onItemClick(item)}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-[#00d09c]/50 bg-slate-50/40 dark:bg-zinc-900/40 transition-all cursor-pointer group space-y-2.5"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-extrabold text-xs shadow-xs ${item.logoColor}`}>
                      {item.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-[#00d09c] transition-colors line-clamp-1">
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                        <span className="font-bold text-slate-500">{item.symbol}</span>
                        <span>·</span>
                        <span className="truncate max-w-[120px]">{item.sector}</span>
                      </div>
                    </div>
                  </div>

                  {/* Profit / Loss Badge: Green for profit, Red for loss, Neutral for 0 */}
                  <Badge className={`text-[10px] font-extrabold border ${
                    isProfit
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : isLoss
                      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                      : "bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-zinc-700"
                  }`}>
                    {isProfit ? "+" : ""}{formatPercent(item.unrealizedPlPercent)}
                  </Badge>
                </div>

                {/* Financial Metrics */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Shares Owned</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {item.shares.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Current Price</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {formatCurrency(item.currentPrice)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Cost Basis</span>
                    <span className="font-mono text-slate-500">
                      {formatCurrency(item.costBasis)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Current Value</span>
                    <span className="font-mono font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(item.currentValue)}
                    </span>
                  </div>
                </div>

                {/* Card Footer with P&L and Navigate Arrow */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800 text-[11px]">
                  <div className={`font-mono font-bold flex items-center gap-1 ${
                    isProfit ? "text-emerald-500" : isLoss ? "text-rose-500" : "text-slate-400"
                  }`}>
                    <span>Unrealized P&L:</span>
                    <span>{isProfit ? "+" : ""}{formatCurrency(item.unrealizedPl)}</span>
                  </div>

                  <span className="text-slate-400 group-hover:text-[#00d09c] flex items-center gap-0.5 text-xs font-semibold">
                    <span>Details</span>
                    <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
