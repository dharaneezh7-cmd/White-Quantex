import React, { useState } from "react"
import { useParams, Link } from "react-router"
import { ArrowLeft, ShieldCheck, DollarSign, Lock } from "lucide-react"

export default function InvestmentActionPage() {
  const { id } = useParams()
  const [amount, setAmount] = useState(10000)

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link to={`/companies/${id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--wq-fg-muted)] hover:text-[#00d09c]">
        <ArrowLeft className="h-4 w-4" /> Back to Company Profile
      </Link>

      <div className="p-6 rounded-2xl border border-[var(--wq-border)] bg-[var(--wq-bg-surface)] space-y-6">
        <div>
          <span className="badge-accent">Spring Boot Secure Execution</span>
          <h1 className="text-xl font-extrabold text-[var(--wq-fg)] mt-1">Execute Investment Subscription</h1>
          <p className="text-xs text-[var(--wq-fg-muted)]">Target Entity: Company #{id} • Series A SAFE</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--wq-fg)] mb-1">Investment Amount (USD)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] text-sm font-bold text-[var(--wq-fg)] focus:outline-none focus:border-[#00d09c]"
            />
          </div>

          <div className="p-4 rounded-xl bg-[var(--wq-bg-elevated)] text-xs space-y-1">
            <div className="flex justify-between text-[var(--wq-fg-muted)]">
              <span>Estimated Shares Issued:</span>
              <span className="font-bold text-[var(--wq-fg)]">{(amount / 4.25).toFixed(0)} shares</span>
            </div>
            <div className="flex justify-between text-[var(--wq-fg-muted)]">
              <span>Share Price:</span>
              <span className="font-bold text-[var(--wq-fg)]">$4.25 / share</span>
            </div>
          </div>

          <button className="w-full py-3 rounded-xl bg-[#00d09c] text-black font-extrabold text-xs hover:bg-[#00b888] shadow-lg shadow-[#00d09c]/20 flex items-center justify-center gap-2">
            <Lock className="h-4 w-4" /> Authorize & Sign Subscription
          </button>
        </div>
      </div>
    </div>
  )
}
