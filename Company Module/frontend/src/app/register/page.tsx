import React from "react"
import { Link } from "react-router"
import { Building2, Rocket, ArrowRight, ShieldCheck, ChevronRight, CheckCircle2, UserPlus, LogIn, Check } from "lucide-react"
import { useAuthStore } from "@/stores/auth-store"

export default function CompanyRegistrationHub() {
  const { user, isAuthenticated } = useAuthStore()

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl mx-auto space-y-10">

        {/* Breadcrumb & Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#00d09c]/10 text-[#00a87e] dark:text-[#00d09c] border border-[#00d09c]/30">
            <ShieldCheck className="h-3.5 w-3.5" /> SEC Rule 506(c) & Delaware Statutory Compliance
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[var(--wq-fg)] tracking-tight">
            Corporate & Venture Registration Portal
          </h1>
          <p className="text-xs sm:text-sm text-[var(--wq-fg-muted)] max-w-2xl mx-auto leading-relaxed">
            Register your company or venture on the White Quantex investment ecosystem. All entities undergo compliance checks and receive an algorithmic Trust Score on our Spring Boot PostgreSQL Truth Engine.
          </p>
        </div>

        {/* Step 1 Account Banner */}
        {!isAuthenticated ? (
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-[#00d09c]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-[#00d09c]">
                <UserPlus className="h-3.5 w-3.5" /> Step 1: Representative Account Required
              </span>
              <h3 className="text-sm sm:text-base font-bold text-[var(--wq-fg)]">
                Create an account using your email first
              </h3>
              <p className="text-xs text-[var(--wq-fg-muted)] max-w-lg">
                Before submitting corporate or venture legal disclosures, create your authorized representative account with your email.
              </p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <Link
                to="/signup"
                className="px-4 py-2.5 rounded-xl bg-[#00d09c] text-black font-extrabold text-xs hover:bg-[#00b888] shadow-md shadow-[#00d09c]/20 transition-all inline-flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Create Account</span>
              </Link>
              <Link
                to="/login"
                className="px-4 py-2.5 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] hover:bg-[var(--wq-bg-surface)] text-xs font-bold text-[var(--wq-fg)] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xs text-emerald-700 dark:text-emerald-300">
              <div className="h-6 w-6 rounded-full bg-emerald-500 text-black flex items-center justify-center font-bold">
                <Check className="h-3.5 w-3.5" />
              </div>
              <span>
                Account Verified: <strong>{user?.displayName || `${user?.firstName} ${user?.lastName}`}</strong> ({user?.email}) · Authorized to register entities
              </span>
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              Active Session
            </span>
          </div>
        )}

        {/* Dual Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Company Registration Track */}
          <div className="flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-[var(--wq-bg-surface)] border border-[var(--wq-border)] hover:border-blue-500/50 shadow-lg hover:shadow-xl transition-all duration-300 relative group">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-105 transition-transform">
                  <Building2 className="h-7 w-7" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                  Corporate Track
                </span>
              </div>

              <div>
                <h2 className="text-xl font-extrabold text-[var(--wq-fg)] mb-2">
                  Established Corporate Issuer
                </h2>
                <p className="text-xs text-[var(--wq-fg-muted)] leading-relaxed">
                  For registered C-Corps, LLCs, and operating commercial enterprises seeking institutional listing, secondary share liquidity, and cap-table registry management.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-[var(--wq-border)]">
                <span className="text-[11px] font-bold text-[var(--wq-fg)] block">Track Features:</span>
                <ul className="space-y-1.5 text-xs text-[var(--wq-fg-muted)]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    <span>SEC CIK & Legal Entity Verification</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    <span>Tier-1 / Tier-2 Secondary Order Book Integration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    <span>Algorithmic Trust Score & Valuation Metrics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    <span>Direct Institutional Investor Placement</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-[var(--wq-border)]">
              <Link
                to={isAuthenticated ? "/register/company" : "/signup?next=/register/company"}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Register as Corporate Issuer</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Venture Registration Track */}
          <div className="flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-[var(--wq-bg-surface)] border border-[var(--wq-border)] hover:border-purple-500/50 shadow-lg hover:shadow-xl transition-all duration-300 relative group">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="h-14 w-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-105 transition-transform">
                  <Rocket className="h-7 w-7" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 uppercase tracking-wider">
                  Venture Track
                </span>
              </div>

              <div>
                <h2 className="text-xl font-extrabold text-[var(--wq-fg)] mb-2">
                  Startup & Venture Launchpad
                </h2>
                <p className="text-xs text-[var(--wq-fg-muted)] leading-relaxed">
                  For early-stage tech ventures, pre-seed/seed startups, and breakthrough technology founders preparing for seed rounds and venture syndicate backing.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-[var(--wq-border)]">
                <span className="text-[11px] font-bold text-[var(--wq-fg)] block">Track Features:</span>
                <ul className="space-y-1.5 text-xs text-[var(--wq-fg-muted)]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                    <span>White Quantex Pre-Listing Showcase</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                    <span>Pitch Deck & Diligence Data Room Setup</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                    <span>Syndicate & Angel Investor Direct Matching</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                    <span>Smart Escrow Custody for Fundraising</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-[var(--wq-border)]">
              <Link
                to={isAuthenticated ? "/register/venture" : "/signup?next=/register/venture"}
                className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Register as Venture / Startup</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

        </div>

        {/* Need Guidance banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--wq-bg-surface)] border border-[var(--wq-border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-xs sm:text-sm font-bold text-[var(--wq-fg)]">
              Unsure which track fits your organization?
            </h4>
            <p className="text-xs text-[var(--wq-fg-muted)]">
              Read our institutional listing standards and accreditation requirements on the About page.
            </p>
          </div>
          <Link
            to="/about"
            className="px-4 py-2 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] hover:bg-[var(--wq-bg-surface)] text-xs font-bold text-[var(--wq-fg)] inline-flex items-center gap-1.5 transition-colors shrink-0"
          >
            <span>Learn About WQ Standards</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

      </div>
    </div>
  )
}
