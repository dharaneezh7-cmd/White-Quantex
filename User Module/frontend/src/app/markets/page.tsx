import React, { useState } from "react"
import { useSearchParams, useNavigate } from "react-router"
import { useQuery } from "@tanstack/react-query"
import { exploreService } from "../../services/explore/exploreService"
import { useMarketPrices } from "../../services/market/useMarketPrices"
import {
  TrendingUp,
  BarChart3,
  Layers,
  FileCheck,
  CheckCircle2,
  Radio,
  Zap,
} from "lucide-react"
import { ExploreMarketTab } from "../explore/components/ExploreMarketTab"
import { ExploreOrdersTab } from "../explore/components/ExploreOrdersTab"
import { GrowwStockListCard } from "../explore/components/GrowwStockListCard"

export default function MarketsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = (searchParams.get("tab") as "market" | "movers" | "indices" | "orders") || "market"
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Spring Boot Real-time SSE Live Prices Hook
  const {
    quotes: backendQuotes,
    indices: backendIndices,
    isConnected: sseConnected,
    lastTick,
  } = useMarketPrices()

  // Fetch verified operating companies for the exchange
  const { data: allCompaniesData } = useQuery({
    queryKey: ["explore", "companies-all"],
    queryFn: () => exploreService.getCompanies({ size: 300 }),
    staleTime: 60_000,
  })
  const allCompanies = allCompaniesData?.content || []

  // Fetch secondary orders
  const { data: backendOrders = [] } = useQuery({
    queryKey: ["explore", "market-orders"],
    queryFn: () => exploreService.getOrders("ALL"),
    staleTime: 60_000,
  })

  const liveOrders = backendOrders.map((ord) => ({
    id: ord.orderNumber || ord.id,
    company: ord.companyName,
    instrument: ord.shareClass || "Class A Common",
    amount: `$${(ord.totalAmount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    shares: `${(ord.shares ?? 0).toLocaleString()} @ $${(ord.pricePerShare ?? 0).toFixed(2)}`,
    date: ord.executedAt ? ord.executedAt.replace("T", " ").slice(0, 19) : "Pending",
    status: ord.status,
    statusLabel: ord.status === "FILLED" ? "Executed & Settled" : "Pending Escrow Signature",
    badge: ord.status === "FILLED" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500",
  }))

  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Derive Top Gainers and Losers for the movers tab
  const enrichedStocks = allCompanies.map((c) => {
    const q = backendQuotes[c.ticker?.toUpperCase()]
    const price = q ? Number(q.price) : Number(c.valuationNum || 50) % 350 + 20
    const changePercent = q ? Number(q.changePercent) : Number(c.changePercent || 0)
    return {
      id: c.id,
      ticker: c.ticker,
      name: c.name,
      shortName: c.shortName,
      sector: c.sector,
      logoColor: c.logoColor,
      price,
      changePercent,
      isPositive: changePercent >= 0,
    }
  })

  const topGainers = [...enrichedStocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 10)
  const topLosers = [...enrichedStocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 10)

  return (
    <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* MASTER CONTAINER: Consistent Platform Structure */}
      <div className="bg-white dark:bg-[#07090b] rounded-2xl shadow-xs overflow-hidden transition-colors space-y-4 sm:space-y-6">
        
        {/* ROW 1: Market Sub-Nav Links & Live Status Bar */}
        <div className="w-full p-4 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-zinc-800/80">
            {/* Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {[
                { id: "market", label: "Stock Market", icon: BarChart3 },
                { id: "movers", label: "Top Movers", icon: TrendingUp },
                { id: "indices", label: "Indices", icon: Layers },
                { id: "orders", label: "Exchange Orders", icon: FileCheck },
              ].map((tab) => {
                const isActive = activeTab === tab.id
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSearchParams({ tab: tab.id })}
                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? "bg-slate-900 text-white dark:bg-white dark:text-zinc-950 shadow-xs"
                        : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/50"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Live SSE Feed Status Pill */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-[11px] font-mono font-semibold">
              <span className={`h-2 w-2 rounded-full ${sseConnected ? "bg-[#00d09c] animate-ping" : "bg-amber-400"}`} />
              <span className="text-slate-700 dark:text-zinc-300">
                {sseConnected ? "Spring Boot SSE Live" : "Auto-Polling Fallback"}
              </span>
              <span className="text-slate-400 dark:text-zinc-500">
                • Tick #{lastTick}
              </span>
            </div>
          </div>
        </div>

        {/* DYNAMIC MARKET CONTENT */}
        <div className="px-4 sm:px-6 pb-6">
          {/* TAB 1: Stock Market Grid + Groww Top Movers + Trading Modal */}
          {activeTab === "market" && (
            <ExploreMarketTab
              allCompanies={allCompanies}
              onOpenDossier={(identifier) => {
                navigate(`/companies/${identifier}`)
              }}
              onToast={triggerToast}
            />
          )}

          {/* TAB 2: Dedicated Top Movers (Groww Aesthetic) */}
          {activeTab === "movers" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GrowwStockListCard
                  title="Top Gainers (24h)"
                  icon={<span className="text-base select-none">🔥 🔥</span>}
                  items={topGainers}
                  onSelect={(item) => navigate(`/companies/${item.ticker}`)}
                />
                <GrowwStockListCard
                  title="Top Losers (24h)"
                  icon={<span className="text-base select-none">🔻</span>}
                  items={topLosers}
                  onSelect={(item) => navigate(`/companies/${item.ticker}`)}
                />
              </div>
            </div>
          )}

          {/* TAB 3: Market Indices Detail View */}
          {activeTab === "indices" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(backendIndices.length > 0
                  ? backendIndices
                  : [
                      { symbol: "WQ100", name: "WQ Composite 100", valueStr: "4,892.40", changeStr: "+1.24%", isPositive: true, volume: "$1.48B" },
                      { symbol: "WQAI", name: "WQ DeepTech AI Index", valueStr: "6,214.15", changeStr: "+2.01%", isPositive: true, volume: "$642.1M" },
                      { symbol: "WQXF", name: "WQ Fintech 25", valueStr: "3,410.80", changeStr: "-0.42%", isPositive: false, volume: "$489.3M" },
                      { symbol: "WQGRN", name: "WQ CleanEnergy", valueStr: "1,984.30", changeStr: "+0.78%", isPositive: true, volume: "$310.5M" },
                    ]
                ).map((idx) => (
                  <div
                    key={idx.symbol}
                    className="p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-base font-mono text-slate-900 dark:text-white">
                        {idx.symbol}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          idx.isPositive
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-[#00d09c]"
                            : "bg-rose-500/10 text-rose-500"
                        }`}
                      >
                        {idx.changeStr}
                      </span>
                    </div>
                    <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                      {idx.valueStr}
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 pt-2 border-t border-slate-100 dark:border-zinc-900">
                      <span>{idx.name}</span>
                      <span className="font-mono">{idx.volume}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Corporate Secondary Orders */}
          {activeTab === "orders" && (
            <ExploreOrdersTab liveOrders={liveOrders} orderFilter="ALL" />
          )}
        </div>

        {/* Global Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 p-3.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-zinc-950 shadow-2xl flex items-center gap-2 text-xs font-bold border border-slate-800 dark:border-zinc-200 animate-in slide-in-from-bottom-5 duration-200">
            <CheckCircle2 className="h-4 w-4 text-[#00d09c]" />
            <span>{toastMessage}</span>
          </div>
        )}

      </div>
    </div>
  )
}
