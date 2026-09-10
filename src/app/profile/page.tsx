import React from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useAuthStore } from "@/stores/auth-store"
import { User, ShieldCheck, Bookmark, Activity, Mail } from "lucide-react"

export default function UnifiedProfilePage() {
  const { user } = useAuthStore()

  return (
    <ProtectedRoute>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Profile Card */}
        <div className="p-8 rounded-2xl border border-[var(--wq-border)] bg-[var(--wq-bg-surface)] space-y-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="h-20 w-20 rounded-full bg-[#00d09c] text-black font-extrabold text-2xl flex items-center justify-center shrink-0">
              {user?.displayName ? user.displayName.substring(0, 2).toUpperCase() : "WQ"}
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-extrabold text-[var(--wq-fg)]">
                  {user?.displayName || `${user?.firstName} ${user?.lastName}`}
                </h1>
                <ShieldCheck className="h-5 w-5 text-[#00d09c]" />
              </div>
              <p className="text-xs text-[var(--wq-fg-muted)]">@{user?.username || "wquser"}</p>
              <p className="text-xs text-[var(--wq-fg)] pt-1">{user?.headline || "Verified Ecosystem Participant"}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--wq-border)] grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs">
            <div className="p-3 rounded-xl bg-[var(--wq-bg-elevated)]">
              <span className="text-[var(--wq-fg-muted)]">WQ User UUID</span>
              <p className="font-mono font-bold text-[var(--wq-fg)] mt-0.5 truncate text-[11px]">
                {user?.wqUserId || "wq-uuid-canonical-reference"}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[var(--wq-bg-elevated)]">
              <span className="text-[var(--wq-fg-muted)]">Role</span>
              <p className="font-bold text-[#00d09c] mt-0.5">{user?.primaryRole || "FOUNDER"}</p>
            </div>
            <div className="p-3 rounded-xl bg-[var(--wq-bg-elevated)]">
              <span className="text-[var(--wq-fg-muted)]">KYC Status</span>
              <p className="font-bold text-emerald-400 mt-0.5">{user?.kycStatus || "APPROVED"}</p>
            </div>
            <div className="p-3 rounded-xl bg-[var(--wq-bg-elevated)]">
              <span className="text-[var(--wq-fg-muted)]">Trust Score</span>
              <p className="font-bold text-amber-400 mt-0.5">{user?.trustScore || 95} / 100</p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
