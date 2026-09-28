import React, { useState } from "react"
import { Link } from "react-router"
import {
  ShieldCheck,
  Building2,
  Rocket,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Award,
  Lock,
  Scale,
  LineChart,
  Users2,
  HelpCircle,
  ExternalLink,
} from "lucide-react"

export default function AboutPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const faqs = [
    {
      q: "What is the difference between Corporate Issuer and Venture tracks?",
      a: "The Corporate Issuer track is intended for operating, incorporated enterprises (Delaware C-Corps, LLCs) with verifiable revenues, balance sheets, and cap tables looking for secondary liquidity. The Venture track is designed for early-stage tech founders seeking initial angel syndicates and strategic growth investment.",
    },
    {
      q: "Can pre-revenue startups apply under the Venture track?",
      a: "Yes. Early-stage startups in AI, CleanTech, DeepTech, and SaaS can register under the Venture track. Evaluation is focused on team credentials, intellectual property, product roadmap, and pitch deck validation.",
    },
    {
      q: "How does the White Quantex Trust Score work?",
      a: "The Trust Score (0-100) is an algorithmic grading system that evaluates corporate compliance, statutory filing history, executive verification, cap-table auditability, and reporting consistency. Scores 90+ achieve Platinum Tier status.",
    },
    {
      q: "What regulatory framework does White Quantex operate under?",
      a: "All private secondary trading and investment placements adhere strictly to SEC Rule 506(c) accredited investor standards, Delaware Statutory governance, and automated KYC/AML verification for all participating parties.",
    },
    {
      q: "How does smart escrow settlement protect issuers and investors?",
      a: "White Quantex integrates programmatic escrow custody. Capital is placed into escrow before share issuance orders settle, ensuring instant clearing (T+0) without counterparty risk or dilution disputes.",
    },
  ]

  const comparison = [
    {
      feature: "Target Entity Type",
      corporate: "Operating C-Corps, LLCs, Mid-market",
      venture: "Early-stage startups, Pre-seed, Seed, Series A",
    },
    {
      feature: "Revenue Requirement",
      corporate: "Demonstrated ARR or operating revenue",
      venture: "Pre-revenue or early customer traction",
    },
    {
      feature: "Primary Benefit",
      corporate: "Secondary share trading & cap-table registry",
      venture: "Venture syndicate fundraising & showcase",
    },
    {
      feature: "Verification Standard",
      corporate: "SEC CIK + Full Financial Disclosures",
      venture: "Founder KYC + Pitch Deck & IP Audit",
    },
    {
      feature: "Market Placement",
      corporate: "Master Directory & Secondary Order Book",
      venture: "Pre-Listing & WQ Algorithmic Recommendations",
    },
    {
      feature: "Typical Review Timeline",
      corporate: "2 to 4 business days",
      venture: "1 to 3 business days",
    },
  ]

  return (
    <div className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 space-y-16 max-w-6xl mx-auto">

      {/* ── 1. HEADER ────────────────────────────────────────────────────── */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#00d09c]/10 text-[#00a87e] dark:text-[#00d09c] border border-[#00d09c]/30">
          <ShieldCheck className="h-3.5 w-3.5" /> Institutional Standards & Governance
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[var(--wq-fg)] tracking-tight">
          About White Quantex Authority
        </h1>
        <p className="text-xs sm:text-sm text-[var(--wq-fg-muted)] leading-relaxed">
          The sovereign technological infrastructure bridging verified private corporations and high-growth ventures with institutional capital markets.
        </p>
      </div>

      {/* ── 2. MISSION & CORE PILLARS ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-[var(--wq-bg-surface)] border border-[var(--wq-border)] space-y-3">
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Scale className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-[var(--wq-fg)]">Truth Engine Governance</h3>
          <p className="text-xs text-[var(--wq-fg-muted)] leading-relaxed">
            Eliminating private market opacity with an immutable PostgreSQL audit ledger where cap tables, valuations, and secondary share transfers are cryptographically synchronized.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[var(--wq-bg-surface)] border border-[var(--wq-border)] space-y-3">
          <div className="h-10 w-10 rounded-xl bg-[#00d09c]/10 flex items-center justify-center text-[#00a87e] dark:text-[#00d09c]">
            <Lock className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-[var(--wq-fg)]">SEC Rule 506(c) Custody</h3>
          <p className="text-xs text-[var(--wq-fg-muted)] leading-relaxed">
            Strict investor accreditation checks ensure every bid and ask in secondary order books is backed by verified institutional participants and smart escrow settlements.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[var(--wq-bg-surface)] border border-[var(--wq-border)] space-y-3">
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
            <LineChart className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-[var(--wq-fg)]">Dynamic Market Intelligence</h3>
          <p className="text-xs text-[var(--wq-fg-muted)] leading-relaxed">
            Continuous valuation discovery, 24-hour trading volume tracking, and market cap metrics bring public-market clarity to private equity instruments.
          </p>
        </div>
      </div>

      {/* ── 3. COMPARISON TABLE ─────────────────────────────────────────── */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl sm:text-3xl font-extrabold text-[var(--wq-fg)]">
            Registration Track Comparison
          </h2>
          <p className="text-xs sm:text-sm text-[var(--wq-fg-muted)]">
            Review requirements and deliverables for each listing pathway.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[var(--wq-border)] bg-[var(--wq-bg-surface)] shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--wq-bg-elevated)] border-b border-[var(--wq-border)] text-[var(--wq-fg)] uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-4 px-6 font-extrabold">Criterion</th>
                <th className="py-4 px-6 font-extrabold text-blue-600 dark:text-blue-400">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4" /> Corporate Issuer Track
                  </span>
                </th>
                <th className="py-4 px-6 font-extrabold text-purple-600 dark:text-purple-400">
                  <span className="flex items-center gap-1.5">
                    <Rocket className="h-4 w-4" /> Venture Launchpad Track
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--wq-border)]">
              {comparison.map((row, idx) => (
                <tr key={idx} className="hover:bg-[var(--wq-bg-elevated)]/50 transition-colors">
                  <td className="py-3.5 px-6 font-bold text-[var(--wq-fg)]">{row.feature}</td>
                  <td className="py-3.5 px-6 text-[var(--wq-fg-muted)]">{row.corporate}</td>
                  <td className="py-3.5 px-6 text-[var(--wq-fg-muted)]">{row.venture}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 4. TRUST SCORE TIERS ─────────────────────────────────────────── */}
      <div className="p-8 rounded-3xl bg-[var(--wq-bg-surface)] border border-[var(--wq-border)] space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#00d09c]">Rating Hierarchy</span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--wq-fg)]">
            Algorithmic Trust Score & Accreditation Tiers
          </h2>
          <p className="text-xs text-[var(--wq-fg-muted)]">
            Every registered entity on White Quantex is monitored and scored against four core tiers:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-2">
            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500 text-white uppercase">
              Platinum Tier
            </span>
            <p className="text-xl font-black text-emerald-500">Score 90 – 100</p>
            <p className="text-[11px] text-[var(--wq-fg-muted)] leading-relaxed">
              Audited financials, CIK registry confirmed, clean balance sheet, active institutional trading status.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-2">
            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-amber-500 text-white uppercase">
              Gold Tier
            </span>
            <p className="text-xl font-black text-amber-500">Score 75 – 89</p>
            <p className="text-[11px] text-[var(--wq-fg-muted)] leading-relaxed">
              Verified Delaware C-Corp/LLC entity, reviewed founder credentials, documented ARR, active due diligence.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 space-y-2">
            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-blue-500 text-white uppercase">
              Silver Tier
            </span>
            <p className="text-xl font-black text-blue-500">Score 60 – 74</p>
            <p className="text-[11px] text-[var(--wq-fg-muted)] leading-relaxed">
              Early-stage venture track with completed founder KYC and verified pitch deck; pre-revenue or seed stage.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-500/30 bg-slate-500/5 space-y-2">
            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-slate-500 text-white uppercase">
              Bronze / Pending
            </span>
            <p className="text-xl font-black text-slate-500">Score &lt; 60</p>
            <p className="text-[11px] text-[var(--wq-fg-muted)] leading-relaxed">
              Under initial compliance review. Documentation submitted, pending formal verification clearing.
            </p>
          </div>
        </div>
      </div>

      {/* ── 5. FAQ SECTION ──────────────────────────────────────────────── */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl sm:text-3xl font-extrabold text-[var(--wq-fg)] flex items-center justify-center gap-2">
            <HelpCircle className="h-6 w-6 text-[#00d09c]" /> Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-[var(--wq-fg-muted)]">
            Clear answers to common questions about White Quantex registration and compliance.
          </p>
        </div>

        <div className="space-y-3 max-w-3xl mx-auto">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx
            return (
              <div
                key={idx}
                className="rounded-2xl border border-[var(--wq-border)] bg-[var(--wq-bg-surface)] overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left font-bold text-xs sm:text-sm text-[var(--wq-fg)] flex items-center justify-between gap-4 cursor-pointer hover:bg-[var(--wq-bg-elevated)]/50 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="h-4 w-4 shrink-0 text-[#00d09c]" /> : <ChevronDown className="h-4 w-4 shrink-0 text-[var(--wq-fg-muted)]" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs text-[var(--wq-fg-muted)] leading-relaxed border-t border-[var(--wq-border)]/50">
                    <p className="pt-3">{faq.a}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── 6. READY TO REGISTER CTA ────────────────────────────────────── */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-950/20 via-[var(--wq-bg-surface)] to-purple-950/20 border border-[var(--wq-border)] text-center space-y-6 shadow-xl">
        <div className="space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--wq-fg)]">
            Begin Your Entity Registration
          </h2>
          <p className="text-xs text-[var(--wq-fg-muted)] leading-relaxed">
            The submission process takes approximately 5 minutes on the Corporate & Venture Portal.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="http://localhost:7001/register/company"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Building2 className="h-4 w-4" />
            <span>Register as Corporate Issuer (Port 7001)</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <a
            href="http://localhost:7001/register/venture"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Rocket className="h-4 w-4" />
            <span>Register as Venture Launchpad (Port 7001)</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

    </div>
  )
}
