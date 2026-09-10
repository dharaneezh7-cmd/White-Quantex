import React from "react"
import { Link } from "react-router"
import { TrendingUp, ArrowRight, ShieldCheck, DollarSign } from "lucide-react"

export default function VenturesPage() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--wq-fg)] tracking-tight">
          Venture Investment Opportunities
        </h1>
        <p className="text-xs sm:text-sm text-[var(--wq-fg-muted)] mt-1">
          Explore vetted fundraising deals, active campaign milestones, and equity opportunities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((deal) => (
          <div
            key={deal}
            className="p-6 rounded-2xl border border-[var(--wq-border)] bg-[var(--wq-bg-surface)] card-premium space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="badge-accent">Series A</span>
              <span className="text-xs font-semibold text-[#00d09c]">Active Deal</span>
            </div>

            <div>
              <h3 className="text-base font-bold text-[var(--wq-fg)]">Quantum Capital Deal #{deal}</h3>
              <p className="text-xs text-[var(--wq-fg-muted)] mt-1">Fintech & Distributed Ledger</p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--wq-fg-muted)]">Target Funding</span>
                <span className="font-bold text-[var(--wq-fg)]">$2,500,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--wq-fg-muted)]">Min Investment</span>
                <span className="font-bold text-[var(--wq-fg)]">$10,000</span>
              </div>
              <div className="w-full bg-[var(--wq-bg-elevated)] h-2 rounded-full overflow-hidden">
                <div className="bg-[#00d09c] h-full w-[65%]" />
              </div>
              <div className="flex justify-between text-[11px] text-[var(--wq-fg-muted)]">
                <span>65% Raised</span>
                <span>14 days left</span>
              </div>
            </div>

            <Link
              to={`/companies/${deal}/investment`}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#00d09c] text-black text-xs font-bold hover:bg-[#00b888] transition-colors"
            >
              Invest Now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
