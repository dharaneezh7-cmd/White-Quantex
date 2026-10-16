import React, { useState } from "react"
import { Link } from "react-router"
import {
  Bell,
  CheckCheck,
  Briefcase,
  Search,
  ShieldCheck,
  Clock,
  Vote,
  ArrowUpRight,
  Newspaper,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  X,
  Check,
  Download,
} from "lucide-react"
import { getCompanyLogoStyle } from "../utils/exploreUtils"

export interface ExploreNewsTabProps {
  liveHoldingsNews: any[]
  liveHoldingsNotifications: any[]
  newsCompanyFilter: string
  setNewsCompanyFilter: (filter: string) => void
  newsTypeFilter: "ALL" | "NEWS" | "NOTIFICATIONS" | "ACTION"
  setNewsTypeFilter: (filter: "ALL" | "NEWS" | "NOTIFICATIONS" | "ACTION") => void
  newsSearchInput: string
  setNewsSearchInput: (search: string) => void
  onToast: (msg: string) => void
  baseRoute?: string
}

export function ExploreNewsTab({
  liveHoldingsNews,
  liveHoldingsNotifications,
  newsCompanyFilter,
  setNewsCompanyFilter,
  newsTypeFilter,
  setNewsTypeFilter,
  newsSearchInput,
  setNewsSearchInput,
  onToast,
  baseRoute = "/explore",
}: ExploreNewsTabProps) {
  const [dismissedNoticeIds, setDismissedNoticeIds] = useState<string[]>([])
  const [selectedProposalVote, setSelectedProposalVote] = useState<{ p1: string; p2: string }>({ p1: "FOR", p2: "FOR" })
  const [activeVoteModal, setActiveVoteModal] = useState<any | null>(null)
  const [voteSubmittedSuccess, setVoteSubmittedSuccess] = useState<Record<string, boolean>>({})
  const [activeDetailModal, setActiveDetailModal] = useState<any | null>(null)
  const availableHoldings = React.useMemo(() => {
    const map = new Map<string, string>()
    for (const item of [...liveHoldingsNotifications, ...liveHoldingsNews]) {
      if (item.ticker && !map.has(item.ticker)) {
        map.set(item.ticker, item.companyName || item.ticker)
      }
    }
    return Array.from(map.entries()).map(([ticker, name]) => ({
      id: ticker,
      label: `${name} (${ticker})`,
    }))
  }, [liveHoldingsNotifications, liveHoldingsNews])

  const pendingActionsCount = liveHoldingsNotifications.filter(
    (n) => (n.type === "ACTION" || n.isActionRequired) && !dismissedNoticeIds.includes(n.id)
  ).length

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Top Section Header & KPI Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/40 dark:border-zinc-800/40">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Bell className="h-4 w-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Portfolio Intelligence &amp; Shareholder Notifications
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            {availableHoldings.length > 0
              ? `Exclusively filtered for your active equity holdings: ${availableHoldings.map((h) => h.label).join(", ")}.`
              : "Real-time regulatory filings, corporate notices, and operational disclosures for registered market issuers."}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setDismissedNoticeIds(liveHoldingsNotifications.map((n: any) => n.id))
              onToast("All shareholder notifications marked as read.")
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
            Mark All Read
          </button>
          <Link
            to={`${baseRoute}?tab=positions`}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#00d09c] hover:bg-[#00b588] text-slate-950 transition-colors shadow-xs flex items-center gap-1"
          >
            <Briefcase className="h-3.5 w-3.5" />
            View Portfolio
          </Link>
        </div>
      </div>

      {/* KPI Cards for Holdings Intelligence */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-zinc-900/60 shadow-2xs">
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Monitored Holdings</span>
          <p className={`text-2xl font-black mt-1 ${availableHoldings.length > 0 ? "text-[#00d09c]" : "text-slate-400 dark:text-zinc-500"}`}>
            {availableHoldings.length} Active
          </p>
          <span className={`text-[10px] font-bold ${availableHoldings.length > 0 ? "text-emerald-500" : "text-slate-400 dark:text-zinc-500"}`}>
            {availableHoldings.length > 0 ? "Real-time ledger sync" : "No active holdings"}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-zinc-900/60 shadow-2xs">
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Pending Shareholder Actions</span>
          <p className={`text-2xl font-black mt-1 ${pendingActionsCount > 0 ? "text-rose-500" : "text-emerald-500"}`}>
            {pendingActionsCount > 0 ? `${pendingActionsCount} Action Required` : "0 Pending"}
          </p>
          <span className={`text-[10px] font-bold ${pendingActionsCount > 0 ? "text-rose-500 dark:text-rose-400" : "text-emerald-500"}`}>
            {pendingActionsCount > 0 ? "Proxy ballots awaiting submission" : "All shareholder ballots up to date"}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-zinc-900/60 shadow-2xs">
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">News &amp; Media Coverage</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{liveHoldingsNews.length} Articles</p>
          <span className="text-[10px] text-emerald-500 font-bold">Verified PR Newsdesk</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-zinc-900/60 shadow-2xs">
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Regulatory Notices</span>
          <p className="text-2xl font-black text-blue-500 mt-1">{liveHoldingsNotifications.length} Notices</p>
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">Statutory Wire Filings</span>
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
              { id: "ALL", label: availableHoldings.length > 0 ? `All Holdings (${availableHoldings.length})` : "All Filings" },
              ...availableHoldings,
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
              { id: "ACTION", label: `Action Required (${pendingActionsCount})` },
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
            {(() => {
              const filtered = liveHoldingsNotifications.filter((notif) => {
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

              if (filtered.length === 0) {
                return (
                  <div className="py-10 text-center rounded-xl bg-slate-50/50 dark:bg-zinc-900/40 border border-dashed border-slate-200 dark:border-zinc-800 space-y-2 p-4">
                    <ShieldCheck className="h-6 w-6 text-slate-400 mx-auto" />
                    <p className="font-bold text-xs text-slate-700 dark:text-zinc-300">No Shareholder Notices</p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-500 max-w-xs mx-auto">
                      Official notices, proxy ballots, and compliance actions for your monitored issuers will appear here.
                    </p>
                  </div>
                )
              }

              return filtered.map((notif) => {
                const isVoted = Boolean(voteSubmittedSuccess[notif.id])
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
                          onClick={() => setActiveVoteModal(notif)}
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
                          onClick={() => setActiveDetailModal(notif)}
                          className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          {notif.actionLabel}
                          <ArrowUpRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            })()}
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
            {(() => {
              const filtered = liveHoldingsNews.filter((news) => {
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

              if (filtered.length === 0) {
                return (
                  <div className="py-10 text-center rounded-xl bg-slate-50/50 dark:bg-zinc-900/40 border border-dashed border-slate-200 dark:border-zinc-800 space-y-2 p-4">
                    <Newspaper className="h-6 w-6 text-slate-400 mx-auto" />
                    <p className="font-bold text-xs text-slate-700 dark:text-zinc-300">No News Dispatches</p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-500 max-w-xs mx-auto">
                      Press releases, earnings announcements, and regulatory filings for your monitored issuers will appear here.
                    </p>
                  </div>
                )
              }

              return filtered.map((news) => (
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
                        to={`${baseRoute}?tab=positions`}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-white font-bold text-xs transition-colors flex items-center gap-1"
                      >
                        View Position <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            })()}
          </div>
        </div>
      </div>

      {/* 1. Shareholder Proxy Voting Modal */}
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
                    {activeVoteModal.companyName} ({activeVoteModal.ticker}) · Shareholder Vote
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveVoteModal(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Verified Holding Context */}
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Verified Beneficial Holding</span>
                <span className="text-[11px] text-slate-600 dark:text-zinc-400">
                  Certificate #{activeVoteModal.id || "SEC-REG-7701"} · Verified Registry
                </span>
              </div>
              <span className="font-extrabold text-[#00d09c] text-sm">
                {activeVoteModal.holdingContext || "Active Holding"}
              </span>
            </div>

            {/* Proposal 1 */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">
                  Proposal 1: Board Slate &amp; Governance Resolutions
                </span>
                <span className="text-[10px] font-bold text-slate-500">Board Recommendation: FOR</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                {activeVoteModal.content || "Ratify annual board appointments and statutory independent oversight audit committee slate."}
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
                  Proposal 2: Unallocated Stock Option Pool Authorization
                </span>
                <span className="text-[10px] font-bold text-slate-500">Board Recommendation: FOR</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Authorize incentive equity pool expansion for senior engineering, product, and research recruitment.
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
                onClick={() => setActiveVoteModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setVoteSubmittedSuccess((prev) => ({ ...prev, [activeVoteModal.id]: true }))
                  const compName = activeVoteModal.companyName || "Issuer"
                  setActiveVoteModal(null)
                  onToast(`Proxy ballot cast successfully for ${compName}.`)
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#00d09c] hover:bg-[#00b588] text-slate-950 shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
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
                  onToast("Document downloaded successfully to your downloads folder.")
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
    </div>
  )
}
