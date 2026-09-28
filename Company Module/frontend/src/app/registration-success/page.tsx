import React from "react"
import { Link } from "react-router"
import { CheckCircle, ArrowRight, ShieldCheck } from "lucide-react"

export default function RegistrationSuccessPage() {
  return (
    <div className="min-h-dvh flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md space-y-8 bg-[var(--wq-bg-surface)] p-8 rounded-2xl border border-[var(--wq-border)] shadow-xl text-center">

        <div className="mx-auto h-16 w-16 rounded-full bg-[#00d09c]/10 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-[#00d09c]" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-extrabold text-[var(--wq-fg)]">
            Registration Submitted
          </h1>
          <p className="text-xs text-[var(--wq-fg-muted)] leading-relaxed">
            Your company/venture registration has been submitted to the White Quantex verification authority. Our compliance team will review and verify your submission within 2-5 business days.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[var(--wq-bg-elevated)] border border-[var(--wq-border)] space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <ShieldCheck className="h-4 w-4 text-[#00d09c] shrink-0" />
            <span className="text-[var(--wq-fg-muted)]">
              <strong className="text-[var(--wq-fg)]">Verification Pending</strong> — You will receive email confirmation once approved.
            </span>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <Link
            to="/"
            className="w-full py-3 rounded-xl bg-[#00d09c] text-black font-extrabold text-xs hover:bg-[#00b888] shadow-lg shadow-[#00d09c]/20 transition-all flex items-center justify-center gap-2"
          >
            Register Another <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="http://localhost:7000/dashboard"
            className="w-full py-3 rounded-xl bg-[var(--wq-bg-elevated)] border border-[var(--wq-border)] text-[var(--wq-fg)] font-bold text-xs hover:bg-[var(--wq-bg-surface)] transition-all flex items-center justify-center gap-2"
          >
            Go to User Dashboard
          </a>
        </div>

      </div>
    </div>
  )
}
