import React from "react"
import { Link } from "react-router"
import { ExternalLink, Building2 } from "lucide-react"

export default function CompanyVerificationPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center space-y-6">
      <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
        <Building2 className="h-8 w-8" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-[var(--wq-fg)]">Corporate & Venture Registration Portal</h1>
        <p className="text-xs sm:text-sm text-[var(--wq-fg-muted)] max-w-md mx-auto">
          Company legal registration, startup listing, and corporate venture audits have been migrated to the dedicated White Quantex Corporate Portal.
        </p>
      </div>
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <a
          href="http://localhost:7001"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#00d09c] text-black font-extrabold text-xs hover:bg-[#00b888] shadow-lg shadow-[#00d09c]/20 transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
        >
          Launch Corporate Portal (Port 7001) <ExternalLink className="h-4 w-4" />
        </a>
        <Link
          to="/dashboard"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[var(--wq-bg-elevated)] border border-[var(--wq-border)] text-[var(--wq-fg)] font-bold text-xs hover:bg-[var(--wq-bg-surface)] transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  )
}
