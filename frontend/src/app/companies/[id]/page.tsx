import React from "react"
import { useParams, Link } from "react-router"
import { ArrowLeft, Building2, ShieldCheck, DollarSign } from "lucide-react"

export default function CompanyDetailPage() {
  const { id } = useParams()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link to="/explore" className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--wq-fg-muted)] hover:text-[#00d09c]">
        <ArrowLeft className="h-4 w-4" /> Back to Discovery
      </Link>
      <div className="p-6 rounded-2xl border border-[var(--wq-border)] bg-[var(--wq-bg-surface)] space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-extrabold text-[var(--wq-fg)]">Established Company #{id}</h1>
            <p className="text-xs text-[var(--wq-fg-muted)]">Incorporated Entity • Delaware C-Corp</p>
          </div>
          <Link
            to={`/companies/${id}/investment`}
            className="px-4 py-2 rounded-xl bg-[#00d09c] text-black font-bold text-xs hover:bg-[#00b888]"
          >
            Invest / Term Sheet
          </Link>
        </div>
      </div>
    </div>
  )
}
