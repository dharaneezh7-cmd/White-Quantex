import React, { useState, useEffect, useRef, useMemo } from "react"
import { Link, useSearchParams, useNavigate } from "react-router"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "../../stores/auth-store"
import {
  exploreService,
  type UpcomingCompany,
  type WqRecommendation,
  type MutualScheme,
  type VentureOpportunity,
} from "../../services/explore/exploreService"
import {
  Search,
  PieChart,
  Bell,
  Calculator,
  FileCheck,
  Bookmark,
  Building2,
  BarChart3,
  ShieldCheck,
  Layers,
  CheckCircle2,
  Rocket,
  TrendingUp,
  DollarSign,
  Users,
} from "lucide-react"

import { getCompanyLogoStyle } from "../explore/utils/exploreUtils"
import { ExploreOverviewTab } from "../explore/components/ExploreOverviewTab"
import { ExplorePositionsTab } from "../explore/components/ExplorePositionsTab"
import { ExploreOrdersTab } from "../explore/components/ExploreOrdersTab"
import { ExploreWatchlistsTab } from "../explore/components/ExploreWatchlistsTab"
import { ExploreIndexTab } from "../explore/components/ExploreIndexTab"
import { ExploreNewsTab } from "../explore/components/ExploreNewsTab"
import { ExploreSchemeModal } from "../explore/components/ExploreSchemeModal"

export default function VenturesPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeNavTab =
    (searchParams.get("tab") as "search" | "positions" | "orders" | "my_watchlist" | "all_watchlist" | "index" | "news") || "search"

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTag, setSelectedTag] = useState("All Ventures")
  const [hoveredTag, setHoveredTag] = useState<string | null>(null)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // ── Explore / Ventures Page View All Sections Toggle State ─────────────────
  const [showAllSections, setShowAllSections] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("view") === "all"
    }
    return false
  })

  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== "undefined") {
        setShowAllSections(new URLSearchParams(window.location.search).get("view") === "all")
      }
    }
    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    }
  }, [])

  const handleToggleViewAll = () => {
    setShowAllSections((prev) => {
      const next = !prev
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href)
        if (next) {
          url.searchParams.set("view", "all")
        } else {
          url.searchParams.delete("view")
        }
        window.history.replaceState({}, "", url.toString())
      }
      return next
    })
  }

  // ── Invested Holdings News & Notifications State ─────────────────────────
  const [newsCompanyFilter, setNewsCompanyFilter] = useState<string>("ALL")
  const [newsTypeFilter, setNewsTypeFilter] = useState<"ALL" | "NEWS" | "NOTIFICATIONS" | "ACTION">("ALL")
  const [newsSearchInput, setNewsSearchInput] = useState("")
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // ── New Sections View All Toggle State ────────────────────────────────────
  const [showAllRecentlyAdded, setShowAllRecentlyAdded] = useState(false)
  const [showAllUpcoming, setShowAllUpcoming] = useState(false)
  const [showAllRecommendations, setShowAllRecommendations] = useState(false)
  const [showAllSchemes, setShowAllSchemes] = useState(false)
  const [selectedSchemeDetail, setSelectedSchemeDetail] = useState<MutualScheme | null>(null)

  // ── Ventures Index State (tab === "index") ──────────────────────────────
  const [indexSearchQuery, setIndexSearchQuery] = useState("")
  const [indexSelectedLetter, setIndexSelectedLetter] = useState("ALL")
  const [indexSelectedSector, setIndexSelectedSector] = useState("All")
  const [indexSortBy, setIndexSortBy] = useState<"name" | "valuation" | "founded" | "employees">("valuation")
  const [indexViewMode, setIndexViewMode] = useState<"table" | "grid">("table")

  // ── Screener State ────────────────────────────────────────────────────────
  const [screenerSector, setScreenerSector] = useState("All")
  const [screenerTier, setScreenerTier] = useState("All")
  const [screenerValuation, setScreenerValuation] = useState("All")

  // ── Orders filter state ──────────────────────────────────────────────────
  const [orderFilter, setOrderFilter] = useState<"ALL" | "FILLED" | "PENDING">("ALL")

  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const userId = user?.id || (user as any)?.wqUserId || "anon"

  // ── Spring Boot Financial Truth Engine Queries (Independent Venture Datasets) ──
  const { data: backendOverview } = useQuery({
    queryKey: ["ventures", "overview", userId],
    queryFn: () => exploreService.getVenturesOverview(),
    staleTime: 60_000,
    retry: false,
  })

  const { data: backendPositions } = useQuery({
    queryKey: ["ventures", "positions", userId],
    queryFn: () => exploreService.getVenturePositions(),
    staleTime: 60_000,
    retry: false,
  })

  const { data: backendOrders } = useQuery({
    queryKey: ["ventures", "orders", userId, orderFilter],
    queryFn: () => exploreService.getVentureOrders(orderFilter),
    staleTime: 60_000,
    retry: false,
  })

  const { data: backendNews } = useQuery({
    queryKey: ["ventures", "news", newsCompanyFilter, newsTypeFilter],
    queryFn: () => exploreService.getVentureNews(newsCompanyFilter, newsTypeFilter),
    staleTime: 60_000,
    retry: false,
  })

  // ── Master Registered Ventures Directory (Independent from Companies) ──
  const { data: allVenturesData } = useQuery({
    queryKey: ["ventures", "all-directory"],
    queryFn: () => exploreService.getVentures({ size: 300 }),
    staleTime: 60_000,
  })
  const allVentures = allVenturesData?.content || []

  // ── Live Venture Fundraising Opportunities ──
  const { data: ventureOpportunities = [] } = useQuery({
    queryKey: ["explore", "venture-opportunities"],
    queryFn: () => exploreService.getVentureOpportunities(),
    staleTime: 60_000,
  })

  // Aggregate venture stats
  const totalRaisedAcrossRounds = useMemo(() => {
    return ventureOpportunities.reduce((acc, curr) => acc + (curr.raisedAmountNum || 0), 0)
  }, [ventureOpportunities])

  const totalTargetAcrossRounds = useMemo(() => {
    return ventureOpportunities.reduce((acc, curr) => acc + (curr.targetRaiseNum || 0), 0)
  }, [ventureOpportunities])

  // ── Merged Live Spring Boot Overview Datasets ──
  const liveMostInvested = (backendOverview?.todaysMostInvested || []).slice(0, 5)
  const liveLeastInvested = (backendOverview?.todaysLeastInvested || []).slice(0, 5)
  const liveTopGainers = (backendOverview?.todaysTopGainers || []).slice(0, 5)
  const liveTopLosers = (backendOverview?.todaysTopLosers || []).slice(0, 5)
  const liveMostActive = (backendOverview?.todaysMostActive || []).slice(0, 5)
  const liveNewHighs = (backendOverview?.todays52wHighs || []).slice(0, 5)

  const liveRecentlyViewed = (backendOverview?.recentlyViewed || []).slice(0, 8).map((c) => ({
    id: String(c.id),
    name: c.name,
    shortName: c.shortName,
    ticker: c.ticker,
    sector: c.sector,
    status: "Active Trading",
    valuation: c.valuation || "N/A",
    change: c.change || "0.0%",
    isPositive: c.isPositive !== false,
    logoColor: c.logoBg || "bg-indigo-600",
  }))

  const liveRecentlyAdded = (backendOverview?.recentlyAdded || []).map((c) => ({
    id: String(c.id),
    name: c.name,
    ticker: c.ticker,
    tagline: c.description ? c.description.slice(0, 85) + "..." : "Registered operating venture issuer on White Quantex.",
    sector: c.sector,
    status: c.status,
    location: c.headquarters,
    annualRevenue: c.annualRevenue,
    valuation: c.valuation,
    founded: c.foundedYear,
    verification: c.verificationLevel,
    trustScore: c.trustScore,
    cik: c.cik,
    logoColor: c.logoColor || "bg-indigo-600",
  }))

  // ── Database-Driven Sections (PostgreSQL Truth Engine) ──
  const liveUpcoming: UpcomingCompany[] = backendOverview?.upcomingCompanies || []
  const liveRecommendations: WqRecommendation[] = backendOverview?.wqRecommendations || []
  const liveSchemes: MutualScheme[] = backendOverview?.mutualInvestmentSchemes || []

  // ── Invested Positions Dataset ──────────────────────────────────────────
  const livePositions = (backendPositions || []).map((pos) => ({
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

  // ── Computed Portfolio KPIs (derived from live database positions) ─────
  const totalInvested = (backendPositions || []).reduce((acc, p) => acc + (p.costBasis || 0), 0)
  const portfolioValue = (backendPositions || []).reduce((acc, p) => acc + (p.currentValue || 0), 0)
  const unrealizedGain = portfolioValue - totalInvested
  const totalReturnPercent = totalInvested > 0 ? (unrealizedGain / totalInvested) * 100 : 0

  // ── Orders Dataset ──────────────────────────────────────────────────────
  const liveOrders = (backendOrders || []).map((ord) => ({
    id: ord.orderNumber || ord.id,
    company: ord.companyName,
    instrument: ord.shareClass || "Class A Common",
    amount: `$${(ord.totalAmount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    shares: `${(ord.shares ?? 0).toLocaleString()} @ $${(ord.pricePerShare ?? 0).toFixed(2)}`,
    date: ord.executedAt ? ord.executedAt.replace("T", " ").slice(0, 19) : "Pending",
    status: ord.status,
    statusLabel: ord.status === "FILLED" ? "Executed & Settled" : "Pending Escrow Signature",
    badge: ord.status === "FILLED" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500",
  }))

  // ── News & Notifications Dataset ────────────────────────────────────────
  const liveHoldingsNews = (backendNews || [])
    .filter((n) => !n.isActionRequired)
    .map((n) => ({
      id: n.id,
      ticker: n.ticker,
      companyName: n.companyName,
      logoColor: n.logoColor || "bg-indigo-600",
      category: n.category,
      categoryColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      title: n.title,
      time: n.publishedAt ? new Date(n.publishedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Recently",
      source: n.source || "Venture Wire",
      sentiment: n.sentiment || "Bullish",
      snippet: n.snippet,
      readTime: n.readTime || "3 min read",
      impactMetric: n.impactMetric || "+10.0% Valuation Uplift",
      detailBullet1: "Verified statutory venture filing submitted to regulatory ledger.",
      detailBullet2: "Operations performing ahead of quarterly guidance targets.",
      detailBullet3: "Corporate equity allocation fully reconciled.",
    }))

  const liveHoldingsNotifications = (backendNews || [])
    .filter((n) => n.isActionRequired)
    .map((n) => ({
      id: n.id,
      ticker: n.ticker,
      companyName: n.companyName,
      type: "ACTION" as const,
      category: n.category,
      badge: n.urgency === "High" ? "Action Required" : "Corporate Update",
      badgeColor: n.urgency === "High" ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      title: n.title,
      time: n.publishedAt ? new Date(n.publishedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Recently",
      urgency: n.urgency || "Normal",
      dueDate: n.dueDate || "Notice Period Open",
      holdingContext: "Registered Venture Holding",
      content: n.snippet,
      actionLabel: n.actionLabel || "Cast Proxy Vote",
      actionType: n.actionType || "vote",
      isUrgent: n.urgency === "High",
    }))

  // ── Financial Modeling Tools ─────────────────────────────────────────────
  const toolsList = [
    {
      id: "tool-1",
      name: "Valuation Calculator",
      desc: "Model pre/post-money valuation with DCF, VC method & industry revenue multiples.",
      icon: Calculator,
      badge: "Financial",
    },
    {
      id: "tool-2",
      name: "Cap Table Simulator",
      desc: "Simulate equity dilution, SAFE conversions, and option pool expansions per round.",
      icon: PieChart,
      badge: "Equity",
    },
    {
      id: "tool-3",
      name: "Due Diligence Checklist",
      desc: "Audit regulatory compliance, IP ownership, financial books, and corporate governance.",
      icon: FileCheck,
      badge: "Compliance",
    },
    {
      id: "tool-4",
      name: "Deal ROI & Exit Model",
      desc: "Project investor returns across liquidation preferences and exit multiple scenarios.",
      icon: BarChart3,
      badge: "Analytics",
    },
  ]

  // ── Helper to directly connect to company profile page ─────────────────
  const openCompanyProfile = (comp: any) => {
    if (!comp) return
    const ticker = comp.ticker || comp.symbol || comp.id
    if (ticker && userId !== "anon") {
      exploreService.recordRecentlyViewed(ticker).then(() => {
        queryClient.invalidateQueries({ queryKey: ["explore", "overview", userId] })
      })
    }
    navigate(`/companies/${ticker}`)
  }

  // ── Derived Ventures Index Filters ───────────────────────────────────────
  const indexSectorList = ["All", "AI & ML", "CleanTech", "Fintech", "SpaceTech", "Biotech", "SaaS", "Robotics", "Quantum"]
  const alphabetLetters = ["ALL", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")]

  const filteredVenturesIndex = allVentures
    .filter((comp) => {
      const q = indexSearchQuery.toLowerCase().trim()
      const matchesQuery =
        !q ||
        comp.name.toLowerCase().includes(q) ||
        comp.ticker.toLowerCase().includes(q) ||
        comp.sector.toLowerCase().includes(q) ||
        comp.subIndustry.toLowerCase().includes(q) ||
        comp.ceo.toLowerCase().includes(q) ||
        comp.headquarters.toLowerCase().includes(q) ||
        comp.legalEntity.toLowerCase().includes(q) ||
        comp.cik.toLowerCase().includes(q)

      const matchesLetter =
        indexSelectedLetter === "ALL" ||
        comp.name.toUpperCase().startsWith(indexSelectedLetter)

      const matchesSector =
        indexSelectedSector === "All" || comp.sector === indexSelectedSector

      return matchesQuery && matchesLetter && matchesSector
    })
    .sort((a, b) => {
      if (indexSortBy === "name") {
        return a.name.localeCompare(b.name)
      } else if (indexSortBy === "valuation") {
        return (b.valuationNum || 0) - (a.valuationNum || 0)
      } else if (indexSortBy === "founded") {
        return (b.foundedYear || 0) - (a.foundedYear || 0)
      } else if (indexSortBy === "employees") {
        return (b.employees || 0) - (a.employees || 0)
      }
      return 0
    })

  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* MASTER CONTAINER: Clean borderless modern layout                     */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <div className="bg-white dark:bg-[#07090b] rounded-2xl shadow-xs overflow-hidden transition-colors space-y-4 sm:space-y-6">

        {/* ───────────────────────────────────────────────────────────────── */}
        {/* ROW 1: Sub-Nav Links & Tab Header Area                            */}
        {/* ───────────────────────────────────────────────────────────────── */}
        <div className="w-full p-4 sm:p-6 space-y-4">
          {/* Top Sub-Nav Bar: Navigation Links */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pb-2">
            {[
              { id: "search", label: "Ventures", href: "/ventures" },
              { id: "index", label: "Ventures Index", href: "/ventures?tab=index" },
              { id: "positions", label: "Venture Positions", href: "/ventures?tab=positions" },
              { id: "orders", label: "Venture Orders", href: "/ventures?tab=orders" },
              { id: "my_watchlist", label: "My Watchlist", href: "/ventures?tab=my_watchlist" },
              { id: "all_watchlist", label: "All Watchlists", href: "/ventures?tab=all_watchlist" },
              { id: "news", label: "Dispatches & News", href: "/ventures?tab=news" },
            ].map((tab) => {
              const isActive = activeNavTab === tab.id
              return (
                <Link
                  key={tab.id}
                  to={tab.href}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? "bg-slate-900 text-white dark:bg-white dark:text-zinc-950 shadow-xs"
                      : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/50"
                  }`}
                >
                  {tab.label}
                  {tab.id === "news" && (
                    <span className="inline-flex items-center gap-1 ml-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#00d09c] animate-pulse" />
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                        {liveHoldingsNotifications.length + liveHoldingsNews.length}
                      </span>
                    </span>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Tab Context Body in Row 1 */}
          {activeNavTab === "search" && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    const val = e.target.value
                    setSearchQuery(val)
                    if (val.trim()) {
                      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
                      setHoveredTag(null)
                    }
                    if (!val.trim()) {
                      setSelectedTag("All Ventures")
                    } else {
                      const matchedTag = ["Fintech", "AI & ML", "CleanTech", "SaaS", "Biotech", "SpaceTech"].find(
                        (t) => t.toLowerCase() === val.trim().toLowerCase()
                      )
                      setSelectedTag(matchedTag || "")
                    }
                  }}
                  placeholder="Search ventures, growth rounds, sector, founders, CIK..."
                  aria-label="Search ventures"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-0 bg-slate-100/90 dark:bg-zinc-900 text-slate-900 dark:text-white text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:bg-slate-100 dark:focus:bg-zinc-800 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("")
                      setSelectedTag("All Ventures")
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Quick Venture Sector Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 mr-1">
                  Venture Sectors:
                </span>
                {["All Ventures", "AI & ML", "CleanTech", "Fintech", "Biotech", "SpaceTech", "Robotics", "Quantum", "SaaS"].map((tag) => {
                  const isSelected = selectedTag === tag || (selectedTag === "All" && tag === "All Ventures")
                  const isSearchActive = Boolean(searchQuery.trim())
                  const isHovered = !isSearchActive && hoveredTag === tag
                  return (
                    <button
                      key={tag}
                      data-sector-tag="true"
                      onMouseEnter={() => {
                        if (isSearchActive) return
                        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
                        setHoveredTag(tag)
                      }}
                      onMouseLeave={(e) => {
                        if (isSearchActive) return
                        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
                        const related = e.relatedTarget as HTMLElement | null
                        if (related && (related.closest('.sector-preview-popup') || related.closest('button[data-sector-tag]'))) {
                          return
                        }
                        setHoveredTag(null)
                      }}
                      onClick={() => {
                        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
                        setSelectedTag(tag)
                        if (tag === "All Ventures") {
                          setSearchQuery("")
                        } else {
                          setSearchQuery(tag)
                        }
                        setHoveredTag(null)
                      }}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer border ${
                        isSelected
                          ? "bg-[#00d09c]/15 text-[#00a87e] dark:text-[#00d09c] font-bold border-[#00d09c]/40 shadow-[0_0_8px_rgba(0,208,156,0.15)]"
                          : isHovered
                          ? "bg-[#00d09c]/10 text-[#00a87e] dark:text-[#00d09c] border-[#00d09c]/30"
                          : "bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 hover:bg-slate-200/80 dark:hover:bg-zinc-800 dark:hover:text-white border-transparent dark:border-zinc-800"
                      }`}
                    >
                      {tag}
                    </button>
                  )
                })}
              </div>

              {/* Live Matching Ventures Dropdown / Results */}
              {(Boolean(hoveredTag) || Boolean(searchQuery.trim())) && (() => {
                const activeFilterTerm = (hoveredTag || searchQuery).trim().toLowerCase()
                const isAll = !activeFilterTerm || activeFilterTerm === "all ventures"
                const filteredMatches = allVentures.filter((c) => {
                  if (isAll) return true
                  return (
                    c.name.toLowerCase().includes(activeFilterTerm) ||
                    c.ticker.toLowerCase().includes(activeFilterTerm) ||
                    c.sector.toLowerCase().includes(activeFilterTerm) ||
                    c.cik.toLowerCase().includes(activeFilterTerm)
                  )
                })

                return (
                  <div
                    onMouseEnter={() => {
                      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
                    }}
                    onMouseLeave={(e) => {
                      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
                      const related = e.relatedTarget as HTMLElement | null
                      if (related && related.closest('button[data-sector-tag]')) {
                        return
                      }
                      setHoveredTag(null)
                    }}
                    className="sector-preview-popup relative before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-[''] w-full md:w-1/2 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-2xl space-y-2 animate-popup"
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-zinc-400">
                      <span>
                        {hoveredTag ? `Preview: ${hoveredTag}` : "Matching Ventures"} ({filteredMatches.length})
                      </span>
                      <span className="text-[#00d09c] text-[10px]">Venture Issuer Registry</span>
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-0.5">
                      {filteredMatches.length === 0 ? (
                        <div className="py-4 text-center text-xs text-slate-400 dark:text-zinc-500">
                          No venture issuers found matching this sector/query
                        </div>
                      ) : (
                        filteredMatches.map((comp) => (
                          <div
                            key={comp.id}
                            onClick={() => {
                              openCompanyProfile(comp)
                              setSearchQuery("")
                              setSelectedTag("All Ventures")
                              setHoveredTag(null)
                            }}
                            className="p-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-zinc-800/60 rounded-lg transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                style={getCompanyLogoStyle(comp.logoColor, comp.ticker)}
                                className="h-7 w-7 rounded-md text-white font-bold text-[10px] flex items-center justify-center shrink-0 ring-1 ring-slate-200/80 dark:ring-zinc-800"
                              >
                                {comp.ticker.slice(0, 2)}
                              </div>
                              <div>
                                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                                  {comp.name}
                                </span>
                                <span className="text-[10px] text-slate-400 dark:text-zinc-500 ml-2">
                                  ({comp.ticker}) · {comp.sector} · {comp.cik}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                                {comp.valuation}
                              </span>
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{comp.status}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )
              })()}
            </div>
          )}

          {activeNavTab === "positions" && (
            <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800/60 text-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <PieChart className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Active Venture Portfolio Positions</span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">{livePositions.length} Verified Holdings · Authoritative Spring Truth Engine</span>
                </div>
              </div>
              <div className="text-right">
                <span className={`font-extrabold text-sm block ${unrealizedGain >= 0 ? "text-[#00d09c]" : "text-rose-500"}`}>
                  {unrealizedGain >= 0 ? "+" : ""}${unrealizedGain.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({totalReturnPercent >= 0 ? "+" : ""}{totalReturnPercent.toFixed(1)}%)
                </span>
                <span className="text-[10px] text-slate-400">Unrealized P&L</span>
              </div>
            </div>
          )}

          {activeNavTab === "orders" && (
            <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800/60 text-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <FileCheck className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Venture Secondary &amp; Allocation Order Book</span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">{liveOrders.filter(o => o.status === "FILLED").length} Lifetime Executions · {liveOrders.filter(o => o.status === "PENDING").length} Pending Escrow Settlement</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {(["ALL", "FILLED", "PENDING"] as const).map((filterKey) => (
                  <button
                    key={filterKey}
                    onClick={() => setOrderFilter(filterKey)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                      orderFilter === filterKey
                        ? "bg-slate-900 text-white dark:bg-white dark:text-zinc-950 shadow-xs"
                        : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {filterKey}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeNavTab === "my_watchlist" && (
            <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800/60 text-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Bookmark className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Custom Pinned Venture Watchlist</span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">Personal monitored ventures and seed/growth stage issuers</span>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-[#00d09c]">
                Live Market Tracking
              </span>
            </div>
          )}

          {activeNavTab === "all_watchlist" && (
            <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800/60 text-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Ecosystem Curated Venture Watchlists</span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">Sector themed baskets aggregated from verified ventures</span>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Sector Indexing
              </span>
            </div>
          )}

          {activeNavTab === "index" && (
            <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800/60 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      Master Venture Issuers &amp; Growth Deals Index
                    </span>
                    <span className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      Ventures &amp; Growth Rounds
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Official directory of verified venture issuers, growth syndicates, Delaware C-Corps, SEC CIK filings, and executive leadership on White Quantex.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {(backendOverview?.totalRegisteredCompanies || allVentures.length || 0)} Verified Ventures
                </span>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 hidden sm:inline">
                  SEC Reg D / CIK Verified
                </span>
              </div>
            </div>
          )}

          {activeNavTab === "news" && (
            <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800/60 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Venture Portfolio Intelligence &amp; Shareholder Alerts
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                    {livePositions.length > 0
                      ? `Direct coverage for your active venture equity holdings: ${livePositions.map((p: any) => `${p.name} (${p.ticker})`).join(", ")}`
                      : "Regulatory updates, financing rounds, and operational alerts across the venture network."}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {liveHoldingsNotifications.some((n: any) => n.type === "ACTION" || n.isActionRequired) ? (
                  <span className="text-[11px] font-bold text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                    Action Required
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Up to Date
                  </span>
                )}
                <Link
                  to="/ventures?tab=positions"
                  className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-semibold text-[11px] transition-colors"
                >
                  View Holdings
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* DYNAMIC BOTTOM CONTENT: Swaps based on selected nav tab           */}
        {/* ═════════════════════════════════════════════════════════════════ */}

        {/* ─── 1. TAB: SEARCH / VENTURES OVERVIEW ─────────────────────────── */}
        {activeNavTab === "search" && (
          <ExploreOverviewTab
            liveRecentlyViewed={liveRecentlyViewed}
            liveMostInvested={liveMostInvested}
            liveTopGainers={liveTopGainers}
            liveLeastInvested={liveLeastInvested}
            liveTopLosers={liveTopLosers}
            liveMostActive={liveMostActive}
            liveNewHighs={liveNewHighs}
            liveRecentlyAdded={liveRecentlyAdded}
            liveUpcoming={liveUpcoming}
            liveRecommendations={liveRecommendations}
            liveSchemes={liveSchemes}
            allCompanies={allVentures}
            toolsList={toolsList}
            showAllSections={showAllSections}
            handleToggleViewAll={handleToggleViewAll}
            showAllRecentlyAdded={showAllRecentlyAdded}
            setShowAllRecentlyAdded={setShowAllRecentlyAdded}
            showAllUpcoming={showAllUpcoming}
            setShowAllUpcoming={setShowAllUpcoming}
            showAllRecommendations={showAllRecommendations}
            setShowAllRecommendations={setShowAllRecommendations}
            showAllSchemes={showAllSchemes}
            setShowAllSchemes={setShowAllSchemes}
            screenerSector={screenerSector}
            setScreenerSector={setScreenerSector}
            screenerTier={screenerTier}
            setScreenerTier={setScreenerTier}
            screenerValuation={screenerValuation}
            setScreenerValuation={setScreenerValuation}
            setSearchParams={setSearchParams}
            onSelectCompany={openCompanyProfile}
            onSelectScheme={(scheme) => setSelectedSchemeDetail(scheme)}
            baseRoute="/ventures"
            entityLabel="Ventures"
          />
        )}

        {/* ─── 2. TAB: POSITIONS (PORTFOLIO HOLDINGS & ALLOCATION VIEW) ────── */}
        {activeNavTab === "positions" && (
          <ExplorePositionsTab
            portfolioValue={portfolioValue}
            totalInvested={totalInvested}
            unrealizedGain={unrealizedGain}
            totalReturnPercent={totalReturnPercent}
            livePositions={livePositions}
            onOpenDossier={(pos) => {
              openCompanyProfile({ ticker: pos.ticker })
            }}
            entityLabel="Ventures"
          />
        )}

        {/* ─── 3. TAB: ORDERS (CORPORATE SECONDARY ORDER BOOK) ───────────────── */}
        {activeNavTab === "orders" && (
          <ExploreOrdersTab
            liveOrders={liveOrders}
            orderFilter={orderFilter}
            entityLabel="Ventures"
          />
        )}

        {/* ─── 4 & 5. TABS: MY WATCHLIST & ALL WATCHLIST ───────────────────── */}
        {(activeNavTab === "my_watchlist" || activeNavTab === "all_watchlist") && (
          <ExploreWatchlistsTab
            activeNavTab={activeNavTab}
            allCompanies={allVentures}
            onOpenDossier={openCompanyProfile}
            entityLabel="Ventures"
          />
        )}

        {/* ─── 5.5. TAB: INDEX (OPERATING VENTURE ISSUERS DIRECTORY) ──────── */}
        {activeNavTab === "index" && (
          <ExploreIndexTab
            allCompanies={allVentures}
            filteredCompaniesIndex={filteredVenturesIndex}
            totalRegisteredCount={backendOverview?.totalRegisteredCompanies || allVentures.length || 0}
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
            onSelectCompany={openCompanyProfile}
            entityLabel="Ventures"
          />
        )}

        {/* ─── 6. TAB: NEWS & NOTIFICATIONS (INVESTED VENTURES) ───────────── */}
        {activeNavTab === "news" && (
          <ExploreNewsTab
            liveHoldingsNews={liveHoldingsNews}
            liveHoldingsNotifications={liveHoldingsNotifications}
            newsCompanyFilter={newsCompanyFilter as any}
            setNewsCompanyFilter={setNewsCompanyFilter as any}
            newsTypeFilter={newsTypeFilter}
            setNewsTypeFilter={setNewsTypeFilter}
            newsSearchInput={newsSearchInput}
            setNewsSearchInput={setNewsSearchInput}
            onToast={triggerToast}
            baseRoute="/ventures"
          />
        )}

        {/* ─── Mutual Investment Scheme Factsheet Modal ───────────────────── */}
        <ExploreSchemeModal
          selectedSchemeDetail={selectedSchemeDetail}
          onClose={() => setSelectedSchemeDetail(null)}
          onParticipate={(scheme) => {
            setSelectedSchemeDetail(null)
            triggerToast(`Allocation order initiated for ${scheme.name} (${scheme.code}). Statutory escrow contract created.`)
          }}
        />

        {/* ─── Global Feedback Toast ───────────────────────────────────────── */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 p-3.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-zinc-950 shadow-2xl flex items-center gap-2 text-xs font-bold border border-slate-800 dark:border-zinc-200 animate-in slide-in-from-bottom-5 duration-200">
            <CheckCircle2 className="h-4 w-4 text-[#00d09c]" />
            <span>{toastMessage}</span>
          </div>
        )}

      </div>
    </div>
  )
}
