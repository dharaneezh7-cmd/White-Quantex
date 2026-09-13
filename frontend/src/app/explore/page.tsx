import React, { useState } from "react"
import { Link, useSearchParams } from "react-router"
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
  Vote,
  Download,
  FileText,
  CheckCheck,
  AlertTriangle,
} from "lucide-react"

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeNavTab =
    (searchParams.get("tab") as "search" | "positions" | "orders" | "my_watchlist" | "all_watchlist" | "news") || "search"

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTag, setSelectedTag] = useState("All")
  const [showNews, setShowNews] = useState(false)
  const [newsFilter, setNewsFilter] = useState("All")

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

  // ── Screener State (Row 4 Left) ──────────────────────────────────────────
  const [screenerSector, setScreenerSector] = useState("All")
  const [screenerStage, setScreenerStage] = useState("All")
  const [screenerValuation, setScreenerValuation] = useState("All")

  // ── Orders filter state ──────────────────────────────────────────────────
  const [orderFilter, setOrderFilter] = useState<"ALL" | "FILLED" | "PENDING">("ALL")

  // ── Mock Data ────────────────────────────────────────────────────────────
  // User's Invested Companies: TechFlow AI Solutions (TFLOW), GreenLeaf Energy (GGRID), Quantum Materials Corp (QMAT)
  const holdingsNews = [
    {
      id: "hn-1",
      ticker: "TFLOW",
      companyName: "TechFlow AI Solutions",
      logoColor: "bg-indigo-600",
      category: "Contract Expansion",
      categoryColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      title: "TechFlow AI Closes $40M Enterprise Cloud Inference Deal; ARR Exceeds $15M",
      time: "25m ago",
      source: "TechCrunch Venture",
      sentiment: "Bullish",
      snippet:
        "TechFlow AI signed a 3-year enterprise cloud compute agreement with a Fortune 50 consortium. Annual recurring revenue (ARR) surged past $15.2M (+112% YoY), reinforcing strong momentum leading into its upcoming Series B pricing round.",
      readTime: "3 min read",
      impactMetric: "+18.4% Valuation Uplift",
      detailBullet1: "Tier-1 enterprise consortium guarantees minimum $13.3M annual compute commitment through 2029.",
      detailBullet2: "Gross margins on neural runtime operations expanded by 420 bps to 68.4%.",
      detailBullet3: "Your holding: 8,500 shares (0.85% equity) with current unrealized return of +54.0%.",
    },
    {
      id: "hn-2",
      ticker: "GGRID",
      companyName: "GreenLeaf Energy",
      logoColor: "bg-emerald-600",
      category: "Municipal EPC Contract",
      categoryColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      title: "GreenLeaf Energy Secures $30M Municipal Solar Microgrid Contract in Nevada",
      time: "2h ago",
      source: "CleanTech Investor Daily",
      sentiment: "Positive",
      snippet:
        "Nevada Clean Energy District awarded GreenLeaf Energy the primary EPC and operations contract for 45MWh modular storage installations. Long-term energy off-take agreements guarantee recurring cash yields through 2038.",
      readTime: "2 min read",
      impactMetric: "+9.2% Cash Flow Projection",
      detailBullet1: "Guaranteed power purchase agreement (PPA) with fixed $0.114/kWh floor indexation.",
      detailBullet2: "Phase 1 commercial interconnection approved for Q1 2027 commercial operation.",
      detailBullet3: "Your holding: 4,000 shares (0.40% equity) with quarterly yield credited Sep 12.",
    },
    {
      id: "hn-3",
      ticker: "QMAT",
      companyName: "Quantum Materials Corp",
      logoColor: "bg-violet-600",
      category: "Patent Moat",
      categoryColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      title: "USPTO Grants Quantum Materials Core Patent for Zero-Resistance Nanocrystal Wafers",
      time: "5h ago",
      source: "Nanotechnology Review",
      sentiment: "Breakthrough",
      snippet:
        "The US Patent and Trademark Office formally issued Patent #11,894,221 safeguarding Quantum Materials' proprietary atomic vapor deposition method. Commercial tier-1 semiconductor fabrication plants have initiated trial qualification runs.",
      readTime: "4 min read",
      impactMetric: "Defensible IP Moat",
      detailBullet1: "Covers room-temperature atomic vapor synthesis with zero structural lattice defects.",
      detailBullet2: "Three global semiconductor foundries signed joint development agreements (JDAs).",
      detailBullet3: "Your holding: 2,500 shares (0.25% equity) authenticated on-chain.",
    },
    {
      id: "hn-4",
      ticker: "TFLOW",
      companyName: "TechFlow AI Solutions",
      logoColor: "bg-indigo-600",
      category: "Product Benchmark",
      categoryColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      title: "TechFlow AI Unveils Distributed Reasoning Engine v3.2 with 65% Lower GPU Energy",
      time: "1d ago",
      source: "VentureBeat AI",
      sentiment: "Bullish",
      snippet:
        "New benchmark reports verify 4x inference throughput across complex financial time-series predictions. Enterprise beta partners report monthly infrastructure cost reductions averaging $180,000.",
      readTime: "3 min read",
      impactMetric: "Margin Expansion",
      detailBullet1: "Benchmarked 4.2x faster than legacy distributed transformer clusters on NVIDIA H100s.",
      detailBullet2: "Proprietary sparsity algorithms reduce parameter footprint by 65% without loss of precision.",
      detailBullet3: "Expected to drive 35% upsell on existing enterprise software licenses.",
    },
    {
      id: "hn-5",
      ticker: "GGRID",
      companyName: "GreenLeaf Energy",
      logoColor: "bg-emerald-600",
      category: "Regulatory Approval",
      categoryColor: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
      title: "European Union Grants Fast-Track CE Certification for GreenLeaf Commercial Battery Cells",
      time: "2d ago",
      source: "Bloomberg Clean Energy",
      sentiment: "Positive",
      snippet:
        "The European Energy Transition Commission awarded statutory CE certification under fast-track provisions. GreenLeaf is authorized for direct deployment across 18 EU member nations starting Q4 2026.",
      readTime: "2 min read",
      impactMetric: "EU Market Access",
      detailBullet1: "Compliance achieved with zero hazardous heavy metal disposal requirements.",
      detailBullet2: "Initial distribution pipeline established with German and Nordic utility networks.",
      detailBullet3: "Supports planned international commercial expansion ahead of Series B round.",
    },
    {
      id: "hn-6",
      ticker: "QMAT",
      companyName: "Quantum Materials Corp",
      logoColor: "bg-violet-600",
      category: "Production Metric",
      categoryColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      title: "Quantum Materials Corp Reports 62% Increase in Production Run Shipments for Q2",
      time: "3d ago",
      source: "Wall Street Journal Venture",
      sentiment: "Bullish",
      snippet:
        "Quarterly manufacturing throughput reached 15,400 specialized substrate wafers, propelled by demand from quantum computing hardware makers and satellite communication vendors. Unit gross margin improved to 44.8%.",
      readTime: "4 min read",
      impactMetric: "+62% Production Inflow",
      detailBullet1: "Shipments jumped from 9,500 units in Q1 to 15,400 units in Q2 2026.",
      detailBullet2: "Backlog of verified orders stands at $18.6M across aerospace & quantum verticals.",
      detailBullet3: "Annual general meeting proxy voting currently open for all registered shareholders.",
    },
  ]

  const holdingsNotifications = [
    {
      id: "notif-1",
      ticker: "QMAT",
      companyName: "Quantum Materials Corp",
      type: "ACTION",
      category: "Shareholder Proxy Vote",
      badge: "Action Required",
      badgeColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
      title: "Annual General Meeting (AGM) Proxy Ballot: 2026 Board Slate & Equity Pool",
      time: "1h ago",
      urgency: "High",
      dueDate: "Closes Oct 15, 2026",
      holdingContext: "Holder of 2,500 Shares (0.25% Common Equity)",
      content:
        "Your official shareholder proxy ballot is open for the upcoming Annual General Meeting. As an authenticated shareholder, you have the statutory right to cast your vote on: (1) Re-election of 4 independent board members, and (2) Authorization of a 10% unallocated employee stock option pool.",
      actionLabel: "Cast Proxy Vote",
      actionType: "vote",
      isUrgent: true,
    },
    {
      id: "notif-2",
      ticker: "TFLOW",
      companyName: "TechFlow AI Solutions",
      type: "NOTIFICATIONS",
      category: "Cap Table & Round Financing",
      badge: "Valuation Uplift",
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      title: "Series B Term Sheet Received: $120M Pre-Money Valuation Proposed",
      time: "3h ago",
      urgency: "Medium",
      dueDate: "Informational",
      holdingContext: "Holder of 8,500 Shares (0.85% Equity · +$42,000 Unofficial Uplift)",
      content:
        "The board of directors has received and signed a non-binding term sheet led by a tier-1 venture firm for $40M Series B at a $120M pre-money valuation ($14.11/share). If finalized, your 8,500 shares will have an implied pro-forma value of $119,935.",
      actionLabel: "Review Term Sheet Summary",
      actionType: "term_sheet",
      isUrgent: false,
    },
    {
      id: "notif-3",
      ticker: "GGRID",
      companyName: "GreenLeaf Energy",
      type: "NOTIFICATIONS",
      category: "Dividend & Cash Yield",
      badge: "Cash Credited",
      badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
      title: "Quarterly Revenue Share Credited: $320.00 to Custody Cash",
      time: "1d ago",
      urgency: "Normal",
      dueDate: "Settled Sep 12",
      holdingContext: "Holder of 4,000 Shares (0.40% Equity · $0.08/share yield)",
      content:
        "Your quarterly operating yield distribution of $320.00 has been credited directly to your White Quantex Primary Escrow Custody Account. Settlement verification code #WQ-DIST-9921.",
      actionLabel: "View Settlement Receipt",
      actionType: "settlement",
      isUrgent: false,
    },
    {
      id: "notif-4",
      ticker: "TFLOW",
      companyName: "TechFlow AI Solutions",
      type: "NOTIFICATIONS",
      category: "Shareholder Reporting",
      badge: "Q2 Filing Available",
      badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
      title: "Q2 2026 Shareholder Update & Audited GAAP Financial Statements",
      time: "2d ago",
      urgency: "Normal",
      dueDate: "Available in Data Room",
      holdingContext: "Holder of 8,500 Shares (0.85% Equity)",
      content:
        "CEO Dr. Elena Rostova has released the comprehensive Q2 Shareholder Report covering GAAP audited balance sheets, unit economics, runway projections through 2028, and corporate milestones.",
      actionLabel: "Download Financials (PDF)",
      actionType: "download",
      isUrgent: false,
    },
    {
      id: "notif-5",
      ticker: "QMAT",
      companyName: "Quantum Materials Corp",
      type: "NOTIFICATIONS",
      category: "Corporate Governance",
      badge: "Cap Table Verified",
      badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
      title: "Delaware C-Corp Cap Table Registry Audit Completed",
      time: "4d ago",
      urgency: "Normal",
      dueDate: "Annual Audit",
      holdingContext: "Holder of 2,500 Shares · Certificate #WQ-QMAT-8841",
      content:
        "KPMG has completed the annual cap table and shareholder registry compliance audit for Quantum Materials Corp. Your holding certificate #WQ-QMAT-8841 is re-certified and recorded on the authoritative ledger.",
      actionLabel: "Inspect Digital Share Deed",
      actionType: "deed",
      isUrgent: false,
    },
  ]

  const newsItems = [
    {
      id: "n1",
      tag: "Funding",
      tagColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      title: "Quantum Materials raises $18M Series A led by Apex Ventures",
      time: "4m ago",
    },
    {
      id: "n2",
      tag: "Regulation",
      tagColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      title: "SEC releases updated accredited investor guidelines for private venture secondary trading",
      time: "28m ago",
    },
    {
      id: "n3",
      tag: "Market",
      tagColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      title: "CleanTech Venture Index hits quarterly high on European smart grid contracts",
      time: "1h ago",
    },
    {
      id: "n4",
      tag: "Deal Flow",
      tagColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      title: "BioVanguard initiates fast-track Phase I oncology platform fundraising",
      time: "2h ago",
    },
  ]

  const recentlyViewed = [
    {
      id: "rv-1",
      name: "QuantumFlow AI",
      ticker: "QFLOW",
      sector: "AI / ML",
      stage: "Series A",
      valuation: "$42.5M",
      change: "+14.2%",
      isPositive: true,
      logoColor: "bg-indigo-600",
    },
    {
      id: "rv-2",
      name: "GreenGrid Energy",
      ticker: "GGRID",
      sector: "CleanTech",
      stage: "Seed",
      valuation: "$18.0M",
      change: "+6.8%",
      isPositive: true,
      logoColor: "bg-emerald-600",
    },
    {
      id: "rv-3",
      name: "NovaPay Technologies",
      ticker: "NPAY",
      sector: "Fintech",
      stage: "Series B",
      valuation: "$65.0M",
      change: "+3.1%",
      isPositive: true,
      logoColor: "bg-cyan-600",
    },
    {
      id: "rv-4",
      name: "Helix BioLabs",
      ticker: "HLIX",
      sector: "Biotech",
      stage: "Series A",
      valuation: "$29.4M",
      change: "-1.5%",
      isPositive: false,
      logoColor: "bg-rose-600",
    },
    {
      id: "rv-5",
      name: "Orbital Dynamics",
      ticker: "ORBD",
      sector: "SpaceTech",
      stage: "Series A",
      valuation: "$88.0M",
      change: "+22.5%",
      isPositive: true,
      logoColor: "bg-amber-600",
    },
  ]

  const mostInvestedCompanies = [
    {
      id: "mi-1",
      rank: 1,
      name: "TechFlow AI Solutions",
      sector: "AI & Distributed Cloud",
      investedToday: "$1,420,000",
      percentFunded: 88,
      target: "$2,500,000",
      change: "+28.4%",
    },
    {
      id: "mi-2",
      rank: 2,
      name: "AeroCarbon Solutions",
      sector: "CleanTech & Energy",
      investedToday: "$950,000",
      percentFunded: 74,
      target: "$1,800,000",
      change: "+19.2%",
    },
    {
      id: "mi-3",
      rank: 3,
      name: "CyberShield Vault",
      sector: "Cybersecurity & Web3",
      investedToday: "$780,000",
      percentFunded: 92,
      target: "$3,000,000",
      change: "+15.7%",
    },
    {
      id: "mi-4",
      rank: 4,
      name: "MediSync Robotics",
      sector: "HealthTech Surgical",
      investedToday: "$640,000",
      percentFunded: 65,
      target: "$2,000,000",
      change: "+11.3%",
    },
  ]

  const leastInvestedCompanies = [
    {
      id: "li-1",
      rank: 1,
      name: "SolarHarvest Materials",
      sector: "AgriTech & Solar",
      raised: "$45,000",
      percentFunded: 18,
      target: "$650,000",
      daysLeft: 21,
    },
    {
      id: "li-2",
      rank: 2,
      name: "OmniLogic NeuroTech",
      sector: "DeepTech Neuro",
      raised: "$62,000",
      percentFunded: 24,
      target: "$800,000",
      daysLeft: 16,
    },
    {
      id: "li-3",
      rank: 3,
      name: "AgriPulse Sensor Net",
      sector: "IoT & Agriculture",
      raised: "$85,000",
      percentFunded: 31,
      target: "$750,000",
      daysLeft: 12,
    },
    {
      id: "li-4",
      rank: 4,
      name: "DataForge Storage",
      sector: "Decentralized Infra",
      raised: "$110,000",
      percentFunded: 38,
      target: "$900,000",
      daysLeft: 9,
    },
  ]

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

  const recentlyAddedCompanies = [
    {
      id: "ra-1",
      name: "Aether Dynamics",
      tagline: "Autonomous satellite constellations for orbital telemetry and micro-payloads.",
      sector: "SpaceTech",
      stage: "Series A",
      location: "Seattle, WA",
      seeking: "$5.0M",
      founded: 2024,
      verification: "PLATINUM",
      trustScore: 96,
    },
    {
      id: "ra-2",
      name: "BioVanguard Labs",
      tagline: "Precision oncology therapeutics targeting drug-resistant solid tumor malignancies.",
      sector: "Biotech",
      stage: "Seed",
      location: "Boston, MA",
      seeking: "$2.8M",
      founded: 2025,
      verification: "GOLD",
      trustScore: 92,
    },
    {
      id: "ra-3",
      name: "FinLedger Core",
      tagline: "Zero-knowledge cryptographic ledger for institutional cross-border clearing.",
      sector: "Fintech",
      stage: "Pre-Seed",
      location: "New York, NY",
      seeking: "$1.2M",
      founded: 2025,
      verification: "GOLD",
      trustScore: 89,
    },
    {
      id: "ra-4",
      name: "TerraVolt Storage",
      tagline: "Solid-state electrolyte lithium cells engineered for grid-scale renewable storage.",
      sector: "CleanTech",
      stage: "Series A",
      location: "Austin, TX",
      seeking: "$7.5M",
      founded: 2024,
      verification: "PLATINUM",
      trustScore: 98,
    },
    {
      id: "ra-5",
      name: "CogniSense AI",
      tagline: "Self-correcting multimodal reasoning engines for enterprise ERP integration.",
      sector: "AI / ML",
      stage: "Seed",
      location: "San Francisco, CA",
      seeking: "$3.0M",
      founded: 2025,
      verification: "PLATINUM",
      trustScore: 94,
    },
    {
      id: "ra-6",
      name: "AgriDrone Sentinel",
      tagline: "Autonomous multispectral crop health detection drones with automated intervention.",
      sector: "AgriTech",
      stage: "Seed",
      location: "Des Moines, IA",
      seeking: "$1.8M",
      founded: 2024,
      verification: "SILVER",
      trustScore: 88,
    },
  ]

  return (
    <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* MASTER GRID CONTAINER: Structured layout matching the wireframe      */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <div className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#07090b] rounded-2xl shadow-xs overflow-hidden divide-y divide-slate-200 dark:divide-zinc-800 transition-colors">

        {/* ───────────────────────────────────────────────────────────────── */}
        {/* ROW 1: Sub-Nav Links & Tab Header Area                            */}
        {/* ───────────────────────────────────────────────────────────────── */}
        <div className="w-full p-4 sm:p-6 space-y-4">
          {/* Top Sub-Nav Bar: Navigation Links */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800/80">
            {[
              { id: "search", label: "Search", href: "/explore" },
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
                        {holdingsNotifications.length + holdingsNews.length}
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
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search companies..."
                  aria-label="Search companies"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/60 text-slate-900 dark:text-white text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00d09c] focus:border-transparent transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Live Matching Companies Dropdown / Results */}
              {searchQuery.trim() ? (
                <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/95 shadow-md space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-zinc-400">
                    <span>Matching Companies ({
                      [
                        { name: "TechFlow AI Solutions", ticker: "TFLOW", sector: "AI / ML", stage: "Series A", valuation: "$42.5M" },
                        { name: "GreenGrid Energy", ticker: "GGRID", sector: "CleanTech", stage: "Seed", valuation: "$18.0M" },
                        { name: "NovaPay Technologies", ticker: "NPAY", sector: "Fintech", stage: "Series B", valuation: "$65.0M" },
                        { name: "Helix BioLabs", ticker: "HLIX", sector: "Biotech", stage: "Series A", valuation: "$29.4M" },
                        { name: "Orbital Dynamics", ticker: "ORBD", sector: "SpaceTech", stage: "Series A", valuation: "$88.0M" },
                        { name: "AeroCarbon Solutions", ticker: "CARB", sector: "CleanTech", stage: "Seed", valuation: "$24.0M" },
                        { name: "CyberShield Vault", ticker: "CYBR", sector: "Cybersecurity", stage: "Series B", valuation: "$52.0M" },
                        { name: "MediSync Robotics", ticker: "MEDS", sector: "HealthTech", stage: "Series A", valuation: "$35.0M" },
                        { name: "SolarHarvest Materials", ticker: "SHRV", sector: "AgriTech", stage: "Seed", valuation: "$12.0M" },
                        { name: "OmniLogic NeuroTech", ticker: "OMNI", sector: "DeepTech", stage: "Pre-Seed", valuation: "$9.5M" },
                        { name: "DataForge Storage", ticker: "DFRG", sector: "Web3 Infra", stage: "Seed", valuation: "$14.0M" },
                        { name: "Aether Dynamics", ticker: "AETH", sector: "SpaceTech", stage: "Series A", valuation: "$48.0M" },
                        { name: "BioVanguard Labs", ticker: "BVGD", sector: "Biotech", stage: "Seed", valuation: "$22.0M" },
                        { name: "FinLedger Core", ticker: "FLED", sector: "Fintech", stage: "Pre-Seed", valuation: "$11.0M" },
                        { name: "TerraVolt Storage", ticker: "TVLT", sector: "CleanTech", stage: "Series A", valuation: "$62.0M" },
                        { name: "CogniSense AI", ticker: "CGNS", sector: "AI / ML", stage: "Seed", valuation: "$28.0M" },
                      ].filter(
                        (c) =>
                          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.sector.toLowerCase().includes(searchQuery.toLowerCase())
                      ).length
                    })</span>
                    <span className="text-[#00d09c] text-[10px]">Company Search</span>
                  </div>

                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800/80">
                    {[
                      { name: "TechFlow AI Solutions", ticker: "TFLOW", sector: "AI / ML", stage: "Series A", valuation: "$42.5M" },
                      { name: "GreenGrid Energy", ticker: "GGRID", sector: "CleanTech", stage: "Seed", valuation: "$18.0M" },
                      { name: "NovaPay Technologies", ticker: "NPAY", sector: "Fintech", stage: "Series B", valuation: "$65.0M" },
                      { name: "Helix BioLabs", ticker: "HLIX", sector: "Biotech", stage: "Series A", valuation: "$29.4M" },
                      { name: "Orbital Dynamics", ticker: "ORBD", sector: "SpaceTech", stage: "Series A", valuation: "$88.0M" },
                      { name: "AeroCarbon Solutions", ticker: "CARB", sector: "CleanTech", stage: "Seed", valuation: "$24.0M" },
                      { name: "CyberShield Vault", ticker: "CYBR", sector: "Cybersecurity", stage: "Series B", valuation: "$52.0M" },
                      { name: "MediSync Robotics", ticker: "MEDS", sector: "HealthTech", stage: "Series A", valuation: "$35.0M" },
                      { name: "SolarHarvest Materials", ticker: "SHRV", sector: "AgriTech", stage: "Seed", valuation: "$12.0M" },
                      { name: "OmniLogic NeuroTech", ticker: "OMNI", sector: "DeepTech", stage: "Pre-Seed", valuation: "$9.5M" },
                      { name: "DataForge Storage", ticker: "DFRG", sector: "Web3 Infra", stage: "Seed", valuation: "$14.0M" },
                      { name: "Aether Dynamics", ticker: "AETH", sector: "SpaceTech", stage: "Series A", valuation: "$48.0M" },
                      { name: "BioVanguard Labs", ticker: "BVGD", sector: "Biotech", stage: "Seed", valuation: "$22.0M" },
                      { name: "FinLedger Core", ticker: "FLED", sector: "Fintech", stage: "Pre-Seed", valuation: "$11.0M" },
                      { name: "TerraVolt Storage", ticker: "TVLT", sector: "CleanTech", stage: "Series A", valuation: "$62.0M" },
                      { name: "CogniSense AI", ticker: "CGNS", sector: "AI / ML", stage: "Seed", valuation: "$28.0M" },
                    ]
                      .filter(
                        (c) =>
                          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.sector.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((comp) => (
                        <Link
                          key={comp.name}
                          to="/explore"
                          className="p-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-zinc-800/60 rounded-lg transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-md bg-emerald-500/10 text-[#00d09c] font-bold text-[10px] flex items-center justify-center">
                              {comp.ticker.slice(0, 2)}
                            </div>
                            <div>
                              <span className="text-xs font-semibold text-slate-900 dark:text-white">
                                {comp.name}
                              </span>
                              <span className="text-[10px] text-slate-400 dark:text-zinc-500 ml-2">
                                ({comp.ticker}) · {comp.sector}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                              {comp.valuation}
                            </span>
                            <span className="text-[10px] text-slate-400">{comp.stage}</span>
                          </div>
                        </Link>
                      ))}
                  </div>
                </div>
              ) : (
                /* Quick Company Sector Filter Chips */
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 mr-1">
                    Company Sectors:
                  </span>
                  {["All Companies", "Fintech", "AI & ML", "CleanTech", "SaaS", "Biotech", "SpaceTech"].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer border ${
                        selectedTag === tag
                          ? "bg-[#00d09c]/15 text-[#00a87e] dark:text-[#00d09c] border-[#00d09c]/40 font-bold"
                          : "border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-slate-300 dark:hover:border-zinc-700"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeNavTab === "positions" && (
            <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800 text-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <PieChart className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Active Portfolio Positions</span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">3 Verified Holdings · Authoritative Spring Truth Engine</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-[#00d09c] text-sm block">+$17,400.00 (+38.6%)</span>
                <span className="text-[10px] text-slate-400">Unrealized P&L</span>
              </div>
            </div>
          )}

          {activeNavTab === "orders" && (
            <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800 text-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                  <FileCheck className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Venture Order Execution Book</span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">4 Lifetime Orders · 1 Pending Escrow Signature</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {(["ALL", "FILLED", "PENDING"] as const).map((filterKey) => (
                  <button
                    key={filterKey}
                    onClick={() => setOrderFilter(filterKey)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                      orderFilter === filterKey
                        ? "bg-slate-900 text-white dark:bg-white dark:text-zinc-950 border-transparent shadow-xs"
                        : "border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-slate-300"
                    }`}
                  >
                    {filterKey}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeNavTab === "my_watchlist" && (
            <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800 text-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                  <Bookmark className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Custom Pinned Watchlist</span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">4 Monitored Venture Deals · Real-time round progress</span>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-[#00d09c]">
                Avg 24h: +11.8%
              </span>
            </div>
          )}

          {activeNavTab === "all_watchlist" && (
            <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800 text-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
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

          {activeNavTab === "news" && (
            <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Portfolio Intelligence & Shareholder Alerts
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Direct coverage for your 3 active venture holdings: TechFlow AI (TFLOW), GreenLeaf Energy (GGRID), Quantum Materials (QMAT)
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20 flex items-center gap-1">
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
            <div className="p-4 sm:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Eye className="h-4 w-4 text-[#00d09c]" />
                    Recently Viewed Companies
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    Startups and venture campaigns you have recently inspected
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer">
                  View All ({recentlyViewed.length})
                </span>
              </div>

              {/* Horizontal scrolling card deck */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
                {recentlyViewed.map((comp) => (
                  <div
                    key={comp.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 hover:border-[#00d09c]/40 hover:bg-white dark:hover:bg-zinc-900/80 transition-all duration-200 group flex flex-col justify-between space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className={`h-8 w-8 rounded-lg ${comp.logoColor} text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs`}>
                        {comp.ticker.substring(0, 2)}
                      </div>
                      <span
                        className={`inline-flex items-center gap-0.5 text-[11px] font-bold ${
                          comp.isPositive ? "text-emerald-500" : "text-rose-500"
                        }`}
                      >
                        {comp.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {comp.change}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-[#00d09c] transition-colors">
                        {comp.name}
                      </h4>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
                        <span>{comp.sector}</span>
                        <span className="font-semibold text-slate-700 dark:text-zinc-300">{comp.stage}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-800 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-slate-400">Valuation</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">{comp.valuation}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ROW 3: Todays most invested companies | Todays least invested */}
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-zinc-800">
              {/* Column 1: Todays most invested companies */}
              <div className="p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Todays Most Invested Companies</h3>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">Highest daily funding inflow & round momentum</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    +$3.79M Today
                  </span>
                </div>

                <div className="space-y-2.5">
                  {mostInvestedCompanies.map((comp) => (
                    <div
                      key={comp.id}
                      className="p-3 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 hover:border-slate-300 dark:hover:border-zinc-700 transition-all space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="h-5 w-5 rounded-full bg-slate-200 dark:bg-zinc-800 text-[10px] font-extrabold flex items-center justify-center text-slate-700 dark:text-zinc-300">
                            #{comp.rank}
                          </span>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">{comp.name}</span>
                            <span className="text-[11px] text-slate-500 dark:text-zinc-400 ml-2">({comp.sector})</span>
                          </div>
                        </div>
                        <span className="font-extrabold text-[#00d09c]">{comp.investedToday}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-500 dark:text-zinc-400">
                          <span>Funded: {comp.percentFunded}% of {comp.target}</span>
                          <span className="text-emerald-500 font-semibold">{comp.change} 24h</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#00d09c] h-full rounded-full transition-all"
                            style={{ width: `${comp.percentFunded}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 2: Todays least invested companies */}
              <div className="p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                      <Flame className="h-4 w-4 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Todays Least Invested Companies</h3>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">Early round allocations & hidden value opportunities</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                    Early Stage
                  </span>
                </div>

                <div className="space-y-2.5">
                  {leastInvestedCompanies.map((comp) => (
                    <div
                      key={comp.id}
                      className="p-3 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 hover:border-slate-300 dark:hover:border-zinc-700 transition-all space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="h-5 w-5 rounded-full bg-slate-200 dark:bg-zinc-800 text-[10px] font-extrabold flex items-center justify-center text-slate-700 dark:text-zinc-300">
                            #{comp.rank}
                          </span>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">{comp.name}</span>
                            <span className="text-[11px] text-slate-500 dark:text-zinc-400 ml-2">({comp.sector})</span>
                          </div>
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">{comp.raised}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-500 dark:text-zinc-400">
                          <span>Progress: {comp.percentFunded}% of {comp.target}</span>
                          <span className="text-amber-500 font-semibold">{comp.daysLeft} days left</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-amber-500 h-full rounded-full transition-all"
                            style={{ width: `${comp.percentFunded}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ROW 4: Screener | Tools (Two 50-50 Columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-zinc-800">
              {/* Column 1: Screener */}
              <div className="p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      <SlidersHorizontal className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Screener</h3>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">Filter ventures by sector, stage, and valuation</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setScreenerSector("All")
                      setScreenerStage("All")
                      setScreenerValuation("All")
                    }}
                    className="text-[11px] font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
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
                              ? "bg-slate-900 text-white dark:bg-white dark:text-zinc-950 border-slate-900 dark:border-white font-bold"
                              : "border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-slate-300 dark:hover:border-zinc-700"
                          }`}
                        >
                          {sec}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Funding Stage
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {["All", "Pre-Seed", "Seed", "Series A", "Series B+"].map((stg) => (
                        <button
                          key={stg}
                          onClick={() => setScreenerStage(stg)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                            screenerStage === stg
                              ? "bg-slate-900 text-white dark:bg-white dark:text-zinc-950 border-slate-900 dark:border-white font-bold"
                              : "border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-slate-300 dark:hover:border-zinc-700"
                          }`}
                        >
                          {stg}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Valuation Range
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {["All", "< $10M", "$10M - $50M", "$50M+"].map((val) => (
                        <button
                          key={val}
                          onClick={() => setScreenerValuation(val)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                            screenerValuation === val
                              ? "bg-slate-900 text-white dark:bg-white dark:text-zinc-950 border-slate-900 dark:border-white font-bold"
                              : "border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-slate-300 dark:hover:border-zinc-700"
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Matches: <strong className="text-slate-900 dark:text-white">24 verified deals</strong>
                    </span>
                    <button className="px-4 py-2 rounded-xl bg-[#00d09c] text-black font-bold text-xs hover:bg-[#00b888] transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs">
                      Apply Screener <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Column 2: Tools */}
              <div className="p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                      <Calculator className="h-4 w-4 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tools</h3>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">Financial models, valuation engines & diligence tools</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">4 Interactive Utilities</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {toolsList.map((tool) => {
                    const IconComponent = tool.icon
                    return (
                      <div
                        key={tool.id}
                        className="p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 hover:border-[#00d09c]/40 hover:bg-white dark:hover:bg-zinc-900/80 transition-all cursor-pointer group flex flex-col justify-between space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="h-8 w-8 rounded-lg bg-slate-200/60 dark:bg-zinc-800 flex items-center justify-center text-slate-800 dark:text-white group-hover:bg-[#00d09c]/15 group-hover:text-[#00d09c] transition-colors">
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                            {tool.badge}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-[#00d09c] transition-colors flex items-center justify-between">
                            {tool.name}
                            <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
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
            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#00d09c]" />
                    Recently Added Companies
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    New ventures and enterprise issuers freshly registered on White Quantex
                  </p>
                </div>
                <Link
                  to="/ventures"
                  className="text-xs font-semibold text-[#00d09c] hover:underline flex items-center gap-1"
                >
                  Browse All Ventures <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentlyAddedCompanies.map((comp) => (
                  <div
                    key={comp.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 hover:border-slate-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">{comp.name}</h4>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-[#00d09c]/10 text-[#00a87e] dark:text-[#00d09c] border border-[#00d09c]/20">
                              {comp.verification}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                            {comp.sector} · {comp.location} · Est. {comp.founded}
                          </span>
                        </div>
                        <span className="badge-accent text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {comp.stage}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-zinc-300 mt-2 line-clamp-2 leading-relaxed">
                        {comp.tagline}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-200/70 dark:border-zinc-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Seeking Target</span>
                        <span className="font-extrabold text-slate-900 dark:text-white">{comp.seeking}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Trust Score</span>
                        <span className="font-extrabold text-[#00d09c]">{comp.trustScore}/100</span>
                      </div>
                      <Link
                        to="/ventures"
                        className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-zinc-950 font-bold text-xs hover:bg-slate-800 dark:hover:bg-zinc-200 transition-colors"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ─── 2. TAB: POSITIONS (PORTFOLIO HOLDINGS & ALLOCATION VIEW) ────── */}
        {activeNavTab === "positions" && (
          <div className="p-4 sm:p-6 space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40">
                <span className="text-xs text-slate-500 dark:text-zinc-400 block">Total Portfolio Value</span>
                <p className="text-2xl font-black text-[#00d09c] mt-1">$62,400.00</p>
                <span className="text-[11px] text-emerald-500 font-bold">+38.6% All-time Gain</span>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40">
                <span className="text-xs text-slate-500 dark:text-zinc-400 block">Invested Capital</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">$45,000.00</p>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400">3 Active Venture Deals</span>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40">
                <span className="text-xs text-slate-500 dark:text-zinc-400 block">Unrealized Gain</span>
                <p className="text-2xl font-black text-emerald-500 mt-1">+$17,400.00</p>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400">Audit-verified balance</span>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40">
                <span className="text-xs text-slate-500 dark:text-zinc-400 block">Compliance Trust Rating</span>
                <p className="text-2xl font-black text-amber-400 mt-1">92 / 100</p>
                <span className="text-[11px] text-amber-500 font-bold">Gold Accredited Tier</span>
              </div>
            </div>

            {/* Active Positions Table */}
            <div className="border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900/60 shadow-xs">
              <div className="p-4 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
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
                  <thead className="bg-slate-50 dark:bg-zinc-900/90 text-slate-500 dark:text-zinc-400 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-zinc-800">
                    <tr>
                      <th className="py-3 px-4">Venture Name</th>
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
                    {[
                      {
                        name: "TechFlow AI Solutions",
                        ticker: "TFLOW",
                        ind: "AI & Distributed Cloud",
                        eq: "0.85%",
                        shares: "8,500",
                        inv: "$25,000",
                        val: "$38,500",
                        ret: "+54.0%",
                        isPositive: true,
                        st: "Active",
                      },
                      {
                        name: "GreenLeaf Energy",
                        ticker: "GGRID",
                        ind: "CleanTech & Solar",
                        eq: "0.40%",
                        shares: "4,000",
                        inv: "$10,000",
                        val: "$12,400",
                        ret: "+24.0%",
                        isPositive: true,
                        st: "Active",
                      },
                      {
                        name: "Quantum Materials Corp",
                        ticker: "QMAT",
                        ind: "DeepTech Nano",
                        eq: "0.25%",
                        shares: "2,500",
                        inv: "$10,000",
                        val: "$11,500",
                        ret: "+15.0%",
                        isPositive: true,
                        st: "Active",
                      },
                    ].map((pos) => (
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
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            {pos.st}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            to="/ventures"
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-white font-bold text-[11px] transition-colors"
                          >
                            Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Asset Diversification Breakdown */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Portfolio Sector Diversification</h4>
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
            </div>
          </div>
        )}

        {/* ─── 3. TAB: ORDERS (VENTURE ORDER EXECUTION BOOK) ───────────────── */}
        {activeNavTab === "orders" && (
          <div className="p-4 sm:p-6 space-y-6">
            <div className="border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900/60 shadow-xs">
              <div className="p-4 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-blue-500" />
                    Venture Orders & Allocation Transactions
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
                  <thead className="bg-slate-50 dark:bg-zinc-900/90 text-slate-500 dark:text-zinc-400 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-zinc-800">
                    <tr>
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-3">Venture Name</th>
                      <th className="py-3 px-3">Round / Instrument</th>
                      <th className="py-3 px-3">Invested Amount</th>
                      <th className="py-3 px-3">Units / Shares</th>
                      <th className="py-3 px-3">Date & Time</th>
                      <th className="py-3 px-3">Settlement Status</th>
                      <th className="py-3 px-4 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                    {[
                      {
                        id: "ORD-9201",
                        venture: "Quantum Materials Corp",
                        instrument: "Series A Preferred",
                        amount: "$10,000.00",
                        shares: "1,000 @ $10.00",
                        date: "2026-09-11 14:32:10",
                        status: "FILLED",
                        statusLabel: "Executed & Settled",
                        badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                      },
                      {
                        id: "ORD-8942",
                        venture: "TechFlow AI Solutions",
                        instrument: "SAFE Note (20% Discount)",
                        amount: "$15,000.00",
                        shares: "SAFE Tranche 2",
                        date: "2026-08-19 10:15:44",
                        status: "FILLED",
                        statusLabel: "Executed & Settled",
                        badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                      },
                      {
                        id: "ORD-8815",
                        venture: "BioVanguard Labs",
                        instrument: "Seed Equity Round",
                        amount: "$5,000.00",
                        shares: "500 @ $10.00",
                        date: "2026-09-12 18:40:02",
                        status: "PENDING",
                        statusLabel: "Pending Escrow Signature",
                        badge: "bg-amber-500/10 text-amber-500 border-amber-500/20",
                      },
                      {
                        id: "ORD-8604",
                        venture: "TerraVolt Storage",
                        instrument: "Series A Equity",
                        amount: "$15,000.00",
                        shares: "1,500 @ $10.00",
                        date: "2026-07-28 09:22:15",
                        status: "FILLED",
                        statusLabel: "Executed & Settled",
                        badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                      },
                    ]
                      .filter((ord) => orderFilter === "ALL" || ord.status === orderFilter)
                      .map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                            {ord.id}
                          </td>
                          <td className="py-3.5 px-3 font-semibold text-slate-900 dark:text-white">
                            {ord.venture}
                          </td>
                          <td className="py-3.5 px-3 text-slate-600 dark:text-zinc-300">{ord.instrument}</td>
                          <td className="py-3.5 px-3 font-bold text-[#00d09c]">{ord.amount}</td>
                          <td className="py-3.5 px-3 text-slate-500 dark:text-zinc-400 font-mono">{ord.shares}</td>
                          <td className="py-3.5 px-3 text-slate-500 dark:text-zinc-400 text-[11px]">{ord.date}</td>
                          <td className="py-3.5 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${ord.badge}`}>
                              {ord.statusLabel}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-white font-bold text-[11px] transition-colors cursor-pointer">
                              View Receipt
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Compliance Note */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 flex items-start gap-3">
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
                  Track price alerts, round closures, and corporate milestones in real-time
                </p>
              </div>
              <button className="px-3 py-1.5 rounded-lg bg-[#00d09c] text-black font-bold text-xs hover:bg-[#00b888] transition-colors cursor-pointer flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 fill-black" />
                Add Venture
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: "TechFlow AI Solutions", ticker: "TFLOW", sector: "AI & Cloud", val: "$42.5M", change: "+14.2%", funded: 88, stage: "Series A", target: "$2.5M" },
                { name: "NovaPay Technologies", ticker: "NPAY", sector: "Fintech", val: "$65.0M", change: "+3.1%", funded: 94, stage: "Series B", target: "$5.0M" },
                { name: "CyberShield Vault", ticker: "CYBR", sector: "Cybersecurity", val: "$52.0M", change: "+15.7%", funded: 92, stage: "Series B", target: "$3.0M" },
                { name: "TerraVolt Storage", ticker: "TVLT", sector: "CleanTech", val: "$62.0M", change: "+8.4%", funded: 65, stage: "Series A", target: "$7.5M" },
                { name: "Aether Dynamics", ticker: "AETH", sector: "SpaceTech", val: "$48.0M", change: "+22.5%", funded: 45, stage: "Series A", target: "$5.0M" },
                { name: "BioVanguard Labs", ticker: "BVGD", sector: "Biotech", val: "$22.0M", change: "+5.9%", funded: 58, stage: "Seed", target: "$2.8M" },
              ].map((wl) => (
                <div
                  key={wl.name}
                  className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 hover:border-slate-300 dark:hover:border-zinc-700 transition-all space-y-3"
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
                      {wl.stage}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Valuation: <strong className="text-slate-900 dark:text-white">{wl.val}</strong></span>
                      <span className="text-emerald-500 font-bold">{wl.change} 24h</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Funded {wl.funded}% of {wl.target}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#00d09c] h-full rounded-full" style={{ width: `${wl.funded}%` }} />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/70 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">Alerts: Active</span>
                    <Link
                      to="/ventures"
                      className="px-3 py-1 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-zinc-950 font-bold text-xs hover:bg-slate-800 dark:hover:bg-zinc-200 transition-colors"
                    >
                      Invest Now
                    </Link>
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
                Thematic venture baskets curated by White Quantex research analysts
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
                  title: "Pre-Seed Breakout Radar",
                  count: 15,
                  change: "+32.0% 30d",
                  followers: "1,150",
                  constituents: "FinLedger, SolarHarvest, OmniLogic",
                  desc: "High-momentum pre-seed rounds curated directly from university incubators & accelerators.",
                },
              ].map((basket) => (
                <div
                  key={basket.title}
                  className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 hover:border-purple-500/40 transition-all space-y-3 flex flex-col justify-between"
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

                  <div className="pt-3 border-t border-slate-200/70 dark:border-zinc-800 flex items-center justify-between text-xs">
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

        {/* ─── 6. TAB: NEWS & NOTIFICATIONS (INVESTED COMPANIES ONLY) ─────────── */}
        {activeNavTab === "news" && (
          <div className="p-4 sm:p-6 space-y-6">
            
            {/* Top Section Header & KPI Overview */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                    <Bell className="h-4 w-4" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Invested Portfolio Intelligence & Shareholder Notifications
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  Exclusively filtered for your 3 active venture holdings: <strong className="text-slate-800 dark:text-zinc-200">TechFlow AI Solutions</strong>, <strong className="text-slate-800 dark:text-zinc-200">GreenLeaf Energy</strong>, and <strong className="text-slate-800 dark:text-zinc-200">Quantum Materials Corp</strong>.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setDismissedNoticeIds(holdingsNotifications.map((n) => n.id))
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
              <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Monitored Holdings Value</span>
                <p className="text-2xl font-black text-[#00d09c] mt-1">$62,400.00</p>
                <span className="text-[10px] text-emerald-500 font-bold">+38.6% All-Time Portfolio ROI</span>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Pending Shareholder Actions</span>
                <p className="text-2xl font-black text-rose-500 mt-1">
                  {voteSubmittedSuccess ? "0 Pending" : "1 Vote Required"}
                </p>
                <span className="text-[10px] text-rose-500 dark:text-rose-400 font-bold">
                  {voteSubmittedSuccess ? "Ballot Submitted & Recorded" : "QMAT AGM Proxy Ballot Open"}
                </span>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Invested News Coverage</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{holdingsNews.length} Articles</p>
                <span className="text-[10px] text-emerald-500 font-bold">100% Holdings Coverage</span>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Cash Yield Settled (YTD)</span>
                <p className="text-2xl font-black text-blue-500 mt-1">$320.00</p>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">Credited from GreenLeaf Energy</span>
              </div>
            </div>

            {/* Filter Chips & Search Bar */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 space-y-3">
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
                          ? "bg-slate-900 text-white dark:bg-white dark:text-zinc-950 border-transparent shadow-xs"
                          : "border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-slate-300 dark:hover:border-zinc-700"
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
                          ? "bg-[#00d09c]/15 text-[#00a87e] dark:text-[#00d09c] border-[#00d09c]/40 font-bold"
                          : "border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-slate-300"
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
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00d09c] focus:border-transparent transition-all"
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
                  {holdingsNotifications
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
                          className={`p-4 rounded-xl border transition-all space-y-3 ${
                            notif.isUrgent && !isVoted
                              ? "border-rose-500/40 bg-rose-500/5 dark:bg-rose-500/5 shadow-xs"
                              : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-slate-300 dark:hover:border-zinc-700"
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
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${notif.badgeColor}`}>
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
                          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                            <span className="text-[10px] text-slate-400">
                              Deadline: <strong className="text-slate-700 dark:text-zinc-300">{notif.dueDate}</strong>
                            </span>

                            {notif.actionType === "vote" ? (
                              <button
                                type="button"
                                onClick={() => setActiveVoteModal(true)}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                  isVoted
                                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
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
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00d09c] animate-pulse" />
                    Verified PR Newsdesk
                  </span>
                </div>

                <div className="space-y-4">
                  {holdingsNews
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
                        className="p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-[#00d09c]/40 transition-all space-y-3 group"
                      >
                        {/* Top Meta Line */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className={`h-6 w-6 rounded-md ${news.logoColor} text-white font-bold text-[10px] flex items-center justify-center`}>
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
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${news.categoryColor}`}>
                              {news.category}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00d09c]/10 text-[#00a87e] dark:text-[#00d09c] border border-[#00d09c]/20">
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
                        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
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
                        <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
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

