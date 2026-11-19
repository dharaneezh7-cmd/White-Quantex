import React from "react"
import { type StockTableItem } from "./StockScreenerTable"

interface StockMetricCardsProps {
  items: StockTableItem[]
  watchlist: string[]
  onToggleWatchlist: (symbol: string) => void
  onSelectStock: (symbol: string) => void
}

function StockSparkline({
  ticker,
  positive,
  width = 120,
  height = 40,
}: {
  ticker: string
  positive: boolean
  width?: number
  height?: number
}) {
  const points = React.useMemo(() => {
    const hash = ticker.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
    const pts: number[] = []
    let val = 50
    for (let i = 0; i < 14; i++) {
      val += ((hash * (i + 3) * 7) % 15) - 7
      pts.push(Math.max(12, Math.min(88, val)))
    }
    if (positive && pts[pts.length - 1] < pts[0]) {
      pts[pts.length - 1] = pts[0] + 14
    } else if (!positive && pts[pts.length - 1] > pts[0]) {
      pts[pts.length - 1] = Math.max(10, pts[0] - 14)
    }
    return pts
  }, [ticker, positive])

  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = max - min || 1

  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * width
    const y = height - ((p - min) / range) * (height - 8) - 4
    return { x, y }
  })

  const lineD = coords.reduce((acc, pt, i) => {
    return i === 0
      ? `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`
      : `${acc} L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`
  }, "")

  const bottomY = height
  const fillD = `${lineD} L ${width} ${bottomY} L 0 ${bottomY} Z`
  const color = positive ? "#00d09c" : "#f43f5e"
  const gradId = `spark_${ticker.replace(/[^a-zA-Z0-9]/g, "")}`

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-full overflow-visible"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.00" />
        </linearGradient>
      </defs>
      <path d={fillD} fill={`url(#${gradId})`} />
      <path
        d={lineD}
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function StockMetricCards({
  items,
  watchlist,
  onToggleWatchlist,
  onSelectStock,
}: StockMetricCardsProps) {
  if (items.length === 0) {
    return (
      <div className="py-16 text-center text-slate-400 dark:text-zinc-500 bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800">
        <p className="font-semibold text-sm text-slate-600 dark:text-zinc-300">
          No stock instruments match your criteria
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {items.map((item) => (
        <div
          key={item.id || item.ticker}
          onClick={() => onSelectStock(item.ticker)}
          className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 hover:border-[#00d09c]/60 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          {/* Top: Logo + Ticker + Price + Change */}
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-black text-[11px] sm:text-xs text-white shrink-0 shadow-xs ${item.logoColor}`}
              >
                {item.ticker.slice(0, 2)}
              </div>
              <div className="min-w-0">
                <span className="font-mono font-black text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-[#00d09c] transition-colors truncate block">
                  {item.ticker}
                </span>
                <span className="font-mono font-extrabold text-[11px] sm:text-xs text-slate-800 dark:text-zinc-200 block">
                  ${item.price.toFixed(2)}
                </span>
              </div>
            </div>

            <span
              className={`font-mono text-[10px] sm:text-[11px] font-bold px-1.5 py-0.5 rounded ${
                item.isPositive
                  ? "text-emerald-600 dark:text-[#00d09c] bg-emerald-500/10"
                  : "text-rose-600 dark:text-rose-400 bg-rose-500/10"
              }`}
            >
              {item.isPositive ? "+" : "-"}
              {Math.abs(item.changePercent).toFixed(1)}%
            </span>
          </div>

          {/* Graph: Clean Mini Sparkline */}
          <div className="mt-2.5 h-11 sm:h-12 w-full">
            <StockSparkline ticker={item.ticker} positive={item.isPositive} />
          </div>
        </div>
      ))}
    </div>
  )
}
