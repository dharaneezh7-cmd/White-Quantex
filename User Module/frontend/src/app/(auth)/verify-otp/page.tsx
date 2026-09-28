import React from "react"

export default function VerifyOtpPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 bg-[var(--wq-bg-surface)] p-8 rounded-2xl border border-[var(--wq-border)] text-center shadow-xl">
        <h2 className="text-xl font-bold text-[var(--wq-fg)]">Enter OTP Verification Code</h2>
        <p className="text-xs text-[var(--wq-fg-muted)]">Check your email for the 6-digit authentication pin.</p>
      </div>
    </div>
  )
}
