import React, { useState, useEffect } from "react"
import { Link, useSearchParams } from "react-router"
import { CheckCircle, ArrowRight, ShieldCheck, Copy, Check, Building2, Rocket } from "lucide-react"

export default function RegistrationSuccessPage() {
  const [searchParams] = useSearchParams()
  const idFromQuery = searchParams.get("id")
  const typeFromQuery = searchParams.get("type")
  const tickerFromQuery = searchParams.get("ticker")

  const [entityInfo, setEntityInfo] = useState<{
    id: string
    name: string
    ticker: string
    type: string
    legalEntity?: string
  } | null>(null)

  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("wq_last_registered_entity")
        if (stored) {
          setEntityInfo(JSON.parse(stored))
        } else if (idFromQuery) {
          setEntityInfo({
            id: idFromQuery,
            name: tickerFromQuery || "Registered Entity",
            ticker: tickerFromQuery || "CORP",
            type: (typeFromQuery || "company").toUpperCase()
          })
        }
      } catch {}
    }
  }, [idFromQuery, typeFromQuery, tickerFromQuery])

  const copyIdToClipboard = () => {
    const idToCopy = entityInfo?.id || idFromQuery
    if (idToCopy) {
      navigator.clipboard.writeText(idToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const isVenture = (entityInfo?.type || typeFromQuery)?.toLowerCase() === "venture"
  const entityId = entityInfo?.id || idFromQuery || "Generated upon confirmation"

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-lg space-y-6 bg-[var(--wq-bg-surface)] p-8 rounded-2xl border border-[var(--wq-border)] shadow-xl text-center">

        <div className="mx-auto h-16 w-16 rounded-full bg-[#00d09c]/10 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-[#00d09c]" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-[#00d09c] border border-emerald-500/20">
            {isVenture ? <Rocket className="h-3.5 w-3.5" /> : <Building2 className="h-3.5 w-3.5" />}
            {isVenture ? "Venture Entity Registered" : "Corporate Issuer Registered"}
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--wq-fg)]">
            Registration Submitted Successfully
          </h1>
          <p className="text-xs text-[var(--wq-fg-muted)] leading-relaxed">
            Your {isVenture ? "venture startup" : "corporate company"} profile has been registered on the White Quantex shared Truth Engine and assigned an authoritative entity ID.
          </p>
        </div>

        {/* Assigned Unique ID Card */}
        <div className="p-4 rounded-xl bg-[var(--wq-bg-elevated)] border border-[var(--wq-border)] text-left space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--wq-border)] pb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--wq-fg-muted)]">
              {isVenture ? "Venture ID" : "Company ID"}
            </span>
            <span className="text-xs font-mono font-bold text-[#00d09c]">
              {entityInfo?.ticker || tickerFromQuery || "WQ-REG"}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-[var(--wq-bg-surface)] border border-[var(--wq-border)]">
            <code className="text-xs font-mono font-semibold text-[var(--wq-fg)] truncate select-all">
              {entityId}
            </code>
            <button
              onClick={copyIdToClipboard}
              className="p-1.5 rounded-md hover:bg-[var(--wq-bg-elevated)] text-[var(--wq-fg-muted)] hover:text-[#00d09c] transition-colors shrink-0"
              title="Copy ID"
            >
              {copied ? <Check className="h-4 w-4 text-[#00d09c]" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-[var(--wq-fg-muted)]">
            <ShieldCheck className="h-4 w-4 text-[#00d09c] shrink-0" />
            <span>Permanent UUID recorded in PostgreSQL. Use this ID for quarterly filings, cap table orders, and investor verifications.</span>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <Link
            to="/register"
            className="w-full py-3 rounded-xl bg-[#00d09c] text-black font-extrabold text-xs hover:bg-[#00b888] shadow-lg shadow-[#00d09c]/20 transition-all flex items-center justify-center gap-2"
          >
            Register Another Entity <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="w-1/2 py-2.5 rounded-xl bg-[var(--wq-bg-elevated)] border border-[var(--wq-border)] text-[var(--wq-fg)] font-bold text-xs hover:bg-[var(--wq-bg-surface)] transition-all flex items-center justify-center gap-1.5"
            >
              Company Hub
            </Link>
            <a
              href="http://localhost:7000/dashboard"
              className="w-1/2 py-2.5 rounded-xl bg-[var(--wq-bg-elevated)] border border-[var(--wq-border)] text-[var(--wq-fg)] font-bold text-xs hover:bg-[var(--wq-bg-surface)] transition-all flex items-center justify-center gap-1.5"
            >
              User Portal
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}
