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
  const safeSymbol = (symbol || "WQ").toUpperCase()
  const {
    data: historyData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<MarketHistoryResponse>({
    queryKey: ["market-data-history", safeSymbol, range],
    queryFn: () => marketDataService.getHistory(safeSymbol, range),
    staleTime: range === "1D" ? 15_000 : 120_000,
    retry: 1,
  })

  // 2. Real-Time Price Stream Hook (Spring Boot SSE)
  const { quotes, isConnected: sseConnected } = useMarketPrices()
  const liveQuote = quotes[safeSymbol]

  // 3. Dynamic Points Assembly (combines authoritative database records with live intraday ticks)
  const points: PricePoint[] = useMemo(() => {
    if (!historyData || !historyData.points || historyData.points.length === 0) {
      return []
    }
    const raw = [...historyData.points]

    // For non-1D ranges (1M, 1Y, 5Y, ALL), ensure intraday ticks don't skew the timeline
    let pts: PricePoint[] = raw
    if (range !== "1D") {
      const byDate = new Map<string, PricePoint>()
      for (const p of raw) {
        if (!p.timestamp) continue
        const d = p.timestamp.slice(0, 10)
        byDate.set(d, p) // keeps the latest point for each calendar day
      }
      pts = Array.from(byDate.values())
      pts.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    }

    // Live tick integration
    if (liveQuote && liveQuote.price) {
      const livePrice = Number(liveQuote.price)
      const liveTs = liveQuote.lastUpdated || new Date().toISOString()
      if (pts.length > 0 && !isNaN(livePrice) && livePrice > 0) {
        const lastP = pts[pts.length - 1].price
        if (lastP > 0 && Math.abs(livePrice - lastP) / lastP < 0.5) {
          pts[pts.length - 1] = {
            ...pts[pts.length - 1],
            price: livePrice,
            timestamp: liveTs,
          }
        }
      }
    }
    return pts.filter((p) => p && typeof p.price === "number" && !isNaN(p.price) && p.price > 0)
  }, [historyData, range, liveQuote])

  // 4. Period Performance Math with Padded Scaling
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
    paddedMin,
    paddedMax,
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
        paddedMin: fallbackPrice * 0.90,
        paddedMax: fallbackPrice * 1.10,
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

    // Visual padding: give 20% breathing room top and bottom so graph never clips or touches borders
    const rawSpan = max - min
    const pad = rawSpan > 0 ? rawSpan * 0.20 : (max > 0 ? max * 0.10 : 10)
    const pMin = Math.max(0, min - pad)
    const pMax = max + pad

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
      paddedMin: pMin,
      paddedMax: pMax,
    }
  }, [points, hoverIndex, liveQuote])

  // Notify parent of price update if callback provided
  useEffect(() => {
    if (onPriceChange && latestPrice > 0) {
      onPriceChange(latestPrice, periodDelta, periodPercent)
    }
  }, [latestPrice, periodDelta, periodPercent, onPriceChange])

  // 5. SVG Coordinate Calculations & Uniform Horizontal Distribution
  const svgWidth = 800
  const svgHeight = 280
  const paddingX = 40
  const paddingY = 36
  const chartWidth = svgWidth - paddingX * 2
  const chartHeight = svgHeight - paddingY * 2

  const getCoordinates = (idx: number, priceVal: number) => {
    if (points.length <= 1) return { x: paddingX + chartWidth / 2, y: svgHeight / 2 }
    const rawX = paddingX + (idx / (points.length - 1)) * chartWidth
    const priceSpan = paddedMax - paddedMin || 1
    const rawY = svgHeight - paddingY - ((priceVal - paddedMin) / priceSpan) * chartHeight
    
    // Strict viewport clamping to guarantee 100% visibility inside the container div
    const x = Math.max(paddingX, Math.min(svgWidth - paddingX, rawX))
    const y = Math.max(paddingY, Math.min(svgHeight - paddingY, rawY))
    return { x, y }
  }

  const pointCoords = useMemo(() => {
    return points.map((p, idx) => getCoordinates(idx, p.price))
  }, [points, paddedMin, paddedMax])

  const { pathD, fillD } = useMemo(() => {
    if (pointCoords.length === 0) return { pathD: "", fillD: "" }
    const linePath = pointCoords.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}` : `${acc} L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`
    }, "")

    const bottomY = (svgHeight - paddingY * 0.5).toFixed(1)
    const areaPath = `${linePath} L ${pointCoords[pointCoords.length - 1].x.toFixed(1)} ${bottomY} L ${pointCoords[0].x.toFixed(1)} ${bottomY} Z`
    return { pathD: linePath, fillD: areaPath }
  }, [pointCoords])

  // Interactive mouse scrubbing based on nearest point coordinates
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || points.length === 0 || pointCoords.length === 0) return
    const rect = svgRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const targetX = (mouseX / rect.width) * svgWidth

    let closestIdx = 0
    let minDiff = Infinity
    for (let i = 0; i < pointCoords.length; i++) {
      const diff = Math.abs(pointCoords[i].x - targetX)
      if (diff < minDiff) {
        minDiff = diff
        closestIdx = i
      }
    }
    setHoverIndex(closestIdx)
  }

  const handleMouseLeave = () => {
    setHoverIndex(null)
  }

  const formatTimestamp = (isoStr?: string) => {
    if (!isoStr) return "N/A"
    try {
      const d = new Date(isoStr)
      if (isNaN(d.getTime())) return "N/A"
      if (range === "1D") {
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
      return d.toLocaleDateString([], { month: "short", day: "numeric", year: range === "5Y" || range === "ALL" ? "numeric" : undefined })
    } catch {
      return "N/A"
    }
  }

  const formatFullDate = (isoStr?: string) => {
    if (!isoStr) return "N/A"
    try {
      const d = new Date(isoStr)
      if (isNaN(d.getTime())) return "N/A"
      return d.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch {
      return "N/A"
    }
  }

  const formatTimeOnly = (isoStr?: string) => {
    if (!isoStr) return ""
    try {
      const d = new Date(isoStr)
      if (isNaN(d.getTime())) return ""
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } catch {
      return ""
    }
  }

  const hoveredPointCoords = hoverIndex !== null && pointCoords[hoverIndex]
    ? pointCoords[hoverIndex]
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
              const priceAtRatio = paddedMax - (paddedMax - paddedMin) * ratio
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

        {/* Floating Tooltip Box with Full Financial Data, Date & Time */}
        {hoverIndex !== null && points[hoverIndex] && hoveredPointCoords && (() => {
          const pt = points[hoverIndex]
          const ptPrice = pt.price
          const ptDelta = ptPrice - startPrice
          const ptPct = startPrice > 0 ? (ptDelta / startPrice) * 100 : 0
          const isPtPositive = ptDelta >= 0
          const dateStr = formatFullDate(pt.timestamp)
          const timeStr = formatTimeOnly(pt.timestamp)

          const xRatio = hoveredPointCoords.x / svgWidth
          const yRatio = hoveredPointCoords.y / svgHeight

          // Smart dual-axis bounding: flips anchor to opposite quadrant when approaching borders
          const isRightHalf = xRatio > 0.52
          const xTranslate = isRightHalf ? "-translate-x-full -translate-x-3" : "translate-x-3"
          const leftPercent = `${(xRatio * 100).toFixed(1)}%`

          // When point is in upper half of chart, anchor below point to guarantee zero clipping at top
          const isTopHalf = yRatio < 0.50
          const yTranslate = isTopHalf ? "translate-y-3" : "-translate-y-full -translate-y-3"
          const topPercent = `${(yRatio * 100).toFixed(1)}%`

          return (
            <div
              className={`absolute pointer-events-none z-30 min-w-[170px] px-3.5 py-2.5 rounded-xl bg-slate-900/95 dark:bg-zinc-900/95 text-white shadow-2xl border border-slate-700/80 dark:border-zinc-700/80 text-xs backdrop-blur-md transform ${xTranslate} ${yTranslate} transition-all duration-75 space-y-1.5`}
              style={{
                left: leftPercent,
                top: topPercent,
              }}
            >
              {/* Header: Price + % Return Badge */}
              <div className="flex items-center justify-between gap-3">
                <span className="font-extrabold font-mono text-base text-white">
                  ${ptPrice.toFixed(2)}
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    isPtPositive
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  }`}
                >
                  {isPtPositive ? "+" : ""}
                  {ptPct.toFixed(2)}%
                </span>
              </div>

              {/* Date & Time */}
              <div className="space-y-0.5 border-t border-slate-800 dark:border-zinc-800 pt-1.5 text-[11px] font-mono">
                <div className="text-zinc-200 font-semibold flex items-center justify-between gap-2">
                  <span>{dateStr}</span>
                  {timeStr && (
                    <span className="text-zinc-400 text-[10px] font-normal">{timeStr}</span>
                  )}
                </div>
              </div>

              {/* Detailed Metrics: Return Delta & Volume */}
              <div className="space-y-0.5 pt-0.5 text-[10px] font-mono text-zinc-400">
                <div className="flex items-center justify-between gap-2">
                  <span>Return:</span>
                  <span className={isPtPositive ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                    {isPtPositive ? "+" : ""}${ptDelta.toFixed(2)}
                  </span>
                </div>
                {pt.volume ? (
                  <div className="flex items-center justify-between gap-2">
                    <span>Volume:</span>
                    <span className="text-zinc-200 font-medium">{pt.volume.toLocaleString()} shares</span>
                  </div>
                ) : null}
              </div>
            </div>
          )
        })()}
      </div>

      {/* ── Bottom Range & Provenance Metadata ── */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 text-[11px] font-mono text-slate-400 dark:text-zinc-500 px-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="whitespace-nowrap">
            Range: {points.length > 0 ? `${formatTimestamp(points[0]?.timestamp)} – ${formatTimestamp(points[points.length - 1]?.timestamp)}` : "Today"}
          </span>
          <span>•</span>
          <span className="whitespace-nowrap">{points.length} Stored Points</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="whitespace-nowrap">Source: {historyData?.source || "INSTITUTIONAL_WQX"}</span>
          <span>•</span>
          <span className="text-emerald-500 font-semibold whitespace-nowrap">PostgreSQL Verified</span>
        </div>
      </div>
    </div>
  )
}
