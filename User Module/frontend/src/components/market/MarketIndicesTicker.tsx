import React from "react"
import { TrendingUp, TrendingDown, Activity, ShieldCheck } from "lucide-react"
import { type MarketIndex } from "../../services/market/useMarketPrices"

interface MarketIndicesTickerProps {
  indices: MarketIndex[]
  isConnected: boolean
  lastTick: number
}

export function MarketIndicesTicker({
  indices,
  isConnected,
  lastTick,
}: MarketIndicesTickerProps) {
  const displayIndices =
    indices && indices.length > 0
      ? indices
      : [
          { symbol: "WQ100", name: "WQ Composite 100", value: 4892.4, valueStr: "4,892.40", changePercent: 1.24, changeStr: "+1.24%", isPositive: true, volume: "$1.48B" },
          { symbol: "WQAI", name: "WQ DeepTech AI Index", value: 6214.15, valueStr: "6,214.15", changePercent: 2.01, changeStr: "+2.01%", isPositive: true, volume: "$642.1M" },
          { symbol: "WQXF", name: "WQ Fintech 25", value: 3410.8, valueStr: "3,410.80", changePercent: -0.42, changeStr: "-0.42%", isPositive: false, volume: "$489.3M" },
          { symbol: "WQGRN", name: "WQ CleanEnergy", value: 1984.3, valueStr: "1,984.30", changePercent: 0.78, changeStr: "+0.78%", isPositive: true, volume: "$310.5M" },
        ]

  return (
    <div className="w-full bg-transparent rounded-lg border border-slate-200 dark:border-zinc-800/80 p-1.5 sm:px-3 sm:py-1.5 space-y-1.5">
      {/* Top Telemetry Strip */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px] sm:text-[11px] font-mono border-b border-slate-200/80 dark:border-zinc-800/80 pb-1 text-slate-500 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isConnected ? "bg-emerald-400" : "bg-amber-400"} opacity-75`} />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? "bg-emerald-500" : "bg-amber-500"}`} />
          </span>
          <span className="font-bold tracking-wide uppercase text-slate-800 dark:text-zinc-200">
            WQX Private Exchange
          </span>
          <span className="text-slate-300 dark:text-zinc-700">•</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
            MARKET OPEN
          </span>
          <span className="text-slate-300 dark:text-zinc-700 hidden sm:inline">•</span>
          <span className="text-slate-400 dark:text-zinc-500 hidden sm:inline font-mono">
            09:30 – 16:00 EST
          </span>
        </div>

        <div className="flex items-center gap-2.5 font-mono text-[10px]">
          <div className="flex items-center gap-1 text-slate-500 dark:text-zinc-400">
            <Activity className="h-3 w-3 text-[#00d09c]" />
            <span>SSE Feed {isConnected ? "Live" : "Polling"}</span>
            {lastTick > 0 && <span className="text-slate-400 dark:text-zinc-500">#{lastTick}</span>}
          </div>
          <span className="text-slate-300 dark:text-zinc-700">|</span>
          <div className="flex items-center gap-1 text-slate-500 dark:text-zinc-400">
            <ShieldCheck className="h-3 w-3 text-blue-500 dark:text-blue-400" />
            <span className="hidden sm:inline">PostgreSQL Authoritative</span>
          </div>
        </div>
      </div>

      {/* Indices Compact Cards Grid: Just Name and Day Returns with Percentage */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {displayIndices.map((idx) => {
          const isPos = idx.isPositive
          const changePct = idx.changePercent || 0
          const dayReturnNum = idx.value ? idx.value * (changePct / 100) : 0
          const sign = changePct >= 0 ? "+" : ""
          const dayReturnStr = `${sign}${dayReturnNum.toFixed(2)} (${idx.changeStr || `${sign}${changePct.toFixed(2)}%`})`

          return (
            <div
              key={idx.symbol}
              className="rounded-lg border border-slate-200/90 dark:border-zinc-800/80 bg-white/40 dark:bg-zinc-900/40 hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors px-2.5 py-1.5 flex items-center justify-between gap-2 min-w-0 shadow-2xs"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-semibold text-xs text-slate-900 dark:text-zinc-100 truncate" title={idx.name}>
                  {idx.name}
                </span>
              </div>
              <span
                className={`inline-flex items-center gap-1 font-mono text-[11px] sm:text-xs font-bold px-1.5 py-0.5 rounded shrink-0 ${
                  isPos
                    ? "text-emerald-600 dark:text-[#00d09c] bg-emerald-500/10"
                    : "text-rose-600 dark:text-rose-400 bg-rose-500/10"
                }`}
              >
                {isPos ? <TrendingUp className="h-3 w-3 shrink-0" /> : <TrendingDown className="h-3 w-3 shrink-0" />}
                <span>{dayReturnStr}</span>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
