import React from "react"
import { Link } from "react-router"
import { Building2, Rocket, ShieldAlert, ArrowRight, ExternalLink, LogOut, CheckCircle2, UserCheck } from "lucide-react"
import { useAuthStore } from "@/stores/auth-store"

interface CorporateAccessGuardProps {
  children: React.ReactNode
  /**
   * If true, non-corporate users will see a full-page access barrier.
   * If false, displays a warning banner at the top of the content.
   */
  strictBlock?: boolean
  requiredEntity?: "COMPANY" | "VENTURE" | "ANY"
}

export function CorporateAccessGuard({
  children,
  strictBlock = true,
  requiredEntity = "ANY",
}: CorporateAccessGuardProps) {
  const { user, isAuthenticated, clearAuth } = useAuthStore()

  // Determine if the current session represents a corporate or venture entity
  const isCorporateOrFounder = React.useMemo(() => {
    if (!isAuthenticated || !user) return false

    // Check roles
    const roles = user.roles || (user.primaryRole ? [user.primaryRole] : [])
    const hasRole = roles.some((r) => {
      const up = String(r).toUpperCase()
      return (
        up.includes("CORP") ||
        up.includes("FOUNDER") ||
        up.includes("COMPANY") ||
        up.includes("VENTURE") ||
        up.includes("OFFICER") ||
        up.includes("EXECUTIVE") ||
        up.includes("ADMIN")
      )
    })

    if (hasRole) return true

    // Check accountType
    const accType = String(user.accountType || "").toUpperCase()
    if (
      accType.includes("ORGANIZATION") ||
      accType.includes("CORPORATE") ||
      accType.includes("VENTURE")
    ) {
      return true
    }

    // Check if user has registered a company locally
    if (typeof window !== "undefined") {
      try {
        const localComps = localStorage.getItem("wq_registered_companies")
        if (localComps && JSON.parse(localComps).length > 0) {
          return true
        }
      } catch {}
    }

    return false
  }, [isAuthenticated, user])

  // If user is logged in as an individual/retail user with no corporate credentials
  const isIndividualUserOnly = isAuthenticated && !isCorporateOrFounder

  if (isIndividualUserOnly && strictBlock) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl bg-white dark:bg-[#121215] rounded-3xl border border-amber-500/30 p-8 sm:p-10 shadow-2xl space-y-6 text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <ShieldAlert className="h-4 w-4" />
            <span>Corporate & Venture Portal Access Only</span>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Company Module is Reserved for Issuers & Ventures
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
              You are signed in as <strong className="text-slate-900 dark:text-white">{user?.displayName || user?.email}</strong> with an individual user/investor account. This module is strictly reserved for registered corporate entities and startup ventures.
            </p>
          </div>

          {/* Side-by-Side Domain Explanation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#18181b] border border-slate-200/80 dark:border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <ExternalLink className="h-4 w-4 text-[#00d09c]" />
                <span>User Module (Port 7000)</span>
              </div>
              <ul className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                <li>• Explore established companies</li>
                <li>• Discover & invest in startup ventures</li>
                <li>• Trade secondary shares & track market cap</li>
                <li>• Manage personal investor holdings</li>
                <li>• Community feed & discussions</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-[#00d09c]">
                <Building2 className="h-4 w-4" />
                <span>Company Module (Port 7001)</span>
              </div>
              <ul className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                <li>• Register corporate entity (C-Corp / LLC)</li>
                <li>• Launch startup venture rounds</li>
                <li>• File 3-month quarterly financials</li>
                <li>• Publish verified corporate milestones</li>
                <li>• Corporate cap-table management</li>
              </ul>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <a
              href="http://localhost:7000"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#00d09c] text-black font-extrabold text-xs hover:bg-[#00b888] shadow-md shadow-[#00d09c]/20 transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Return to User Portal (Port 7000)</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>

            <Link
              to="/register"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-zinc-950 font-bold text-xs hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <Rocket className="h-3.5 w-3.5" />
              <span>Register a Company or Venture</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                clearAuth()
                window.location.href = "/login"
              }}
              className="w-full sm:w-auto px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {isIndividualUserOnly && !strictBlock && (
        <div className="w-full bg-amber-500/10 border-b border-amber-500/30 px-4 py-2.5 text-xs text-amber-700 dark:text-amber-300 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              <strong>Company & Venture Portal:</strong> You are currently logged in with an individual account. General user features are on the{" "}
              <a href="http://localhost:7000" className="underline font-bold hover:text-amber-900 dark:hover:text-amber-100">
                User Portal
              </a>
              .
            </span>
          </div>
          <a
            href="http://localhost:7000"
            className="shrink-0 px-2.5 py-1 rounded-lg bg-amber-500 text-black text-[11px] font-bold hover:bg-amber-400 transition-colors inline-flex items-center gap-1"
          >
            <span>User Portal</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
      {children}
    </>
  )
}
