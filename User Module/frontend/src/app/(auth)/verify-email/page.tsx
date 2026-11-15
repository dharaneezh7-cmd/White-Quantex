import React, { useState } from "react"
import { Link, useNavigate } from "react-router"
import { Mail, ArrowRight, ShieldCheck, CheckCircle2, Lock } from "lucide-react"
import { springApi } from "@/services/api/client"

export default function VerifyEmailPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError(null)
    try {
      await springApi.post("/auth/send-otp", { email: email.trim() })
      setSent(true)
      setTimeout(() => {
        navigate(`/verify-otp?email=${encodeURIComponent(email.trim())}`)
      }, 1500)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send verification code. Please check the email address.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 bg-[var(--wq-bg-surface)] p-8 rounded-2xl border border-[var(--wq-border)] shadow-xl text-center">
        <div className="h-14 w-14 rounded-2xl bg-[#00d09c]/10 text-[#00d09c] flex items-center justify-center mx-auto border border-[#00d09c]/20">
          <Mail className="h-7 w-7" />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-bold text-[var(--wq-fg)]">Email Verification</h2>
          <p className="text-xs text-[var(--wq-fg-muted)]">
            Verify your email address to secure your account.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-400 text-left">
            {error}
          </div>
        )}

        {sent ? (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs space-y-2">
            <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto" />
            <p className="font-bold">Verification code dispatched!</p>
            <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
              Redirecting to OTP verification screen...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSendOtp} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-[var(--wq-fg)] mb-1">
                Enter Registered Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] text-xs text-[var(--wq-fg)] focus:outline-none focus:border-[#00d09c]"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full py-3 rounded-xl bg-[#00d09c] text-black font-extrabold text-xs hover:bg-[#00b888] shadow-lg shadow-[#00d09c]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? "Sending Passcode..." : "Send Verification OTP"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        <div className="pt-2 border-t border-[var(--wq-border)] text-xs space-y-2">
          <Link
            to="/verify-otp"
            className="text-xs font-bold text-[#00d09c] hover:underline block"
          >
            Already have a 6-digit OTP? Enter code here →
          </Link>
          <Link to="/login" className="text-xs text-[var(--wq-fg-muted)] hover:underline block">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
