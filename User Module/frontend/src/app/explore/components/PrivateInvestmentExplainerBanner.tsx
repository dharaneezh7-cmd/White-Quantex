import React, { useState } from "react"
import { Building2, ShieldCheck, DollarSign, ArrowRight, Info, ChevronDown, ChevronUp, CheckCircle2, Rocket, X } from "lucide-react"
import { Link } from "react-router"

export interface PrivateInvestmentExplainerBannerProps {
  compact?: boolean
  showVenturesLink?: boolean
  isVentures?: boolean
  defaultOpen?: boolean
  totalRaised?: number
  totalTarget?: number
  activeRoundsCount?: number
}

export function PrivateInvestmentExplainerBanner({
  compact = false,
  showVenturesLink = true,
  isVentures = false,
  defaultOpen = false,
  totalRaised = 88000000,
  totalTarget = 110000000,
  activeRoundsCount = 18,
}: PrivateInvestmentExplainerBannerProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [isFaqExpanded, setIsFaqExpanded] = useState(false)

  // ── COLLAPSED / CLOSED STATE ───────────────────────────────────────────────
  if (!isOpen) {
    return (
      <div className="rounded-xl border border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/80 dark:bg-zinc-900/60 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs transition-all">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-[#00d09c] shrink-0">
            {isVentures ? <Rocket className="h-4 w-4" /> : <Info className="h-4 w-4" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                About {isVentures ? "White Quantex Ventures" : "Explore"}
              </span>
              <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-emerald-500/10 text-emerald-700 dark:text-[#00d09c] border border-emerald-500/20">
                {isVentures ? "Direct Venture Capital" : "Direct Private Capital"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate hidden sm:block">
              {isVentures
                ? "Direct venture allocation into vetted startups raising growth rounds — not public stock trading."
                : "Direct private investment into verified operating companies raising capital — not public stock trading."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-zinc-950 hover:bg-slate-800 dark:hover:bg-zinc-100 transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-xs cursor-pointer active:scale-95"
        >
          <span>About the Page</span>
          <span className="px-1.5 py-0.2 text-[9px] rounded font-extrabold uppercase bg-emerald-500 text-black">
            Open
          </span>
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  // ── EXPANDED / OPEN STATE ──────────────────────────────────────────────────
  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 via-slate-900/60 to-indigo-950/20 dark:from-emerald-950/40 dark:via-zinc-900/80 dark:to-indigo-950/40 p-4 sm:p-5 shadow-sm text-slate-900 dark:text-white animate-in fade-in duration-200">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-[#00d09c] border border-emerald-500/30 flex items-center gap-1.5">
              <ShieldCheck className="h-3 w-3" />
              <span>{isVentures ? "Direct Venture Investment" : "Direct Corporate Investment"}</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
              Not Public Stock Exchange Trading
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2 pt-0.5">
            <span>
              {isVentures
                ? "About White Quantex Ventures: Direct Growth Capital & Syndicates"
                : "About Explore: Direct Private Capital & Expansion Rounds"}
            </span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-zinc-300 max-w-3xl leading-relaxed">
            In <strong>{isVentures ? "Ventures" : "Explore"}</strong>, you are <strong>not buying retail company stock</strong>. 
            You are investing directly into private {isVentures ? "venture-backed startups" : "operating companies"} raising growth capital for corporate development, technological R&amp;D, and expansion.
            Each {isVentures ? "venture" : "company"} defines its own <strong>minimum investment amount</strong> required to participate and become a registered <strong>Private Investor</strong>.
          </p>
        </div>

        {/* Action Controls: Close Button */}
        <div className="flex items-center gap-2 shrink-0 self-start">
          {showVenturesLink && !isVentures && (
            <Link
              to="/ventures"
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#00d09c] hover:bg-[#00b888] text-slate-950 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span>Ventures</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            aria-label="Close about the page"
          >
            <span>Close</span>
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 3 Core Rule Highlights */}
      {!compact && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-200/60 dark:border-zinc-800/80 relative z-10">
          <div className="p-3 rounded-xl bg-white/70 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-700/50 space-y-1">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-[#00d09c]">
              <Building2 className="h-4 w-4 shrink-0" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Direct Growth Funding</h3>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
              Capital goes directly to corporate treasuries to finance R&amp;D, facility deployment, and commercial scaling.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white/70 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-700/50 space-y-1">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <DollarSign className="h-4 w-4 shrink-0" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                {isVentures ? "Venture-Set Minimums" : "Company-Set Minimums"}
              </h3>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
              Issuers set a specific minimum investment (e.g. $10K, $25K, $50K). You must meet this threshold to join the {isVentures ? "venture round" : "round"}.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white/70 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-700/50 space-y-1">
            <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Verified Private Investor</h3>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
              Investors receive an official Delaware statutory shareholder subscription certificate and direct investor updates.
            </p>
          </div>
        </div>
      )}

      {/* If Ventures: Live Metrics Bar inside expanded About */}
      {isVentures && (
        <div className="mt-3.5 pt-3 border-t border-slate-200/60 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono relative z-10">
          <div className="flex items-center gap-4 sm:gap-6">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">Total Capital Raised</span>
              <span className="text-xs sm:text-sm font-extrabold text-[#00d09c]">
                ${(totalRaised / 1000000).toFixed(1)}M
              </span>
            </div>
            <div className="h-7 w-[1px] bg-slate-300 dark:bg-zinc-700" />
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">Active Rounds</span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                {activeRoundsCount} Registered Ventures
              </span>
            </div>
            <div className="h-7 w-[1px] bg-slate-300 dark:bg-zinc-700" />
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">Round Capacity</span>
              <span className="text-xs sm:text-sm font-extrabold text-indigo-500 dark:text-indigo-400">
                ${(totalTarget / 1000000).toFixed(1)}M Goal
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Expandable Legal & Execution Details */}
      <div className="mt-3 pt-2 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setIsFaqExpanded(!isFaqExpanded)}
          className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <Info className="h-3.5 w-3.5 text-emerald-500" />
          <span>How does private {isVentures ? "venture" : "corporate"} investing work on White Quantex?</span>
          <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isFaqExpanded ? "rotate-180" : ""}`} />
        </button>

        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white flex items-center gap-1 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <X className="h-3.5 w-3.5" />
          <span>Close About</span>
        </button>
      </div>

      {isFaqExpanded && (
        <div className="mt-2.5 p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 text-xs text-slate-700 dark:text-zinc-300 space-y-2 animate-in fade-in duration-200 relative z-10">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#00d09c] shrink-0 mt-0.5" />
            <p>
              <strong>Capital Allocation, Not Brokerage Trading:</strong> Unlike secondary public markets with bid/ask spreads, you enter into a private subscription agreement directly with the issuing {isVentures ? "venture" : "company"}.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#00d09c] shrink-0 mt-0.5" />
            <p>
              <strong>Minimum Commitment Enforcement:</strong> Because each round represents a structured private equity issuance, companies enforce a minimum allocation amount. Submissions below the issuer-defined minimum cannot be approved.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#00d09c] shrink-0 mt-0.5" />
            <p>
              <strong>Investor Rights &amp; Transparency:</strong> As a verified private investor, you obtain legal rights under the issuer&apos;s Delaware charter, quarterly financial dispatches, and private investor hub privileges.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export { PrivateInvestmentExplainerBanner as AboutThisPageBanner }
