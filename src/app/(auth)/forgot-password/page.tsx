import React, { useState } from "react"
import { Link } from "react-router"
import { ArrowLeft, Mail } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 bg-[var(--wq-bg-surface)] p-8 rounded-2xl border border-[var(--wq-border)] shadow-xl">
        <Link to="/login" className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--wq-fg-muted)] hover:text-[#00d09c]">
          <ArrowLeft className="h-4 w-4" /> Back to Sign In
        </Link>

        <div>
          <h2 className="text-xl font-bold text-[var(--wq-fg)]">Reset Password</h2>
          <p className="text-xs text-[var(--wq-fg-muted)] mt-1">Enter your registered email to receive an OTP verification code.</p>
        </div>

        {submitted ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-[#00d09c]">
            Verification OTP sent! Check your inbox to proceed with password reset.
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[var(--wq-fg)] mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] text-xs text-[var(--wq-fg)] focus:outline-none focus:border-[#00d09c]"
              />
            </div>
            <button type="submit" className="w-full py-3 rounded-xl bg-[#00d09c] text-black font-extrabold text-xs hover:bg-[#00b888]">
              Send Reset OTP
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
