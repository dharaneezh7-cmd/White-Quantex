import React from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { ShieldCheck, Users, Building2, AlertTriangle } from "lucide-react"

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <span className="badge-accent">System Administration</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--wq-fg)] mt-1">Admin Portal & Moderation Queue</h1>
          <p className="text-xs text-[var(--wq-fg-muted)]">KYC reviews, business approvals, and platform security control.</p>
        </div>

        <div className="p-6 rounded-2xl border border-[var(--wq-border)] bg-[var(--wq-bg-surface)] space-y-4">
          <h3 className="text-base font-bold text-[var(--wq-fg)]">Pending Verification Queue</h3>
          <p className="text-xs text-[var(--wq-fg-muted)]">Submissions requiring administrative review.</p>
        </div>
      </div>
    </ProtectedRoute>
  )
}
