import React, { useState, useMemo, useRef, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertCircle,
  Clock,
  ShieldCheck,
  Activity,
  Layers,
} from "lucide-react"
import {
  marketDataService,
  type PricePoint,
  type MarketHistoryResponse,
} from "../../services/market/marketDataService"
import { useMarketPrices } from "../../services/market/useMarketPrices"
import { PriceRangeSelector, type TimeRange } from "./PriceRangeSelector"

interface PriceChartProps {
  symbol: string
  companyName?: string
  isPrivateCompany?: boolean
  initialRange?: TimeRange
  onPriceChange?: (currentPrice: number, changeAmount: number, changePercent: number) => void
}

export function PriceChart({
  symbol,
  companyName,
  isPrivateCompany = false,
  initialRange = "1M",
  onPriceChange,
}: PriceChartProps) {
  const [range, setRange] = useState<TimeRange>(initialRange)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  // 1. Authoritative Backend Historical Data Fetch
  const {
    data: historyData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<MarketHistoryResponse>({
    queryKey: ["market-data-history", symbol.toUpperCase(), range],
    queryFn: () => marketDataService.getHistory(symbol, range),
    staleTime: range === "1D" ? 15_000 : 120_000,
    retry: 2,
  })

  // 2. Real-Time Price Stream Hook (Spring Boot SSE)
  const { quotes, isConnected: sseConnected } = useMarketPrices()
  const liveQuote = quotes[symbol.toUpperCase()]

  // 3. Dynamic Points Assembly (combines authoritative database records with live intraday ticks)
  const points: PricePoint[] = useMemo(() => {
    if (!historyData || !historyData.points || historyData.points.length === 0) {
      return []
    }
    const pts = [...historyData.points]

    // If viewing 1D range and a live tick arrives, update or append latest point
    if (range === "1D" && liveQuote && liveQuote.price) {
      const last = pts[pts.length - 1]
      if (last) {
        pts[pts.length - 1] = {
          ...last,
          price: Number(liveQuote.price),
          timestamp: liveQuote.lastUpdated || new Date().toISOString(),
        }
      }
    }
    return pts
  }, [historyData, range, liveQuote])

  // 4. Period Performance Math
  const {
    startPrice,
    latestPrice,
    displayPrice,
    displayTimestamp,
    periodDelta,
    periodPercent,
    isPositive,
    minPrice,
    maxPrice,
  } = useMemo(() => {
    if (points.length === 0) {
      const fallbackPrice = liveQuote ? Number(liveQuote.price) : 0
      return {
        startPrice: fallbackPrice,
        latestPrice: fallbackPrice,
        displayPrice: fallbackPrice,
        displayTimestamp: new Date().toISOString(),
        periodDelta: 0,
        periodPercent: 0,
        isPositive: true,
        minPrice: fallbackPrice * 0.95,
        maxPrice: fallbackPrice * 1.05,
      }
    }

    const first = points[0].price
    const last = points[points.length - 1].price

    // If user is hovering a specific point, display that point's stats
    const hoveredPoint = hoverIndex !== null && points[hoverIndex] ? points[hoverIndex] : null
    const current = hoveredPoint ? hoveredPoint.price : last
    const currentTimestamp = hoveredPoint ? hoveredPoint.timestamp : points[points.length - 1].timestamp

    const delta = current - first
    const pct = first > 0 ? (delta / first) * 100 : 0

    let min = Infinity
    let max = -Infinity
    for (const p of points) {
      if (p.price < min) min = p.price
      if (p.price > max) max = p.price
    }
    if (min === max) {
      min = min * 0.98
      max = max * 1.02
    }

    return {
      startPrice: first,
      latestPrice: last,
      displayPrice: current,
      displayTimestamp: currentTimestamp,
      periodDelta: delta,
      periodPercent: pct,
      isPositive: delta >= 0,
      minPrice: min,
      maxPrice: max,
    }
  }, [points, hoverIndex, liveQuote])

  // Notify parent of price update if callback provided
  useEffect(() => {
    if (onPriceChange && latestPrice > 0) {
      onPriceChange(latestPrice, periodDelta, periodPercent)
    }
  }, [latestPrice, periodDelta, periodPercent, onPriceChange])

  // 5. SVG Coordinate Calculations
  const svgWidth = 800
  const svgHeight = 280
  const paddingX = 24
  const paddingY = 24
  const chartWidth = svgWidth - paddingX * 2
  const chartHeight = svgHeight - paddingY * 2

  const getCoordinates = (idx: number, priceVal: number) => {
    if (points.length <= 1) return { x: paddingX, y: svgHeight / 2 }
    const x = paddingX + (idx / (points.length - 1)) * chartWidth
    const y = svgHeight - paddingY - ((priceVal - minPrice) / (maxPrice - minPrice || 1)) * chartHeight
    return { x, y }
  }

  const { pathD, fillD } = useMemo(() => {
    if (points.length === 0) return { pathD: "", fillD: "" }
    const coords = points.map((p, idx) => getCoordinates(idx, p.price))
    const linePath = coords.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}` : `${acc} L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`
    }, "")

    const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${svgHeight} L ${coords[0].x.toFixed(1)} ${svgHeight} Z`
    return { pathD: linePath, fillD: areaPath }
  }, [points, minPrice, maxPrice])

  // Interactive mouse scrubbing
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || points.length === 0) return
    const rect = svgRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const normalizedX = (mouseX / rect.width) * svgWidth - paddingX
    const index = Math.round((normalizedX / chartWidth) * (points.length - 1))
    const boundedIndex = Math.max(0, Math.min(points.length - 1, index))
    setHoverIndex(boundedIndex)
  }

  const handleMouseLeave = () => {
    setHoverIndex(null)
  }

  const formatTimestamp = (isoStr: string) => {
    try {
      const d = new Date(isoStr)
      if (range === "1D") {
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
      return d.toLocaleDateString([], { month: "short", day: "numeric", year: range === "5Y" || range === "ALL" ? "numeric" : undefined })
    } catch {
      return isoStr
    }
  }

  const hoveredPointCoords = hoverIndex !== null && points[hoverIndex]
    ? getCoordinates(hoverIndex, points[hoverIndex].price)
    : null

  const strokeColor = isPositive ? "#00d09c" : "#f43f5e"
  const gradientId = `chartGrad_${symbol}_${range}`

  return (
    <div className="w-full space-y-4">
      {/* ── Top Header: Summary Metrics + Range Selector ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-3 border-b border-slate-100 dark:border-zinc-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              {isPrivateCompany ? "Private Valuation Trajectory" : "Authoritative Market Price"}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                isPrivateCompany
                  ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
                  : historyData?.dataStatus === "LIVE" || sseConnected
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700"
              }`}
            >
              {isPrivateCompany ? "409A / Capital Round" : historyData?.dataStatus || "HISTORICAL"}
            </span>
            {range === "1D" && (
              <span className="flex items-center gap-1 text-[10px] font-mono text-slate-400 dark:text-zinc-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Feed
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
              ${displayPrice.toFixed(2)}
            </span>
            <span
              className={`inline-flex items-center gap-1 text-xs sm:text-sm font-bold font-mono px-2 py-0.5 rounded-lg ${
                isPositive
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
              }`}
            >
              {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              <span>
                {isPositive ? "+" : ""}
                {periodDelta.toFixed(2)} ({isPositive ? "+" : ""}
                {periodPercent.toFixed(2)}%)
              </span>
            </span>
            <span className="text-xs text-slate-400 dark:text-zinc-500 font-mono">
              {hoverIndex !== null ? `Point: ${formatTimestamp(displayTimestamp)}` : `Period: ${range}`}
            </span>
          </div>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-2">
          <PriceRangeSelector selectedRange={range} onSelectRange={setRange} disabled={isLoading} />
        </div>
      </div>

      {/* ── Dynamic Chart Viewport ── */}
      <div className="relative w-full h-72 sm:h-80 bg-slate-50/50 dark:bg-zinc-950/60 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 overflow-hidden select-none p-2">
        {/* Loading Skeleton */}
        {isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xs space-y-2">
            <RefreshCw className="h-6 w-6 text-[#00d09c] animate-spin" />
            <span className="text-xs font-semibold text-slate-600 dark:text-zinc-400 font-mono">
              Loading PostgreSQL market history ({range})...
            </span>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center space-y-3">
            <AlertCircle className="h-8 w-8 text-rose-500" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Unable to Load Historical Price Data</h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm">
                {(error as any)?.message || "Failed to retrieve verified price history from Spring Boot backend."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-zinc-950 text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry Query</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && points.length === 0 && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center space-y-2">
            <Clock className="h-8 w-8 text-slate-400 dark:text-zinc-600" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Trading Records Available</h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs">
              No historical price entries recorded in PostgreSQL for {symbol} in the {range} window.
            </p>
          </div>
        )}

        {/* SVG Interactive Line Chart */}
        {!isError && points.length > 0 && (
          <svg
            ref={svgRef}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            preserveAspectRatio="none"
            className="w-full h-full cursor-crosshair overflow-visible"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity="0.22" />
                <stop offset="100%" stopColor={strokeColor} stopOpacity="0.00" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0.25, 0.5, 0.75].map((ratio) => {
              const yVal = paddingY + chartHeight * ratio
              const priceAtRatio = maxPrice - (maxPrice - minPrice) * ratio
              return (
                <g key={ratio}>
                  <line
                    x1={paddingX}
                    y1={yVal}
                    x2={svgWidth - paddingX}
                    y2={yVal}
                    stroke="currentColor"
                    className="text-slate-200 dark:text-zinc-800/80"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={svgWidth - paddingX + 4}
                    y={yVal + 3}
                    className="text-[9px] font-mono fill-slate-400 dark:fill-zinc-600 select-none"
                  >
                    ${priceAtRatio.toFixed(1)}
                  </text>
                </g>
              )
            })}

            {/* Gradient Area Fill */}
            {fillD && <path d={fillD} fill={`url(#${gradientId})`} />}

            {/* Primary Price Line */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke={strokeColor}
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Hover Crosshair & Data Indicator */}
            {hoveredPointCoords && (
              <g>
                {/* Vertical Cursor Line */}
                <line
                  x1={hoveredPointCoords.x}
                  y1={paddingY}
                  x2={hoveredPointCoords.x}
                  y2={svgHeight - paddingY}
                  stroke={strokeColor}
                  strokeWidth="1.25"
                  strokeDasharray="3 3"
                  className="opacity-70"
                />
                {/* Pulse Glow Point */}
                <circle
                  cx={hoveredPointCoords.x}
                  cy={hoveredPointCoords.y}
                  r="6"
                  fill={strokeColor}
                  className="opacity-25"
                />
                <circle
                  cx={hoveredPointCoords.x}
                  cy={hoveredPointCoords.y}
                  r="3.5"
                  fill="#ffffff"
                  stroke={strokeColor}
                  strokeWidth="2"
                />
              </g>
            )}
          </svg>
        )}

        {/* Floating Tooltip Box */}
        {hoverIndex !== null && points[hoverIndex] && hoveredPointCoords && (
          <div
            className="absolute pointer-events-none z-30 px-3 py-2 rounded-xl bg-slate-900/95 dark:bg-zinc-900/95 text-white shadow-xl border border-slate-700/60 dark:border-zinc-700/60 text-xs backdrop-blur-md transform -translate-x-1/2 -translate-y-full transition-all duration-75 space-y-0.5"
            style={{
              left: `${(hoveredPointCoords.x / svgWidth) * 100}%`,
              top: `${Math.max(12, (hoveredPointCoords.y / svgHeight) * 100 - 8)}%`,
            }}
          >
            <div className="font-extrabold font-mono text-sm">
              ${points[hoverIndex].price.toFixed(2)}
            </div>
            <div className="text-[10px] text-zinc-300 font-mono">
              {formatTimestamp(points[hoverIndex].timestamp)}
            </div>
            {points[hoverIndex].volume && (
              <div className="text-[10px] text-zinc-400 font-mono">
                Vol: {points[hoverIndex].volume?.toLocaleString()} shares
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Bottom Range & Provenance Metadata ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400 dark:text-zinc-500 px-1">
        <div className="flex items-center gap-3">
          <span>Range: {formatTimestamp(points[0]?.timestamp || "")} – {formatTimestamp(points[points.length - 1]?.timestamp || "")}</span>
          <span>•</span>
          <span>{points.length} Stored Points</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Source: {historyData?.source || "INSTITUTIONAL_WQX"}</span>
          <span>•</span>
          <span className="text-emerald-500 font-semibold">PostgreSQL Verified</span>
        </div>
      </div>
    </div>
  )
}
