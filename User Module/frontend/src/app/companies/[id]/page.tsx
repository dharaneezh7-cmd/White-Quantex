import React, { useState, useMemo, useRef, useEffect } from "react"
import { useParams, Link } from "react-router"
import { useQuery } from "@tanstack/react-query"
import {
  ArrowLeft,
  Building2,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Award,
  FileText,
  Download,
  Share2,
  Bookmark,
  CheckCircle2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  Layers,
  Lock,
  Activity,
  BarChart3,
  Scale,
  Briefcase,
  AlertCircle,
  Copy,
  Check,
  Clock,
  Sparkles,
  MessageSquare,
  MessageCircle,
  Heart,
  Send,
  Plus,
  Users2,
  Flame,
  Radio,
  CornerDownRight,
  ThumbsUp,
  Globe
} from "lucide-react"
import { exploreService, getCompanyInvestmentDetails, type CompanySummary } from "../../../services/explore/exploreService"
import { communityService } from "../../../services/community/communityService"

// Helper for logo styling
function getCompanyLogoStyle(logoColor?: string, ticker?: string) {
  if (logoColor && logoColor.startsWith("bg-")) {
    const colorMap: Record<string, string> = {
      "bg-indigo-600": "#4f46e5",
      "bg-indigo-700": "#4338ca",
      "bg-emerald-600": "#059669",
      "bg-emerald-700": "#047857",
      "bg-emerald-500": "#10b981",
      "bg-cyan-600": "#0891b2",
      "bg-cyan-700": "#0e7490",
      "bg-blue-600": "#2563eb",
      "bg-blue-700": "#1d4ed8",
      "bg-purple-600": "#9333ea",
      "bg-purple-700": "#7e22ce",
      "bg-rose-600": "#e11d48",
      "bg-rose-700": "#be123c",
      "bg-amber-600": "#d97706",
      "bg-amber-500": "#f59e0b",
      "bg-teal-600": "#0d9488",
      "bg-orange-600": "#ea580c",
      "bg-violet-600": "#7c3aed",
      "bg-slate-700": "#334155",
      "bg-zinc-700": "#3f3f46",
      "bg-red-600": "#dc2626",
    }
    return { backgroundColor: colorMap[logoColor] || "#4f46e5" }
  }
  const hash = (ticker || "WQ").split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const hues = [210, 160, 260, 340, 35, 190, 280]
  return { backgroundColor: `hsl(${hues[hash % hues.length]}, 70%, 45%)` }
}

function formatCompactCurrency(value: number, decimals: number = 2): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(decimals)}B`
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(decimals)}M`
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(decimals)}K`
  }
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`
}

interface CompanyPostItem {
  id: string
  authorName: string
  authorRole: string
  authorVerification: string
  createdAt: string
  content: string
  hashtags: string[]
  likesCount: number
  commentsCount: number
  sharesCount: number
  category?: string
}

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const companyIdentifier = id || "VOCL"

  const [timeframe, setTimeframe] = useState<"1D" | "1W" | "1M" | "3M" | "1Y" | "ALL">("1M")
  const [selectedMetricView, setSelectedMetricView] = useState<"investor_interest" | "company_growth" | "field_growth">("company_growth")
  const [activeTab, setActiveTab] = useState<"overview" | "governance" | "financials" | "trading" | "posts" | "communities">("overview")
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null)
  const [copiedCIK, setCopiedCIK] = useState(false)
  const [isWatchlisted, setIsWatchlisted] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false)
  const [tradeShares, setTradeShares] = useState(100)
  const [investAmount, setInvestAmount] = useState(25000)

  // Posts & Community Interaction State
  const [postFilter, setPostFilter] = useState<"all" | "executive" | "milestones">("all")
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({})
  const [likeCountOffsets, setLikeCountOffsets] = useState<Record<string, number>>({})
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Record<string, boolean>>({})
  const [joinedCommunities, setJoinedCommunities] = useState<Record<string, boolean>>({})
  const [isPostingModalOpen, setIsPostingModalOpen] = useState(false)
  const [newPostContent, setNewPostContent] = useState("")
  const [newPostCategory, setNewPostCategory] = useState("Executive Dispatch")
  const [userCreatedPosts, setUserCreatedPosts] = useState<CompanyPostItem[]>([])

  // Horizontal Tabs Carousel Ref & Arrow Handlers
  const tabsScrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScrollState = () => {
    if (tabsScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsScrollRef.current
      setCanScrollLeft(scrollLeft > 5)
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5)
    }
  }

  useEffect(() => {
    checkScrollState()
    const timer = setTimeout(checkScrollState, 150)
    window.addEventListener("resize", checkScrollState)
    return () => {
      clearTimeout(timer)
      window.removeEventListener("resize", checkScrollState)
    }
  }, [activeTab])

  const handleScrollLeft = () => {
    tabsScrollRef.current?.scrollBy({ left: -240, behavior: "smooth" })
    setTimeout(checkScrollState, 280)
  }

  const handleScrollRight = () => {
    tabsScrollRef.current?.scrollBy({ left: 240, behavior: "smooth" })
    setTimeout(checkScrollState, 280)
  }

  // Fetch authoritative company data from Spring Boot PostgreSQL engine
  const { data: company, isLoading } = useQuery({
    queryKey: ["explore", "company-detail", companyIdentifier],
    queryFn: () => exploreService.getCompanyById(companyIdentifier),
    staleTime: 60_000,
    retry: 1,
  })

  // Fetch live communities from Node.js MongoDB engine
  const { data: allCommunities = [] } = useQuery({
    queryKey: ["community", "all-hubs"],
    queryFn: () => communityService.getCommunities(),
    staleTime: 60_000,
  })

  // Fetch backend posts from Node.js MongoDB engine
  const { data: backendPostsData } = useQuery({
    queryKey: ["community", "company-posts-feed", companyIdentifier],
    queryFn: () => communityService.getFeed(0, 30, { query: company?.shortName || company?.ticker }),
    staleTime: 60_000,
  })

  // Estimated share price and valuation metrics
  const valuationNum = company?.valuationNum || 84600000
  const annualRevNum = company?.annualRevenueNum || 28800000
  const isPositiveChange = company?.isPositive ?? true
  const changePercent = company?.changePercent ?? 8.4

  // Implied share price calculation (based on 2.5M shares baseline)
  const totalShares = 2_500_000
  const baseSharePrice = valuationNum / totalShares

  // Generate deterministic interactive chart data points based on timeframe & company stats & selectedMetricView
  const chartPoints = useMemo(() => {
    const count = timeframe === "1D" ? 30 : timeframe === "1W" ? 40 : 50
    const points: { label: string; price: number; volume: number; date: string }[] = []

    let baseValue = valuationNum
    let trendMultiplier = isPositiveChange ? 1 : -1
    let totalTrend = (changePercent / 100) * trendMultiplier

    if (selectedMetricView === "investor_interest") {
      baseValue = 92.5
      totalTrend = 0.185
    } else if (selectedMetricView === "field_growth") {
      baseValue = 1248.5
      totalTrend = 0.264
    }

    const now = new Date()
    const stepHours = timeframe === "1D" ? 0.25 : timeframe === "1W" ? 4 : timeframe === "1M" ? 14 : 72

    let runningPrice = baseValue * (1 - totalTrend * 0.8)

    for (let i = 0; i < count; i++) {
      const progress = i / (count - 1)
      const randomNoise = (Math.sin(i * 1.3) * 0.4 + Math.cos(i * 2.1) * 0.3) * (baseValue * 0.02)
      const trend = (baseValue * totalTrend) * progress
      const p = Math.max(1, runningPrice + trend + randomNoise)

      const pointDate = new Date(now.getTime() - (count - 1 - i) * stepHours * 3600000)
      const dateStr = timeframe === "1D" 
        ? pointDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : pointDate.toLocaleDateString([], { month: "short", day: "numeric" })

      points.push({
        label: dateStr,
        price: parseFloat(p.toFixed(2)),
        volume: Math.floor(1000 + Math.abs(Math.sin(i)) * 8500),
        date: pointDate.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
      })
    }
    return points
  }, [timeframe, valuationNum, isPositiveChange, changePercent, selectedMetricView])

  // Active price display (switches to hovered point when scrubbing chart)
  const defaultBaseValue = selectedMetricView === "investor_interest" ? 92.5 : selectedMetricView === "field_growth" ? 1248.5 : valuationNum
  const activePricePoint = hoveredPointIndex !== null && chartPoints[hoveredPointIndex] 
    ? chartPoints[hoveredPointIndex] 
    : chartPoints[chartPoints.length - 1]

  const firstPrice = chartPoints[0]?.price || defaultBaseValue
  const currentPrice = activePricePoint?.price || defaultBaseValue
  const periodDelta = currentPrice - firstPrice
  const periodPercent = ((periodDelta / firstPrice) * 100).toFixed(2)
  const isPeriodPositive = periodDelta >= 0

  // Calculate 52-Week Range in Enterprise Market Cap Valuation
  const low52WVal = valuationNum * 0.72
  const high52WVal = valuationNum * 1.34
  const low52W = formatCompactCurrency(low52WVal, 1)
  const high52W = formatCompactCurrency(high52WVal, 1)
  const rangePosition = Math.min(100, Math.max(0, ((valuationNum - low52WVal) / (high52WVal - low52WVal)) * 100))

  const handleCopyCIK = () => {
    if (company?.cik) {
      navigator.clipboard.writeText(company.cik)
      setCopiedCIK(true)
      setToastMessage(`Copied SEC CIK (${company.cik}) to clipboard`)
      setTimeout(() => setCopiedCIK(false), 2500)
      setTimeout(() => setToastMessage(null), 3500)
    }
  }

  const handleExportDossier = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(company, null, 2))
    const downloadAnchor = document.createElement("a")
    downloadAnchor.setAttribute("href", dataStr)
    downloadAnchor.setAttribute("download", `${company?.ticker || "COMPANY"}_Dossier_SEC.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
    setToastMessage(`Official Issuer Dossier exported for ${company?.name || "Company"}`)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Graceful fallback for company info
  const comp: CompanySummary = company || {
    id: "00000000-0000-0000-0001-000000000127",
    ticker: "VOCL",
    name: "AeroBattery Inc.",
    shortName: "AeroBattery",
    legalEntity: "Delaware C-Corp",
    cik: "CIK-0002100102",
    sector: "CleanTech",
    subIndustry: "Industrial Carbon Capture",
    headquarters: "San Diego, CA",
    region: "West Coast",
    foundedYear: 2022,
    ceo: "Dmitri Martinez",
    employees: 229,
    valuation: "$84.6M",
    valuationNum: 84600000,
    annualRevenue: "$28.8M ARR",
    annualRevenueNum: 28800000,
    verificationLevel: "PLATINUM",
    trustScore: 90,
    description: "AeroBattery engineers institutional industrial carbon capture infrastructure providing high-throughput verified execution for enterprise and private market allocators.",
    logoColor: "bg-red-600",
    status: "Active Trading",
    exchangeTier: "Tier-1 Institutional",
    change24h: "-16.9%",
    changePercent: -16.9,
    isPositive: false,
    marketCapGainLoss: "-$14.3M",
    investedToday: "Low Inflow",
    allocationPercent: 77,
    tradingVolumeToday: "$2.5M Vol"
  }

  const inv = useMemo(() => getCompanyInvestmentDetails(comp), [comp])

  // Active Metric Display Info based on selected growth & momentum dimension
  const metricDisplayInfo = useMemo(() => {
    const rawSector = comp.sector || "Sector"
    const fieldTitle = (rawSector.toLowerCase().includes("ai") || rawSector.toLowerCase().includes("artificial intelligence"))
      ? "AI Field Growth"
      : `${rawSector} Field Growth`

    if (selectedMetricView === "investor_interest") {
      return {
        title: "Investor Interest",
        valueText: `${currentPrice.toFixed(1)} / 100`,
        unitText: "Demand Index",
        changeText: `+${periodPercent}% Inflow Surge`,
        subtitle: `Accredited Syndicate Demand, Secondary Order Depth & Cap Table Interest`,
        badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        badgeText: "High Investor Demand",
      }
    }
    if (selectedMetricView === "field_growth") {
      return {
        title: fieldTitle,
        valueText: `${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`,
        unitText: "Sector Index PTS",
        changeText: `+${periodPercent}% Sector CAGR`,
        subtitle: `Global ${rawSector} Industry Benchmark & Macro Category Adoption Curve`,
        badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
        badgeText: "Macro Tailwinds",
      }
    }
    const formattedDelta = formatCompactCurrency(Math.abs(periodDelta), 2)
    return {
      title: "Market Cap Growth",
      valueText: formatCompactCurrency(currentPrice, 2),
      unitText: "Market Cap",
      changeText: `${isPeriodPositive ? "+" : ""}${periodPercent}% (${isPeriodPositive ? "+" : "-"}${formattedDelta})`,
      subtitle: `${comp.name} Enterprise Market Capitalization & Corporate Valuation Trajectory`,
      badgeColor: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
      badgeText: "Enterprise Valuation",
    }
  }, [selectedMetricView, currentPrice, periodPercent, isPeriodPositive, periodDelta, comp.name, comp.sector])

  // ── Affiliated Communities tailored to this company's sector & governance ──
  const affiliatedCommunities = useMemo(() => {
    if (!allCommunities || allCommunities.length === 0) {
      return [
        {
          id: "hub-sector",
          name: `${comp.sector} & Infrastructure Leaders`,
          slug: `${comp.sector.toLowerCase().replace(/[^a-z0-9]/g, "-")}-hub`,
          description: `Collaborative institutional working group for verified ${comp.sector} corporate founders, engineers, and accredited capital syndicates.`,
          categories: [comp.sector, comp.subIndustry],
          memberCount: 1140,
          postCount: 58,
          role: "Primary Corporate Issuer Hub",
          isPrimary: true
        },
        {
          id: "hub-delaware",
          name: "Delaware Statutory Corporate Issuers",
          slug: "delaware-issuers",
          description: "Private secondary liquidity, corporate governance, investor relations, 409A valuations, and cap table management.",
          categories: ["Corporate", "Secondary", "Governance"],
          memberCount: 1650,
          postCount: 112,
          role: "Delaware C-Corp Registered Member",
          isPrimary: false
        }
      ]
    }

    // Match sector specific hub from database
    const sectorHub = allCommunities.find((c) => {
      const matchName = c.name.toLowerCase().includes(comp.sector.toLowerCase())
      const matchCat = (c.categories || []).some((cat) => cat.toLowerCase().includes(comp.sector.toLowerCase()))
      return matchName || matchCat
    })

    const delawareHub = allCommunities.find((c) => c.slug === "delaware-issuers" || c.name.toLowerCase().includes("delaware"))
    const generalHub = allCommunities.find((c) => c.id !== sectorHub?.id && c.id !== delawareHub?.id)

    const list = []
    if (sectorHub) {
      list.push({
        ...sectorHub,
        role: "Primary Corporate Issuer Hub",
        isPrimary: true
      })
    } else {
      list.push({
        id: "hub-sector-dyn",
        name: `${comp.sector} Ecosystem Hub`,
        slug: `${comp.sector.toLowerCase()}-hub`,
        description: `Verified enterprise forum for ${comp.sector} innovations and institutional syndicates.`,
        categories: [comp.sector, "Enterprise"],
        memberCount: 890,
        postCount: 46,
        role: "Primary Corporate Issuer Hub",
        isPrimary: true
      })
    }

    if (delawareHub) {
      list.push({
        ...delawareHub,
        role: "Delaware Statutory Issuer Member",
        isPrimary: false
      })
    }

    if (generalHub && list.length < 3) {
      list.push({
        ...generalHub,
        role: "Institutional Syndicate Partner",
        isPrimary: false
      })
    }

    return list
  }, [allCommunities, comp.sector, comp.subIndustry])

  // ── Company-Specific Posts & Executive Updates ──
  const companyPosts: CompanyPostItem[] = useMemo(() => {
    // Curated authoritative posts directly from this company's leadership
    const executivePosts: CompanyPostItem[] = [
      {
        id: `comp-post-${comp.ticker}-1`,
        authorName: comp.ceo,
        authorRole: "CHIEF EXECUTIVE OFFICER",
        authorVerification: comp.verificationLevel || "PLATINUM",
        createdAt: "2 days ago",
        category: "Executive Dispatch",
        content: `Excited to present our Q3 operational milestone for ${comp.name}. We successfully completed commercial pilot trials across our ${comp.subIndustry.toLowerCase()} architecture, demonstrating a 3.8x throughput increase with zero thermal downtime. Thank you to our Delaware syndicates and institutional partners on White Quantex.`,
        hashtags: [comp.sector.replace(/[^a-zA-Z]/g, ""), "Milestone", "EnterpriseInfrastructure"],
        likesCount: 184,
        commentsCount: 29,
        sharesCount: 14
      },
      {
        id: `comp-post-${comp.ticker}-2`,
        authorName: `${comp.name} Regulatory & Legal Team`,
        authorRole: "CORPORATE ISSUER DISPATCH",
        authorVerification: "GOLD",
        createdAt: "5 days ago",
        category: "Statutory Governance",
        content: `Official Notice: ${comp.name} has submitted its updated Delaware statutory annual filing and secondary trading covenants. Verified accredited shareholders can review the updated 409A valuation schedule and unallocated option pool reserve details in the corporate data room.`,
        hashtags: ["DelawareCorp", "SECRegistry", "Governance", comp.ticker],
        likesCount: 96,
        commentsCount: 12,
        sharesCount: 8
      },
      {
        id: `comp-post-${comp.ticker}-3`,
        authorName: comp.ceo,
        authorRole: "FOUNDER & CEO",
        authorVerification: comp.verificationLevel || "PLATINUM",
        createdAt: "12 days ago",
        category: "Commercial Contracts",
        content: `Commercial expansion update: ${comp.shortName} closed a multi-year enterprise compute & deployment contract with a Fortune 100 consortium. Our ARR run-rate has expanded past ${comp.annualRevenue}, reflecting strong institutional demand for verified scalable execution.`,
        hashtags: ["ARR", "Growth", "VentureLiquidity", comp.sector.replace(/[^a-zA-Z]/g, "")],
        likesCount: 242,
        commentsCount: 38,
        sharesCount: 21
      }
    ]

    // Merge with any posts from backend feed matching this company
    const backendItems: CompanyPostItem[] = (backendPostsData?.content || []).map((p: any) => ({
      id: p.id || p._id,
      authorName: p.author?.displayName || comp.ceo,
      authorRole: p.author?.headline || "Corporate Representative",
      authorVerification: p.author?.verificationLevel || "GOLD",
      createdAt: new Date(p.createdAt || Date.now()).toLocaleDateString([], { month: "short", day: "numeric" }),
      category: "Ecosystem Discussion",
      content: p.content,
      hashtags: p.hashtags || [comp.sector],
      likesCount: p.likesCount || 18,
      commentsCount: p.commentsCount || 4,
      sharesCount: p.sharesCount || 2
    }))

    const combined = [...userCreatedPosts, ...executivePosts, ...backendItems]
    return combined
  }, [comp, backendPostsData, userCreatedPosts])

  // Filtered posts based on selected tab filter
  const displayedPosts = useMemo(() => {
    if (postFilter === "executive") {
      return companyPosts.filter((p) => p.category === "Executive Dispatch" || p.authorRole.includes("CEO"))
    }
    if (postFilter === "milestones") {
      return companyPosts.filter((p) => p.category === "Commercial Contracts" || p.content.toLowerCase().includes("milestone") || p.content.toLowerCase().includes("arr"))
    }
    return companyPosts
  }, [companyPosts, postFilter])

  // SVG Chart Dimensions & Math
  const minPrice = Math.min(...chartPoints.map((p) => p.price)) * 0.98
  const maxPrice = Math.max(...chartPoints.map((p) => p.price)) * 1.02
  const svgWidth = 800
  const svgHeight = 260
  const paddingX = 20
  const paddingY = 30

  const getCoordinates = (index: number, price: number) => {
    const x = paddingX + (index / (chartPoints.length - 1)) * (svgWidth - paddingX * 2)
    const y = svgHeight - paddingY - ((price - minPrice) / (maxPrice - minPrice)) * (svgHeight - paddingY * 2)
    return { x, y }
  }

  const pathD = chartPoints.reduce((acc, point, index) => {
    const { x, y } = getCoordinates(index, point.price)
    return index === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`
  }, "")

  const fillD = pathD
    ? `${pathD} L ${svgWidth - paddingX} ${svgHeight} L ${paddingX} ${svgHeight} Z`
    : ""

  const chartThemeColor = isPeriodPositive ? "#00d09c" : "#f43f5e"
  const chartGradientId = isPeriodPositive ? "priceGradGreen" : "priceGradRed"

  const handleLikePost = (postId: string) => {
    const isCurrentlyLiked = likedPosts[postId]
    setLikedPosts((prev) => ({ ...prev, [postId]: !isCurrentlyLiked }))
    setLikeCountOffsets((prev) => ({
      ...prev,
      [postId]: (prev[postId] || 0) + (isCurrentlyLiked ? -1 : 1)
    }))
  }

  const handleBookmarkPost = (postId: string) => {
    const isCurrent = bookmarkedPosts[postId]
    setBookmarkedPosts((prev) => ({ ...prev, [postId]: !isCurrent }))
    setToastMessage(!isCurrent ? "Post bookmarked in your library" : "Bookmark removed")
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleSharePost = (post: CompanyPostItem) => {
    navigator.clipboard.writeText(window.location.href)
    setToastMessage(`Link to official dispatch by ${post.authorName} copied to clipboard`)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleJoinCommunity = (commId: string, commName: string) => {
    const isCurrentlyJoined = joinedCommunities[commId]
    setJoinedCommunities((prev) => ({ ...prev, [commId]: !isCurrentlyJoined }))
    setToastMessage(!isCurrentlyJoined ? `You joined ${commName}` : `Left ${commName}`)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handlePublishNewPost = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPostContent.trim()) return

    const newPost: CompanyPostItem = {
      id: `user-post-${Date.now()}`,
      authorName: comp.ceo,
      authorRole: "EXECUTIVE ISSUER DISPATCH",
      authorVerification: comp.verificationLevel || "PLATINUM",
      createdAt: "Just now",
      category: newPostCategory,
      content: newPostContent.trim(),
      hashtags: [comp.ticker, comp.sector.replace(/[^a-zA-Z]/g, ""), "OfficialDispatch"],
      likesCount: 1,
      commentsCount: 0,
      sharesCount: 0
    }

    setUserCreatedPosts([newPost, ...userCreatedPosts])
    setNewPostContent("")
    setIsPostingModalOpen(false)
    setToastMessage(`Official executive update for ${comp.name} published to White Quantex feed`)
    setTimeout(() => setToastMessage(null), 4000)
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 animate-pulse">
        <div className="h-4 w-40 bg-slate-200 dark:bg-zinc-800 rounded-md" />
        <div className="h-32 bg-slate-100 dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800" />
        <div className="h-80 bg-slate-100 dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-100 dark:bg-zinc-900 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 pb-20">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="h-4 w-4 text-[#00d09c]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Breadcrumb & Institutional Status Bar */}
      <div className="border-b border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/explore"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Explore Issuers</span>
            </Link>
            <span className="text-slate-300 dark:text-zinc-700">/</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
              {comp.sector}
            </span>
            <span className="text-slate-300 dark:text-zinc-700">/</span>
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{comp.ticker}</span>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#00d09c] animate-pulse" />
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsWatchlisted(!isWatchlisted)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border cursor-pointer ${
                isWatchlisted
                  ? "bg-[#00d09c]/15 text-[#00a87e] dark:text-[#00d09c] border-[#00d09c]/40"
                  : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200/80 dark:hover:bg-zinc-700 border-transparent dark:border-zinc-800"
              }`}
            >
              <Bookmark className={`h-3.5 w-3.5 ${isWatchlisted ? "fill-current" : ""}`} />
              <span>{isWatchlisted ? "Watchlisted" : "Watch"}</span>
            </button>
            <button
              onClick={handleCopyCIK}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200/80 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 transition-colors flex items-center gap-1.5 border border-transparent dark:border-zinc-800 cursor-pointer"
            >
              {copiedCIK ? <Check className="h-3.5 w-3.5 text-[#00d09c]" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedCIK ? "Copied" : "CIK"}</span>
            </button>
            <button
              onClick={handleExportDossier}
              className="hidden sm:inline-flex px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200/80 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 transition-colors items-center gap-1.5 border border-transparent dark:border-zinc-800 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        {/* 1. Header Hero Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 shadow-xs space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="flex items-start gap-4">
              <div
                style={getCompanyLogoStyle(comp.logoColor, comp.ticker)}
                className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl text-white font-extrabold flex items-center justify-center text-lg sm:text-xl shadow-md ring-2 ring-slate-200/80 dark:ring-zinc-800 shrink-0"
              >
                {comp.ticker.slice(0, 2)}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {comp.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-extrabold bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700">
                    {comp.ticker}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#00d09c]/10 text-[#00a87e] dark:text-[#00d09c] border border-[#00d09c]/20">
                    {comp.sector}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-zinc-400">
                  <span className="font-semibold text-slate-700 dark:text-zinc-300">{comp.legalEntity}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{comp.headquarters}</span>
                  </span>
                  <span>·</span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-bold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
                    {comp.status}
                  </span>
                  <span>·</span>
                  <span className="font-mono text-slate-400 dark:text-zinc-500">{comp.exchangeTier}</span>
                </div>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2.5 pt-2 md:pt-0">
              <Link
                to={`/companies/${comp.ticker || comp.id}/investment?min=${inv.minInvestmentNum}`}
                className="px-5 py-2.5 rounded-xl bg-[#00d09c] hover:bg-[#00b888] text-slate-950 font-extrabold text-xs sm:text-sm transition-all shadow-lg shadow-[#00d09c]/20 flex items-center gap-2 cursor-pointer"
              >
                <DollarSign className="h-4 w-4" />
                <span>Invest in Company (Min. {inv.minInvestment})</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setInvestAmount(inv.minInvestmentNum)
                  setIsTradeModalOpen(true)
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/80 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-900 dark:text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Quick Allocate</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Corporate Entity Notice Banner */}
          <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-indigo-950 dark:text-indigo-200">
              <ShieldCheck className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>
                <strong>Corporate Entity Record:</strong> Filed under {comp.legalEntity} with official SEC registration CIK: <strong className="font-mono">{comp.cik}</strong>.
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-indigo-600 text-white font-extrabold text-[10px] uppercase tracking-wider shrink-0 text-center shadow-xs">
              {comp.verificationLevel} VERIFIED
            </span>
          </div>

          {/* Three Vertically Aligned Performance & Trajectory Options (Marked Area) */}
          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/60">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-indigo-500" />
                Trajectory & Analytics Views
              </span>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
                Click option to project chart & metrics
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {/* Option 1: Investor Interest */}
              <button
                type="button"
                onClick={() => setSelectedMetricView("investor_interest")}
                className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between group ${
                  selectedMetricView === "investor_interest"
                    ? "bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/50 shadow-xs ring-1 ring-emerald-500/25"
                    : "bg-slate-50/70 dark:bg-zinc-800/40 border-slate-200/70 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800/60"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8.5 h-8.5 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    selectedMetricView === "investor_interest"
                      ? "bg-emerald-500 text-white shadow-xs"
                      : "bg-slate-200/80 dark:bg-zinc-700/60 text-slate-600 dark:text-zinc-300 group-hover:text-emerald-500"
                  }`}>
                    <Users className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        Investor Interest
                      </span>
                      {selectedMetricView === "investor_interest" ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500 text-white uppercase tracking-wider">
                          Active View
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
                          Syndicate Demand
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                      Syndicate backing, institutional demand index & secondary order volume
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 block">
                    92.5 / 100
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                    +18.5% Inflow Surge
                  </span>
                </div>
              </button>

              {/* Option 2: Market Cap Growth */}
              <button
                type="button"
                onClick={() => setSelectedMetricView("company_growth")}
                className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between group ${
                  selectedMetricView === "company_growth"
                    ? "bg-cyan-500/10 dark:bg-cyan-500/15 border-cyan-500/50 shadow-xs ring-1 ring-cyan-500/25"
                    : "bg-slate-50/70 dark:bg-zinc-800/40 border-slate-200/70 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800/60"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8.5 h-8.5 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    selectedMetricView === "company_growth"
                      ? "bg-cyan-600 text-white shadow-xs"
                      : "bg-slate-200/80 dark:bg-zinc-700/60 text-slate-600 dark:text-zinc-300 group-hover:text-cyan-500"
                  }`}>
                    <TrendingUp className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        Market Cap Growth
                      </span>
                      {selectedMetricView === "company_growth" ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-cyan-600 text-white uppercase tracking-wider">
                          Active View
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
                          Market Cap
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                      {comp.name} enterprise market capitalization & corporate valuation trajectory
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <span className="text-xs font-bold font-mono text-cyan-600 dark:text-cyan-400 block">
                    {comp.valuation || "$84.6M"}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                    {comp.annualRevenue || "$28.8M ARR"}
                  </span>
                </div>
              </button>

              {/* Option 3: Field Growth (Sector specific, e.g. SaaS Field Growth, AI Field Growth) */}
              <button
                type="button"
                onClick={() => setSelectedMetricView("field_growth")}
                className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between group ${
                  selectedMetricView === "field_growth"
                    ? "bg-purple-500/10 dark:bg-purple-500/15 border-purple-500/50 shadow-xs ring-1 ring-purple-500/25"
                    : "bg-slate-50/70 dark:bg-zinc-800/40 border-slate-200/70 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800/60"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8.5 h-8.5 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    selectedMetricView === "field_growth"
                      ? "bg-purple-600 text-white shadow-xs"
                      : "bg-slate-200/80 dark:bg-zinc-700/60 text-slate-600 dark:text-zinc-300 group-hover:text-purple-500"
                  }`}>
                    <Globe className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {(comp.sector?.toLowerCase().includes("ai") || comp.sector?.toLowerCase().includes("artificial intelligence"))
                          ? "AI Field Growth"
                          : `${comp.sector || "Industry"} Field Growth`}
                      </span>
                      {selectedMetricView === "field_growth" ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-600 text-white uppercase tracking-wider">
                          Active View
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
                          Macro Index
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                      Global {comp.sector} industry category expansion, sector benchmark & CAGR
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <span className="text-xs font-bold font-mono text-purple-600 dark:text-purple-400 block">
                    +26.4% CAGR
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                    1,248.5 PTS
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* 2. Interactive Price Chart & Live Market Metrics Section */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 shadow-xs space-y-4">
          
          {/* Chart Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-zinc-800/60">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                  {metricDisplayInfo.title}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${metricDisplayInfo.badgeColor}`}>
                  {metricDisplayInfo.badgeText}
                </span>
              </div>
              <div className="flex items-baseline gap-2.5">
                <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
                  {metricDisplayInfo.valueText}
                </span>
                <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium">{metricDisplayInfo.unitText}</span>
                
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                  isPeriodPositive
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                }`}>
                  {isPeriodPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  <span>{metricDisplayInfo.changeText}</span>
                </span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block mt-0.5">
                {metricDisplayInfo.subtitle} • {activePricePoint?.date || "Enterprise Market Cap Trajectory"}
              </span>
            </div>

            {/* Timeframe Selectors */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-zinc-800/80 rounded-xl">
              {(["1D", "1W", "1M", "3M", "1Y", "ALL"] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    timeframe === tf
                      ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive SVG Chart Canvas */}
          <div className="relative w-full overflow-hidden select-none">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-56 sm:h-72 cursor-crosshair overflow-visible"
              onMouseLeave={() => setHoveredPointIndex(null)}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const mouseX = e.clientX - rect.left
                const relativeX = (mouseX / rect.width) * svgWidth
                const clampedX = Math.max(paddingX, Math.min(svgWidth - paddingX, relativeX))
                const index = Math.round(((clampedX - paddingX) / (svgWidth - paddingX * 2)) * (chartPoints.length - 1))
                if (index >= 0 && index < chartPoints.length) {
                  setHoveredPointIndex(index)
                }
              }}
            >
              {/* Grid Lines */}
              {[0.25, 0.5, 0.75].map((ratio) => {
                const y = paddingY + ratio * (svgHeight - paddingY * 2)
                return (
                  <line
                    key={ratio}
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    stroke="currentColor"
                    className="text-slate-200/60 dark:text-zinc-800/60"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                )
              })}

              {/* Main Price Trend Curve (Pure Line Graph) */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke={chartThemeColor}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Scrubbing Crosshair & Active Point */}
              {hoveredPointIndex !== null && chartPoints[hoveredPointIndex] && (() => {
                const pt = getCoordinates(hoveredPointIndex, chartPoints[hoveredPointIndex].price)
                return (
                  <g>
                    <line
                      x1={pt.x}
                      y1={paddingY}
                      x2={pt.x}
                      y2={svgHeight - paddingY}
                      stroke={chartThemeColor}
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="5"
                      fill={chartThemeColor}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  </g>
                )
              })()}
            </svg>

            {/* Volume Histogram Bar Preview */}
            <div className="flex items-end justify-between gap-1 h-6 px-4 pt-1 opacity-40">
              {chartPoints.filter((_, i) => i % 2 === 0).map((pt, i) => (
                <div
                  key={i}
                  style={{ height: `${Math.min(100, Math.max(15, (pt.volume / 9500) * 100))}%` }}
                  className="flex-1 bg-slate-400 dark:bg-zinc-600 rounded-2xs"
                />
              ))}
            </div>
          </div>

          {/* Market Summary Strip (52-Week Range, Day Range, Volume) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800 text-xs">
            
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 block">
                24h Trading Volume
              </span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5 block font-mono">
                {comp.tradingVolumeToday || "$2.4M Vol"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 block">
                Capital Inflow Flow
              </span>
              <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 block font-mono">
                {comp.investedToday || "+$1.1M Inflow"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-800 col-span-2">
              <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 mb-1.5">
                <span>52-Week Market Cap Range</span>
                <span className="font-mono text-slate-600 dark:text-zinc-300">{low52W} – {high52W}</span>
              </div>
              <div className="relative h-2 w-full bg-slate-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div
                  style={{ width: `${rangePosition}%` }}
                  className="h-full bg-[#00d09c] rounded-full transition-all duration-300"
                />
              </div>
            </div>

          </div>
        </div>

        {/* 3. The 4 Key Corporate Metrics Cards (As in the original dossier screenshot) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
              ENTERPRISE VALUATION
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono mt-1 block tracking-tight">
              {comp.valuation}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1 block">
              Implied post-money valuation
            </span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
              ANNUAL REVENUE RUN-RATE
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#00d09c] dark:text-[#00d09c] font-mono mt-1 block tracking-tight">
              {comp.annualRevenue}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1 block">
              Verified recurring contract ARR
            </span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
              VERIFIED HEADCOUNT
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono mt-1 block tracking-tight">
              {comp.employees} <span className="text-sm font-semibold text-slate-500 dark:text-zinc-400">FTEs</span>
            </span>
            <span className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1 block">
              Full-time active employee payroll
            </span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
              CORPORATE TRUST INDEX
            </span>
            <span className="text-xl sm:text-2xl font-black text-amber-500 dark:text-amber-400 font-mono mt-1 block tracking-tight">
              {comp.trustScore} <span className="text-sm font-semibold text-slate-400">/ 100</span>
            </span>
            <span className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1 block">
              SEC & Delaware compliance grade
            </span>
          </div>

        </div>

        {/* 4. Tabbed Institutional Deep Dive (Overview, Governance, Financials, Trading, POSTS, COMMUNITIES) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 shadow-xs space-y-6">
          
          {/* Tabs Navigation with Left & Right Arrow Controls */}
          <div className="relative flex items-center border-b border-slate-200 dark:border-zinc-800 pb-3 gap-2">
            
            {/* Left Arrow Button */}
            <button
              type="button"
              onClick={handleScrollLeft}
              disabled={!canScrollLeft}
              title="Move tabs left"
              aria-label="Scroll tabs left"
              className={`p-2 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/60 transition-all shrink-0 cursor-pointer shadow-xs ${
                canScrollLeft
                  ? "text-slate-800 dark:text-zinc-100 hover:bg-slate-200/80 dark:hover:bg-zinc-700 active:scale-95"
                  : "opacity-30 cursor-not-allowed text-slate-400 dark:text-zinc-600"
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Scrollable Tabs Track */}
            <div
              ref={tabsScrollRef}
              onScroll={checkScrollState}
              className="flex items-center gap-2 overflow-x-auto scroll-smooth flex-1 py-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {[
                { id: "overview", label: "Overview & Scope", icon: Building2 },
                { id: "governance", label: "Governance & SEC", icon: Scale },
                { id: "financials", label: "Financials & Multiples", icon: BarChart3 },
                { id: "trading", label: "Secondary Trading", icon: Activity },
                { id: "posts", label: "Company Posts & Updates", icon: MessageSquare, badge: companyPosts.length },
                { id: "communities", label: "Affiliated Communities", icon: Users2, badge: affiliatedCommunities.length },
              ].map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
                      isActive
                        ? "bg-slate-900 text-white dark:bg-white dark:text-zinc-950 shadow-xs"
                        : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/60"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{tab.label}</span>
                    {tab.badge !== undefined && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                        isActive
                          ? "bg-white/20 text-white dark:bg-zinc-900 dark:text-white"
                          : "bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300"
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Right Arrow Button */}
            <button
              type="button"
              onClick={handleScrollRight}
              disabled={!canScrollRight}
              title="Move tabs right"
              aria-label="Scroll tabs right"
              className={`p-2 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/60 transition-all shrink-0 cursor-pointer shadow-xs ${
                canScrollRight
                  ? "text-slate-800 dark:text-zinc-100 hover:bg-slate-200/80 dark:hover:bg-zinc-700 active:scale-95"
                  : "opacity-30 cursor-not-allowed text-slate-400 dark:text-zinc-600"
              }`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>

          </div>

          {/* TAB 1: Overview & Scope */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-in fade-in-50 duration-150">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-indigo-500" />
                  <span>Corporate Description & Technology Scope</span>
                </h3>
                <p className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/70 dark:border-zinc-800 text-sm leading-relaxed text-slate-700 dark:text-zinc-300">
                  {comp.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/70 dark:border-zinc-800 space-y-2">
                  <h4 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-[#00d09c]" />
                    Technology Moat & IP Highlights
                  </h4>
                  <ul className="space-y-1.5 text-slate-600 dark:text-zinc-400">
                    <li className="flex items-start gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#00d09c] mt-1 shrink-0" />
                      <span>Proprietary patents filed with USPTO across high-throughput commercial architecture.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#00d09c] mt-1 shrink-0" />
                      <span>End-to-end ISO-compliant security enclaves guaranteeing confidential computing.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#00d09c] mt-1 shrink-0" />
                      <span>Multi-cloud distributed fault recovery with statutory 99.99% uptime guarantees.</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/70 dark:border-zinc-800 space-y-2">
                  <h4 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4 text-indigo-500" />
                    Market Dynamics & Customer Profile
                  </h4>
                  <ul className="space-y-1.5 text-slate-600 dark:text-zinc-400">
                    <li className="flex items-start gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1 shrink-0" />
                      <span>Targeting Fortune 500 enterprises, tier-1 financial institutions, and sovereign operators.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1 shrink-0" />
                      <span>Average enterprise contract value (ACV) of $420k with 128% Net Revenue Retention (NRR).</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1 shrink-0" />
                      <span>Multi-year contractual backlogs providing stable recurring revenue visibility.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Overview Teaser: Latest Post & Affiliated Hub Quick Access */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                
                {/* Latest Post Snippet */}
                {companyPosts[0] && (
                  <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-800/40 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5" />
                        Latest Executive Dispatch
                      </span>
                      <button
                        onClick={() => setActiveTab("posts")}
                        className="text-[#00a87e] dark:text-[#00d09c] font-bold hover:underline cursor-pointer"
                      >
                        View all updates ({companyPosts.length}) →
                      </button>
                    </div>
                    <p className="text-slate-600 dark:text-zinc-300 line-clamp-2 leading-relaxed">
                      "{companyPosts[0].content}"
                    </p>
                    <span className="text-[10px] text-slate-400 block">
                      By {companyPosts[0].authorName} · {companyPosts[0].createdAt}
                    </span>
                  </div>
                )}

                {/* Primary Hub Snippet */}
                {affiliatedCommunities[0] && (
                  <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                        <Users2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        Affiliated Hub
                      </span>
                      <button
                        onClick={() => setActiveTab("communities")}
                        className="text-[#00a87e] dark:text-[#00d09c] font-bold hover:underline cursor-pointer"
                      >
                        View all hubs ({affiliatedCommunities.length}) →
                      </button>
                    </div>
                    <h5 className="font-extrabold text-slate-900 dark:text-white">
                      {affiliatedCommunities[0].name}
                    </h5>
                    <p className="text-slate-600 dark:text-zinc-300 line-clamp-1">
                      {affiliatedCommunities[0].description}
                    </p>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* TAB 2: Governance & SEC Filings */}
          {activeTab === "governance" && (
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Corporate Governance & Filing Record
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/70 dark:border-zinc-800">
                  <span className="text-slate-500 dark:text-zinc-400">Chief Executive Officer</span>
                  <strong className="text-slate-900 dark:text-white">{comp.ceo}</strong>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/70 dark:border-zinc-800">
                  <span className="text-slate-500 dark:text-zinc-400">Legal Jurisdiction</span>
                  <strong className="text-slate-900 dark:text-white">{comp.legalEntity}</strong>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/70 dark:border-zinc-800">
                  <span className="text-slate-500 dark:text-zinc-400">SEC CIK Identifier</span>
                  <strong className="text-slate-900 dark:text-white font-mono">{comp.cik}</strong>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/70 dark:border-zinc-800">
                  <span className="text-slate-500 dark:text-zinc-400">Trading Tier</span>
                  <strong className="text-slate-900 dark:text-white">{comp.exchangeTier}</strong>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/70 dark:border-zinc-800">
                  <span className="text-slate-500 dark:text-zinc-400">Incorporation Year</span>
                  <strong className="text-slate-900 dark:text-white">{comp.foundedYear}</strong>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/70 dark:border-zinc-800">
                  <span className="text-slate-500 dark:text-zinc-400">Registered Office</span>
                  <strong className="text-slate-900 dark:text-white">Wilmington, DE (Delaware)</strong>
                </div>

              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/30 border border-slate-200/70 dark:border-zinc-800 text-xs space-y-2">
                <span className="font-bold text-slate-900 dark:text-white block">Official Delaware Statutory Statement</span>
                <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                  The corporation is in good standing under the General Corporation Law of the State of Delaware. Certificate of Incorporation and subsequent statutory amendments have been verified by White Quantex Registry.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: Financials & Multiples */}
          {activeTab === "financials" && (
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Institutional Financial Ratios & Multiples
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/70 dark:border-zinc-800">
                  <span className="text-slate-400 uppercase text-[10px] font-bold block">Implied EV / ARR</span>
                  <span className="text-base font-black text-slate-900 dark:text-white font-mono mt-1 block">
                    {(valuationNum / (annualRevNum || 1)).toFixed(1)}x
                  </span>
                  <span className="text-[10px] text-slate-500">Benchmark multiple</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/70 dark:border-zinc-800">
                  <span className="text-slate-400 uppercase text-[10px] font-bold block">Gross Margin</span>
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1 block">
                    78.4%
                  </span>
                  <span className="text-[10px] text-slate-500">Audited software GM</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/70 dark:border-zinc-800">
                  <span className="text-slate-400 uppercase text-[10px] font-bold block">Cash Runway</span>
                  <span className="text-base font-black text-slate-900 dark:text-white font-mono mt-1 block">
                    28 Months
                  </span>
                  <span className="text-[10px] text-slate-500">At current burn rate</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/70 dark:border-zinc-800">
                  <span className="text-slate-400 uppercase text-[10px] font-bold block">YoY Growth Rate</span>
                  <span className="text-base font-black text-[#00d09c] font-mono mt-1 block">
                    +112%
                  </span>
                  <span className="text-[10px] text-slate-500">Annual ARR trajectory</span>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: Secondary Trading & Liquidity */}
          {activeTab === "trading" && (
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Secondary Market Order Book Depth</span>
                <span className="text-xs text-[#00d09c] font-normal">Real-time matching engine</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                {/* Bids */}
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold border-b border-emerald-500/20 pb-1.5">
                    <span>BID SHARES</span>
                    <span>PRICE</span>
                  </div>
                  {[
                    { shares: 12500, price: (baseSharePrice * 0.99).toFixed(2) },
                    { shares: 8000, price: (baseSharePrice * 0.97).toFixed(2) },
                    { shares: 15400, price: (baseSharePrice * 0.95).toFixed(2) },
                    { shares: 25000, price: (baseSharePrice * 0.92).toFixed(2) },
                  ].map((bid, i) => (
                    <div key={i} className="flex justify-between text-slate-700 dark:text-zinc-300">
                      <span>{bid.shares.toLocaleString()}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">${bid.price}</span>
                    </div>
                  ))}
                </div>

                {/* Asks */}
                <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-2">
                  <div className="flex justify-between text-rose-600 dark:text-rose-400 font-bold border-b border-rose-500/20 pb-1.5">
                    <span>ASK SHARES</span>
                    <span>PRICE</span>
                  </div>
                  {[
                    { shares: 5000, price: (baseSharePrice * 1.01).toFixed(2) },
                    { shares: 9200, price: (baseSharePrice * 1.03).toFixed(2) },
                    { shares: 14000, price: (baseSharePrice * 1.06).toFixed(2) },
                    { shares: 22000, price: (baseSharePrice * 1.09).toFixed(2) },
                  ].map((ask, i) => (
                    <div key={i} className="flex justify-between text-slate-700 dark:text-zinc-300">
                      <span>{ask.shares.toLocaleString()}</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">${ask.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Company Posts & Executive Updates */}
          {activeTab === "posts" && (
            <div className="space-y-5 animate-in fade-in-50 duration-150">
              
              {/* Posts Header Bar with Filter & Compose CTA */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-[#00d09c]" />
                    <span>Official Company Dispatches & Executive Feed</span>
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-zinc-400">
                    Authoritative announcements by {comp.name} leadership and verified ecosystem syndicate
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-zinc-800 rounded-lg text-xs font-semibold">
                    {[
                      { id: "all", label: "All" },
                      { id: "executive", label: "Executive" },
                      { id: "milestones", label: "Milestones" },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setPostFilter(f.id as any)}
                        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                          postFilter === f.id
                            ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-2xs font-bold"
                            : "text-slate-500 hover:text-slate-900 dark:text-zinc-400"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <Link
                    to={`/community?companyId=${comp.id}&company=${encodeURIComponent(comp.name)}&ticker=${comp.ticker}`}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                  >
                    <Users className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Open Community Page</span>
                    <ExternalLink className="h-3 w-3 text-slate-400" />
                  </Link>

                  <button
                    onClick={() => setIsPostingModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-[#00d09c] hover:bg-[#00b888] text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>New Update</span>
                  </button>
                </div>
              </div>

              {/* Feed List */}
              <div className="space-y-4">
                {displayedPosts.length === 0 ? (
                  <div className="py-10 text-center text-xs text-slate-400 dark:text-zinc-500">
                    No dispatches matching this filter.
                  </div>
                ) : (
                  displayedPosts.map((post) => {
                    const isLiked = likedPosts[post.id]
                    const isBookmarked = bookmarkedPosts[post.id]
                    const currentLikes = post.likesCount + (likeCountOffsets[post.id] || 0)

                    return (
                      <div
                        key={post.id}
                        className="p-5 rounded-2xl bg-slate-50/70 dark:bg-zinc-800/40 border border-slate-200/70 dark:border-zinc-800 space-y-3.5 transition-all hover:border-slate-300 dark:hover:border-zinc-700"
                      >
                        {/* Author Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              style={getCompanyLogoStyle(comp.logoColor, comp.ticker)}
                              className="h-10 w-10 rounded-xl text-white font-extrabold flex items-center justify-center text-xs shrink-0 ring-1 ring-slate-200 dark:ring-zinc-700 shadow-xs"
                            >
                              {comp.ticker.slice(0, 2)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                                  {post.authorName}
                                </span>
                                <span className="px-2 py-0.2 rounded-full text-[9px] font-extrabold uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                                  {post.authorRole}
                                </span>
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                  {post.authorVerification} VERIFIED
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5 block">
                                {comp.name} ({comp.ticker}) · {post.createdAt}
                              </span>
                            </div>
                          </div>

                          {post.category && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200/60 dark:border-zinc-700">
                              {post.category}
                            </span>
                          )}
                        </div>

                        {/* Content Body */}
                        <p className="text-xs sm:text-sm text-slate-800 dark:text-zinc-200 leading-relaxed">
                          {post.content}
                        </p>

                        {/* Hashtags */}
                        {post.hashtags && post.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {post.hashtags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="text-[11px] font-semibold text-[#00a87e] dark:text-[#00d09c] hover:underline cursor-pointer"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Social Interaction Buttons */}
                        <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-800/70 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => handleLikePost(post.id)}
                              className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                                isLiked
                                  ? "text-rose-600 dark:text-rose-400 font-bold"
                                  : "hover:text-slate-900 dark:hover:text-white"
                              }`}
                            >
                              <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                              <span>{currentLikes}</span>
                            </button>

                            <button
                              onClick={() => {
                                setToastMessage("Comment thread open: Share your investor inquiry.")
                                setTimeout(() => setToastMessage(null), 3000)
                              }}
                              className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                            >
                              <MessageCircle className="h-4 w-4" />
                              <span>{post.commentsCount}</span>
                            </button>

                            <button
                              onClick={() => handleSharePost(post)}
                              className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                            >
                              <Share2 className="h-4 w-4" />
                              <span>Share</span>
                            </button>
                          </div>

                          <button
                            onClick={() => handleBookmarkPost(post.id)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isBookmarked
                                ? "text-[#00d09c] bg-[#00d09c]/10"
                                : "hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800"
                            }`}
                          >
                            <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 6: Affiliated Communities & Hubs */}
          {activeTab === "communities" && (
            <div className="space-y-5 animate-in fade-in-50 duration-150">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Users2 className="h-4 w-4 text-[#00d09c]" />
                    <span>Affiliated Ecosystem Communities & Governance Hubs</span>
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-zinc-400">
                    Verified institutional networks, syndicate hubs, and corporate issuer forums where {comp.name} holds active membership
                  </span>
                </div>

                <Link
                  to={`/community?companyId=${comp.id}&company=${encodeURIComponent(comp.name)}&ticker=${comp.ticker}`}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs shrink-0 cursor-pointer"
                >
                  <Users className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Open Community Page</span>
                  <ExternalLink className="h-3 w-3 text-slate-400" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {affiliatedCommunities.map((hub: any) => {
                  const isJoined = joinedCommunities[hub.id || hub._id]

                  return (
                    <div
                      key={hub.id || hub._id}
                      className="p-5 rounded-2xl bg-slate-50/70 dark:bg-zinc-800/40 border border-slate-200/70 dark:border-zinc-800 flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-zinc-700 transition-all shadow-2xs"
                    >
                      <div className="space-y-2.5">
                        {/* Header & Role Badge */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#00d09c]/20 to-indigo-500/20 text-[#00a87e] dark:text-[#00d09c] font-black flex items-center justify-center text-sm ring-1 ring-[#00d09c]/30">
                              <Users2 className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                                {hub.name}
                              </h4>
                              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                                /{hub.slug}
                              </span>
                            </div>
                          </div>

                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            hub.isPrimary
                              ? "bg-[#00d09c]/15 text-[#00a87e] dark:text-[#00d09c] border border-[#00d09c]/30"
                              : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                          }`}>
                            {hub.role || "Verified Corporate Member"}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                          {hub.description}
                        </p>

                        {/* Categories */}
                        {hub.categories && hub.categories.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {hub.categories.map((cat: string, i: number) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-200/60 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300"
                              >
                                {cat}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Hub Stats & Action Buttons */}
                      <div className="pt-3 border-t border-slate-200/60 dark:border-zinc-800/70 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3 text-slate-500 dark:text-zinc-400">
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5 text-slate-400" />
                            <strong className="text-slate-700 dark:text-zinc-200">{(hub.memberCount || 1200).toLocaleString()}</strong> members
                          </span>
                          <span>·</span>
                          <span>
                            <strong className="text-slate-700 dark:text-zinc-200">{hub.postCount || 45}</strong> posts
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleJoinCommunity(hub.id || hub._id, hub.name)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isJoined
                                ? "bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200"
                                : "bg-[#00d09c]/15 text-[#00a87e] dark:text-[#00d09c] hover:bg-[#00d09c]/25"
                            }`}
                          >
                            {isJoined ? "Joined" : "Join Hub"}
                          </button>
                          
                          <Link
                            to={`/community/${hub.id || hub._id || ""}`}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <span>Enter</span>
                            <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Statutory Note on Issuer Communities */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/70 dark:border-zinc-800 text-xs flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-indigo-500 shrink-0" />
                <span className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                  As an accredited Delaware C-Corp issuer, {comp.name} maintains cryptographic signing credentials for sovereign community ballots and proxy disclosures across these verified working groups.
                </span>
              </div>
            </div>
          )}

        </div>

        {/* 5. Direct Private Corporate Investment & Expansion Funding Notice */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-emerald-500/30 text-xs text-slate-600 dark:text-zinc-300 flex items-start gap-3 shadow-xs">
          <CheckCircle2 className="h-5 w-5 text-[#00d09c] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-slate-900 dark:text-white font-bold">Direct Private Corporate Investment:</strong> You are investing directly into {comp.name} to finance their corporate development and expansion roadmap, not buying secondary public stock. The company has established a minimum investment threshold of <strong className="text-emerald-600 dark:text-[#00d09c] font-mono">{inv.minInvestment}</strong>. To participate and qualify as a registered private shareholder on the Delaware cap table, commitments must meet or exceed this minimum amount.
          </div>
        </div>

      </div>

      {/* Private Capital Allocation Subscription Modal */}
      {isTradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-[#00d09c]">
                  {inv.roundType}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                  Private Capital Allocation
                </h3>
                <span className="text-xs text-slate-500 font-mono">{comp.name} ({comp.ticker})</span>
              </div>
              <button
                onClick={() => setIsTradeModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-3.5">
              {/* Company Minimum Ticket Badge */}
              <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 block">
                    Company Minimum Investment
                  </span>
                  <span className="text-slate-600 dark:text-zinc-400 text-[11px]">
                    Required for cap table
                  </span>
                </div>
                <span className="text-sm font-black text-emerald-700 dark:text-[#00d09c] font-mono">
                  {inv.minInvestment}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Investment Allocation (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    min={inv.minInvestmentNum}
                    step="1000"
                    value={investAmount}
                    onChange={(e) => setInvestAmount(Number(e.target.value))}
                    className="w-full pl-7 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800 font-mono text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#00d09c]"
                  />
                </div>
              </div>

              {investAmount < inv.minInvestmentNum && (
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-[11px] leading-relaxed">
                  <strong>Minimum Not Met:</strong> You must commit at least {inv.minInvestment} to participate as a private investor.
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-800 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-500">
                  <span>Objective:</span>
                  <span className="text-slate-900 dark:text-white font-semibold truncate max-w-[200px]">{inv.fundingPurpose}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Security Type:</span>
                  <span className="text-slate-900 dark:text-white font-semibold">{inv.securityType}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Settlement:</span>
                  <span className="text-[#00d09c] font-bold">Delaware Statutory Escrow</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Link
                  to={`/companies/${comp.ticker || comp.id}/investment?min=${inv.minInvestmentNum}`}
                  className="w-full py-3 rounded-xl bg-[#00d09c] hover:bg-[#00b888] text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#00d09c]/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="h-4 w-4" />
                  <span>Execute Subscription Agreement</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Official Company Dispatch Modal */}
      {isPostingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-[#00d09c] animate-pulse" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Publish Official Executive Dispatch
                </h3>
              </div>
              <button
                onClick={() => setIsPostingModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handlePublishNewPost} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Dispatch Category
                </label>
                <select
                  value={newPostCategory}
                  onChange={(e) => setNewPostCategory(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#00d09c]"
                >
                  <option value="Executive Dispatch">Executive Dispatch</option>
                  <option value="Commercial Contracts">Commercial Contracts & ARR</option>
                  <option value="Statutory Governance">Statutory Governance & Shareholder Note</option>
                  <option value="Product Milestone">Product & Technology Milestone</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Dispatch Content ({comp.name})
                </label>
                <textarea
                  rows={4}
                  required
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder={`Write an official communication from ${comp.ceo} or corporate leadership...`}
                  className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#00d09c] leading-relaxed resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-800/40 text-[11px] text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>
                  This update will be signed with official Delaware verification for {comp.name} ({comp.ticker}).
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPostingModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00d09c] hover:bg-[#00b888] text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-[#00d09c]/20"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Broadcast Dispatch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
