import React, { useState, useEffect } from "react"
import { Link } from "react-router"
import { motion, AnimatePresence } from "framer-motion"
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building2,
  ArrowRight,
  BarChart3,
  Award,
  Layers,
  Percent,
  Clock,
  ShieldCheck,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { companyService } from "@/services/company/companyService"
import { CorporateAccessGuard } from "@/components/shared/CorporateAccessGuard"

interface CompanyItem {
  id: string
  ticker: string
  name: string
  sector: string
  valuation: string
  valuationNum: number
  annualRevenue: string
}

const DEFAULT_COMPANIES: CompanyItem[] = [
  { id: "comp-1", ticker: "ZEPR", name: "AeroFusion Technologies Ltd.", sector: "SpaceTech & Aerospace", valuation: "$324.7M", valuationNum: 324700000, annualRevenue: "$86.5M ARR" },
  { id: "comp-2", ticker: "VOCL", name: "AeroBattery Inc.", sector: "CleanTech & Energy", valuation: "$491.3M", valuationNum: 491300000, annualRevenue: "$124.0M ARR" },
  { id: "comp-3", ticker: "OCGN", name: "OmniCognition Labs", sector: "AI & Machine Learning", valuation: "$212.4M", valuationNum: 212400000, annualRevenue: "$58.2M ARR" },
  { id: "comp-4", ticker: "TFLOW", name: "TeraFlow BioTech", sector: "Biotech & Health", valuation: "$179.3M", valuationNum: 179300000, annualRevenue: "$44.8M ARR" },
  { id: "comp-5", ticker: "VGRD", name: "VerdeGrid Energy Systems", sector: "CleanTech & Energy", valuation: "$259.5M", valuationNum: 259500000, annualRevenue: "$71.2M ARR" },
]

export default function QuarterlyFinancialsPage() {
  const [companies, setCompanies] = useState<CompanyItem[]>(DEFAULT_COMPANIES)
  const [selectedTicker, setSelectedTicker] = useState<string>("ZEPR")
  const [quarter, setQuarter] = useState<string>("Q3 2026")
  const [fiscalYear, setFiscalYear] = useState<number>(2026)
  const [revenueInput, setRevenueInput] = useState<string>("24.5")
  const [profitInput, setProfitInput] = useState<string>("6.8")
  const [growthRateInput, setGrowthRateInput] = useState<string>("26.5")
  const [milestones, setMilestones] = useState<string>(
    "Surpassed annualized net margins through commercial enterprise cloud expansion and SEC Delaware statutory clearance."
  )

  const [loading, setLoading] = useState<boolean>(false)
  const [successResult, setSuccessResult] = useState<any | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [history, setHistory] = useState<any[]>([])

  // Load companies from backend or localStorage
  useEffect(() => {
    async function loadCompanies() {
      try {
        const res = await companyService.getRegisteredCompanies()
        if (res?.data?.content && res.data.content.length > 0) {
          const mapped = res.data.content.slice(0, 20).map((c: any) => ({
            id: c.id,
            ticker: c.ticker,
            name: c.name,
            sector: c.sector,
            valuation: c.valuation,
            valuationNum: c.valuationNum || 100000000,
            annualRevenue: c.annualRevenue,
          }))
          setCompanies(mapped)
          setSelectedTicker(mapped[0].ticker)
        }
      } catch {
        try {
          const savedStr = localStorage.getItem("wq_registered_companies")
          if (savedStr) {
            const parsed = JSON.parse(savedStr)
            if (parsed.length > 0) {
              setCompanies([...parsed, ...DEFAULT_COMPANIES])
              setSelectedTicker(parsed[0].ticker)
            }
          }
        } catch {}
      }
    }
    loadCompanies()
  }, [])

  // Load quarterly history when ticker changes
  useEffect(() => {
    async function fetchHistory() {
      if (!selectedTicker) return
      try {
        const res = await companyService.getQuarterlyFinancials(selectedTicker)
        if (res?.data && Array.isArray(res.data)) {
          setHistory(res.data)
        }
      } catch {
        setHistory([])
      }
    }
    fetchHistory()
  }, [selectedTicker, successResult])

  const selectedCompany = companies.find((c) => c.ticker === selectedTicker) || companies[0]

  // Calculated Preview values
  const revNum = (parseFloat(revenueInput) || 0) * 1_000_000
  const profNum = (parseFloat(profitInput) || 0) * 1_000_000
  const expNum = Math.max(0, revNum - profNum)
  const marginPct = revNum > 0 ? ((profNum / revNum) * 100).toFixed(1) : "0.0"

  // Projected Market Cap Boost
  const annualizedRev = revNum * 4
  const projectedMarketCap = annualizedRev * 4.2 + (profNum > 0 ? profNum * 4 * 10 : 0)
  const currentValNum = selectedCompany?.valuationNum || 100_000_000
  const marketCapDeltaPct = currentValNum > 0 ? (((projectedMarketCap - currentValNum) / currentValNum) * 100).toFixed(1) : "12.5"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")
    setSuccessResult(null)

    if (revNum <= 0) {
      setErrorMessage("Quarterly revenue must be greater than zero.")
      return
    }

    setLoading(true)
    try {
      const qNum = quarter.includes("1") ? 1 : quarter.includes("2") ? 2 : quarter.includes("3") ? 3 : 4
      const result = await companyService.submitQuarterlyFinancials(selectedTicker, {
        quarter,
        fiscalYear,
        quarterNumber: qNum,
        revenue: revNum,
        profit: profNum,
        expenses: expNum,
        growthRate: parseFloat(growthRateInput) || 15.0,
        milestones: milestones.trim(),
      })

      setSuccessResult(result.data)
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || "Failed to submit quarterly financials. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <CorporateAccessGuard strictBlock={true}>
      <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold font-mono text-emerald-600 dark:text-[#00d09c] mb-1">
              <Calendar className="h-4 w-4" />
              <span>3-MONTH STATUTORY REPORTING CYCLE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Quarterly Financials & Market Cap Valuation
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
              Report 3-month corporate revenue and profit to dynamically calibrate your secondary market valuation, demand index, and stock price.
            </p>
          </div>

          <Link
            to="/post"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-bold hover:opacity-90 transition-opacity self-start md:self-auto cursor-pointer"
          >
            <span>Publish Community Update</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Success Alert */}
        <AnimatePresence>
          {successResult && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-950 dark:text-emerald-200 space-y-3"
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <span>Quarterly Financials Processed & Market Cap Adjusted Successfully!</span>
              </div>
              <p className="text-xs text-emerald-800 dark:text-emerald-300">
                The revenue and profit metrics for <strong>{selectedCompany.name} ({selectedTicker})</strong> have been verified.
                The live secondary market price surged to <strong>${successResult.newSharePrice?.toFixed(2) || "Higher"}</strong> with a new enterprise valuation of <strong>{successResult.newValuation}</strong>.
                An official earnings disclosure has been broadcasted to the Ecosystem Community feed.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <span className="text-[11px] font-mono bg-emerald-500/20 px-2.5 py-1 rounded-lg font-bold">
                  24h Performance: {successResult.changePercent || "+5.20%"}
                </span>
                <Link
                  to={`http://localhost:7000/markets/${selectedTicker}`}
                  target="_blank"
                  className="text-xs font-bold text-emerald-600 dark:text-[#00d09c] hover:underline inline-flex items-center gap-1"
                >
                  <span>View Live Chart in User Module</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form Column (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-6 shadow-sm">
              
              {/* Company Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
                  Select Registered Issuer / Company
                </label>
                <select
                  value={selectedTicker}
                  onChange={(e) => setSelectedTicker(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-sm font-semibold focus:outline-none focus:border-[#00d09c]"
                >
                  {companies.map((c) => (
                    <option key={c.ticker} value={c.ticker}>
                      {c.name} ({c.ticker}) — {c.sector} [Valuation: {c.valuation}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Reporting Period */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
                    Reporting Quarter (Every 3 Months)
                  </label>
                  <select
                    value={quarter}
                    onChange={(e) => setQuarter(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-bold focus:outline-none focus:border-[#00d09c]"
                  >
                    <option value="Q1 2026">Q1 2026 (Jan - Mar)</option>
                    <option value="Q2 2026">Q2 2026 (Apr - Jun)</option>
                    <option value="Q3 2026">Q3 2026 (Jul - Sep)</option>
                    <option value="Q4 2026">Q4 2026 (Oct - Dec)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
                    Fiscal Year
                  </label>
                  <input
                    type="number"
                    value={fiscalYear}
                    onChange={(e) => setFiscalYear(parseInt(e.target.value) || 2026)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-bold focus:outline-none focus:border-[#00d09c]"
                  />
                </div>
              </div>

              {/* Revenue & Profit Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
                    Quarterly Revenue ($M)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">$</span>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      required
                      value={revenueInput}
                      onChange={(e) => setRevenueInput(e.target.value)}
                      placeholder="24.5"
                      className="w-full pl-8 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-mono font-bold focus:outline-none focus:border-[#00d09c]"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">M</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
                    Quarterly Net Profit ($M)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">$</span>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={profitInput}
                      onChange={(e) => setProfitInput(e.target.value)}
                      placeholder="6.8"
                      className="w-full pl-8 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-mono font-bold focus:outline-none focus:border-[#00d09c]"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">M</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
                    YoY Growth Rate (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={growthRateInput}
                      onChange={(e) => setGrowthRateInput(e.target.value)}
                      placeholder="26.5"
                      className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-mono font-bold focus:outline-none focus:border-[#00d09c]"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                  </div>
                </div>
              </div>

              {/* Milestones / Key Achievements */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
                  Quarterly Achievements & Commercial Milestones
                </label>
                <textarea
                  rows={3}
                  required
                  value={milestones}
                  onChange={(e) => setMilestones(e.target.value)}
                  placeholder="Detail major product releases, customer acquisition breakthroughs, ARR records, or patent approvals..."
                  className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs leading-relaxed focus:outline-none focus:border-[#00d09c]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[#00d09c] text-black font-extrabold text-xs hover:bg-[#00b888] shadow-lg shadow-[#00d09c]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span>{loading ? "Processing Financial Audit & Price Calibration..." : `Submit ${quarter} Financials & Update Market Valuation`}</span>
              </button>
            </form>

            {/* Historical Quarterly Reports */}
            {history.length > 0 && (
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-zinc-800">
                  <BarChart3 className="h-4 w-4 text-[#00d09c]" />
                  <h3 className="text-sm font-bold">Historical 3-Month Performance Filings</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {history.map((h, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs">{h.quarter}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-[#00d09c]">
                          +{h.growthRate}% YoY
                        </span>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between text-slate-500 dark:text-zinc-400 text-[11px]">
                          <span>Revenue</span>
                          <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                            ${(h.revenue / 1_000_000).toFixed(1)}M
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-500 dark:text-zinc-400 text-[11px]">
                          <span>Profit</span>
                          <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                            ${(h.profit / 1_000_000).toFixed(1)}M
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-500 dark:text-zinc-400 text-[11px]">
                          <span>Margin</span>
                          <span className="font-mono font-bold text-emerald-600 dark:text-[#00d09c]">
                            {h.profitMargin}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dynamic Valuation Preview Column (1 Col) */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-6 shadow-sm sticky top-24">
              
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
                <TrendingUp className="h-4 w-4 text-[#00d09c]" />
                <h3 className="text-sm font-bold">Real-Time Valuation Impact</h3>
              </div>

              {/* Selected Company Card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  Target Issuer
                </span>
                <p className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                  {selectedCompany.name}
                </p>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 font-bold">{selectedTicker}</span>
                  <span className="text-slate-500">{selectedCompany.sector}</span>
                </div>
              </div>

              {/* Metrics Breakdown */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-zinc-800">
                  <span className="text-slate-500 dark:text-zinc-400">Current Valuation</span>
                  <span className="font-mono font-bold">{selectedCompany.valuation}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-zinc-800">
                  <span className="text-slate-500 dark:text-zinc-400">Projected Run-Rate (ARR)</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                    ${(annualizedRev / 1_000_000).toFixed(1)}M ARR
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-zinc-800">
                  <span className="text-slate-500 dark:text-zinc-400">Net Profit Margin</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-[#00d09c]">
                    {marginPct}%
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-zinc-800">
                  <span className="text-slate-500 dark:text-zinc-400">Projected Valuation</span>
                  <span className="font-mono font-extrabold text-[#00d09c] text-sm">
                    ${(projectedMarketCap / 1_000_000).toFixed(1)}M
                  </span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-500 dark:text-zinc-400">Estimated Market Surge</span>
                  <span className="font-mono font-extrabold text-emerald-500">
                    +{marketCapDeltaPct}%
                  </span>
                </div>
              </div>

              {/* Statutory Note */}
              <div className="p-3.5 rounded-xl bg-indigo-500/5 dark:bg-indigo-950/20 border border-indigo-500/20 text-[11px] text-slate-600 dark:text-zinc-400 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Truth Engine Compliance</span>
                </div>
                <p>
                  Every 3-month submission recalculates order-book liquidity and triggers automated Delaware C-Corp disclosure records across White Quantex.
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>
      </div>
    </CorporateAccessGuard>
  )
}
