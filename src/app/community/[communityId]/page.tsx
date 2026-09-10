import React from "react"
import { useParams, Link } from "react-router"
import { ArrowLeft, Users, ShieldCheck, Flame } from "lucide-react"

export default function CommunityDetailPage() {
  const { communityId } = useParams()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        to="/community"
        className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--wq-fg-muted)] hover:text-[#00d09c]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Community Feed
      </Link>

      <div className="p-6 rounded-2xl border border-[var(--wq-border)] bg-[var(--wq-bg-surface)] space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 text-[#00d09c] flex items-center justify-center font-bold text-xl">
            {communityId?.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[var(--wq-fg)] capitalize">
              {communityId?.replace("-", " ")} Community
            </h1>
            <p className="text-xs text-[var(--wq-fg-muted)]">
              4,200 Verified Members • Professional Ecosystem Group
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
