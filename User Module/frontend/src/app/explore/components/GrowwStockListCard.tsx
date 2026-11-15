import React from "react"
import { ArrowRight } from "lucide-react"

interface GrowwStockItem {
  id?: string
  ticker: string
  name: string
  shortName?: string
  sector?: string
  logoColor?: string
  price: string | number
  changePercent: string | number
  isPositive: boolean
  sparklineHash?: number
}

interface GrowwStockListCardProps {
  title: string
  icon?: React.ReactNode
  items: GrowwStockItem[]
  onSeeAll?: () => void
  onSelect?: (item: GrowwStockItem) => void
}

// ── Palette of vivid background colors for round badges ─────────────────────
const AVATAR_PALETTE = [
  "#00875a", // Emerald/Teal (No)
  "#8b5cf6", // Purple (Or)
  "#0284c7", // Sky/Blue (Ap)
  "#e11d48", // Crimson (Co)
  "#ea580c", // Orange (Te)
  "#059669", // Mint Green
  "#d97706", // Amber
  "#4f46e5", // Indigo
  "#db2777", // Rose Pink
  "#0891b2", // Cyan
]

function getAvatarInitials(name?: string, ticker?: string): string {
  const source = (name || ticker || "").trim()
  // Strip non-alpha characters at start
  const clean = source.replace(/^[^a-zA-Z]+/, "")
  if (clean.length >= 2) {
    return clean.slice(0, 1).toUpperCase() + clean.slice(1, 2).toLowerCase()
  }
  return (ticker || "WQ").slice(0, 2)
}

function getAvatarColor(ticker: string, index: number): string {
  return AVATAR_PALETTE[index % AVATAR_PALETTE.length]
}

// ── Mini SVG Sparkline matching Groww aesthetic ─────────────────────────────
function GrowwSparkline({
  hash,
  positive,
  width = 80,
  height = 32,
}: {
  hash: number
  positive: boolean
  width?: number
  height?: number
}) {
  const points = React.useMemo(() => {
    // Generate an oscillating wave path like Groww chart
    const pts: number[] = []
    const seed = Math.abs(hash) % 7
    // Typical patterns seen in Groww: valley, peak, valley, peak
    const patterns = [
      [35, 15, 45, 10, 50, 20, 55, 30, 12],
      [15, 40, 20, 50, 25, 45, 10, 35, 10],
      [40, 15, 35, 55, 20, 50, 15, 40, 12],
      [20, 50, 15, 45, 30, 55, 18, 35, 15],
      [45, 20, 48, 15, 55, 22, 50, 15, 12],
    ]
    const basePattern = patterns[seed % patterns.length]
    for (let i = 0; i < basePattern.length; i++) {
      pts.push(basePattern[i])
    }
    return pts
  }, [hash])

  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = max - min || 1
  const svgPoints = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * width
      const y = positive
        ? height - ((p - min) / range) * (height - 8) - 4
        : ((p - min) / range) * (height - 8) + 4
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(" ")

  const strokeColor = positive ? "#10b981" : "#f43f5e"

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="shrink-0 overflow-visible"
    >
      <polyline
        points={svgPoints}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.65"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function GrowwStockListCard({
  title,
  icon,
  items,
  onSeeAll,
  onSelect,
}: GrowwStockListCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 p-4 sm:p-5 shadow-xs transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-2">
          {icon || <span className="text-base select-none">🔥 🔥</span>}
          <h3 className="font-extrabold text-[15px] sm:text-base text-slate-900 dark:text-white tracking-tight">
            {title.replace(/^🔥\s*🔥\s*/, "")}
          </h3>
        </div>
        {onSeeAll && (
          <button
            type="button"
            onClick={onSeeAll}
            className="text-xs sm:text-[13px] font-semibold text-emerald-600 dark:text-[#00d09c] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>See all</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Items List */}
      <div className="divide-y divide-slate-100 dark:divide-zinc-800/60">
        {items.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400 dark:text-zinc-500">
            No active market items available.
          </div>
        ) : (
          items.map((item, idx) => {
            const hash =
              item.sparklineHash ||
              (item.ticker || "WQ")
                .split("")
                .reduce((a, c) => a + c.charCodeAt(0), 0)
            const priceNum =
              typeof item.price === "number"
                ? item.price
                : parseFloat(String(item.price).replace(/[^0-9.-]/g, "")) || 0
            const changePercentNum =
              typeof item.changePercent === "number"
                ? item.changePercent
                : parseFloat(
                    String(item.changePercent).replace(/[^0-9.-]/g, "")
                  ) || 0
            const isPositive = item.isPositive ?? changePercentNum >= 0
            const initials = getAvatarInitials(item.name || item.shortName, item.ticker)
            const avatarBg = getAvatarColor(item.ticker, idx)

            return (
              <div
                key={item.id || item.ticker}
                onClick={() => onSelect && onSelect(item)}
                className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-zinc-900/50 -mx-2 px-2 rounded-xl transition-colors cursor-pointer group"
              >
                {/* Left: Avatar + Ticker & Name */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    style={{ backgroundColor: avatarBg }}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-[13px] text-white shrink-0 shadow-xs"
                  >
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <div className="font-extrabold text-xs sm:text-[13px] text-slate-900 dark:text-white font-sans tracking-tight group-hover:text-emerald-600 dark:group-hover:text-[#00d09c] transition-colors truncate">
                      {item.ticker}
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-zinc-400 truncate max-w-[130px] sm:max-w-[190px]">
                      {item.name || item.shortName}
                    </div>
                  </div>
                </div>

                {/* Center: Sparkline graph */}
                <div className="hidden sm:block shrink-0 px-2">
                  <GrowwSparkline
                    hash={hash}
                    positive={isPositive}
                    width={80}
                    height={30}
                  />
                </div>

                {/* Right: Price & Change */}
                <div className="text-right shrink-0">
                  <div className="font-extrabold font-mono text-xs sm:text-sm text-slate-900 dark:text-white">
                    ${priceNum.toFixed(2)}
                  </div>
                  <div
                    className={`text-[11px] font-bold font-mono ${
                      isPositive
                        ? "text-emerald-500 dark:text-[#00d09c]"
                        : "text-rose-500"
                    }`}
                  >
                    {isPositive ? "" : "-"}
                    {Math.abs(changePercentNum).toFixed(2)}%
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
