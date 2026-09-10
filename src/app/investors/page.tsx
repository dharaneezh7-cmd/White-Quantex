import React from "react"
import { Link } from "react-router"
import { ShieldCheck } from "lucide-react"

export default function InvestorsPage() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <h1 className="text-2xl font-extrabold text-[var(--wq-fg)]">Accredited Investors</h1>
      <p className="text-xs text-[var(--wq-fg-muted)]">Verified angel investors, venture capitalists, and family offices.</p>
    </div>
  )
}
