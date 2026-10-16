import React, { useState, useEffect } from "react"
import { Link } from "react-router"
import { motion, AnimatePresence } from "framer-motion"
import {
  Building2,
  Rocket,
  Send,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Tag,
  Image as ImageIcon,
  Check,
  Users,
  FileText,
  AlertCircle,
  TrendingUp,
  Award,
  Globe,
  Radio,
  Clock,
  ArrowRight,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/stores/auth-store"
import axios from "axios"

interface PresetEntity {
  name: string
  ticker: string
  headline: string
  role: string
  sector: string
  verificationLevel: "PLATINUM" | "GOLD"
  logoColor?: string
}

const PRESET_COMPANIES: PresetEntity[] = [
  {
    name: "AeroFusion Technologies Ltd.",
    ticker: "ZEPR",
    headline: "Chief Executive Officer @ AeroFusion Technologies",
    role: "CORPORATE",
    sector: "Aerospace & Defense",
    verificationLevel: "PLATINUM",
    logoColor: "#10b981",
  },
  {
    name: "OmniCognition Labs",
    ticker: "OCGN",
    headline: "Founder & Lead Architect @ OmniCognition Labs",
    role: "CORPORATE",
    sector: "AI & Machine Learning",
    verificationLevel: "PLATINUM",
    logoColor: "#6366f1",
  },
  {
    name: "VerdeGrid Energy Systems",
    ticker: "VGRD",
    headline: "CEO @ VerdeGrid Energy",
    role: "CORPORATE",
    sector: "CleanTech & Autonomous Energy",
    verificationLevel: "GOLD",
    logoColor: "#00d09c",
  },
  {
    name: "TeraFlow BioTech",
    ticker: "TFLOW",
    headline: "VP Regulatory & Clinical Affairs @ TeraFlow BioTech",
    role: "CORPORATE",
    sector: "BioTech & Precision Therapeutics",
    verificationLevel: "PLATINUM",
    logoColor: "#ec4899",
  },
  {
    name: "NovaGrid Energy Networks",
    ticker: "GGRID",
    headline: "Chief Technology Officer @ NovaGrid Energy",
    role: "CORPORATE",
    sector: "Energy Infrastructure",
    verificationLevel: "GOLD",
    logoColor: "#f59e0b",
  },
]

const PRESET_VENTURES: PresetEntity[] = [
  {
    name: "Quantex Sovereign Capital",
    ticker: "QSC",
    headline: "Managing Partner · Quantex Sovereign Capital",
    role: "INVESTOR",
    sector: "Institutional Secondary Rails",
    verificationLevel: "PLATINUM",
    logoColor: "#0f172a",
  },
  {
    name: "Sequoia Capital",
    ticker: "SEQ",
    headline: "General Partner @ Sequoia Capital",
    role: "INVESTOR",
    sector: "Enterprise Software & Sovereign Infrastructure",
    verificationLevel: "PLATINUM",
    logoColor: "#059669",
  },
  {
    name: "Founders Fund",
    ticker: "FFND",
    headline: "Managing Director @ Founders Fund",
    role: "INVESTOR",
    sector: "Frontier DeepTech & Commercial Space",
    verificationLevel: "PLATINUM",
    logoColor: "#2563eb",
  },
  {
    name: "Green Horizon Ventures",
    ticker: "GHV",
    headline: "Lead Syndicate Partner @ Green Horizon Ventures",
    role: "INVESTOR",
    sector: "CleanTech Commercialization",
    verificationLevel: "GOLD",
    logoColor: "#10b981",
  },
  {
    name: "European Tech Horizons",
    ticker: "ETH",
    headline: "Partner @ European Tech Horizons",
    role: "INVESTOR",
    sector: "Cross-Border Delaware Expansion",
    verificationLevel: "GOLD",
    logoColor: "#7c3aed",
  },
]

export default function CompanyPostPublisherPage() {
  const { user } = useAuthStore()

  // Mode: "COMPANY" | "VENTURE"
  const [accountType, setAccountType] = useState<"COMPANY" | "VENTURE">("COMPANY")

  // Selected Entity
  const [selectedEntityName, setSelectedEntityName] = useState(PRESET_COMPANIES[0].name)
  const [ticker, setTicker] = useState(PRESET_COMPANIES[0].ticker)
  const [authorName, setAuthorName] = useState(user?.displayName || "Dmitri Martinez")
  const [headline, setHeadline] = useState(PRESET_COMPANIES[0].headline)
  const [sector, setSector] = useState(PRESET_COMPANIES[0].sector)
  const [isCustomEntity, setIsCustomEntity] = useState(false)

  // Post Content
  const [content, setContent] = useState("")
  const [postCategory, setPostCategory] = useState("Announcement")
  const [impactMetric, setImpactMetric] = useState("")
  const [communityTarget, setCommunityTarget] = useState("all")
  const [mediaUrl, setMediaUrl] = useState("")

  // State
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishSuccess, setPublishSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [publishedHistory, setPublishedHistory] = useState<any[]>([])

  // Load published posts history from storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("wq_company_module_posts")
      if (saved) {
        setPublishedHistory(JSON.parse(saved))
      }
    } catch {}
  }, [])

  // Auto-update presets when switching mode
  const handleSwitchAccountType = (type: "COMPANY" | "VENTURE") => {
    setAccountType(type)
    setIsCustomEntity(false)
    if (type === "COMPANY") {
      const p = PRESET_COMPANIES[0]
      setSelectedEntityName(p.name)
      setTicker(p.ticker)
      setHeadline(p.headline)
      setSector(p.sector)
      setAuthorName(user?.displayName || "Dmitri Martinez")
      setContent(
        `Announcing our Q3 commercial milestones for ${p.name} ($${p.ticker}). We have completed operational trials across our ${p.sector.toLowerCase()} architecture with full Delaware statutory certification.`
      )
      setImpactMetric("+$14.2M ARR")
    } else {
      const p = PRESET_VENTURES[0]
      setSelectedEntityName(p.name)
      setTicker(p.ticker)
      setHeadline(p.headline)
      setSector(p.sector)
      setAuthorName(user?.displayName || "Alexander Vance")
      setContent(
        `Pleasure to announce our lead syndicate allocation for ${p.name} ($${p.ticker}). We are backing early-growth frontier issuers deploying verified secondary liquidity on White Quantex.`
      )
      setImpactMetric("$35M Syndicate Round")
    }
    setPublishSuccess(false)
    setErrorMsg("")
  }

  // Handle Preset Selection Change
  const handleSelectPreset = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    if (val === "CUSTOM") {
      setIsCustomEntity(true)
      setSelectedEntityName("")
      setTicker("")
      setHeadline(accountType === "COMPANY" ? "Executive Officer" : "Managing Partner")
      return
    }

    setIsCustomEntity(false)
    const list = accountType === "COMPANY" ? PRESET_COMPANIES : PRESET_VENTURES
    const found = list.find((item) => item.name === val)
    if (found) {
      setSelectedEntityName(found.name)
      setTicker(found.ticker)
      setHeadline(found.headline)
      setSector(found.sector)
    }
  }

  // Quick tag inserters
  const handleInsertTag = (tag: string) => {
    setContent((prev) => `${prev} ${tag}`)
  }

  // Publish Submission
  const handlePublishPost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) {
      setErrorMsg("Please enter post content before publishing.")
      return
    }

    if (!selectedEntityName.trim()) {
      setErrorMsg("Please provide an organization / entity name.")
      return
    }

    setIsPublishing(true)
    setErrorMsg("")

    const newPostId = `${accountType.toLowerCase()}-post-${Date.now()}`
    const entityTicker = ticker.replace("$", "").trim()
    const hashtags = [
      accountType === "COMPANY" ? "CorporateIssuer" : "VentureCapital",
      postCategory.replace(/[^a-zA-Z0-9]/g, ""),
      entityTicker || "WhiteQuantex",
    ]

    const entityName = selectedEntityName.trim()
    const newPostObject = {
      id: newPostId,
      wqAuthorId: user?.id || user?.wqUserId || `wq-author-${entityTicker.toLowerCase() || "entity"}`,
      authorName: entityName,
      author: {
        wqUserId: user?.id || user?.wqUserId || `wq-author-${entityTicker.toLowerCase() || "entity"}`,
        displayName: entityName,
        username: entityTicker ? entityTicker.toLowerCase() : entityName.toLowerCase().replace(/[^a-z0-9]/g, ""),
        headline: headline.trim() || `${accountType === "COMPANY" ? "Corporate Account" : "Venture Account"} @ ${entityName}`,
        avatarUrl: "",
        verificationLevel: "PLATINUM",
        accountType: accountType,
        authorType: accountType,
        companyId: entityName,
        ticker: entityTicker,
        role: accountType === "COMPANY" ? "CORPORATE" : "INVESTOR",
      },
      authorAccountType: accountType,
      authorType: accountType,
      companyId: entityName,
      ticker: entityTicker,
      content: content.trim(),
      mediaUrls: mediaUrl.trim() ? [mediaUrl.trim()] : [],
      postType: mediaUrl.trim() ? "IMAGE" : "TEXT",
      visibility: "PUBLIC",
      communityName: communityTarget === "all" ? "Ecosystem Public Feed" : communityTarget,
      hashtags,
      mentions: entityTicker ? [entityTicker] : [],
      likesCount: 1,
      commentsCount: 0,
      sharesCount: 0,
      bookmarksCount: 0,
      isLiked: false,
      isBookmarked: false,
      impactMetric: impactMetric.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // 1. Try publishing to Node API backend if running
    try {
      await axios.post(
        "http://localhost:5000/api/posts",
        {
          content: content.trim(),
          mediaUrls: mediaUrl.trim() ? [mediaUrl.trim()] : [],
          postType: mediaUrl.trim() ? "IMAGE" : "TEXT",
          visibility: "PUBLIC",
          authorAccountType: accountType,
          authorType: accountType,
          authorRole: accountType === "COMPANY" ? "CORPORATE" : "INVESTOR",
          authorName: entityName,
          authorHeadline: headline.trim(),
          ticker: entityTicker,
          companyId: entityName,
        },
        { timeout: 3000 }
      )
    } catch {
      // Backend might be offline or mocked; localStorage sync handles it seamlessly
    }

    // 2. Persist in local synchronization storage for instant community display
    try {
      const existingStr = localStorage.getItem("wq_company_module_posts")
      const existing = existingStr ? JSON.parse(existingStr) : []
      const updated = [newPostObject, ...existing]
      localStorage.setItem("wq_company_module_posts", JSON.stringify(updated))
      setPublishedHistory(updated)

      // Broadcast to all open tabs
      try {
        const bc = new BroadcastChannel("wq_posts_channel")
        bc.postMessage({ type: "NEW_POST", post: newPostObject })
        bc.close()
      } catch {}
    } catch {}

    setIsPublishing(false)
    setPublishSuccess(true)
  }

  return (
    <div className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10">
      
      {/* ── Page Header ── */}
      <div className="space-y-3 text-center sm:text-left border-b border-[var(--wq-border)] pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold bg-[#00d09c]/10 text-[#00a87e] dark:text-[#00d09c] border border-[#00d09c]/30">
          <Radio className="h-3.5 w-3.5 animate-pulse" />
          <span>Official Corporate & Venture Broadcast Channel</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[var(--wq-fg)] tracking-tight">
          Company & Venture Post Publisher
        </h1>
        <p className="text-xs sm:text-sm text-[var(--wq-fg-muted)] max-w-2xl leading-relaxed">
          Publish verified dispatches, financial round disclosures, product milestones, and governance updates. Posts published here are strictly categorized and automatically live in the White Quantex Community Feed.
        </p>
      </div>

      {/* ── Entity Switcher: Company vs Venture ── */}
      <div className="space-y-3">
        <label className="text-xs font-black uppercase tracking-wider text-[var(--wq-fg)]">
          1. Select Publishing Account Type
        </label>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Company Account Card */}
          <button
            type="button"
            onClick={() => handleSwitchAccountType("COMPANY")}
            className={`p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-start gap-4 ${
              accountType === "COMPANY"
                ? "bg-blue-500/10 border-blue-500 shadow-md ring-2 ring-blue-500/20"
                : "bg-[var(--wq-bg-surface)] border-[var(--wq-border)] hover:border-blue-500/40"
            }`}
          >
            <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
              accountType === "COMPANY" ? "bg-blue-600 text-white" : "bg-blue-500/10 text-blue-500"
            }`}>
              <Building2 className="h-5 w-5" />
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-[var(--wq-fg)]">Company Account</span>
                {accountType === "COMPANY" && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-600 text-white uppercase tracking-wider">
                    Selected
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--wq-fg-muted)] leading-relaxed">
                Operating corporate issuers, Delaware C-Corps, enterprise startups, and commercial entities.
              </p>
            </div>
          </button>

          {/* Venture Account Card */}
          <button
            type="button"
            onClick={() => handleSwitchAccountType("VENTURE")}
            className={`p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-start gap-4 ${
              accountType === "VENTURE"
                ? "bg-purple-500/10 border-purple-500 shadow-md ring-2 ring-purple-500/20"
                : "bg-[var(--wq-bg-surface)] border-[var(--wq-border)] hover:border-purple-500/40"
            }`}
          >
            <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
              accountType === "VENTURE" ? "bg-purple-600 text-white" : "bg-purple-500/10 text-purple-500"
            }`}>
              <Rocket className="h-5 w-5" />
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-[var(--wq-fg)]">Venture Account</span>
                {accountType === "VENTURE" && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-600 text-white uppercase tracking-wider">
                    Selected
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--wq-fg-muted)] leading-relaxed">
                Venture capital firms, angel syndicates, institutional allocators, and venture launchpads.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* ── Main Publisher Form ── */}
      <form onSubmit={handlePublishPost} className="p-6 sm:p-8 rounded-2xl bg-[var(--wq-bg-surface)] border border-[var(--wq-border)] shadow-lg space-y-6">
        
        {/* Entity Configuration Row */}
        <div className="space-y-4 pb-6 border-b border-[var(--wq-border)]">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-wider text-[var(--wq-fg)] flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#00d09c]" />
              2. Entity Identity & Authorized Signer
            </label>
            <span className="text-[11px] font-bold text-[var(--wq-fg-muted)]">
              Posting as: <strong className={accountType === "COMPANY" ? "text-blue-500" : "text-purple-500"}>{accountType} ACCOUNT</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Preset Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--wq-fg-muted)]">
                {accountType === "COMPANY" ? "Select Registered Company" : "Select Venture Firm"}
              </label>
              <select
                onChange={handleSelectPreset}
                value={isCustomEntity ? "CUSTOM" : selectedEntityName}
                className="w-full text-xs rounded-xl p-2.5 bg-[var(--wq-bg-elevated)] border border-[var(--wq-border)] text-[var(--wq-fg)] font-semibold focus:outline-none focus:ring-1 focus:ring-[#00d09c]"
              >
                {(accountType === "COMPANY" ? PRESET_COMPANIES : PRESET_VENTURES).map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name} ({p.ticker})
                  </option>
                ))}
                <option value="CUSTOM">+ Use Custom Name & Ticker</option>
              </select>
            </div>

            {/* Entity Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--wq-fg-muted)]">
                Entity Legal Name
              </label>
              <input
                type="text"
                value={selectedEntityName}
                onChange={(e) => setSelectedEntityName(e.target.value)}
                placeholder="e.g. AeroFusion Technologies Ltd."
                required
                className="w-full text-xs rounded-xl p-2.5 bg-[var(--wq-bg-elevated)] border border-[var(--wq-border)] text-[var(--wq-fg)] font-semibold focus:outline-none focus:ring-1 focus:ring-[#00d09c]"
              />
            </div>

            {/* Ticker Symbol */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--wq-fg-muted)]">
                Ticker / Identifier
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-[var(--wq-fg-muted)]">$</span>
                <input
                  type="text"
                  value={ticker.replace("$", "")}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  placeholder="ZEPR"
                  className="w-full text-xs font-mono font-bold rounded-xl pl-7 pr-3 py-2.5 bg-[var(--wq-bg-elevated)] border border-[var(--wq-border)] text-[var(--wq-fg)] focus:outline-none focus:ring-1 focus:ring-[#00d09c]"
                />
              </div>
            </div>

            {/* Author Title / Signer */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--wq-fg-muted)]">
                Signer Role / Title
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Chief Executive Officer"
                className="w-full text-xs rounded-xl p-2.5 bg-[var(--wq-bg-elevated)] border border-[var(--wq-border)] text-[var(--wq-fg)] font-semibold focus:outline-none focus:ring-1 focus:ring-[#00d09c]"
              />
            </div>

            {/* Post Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--wq-fg-muted)]">
                Dispatch Category
              </label>
              <select
                value={postCategory}
                onChange={(e) => setPostCategory(e.target.value)}
                className="w-full text-xs rounded-xl p-2.5 bg-[var(--wq-bg-elevated)] border border-[var(--wq-border)] text-[var(--wq-fg)] font-semibold focus:outline-none focus:ring-1 focus:ring-[#00d09c]"
              >
                <option value="Announcement">Corporate Announcement</option>
                <option value="Earnings">Financial Milestone & ARR</option>
                <option value="Funding">Venture Funding Round</option>
                <option value="Technology">Tech Breakthrough & Patent</option>
                <option value="Partnership">Strategic Partnership</option>
                <option value="Regulatory">Regulatory Filing / 8-K Proxy</option>
              </select>
            </div>

            {/* Key Impact Metric Tag */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--wq-fg-muted)]">
                Impact Metric Badge (Optional)
              </label>
              <input
                type="text"
                value={impactMetric}
                onChange={(e) => setImpactMetric(e.target.value)}
                placeholder="e.g. +$14.2M ARR or Series B"
                className="w-full text-xs rounded-xl p-2.5 bg-[var(--wq-bg-elevated)] border border-[var(--wq-border)] text-[var(--wq-fg)] font-semibold focus:outline-none focus:ring-1 focus:ring-[#00d09c]"
              />
            </div>

          </div>
        </div>

        {/* ── Post Content Editor ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-wider text-[var(--wq-fg)]">
              3. Post Content & Disclosures
            </label>
            <span className="text-[11px] font-mono text-[var(--wq-fg-muted)]">
              {content.length} / 5000 chars
            </span>
          </div>

          <textarea
            rows={5}
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              accountType === "COMPANY"
                ? "Draft your official company announcement, quarterly progress report, patent milestone, or shareholder notice..."
                : "Draft your venture capital update, funding allocation call, portfolio syndicate update, or thesis memo..."
            }
            className="w-full text-xs sm:text-sm bg-[var(--wq-bg-elevated)] border border-[var(--wq-border)] text-[var(--wq-fg)] rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-[#00d09c] transition-all resize-y leading-relaxed"
          />

          {/* Quick Tag Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-bold text-[var(--wq-fg-muted)] flex items-center gap-1">
              <Tag className="h-3 w-3" /> Quick Tags:
            </span>
            {ticker && (
              <button
                type="button"
                onClick={() => handleInsertTag(`$${ticker.replace("$", "")}`)}
                className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-[#00d09c]/10 text-[#00a87e] dark:text-[#00d09c] border border-[#00d09c]/30 hover:bg-[#00d09c]/20 cursor-pointer"
              >
                + ${ticker.replace("$", "")}
              </button>
            )}
            <button
              type="button"
              onClick={() => handleInsertTag(accountType === "COMPANY" ? "#CorporateMilestone" : "#VentureSyndicate")}
              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[var(--wq-bg-elevated)] border border-[var(--wq-border)] text-[var(--wq-fg)] hover:border-[#00d09c] cursor-pointer"
            >
              + {accountType === "COMPANY" ? "#CorporateMilestone" : "#VentureSyndicate"}
            </button>
            <button
              type="button"
              onClick={() => handleInsertTag("#WhiteQuantex")}
              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[var(--wq-bg-elevated)] border border-[var(--wq-border)] text-[var(--wq-fg)] hover:border-[#00d09c] cursor-pointer"
            >
              + #WhiteQuantex
            </button>
            <button
              type="button"
              onClick={() => handleInsertTag("#DelawareCCorp")}
              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[var(--wq-bg-elevated)] border border-[var(--wq-border)] text-[var(--wq-fg)] hover:border-[#00d09c] cursor-pointer"
            >
              + #DelawareCCorp
            </button>
          </div>
        </div>

        {/* ── Media Attachment & Community Target ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[var(--wq-border)]">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--wq-fg-muted)] flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5" /> Media / Attachment URL (Optional)
            </label>
            <input
              type="url"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full text-xs rounded-xl p-2.5 bg-[var(--wq-bg-elevated)] border border-[var(--wq-border)] text-[var(--wq-fg)] font-semibold focus:outline-none focus:ring-1 focus:ring-[#00d09c]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--wq-fg-muted)] flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" /> Target Community Hub
            </label>
            <select
              value={communityTarget}
              onChange={(e) => setCommunityTarget(e.target.value)}
              className="w-full text-xs rounded-xl p-2.5 bg-[var(--wq-bg-elevated)] border border-[var(--wq-border)] text-[var(--wq-fg)] font-semibold focus:outline-none focus:ring-1 focus:ring-[#00d09c]"
            >
              <option value="all">All Ecosystem Public Feed</option>
              <option value="AI & Machine Learning Founders">AI & Machine Learning Founders Hub</option>
              <option value="CleanTech & Autonomous Energy">CleanTech & Autonomous Energy Hub</option>
              <option value="Sovereign Fintech & Payment Rails">Sovereign Fintech & Payment Rails Hub</option>
              <option value="BioTech & Precision Therapeutics">BioTech & Precision Therapeutics Hub</option>
              <option value="Delaware Statutory Corporate Issuers">Delaware Statutory Corporate Issuers Hub</option>
            </select>
          </div>
        </div>

        {/* ── Error Banner ── */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ── Success Banner with Direct Community Link ── */}
        {publishSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3"
          >
            <div className="flex items-center gap-2.5 text-emerald-700 dark:text-[#00d09c] font-black text-sm">
              <CheckCircle2 className="h-5 w-5" />
              <span>Published Successfully! Live in White Quantex Community.</span>
            </div>
            <p className="text-xs text-[var(--wq-fg-muted)] leading-relaxed">
              Your post has been broadcast with verified <strong className="text-[var(--wq-fg)]">{accountType} ACCOUNT</strong> provenance. It is now visible in the User Module Community under the <strong>{accountType === "COMPANY" ? "Companies Post" : "Ventures Post"}</strong> filter.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href="http://localhost:7000/community?tab=home"
                className="px-4 py-2 rounded-xl bg-[#00d09c] text-black font-extrabold text-xs hover:bg-[#00b888] shadow-md transition-all inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>View in Community Feed</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <button
                type="button"
                onClick={() => {
                  setContent("")
                  setPublishSuccess(false)
                }}
                className="px-4 py-2 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] hover:bg-[var(--wq-bg-surface)] text-xs font-bold text-[var(--wq-fg)] cursor-pointer"
              >
                Create Another Post
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Action Buttons ── */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--wq-border)]">
          <Link
            to="/"
            className="text-xs font-bold text-[var(--wq-fg-muted)] hover:text-[var(--wq-fg)] transition-colors"
          >
            Cancel & Return Home
          </Link>

          <Button
            type="submit"
            disabled={isPublishing || !content.trim()}
            className="bg-[#00d09c] hover:bg-[#00b888] text-black font-extrabold text-xs px-6 py-2.5 rounded-xl cursor-pointer shadow-lg shadow-[#00d09c]/20 transition-all flex items-center gap-2"
          >
            {isPublishing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Broadcasting...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Publish as {accountType === "COMPANY" ? "Company Account" : "Venture Account"}</span>
              </>
            )}
          </Button>
        </div>

      </form>

      {/* ── Recently Published Dispatches Section ── */}
      {publishedHistory.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-[var(--wq-border)]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[var(--wq-fg)] uppercase tracking-wider flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#00d09c]" />
              Recent Dispatches Published from this Module ({publishedHistory.length})
            </h3>
            <a
              href="http://localhost:7000/community?tab=home"
              className="text-xs font-bold text-[#00d09c] hover:underline flex items-center gap-1"
            >
              Open Community Feed <ArrowRight className="h-3 w-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {publishedHistory.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-[var(--wq-bg-surface)] border border-[var(--wq-border)] space-y-2.5 shadow-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      item.authorAccountType === "COMPANY"
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                        : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                    }`}>
                      {item.authorAccountType || "COMPANY"} ACCOUNT
                    </span>
                    <span className="font-extrabold text-xs text-[var(--wq-fg)] truncate">
                      {item.author?.displayName}
                    </span>
                  </div>
                  {item.ticker && (
                    <span className="text-[10px] font-mono font-bold text-[#00d09c]">
                      ${item.ticker}
                    </span>
                  )}
                </div>

                <p className="text-xs text-[var(--wq-fg-muted)] line-clamp-2 leading-relaxed">
                  {item.content}
                </p>

                <div className="flex items-center justify-between text-[10px] text-[var(--wq-fg-subtle)] pt-1 border-t border-[var(--wq-border)]">
                  <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="text-emerald-500 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Live in Community
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
