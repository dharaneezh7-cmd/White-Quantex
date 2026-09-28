import React from "react"
import { useParams, Link } from "react-router"
import { ArrowLeft, TrendingUp, BarChart3, Activity } from "lucide-react"

export default function MarketSymbolPage() {
  const { symbol } = useParams()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        to="/markets"
        className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--wq-fg-muted)] hover:text-[#00d09c]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Markets Overview
      </Link>

      <div className="p-6 rounded-2xl border border-[var(--wq-border)] bg-[var(--wq-bg-surface)] space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-bold text-[#00d09c]">{symbol?.toUpperCase()}</span>
            <h1 className="text-2xl font-extrabold text-[var(--wq-fg)]">Venture Benchmark Symbol Detail</h1>
            <p className="text-xs text-[var(--wq-fg-muted)]">Category: Enterprise Venture Index</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-extrabold text-[var(--wq-fg)]">$1,420.50</span>
            <p className="text-xs font-bold text-emerald-400">+3.4% (24h)</p>
          </div>
        </div>

        <div className="h-64 flex items-center justify-center border border-dashed border-[var(--wq-border)] rounded-xl text-xs text-[var(--wq-fg-muted)]">
          <BarChart3 className="h-8 w-8 text-[#00d09c] mr-2" /> Live Market Benchmark Chart Component
        </div>
      </div>
    </div>
  )
}
