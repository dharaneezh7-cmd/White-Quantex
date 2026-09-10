import React from "react"
import { useParams, Link } from "react-router"
import { ArrowLeft, ShieldCheck, TrendingUp, Building2 } from "lucide-react"

export default function StartupDetailPage() {
  const { id } = useParams()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link to="/explore" className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--wq-fg-muted)] hover:text-[#00d09c]">
        <ArrowLeft className="h-4 w-4" /> Back to Discovery
      </Link>
      <div className="p-6 rounded-2xl border border-[var(--wq-border)] bg-[var(--wq-bg-surface)] space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <span className="badge-accent">Startup Venture</span>
            <h1 className="text-2xl font-extrabold text-[var(--wq-fg)] mt-1">Startup Venture #{id}</h1>
            <p className="text-xs text-[var(--wq-fg-muted)]">Fintech & Artificial Intelligence</p>
          </div>
          <span className="px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-xs font-semibold text-[#00d09c]">
            Gold Verified
          </span>
        </div>
      </div>
    </div>
  )
}
