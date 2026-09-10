import React, { useState } from "react"
import { Link } from "react-router"
import { Search, Filter, Building2, Users, ShieldCheck, ArrowRight } from "lucide-react"

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<"startups" | "companies" | "founders" | "investors">("startups")
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--wq-fg)] tracking-tight">
          Ecosystem Discovery
        </h1>
        <p className="text-xs sm:text-sm text-[var(--wq-fg-muted)] mt-1">
          Search and filter  corporate entities.
        </p>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[var(--wq-border)] pb-4">
        {/* Search Field */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--wq-fg-muted)]" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-surface)] text-[var(--wq-fg)] focus:outline-none focus:border-[#00d09c]"
          />
        </div>
      </div>

      {/* Grid Content Placeholder / Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="p-6 rounded-2xl border border-[var(--wq-border)] bg-[var(--wq-bg-surface)] card-premium space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00d09c]/10 text-[#00d09c] font-bold">
                  WQ
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--wq-fg)]">Enterprise Tech {i}</h3>
                  <p className="text-xs text-[var(--wq-fg-muted)]">Fintech • Seed Stage</p>
                </div>
              </div>
              <span className="badge-accent">Gold Verified</span>
            </div>

            <p className="text-xs text-[var(--wq-fg-muted)] line-clamp-2 leading-relaxed">
              Building next-generation distributed transaction systems for institutional fintech and cross-border settlement.
            </p>

            <div className="pt-2 border-t border-[var(--wq-border)] flex items-center justify-between text-xs">
              <div>
                <span className="text-[var(--wq-fg-muted)]">Trust Score</span>
                <p className="font-bold text-[#00d09c]">94 / 100</p>
              </div>
              <Link
                to={`/companies/${i}`}
                className="inline-flex items-center gap-1 font-bold text-[var(--wq-fg)] hover:text-[#00d09c]"
              >
                View Profile <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
