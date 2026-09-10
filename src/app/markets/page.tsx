import React from "react"
import { Link } from "react-router"
import { TrendingUp, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react"

export default function MarketsPage() {
  const markets = [
    { symbol: "WQ-TECH", name: "Tech Venture Index", category: "Indices", price: 1420.5, change: "+3.4%" },
    { symbol: "WQ-AI", name: "AI & ML Enterprise Basket", category: "Sector", price: 890.1, change: "+5.1%" },
    { symbol: "WQ-FIN", name: "Fintech Growth Benchmark", category: "Sector", price: 1120.0, change: "-0.8%" },
    { symbol: "WQ-GREEN", name: "CleanTech Index", category: "ESG", price: 650.3, change: "+2.1%" },
  ]

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--wq-fg)] tracking-tight">
          Market Intelligence & Benchmarks
        </h1>
        <p className="text-xs sm:text-sm text-[var(--wq-fg-muted)] mt-1">
          Track private market valuations, sector performance benchmarks, and ecosystem indices.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {markets.map((m) => (
          <Link
            key={m.symbol}
            to={`/markets/${m.symbol}`}
            className="p-5 rounded-2xl border border-[var(--wq-border)] bg-[var(--wq-bg-surface)] card-premium space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#00d09c]">{m.symbol}</span>
              <span
                className={`text-xs font-bold ${
                  m.change.startsWith("+") ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {m.change}
              </span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--wq-fg)]">{m.name}</h4>
              <p className="text-[11px] text-[var(--wq-fg-muted)]">{m.category}</p>
            </div>
            <p className="text-lg font-extrabold text-[var(--wq-fg)]">{m.price.toFixed(2)}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
