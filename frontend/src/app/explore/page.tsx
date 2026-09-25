import React, { useState, useEffect } from "react"
import { Link, useSearchParams } from "react-router"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "../../stores/auth-store"
import {
  exploreService,
  type UpcomingCompany,
  type WqRecommendation,
  type MutualScheme,
} from "../../services/explore/exploreService"
import {
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  DollarSign,
  PieChart,
  Activity,
  Bell,
  Newspaper,
  Clock,
  Sparkles,
  SlidersHorizontal,
  Calculator,
  FileCheck,
  Layers,
  Eye,
  ExternalLink,
  Bookmark,
  CheckCircle2,
  ChevronRight,
  Building2,
  BarChart3,
  Flame,
  ArrowUpRight,
  Briefcase,
  Zap,
  Check,
  AlertCircle,
  RefreshCw,
  Star,
  Users,
  X,
  ChevronDown,
  ChevronUp,
  Info,
  Vote,
  Download,
  FileText,
  CheckCheck,
  AlertTriangle,
  Globe,
  MapPin,
  User,
  Calendar,
  Table,
  LayoutGrid,
  ArrowUpDown,
  Award,
  Landmark,
} from "lucide-react"

// ── Deterministic Solid Logo Background Palette (immune to Tailwind CSS purging) ──
const LOGO_COLOR_MAP: Record<string, string> = {
  "bg-indigo-600": "#4f46e5",
  "bg-indigo-700": "#4338ca",
  "bg-emerald-500": "#10b981",
  "bg-emerald-600": "#059669",
  "bg-emerald-700": "#047857",
  "bg-cyan-600": "#0891b2",
  "bg-cyan-700": "#0e7490",
  "bg-slate-700": "#334155",
  "bg-amber-500": "#f59e0b",
  "bg-amber-600": "#d97706",
  "bg-rose-600": "#e11d48",
  "bg-rose-700": "#be123c",
  "bg-blue-600": "#2563eb",
  "bg-blue-700": "#1d4ed8",
  "bg-purple-600": "#9333ea",
  "bg-purple-700": "#7e22ce",
  "bg-orange-600": "#ea580c",
  "bg-teal-600": "#0d9488",
  "bg-violet-600": "#7c3aed",
  "bg-red-600": "#dc2626",
  "bg-zinc-700": "#3f3f46",
}

const FALLBACK_PALETTE = [
  "#4f46e5", // Indigo
  "#059669", // Emerald
  "#0891b2", // Cyan
  "#2563eb", // Blue
  "#7c3aed", // Violet
  "#e11d48", // Rose
  "#d97706", // Amber
  "#0d9488", // Teal
  "#4338ca", // Deep Indigo
  "#047857", // Deep Emerald
]

function getCompanyLogoStyle(colorStr?: string, tickerOrName?: string): React.CSSProperties {
  if (colorStr && LOGO_COLOR_MAP[colorStr]) {
    return { backgroundColor: LOGO_COLOR_MAP[colorStr], color: "#ffffff" }
  }
  if (colorStr && (colorStr.startsWith("#") || colorStr.startsWith("rgb"))) {
    return { backgroundColor: colorStr, color: "#ffffff" }
  }
  const seed = tickerOrName || "WQ"
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  }
  const bg = FALLBACK_PALETTE[Math.abs(hash) % FALLBACK_PALETTE.length]
  return { backgroundColor: bg, color: "#ffffff" }
}

// ── 4-Line Explanatory Breakdown Component for Market Categories ──
function CategoryExplanationBox({
  color = "emerald",
  lines,
  defaultOpen = false,
}: {
  color?: "emerald" | "amber" | "rose" | "cyan" | "purple"
  lines: [string, string, string, string]
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const dotColorClass = {
    emerald: "bg-emerald-500 dark:bg-emerald-400",
    amber: "bg-amber-500 dark:bg-amber-400",
    rose: "bg-rose-500 dark:bg-rose-400",
    cyan: "bg-cyan-500 dark:bg-cyan-400",
    purple: "bg-purple-500 dark:bg-purple-400",
  }[color]

  const infoColorClass = {
    emerald: "text-emerald-600 dark:text-emerald-400",
    amber: "text-amber-600 dark:text-amber-400",
    rose: "text-rose-600 dark:text-rose-400",
    cyan: "text-cyan-600 dark:text-cyan-400",
    purple: "text-purple-600 dark:text-purple-400",
  }[color]

  const hoverBgClass = {
    emerald: "hover:bg-emerald-50/70 dark:hover:bg-emerald-950/30",
    amber: "hover:bg-amber-50/70 dark:hover:bg-amber-950/30",
    rose: "hover:bg-rose-50/70 dark:hover:bg-rose-950/30",
    cyan: "hover:bg-cyan-50/70 dark:hover:bg-cyan-950/30",
    purple: "hover:bg-purple-50/70 dark:hover:bg-purple-950/30",
  }[color]

  return (
    <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between py-1 px-1.5 rounded-lg transition-colors cursor-pointer text-[11px] font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white ${hoverBgClass}`}
      >
        <span className="flex items-center gap-1.5">
          <Info className={`h-3.5 w-3.5 ${infoColorClass}`} />
          <span>About Category</span>
        </span>
        <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
          <span>{isOpen ? "Hide" : "What does this mean?"}</span>
          <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </span>
      </button>

      {isOpen && (
        <div className="mt-2 rounded-xl p-2.5 bg-slate-50/90 dark:bg-zinc-800/50 border border-slate-200/70 dark:border-zinc-800/70 text-[11px] leading-relaxed text-slate-600 dark:text-zinc-300 space-y-1.5 animate-in fade-in-50 duration-200 shadow-2xs">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
            <span className="flex items-center gap-1">
              <Info className={`h-3 w-3 ${infoColorClass}`} />
              <span>Category Definition & Methodology</span>
            </span>
            <span className="text-[9px] font-normal text-slate-400">4-Line Institutional Insight</span>
          </div>
          {lines.map((line, idx) => (
            <p key={idx} className="flex items-start gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${dotColorClass} mt-1.5 shrink-0`} />
              <span>{line}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeNavTab =
    (searchParams.get("tab") as "search" | "positions" | "orders" | "my_watchlist" | "all_watchlist" | "index" | "news") || "search"

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTag, setSelectedTag] = useState("All Companies")
  const [showNews, setShowNews] = useState(false)
  const [newsFilter, setNewsFilter] = useState("All")

  // ── Explore Page View All Sections Toggle State ──────────────────────────
  const [showAllSections, setShowAllSections] = useState<boolean>(() => searchParams.get("view") === "all")

  useEffect(() => {
    setShowAllSections(searchParams.get("view") === "all")
  }, [searchParams])

  const handleToggleViewAll = () => {
    const next = !showAllSections
    setShowAllSections(next)
    const newParams = new URLSearchParams(searchParams)
    if (next) {
      newParams.set("view", "all")
    } else {
      newParams.delete("view")
    }
    setSearchParams(newParams, { replace: true })
  }

  // ── Invested Holdings News & Notifications State ─────────────────────────
  const [newsCompanyFilter, setNewsCompanyFilter] = useState<"ALL" | "TFLOW" | "GGRID" | "QMAT">("ALL")
  const [newsTypeFilter, setNewsTypeFilter] = useState<"ALL" | "NEWS" | "NOTIFICATIONS" | "ACTION">("ALL")
  const [newsSearchInput, setNewsSearchInput] = useState("")
  const [votedItems, setVotedItems] = useState<Record<string, string>>({})
  const [selectedProposalVote, setSelectedProposalVote] = useState<{ p1: string; p2: string }>({ p1: "FOR", p2: "FOR" })
  const [activeVoteModal, setActiveVoteModal] = useState<boolean>(false)
  const [activeDetailModal, setActiveDetailModal] = useState<any | null>(null)
  const [voteSubmittedSuccess, setVoteSubmittedSuccess] = useState(false)
  const [dismissedNoticeIds, setDismissedNoticeIds] = useState<string[]>([])
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // ── New Sections View All Toggle State ────────────────────────────────────
  const [showAllRecentlyAdded, setShowAllRecentlyAdded] = useState(false)
  const [showAllUpcoming, setShowAllUpcoming] = useState(false)
  const [showAllRecommendations, setShowAllRecommendations] = useState(false)
  const [showAllSchemes, setShowAllSchemes] = useState(false)
  const [selectedSchemeDetail, setSelectedSchemeDetail] = useState<MutualScheme | null>(null)

  // ── Companies Index State (tab === "index") ─────────────────────────────
  const [indexSearchQuery, setIndexSearchQuery] = useState("")
  const [indexSelectedLetter, setIndexSelectedLetter] = useState("ALL")
  const [indexSelectedSector, setIndexSelectedSector] = useState("All")
  const [indexSortBy, setIndexSortBy] = useState<"name" | "valuation" | "founded" | "employees">("valuation")
  const [indexViewMode, setIndexViewMode] = useState<"table" | "grid">("table")
  const [selectedCompanyProfile, setSelectedCompanyProfile] = useState<any | null>(null)

  // ── Screener State (Row 4 Left) ──────────────────────────────────────────
  const [screenerSector, setScreenerSector] = useState("All")
  const [screenerTier, setScreenerTier] = useState("All")
  const [screenerValuation, setScreenerValuation] = useState("All")

  // ── Orders filter state ──────────────────────────────────────────────────
  const [orderFilter, setOrderFilter] = useState<"ALL" | "FILLED" | "PENDING">("ALL")

  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const userId = user?.id || (user as any)?.wqUserId || "anon"

  // ── Spring Boot Financial Truth Engine Queries (with resilient fallback) ──
  const { data: backendOverview } = useQuery({
    queryKey: ["explore", "overview", userId],
    queryFn: () => exploreService.getOverview(),
    staleTime: 60_000,
    retry: false,
  })

  const { data: backendPositions } = useQuery({
    queryKey: ["explore", "positions", userId],
    queryFn: () => exploreService.getPositions(),
    staleTime: 60_000,
    retry: false,
  })

  const { data: backendOrders } = useQuery({
    queryKey: ["explore", "orders", userId, orderFilter],
    queryFn: () => exploreService.getOrders(orderFilter),
    staleTime: 60_000,
    retry: false,
  })

  const { data: backendNews } = useQuery({
    queryKey: ["explore", "news", newsCompanyFilter, newsTypeFilter],
    queryFn: () => exploreService.getNews(newsCompanyFilter, newsTypeFilter),
    staleTime: 60_000,
    retry: false,
  })

  // Dynamically record recently viewed company for the authenticated user
  useEffect(() => {
    if (selectedCompanyProfile?.ticker && userId !== "anon") {
      exploreService.recordRecentlyViewed(selectedCompanyProfile.ticker).then(() => {
        queryClient.invalidateQueries({ queryKey: ["explore", "overview", userId] })
      })
    }
  }, [selectedCompanyProfile?.ticker, userId])

  // ── Master Companies Directory (Loaded dynamically from Spring Boot PostgreSQL Engine) ──
  const { data: allCompaniesData, isLoading: isCompaniesLoading } = useQuery({
    queryKey: ["explore", "companies-all"],
    queryFn: () => exploreService.getCompanies({ size: 100 }),
    staleTime: 60_000,
  })
  const allCompanies = allCompaniesData?.content || []

  // ── Merged Live Spring Boot Overview Datasets ──
  const liveMostInvested = backendOverview?.todaysMostInvested || []
  const liveLeastInvested = backendOverview?.todaysLeastInvested || []
  const liveTopGainers = backendOverview?.todaysTopGainers || []
  const liveTopLosers = backendOverview?.todaysTopLosers || []
  const liveMostActive = backendOverview?.todaysMostActive || []
  const liveNewHighs = backendOverview?.todays52wHighs || []

  const liveRecentlyViewed = (backendOverview?.recentlyViewed || []).map((c) => ({
    id: String(c.id),
    name: c.name,
    shortName: c.shortName,
    ticker: c.ticker,
    sector: c.sector,
    status: "Active Trading",
    valuation: c.valuation || "$42.5M",
    change: c.change || "+5.0%",
    isPositive: c.isPositive !== false,
    logoColor: c.logoBg || "bg-indigo-600",
  }))

  const liveRecentlyAdded = (backendOverview?.recentlyAdded || []).map((c) => ({
    id: String(c.id),
    name: c.name,
    ticker: c.ticker,
    tagline: c.description ? c.description.slice(0, 85) + "..." : "Registered operating corporate issuer on White Quantex.",
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

  // ── Database-Driven Explore Sections (PostgreSQL Truth Engine) ──
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
    date: ord.executedAt ? ord.executedAt.replace("T", " ").slice(0, 19) : "2026-09-13 10:00:00",
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
      source: n.source || "Corporate News Wire",
      sentiment: n.sentiment || "Bullish",
      snippet: n.snippet,
      readTime: n.readTime || "3 min read",
      impactMetric: n.impactMetric || "+10.0% Valuation Uplift",
      detailBullet1: "Verified institutional filing submitted to regulatory ledger.",
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
      holdingContext: "Registered Holding",
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

  // ── Helper to open company dossier ──────────────────────────────────────
  const openCompanyDossier = (comp: any) => {
    if (!comp) return
    const ticker = comp.ticker || comp.symbol
    const found = allCompanies.find((c) => c.ticker === ticker || c.id === comp.id)
    if (found) {
      setSelectedCompanyProfile({
        id: found.id,
        name: found.name,
        shortName: found.shortName,
        ticker: found.ticker,
        legalEntity: found.legalEntity,
        cik: found.cik,
        sector: found.sector,
        subIndustry: found.subIndustry,
        headquarters: found.headquarters,
        location: found.headquarters,
        founded: found.foundedYear,
        ceo: found.ceo,
        employees: found.employees,
        valuation: found.valuation,
        annualRevenue: found.annualRevenue,
        verification: found.verificationLevel,
        trustScore: found.trustScore,
        description: found.description,
        exchangeTier: found.exchangeTier,
        status: found.status,
      })
    } else {
      setSelectedCompanyProfile(comp)
    }
  }

  // ── Derived Companies Index Filters (Strictly Companies, Not Ventures) ───
  const indexSectorList = ["All", "AI & ML", "CleanTech", "Fintech", "SpaceTech", "Biotech", "SaaS", "Robotics"]
  const alphabetLetters = ["ALL", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")]

  const filteredCompaniesIndex = allCompanies
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

  return (
    <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* MASTER CONTAINER: Clean borderless modern layout */}
      <div className="bg-white dark:bg-[#07090b] rounded-2xl shadow-xs overflow-hidden transition-colors space-y-4 sm:space-y-6">

        {/* ───────────────────────────────────────────────────────────────── */}
        {/* ROW 1: Sub-Nav Links & Tab Header Area                            */}
        {/* ───────────────────────────────────────────────────────────────── */}
        <div className="w-full p-4 sm:p-6 space-y-4">
          {/* Top Sub-Nav Bar: Navigation Links */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pb-2">
            {[
              { id: "search", label: "Search", href: "/explore" },
              { id: "index", label: "Index", href: "/explore?tab=index" },
              { id: "positions", label: "Positions", href: "/explore?tab=positions" },
              { id: "orders", label: "Orders", href: "/explore?tab=orders" },
              { id: "my_watchlist", label: "My Watchlist", href: "/explore?tab=my_watchlist" },
              { id: "all_watchlist", label: "All Watchlist", href: "/explore?tab=all_watchlist" },
              { id: "news", label: "Notifications & News", href: "/explore?tab=news" },
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
                    if (!val.trim()) {
                      setSelectedTag("All Companies")
                    } else {
                      const matchedTag = ["Fintech", "AI & ML", "CleanTech", "SaaS", "Biotech", "SpaceTech"].find(
                        (t) => t.toLowerCase() === val.trim().toLowerCase()
                      )
                      setSelectedTag(matchedTag || "")
                    }
                  }}
                  placeholder="Search companies..."
                  aria-label="Search companies"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-0 bg-slate-100/90 dark:bg-zinc-900 text-slate-900 dark:text-white text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:bg-slate-100 dark:focus:bg-zinc-800 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("")
                      setSelectedTag("All Companies")
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Quick Company Sector Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 mr-1">
                  Company Sectors:
                </span>
                {["All Companies", "Fintech", "AI & ML", "CleanTech", "SaaS", "Biotech", "SpaceTech"].map((tag) => {
                  const isSelected = selectedTag === tag || (selectedTag === "All" && tag === "All Companies")
                  return (
                    <button
                      key={tag}
                      onClick={() => {
                        setSelectedTag(tag)
                        if (tag === "All Companies") {
                          setSearchQuery("")
                        } else {
                          setSearchQuery(tag)
                        }
                      }}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer border ${
                        isSelected
                          ? "bg-[#00d09c]/15 text-[#00a87e] dark:text-[#00d09c] font-bold border-[#00d09c]/40 shadow-[0_0_8px_rgba(0,208,156,0.15)]"
                          : "bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 hover:bg-slate-200/80 dark:hover:bg-zinc-800 dark:hover:text-white border-transparent dark:border-zinc-800"
                      }`}
                    >
                      {tag}
                    </button>
                  )
                })}
              </div>

              {/* Live Matching Companies Dropdown / Results */}
              {searchQuery.trim() && (
                <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xl space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-zinc-400">
                    <span>Matching Companies ({
                      allCompanies.filter(
                        (c) =>
                          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.cik.toLowerCase().includes(searchQuery.toLowerCase())
                      ).length
                    })</span>
                    <span className="text-[#00d09c] text-[10px]">Corporate Issuer Registry</span>
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-0.5">
                    {allCompanies
                      .filter(
                        (c) =>
                          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.cik.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((comp) => (
                        <div
                          key={comp.id}
                          onClick={() => { openCompanyDossier(comp); setSearchQuery(""); setSelectedTag("All Companies"); }}
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
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeNavTab === "positions" && (
            <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800/60 text-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <PieChart className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Active Portfolio Positions</span>
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
                  <span className="font-bold text-slate-900 dark:text-white block">Corporate Secondary Order Book</span>
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
                  <span className="font-bold text-slate-900 dark:text-white block">Custom Pinned Watchlist</span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">4 Monitored Corporate Issuers · Real-time market metrics</span>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-[#00d09c]">
                Avg 24h: +11.8%
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
                  <span className="font-bold text-slate-900 dark:text-white block">Ecosystem Curated Watchlists</span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">6 Thematic Baskets · 68 Constituent Companies</span>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Global Inflow: $48.2M
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
                      Master Corporate Issuers & Companies Index
                    </span>
                    <span className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      Companies Only · No Ventures
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Official registry of operating corporate entities, verified Delaware C-Corps, SEC CIK filings, and executive leadership. Excludes venture crowdfunding rounds.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {(backendOverview?.totalRegisteredCompanies || allCompanies.length || 25)} Verified Issuers
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
                    Portfolio Intelligence & Shareholder Alerts
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Direct coverage for your 3 active corporate equity holdings: TechFlow AI (TFLOW), GreenLeaf Energy (GGRID), Quantum Materials (QMAT)
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                  1 Action Required
                </span>
                <Link
                  to="/explore?tab=positions"
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

        {/* ─── 1. TAB: SEARCH (DEFAULT EXPLORE WIREFRAME ROWS 2-5) ────────── */}
        {activeNavTab === "search" && (
          <>
            {/* ROW 2: Show all the Recently Viewed companies (Full Width) */}
            <div className="p-3.5 sm:p-4 space-y-3 bg-white dark:bg-zinc-900/40 border border-slate-200/80 dark:border-zinc-800/60 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-emerald-500/10 flex items-center justify-center">
                    <Eye className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Recently Viewed Companies</h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSearchParams({ tab: "index" })}
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Master Index ({liveRecentlyViewed.length}) →
                </button>
              </div>

              {/* 5-Column on Mobile, 8-Column on Desktop Ticker Layout */}
              {liveRecentlyViewed.length === 0 ? (
                <div className="py-6 px-4 text-center rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-dashed border-slate-200 dark:border-zinc-800 my-1">
                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                    No recently viewed companies yet. Browse the Master Index or Sector categories to explore venture dossiers.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-5 md:grid-cols-8 gap-1.5 sm:gap-2.5 lg:gap-3 py-1">
                  {liveRecentlyViewed.map((comp, idx) => (
                    <button
                      key={comp.id}
                      type="button"
                      onClick={() => {
                        const profile = allCompanies.find((c) => c.ticker === comp.ticker) || (allCompanies[0] || null)
                        setSelectedCompanyProfile(profile)
                      }}
                      className={`flex-col items-center justify-center p-2 rounded-xl hover:bg-slate-100/80 dark:hover:bg-zinc-800/60 border border-transparent hover:border-slate-200/80 dark:hover:border-zinc-700/50 transition-all text-center group cursor-pointer w-full ${
                        idx >= 5 ? "hidden md:flex" : "flex"
                      }`}
                    >
                      <div
                        style={getCompanyLogoStyle(comp.logoColor, comp.ticker)}
                        className="h-11 w-11 rounded-full flex items-center justify-center text-white font-extrabold text-xs shadow-xs mb-1.5 group-hover:scale-105 transition-transform ring-2 ring-slate-200/90 dark:ring-zinc-800 shrink-0"
                      >
                        {comp.ticker.substring(0, 2)}
                      </div>
                      <span className="font-bold text-slate-900 dark:text-zinc-200 text-[11px] sm:text-xs truncate w-full group-hover:text-emerald-600 dark:group-hover:text-[#00d09c] transition-colors">
                        {comp.shortName}
                      </span>
                      <span
                        className={`text-[11px] sm:text-xs font-extrabold mt-0.5 ${
                          comp.isPositive ? "text-emerald-600 dark:text-[#00d09c]" : "text-rose-600 dark:text-rose-500"
                        }`}
                      >
                        {comp.change}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ROW 3: Featured Market Movers (Todays Most Invested & Todays Top Gainers) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-start">
              {/* Column 1: Todays most invested companies */}
              <div className="p-3.5 sm:p-4 space-y-3 bg-white dark:bg-zinc-900/40 border border-slate-200/80 dark:border-zinc-800/60 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-emerald-500/10 flex items-center justify-center">
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Todays Most Invested Companies</h3>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 rounded-full">
                    +$3.79M Inflow
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-1.5 sm:gap-3 py-1">
                  {liveMostInvested.map((comp) => {
                    const delta = (comp as any).metricValue || comp.investedToday || "+$1.2M Inflow"
                    return (
                      <button
                        key={comp.id}
                        type="button"
                        onClick={() => {
                          const profile = allCompanies.find((c) => c.ticker === comp.ticker) || (allCompanies[0] || null)
                          setSelectedCompanyProfile(profile)
                        }}
                        className="flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl hover:bg-slate-100/80 dark:hover:bg-zinc-800/60 border border-transparent hover:border-slate-200/80 dark:hover:border-zinc-700/50 transition-all text-center group cursor-pointer w-full min-w-0 min-h-[120px]"
                      >
                        <div
                          style={getCompanyLogoStyle(comp.logoBg, comp.ticker)}
                          className="h-11 w-11 rounded-full flex items-center justify-center text-white font-extrabold text-xs shadow-xs mb-1.5 group-hover:scale-105 transition-transform ring-2 ring-slate-200/90 dark:ring-zinc-800 shrink-0"
                        >
                          {comp.logoText || comp.ticker.substring(0, 2)}
                        </div>
                        <span className="font-bold text-slate-900 dark:text-zinc-200 text-[11px] sm:text-xs truncate w-full group-hover:text-emerald-600 dark:group-hover:text-[#00d09c] transition-colors">
                          {comp.shortName}
                        </span>
                        <span className="text-[11px] sm:text-xs font-extrabold text-emerald-600 dark:text-[#00d09c] mt-0.5">
                          +{comp.percentFunded}%
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-700/90 dark:text-emerald-400/80">
                          {delta}
                        </span>
                      </button>
                    )
                  })}
                </div>

                <CategoryExplanationBox
                  color="emerald"
                  lines={[
                    "Ranks operating issuers attracting the highest net secondary capital inflow over the past 24 hours.",
                    "Reflects strong institutional allocator demand, rapid order matching, and high deal liquidity.",
                    "Aggregated and verified continuously from settled escrow and clearing contracts on White Quantex.",
                    "Signals robust investor conviction and active market accumulation for expanding Delaware entities.",
                  ]}
                />
              </div>

              {/* Column 2: Todays Top Gainers */}
              <div className="p-3.5 sm:p-4 space-y-3 bg-white dark:bg-zinc-900/40 border border-slate-200/80 dark:border-zinc-800/60 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-emerald-500/10 flex items-center justify-center">
                      <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Todays Top Gainers</h3>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 rounded-full">
                    +$39.6M MCap Gain
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-1.5 sm:gap-3 py-1">
                  {liveTopGainers.map((comp) => {
                    const delta = (comp as any).mcapDelta || (comp as any).metricValue || "+$5.0M"
                    return (
                      <button
                        key={comp.id}
                        type="button"
                        onClick={() => {
                          const profile = allCompanies.find((c) => c.ticker === comp.ticker) || (allCompanies[0] || null)
                          setSelectedCompanyProfile(profile)
                        }}
                        className="flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl hover:bg-slate-100/80 dark:hover:bg-zinc-800/60 border border-transparent hover:border-slate-200/80 dark:hover:border-zinc-700/50 transition-all text-center group cursor-pointer w-full min-w-0 min-h-[120px]"
                      >
                        <div
                          style={getCompanyLogoStyle(comp.logoBg, comp.ticker)}
                          className="h-11 w-11 rounded-full flex items-center justify-center text-white font-extrabold text-xs shadow-xs mb-1.5 group-hover:scale-105 transition-transform ring-2 ring-slate-200/90 dark:ring-zinc-800 shrink-0"
                        >
                          {comp.logoText || comp.ticker.substring(0, 2)}
                        </div>
                        <span className="font-bold text-slate-900 dark:text-zinc-200 text-[11px] sm:text-xs truncate w-full group-hover:text-emerald-600 dark:group-hover:text-[#00d09c] transition-colors">
                          {comp.shortName}
                        </span>
                        <span className="text-[11px] sm:text-xs font-extrabold text-emerald-600 dark:text-[#00d09c] mt-0.5">
                          {comp.change} MCap
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-700/90 dark:text-emerald-400/80">
                          +{delta.replace(/^\+/, "")}
                        </span>
                      </button>
                    )
                  })}
                </div>

                <CategoryExplanationBox
                  color="emerald"
                  lines={[
                    "Highlights corporate issuers recording the largest percentage gain in market valuation today.",
                    "Measures enterprise value expansion against the preceding 24-hour baseline clearing benchmark.",
                    "Driven by positive quarterly audited performance, key enterprise contracts, or accretive financing.",
                    "Demonstrates bullish market sentiment and competitive bidding across private secondary desks.",
                  ]}
                />
              </div>
            </div>

            {/* VIEW ALL TOGGLE ACTION BAR (For Market Categories Only) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900/40 border border-slate-200/80 dark:border-zinc-800/60 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-700 dark:text-zinc-300">
                  <Layers className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {showAllSections ? "All Market Movers (6 Categories)" : "More Market Movers"}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    {showAllSections
                      ? "Showing all 6 market categories: Most & Least Invested, Top Gainers & Losers, Most Active, and 52W Highs"
                      : "View Todays Least Invested, Top Losers, Most Active, and 52W Highs"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleToggleViewAll}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 shadow-xs active:scale-[0.98]"
              >
                {showAllSections ? (
                  <>
                    <span>Show Less</span>
                    <ChevronUp className="h-3.5 w-3.5" />
                  </>
                ) : (
                  <>
                    <span>View All Categories</span>
                    <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold">+4</span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>

            {/* COLLAPSIBLE REMAINING SECTIONS: Revealed when showAllSections is active */}
            {showAllSections && (
              <div className="space-y-4 lg:space-y-6">
                {/* Remaining Market Categories (Least Invested, Top Losers, Most Active, 52W Highs) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-start">
                  {/* Column 1: Todays least invested companies */}
                  <div className="p-3.5 sm:p-4 space-y-3 bg-white dark:bg-zinc-900/40 border border-slate-200/80 dark:border-zinc-800/60 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-md bg-amber-500/10 flex items-center justify-center">
                          <Flame className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Todays Least Invested Companies</h3>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-2 py-0.5 rounded-full">
                        Low Inflow
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-1.5 sm:gap-3 py-1">
                      {liveLeastInvested.map((comp) => {
                        const delta = (comp as any).metricValue || comp.investedToday || comp.volume || "Low Inflow"
                        return (
                          <button
                            key={comp.id}
                            type="button"
                            onClick={() => {
                              const profile = allCompanies.find((c) => c.ticker === comp.ticker) || (allCompanies[0] || null)
                              setSelectedCompanyProfile(profile)
                            }}
                            className="flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl hover:bg-slate-100/80 dark:hover:bg-zinc-800/60 border border-transparent hover:border-slate-200/80 dark:hover:border-zinc-700/50 transition-all text-center group cursor-pointer w-full min-w-0 min-h-[120px]"
                          >
                            <div
                              style={getCompanyLogoStyle(comp.logoBg, comp.ticker)}
                              className="h-11 w-11 rounded-full flex items-center justify-center text-white font-extrabold text-xs shadow-xs mb-1.5 group-hover:scale-105 transition-transform ring-2 ring-slate-200/90 dark:ring-zinc-800 shrink-0"
                            >
                              {comp.logoText || comp.ticker.substring(0, 2)}
                            </div>
                            <span className="font-bold text-slate-900 dark:text-zinc-200 text-[11px] sm:text-xs truncate w-full group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                              {comp.shortName}
                            </span>
                            <span className="text-[11px] sm:text-xs font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
                              {comp.percentFunded}%
                            </span>
                            <span className="text-[10px] font-semibold text-amber-700/90 dark:text-amber-400/80">
                              {delta}
                            </span>
                          </button>
                        )
                      })}
                    </div>

                    <CategoryExplanationBox
                      color="amber"
                      lines={[
                        "Identifies verified corporate issuers experiencing the lowest relative transaction flow today.",
                        "Reflects temporary trading consolidation, limited active float, or quiet shareholder cycles.",
                        "Helps value-oriented investors screen for undiscovered gems trading at discounted revenue multiples.",
                        "Calculated by comparing executed secondary order volumes against platform sector averages.",
                      ]}
                    />
                  </div>

                  {/* Column 2: Todays Top Losers */}
                  <div className="p-3.5 sm:p-4 space-y-3 bg-white dark:bg-zinc-900/40 border border-slate-200/80 dark:border-zinc-800/60 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-md bg-rose-500/10 flex items-center justify-center">
                          <TrendingDown className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                        </div>
                        <div>
                          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Todays Top Losers</h3>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 px-2 py-0.5 rounded-full">
                        -$4.09M MCap Loss
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-1.5 sm:gap-3 py-1">
                      {liveTopLosers.map((comp) => {
                        const delta = (comp as any).mcapDelta || (comp as any).metricValue || "-$2.0M"
                        return (
                          <button
                            key={comp.id}
                            type="button"
                            onClick={() => {
                              const profile = allCompanies.find((c) => c.ticker === comp.ticker) || (allCompanies[0] || null)
                              setSelectedCompanyProfile(profile)
                            }}
                            className="flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl hover:bg-slate-100/80 dark:hover:bg-zinc-800/60 border border-transparent hover:border-slate-200/80 dark:hover:border-zinc-700/50 transition-all text-center group cursor-pointer w-full min-w-0 min-h-[120px]"
                          >
                            <div
                              style={getCompanyLogoStyle(comp.logoBg, comp.ticker)}
                              className="h-11 w-11 rounded-full flex items-center justify-center text-white font-extrabold text-xs shadow-xs mb-1.5 group-hover:scale-105 transition-transform ring-2 ring-slate-200/90 dark:ring-zinc-800 shrink-0"
                            >
                              {comp.logoText || comp.ticker.substring(0, 2)}
                            </div>
                            <span className="font-bold text-slate-900 dark:text-zinc-200 text-[11px] sm:text-xs truncate w-full group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                              {comp.shortName}
                            </span>
                            <span className="text-[11px] sm:text-xs font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">
                              {delta}
                            </span>
                            <span className="text-[10px] font-semibold text-rose-700/90 dark:text-rose-400/80">
                              {comp.change} MCap
                            </span>
                          </button>
                        )
                      })}
                    </div>

                    <CategoryExplanationBox
                      color="rose"
                      lines={[
                        "Monitors corporate entities exhibiting the highest percentage contraction in valuation today.",
                        "Often reflects institutional profit-taking, equity dilution adjustments, or sector-wide pullbacks.",
                        "Quantified by secondary trade execution prints below previous clearing settlement prices.",
                        "Provides critical risk transparency for portfolio hedging and opportunistic dip allocations.",
                      ]}
                    />
                  </div>

                  {/* Column 3: Todays Most Active */}
                  <div className="p-3.5 sm:p-4 space-y-3 bg-white dark:bg-zinc-900/40 border border-slate-200/80 dark:border-zinc-800/60 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-md bg-cyan-500/10 flex items-center justify-center">
                          <Activity className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <div>
                          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Todays Most Active</h3>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 px-2 py-0.5 rounded-full">
                        $14.5M Vol
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-1.5 sm:gap-3 py-1">
                      {liveMostActive.map((comp) => {
                        const delta = (comp as any).metricValue || comp.volume || "$14.5M Vol"
                        return (
                          <button
                            key={comp.id}
                            type="button"
                            onClick={() => {
                              const profile = allCompanies.find((c) => c.ticker === comp.ticker) || (allCompanies[0] || null)
                              setSelectedCompanyProfile(profile)
                            }}
                            className="flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl hover:bg-slate-100/80 dark:hover:bg-zinc-800/60 border border-transparent hover:border-slate-200/80 dark:hover:border-zinc-700/50 transition-all text-center group cursor-pointer w-full min-w-0 min-h-[120px]"
                          >
                            <div
                              style={getCompanyLogoStyle(comp.logoBg, comp.ticker)}
                              className="h-11 w-11 rounded-full flex items-center justify-center text-white font-extrabold text-xs shadow-xs mb-1.5 group-hover:scale-105 transition-transform ring-2 ring-slate-200/90 dark:ring-zinc-800 shrink-0"
                            >
                              {comp.logoText || comp.ticker.substring(0, 2)}
                            </div>
                            <span className="font-bold text-slate-900 dark:text-zinc-200 text-[11px] sm:text-xs truncate w-full group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                              {comp.shortName}
                            </span>
                            <span className="text-[11px] sm:text-xs font-extrabold text-cyan-600 dark:text-cyan-400 mt-0.5">
                              {comp.volume || delta}
                            </span>
                            <span className="text-[10px] font-semibold text-cyan-700/90 dark:text-cyan-400/80">
                              {comp.change ? `${comp.change} Today` : "High Vol"}
                            </span>
                          </button>
                        )
                      })}
                    </div>

                    <CategoryExplanationBox
                      color="cyan"
                      lines={[
                        "Ranks operating issuers by total cumulative secondary trading volume and share exchange velocity.",
                        "Combines number of executed institutional transactions and aggregate dollar turnover today.",
                        "Signifies maximum marketplace liquidity, tight bid-ask spreads, and minimal transaction slippage.",
                        "Essential for large institutional investors managing multi-million dollar equity blocks.",
                      ]}
                    />
                  </div>

                  {/* Column 4: Todays 52W Highs */}
                  <div className="p-3.5 sm:p-4 space-y-3 bg-white dark:bg-zinc-900/40 border border-slate-200/80 dark:border-zinc-800/60 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-md bg-purple-500/10 flex items-center justify-center">
                          <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Todays 52W Highs</h3>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 px-2 py-0.5 rounded-full">
                        52W Peak
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-1.5 sm:gap-3 py-1">
                      {liveNewHighs.map((comp) => {
                        const delta = (comp as any).metricValue || (comp as any).valuation || "$85M MCap"
                        return (
                          <button
                            key={comp.id}
                            type="button"
                            onClick={() => {
                              const profile = allCompanies.find((c) => c.ticker === comp.ticker) || (allCompanies[0] || null)
                              setSelectedCompanyProfile(profile)
                            }}
                            className="flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl hover:bg-slate-100/80 dark:hover:bg-zinc-800/60 border border-transparent hover:border-slate-200/80 dark:hover:border-zinc-700/50 transition-all text-center group cursor-pointer w-full min-w-0 min-h-[120px]"
                          >
                            <div
                              style={getCompanyLogoStyle(comp.logoBg, comp.ticker)}
                              className="h-11 w-11 rounded-full flex items-center justify-center text-white font-extrabold text-xs shadow-xs mb-1.5 group-hover:scale-105 transition-transform ring-2 ring-slate-200/90 dark:ring-zinc-800 shrink-0"
                            >
                              {comp.logoText || comp.ticker.substring(0, 2)}
                            </div>
                            <span className="font-bold text-slate-900 dark:text-zinc-200 text-[11px] sm:text-xs truncate w-full group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                              {comp.shortName}
                            </span>
                            <span className="text-[11px] sm:text-xs font-extrabold text-purple-600 dark:text-purple-400 mt-0.5">
                              {comp.change}
                            </span>
                            <span className="text-[10px] font-semibold text-purple-700/90 dark:text-purple-400/80">
                              {delta.replace(/^(\+|-)/, "")}
                            </span>
                          </button>
                        )
                      })}
                    </div>

                    <CategoryExplanationBox
                      color="purple"
                      lines={[
                        "Showcases corporate issuers whose valuations have traded at or above their 52-week peak.",
                        "Denotes sustained operational milestones, recurring revenue records, and balance sheet growth.",
                        "Verified against audited financial statements and historical Delaware corporate filings over 12 months.",
                        "Highlights top-tier institutional market leaders establishing new valuation records.",
                      ]}
                    />
                  </div>
                </div>

                {/* Show Less Categories Button */}
                <div className="flex justify-center pt-1 pb-1">
                  <button
                    type="button"
                    onClick={handleToggleViewAll}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 text-slate-700 dark:text-zinc-200 transition-colors cursor-pointer border border-slate-200/80 dark:border-zinc-700/60 shadow-2xs"
                  >
                    <span>Show Less Categories</span>
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ROW 4: Screener | Tools (Two 50-50 Columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {/* Column 1: Screener */}
              <div className="p-4 sm:p-6 space-y-4 bg-white dark:bg-zinc-900/40 border border-slate-200/80 dark:border-zinc-800/60 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <SlidersHorizontal className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Screener</h3>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">Filter operating companies by sector, trading status, and valuation</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setScreenerSector("All")
                      setScreenerTier("All")
                      setScreenerValuation("All")
                    }}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Sector / Domain
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {["All", "AI / ML", "Fintech", "CleanTech", "Biotech", "SpaceTech"].map((sec) => (
                        <button
                          key={sec}
                          onClick={() => setScreenerSector(sec)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                            screenerSector === sec
                              ? "bg-slate-900 text-white dark:bg-white dark:text-zinc-950 font-bold shadow-2xs border-transparent"
                              : "bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800 dark:hover:text-white border-slate-200/60 dark:border-zinc-800"
                          }`}
                        >
                          {sec}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Operating Status / Tier
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {["All", "Active Trading", "Operating - Private", "Tier-1 Institutional", "Tier-2 Growth"].map((tier) => (
                        <button
                          key={tier}
                          onClick={() => setScreenerTier(tier)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                            screenerTier === tier
                              ? "bg-slate-900 text-white dark:bg-white dark:text-zinc-950 font-bold shadow-2xs border-transparent"
                              : "bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800 dark:hover:text-white border-slate-200/60 dark:border-zinc-800"
                          }`}
                        >
                          {tier}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Valuation Range
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {["All", "< $20M", "$20M - $50M", "$50M+"].map((val) => (
                        <button
                          key={val}
                          onClick={() => setScreenerValuation(val)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                            screenerValuation === val
                              ? "bg-slate-900 text-white dark:bg-white dark:text-zinc-950 font-bold shadow-2xs border-transparent"
                              : "bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800 dark:hover:text-white border-slate-200/60 dark:border-zinc-800"
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Matches: <strong className="text-slate-900 dark:text-white">25 verified companies</strong>
                    </span>
                    <Link
                      to="/explore?tab=index"
                      className="px-4 py-2 rounded-xl bg-[#00d09c] text-black font-bold text-xs hover:bg-[#00b888] transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      Apply Screener <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Column 2: Tools */}
              <div className="p-4 sm:p-6 space-y-4 bg-white dark:bg-zinc-900/40 border border-slate-200/80 dark:border-zinc-800/60 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Calculator className="h-4 w-4 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tools</h3>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">Financial models, valuation engines & diligence tools</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">4 Interactive Utilities</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {toolsList.map((tool) => {
                    const IconComponent = tool.icon
                    return (
                      <div
                        key={tool.id}
                        className="p-3.5 rounded-xl bg-slate-50/90 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700/50 hover:bg-slate-100/80 dark:hover:bg-zinc-800 shadow-2xs hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="h-8 w-8 rounded-lg bg-slate-200/80 dark:bg-zinc-800 flex items-center justify-center text-slate-800 dark:text-white group-hover:bg-[#00d09c]/15 group-hover:text-[#00d09c] transition-colors">
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                            {tool.badge}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-[#00d09c] transition-colors flex items-center justify-between">
                            {tool.name}
                            <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </h4>
                          <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                            {tool.desc}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* ROW 5: Recently added companies (Full Width) */}
            <div className="p-4 sm:p-6 space-y-4 bg-white dark:bg-zinc-900/40 border border-slate-200/80 dark:border-zinc-800/60 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#00d09c]" />
                    Recently Added Companies
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    Newly registered and verified operating companies on White Quantex
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAllRecentlyAdded(!showAllRecentlyAdded)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 transition-colors cursor-pointer border border-slate-200/80 dark:border-zinc-700/60 shadow-2xs"
                  >
                    <span>{showAllRecentlyAdded ? "Show Less" : "View All"}</span>
                    {showAllRecentlyAdded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>
                  <Link
                    to="/explore?tab=index"
                    className="text-xs font-semibold text-emerald-600 dark:text-[#00d09c] hover:underline flex items-center gap-1"
                  >
                    Master Index <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(showAllRecentlyAdded ? liveRecentlyAdded : liveRecentlyAdded.slice(0, 3)).map((comp) => (
                  <div
                    key={comp.id}
                    className="p-4 rounded-xl bg-slate-50/80 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <div
                            style={getCompanyLogoStyle(comp.logoColor, comp.ticker)}
                            className="h-9 w-9 rounded-lg flex items-center justify-center text-white font-extrabold text-xs shadow-xs shrink-0 ring-1 ring-slate-200/80 dark:ring-zinc-800"
                          >
                            {comp.ticker.substring(0, 2)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-bold text-slate-900 dark:text-white text-sm">{comp.name}</h4>
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-[#00d09c]/10 text-[#00a87e] dark:text-[#00d09c]">
                                {comp.verification}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                              {comp.sector} · {comp.location} · Est. {comp.founded}
                            </span>
                          </div>
                        </div>
                        <span className="badge-accent text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                          {comp.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-zinc-300 mt-2 line-clamp-2 leading-relaxed">
                        {comp.tagline}
                      </p>
                    </div>

                    <div className="pt-3 flex items-center justify-between text-xs border-t border-slate-200/60 dark:border-zinc-800/60">
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Annual Revenue</span>
                        <span className="font-extrabold text-slate-900 dark:text-white">{comp.annualRevenue}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Trust Score</span>
                        <span className="font-extrabold text-emerald-600 dark:text-[#00d09c]">{comp.trustScore}/100</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const profile = allCompanies.find((c) => c.ticker === comp.ticker || c.id === comp.id) || (allCompanies[0] || null)
                          setSelectedCompanyProfile(profile)
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-zinc-950 font-bold text-xs hover:bg-slate-800 dark:hover:bg-zinc-200 transition-colors cursor-pointer"
                      >
                        View Dossier
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {showAllRecentlyAdded && liveRecentlyAdded.length > 3 && (
                <div className="flex justify-center pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAllRecentlyAdded(false)}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 transition-colors cursor-pointer border border-slate-200/80 dark:border-zinc-700/60 shadow-2xs"
                  >
                    <span>Show Less Recently Added</span>
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* ROW 6: Upcoming Companies (5-Column Grid, View All Expandable) */}
            <div className="p-4 sm:p-6 space-y-4 bg-white dark:bg-zinc-900/40 border border-slate-200/80 dark:border-zinc-800/60 rounded-2xl shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      Upcoming Companies
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        Pre-Listing Pipeline
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                      Early-stage Delaware entities and private issuers preparing for secondary listing on White Quantex
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAllUpcoming(!showAllUpcoming)}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 transition-colors cursor-pointer border border-slate-200/80 dark:border-zinc-700/60 shadow-2xs shrink-0"
                >
                  <span>{showAllUpcoming ? "Show Less" : "View All Upcoming (+5)"}</span>
                  {showAllUpcoming ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
                {(showAllUpcoming ? liveUpcoming : liveUpcoming.slice(0, 5)).map((comp) => (
                  <div
                    key={comp.id}
                    className="p-3.5 sm:p-4 rounded-xl bg-slate-50/80 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-3 group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1.5 mb-2">
                        <div
                          style={getCompanyLogoStyle(comp.logoBg, comp.ticker)}
                          className="h-9 w-9 rounded-full flex items-center justify-center text-white font-extrabold text-xs shadow-xs shrink-0 ring-2 ring-slate-200/90 dark:ring-zinc-800"
                        >
                          {comp.ticker.substring(0, 2)}
                        </div>
                        <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 shrink-0">
                          {comp.readiness}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {comp.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-zinc-400">
                          <span className="font-mono font-bold text-slate-700 dark:text-zinc-300">{comp.ticker}</span>
                          <span>·</span>
                          <span>{comp.sector}</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                        {comp.description}
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-slate-200/60 dark:border-zinc-800/60 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400">Target Val</span>
                        <span className="font-extrabold font-mono text-slate-900 dark:text-white">{comp.targetValuation}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-500 dark:text-slate-400">Timing</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">{comp.expectedDate}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-500 dark:text-slate-400">Trust Score</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{comp.trustScore}/100</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const profile = allCompanies.find((c) => c.ticker === comp.ticker) || {
                            id: comp.id,
                            name: comp.name,
                            ticker: comp.ticker,
                            legalEntity: comp.legalEntity,
                            cik: `CIK-000${Math.floor(1800000 + Math.random() * 200000)}`,
                            verification: comp.readiness,
                            valuation: comp.targetValuation,
                            annualRevenue: "$8.5M ARR Est.",
                            employees: 35,
                            trustScore: comp.trustScore,
                            description: comp.description,
                            ceo: comp.ceo,
                            exchangeTier: "Pre-Listing Pipeline",
                            sector: comp.sector,
                            logoBg: comp.logoBg,
                          }
                          setSelectedCompanyProfile(profile)
                        }}
                        className="w-full mt-1 py-1.5 rounded-lg text-center text-[11px] font-bold bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 text-white transition-colors cursor-pointer"
                      >
                        Pre-Listing Dossier
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {showAllUpcoming && (
                <div className="flex justify-center pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAllUpcoming(false)}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 transition-colors cursor-pointer border border-slate-200/80 dark:border-zinc-700/60 shadow-2xs"
                  >
                    <span>Show Less Upcoming</span>
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* ROW 7: WQ Recommendation Companies (5-Column Grid, View All Expandable) */}
            <div className="p-4 sm:p-6 space-y-4 bg-white dark:bg-zinc-900/40 border border-slate-200/80 dark:border-zinc-800/60 rounded-2xl shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Award className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      WQ Recommendation Companies
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Quant Rated
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                      Curated high-conviction picks backed by algorithmic DCF valuation, balance sheet health, and momentum
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAllRecommendations(!showAllRecommendations)}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 transition-colors cursor-pointer border border-slate-200/80 dark:border-zinc-700/60 shadow-2xs shrink-0"
                >
                  <span>{showAllRecommendations ? "Show Less" : "View All Recommendations (+5)"}</span>
                  {showAllRecommendations ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
                {(showAllRecommendations ? liveRecommendations : liveRecommendations.slice(0, 5)).map((rec) => {
                  const badgeColor = {
                    "Strong Buy": "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
                    "Top Pick": "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
                    "High Conviction": "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20",
                    "Growth Outperformer": "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
                    "Value Buy": "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
                  }[rec.rating]

                  return (
                    <div
                      key={rec.id}
                      className="p-3.5 sm:p-4 rounded-xl bg-slate-50/80 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-3 group"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1.5 mb-2">
                          <div
                            style={getCompanyLogoStyle(rec.logoBg, rec.ticker)}
                            className="h-9 w-9 rounded-full flex items-center justify-center text-white font-extrabold text-xs shadow-xs shrink-0 ring-2 ring-slate-200/90 dark:ring-zinc-800"
                          >
                            {rec.ticker.substring(0, 2)}
                          </div>
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border shrink-0 ${badgeColor}`}>
                            {rec.rating}
                          </span>
                        </div>

                        <div className="space-y-0.5">
                          <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate group-hover:text-emerald-600 dark:group-hover:text-[#00d09c] transition-colors">
                            {rec.shortName}
                          </h4>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-zinc-400">
                            <span className="font-mono font-bold text-slate-700 dark:text-zinc-300">{rec.ticker}</span>
                            <span>·</span>
                            <span>{rec.sector}</span>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                          {rec.thesis}
                        </p>
                      </div>

                      <div className="pt-2.5 border-t border-slate-200/60 dark:border-zinc-800/60 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 dark:text-slate-400">Target Upside</span>
                          <span className="font-extrabold text-emerald-600 dark:text-[#00d09c]">{rec.upside}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-500 dark:text-slate-400">Val / ARR</span>
                          <span className="font-bold font-mono text-slate-800 dark:text-zinc-200">{rec.valuation} · {rec.annualRevenue}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-500 dark:text-slate-400">Quant Score</span>
                          <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{rec.quantScore}/100</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const profile = allCompanies.find((c) => c.ticker === rec.ticker) || {
                              id: rec.id,
                              name: rec.name,
                              ticker: rec.ticker,
                              legalEntity: rec.legalEntity,
                              cik: rec.cik,
                              verification: "PLATINUM",
                              valuation: rec.valuation,
                              annualRevenue: rec.annualRevenue,
                              employees: 85,
                              trustScore: rec.quantScore,
                              description: rec.thesis,
                              ceo: rec.ceo,
                              exchangeTier: "Tier-1 Institutional",
                              sector: rec.sector,
                              logoBg: rec.logoBg,
                            }
                            setSelectedCompanyProfile(profile)
                          }}
                          className="w-full mt-1 py-1.5 rounded-lg text-center text-[11px] font-bold bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 text-white transition-colors cursor-pointer"
                        >
                          Analytical Dossier
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {showAllRecommendations && (
                <div className="flex justify-center pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAllRecommendations(false)}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 transition-colors cursor-pointer border border-slate-200/80 dark:border-zinc-700/60 shadow-2xs"
                  >
                    <span>Show Less Recommendations</span>
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* ROW 8: Mutual Investment Schemes (5-Column Grid, View All Expandable) */}
            <div className="p-4 sm:p-6 space-y-4 bg-white dark:bg-zinc-900/40 border border-slate-200/80 dark:border-zinc-800/60 rounded-2xl shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                    <PieChart className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      Mutual Investment Schemes
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                        Pooled Baskets
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                      Diversified corporate pooled schemes, sector index vehicles, and algorithmic secondary baskets
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAllSchemes(!showAllSchemes)}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 transition-colors cursor-pointer border border-slate-200/80 dark:border-zinc-700/60 shadow-2xs shrink-0"
                >
                  <span>{showAllSchemes ? "Show Less" : "View All Schemes (+5)"}</span>
                  {showAllSchemes ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
                {(showAllSchemes ? liveSchemes : liveSchemes.slice(0, 5)).map((scheme) => (
                  <div
                    key={scheme.id}
                    className="p-3.5 sm:p-4 rounded-xl bg-slate-50/80 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-3 group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1.5 mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-extrabold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                          {scheme.code}
                        </span>
                        <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 shrink-0">
                          {scheme.strategy}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {scheme.name}
                        </h4>
                        <div className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">
                          {scheme.manager}
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                        {scheme.description}
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-slate-200/60 dark:border-zinc-800/60 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400">NAV</span>
                        <span className="font-extrabold font-mono text-slate-900 dark:text-white">{scheme.nav}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-500 dark:text-slate-400">1Y Return</span>
                        <span className="font-extrabold text-emerald-600 dark:text-[#00d09c]">{scheme.oneYearReturn}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-500 dark:text-slate-400">Min Check</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{scheme.minInvestment}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedSchemeDetail(scheme)}
                        className="w-full mt-1 py-1.5 rounded-lg text-center text-[11px] font-bold bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 text-white transition-colors cursor-pointer"
                      >
                        Scheme Factsheet
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {showAllSchemes && (
                <div className="flex justify-center pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAllSchemes(false)}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 transition-colors cursor-pointer border border-slate-200/80 dark:border-zinc-700/60 shadow-2xs"
                  >
                    <span>Show Less Schemes</span>
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* ─── 2. TAB: POSITIONS (PORTFOLIO HOLDINGS & ALLOCATION VIEW) ────── */}
        {activeNavTab === "positions" && (
          <div className="p-4 sm:p-6 space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-zinc-900/60 shadow-2xs">
                <span className="text-xs text-slate-500 dark:text-zinc-400 block">Total Portfolio Value</span>
                <p className={`text-2xl font-black mt-1 ${portfolioValue > 0 ? "text-[#00d09c]" : "text-slate-400 dark:text-zinc-500"}`}>
                  ${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                {totalReturnPercent !== 0 ? (
                  <span className={`text-[11px] font-bold ${totalReturnPercent >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                    {totalReturnPercent >= 0 ? "+" : ""}{totalReturnPercent.toFixed(1)}% All-time {totalReturnPercent >= 0 ? "Gain" : "Loss"}
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 dark:text-zinc-500">No active positions</span>
                )}
              </div>
              <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-zinc-900/60 shadow-2xs">
                <span className="text-xs text-slate-500 dark:text-zinc-400 block">Invested Capital</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  ${totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400">{livePositions.length} Verified Company Holdings</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-zinc-900/60 shadow-2xs">
                <span className="text-xs text-slate-500 dark:text-zinc-400 block">Unrealized Gain</span>
                <p className={`text-2xl font-black mt-1 ${unrealizedGain >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                  {unrealizedGain >= 0 ? "+" : ""}${Math.abs(unrealizedGain).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400">Audit-verified balance</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-zinc-900/60 shadow-2xs">
                <span className="text-xs text-slate-500 dark:text-zinc-400 block">Compliance Trust Rating</span>
                <p className="text-2xl font-black text-amber-400 mt-1">92 / 100</p>
                <span className="text-[11px] text-amber-500 font-bold">Gold Accredited Tier</span>
              </div>
            </div>

            {/* Active Positions Table */}
            <div className="rounded-xl overflow-hidden bg-slate-50/50 dark:bg-zinc-900/40 shadow-xs">
              <div className="p-4 border-b border-slate-200/40 dark:border-zinc-800/40 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-[#00d09c]" />
                    Active Holdings & Equity Allocation
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    Spring Boot Truth Engine verified cap-table registry
                  </p>
                </div>
                <Link
                  to="/dashboard"
                  className="text-xs font-semibold text-[#00d09c] hover:underline flex items-center gap-1"
                >
                  Full Investor Dashboard <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-zinc-900/90 text-slate-500 dark:text-zinc-400 uppercase text-[10px] tracking-wider border-b border-slate-200/40 dark:border-zinc-800/40">
                    <tr>
                      <th className="py-3 px-4">Company Name</th>
                      <th className="py-3 px-3">Industry</th>
                      <th className="py-3 px-3">Equity %</th>
                      <th className="py-3 px-3">Shares</th>
                      <th className="py-3 px-3">Invested</th>
                      <th className="py-3 px-3">Current Value</th>
                      <th className="py-3 px-3">Total Return</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                    {livePositions.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-10 text-center text-slate-500 dark:text-zinc-400">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Briefcase className="h-7 w-7 text-slate-400 dark:text-zinc-600 mb-0.5" />
                            <p className="font-bold text-xs text-slate-700 dark:text-zinc-300">No active equity holdings</p>
                            <p className="text-[11px] text-slate-500 dark:text-zinc-500 max-w-sm">
                              Your portfolio is currently empty. Explore pre-IPO placements and secondary markets in the Master Index to take your first corporate position.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      livePositions.map((pos) => (
                        <tr key={pos.name} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 dark:text-white block">{pos.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{pos.ticker}</span>
                          </td>
                          <td className="py-3.5 px-3 text-slate-600 dark:text-zinc-300">{pos.ind}</td>
                          <td className="py-3.5 px-3 font-semibold text-slate-900 dark:text-white">{pos.eq}</td>
                          <td className="py-3.5 px-3 text-slate-500 dark:text-zinc-400 font-mono">{pos.shares}</td>
                          <td className="py-3.5 px-3 text-slate-700 dark:text-zinc-300 font-semibold">{pos.inv}</td>
                          <td className="py-3.5 px-3 font-extrabold text-slate-900 dark:text-white">{pos.val}</td>
                          <td className="py-3.5 px-3 font-bold text-emerald-500">{pos.ret}</td>
                          <td className="py-3.5 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500">
                              {pos.st}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                const profile = allCompanies.find((c) => c.ticker === pos.ticker) || (allCompanies[0] || null)
                                setSelectedCompanyProfile(profile)
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-white font-bold text-[11px] transition-colors cursor-pointer"
                            >
                              Dossier
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Asset Diversification Breakdown */}
            <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-zinc-900/60 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Portfolio Sector Diversification</h4>
              {livePositions.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-zinc-400 py-1 font-medium">
                  No active holdings to calculate sector diversification. Acquire shares to populate your portfolio distribution.
                </p>
              ) : (
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 dark:text-zinc-400">AI & Machine Learning (TechFlow AI)</span>
                      <span className="font-bold text-slate-900 dark:text-white">61.7% ($38,500)</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: "61.7%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 dark:text-zinc-400">CleanTech & Energy (GreenLeaf)</span>
                      <span className="font-bold text-slate-900 dark:text-white">19.9% ($12,400)</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#00d09c] h-full rounded-full" style={{ width: "19.9%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 dark:text-zinc-400">DeepTech & Nano Materials (Quantum Materials)</span>
                      <span className="font-bold text-slate-900 dark:text-white">18.4% ($11,500)</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: "18.4%" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── 3. TAB: ORDERS (CORPORATE SECONDARY ORDER BOOK) ───────────────── */}
        {activeNavTab === "orders" && (
          <div className="p-4 sm:p-6 space-y-6">
            <div className="rounded-xl overflow-hidden bg-slate-50/50 dark:bg-zinc-900/40 shadow-xs">
              <div className="p-4 border-b border-slate-200/40 dark:border-zinc-800/40 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-blue-500" />
                    Corporate Orders & Share Executions
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    Audited ledger records with cryptographic contract hash confirmation
                  </p>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  Ledger Node: <strong>US-EAST-JPA</strong>
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-zinc-900/90 text-slate-500 dark:text-zinc-400 uppercase text-[10px] tracking-wider border-b border-slate-200/40 dark:border-zinc-800/40">
                    <tr>
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-3">Company Name</th>
                      <th className="py-3 px-3">Share Class / Instrument</th>
                      <th className="py-3 px-3">Invested Amount</th>
                      <th className="py-3 px-3">Units / Shares</th>
                      <th className="py-3 px-3">Date & Time</th>
                      <th className="py-3 px-3">Settlement Status</th>
                      <th className="py-3 px-4 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                    {liveOrders.filter((ord) => orderFilter === "ALL" || ord.status === orderFilter).length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-10 text-center text-slate-500 dark:text-zinc-400">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <FileCheck className="h-7 w-7 text-slate-400 dark:text-zinc-600 mb-0.5" />
                            <p className="font-bold text-xs text-slate-700 dark:text-zinc-300">No corporate secondary orders</p>
                            <p className="text-[11px] text-slate-500 dark:text-zinc-500 max-w-sm">
                              {orderFilter === "ALL"
                                ? "No trade executions or pending escrow orders recorded on your ledger."
                                : `No orders found matching status filter "${orderFilter}".`}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      liveOrders
                        .filter((ord) => orderFilter === "ALL" || ord.status === orderFilter)
                        .map((ord) => (
                          <tr key={ord.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                              {ord.id}
                            </td>
                            <td className="py-3.5 px-3 font-semibold text-slate-900 dark:text-white">
                              {ord.company}
                            </td>
                            <td className="py-3.5 px-3 text-slate-600 dark:text-zinc-300">{ord.instrument}</td>
                            <td className="py-3.5 px-3 font-bold text-[#00d09c]">{ord.amount}</td>
                            <td className="py-3.5 px-3 text-slate-500 dark:text-zinc-400 font-mono">{ord.shares}</td>
                            <td className="py-3.5 px-3 text-slate-500 dark:text-zinc-400 text-[11px]">{ord.date}</td>
                            <td className="py-3.5 px-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${ord.badge}`}>
                                {ord.statusLabel}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-white font-bold text-[11px] transition-colors cursor-pointer">
                                View Receipt
                              </button>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Compliance Note */}
            <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-zinc-900/60 shadow-2xs flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-[#00d09c] shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">
                  Institutional Security & Escrow Guarantee
                </span>
                <p className="text-slate-500 dark:text-zinc-400 leading-relaxed">
                  Every executed order is backed by automated smart escrow custody, SEC Rule 506(c) accredited verification, and tamper-proof cap table synchronizations on our Spring Boot PostgreSQL core.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ─── 4. TAB: MY WATCHLIST (PERSONAL PINNED VENTURES) ─────────────── */}
        {activeNavTab === "my_watchlist" && (
          <div className="p-4 sm:p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Bookmark className="h-4 w-4 text-amber-500 fill-amber-500" />
                  My Pinned Watchlist (6 Companies)
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Track price alerts, corporate filings, and secondary trading volume in real-time
                </p>
              </div>
              <button className="px-3 py-1.5 rounded-lg bg-[#00d09c] text-black font-bold text-xs hover:bg-[#00b888] transition-colors cursor-pointer flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 fill-black" />
                Add Company
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: "TechFlow AI Solutions", ticker: "TFLOW", sector: "AI & Cloud", val: "$42.5M", change: "+14.2%", status: "Active Trading", revenue: "$15.2M ARR" },
                { name: "NovaPay Technologies", ticker: "NPAY", sector: "Fintech", val: "$65.0M", change: "+3.1%", status: "Active Trading", revenue: "$22.8M ARR" },
                { name: "CyberShield Vault", ticker: "CYBR", sector: "Cybersecurity", val: "$52.0M", change: "+15.7%", status: "Active Trading", revenue: "$18.6M ARR" },
                { name: "TerraVolt Storage", ticker: "TVLT", sector: "CleanTech", val: "$62.0M", change: "+8.4%", status: "Active Trading", revenue: "$19.8M ARR" },
                { name: "Aether Dynamics", ticker: "AETH", sector: "SpaceTech", val: "$48.0M", change: "+22.5%", status: "Active Trading", revenue: "$12.4M ARR" },
                { name: "BioVanguard Labs", ticker: "BVGD", sector: "Biotech", val: "$22.0M", change: "+5.9%", status: "Operating - Private", revenue: "$3.5M ARR" },
              ].map((wl) => (
                <div
                  key={wl.name}
                  className="p-4 rounded-xl bg-slate-50/80 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs hover:shadow-xs transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{wl.name}</span>
                        <Bookmark className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                        {wl.ticker} · {wl.sector}
                      </span>
                    </div>
                    <span className="badge-accent text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {wl.status}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Valuation: <strong className="text-slate-900 dark:text-white">{wl.val}</strong></span>
                      <span className="text-emerald-500 font-bold">{wl.change} 24h</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Annual Revenue: <strong className="text-slate-700 dark:text-zinc-300">{wl.revenue}</strong></span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">Alerts: Active</span>
                    <button
                      type="button"
                      onClick={() => {
                        const profile = allCompanies.find((c) => c.ticker === wl.ticker) || (allCompanies[0] || null)
                        setSelectedCompanyProfile(profile)
                      }}
                      className="px-3 py-1 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-zinc-950 font-bold text-xs hover:bg-slate-800 dark:hover:bg-zinc-200 transition-colors cursor-pointer"
                    >
                      View Dossier
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── 5. TAB: ALL WATCHLIST (CURATED SECTOR BASKETS) ──────────────── */}
        {activeNavTab === "all_watchlist" && (
          <div className="p-4 sm:p-6 space-y-6">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="h-4 w-4 text-purple-500" />
                Curated Ecosystem Sector Watchlists
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Thematic corporate industry baskets curated by White Quantex research analysts
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  title: "Top AI & GenAI Breakthroughs",
                  count: 14,
                  change: "+28.4% 30d",
                  followers: "1,420",
                  constituents: "TechFlow, CogniSense, OmniLogic",
                  desc: "Next-gen multimodal foundation models and vertical autonomous enterprise agents.",
                },
                {
                  title: "CleanTech & Energy Transition",
                  count: 9,
                  change: "+16.2% 30d",
                  followers: "890",
                  constituents: "GreenLeaf, TerraVolt, AeroCarbon",
                  desc: "Grid-scale battery chemistry, solid-state cells, and carbon capture infrastructure.",
                },
                {
                  title: "Institutional Fintech & DeFi",
                  count: 12,
                  change: "+19.5% 30d",
                  followers: "2,100",
                  constituents: "NovaPay, FinLedger, CyberShield",
                  desc: "Cross-border clearing, compliant secondary trading, and zero-knowledge ledger protocols.",
                },
                {
                  title: "Autonomous Robotics & Drones",
                  count: 8,
                  change: "+14.1% 30d",
                  followers: "670",
                  constituents: "MediSync, AgriDrone, Aether",
                  desc: "Robotic surgical actuators, autonomous agro-drones, and micro-satellite systems.",
                },
                {
                  title: "Precision Health & BioTech",
                  count: 10,
                  change: "+9.3% 30d",
                  followers: "940",
                  constituents: "BioVanguard, Helix Bio, GenePulse",
                  desc: "Targeted oncology payloads, gene synthesis platforms, and AI pathology diagnostics.",
                },
                {
                  title: "High-Growth Corporate Radar",
                  count: 15,
                  change: "+32.0% 30d",
                  followers: "1,150",
                  constituents: "FinLedger, SolarHarvest, OmniLogic",
                  desc: "Established mid-tier corporate issuers displaying accelerated top-line ARR expansion.",
                },
              ].map((basket) => (
                <div
                  key={basket.title}
                  className="p-4 rounded-xl bg-slate-50/80 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs hover:shadow-xs transition-all space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{basket.title}</h4>
                      <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        {basket.change}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block mt-0.5">
                      {basket.count} Companies · {basket.followers} Followers
                    </span>
                    <p className="text-xs text-slate-600 dark:text-zinc-300 mt-2 line-clamp-2 leading-relaxed">
                      {basket.desc}
                    </p>
                  </div>

                  <div className="pt-3 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-400 truncate max-w-[170px]">
                      Top: {basket.constituents}
                    </span>
                    <button className="px-3 py-1 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-zinc-950 font-bold text-xs hover:bg-slate-800 dark:hover:bg-zinc-200 transition-colors cursor-pointer flex items-center gap-1">
                      <Star className="h-3 w-3" /> Follow
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── 5.5. TAB: INDEX (OPERATING COMPANIES DIRECTORY ONLY - NOT VENTURES) ─── */}
        {activeNavTab === "index" && (
          <div className="p-4 sm:p-6 space-y-6">
            {/* Top Corporate Registry Scope Card */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white shadow-xs relative overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
              <div className="relative z-10 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1">
                      <Building2 className="h-2.5 w-2.5 text-indigo-400" />
                      Corporate Registry
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                      <ShieldCheck className="h-2.5 w-2.5 text-emerald-400" />
                      Companies Only · No Ventures
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    SEC CIK & Delaware Division of Corporations Verified
                  </span>
                </div>

                <div className="space-y-0.5">
                  <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                    Corporate Issuers Index Directory
                  </h2>
                  <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                    Directory of verified operational companies, incorporating Delaware C-Corps, statutory legal entities, executive officers, and enterprise valuations. Strictly operating corporate entities — excluding active venture crowdfunding campaigns and rounds.
                  </p>
                </div>

                {/* KPI Metrics Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xs">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-semibold">Corporate Issuers</span>
                    <span className="text-xs sm:text-sm font-extrabold text-white mt-0.5 block">{(backendOverview?.totalRegisteredCompanies || allCompanies.length || 25)} Verified</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xs">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-semibold">Aggregate Valuation</span>
                    <span className="text-xs sm:text-sm font-extrabold text-[#00d09c] mt-0.5 block">$1.08 Billion</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xs">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-semibold">Legal Entities</span>
                    <span className="text-xs sm:text-sm font-extrabold text-indigo-300 mt-0.5 block">100% C-Corp / Inc</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xs">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-semibold">Corporate Trust</span>
                    <span className="text-xs sm:text-sm font-extrabold text-amber-300 mt-0.5 block">94.8 / 100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter, Search & View Controls */}
            <div className="space-y-3">
              {/* Search Bar & View Mode Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-500" />
                  <input
                    type="text"
                    value={indexSearchQuery}
                    onChange={(e) => setIndexSearchQuery(e.target.value)}
                    placeholder="Search operating companies by legal name, ticker, CEO, sector, CIK, HQ..."
                    className="w-full pl-10 pr-9 py-2 rounded-xl text-xs sm:text-sm bg-slate-100/90 dark:bg-zinc-900 border-0 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:bg-slate-100 dark:focus:bg-zinc-800 transition-colors"
                  />
                  {indexSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setIndexSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Sort Selector */}
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100/80 dark:bg-zinc-900 text-xs">
                    <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-slate-500 dark:text-zinc-400 font-semibold hidden sm:inline">Sort:</span>
                    <select
                      value={indexSortBy}
                      onChange={(e) => setIndexSortBy(e.target.value as any)}
                      className="bg-transparent font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer text-xs"
                    >
                      <option value="valuation" className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white">Valuation (High to Low)</option>
                      <option value="name" className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white">Company Name (A-Z)</option>
                      <option value="founded" className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white">Year Founded</option>
                      <option value="employees" className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white">Employee Count</option>
                    </select>
                  </div>

                  {/* View Mode Toggle: Table / Grid */}
                  <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-zinc-900">
                    <button
                      type="button"
                      onClick={() => setIndexViewMode("table")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                        indexViewMode === "table"
                          ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs"
                          : "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white"
                      }`}
                      title="Table Directory View"
                    >
                      <Table className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Table</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIndexViewMode("grid")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                        indexViewMode === "grid"
                          ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs"
                          : "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white"
                      }`}
                      title="Grid Card View"
                    >
                      <LayoutGrid className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Grid</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* A-Z Alphabetical Directory Jump Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                  <span className="font-semibold flex items-center gap-1">
                    Alphabetical Directory Jump:
                  </span>
                  <span>
                    Showing <strong>{filteredCompaniesIndex.length}</strong> of {(backendOverview?.totalRegisteredCompanies || allCompanies.length || 25)} corporate issuers
                  </span>
                </div>
                <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                  {alphabetLetters.map((letter) => {
                    const isLetterActive = indexSelectedLetter === letter
                    const countForLetter = letter === "ALL" 
                      ? (backendOverview?.totalRegisteredCompanies || allCompanies.length || 25) 
                      : allCompanies.filter((c) => c.name.toUpperCase().startsWith(letter)).length
                    return (
                      <button
                        key={letter}
                        type="button"
                        onClick={() => setIndexSelectedLetter(letter)}
                        disabled={countForLetter === 0 && letter !== "ALL"}
                        className={`px-2 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer shrink-0 ${
                          isLetterActive
                            ? "bg-indigo-600 text-white shadow-xs"
                            : countForLetter === 0
                            ? "text-slate-300 dark:text-zinc-700 cursor-not-allowed"
                            : "bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300"
                        }`}
                      >
                        {letter}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Sector Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500 shrink-0 mr-1 flex items-center gap-1">
                  <Filter className="h-3 w-3" /> Sector:
                </span>
                {indexSectorList.map((sector) => {
                  const isSectorActive = indexSelectedSector === sector
                  return (
                    <button
                      key={sector}
                      type="button"
                      onClick={() => setIndexSelectedSector(sector)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                        isSectorActive
                          ? "bg-slate-900 text-white dark:bg-white dark:text-zinc-950 shadow-xs"
                          : "bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                      }`}
                    >
                      {sector}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Empty Search / Filter State */}
            {filteredCompaniesIndex.length === 0 ? (
              <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-zinc-800 space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                  <Building2 className="h-6 w-6" />
                </div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  No Operating Companies Found
                </h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
                  No registered corporate issuers match your query &quot;{indexSearchQuery || indexSelectedLetter}&quot; in the selected sector.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIndexSearchQuery("")
                    setIndexSelectedLetter("ALL")
                    setIndexSelectedSector("All")
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer"
                >
                  Reset Directory Filters
                </button>
              </div>
            ) : indexViewMode === "table" ? (
              /* ── TABLE VIEW ─────────────────────────────────────────── */
              <div className="rounded-xl overflow-hidden bg-white dark:bg-zinc-900/40 border border-slate-200/80 dark:border-zinc-800/80 shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/90 dark:bg-zinc-900/80 text-slate-500 dark:text-zinc-400 font-semibold border-b border-slate-200/60 dark:border-zinc-800/60 select-none">
                      <tr>
                        <th className="py-3 px-4">Company & Legal Entity</th>
                        <th className="py-3 px-3">Ticker / CIK</th>
                        <th className="py-3 px-3">Sector & Specialization</th>
                        <th className="py-3 px-3">Headquarters</th>
                        <th className="py-3 px-3">Executive CEO</th>
                        <th className="py-3 px-3 text-right">Headcount</th>
                        <th className="py-3 px-3 text-right">Valuation / ARR</th>
                        <th className="py-3 px-3 text-center">Status</th>
                        <th className="py-3 px-4 text-right">Dossier</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80 font-normal">
                      {filteredCompaniesIndex.map((comp) => (
                        <tr
                          key={comp.id}
                          onClick={() => setSelectedCompanyProfile(comp)}
                          className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer group"
                        >
                          {/* Company Name & Entity */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div
                                style={getCompanyLogoStyle(comp.logoColor, comp.ticker)}
                                className="h-8 w-8 rounded-lg text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs ring-1 ring-slate-200/80 dark:ring-zinc-800"
                              >
                                {comp.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors block truncate">
                                  {comp.name}
                                </span>
                                <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
                                  {comp.legalEntity} · Est. {comp.foundedYear || (comp as any).founded}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Ticker / CIK */}
                          <td className="py-3.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 block w-fit">
                              {comp.ticker}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                              {comp.cik}
                            </span>
                          </td>

                          {/* Sector & SubIndustry */}
                          <td className="py-3.5 px-3">
                            <span className="font-semibold text-slate-800 dark:text-zinc-200 block">
                              {comp.sector}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-zinc-400 truncate block max-w-[180px]">
                              {comp.subIndustry}
                            </span>
                          </td>

                          {/* Headquarters */}
                          <td className="py-3.5 px-3">
                            <span className="flex items-center gap-1 text-slate-700 dark:text-zinc-300">
                              <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                              {comp.headquarters}
                            </span>
                            <span className="text-[10px] text-slate-400 block pl-4">
                              {comp.region}
                            </span>
                          </td>

                          {/* CEO */}
                          <td className="py-3.5 px-3">
                            <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-zinc-200">
                              <User className="h-3 w-3 text-slate-400 shrink-0" />
                              {comp.ceo}
                            </span>
                            <span className="text-[10px] text-slate-400 block pl-4">
                              Chief Executive
                            </span>
                          </td>

                          {/* Employees */}
                          <td className="py-3.5 px-3 text-right">
                            <span className="font-bold text-slate-800 dark:text-zinc-200 font-mono">
                              {comp.employees}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              FTEs
                            </span>
                          </td>

                          {/* Valuation & ARR */}
                          <td className="py-3.5 px-3 text-right">
                            <span className="font-extrabold text-slate-900 dark:text-white font-mono block">
                              {comp.valuation}
                            </span>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                              {comp.annualRevenue}
                            </span>
                          </td>

                          {/* Status & Verification */}
                          <td className="py-3.5 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 inline-block">
                              {comp.status}
                            </span>
                            <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold mt-0.5">
                              {comp.verificationLevel || (comp as any).verification}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedCompanyProfile(comp)
                              }}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-indigo-50 dark:bg-zinc-800 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                              Dossier
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* ── GRID CARD VIEW ─────────────────────────────────────── */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredCompaniesIndex.map((comp) => (
                  <div
                    key={comp.id}
                    onClick={() => setSelectedCompanyProfile(comp)}
                    className="p-3 rounded-xl bg-white dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs hover:shadow-xs transition-all cursor-pointer space-y-2.5 flex flex-col justify-between group"
                  >
                    <div className="space-y-2">
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            style={getCompanyLogoStyle(comp.logoColor, comp.ticker)}
                            className="h-7 w-7 rounded-lg text-white font-extrabold flex items-center justify-center text-[11px] shadow-2xs shrink-0 ring-1 ring-slate-200/80 dark:ring-zinc-800"
                          >
                            {comp.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                              {comp.name}
                            </h4>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="px-1 py-0.2 rounded text-[9px] font-mono font-bold bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200">
                                {comp.ticker}
                              </span>
                              <span className="text-[9px] text-slate-400 font-mono truncate">
                                {comp.legalEntity}
                              </span>
                            </div>
                          </div>
                        </div>

                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                          {comp.verificationLevel || (comp as any).verification}
                        </span>
                      </div>

                      {/* Sector & Sub-industry */}
                      <div>
                        <span className="text-[10px] font-bold text-slate-700 dark:text-zinc-300 block truncate">
                          {comp.sector} · {comp.subIndustry}
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed mt-0.5">
                          {comp.description}
                        </p>
                      </div>

                      {/* Compact Financial & Headcount Grid */}
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 p-2 rounded-lg bg-slate-100/60 dark:bg-zinc-800/40 text-[10px]">
                        <div>
                          <span className="text-[9px] text-slate-400 block">Valuation</span>
                          <span className="font-extrabold text-slate-900 dark:text-white font-mono text-[11px] block">{comp.valuation}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block">Revenue Run-rate</span>
                          <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono text-[11px] block">{comp.annualRevenue}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block">Headcount</span>
                          <span className="font-semibold text-slate-800 dark:text-zinc-200 text-[10px] block">{comp.employees} FTEs</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block">Founded</span>
                          <span className="font-semibold text-slate-800 dark:text-zinc-200 text-[10px] block">{comp.foundedYear || (comp as any).founded}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="pt-2 flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1 text-slate-500 dark:text-zinc-400 text-[10px] truncate max-w-[150px]">
                        <User className="h-2.5 w-2.5 shrink-0 text-slate-400" />
                        <span className="truncate">{comp.ceo}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedCompanyProfile(comp)
                        }}
                        className="px-2 py-0.5 rounded-md bg-slate-900 dark:bg-white text-white dark:text-zinc-950 font-bold text-[10px] hover:bg-indigo-600 dark:hover:bg-zinc-200 transition-colors flex items-center gap-0.5 cursor-pointer"
                      >
                        Dossier
                        <ChevronRight className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── 6. TAB: NEWS & NOTIFICATIONS (INVESTED COMPANIES ONLY) ─────────── */}
        {activeNavTab === "news" && (
          <div className="p-4 sm:p-6 space-y-6">
            
            {/* Top Section Header & KPI Overview */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/40 dark:border-zinc-800/40">
              <div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <Bell className="h-4 w-4" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Invested Portfolio Intelligence & Shareholder Notifications
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  Exclusively filtered for your 3 active corporate equity holdings: <strong className="text-slate-800 dark:text-zinc-200">TechFlow AI Solutions</strong>, <strong className="text-slate-800 dark:text-zinc-200">GreenLeaf Energy</strong>, and <strong className="text-slate-800 dark:text-zinc-200">Quantum Materials Corp</strong>.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setDismissedNoticeIds(liveHoldingsNotifications.map((n: any) => n.id))
                    setToastMessage("All shareholder notifications marked as read.")
                    setTimeout(() => setToastMessage(null), 3000)
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
                  Mark All Read
                </button>
                <Link
                  to="/explore?tab=positions"
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#00d09c] hover:bg-[#00b588] text-slate-950 transition-colors shadow-xs flex items-center gap-1"
                >
                  <Briefcase className="h-3.5 w-3.5" />
                  View Portfolio
                </Link>
              </div>
            </div>

            {/* KPI Cards for Invested Holdings Intelligence */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-zinc-900/60 shadow-2xs">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Monitored Holdings Value</span>
                <p className="text-2xl font-black text-[#00d09c] mt-1">$62,400.00</p>
                <span className="text-[10px] text-emerald-500 font-bold">+38.6% All-Time Portfolio ROI</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-zinc-900/60 shadow-2xs">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Pending Shareholder Actions</span>
                <p className="text-2xl font-black text-rose-500 mt-1">
                  {voteSubmittedSuccess ? "0 Pending" : "1 Vote Required"}
                </p>
                <span className="text-[10px] text-rose-500 dark:text-rose-400 font-bold">
                  {voteSubmittedSuccess ? "Ballot Submitted & Recorded" : "QMAT AGM Proxy Ballot Open"}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-zinc-900/60 shadow-2xs">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Invested News Coverage</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{liveHoldingsNews.length} Articles</p>
                <span className="text-[10px] text-emerald-500 font-bold">100% Holdings Coverage</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-zinc-900/60 shadow-2xs">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Cash Yield Settled (YTD)</span>
                <p className="text-2xl font-black text-blue-500 mt-1">$320.00</p>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">Credited from GreenLeaf Energy</span>
              </div>
            </div>

            {/* Filter Chips & Search Bar */}
            <div className="p-4 rounded-xl bg-slate-50/60 dark:bg-zinc-900/50 space-y-3">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                {/* Company Filter Chips */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mr-1">
                    Filter by Holding:
                  </span>
                  {[
                    { id: "ALL", label: "All Holdings (3)" },
                    { id: "TFLOW", label: "TechFlow AI (TFLOW)" },
                    { id: "GGRID", label: "GreenLeaf Energy (GGRID)" },
                    { id: "QMAT", label: "Quantum Materials (QMAT)" },
                  ].map((chip) => (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => setNewsCompanyFilter(chip.id as any)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                        newsCompanyFilter === chip.id
                          ? "bg-slate-900 text-white dark:bg-white dark:text-zinc-950 shadow-xs border-transparent"
                          : "bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800 dark:hover:text-white border-transparent dark:border-zinc-800"
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                {/* Type Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mr-1">
                    Category:
                  </span>
                  {[
                    { id: "ALL", label: "All Updates" },
                    { id: "NOTIFICATIONS", label: "Notifications" },
                    { id: "NEWS", label: "Press & News" },
                    { id: "ACTION", label: "Action Required (1)" },
                  ].map((typeChip) => (
                    <button
                      key={typeChip.id}
                      type="button"
                      onClick={() => setNewsTypeFilter(typeChip.id as any)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer border ${
                        newsTypeFilter === typeChip.id
                          ? "bg-[#00d09c]/15 text-[#00a87e] dark:text-[#00d09c] font-bold border-[#00d09c]/40 shadow-[0_0_8px_rgba(0,208,156,0.15)]"
                          : "bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800 dark:hover:text-white border-transparent dark:border-zinc-800"
                      }`}
                    >
                      {typeChip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Keyword Search Input */}
              <div className="relative pt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={newsSearchInput}
                  onChange={(e) => setNewsSearchInput(e.target.value)}
                  placeholder="Search updates across your invested companies (e.g. 'dividend', 'proxy vote', 'patent', 'series b', 'cloud')..."
                  className="w-full pl-9 pr-4 py-2 rounded-lg border-0 bg-slate-100/90 dark:bg-zinc-900 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:bg-slate-100 dark:focus:bg-zinc-800 transition-all"
                />
                {newsSearchInput && (
                  <button
                    type="button"
                    onClick={() => setNewsSearchInput("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Main Content 2-Column Split: Shareholder Notifications | Invested Company News */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column (5 Cols): Shareholder Notifications & Corporate Desk */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#00d09c]" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Shareholder Notifications</h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                    Official Issuer Notices
                  </span>
                </div>

                <div className="space-y-3">
                  {liveHoldingsNotifications
                    .filter((notif) => {
                      if (newsCompanyFilter !== "ALL" && notif.ticker !== newsCompanyFilter) return false
                      if (newsTypeFilter === "NEWS") return false
                      if (newsTypeFilter === "ACTION" && notif.type !== "ACTION") return false
                      if (newsSearchInput.trim()) {
                        const q = newsSearchInput.toLowerCase()
                        return (
                          notif.title.toLowerCase().includes(q) ||
                          notif.content.toLowerCase().includes(q) ||
                          notif.companyName.toLowerCase().includes(q) ||
                          notif.ticker.toLowerCase().includes(q)
                        )
                      }
                      return true
                    })
                    .map((notif) => {
                      const isVoted = notif.id === "notif-1" && voteSubmittedSuccess
                      const isDismissed = dismissedNoticeIds.includes(notif.id)

                      return (
                        <div
                          key={notif.id}
                          className={`p-4 rounded-xl transition-all space-y-3 ${
                            notif.isUrgent && !isVoted
                              ? "bg-rose-500/10 dark:bg-rose-500/10 shadow-xs"
                              : "bg-slate-50/80 dark:bg-zinc-900/60 shadow-2xs hover:shadow-xs"
                          } ${isDismissed ? "opacity-60" : ""}`}
                        >
                          {/* Header row */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-white font-mono">
                                {notif.ticker}
                              </span>
                              <span className="text-xs font-bold text-slate-900 dark:text-white">
                                {notif.companyName}
                              </span>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${notif.badgeColor}`}>
                              {isVoted ? "Voted - Recorded" : notif.badge}
                            </span>
                          </div>

                          {/* Notice Title */}
                          <div>
                            <h5 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                              {notif.title}
                            </h5>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-zinc-400 mt-1">
                              <span className="flex items-center gap-1">
                                <Clock className="h-2.5 w-2.5" />
                                {notif.time}
                              </span>
                              <span>·</span>
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                {notif.holdingContext}
                              </span>
                            </div>
                          </div>

                          {/* Notice Body */}
                          <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                            {notif.content}
                          </p>

                          {/* Footer Action */}
                          <div className="pt-2 flex items-center justify-between">
                            <span className="text-[10px] text-slate-400">
                              Deadline: <strong className="text-slate-700 dark:text-zinc-300">{notif.dueDate}</strong>
                            </span>

                            {notif.actionType === "vote" ? (
                              <button
                                type="button"
                                onClick={() => setActiveVoteModal(true)}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                  isVoted
                                    ? "bg-emerald-500/10 text-emerald-500"
                                    : "bg-rose-500 hover:bg-rose-600 text-white shadow-xs"
                                }`}
                              >
                                <Vote className="h-3.5 w-3.5" />
                                {isVoted ? "View Recorded Ballot" : "Cast Proxy Vote"}
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveDetailModal(notif)
                                }}
                                className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 transition-colors cursor-pointer flex items-center gap-1"
                              >
                                {notif.actionLabel}
                                <ArrowUpRight className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>

              {/* Right Column (7 Cols): Invested Company News Feed */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Newspaper className="h-4 w-4 text-[#00d09c]" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Holdings Press & Media Intelligence</h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00d09c] animate-pulse" />
                    Verified PR Newsdesk
                  </span>
                </div>

                <div className="space-y-4">
                  {liveHoldingsNews
                    .filter((news) => {
                      if (newsCompanyFilter !== "ALL" && news.ticker !== newsCompanyFilter) return false
                      if (newsTypeFilter === "NOTIFICATIONS" || newsTypeFilter === "ACTION") return false
                      if (newsSearchInput.trim()) {
                        const q = newsSearchInput.toLowerCase()
                        return (
                          news.title.toLowerCase().includes(q) ||
                          news.snippet.toLowerCase().includes(q) ||
                          news.companyName.toLowerCase().includes(q) ||
                          news.ticker.toLowerCase().includes(q)
                        )
                      }
                      return true
                    })
                    .map((news) => (
                      <div
                        key={news.id}
                        className="p-4 sm:p-5 rounded-xl bg-slate-50/80 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs hover:shadow-xs transition-all space-y-3 group"
                      >
                        {/* Top Meta Line */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div
                              style={getCompanyLogoStyle(news.logoColor, news.ticker)}
                              className="h-6 w-6 rounded-md text-white font-bold text-[10px] flex items-center justify-center ring-1 ring-slate-200/80 dark:ring-zinc-800 shrink-0"
                            >
                              {news.ticker.slice(0, 2)}
                            </div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {news.companyName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({news.ticker})
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${news.categoryColor}`}>
                              {news.category}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00d09c]/10 text-[#00a87e] dark:text-[#00d09c]">
                              {news.sentiment}
                            </span>
                          </div>
                        </div>

                        {/* News Title */}
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#00d09c] transition-colors leading-snug">
                          {news.title}
                        </h4>

                        {/* Source and Time */}
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400">
                          <span className="font-semibold text-slate-700 dark:text-zinc-300">{news.source}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {news.time}
                          </span>
                          <span>•</span>
                          <span>{news.readTime}</span>
                        </div>

                        {/* Article Snippet */}
                        <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                          {news.snippet}
                        </p>

                        {/* Impact Highlight Pill */}
                        <div className="p-2.5 rounded-lg bg-slate-100/70 dark:bg-zinc-800/60 flex items-center justify-between text-xs">
                          <span className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                            Estimated Portfolio Impact:
                          </span>
                          <span className="font-extrabold text-[#00d09c] text-xs">
                            {news.impactMetric}
                          </span>
                        </div>

                        {/* Key Bullet Points */}
                        <div className="space-y-1.5 pt-1 text-xs text-slate-600 dark:text-zinc-400">
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{news.detailBullet1}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{news.detailBullet2}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="font-medium text-slate-800 dark:text-zinc-200">{news.detailBullet3}</span>
                          </div>
                        </div>

                        {/* Card Bottom CTA */}
                        <div className="pt-2 flex items-center justify-between">
                          <span className="text-[11px] text-slate-400">SEC & PR Regulatory Release</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setActiveDetailModal(news)}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
                            >
                              Read Full Release
                            </button>
                            <Link
                              to="/explore?tab=positions"
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-white font-bold text-xs transition-colors flex items-center gap-1"
                            >
                              View Position <ArrowRight className="h-3 w-3" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* INTERACTIVE MODALS FOR INVESTED NEWS & NOTIFICATIONS             */}
        {/* ═════════════════════════════════════════════════════════════════ */}

        {/* 1. Shareholder Proxy Voting Modal (Quantum Materials AGM) */}
        {activeVoteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
                    <Vote className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Official Shareholder Proxy Ballot
                    </h3>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Quantum Materials Corp (QMAT) · Annual General Meeting 2026
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveVoteModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Verified Holding Context */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Verified Beneficial Holding</span>
                  <span className="text-[11px] text-slate-600 dark:text-zinc-400">Certificate #WQ-QMAT-8841 · Delaware Registry</span>
                </div>
                <span className="font-extrabold text-[#00d09c] text-sm">2,500 Shares (0.25%)</span>
              </div>

              {/* Proposal 1 */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">
                    Proposal 1: Re-election of Independent Board Slate
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">Board Recommends: FOR</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Re-elect Dr. Marcus Thorne, Sarah Lin, and David Sterling as Independent Directors for the 2026-2028 term.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  {(["FOR", "AGAINST", "ABSTAIN"] as const).map((choice) => (
                    <button
                      key={choice}
                      type="button"
                      onClick={() => setSelectedProposalVote((prev) => ({ ...prev, p1: choice }))}
                      className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-colors border ${
                        selectedProposalVote.p1 === choice
                          ? "bg-slate-900 text-white dark:bg-white dark:text-zinc-950 border-transparent shadow-xs"
                          : "border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-slate-300"
                      }`}
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              </div>

              {/* Proposal 2 */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">
                    Proposal 2: 10% Unallocated Stock Option Pool Authorization
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">Board Recommends: FOR</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Authorize a 10% pool expansion to attract key engineering talent for the next-generation nanocrystal manufacturing plant.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  {(["FOR", "AGAINST", "ABSTAIN"] as const).map((choice) => (
                    <button
                      key={choice}
                      type="button"
                      onClick={() => setSelectedProposalVote((prev) => ({ ...prev, p2: choice }))}
                      className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-colors border ${
                        selectedProposalVote.p2 === choice
                          ? "bg-slate-900 text-white dark:bg-white dark:text-zinc-950 border-transparent shadow-xs"
                          : "border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-slate-300"
                      }`}
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveVoteModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setVoteSubmittedSuccess(true)
                    setActiveVoteModal(false)
                    setToastMessage("Proxy ballot cast successfully for Quantum Materials Corp (2,500 Shares recorded).")
                    setTimeout(() => setToastMessage(null), 3500)
                  }}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#00d09c] hover:bg-[#00b588] text-slate-950 shadow-md transition-all flex items-center gap-1.5"
                >
                  <Check className="h-4 w-4" />
                  Submit Official Ballot
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. Structured Detail Modal for Notifications & Press Releases */}
        {activeDetailModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-white">
                    {activeDetailModal.ticker}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {activeDetailModal.companyName}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveDetailModal(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {activeDetailModal.title}
                </h4>

                <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                  {activeDetailModal.content || activeDetailModal.snippet}
                </p>

                {activeDetailModal.impactMetric && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-zinc-400">Valuation & Yield Impact</span>
                    <span className="font-extrabold text-[#00d09c]">{activeDetailModal.impactMetric}</span>
                  </div>
                )}

                {activeDetailModal.holdingContext && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 text-xs">
                    <span className="text-slate-400 block text-[10px]">Your Investor Position</span>
                    <span className="font-bold text-slate-900 dark:text-white">{activeDetailModal.holdingContext}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveDetailModal(null)
                    setToastMessage("Document downloaded successfully to your downloads folder.")
                    setTimeout(() => setToastMessage(null), 3000)
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 transition-colors flex items-center gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  Save / Download
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDetailModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2.5. Corporate Issuer Dossier Modal (Index Tab - Strictly Operating Companies) */}
        {selectedCompanyProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
              
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div
                    style={getCompanyLogoStyle(selectedCompanyProfile.logoColor, selectedCompanyProfile.ticker)}
                    className="h-12 w-12 rounded-xl text-white font-extrabold flex items-center justify-center text-base shadow-xs ring-2 ring-slate-200/80 dark:ring-zinc-800 shrink-0"
                  >
                    {selectedCompanyProfile.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                        {selectedCompanyProfile.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200">
                        {selectedCompanyProfile.ticker}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-zinc-400">
                      <span>{selectedCompanyProfile.legalEntity}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{selectedCompanyProfile.headquarters}</span>
                      <span>·</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{selectedCompanyProfile.status}</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCompanyProfile(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Verified Issuer Notice Strip */}
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200">
                  <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>
                    <strong>Corporate Entity Record:</strong> Filed under {selectedCompanyProfile.legalEntity} with official SEC registration CIK: <strong>{selectedCompanyProfile.cik}</strong>.
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-bold text-[10px] uppercase tracking-wider shrink-0 text-center">
                  {selectedCompanyProfile.verification} Verified
                </span>
              </div>

              {/* 4-Cell Key Corporate Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/40">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Enterprise Valuation</span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono mt-0.5 block">{selectedCompanyProfile.valuation}</span>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/40">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Annual Revenue Run-rate</span>
                  <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">{selectedCompanyProfile.annualRevenue}</span>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/40">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Verified Headcount</span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono mt-0.5 block">{selectedCompanyProfile.employees} FTEs</span>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/40">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Corporate Trust Index</span>
                  <span className="text-base font-extrabold text-amber-500 font-mono mt-0.5 block">{selectedCompanyProfile.trustScore} / 100</span>
                </div>
              </div>

              {/* Corporate Overview & Capabilities */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-indigo-500" />
                  Corporate Description & Technology Scope
                </h4>
                <p className="text-slate-600 dark:text-zinc-300 leading-relaxed bg-slate-50 dark:bg-zinc-800/30 p-3.5 rounded-xl border border-slate-100 dark:border-zinc-800">
                  {selectedCompanyProfile.description}
                </p>
              </div>

              {/* Corporate Governance & Statutory Registry Details */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2.5 text-xs">
                <h4 className="font-bold text-slate-900 dark:text-white">
                  Corporate Governance & Filing Record
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-zinc-400">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-zinc-800/40">
                    <span>Chief Executive Officer</span>
                    <strong className="text-slate-900 dark:text-white">{selectedCompanyProfile.ceo}</strong>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-zinc-800/40">
                    <span>Legal Jurisdiction</span>
                    <strong className="text-slate-900 dark:text-white">{selectedCompanyProfile.legalEntity}</strong>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-zinc-800/40">
                    <span>SEC CIK Identifier</span>
                    <strong className="text-slate-900 dark:text-white font-mono">{selectedCompanyProfile.cik}</strong>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-zinc-800/40">
                    <span>Trading Tier</span>
                    <strong className="text-slate-900 dark:text-white">{selectedCompanyProfile.exchangeTier}</strong>
                  </div>
                </div>
              </div>

              {/* Strict Notice: Companies Only, Not Ventures */}
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 text-[11px] text-slate-500 dark:text-zinc-400 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 dark:text-zinc-200">Operating Corporate Entity Notice:</strong> This dossier represents an operational commercial business and legal corporate entity. It does not represent an active crowdfunding round, investment solicitation, or speculative venture campaign.
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedCompanyProfile.cik)
                    setToastMessage(`Copied SEC CIK (${selectedCompanyProfile.cik}) to clipboard.`)
                    setTimeout(() => setToastMessage(null), 3000)
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Copy CIK Registry
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCompanyProfile(null)
                    setToastMessage(`Official Issuer Dossier for ${selectedCompanyProfile.name} exported to downloads.`)
                    setTimeout(() => setToastMessage(null), 3500)
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export Corporate Dossier
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCompanyProfile(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}

        {/* 4. Mutual Investment Scheme Factsheet Modal */}
        {selectedSchemeDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <PieChart className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-extrabold bg-purple-500/10 text-purple-600 dark:text-purple-400">
                        {selectedSchemeDetail.code}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                        {selectedSchemeDetail.strategy}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        {selectedSchemeDetail.riskLevel} Risk
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                      {selectedSchemeDetail.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Managed by {selectedSchemeDetail.manager}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSchemeDetail(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* 4-Cell Key Scheme Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/40">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Net Asset Value (NAV)</span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono mt-0.5 block">{selectedSchemeDetail.nav}</span>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/40">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">1-Year Return</span>
                  <span className="text-base font-extrabold text-emerald-600 dark:text-[#00d09c] font-mono mt-0.5 block">{selectedSchemeDetail.oneYearReturn}</span>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/40">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Total Pool AUM</span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono mt-0.5 block">{selectedSchemeDetail.aum}</span>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/40">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Min Investment</span>
                  <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400 font-mono mt-0.5 block">{selectedSchemeDetail.minInvestment}</span>
                </div>
              </div>

              {/* Scheme Strategy & Description */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-purple-500" />
                  Portfolio Mandate & Quantitative Strategy
                </h4>
                <p className="text-slate-600 dark:text-zinc-300 leading-relaxed bg-slate-50 dark:bg-zinc-800/30 p-3.5 rounded-xl border border-slate-100 dark:border-zinc-800">
                  {selectedSchemeDetail.description}
                </p>
              </div>

              {/* Holdings Breakdown */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <PieChart className="h-4 w-4 text-indigo-500" />
                    Top Asset Holdings & Weighting
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">Quarterly Rebalanced</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedSchemeDetail.topHoldings.map((h, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 font-semibold font-mono text-[11px]"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              {/* Benchmark & Statutory Structure */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-600 dark:text-zinc-400">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-800">
                  <span>Target Benchmark</span>
                  <strong className="text-slate-900 dark:text-white font-mono">{selectedSchemeDetail.benchmark}</strong>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-800">
                  <span>Annual Management Ratio</span>
                  <strong className="text-slate-900 dark:text-white font-mono">{selectedSchemeDetail.expenseRatio}</strong>
                </div>
              </div>

              {/* Legal Notice */}
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 text-[11px] text-slate-500 dark:text-zinc-400 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 dark:text-zinc-200">Statutory Pooled Custody:</strong> All scheme units are custodied under Delaware statutory trust clearing regulations. Escrow contracts settle into authenticated institutional wallets.
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSchemeDetail(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const name = selectedSchemeDetail.name
                    const code = selectedSchemeDetail.code
                    setSelectedSchemeDetail(null)
                    setToastMessage(`Allocation order initiated for ${name} (${code}). Statutory escrow contract created.`)
                    setTimeout(() => setToastMessage(null), 4000)
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <DollarSign className="h-3.5 w-3.5" />
                  Participate in Scheme ({selectedSchemeDetail.minInvestment})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. Global Feedback Toast */}
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

