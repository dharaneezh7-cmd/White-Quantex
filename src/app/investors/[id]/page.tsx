import React from "react"
import { useParams, Link } from "react-router"
import { ArrowLeft, ShieldCheck } from "lucide-react"

export default function InvestorProfilePage() {
  const { id } = useParams()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link to="/investors" className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--wq-fg-muted)] hover:text-[#00d09c]">
        <ArrowLeft className="h-4 w-4" /> Back to Investors Directory
      </Link>
      <div className="p-6 rounded-2xl border border-[var(--wq-border)] bg-[var(--wq-bg-surface)] space-y-4">
        <h1 className="text-2xl font-extrabold text-[var(--wq-fg)]">Investor Profile #{id}</h1>
        <p className="text-xs text-[var(--wq-fg-muted)]">Accredited Angel Investor • Venture Syndicate Member</p>
      </div>
    </div>
  )
}
