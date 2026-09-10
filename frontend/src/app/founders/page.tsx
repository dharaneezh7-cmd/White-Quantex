import React from "react"
import { Link } from "react-router"
import { Users, ShieldCheck } from "lucide-react"

export default function FoundersPage() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <h1 className="text-2xl font-extrabold text-[var(--wq-fg)]">Verified Founders</h1>
      <p className="text-xs text-[var(--wq-fg-muted)]">Connect with entrepreneurs building vetted startups on White Quantex.</p>
    </div>
  )
}
