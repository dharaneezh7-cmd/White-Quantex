import React, { useState, useEffect } from "react"
import { useSearchParams, useNavigate, Link } from "react-router"
import { CheckCircle2, ShieldAlert, ArrowRight, RefreshCw, Mail, Lock, Sparkles } from "lucide-react"
import { authService } from "@/services/auth/authService"
import { useAuthStore } from "@/stores/auth-store"

export default function VerifyOtpPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)

  const initialEmail = searchParams.get("email") || ""
  const [email, setEmail] = useState(initialEmail)
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [verified, setVerified] = useState(false)

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError("Please provide your email address.")
      return
    }

    if (!otp.trim() || otp.trim().length < 6) {
      setError("Please enter the 6-digit verification code.")
      return
    }

    setLoading(true)
    try {
      await authService.verifyOtp(email.trim(), otp.trim())

      // Update session if active
      if (typeof window !== "undefined") {
        try {
          const session = localStorage.getItem("wq_user_session")
          if (session) {
            const user = JSON.parse(session)
            user.isEmailVerified = true
            localStorage.setItem("wq_user_session", JSON.stringify(user))
            setUser(user)
          }
        } catch {}
      }

      setVerified(true)
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid or expired OTP. Please try again or use dev code 123456.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 bg-[var(--wq-bg-surface)] p-8 rounded-2xl border border-[var(--wq-border)] shadow-xl text-center">
        
        {/* Brand Header */}
        <div className="space-y-1">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <span className="font-sans text-lg font-extrabold text-[var(--wq-fg)]">
              WHITE <span className="text-[#00d09c]">QUANTEX</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-[var(--wq-fg)]">
            {verified ? "Email Confirmed" : "Verify Email Address"}
          </h2>
          <p className="text-xs text-[var(--wq-fg-muted)]">
            {verified
              ? "Your White Quantex email address is confirmed"
              : "Enter the statutory one-time passcode sent to your inbox"}
          </p>
        </div>

        {/* Verification Success View */}
        {verified ? (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="h-16 w-16 rounded-2xl bg-emerald-500/15 text-[#00d09c] border border-emerald-500/30 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="h-9 w-9" />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-left space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-zinc-200">
                <Mail className="h-4 w-4 text-[#00d09c]" />
                <span>Email Ownership Confirmed</span>
              </div>
              <p className="text-slate-500 dark:text-zinc-400 leading-relaxed text-[11px]">
                Your email address <strong>{email}</strong> has been successfully verified.
              </p>
            </div>

            {/* Crucial Statutory Note */}
            <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-left space-y-1.5 text-xs text-amber-900 dark:text-amber-200">
              <div className="flex items-center gap-1.5 font-bold">
                <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span>Next Step: Legal Identity KYC Verification</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-zinc-300 leading-relaxed">
                Verifying an email address does not establish legal identity. In compliance with investment regulations, you must complete your individual KYC before you can invest in companies or venture rounds.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                to="/verification"
                className="w-full py-3 rounded-xl bg-[#00d09c] text-black font-extrabold text-xs hover:bg-[#00b888] shadow-lg shadow-[#00d09c]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Start KYC Identity Verification</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="/dashboard"
                className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors block text-center cursor-pointer"
              >
                Continue to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          /* OTP Form */
          <form onSubmit={handleVerify} className="space-y-4 text-left">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-400">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[var(--wq-fg)] mb-1">
                Account Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] text-xs text-[var(--wq-fg)] focus:outline-none focus:border-[#00d09c]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--wq-fg)] mb-1">
                6-Digit OTP Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] font-mono text-center tracking-[0.5em] text-lg font-bold text-[var(--wq-fg)] focus:outline-none focus:border-[#00d09c]"
              />
            </div>

            <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/30 text-[11px] text-blue-800 dark:text-blue-300">
              For testing in development: Use <strong>123456</strong>.
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full py-3 rounded-xl bg-[#00d09c] text-black font-extrabold text-xs hover:bg-[#00b888] shadow-lg shadow-[#00d09c]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Verifying Passcode...</span>
                </>
              ) : (
                <>
                  <span>Verify Email OTP</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <Link to="/login" className="text-xs text-[var(--wq-fg-muted)] hover:underline">
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
