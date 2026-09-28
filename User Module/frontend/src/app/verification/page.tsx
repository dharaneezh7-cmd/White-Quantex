import React from "react"
import { Link } from "react-router"
import { ShieldCheck, Award, FileCheck, Building, UserCheck } from "lucide-react"

export default function VerificationHubPage() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--wq-fg)]">Verification & Trust Portal</h1>
        <p className="text-xs sm:text-sm text-[var(--wq-fg-muted)] mt-1">
          Complete identity verification and legal compliance checks to elevate your WQ Trust Score.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <Link to="/verification/founder" className="p-6 rounded-2xl border border-[var(--wq-border)] bg-[var(--wq-bg-surface)] card-premium space-y-3">
          <UserCheck className="h-8 w-8 text-[#00d09c]" />
          <h3 className="text-sm font-bold text-[var(--wq-fg)]">Founder KYC Verification</h3>
          <p className="text-xs text-[var(--wq-fg-muted)]">Government ID, proof of address, and executive background check.</p>
        </Link>

        <Link to="/verification/investor" className="p-6 rounded-2xl border border-[var(--wq-border)] bg-[var(--wq-bg-surface)] card-premium space-y-3">
          <ShieldCheck className="h-8 w-8 text-[#00d09c]" />
          <h3 className="text-sm font-bold text-[var(--wq-fg)]">Accredited Investor Status</h3>
          <p className="text-xs text-[var(--wq-fg-muted)]">Accreditation certificate and net worth / income verification.</p>
        </Link>
      </div>
    </div>
  )
}
