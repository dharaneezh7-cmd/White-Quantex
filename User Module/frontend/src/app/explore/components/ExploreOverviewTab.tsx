import React, { useRef } from "react"
import { Link } from "react-router"
import {
  Eye,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Layers,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Flame,
  Activity,
  Sparkles,
  SlidersHorizontal,
  Calculator,
  Calendar,
  Award,
  PieChart,
  ArrowRight,
} from "lucide-react"
import { getCompanyLogoStyle } from "../utils/exploreUtils"
import { CategoryExplanationBox } from "./CategoryExplanationBox"
import { PrivateInvestmentExplainerBanner } from "./PrivateInvestmentExplainerBanner"
import { getCompanyInvestmentDetails } from "../../../services/explore/exploreService"
import type { UpcomingCompany, WqRecommendation, MutualScheme } from "../../../services/explore/exploreService"

export interface ExploreOverviewTabProps {
  liveRecentlyViewed: any[]
  liveMostInvested: any[]
  liveTopGainers: any[]
  liveLeastInvested: any[]
  liveTopLosers: any[]
  liveMostActive: any[]
  liveNewHighs: any[]
  liveRecentlyAdded: any[]
  liveUpcoming: UpcomingCompany[]
  liveRecommendations: WqRecommendation[]
  liveSchemes: MutualScheme[]
  allCompanies: any[]
  toolsList: any[]
  showAllSections: boolean
  handleToggleViewAll: () => void
  showAllRecentlyAdded: boolean
  setShowAllRecentlyAdded: React.Dispatch<React.SetStateAction<boolean>>
  showAllUpcoming: boolean
  setShowAllUpcoming: React.Dispatch<React.SetStateAction<boolean>>
  showAllRecommendations: boolean
  setShowAllRecommendations: React.Dispatch<React.SetStateAction<boolean>>
  showAllSchemes: boolean
  setShowAllSchemes: React.Dispatch<React.SetStateAction<boolean>>
  screenerSector: string
  setScreenerSector: (val: string) => void
  screenerTier: string
  setScreenerTier: (val: string) => void
  screenerValuation: string
  setScreenerValuation: (val: string) => void
  setSearchParams: (params: any) => void
  onSelectCompany: (comp: any) => void
  onSelectScheme: (scheme: MutualScheme) => void
  baseRoute?: string
  entityLabel?: string
}

export function ExploreOverviewTab({
  liveRecentlyViewed,
  liveMostInvested,
  liveTopGainers,
  liveLeastInvested,
  liveTopLosers,
  liveMostActive,
  liveNewHighs,
  liveRecentlyAdded,
  liveUpcoming,
  liveRecommendations,
  liveSchemes,
  allCompanies,
  toolsList,
  showAllSections,
  handleToggleViewAll,
  showAllRecentlyAdded,
  setShowAllRecentlyAdded,
  showAllUpcoming,
  setShowAllUpcoming,
  showAllRecommendations,
  setShowAllRecommendations,
  showAllSchemes,
  setShowAllSchemes,
  screenerSector,
  setScreenerSector,
  screenerTier,
  setScreenerTier,
  screenerValuation,
  setScreenerValuation,
  setSearchParams,
  onSelectCompany,
  onSelectScheme,
  baseRoute = "/explore",
  entityLabel,
}: ExploreOverviewTabProps) {
  const marketMoversRef = useRef<HTMLDivElement>(null)
  const isVentures = baseRoute === "/ventures" || entityLabel?.toLowerCase().includes("venture")
  const currentEntityLabel = entityLabel || (isVentures ? "Ventures" : "Companies")
  const entityLower = currentEntityLabel.toLowerCase()

  return (
    <>
      {/* ── Direct Private Capital Explainer Banner (About the Page with Open & Close) ── */}
      <PrivateInvestmentExplainerBanner
        isVentures={isVentures}
        showVenturesLink={!isVentures}
        activeRoundsCount={isVentures ? allCompanies.length : 18}
      />

      {/* ROW 2: Show all the Recently Viewed companies / ventures (Full Width) */}
      <div className="p-3.5 sm:p-4 space-y-3 bg-white dark:bg-zinc-900/40 border border-slate-200/80 dark:border-zinc-800/60 rounded-2xl shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-emerald-500/10 flex items-center justify-center">
              <Eye className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Recently Viewed {currentEntityLabel}</h3>
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
              No recently viewed {entityLower} yet. Browse the Master Index or Sector categories to explore venture dossiers.
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
                  onSelectCompany(profile)
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
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Todays Most Invested {currentEntityLabel}</h3>
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
                    onSelectCompany(profile)
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
                    onSelectCompany(profile)
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
      <div
        ref={marketMoversRef}
        className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900/40 border border-slate-200/80 dark:border-zinc-800/60 shadow-xs"
      >
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
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Todays Least Invested {currentEntityLabel}</h3>
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
                        onSelectCompany(profile)
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
                        onSelectCompany(profile)
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
                        onSelectCompany(profile)
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
                        onSelectCompany(profile)
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
              onClick={() => {
                handleToggleViewAll()
                marketMoversRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
              }}
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
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">Filter operating {entityLower} by sector, trading status, and valuation</p>
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
                Matches: <strong className="text-slate-900 dark:text-white">25 verified {entityLower}</strong>
              </span>
              <Link
                to={`${baseRoute}?tab=index`}
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
              Recently Added {currentEntityLabel}
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Newly registered and verified operating {entityLower} on White Quantex
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
              to={`${baseRoute}?tab=index`}
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

                {/* Company Defined Min Investment & Round */}
                {(() => {
                  const inv = getCompanyInvestmentDetails(comp)
                  return (
                    <div className="mt-2.5 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-[11px]">
                      <span className="text-slate-600 dark:text-zinc-300 font-semibold flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Min. Ticket: <strong className="text-emerald-700 dark:text-[#00d09c] font-mono">{inv.minInvestment}</strong>
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400">
                        {inv.roundType}
                      </span>
                    </div>
                  )
                })()}
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
                <div className="flex items-center gap-1.5">
                  <Link
                    to={`/companies/${comp.ticker || comp.id}`}
                    className="px-3.5 py-1.5 rounded-lg bg-[#00d09c] hover:bg-[#00b888] text-slate-950 font-black text-xs transition-colors flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
                  >
                    <span>View Profile</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
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
                Upcoming {currentEntityLabel}
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
                    onSelectCompany(profile)
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
                WQ Recommendation {currentEntityLabel}
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
                      onSelectCompany(profile)
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
                  onClick={() => onSelectScheme(scheme)}
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
  )
}
