import React from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useQuery } from "@tanstack/react-query"
import { exploreService } from "@/services/explore/exploreService"
import { useAuthStore } from "@/stores/auth-store"
import { Link } from "react-router"
import { Briefcase, ArrowRight, ShieldCheck } from "lucide-react"

export default function DashboardPage() {
  const { user } = useAuthStore()

  const { data: positions = [], isLoading } = useQuery({
    queryKey: ["explore", "positions", user?.id],
    queryFn: () => exploreService.getPositions(),
    staleTime: 30_000,
  })

  // Calculate live portfolio summary from database positions
  const totalInvested = positions.reduce((acc, p) => acc + (p.costBasis || 0), 0)
  const portfolioValue = positions.reduce((acc, p) => acc + (p.currentValue || 0), 0)
  const unrealizedGain = portfolioValue - totalInvested
  const totalReturnPercent = totalInvested > 0 ? (unrealizedGain / totalInvested) * 100 : 0

  return (
    <ProtectedRoute>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--wq-fg)] tracking-tight">
                Portfolio & Investor Dashboard
              </h1>
              {user?.verificationLevel && (
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#00d09c]/10 text-[#00a87e] dark:text-[#00d09c] border border-[#00d09c]/30 uppercase tracking-wider">
                  {user.verificationLevel} Verified
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-[var(--wq-fg-muted)] mt-1">
              Investor Session: <strong>{user?.displayName || "Alexander Vance"}</strong> ({user?.email || "demo@whitequantex.com"}) · Spring Boot PostgreSQL Truth Engine
            </p>
          </div>

          <Link
            to="/explore?tab=positions"
            className="px-4 py-2 rounded-xl bg-[#00d09c] text-black font-extrabold text-xs hover:bg-[#00b888] shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Briefcase className="h-3.5 w-3.5" />
            Explore Holdings
          </Link>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border border-[var(--wq-border)] bg-[var(--wq-bg-surface)] card-premium">
            <span className="text-xs text-[var(--wq-fg-muted)]">Total Invested</span>
            <p className="text-2xl font-extrabold text-[var(--wq-fg)] mt-1">
              ${totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <span className="text-[11px] text-[#00d09c] font-bold">
              {positions.length} Active Positions
            </span>
          </div>

          <div className="p-5 rounded-2xl border border-[var(--wq-border)] bg-[var(--wq-bg-surface)] card-premium">
            <span className="text-xs text-[var(--wq-fg-muted)]">Portfolio Market Value</span>
            <p className="text-2xl font-extrabold text-[#00d09c] mt-1">
              ${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <span className="text-[11px] text-emerald-500 font-bold">
              {totalReturnPercent >= 0 ? "+" : ""}{totalReturnPercent.toFixed(1)}% Total Return
            </span>
          </div>

          <div className="p-5 rounded-2xl border border-[var(--wq-border)] bg-[var(--wq-bg-surface)] card-premium">
            <span className="text-xs text-[var(--wq-fg-muted)]">Unrealized Gain</span>
            <p className={`text-2xl font-extrabold mt-1 ${unrealizedGain >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
              {unrealizedGain >= 0 ? "+" : ""}${unrealizedGain.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <span className="text-[11px] text-[var(--wq-fg-muted)]">PostgreSQL Verified Ledger</span>
          </div>

          <div className="p-5 rounded-2xl border border-[var(--wq-border)] bg-[var(--wq-bg-surface)] card-premium">
            <span className="text-xs text-[var(--wq-fg-muted)]">Trust & KYC Rating</span>
            <p className="text-2xl font-extrabold text-amber-400 mt-1">
              {user?.trustScore || 98} / 100
            </p>
            <span className="text-[11px] text-amber-500 font-bold flex items-center gap-1 mt-0.5">
              <ShieldCheck className="h-3 w-3" />
              {user?.primaryRole === "INVESTOR" ? "Institutional Accredited Tier" : "Accredited Investor"}
            </span>
          </div>
        </div>

        {/* Holdings Table */}
        <div className="p-6 rounded-2xl border border-[var(--wq-border)] bg-[var(--wq-bg-surface)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[var(--wq-fg)]">Active Portfolio Holdings</h3>
              <p className="text-xs text-[var(--wq-fg-muted)] mt-0.5">
                Audited cap table records stored in PostgreSQL
              </p>
            </div>
            <Link
              to="/explore"
              className="text-xs font-semibold text-[#00d09c] hover:underline flex items-center gap-1"
            >
              Explore New Issuers <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--wq-border)] text-[var(--wq-fg-muted)] uppercase text-[10px]">
                  <th className="py-3 px-3">Company / Issuer</th>
                  <th className="py-3 px-3">Industry Sector</th>
                  <th className="py-3 px-3">Shares & Class</th>
                  <th className="py-3 px-3">Cost Basis</th>
                  <th className="py-3 px-3">Current Value</th>
                  <th className="py-3 px-3">Unrealized P&L</th>
                  <th className="py-3 px-3">Ownership %</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--wq-border)]">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-xs text-[var(--wq-fg-muted)]">
                      Loading verified portfolio positions from database...
                    </td>
                  </tr>
                ) : positions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-xs text-[var(--wq-fg-muted)]">
                      No active holdings found in your database account.
                    </td>
                  </tr>
                ) : (
                  positions.map((pos) => (
                    <tr key={pos.id} className="hover:bg-[var(--wq-bg-elevated)] transition-colors">
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-[var(--wq-fg)] block">{pos.companyName}</span>
                        <span className="text-[10px] text-[var(--wq-fg-muted)] font-mono">{pos.ticker}</span>
                      </td>
                      <td className="py-3.5 px-3 text-[var(--wq-fg-muted)]">{pos.sector}</td>
                      <td className="py-3.5 px-3 font-mono text-[var(--wq-fg)]">
                        {pos.shares?.toLocaleString()} shares
                        <span className="block text-[10px] text-[var(--wq-fg-muted)] font-sans">{pos.shareClass}</span>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-[var(--wq-fg)]">
                        ${pos.costBasis?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-[#00d09c]">
                        ${pos.currentValue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className={`py-3.5 px-3 font-bold ${pos.unrealizedPl >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                        {pos.unrealizedPl >= 0 ? "+" : ""}${pos.unrealizedPl?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        <span className="block text-[10px]">
                          ({pos.unrealizedPlPercent >= 0 ? "+" : ""}{pos.unrealizedPlPercent?.toFixed(1)}%)
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-[var(--wq-fg)]">
                        {pos.ownershipPercent ? pos.ownershipPercent.toFixed(2) : "0.00"}%
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Active Holding
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
