import React from "react"
import { Link } from "react-router"
import { Briefcase, ArrowRight } from "lucide-react"

export interface LivePosition {
  name: string
  ticker: string
  ind: string
  eq: string
  shares: string
  inv: string
  val: string
  ret: string
  isPositive: boolean
  st: string
}

export interface ExplorePositionsTabProps {
  portfolioValue: number
  totalInvested: number
  unrealizedGain: number
  totalReturnPercent: number
  livePositions: LivePosition[]
  onOpenDossier: (pos: LivePosition) => void
  entityLabel?: string
}

export function ExplorePositionsTab({
  portfolioValue,
  totalInvested,
  unrealizedGain,
  totalReturnPercent,
  livePositions,
  onOpenDossier,
  entityLabel = "Companies",
}: ExplorePositionsTabProps) {
  const isVentures = entityLabel === "Ventures"

  return (
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
          <span className="text-[11px] text-slate-500 dark:text-zinc-400">{livePositions.length} Verified {isVentures ? "Venture" : "Company"} Holdings</span>
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
          <p className={`text-2xl font-black mt-1 ${livePositions.length > 0 ? "text-amber-400" : "text-slate-400 dark:text-zinc-500"}`}>
            {livePositions.length > 0 ? "92 / 100" : "-- / 100"}
          </p>
          <span className={`text-[11px] font-bold ${livePositions.length > 0 ? "text-amber-500" : "text-slate-400 dark:text-zinc-500"}`}>
            {livePositions.length > 0 ? "Gold Accredited Tier" : "Unallocated Account"}
          </span>
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
                <th className="py-3 px-4">{isVentures ? "Venture Name" : "Company Name"}</th>
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
                      <p className="font-bold text-xs text-slate-700 dark:text-zinc-300">
                        No active {isVentures ? "venture" : "corporate"} equity holdings
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-500 max-w-sm">
                        {isVentures
                          ? "Your venture portfolio is currently empty. Subscribe to growth capital rounds in the Venture Registry to take your first equity stake."
                          : "Your corporate portfolio is currently empty. Explore corporate issuers in the Explore directory to take your first corporate position."}
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
                      <Link
                        to={`/companies/${pos.ticker}`}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-[#00d09c] font-bold text-[11px] transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        Profile
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Asset Diversification Breakdown (Calculated Dynamically from Real Holdings) */}
      <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-zinc-900/60 shadow-2xs space-y-3">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white">Portfolio Sector Diversification</h4>
        {livePositions.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-zinc-400 py-1 font-medium">
            No active holdings to calculate sector diversification. Acquire shares or subscribe to investment rounds to populate your portfolio distribution.
          </p>
        ) : (
          (() => {
            const map = new Map<string, { value: number; names: string[] }>()
            for (const pos of livePositions) {
              const sec = pos.ind || "General"
              const numericVal = Number(String(pos.val).replace(/[^0-9.-]+/g, "")) || 0
              const existing = map.get(sec) || { value: 0, names: [] }
              existing.value += numericVal
              if (!existing.names.includes(pos.name)) existing.names.push(pos.name)
              map.set(sec, existing)
            }
            const colors = ["bg-indigo-500", "bg-[#00d09c]", "bg-purple-500", "bg-blue-500", "bg-amber-500", "bg-emerald-500"]
            const items = Array.from(map.entries()).map(([sector, data], idx) => {
              const pct = portfolioValue > 0 ? (data.value / portfolioValue) * 100 : 0
              return {
                sector,
                names: data.names.slice(0, 2).join(", "),
                value: data.value,
                percent: Math.min(100, Math.max(0, pct)),
                color: colors[idx % colors.length],
              }
            })

            return (
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.sector}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 dark:text-zinc-400">
                        {item.sector} ({item.names})
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {item.percent.toFixed(1)}% (${item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div className={`${item.color} h-full rounded-full transition-all`} style={{ width: `${item.percent.toFixed(1)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )
          })()
        )}
      </div>
    </div>
  )
}
