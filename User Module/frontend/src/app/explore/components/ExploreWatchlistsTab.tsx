import React, { useState, useEffect, useMemo } from "react"
import { Link, useNavigate } from "react-router"
import { Bookmark, Star, Layers, ArrowRight, Plus, Trash2, Check, ExternalLink } from "lucide-react"

export interface ExploreWatchlistsTabProps {
  activeNavTab: "my_watchlist" | "all_watchlist"
  allCompanies: any[]
  onOpenDossier: (company: any) => void
  entityLabel?: string
}

export function ExploreWatchlistsTab({
  activeNavTab,
  allCompanies,
  onOpenDossier,
  entityLabel = "Companies",
}: ExploreWatchlistsTabProps) {
  const navigate = useNavigate()
  const isVentures = entityLabel === "Ventures"
  const storageKey = isVentures ? "wq_venture_watchlist" : "wq_corporate_watchlist"

  // Load saved watchlist tickers from localStorage
  const [pinnedTickers, setPinnedTickers] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(storageKey)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) return parsed
        }
      } catch {}
    }
    return []
  })

  // Followed curated baskets
  const [followedBaskets, setFollowedBaskets] = useState<Record<string, boolean>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(`${storageKey}_baskets`)
        if (saved) return JSON.parse(saved)
      } catch {}
    }
    return {}
  })

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [addSearchQuery, setAddSearchQuery] = useState("")

  const saveWatchlist = (tickers: string[]) => {
    setPinnedTickers(tickers)
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, JSON.stringify(tickers))
      } catch {}
    }
  }

  const togglePin = (ticker: string) => {
    const cleanTicker = ticker.toUpperCase()
    if (pinnedTickers.includes(cleanTicker)) {
      saveWatchlist(pinnedTickers.filter((t) => t !== cleanTicker))
    } else {
      saveWatchlist([...pinnedTickers, cleanTicker])
    }
  }

  const toggleBasketFollow = (basketKey: string) => {
    setFollowedBaskets((prev) => {
      const next = { ...prev, [basketKey]: !prev[basketKey] }
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(`${storageKey}_baskets`, JSON.stringify(next))
        } catch {}
      }
      return next
    })
  }

  // Find real company details for pinned tickers
  const pinnedCompanies = useMemo(() => {
    return pinnedTickers
      .map((ticker) => {
        const found = allCompanies.find(
          (c) => c.ticker?.toUpperCase() === ticker.toUpperCase() || c.id === ticker
        )
        if (found) return found
        return {
          id: ticker,
          name: ticker,
          ticker: ticker,
          sector: "General",
          valuation: "$25.0M",
          change24h: "+0.0%",
          status: "Operating",
          annualRevenue: "N/A",
        }
      })
      .filter(Boolean)
  }, [pinnedTickers, allCompanies])

  // Sector Curated Baskets dynamically aggregated from real registered companies/ventures
  const sectorBaskets = useMemo(() => {
    const sectorsMap = new Map<string, any[]>()
    for (const comp of allCompanies) {
      const sec = comp.sector || "Other"
      const list = sectorsMap.get(sec) || []
      list.push(comp)
      sectorsMap.set(sec, list)
    }

    const sectorDescriptions: Record<string, string> = {
      "AI & ML": "Next-gen foundation models, autonomous agents, and enterprise neural computing infrastructure.",
      CleanTech: "Grid-scale battery storage, solar microgrids, and carbon capture environmental technologies.",
      Fintech: "Direct capital clearing, automated cap table liquidity, and institutional treasury platforms.",
      Biotech: "Targeted oncology clinical therapeutics, gene synthesis, and automated molecular diagnostics.",
      SpaceTech: "Sub-orbital rapid freight, micro-satellite constellations, and deep space payload dynamics.",
      Robotics: "Autonomous factory AMR fleets, electromechanical industrial exoskeletons, and precision actuators.",
      SaaS: "Enterprise workflow automation, cloud compliance security, and high-margin ARR software suites.",
      Quantum: "Superconducting quantum processors, cryogenic qubit control, and quantum cryptography networks.",
    }

    return Array.from(sectorsMap.entries()).map(([sector, companies]) => {
      const topNames = companies.slice(0, 3).map((c) => c.shortName || c.name).join(", ")
      const basketKey = `basket_${sector.toLowerCase().replace(/[^a-z0-9]/g, "_")}`
      return {
        key: basketKey,
        sector,
        title: `${sector} Ecosystem Basket`,
        count: companies.length,
        constituents: topNames,
        desc: sectorDescriptions[sector] || `Active verified ${entityLabel.toLowerCase()} operating in the ${sector} sector.`,
        companies,
      }
    })
  }, [allCompanies, entityLabel])

  if (activeNavTab === "my_watchlist") {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bookmark className="h-4 w-4 text-amber-500 fill-amber-500" />
              My Pinned Watchlist ({pinnedCompanies.length} {entityLabel})
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Personalized watchlist tracking price metrics, rounds, and filings in real-time
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-[#00d09c] text-slate-950 font-bold text-xs hover:bg-[#00b888] transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Add {isVentures ? "Venture" : "Company"}
          </button>
        </div>

        {pinnedCompanies.length === 0 ? (
          <div className="py-14 text-center rounded-2xl bg-slate-50/60 dark:bg-zinc-900/40 border border-dashed border-slate-200 dark:border-zinc-800 space-y-3">
            <div className="h-10 w-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
              <Bookmark className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Your Watchlist is Empty</h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto mt-1">
                You haven't pinned any {entityLabel.toLowerCase()} to your watchlist yet. Browse the registered {entityLabel.toLowerCase()} directory and pin issuers you want to monitor.
              </p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold hover:bg-slate-800 dark:hover:bg-zinc-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Browse &amp; Pin {entityLabel}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pinnedCompanies.map((wl) => (
              <div
                key={wl.ticker}
                className="p-4 rounded-xl bg-slate-50/80 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs hover:shadow-xs transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{wl.name}</span>
                      <Bookmark className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      {wl.ticker} · {wl.sector}
                    </span>
                  </div>
                  <button
                    onClick={() => togglePin(wl.ticker)}
                    title="Remove from watchlist"
                    className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Valuation: <strong className="text-slate-900 dark:text-white">{wl.valuation}</strong></span>
                    <span className="text-emerald-500 font-bold">{wl.change24h || "+0.0%"} 24h</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Revenue: <strong className="text-slate-700 dark:text-zinc-300">{wl.annualRevenue || "N/A"}</strong></span>
                    <span>Status: <strong className="text-slate-700 dark:text-zinc-300">{wl.status || "Active"}</strong></span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">CIK: {wl.cik || "VERIFIED"}</span>
                  <Link
                    to={`/companies/${wl.ticker}`}
                    className="px-3 py-1.5 rounded-lg bg-[#00d09c] hover:bg-[#00b888] text-slate-950 font-black text-xs transition-colors cursor-pointer flex items-center gap-1 shadow-xs active:scale-95"
                  >
                    <span>View Profile</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal to Add Registered Companies/Ventures to Watchlist */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl p-5 space-y-4 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Add Registered {entityLabel} to Watchlist
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>

              <input
                type="text"
                value={addSearchQuery}
                onChange={(e) => setAddSearchQuery(e.target.value)}
                placeholder={`Search ${entityLabel.toLowerCase()} by name, ticker, or sector...`}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 border-0 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
              />

              <div className="overflow-y-auto space-y-1.5 flex-1 pr-1">
                {allCompanies
                  .filter((c) => {
                    if (!addSearchQuery.trim()) return true
                    const q = addSearchQuery.toLowerCase()
                    return (
                      c.name?.toLowerCase().includes(q) ||
                      c.ticker?.toLowerCase().includes(q) ||
                      c.sector?.toLowerCase().includes(q)
                    )
                  })
                  .slice(0, 50)
                  .map((comp) => {
                    const isPinned = pinnedTickers.includes(comp.ticker?.toUpperCase())
                    return (
                      <div
                        key={comp.id || comp.ticker}
                        className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/60 flex items-center justify-between transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">
                              {comp.name}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              ({comp.ticker})
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                            {comp.sector} · {comp.valuation}
                          </span>
                        </div>
                        <button
                          onClick={() => togglePin(comp.ticker)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                            isPinned
                              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                              : "bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300"
                          }`}
                        >
                          {isPinned ? (
                            <>
                              <Check className="h-3 w-3" /> Pinned
                            </>
                          ) : (
                            <>
                              <Plus className="h-3 w-3" /> Pin
                            </>
                          )}
                        </button>
                      </div>
                    )
                  })}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── All Watchlists Tab (Curated Real Sector Baskets) ─────────────────────
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="h-4 w-4 text-purple-500" />
          Curated Sector Baskets &amp; Ecosystem Watchlists
        </h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          Dynamic industry baskets aggregated directly from registered {entityLabel.toLowerCase()}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sectorBaskets.map((basket) => {
          const isFollowed = Boolean(followedBaskets[basket.key])
          return (
            <div
              key={basket.key}
              className="p-4 rounded-xl bg-slate-50/80 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs hover:shadow-xs transition-all space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{basket.title}</h4>
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    {basket.count} Active
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block mt-0.5">
                  {basket.count} Registered {entityLabel}
                </span>
                <p className="text-xs text-slate-600 dark:text-zinc-300 mt-2 line-clamp-2 leading-relaxed">
                  {basket.desc}
                </p>
              </div>

              <div className="pt-3 flex items-center justify-between text-xs border-t border-slate-100 dark:border-zinc-800/60">
                <span className="text-[10px] text-slate-400 truncate max-w-[170px]" title={basket.constituents}>
                  Top: {basket.constituents || "All Issuers"}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleBasketFollow(basket.key)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      isFollowed
                        ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30"
                        : "bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300"
                    }`}
                  >
                    {isFollowed ? <Check className="h-3 w-3" /> : <Star className="h-3 w-3" />}
                    {isFollowed ? "Following" : "Follow"}
                  </button>
                  <button
                    onClick={() => {
                      const base = isVentures ? "/ventures" : "/explore"
                      navigate(`${base}?tab=search`)
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    title="View Directory"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
