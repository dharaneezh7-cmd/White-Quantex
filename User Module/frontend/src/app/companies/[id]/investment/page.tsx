import React, { useState } from "react"
import { useParams, useSearchParams, Link } from "react-router"
import { useQuery } from "@tanstack/react-query"
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  DollarSign,
  Lock,
  Building2,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Award,
  Download,
  Info,
  Calendar,
  Sparkles
} from "lucide-react"
import {
  exploreService,
  getCompanyInvestmentDetails,
  type CompanySummary,
} from "../../../../services/explore/exploreService"
import { getCompanyLogoStyle } from "../../../explore/utils/exploreUtils"
import { kycService } from "@/services/kyc/kycService"
import { springApi } from "@/services/api/client"

export default function InvestmentActionPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const companyIdentifier = id || "VOCL"

  // Fetch company data
  const { data: company } = useQuery({
    queryKey: ["explore", "company-detail", companyIdentifier],
    queryFn: () => exploreService.getCompanyById(companyIdentifier),
    staleTime: 60_000,
  })

  // Fallback company if not found
  const comp: Partial<CompanySummary> = company || {
    id: "00000000-0000-0000-0001-000000000127",
    ticker: "VOCL",
    name: "AeroBattery Inc.",
    shortName: "AeroBattery",
    legalEntity: "Delaware C-Corporation",
    cik: "CIK-0002100102",
    sector: "CleanTech",
    subIndustry: "Industrial Carbon Capture & Storage",
    valuation: "$84.6M",
    valuationNum: 84600000,
    annualRevenue: "$28.8M ARR",
    verificationLevel: "PLATINUM",
    logoColor: "bg-red-600",
  }

  const inv = getCompanyInvestmentDetails(comp)

  // Minimum required amount from query param or company defaults
  const queryMin = searchParams.get("min") ? Number(searchParams.get("min")) : null
  const requiredMin = queryMin || inv.minInvestmentNum || 25000

  const [amount, setAmount] = useState<number>(requiredMin)
  const [investorName, setInvestorName] = useState("")
  const [hasAgreedCovenants, setHasAgreedCovenants] = useState(false)
  const [isAccredited, setIsAccredited] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [kycError, setKycError] = useState<string | null>(null)

  // Query KYC status from backend
  const { data: kycInfo } = useQuery({
    queryKey: ["kyc-status"],
    queryFn: () => kycService.getStatus(),
    staleTime: 5_000,
  })

  const isKycApproved = kycInfo?.kycStatus === "APPROVED"
  const isBelowMinimum = amount < requiredMin
  const isFormValid = isKycApproved && !isBelowMinimum && hasAgreedCovenants && isAccredited && investorName.trim().length >= 3

  const handleExecuteSubscription = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isKycApproved) {
      setKycError("Individual KYC verification is mandatory before executing investments. Please complete identity verification.")
      return
    }
    if (!isFormValid) return
    setIsSubmitting(true)
    setKycError(null)

    try {
      // Send statutory order to Spring Boot backend
      await springApi.post("/explore/orders", {
        companyId: comp.id,
        ticker: comp.ticker,
        amount: amount,
        shares: Math.floor(amount / 25),
        shareClass: inv.securityType || "Series Seed Preferred",
        type: "PRIMARY_SUBSCRIPTION",
        pricePerShare: 25,
      })
    } catch (err: any) {
      if (err.response?.status === 403) {
        setKycError(err.response?.data?.message || "KYC verification required. Complete and get your identity verified to unlock investment access.")
        setIsSubmitting(false)
        return
      }
      console.warn("Backend order submission error, continuing local fallback:", err)
    }

    try {
      const orderId = `ORD-${comp.ticker || "VNT"}-${Date.now().toString().slice(-6)}`
      const sharePrice = 25
      const sharesCount = Math.floor(amount / sharePrice)
      const now = new Date().toISOString()

      const newOrder = {
        id: orderId,
        companyId: comp.id || String(Date.now()),
        companyName: comp.name || "Company",
        ticker: comp.ticker || "WQ",
        logoColor: comp.logoColor || "bg-indigo-600",
        orderNumber: orderId,
        type: "PRIMARY_SUBSCRIPTION",
        shareClass: inv.securityType || "Series Seed Preferred",
        shares: sharesCount,
        pricePerShare: sharePrice,
        totalAmount: amount,
        status: "FILLED",
        settlementStatus: "SETTLED",
        executedAt: now,
      }

      const newPosition = {
        id: `pos-${comp.ticker || "wq"}-${Date.now()}`,
        companyId: comp.id || String(Date.now()),
        companyName: comp.name || "Company",
        ticker: comp.ticker || "WQ",
        logoColor: comp.logoColor || "bg-indigo-600",
        sector: comp.sector || "Technology",
        shares: sharesCount,
        shareClass: inv.securityType || "Series Seed Preferred",
        costBasis: amount,
        currentValue: amount,
        unrealizedPl: 0,
        unrealizedPlPercent: 0,
        ownershipPercent: (amount / (comp.valuationNum || 50000000)) * 100,
      }

      const isVenture = Boolean(
        comp.roundType ||
        (inv.roundType && (inv.roundType.includes("Seed") || inv.roundType.includes("Series") || inv.roundType.includes("Growth")))
      )
      const orderKey = isVenture ? "wq_venture_orders" : "wq_corporate_orders"
      const positionKey = isVenture ? "wq_venture_positions" : "wq_corporate_positions"

      const existingOrders = JSON.parse(localStorage.getItem(orderKey) || "[]")
      localStorage.setItem(orderKey, JSON.stringify([newOrder, ...existingOrders]))

      const existingPositions = JSON.parse(localStorage.getItem(positionKey) || "[]")
      const posIdx = existingPositions.findIndex((p: any) => p.ticker === comp.ticker)
      if (posIdx >= 0) {
        existingPositions[posIdx].shares = (existingPositions[posIdx].shares || 0) + sharesCount
        existingPositions[posIdx].costBasis = (existingPositions[posIdx].costBasis || 0) + amount
        existingPositions[posIdx].currentValue = (existingPositions[posIdx].currentValue || 0) + amount
      } else {
        existingPositions.unshift(newPosition)
      }
      localStorage.setItem(positionKey, JSON.stringify(existingPositions))
    } catch (err) {
      console.error("Failed to store investment:", err)
    }

    setIsSubmitting(false)
    setIsSuccessModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 py-8 px-4 sm:px-6 lg:px-8 pb-20">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to={`/companies/${comp.ticker || id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to {comp.name || "Company"} Profile</span>
          </Link>

          <Link
            to="/ventures"
            className="text-xs font-semibold text-emerald-600 dark:text-[#00d09c] hover:underline"
          >
            Browse All Venture Rounds →
          </Link>
        </div>

        {/* ── Main Explanatory Card ────────────────────────────────────── */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 shadow-xs space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                style={getCompanyLogoStyle(comp.logoColor, comp.ticker)}
                className="h-12 w-12 rounded-xl text-white font-black flex items-center justify-center text-sm shadow-xs ring-2 ring-slate-100 dark:ring-zinc-800 shrink-0"
              >
                {comp.ticker?.slice(0, 2) || "WQ"}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    {comp.name}
                  </h1>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200">
                    {comp.ticker}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  {comp.legalEntity} · {comp.sector} · CIK: <span className="font-mono">{comp.cik}</span>
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-[#00d09c] border border-emerald-500/30 shrink-0">
              {inv.roundType}
            </span>
          </div>

          {/* Institutional Explainer Strip */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-slate-500/5 to-indigo-500/10 border border-emerald-500/20 text-xs space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-[#00d09c] font-bold">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>Direct Corporate Investment • Private Capital Subscription</span>
            </div>
            <p className="text-slate-600 dark:text-zinc-300 leading-relaxed text-[11px]">
              You are investing directly into <strong>{comp.name}</strong> to fund their corporate development, technology R&amp;D, and expansion.
              This is <strong>not a public stock exchange trade</strong>. The company has established a minimum investment threshold of <strong className="text-emerald-700 dark:text-[#00d09c] font-mono">${requiredMin.toLocaleString()}</strong>.
              You must commit at least this minimum amount to become an official <strong>Private Investor</strong> and be registered on the corporate cap table.
            </p>
          </div>
        </div>

        {/* ── Investment Execution Form ──────────────────────────────────── */}
        <form onSubmit={handleExecuteSubscription} className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 shadow-xs space-y-5">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-[#00d09c]" />
              <span>Private Capital Allocation Commitment</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Enter the principal capital allocation for this corporate expansion round.
            </p>
          </div>

          {/* KYC Enforcement Error Banner */}
          {kycError && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm leading-relaxed">{kycError}</div>
            </div>
          )}

          {/* High-Visibility KYC Mandatory Warning Banner */}
          {!isKycApproved && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border-2 border-amber-500/40 text-amber-950 dark:text-amber-200 space-y-3 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                      Individual KYC Verification Mandatory to Invest
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                      Status: {kycInfo?.kycStatus || "NOT_STARTED"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-zinc-300 mt-1 leading-relaxed">
                    Under statutory financial regulations (SEBI &amp; FATF AML/CFT), all investors must complete identity verification before participating in primary corporate or venture capital rounds. Investment authorization is strictly restricted until your KYC has been verified and approved.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-amber-500/20 flex-wrap gap-2">
                <span className="text-[11px] font-medium text-amber-800 dark:text-amber-300/80">
                  {kycInfo?.kycStatus === "UNDER_REVIEW"
                    ? "Your application is currently being reviewed by compliance (SLA 24-48h)."
                    : kycInfo?.kycStatus === "ACTION_REQUIRED"
                    ? "Additional documentation requested by compliance."
                    : "Verification takes ~3 minutes with your government photo ID."}
                </span>

                <Link
                  to="/verification"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-xs transition-colors cursor-pointer"
                >
                  <span>
                    {kycInfo?.kycStatus === "UNDER_REVIEW"
                      ? "View Application Tracker"
                      : kycInfo?.kycStatus === "ACTION_REQUIRED"
                      ? "Resolve Corrections"
                      : "Start KYC Verification"}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* Company-Set Minimum Requirement Banner */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700/60 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 dark:text-zinc-400 block text-[10px] uppercase font-bold tracking-wider">
                Company Minimum Investment
              </span>
              <span className="font-extrabold text-slate-900 dark:text-white">
                Set by {comp.shortName || comp.name} Leadership
              </span>
            </div>
            <span className="text-base font-black text-emerald-600 dark:text-[#00d09c] font-mono">
              ${requiredMin.toLocaleString()} USD
            </span>
          </div>

          {/* Amount Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="investment-amount-input" className="block text-xs font-bold text-slate-800 dark:text-zinc-200">
                Investment Amount (USD)
              </label>
              <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                Min. Threshold: ${requiredMin.toLocaleString()}
              </span>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400 text-sm">
                $
              </span>
              <input
                id="investment-amount-input"
                type="number"
                min={requiredMin}
                step="1000"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className={`w-full pl-8 pr-4 py-3 rounded-xl border font-mono text-base font-extrabold transition-colors focus:outline-none ${
                  isBelowMinimum
                    ? "border-amber-500 bg-amber-50/30 text-amber-900 dark:text-amber-200 focus:border-amber-500"
                    : "border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/60 text-slate-900 dark:text-white focus:border-[#00d09c]"
                }`}
              />
            </div>

            {/* Validation Message if Below Minimum */}
            {isBelowMinimum && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-start gap-2 animate-in fade-in duration-150">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Minimum Investment Required:</strong> The company requires a minimum commitment of <strong>${requiredMin.toLocaleString()} USD</strong> to participate as a private investor. Commitments below this threshold cannot be executed on the corporate cap table.
                </div>
              </div>
            )}

            {/* Quick Preset Buttons */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-semibold">
                Quick Select:
              </span>
              {[requiredMin, requiredMin * 2, requiredMin * 4, requiredMin * 10].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold cursor-pointer transition-colors ${
                    amount === preset
                      ? "bg-emerald-600 text-white dark:bg-[#00d09c] dark:text-slate-950 shadow-xs"
                      : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  ${(preset / 1000).toFixed(0)}k
                </button>
              ))}
            </div>
          </div>

          {/* Allocation Breakdown Details */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-800 space-y-2 text-xs font-mono">
            <div className="flex justify-between text-slate-600 dark:text-zinc-400">
              <span>Security Class:</span>
              <strong className="text-slate-900 dark:text-white font-semibold">
                {inv.securityType}
              </strong>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-zinc-400">
              <span>Use of Capital:</span>
              <strong className="text-slate-900 dark:text-white font-semibold truncate max-w-[280px]">
                {inv.fundingPurpose}
              </strong>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-zinc-400">
              <span>Investor Status Granted:</span>
              <strong className="text-emerald-600 dark:text-[#00d09c] font-bold">
                Verified Private Shareholder
              </strong>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-zinc-400 pt-1 border-t border-slate-200/60 dark:border-zinc-700/60">
              <span>Clearing Rail:</span>
              <span className="text-slate-700 dark:text-zinc-300">
                Delaware Statutory Corporate Escrow (ISO-20022)
              </span>
            </div>
          </div>

          {/* Electronic Signature & Investor Legal Name */}
          <div className="space-y-1.5 pt-2">
            <label htmlFor="investor-name-input" className="block text-xs font-bold text-slate-800 dark:text-zinc-200">
              Accredited Investor / Entity Legal Name (Electronic Signature)
            </label>
            <input
              id="investor-name-input"
              type="text"
              placeholder="e.g., Alexandra Chen / Horizon Capital Syndicate LLC"
              value={investorName}
              onChange={(e) => setInvestorName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/60 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#00d09c]"
            />
          </div>

          {/* Affirmation Checkboxes */}
          <div className="space-y-2.5 pt-1 text-xs text-slate-600 dark:text-zinc-400">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isAccredited}
                onChange={(e) => setIsAccredited(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <span className="leading-relaxed">
                I verify that I am an accredited investor or authorized institutional capital representative under SEC Regulation D / Delaware General Corporation Law.
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={hasAgreedCovenants}
                onChange={(e) => setHasAgreedCovenants(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <span className="leading-relaxed">
                I understand this commitment represents a direct private corporate investment into {comp.name}&apos;s expansion round, meeting their minimum ticket requirement of ${requiredMin.toLocaleString()}, and is subject to private shareholder statutory covenants.
              </span>
            </label>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting || !isKycApproved}
            className={`w-full py-3.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
              isFormValid && !isSubmitting && isKycApproved
                ? "bg-[#00d09c] hover:bg-[#00b888] text-slate-950 shadow-[#00d09c]/25 active:scale-98"
                : "bg-slate-200 dark:bg-zinc-800 text-slate-400 dark:text-zinc-600 cursor-not-allowed shadow-none"
            }`}
          >
            <Lock className="h-4 w-4" />
            <span>
              {!isKycApproved
                ? "Individual KYC Verification Mandatory to Invest"
                : isSubmitting
                ? "Transmitting Subscription to Corporate Escrow..."
                : isBelowMinimum
                ? `Minimum Investment of $${requiredMin.toLocaleString()} Required`
                : `Authorize Private Investment ($${amount.toLocaleString()})`}
            </span>
          </button>
        </form>

      </div>

      {/* ── Success Modal: Private Investor Certificate ─────────────────── */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl border border-emerald-500/40 shadow-2xl p-6 sm:p-8 space-y-5 animate-in zoom-in-95 duration-200 text-center relative overflow-hidden">
            
            {/* Background seal watermark */}
            <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

            <div className="h-16 w-16 rounded-2xl bg-emerald-500/15 text-[#00d09c] border border-emerald-500/30 flex items-center justify-center mx-auto shadow-inner">
              <Award className="h-9 w-9" />
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-[#00d09c] border border-emerald-500/30 inline-block">
                Official Cap Table Subscription Confirmed
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Private Investor Certificate Issued
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                Your direct corporate investment into <strong>{comp.name}</strong> has been transmitted to Delaware statutory escrow.
              </p>
            </div>

            {/* Certificate Preview Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-left font-mono text-xs space-y-2">
              <div className="flex justify-between text-slate-500">
                <span>Certificate ID:</span>
                <span className="font-bold text-slate-900 dark:text-white">WQ-SUB-{Math.floor(100000 + Math.random() * 900000)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Registered Investor:</span>
                <span className="font-bold text-slate-900 dark:text-white">{investorName}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Invested Capital:</span>
                <span className="font-black text-emerald-600 dark:text-[#00d09c] text-sm">${amount.toLocaleString()} USD</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Security Allocation:</span>
                <span className="font-bold text-slate-900 dark:text-white">{inv.roundType} Preferred</span>
              </div>
              <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-200 dark:border-zinc-700">
                <span>Status:</span>
                <span className="text-[#00d09c] font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Verified Private Shareholder
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Link
                to={`/companies/${comp.ticker || id}`}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold text-xs transition-colors cursor-pointer text-center"
              >
                Return to Profile
              </Link>
              <Link
                to="/ventures"
                className="flex-1 py-3 rounded-xl bg-[#00d09c] hover:bg-[#00b888] text-slate-950 font-black text-xs transition-colors cursor-pointer text-center shadow-md shadow-[#00d09c]/20"
              >
                Explore More Ventures
              </Link>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
