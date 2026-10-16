import React from "react"
import { PieChart, X, Layers, CheckCircle2, DollarSign } from "lucide-react"
import type { MutualScheme } from "../../../services/explore/exploreService"

export interface ExploreSchemeModalProps {
  selectedSchemeDetail: MutualScheme | null
  onClose: () => void
  onParticipate: (scheme: MutualScheme) => void
}

export function ExploreSchemeModal({
  selectedSchemeDetail,
  onClose,
  onParticipate,
}: ExploreSchemeModalProps) {
  if (!selectedSchemeDetail) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[88vh] overflow-hidden">
        
        {/* Sticky Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-5 border-b border-slate-100 dark:border-zinc-800 shrink-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm gap-2">
          <div className="flex items-start gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <PieChart className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
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
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-1 truncate">
                {selectedSchemeDetail.name}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 truncate">
                Managed by {selectedSchemeDetail.manager}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-4">
          {/* 4-Cell Key Scheme Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <div className="p-2.5 sm:p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/40 flex flex-col justify-between">
              <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider block font-semibold leading-tight">Net Asset Value (NAV)</span>
              <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white font-mono mt-1 block">{selectedSchemeDetail.nav}</span>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/40 flex flex-col justify-between">
              <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider block font-semibold leading-tight">1-Year Return</span>
              <span className="text-sm sm:text-base font-extrabold text-emerald-600 dark:text-[#00d09c] font-mono mt-1 block">{selectedSchemeDetail.oneYearReturn}</span>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/40 flex flex-col justify-between">
              <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider block font-semibold leading-tight">Total Pool AUM</span>
              <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white font-mono mt-1 block">{selectedSchemeDetail.aum}</span>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/40 flex flex-col justify-between">
              <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider block font-semibold leading-tight">Min Investment</span>
              <span className="text-sm sm:text-base font-extrabold text-indigo-600 dark:text-indigo-400 font-mono mt-1 block">{selectedSchemeDetail.minInvestment}</span>
            </div>
          </div>

          {/* Scheme Strategy & Description */}
          <div className="space-y-1.5 sm:space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-purple-500" />
              Portfolio Mandate & Quantitative Strategy
            </h4>
            <p className="text-slate-600 dark:text-zinc-300 leading-relaxed bg-slate-50 dark:bg-zinc-800/30 p-3 sm:p-3.5 rounded-xl border border-slate-100 dark:border-zinc-800">
              {selectedSchemeDetail.description}
            </p>
          </div>

          {/* Holdings Breakdown */}
          <div className="p-3 sm:p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2.5 text-xs">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 text-xs text-slate-600 dark:text-zinc-400">
            <div className="flex items-center justify-between gap-2 p-2 sm:p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-800 min-w-0">
              <span className="truncate">Target Benchmark</span>
              <strong className="text-slate-900 dark:text-white font-mono shrink-0">{selectedSchemeDetail.benchmark}</strong>
            </div>
            <div className="flex items-center justify-between gap-2 p-2 sm:p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-800 min-w-0">
              <span className="truncate">Annual Management Ratio</span>
              <strong className="text-slate-900 dark:text-white font-mono shrink-0">{selectedSchemeDetail.expenseRatio}</strong>
            </div>
          </div>

          {/* Legal Notice */}
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 text-[11px] text-slate-500 dark:text-zinc-400 flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-slate-800 dark:text-zinc-200">Statutory Pooled Custody:</strong> All scheme units are custodied under Delaware statutory trust clearing regulations. Escrow contracts settle into authenticated institutional wallets.
            </div>
          </div>
        </div>

        {/* Sticky Actions Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm shrink-0 flex items-center justify-end gap-2 shadow-lg">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer active:scale-95"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => onParticipate(selectedSchemeDetail)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
          >
            <DollarSign className="h-3.5 w-3.5" />
            Participate in Scheme ({selectedSchemeDetail.minInvestment})
          </button>
        </div>

      </div>
    </div>
  )
}
