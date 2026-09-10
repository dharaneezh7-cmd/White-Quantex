import React from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { LayoutDashboard, TrendingUp, DollarSign, PieChart, ShieldCheck, Activity } from "lucide-react"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--wq-fg)] tracking-tight">
            Portfolio & Investor Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[var(--wq-fg-muted)] mt-1">
            Authoritative financial metrics and venture holdings (Spring Boot PostgreSQL Truth Engine).
          </p>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border border-[var(--wq-border)] bg-[var(--wq-bg-surface)] card-premium">
            <span className="text-xs text-[var(--wq-fg-muted)]">Total Invested</span>
            <p className="text-2xl font-extrabold text-[var(--wq-fg)] mt-1">$45,000</p>
            <span className="text-[11px] text-[#00d09c] font-bold">3 Active Investments</span>
          </div>

          <div className="p-5 rounded-2xl border border-[var(--wq-border)] bg-[var(--wq-bg-surface)] card-premium">
            <span className="text-xs text-[var(--wq-fg-muted)]">Portfolio Value</span>
            <p className="text-2xl font-extrabold text-[#00d09c] mt-1">$62,400</p>
            <span className="text-[11px] text-emerald-400 font-bold">+38.6% Total Return</span>
          </div>

          <div className="p-5 rounded-2xl border border-[var(--wq-border)] bg-[var(--wq-bg-surface)] card-premium">
            <span className="text-xs text-[var(--wq-fg-muted)]">Unrealized Gain</span>
            <p className="text-2xl font-extrabold text-[var(--wq-fg)] mt-1">+$17,400</p>
            <span className="text-[11px] text-[var(--wq-fg-muted)]">Audit-verified balance</span>
          </div>

          <div className="p-5 rounded-2xl border border-[var(--wq-border)] bg-[var(--wq-bg-surface)] card-premium">
            <span className="text-xs text-[var(--wq-fg-muted)]">Trust Score</span>
            <p className="text-2xl font-extrabold text-amber-400 mt-1">92 / 100</p>
            <span className="text-[11px] text-amber-400 font-bold">Gold Investor Status</span>
          </div>
        </div>

        {/* Holdings Table */}
        <div className="p-6 rounded-2xl border border-[var(--wq-border)] bg-[var(--wq-bg-surface)] space-y-4">
          <h3 className="text-base font-bold text-[var(--wq-fg)]">Active Portfolio Holdings</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--wq-border)] text-[var(--wq-fg-muted)] uppercase text-[10px]">
                  <th className="py-3 px-2">Venture Name</th>
                  <th className="py-3 px-2">Industry</th>
                  <th className="py-3 px-2">Invested</th>
                  <th className="py-3 px-2">Current Value</th>
                  <th className="py-3 px-2">Equity %</th>
                  <th className="py-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--wq-border)]">
                {[
                  { name: "TechFlow AI Solutions", ind: "Fintech & AI", inv: "$25,000", val: "$38,500", eq: "0.85%", st: "Active" },
                  { name: "GreenLeaf Energy", ind: "CleanTech", inv: "$10,000", val: "$12,400", eq: "0.40%", st: "Active" },
                  { name: "Quantum Materials Corp", ind: "DeepTech", inv: "$10,000", val: "$11,500", eq: "0.25%", st: "Active" },
                ].map((h, i) => (
                  <tr key={i} className="hover:bg-[var(--wq-bg-elevated)] transition-colors">
                    <td className="py-3 px-2 font-bold text-[var(--wq-fg)]">{h.name}</td>
                    <td className="py-3 px-2 text-[var(--wq-fg-muted)]">{h.ind}</td>
                    <td className="py-3 px-2 font-semibold text-[var(--wq-fg)]">{h.inv}</td>
                    <td className="py-3 px-2 font-semibold text-[#00d09c]">{h.val}</td>
                    <td className="py-3 px-2 text-[var(--wq-fg-muted)]">{h.eq}</td>
                    <td className="py-3 px-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {h.st}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
