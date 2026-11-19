import React from "react"
import { useParams, Link } from "react-router"
import { ArrowLeft, BarChart3 } from "lucide-react"
import { StockDetailView } from "../../../components/market/StockDetailView"
import { useStockWatchlist } from "../../../hooks/useStockWatchlist"
import { AppErrorBoundary } from "../../../components/common/AppErrorBoundary"

export default function MarketSymbolPage() {
  const { symbol } = useParams<{ symbol: string }>()
  const safeSymbol = (symbol || "HETH").toUpperCase()
  const { isWatched, toggleWatchlist } = useStockWatchlist()

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/markets"
          className="inline-flex items-center gap-2 text-xs font-bold font-mono text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Stock Screener</span>
        </Link>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 dark:text-zinc-500">
          <span>WQX Markets</span>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-bold">{safeSymbol}</span>
        </div>
      </div>

      {/* Primary Stock Detail View */}
      <AppErrorBoundary
        title="Stock Information Error"
        fallbackMessage="Unable to render the full stock details view. Please return to the market overview."
      >
        <StockDetailView
          symbol={safeSymbol}
          isWatched={isWatched(safeSymbol)}
          onToggleWatchlist={toggleWatchlist}
        />
      </AppErrorBoundary>
    </div>
  )
}
