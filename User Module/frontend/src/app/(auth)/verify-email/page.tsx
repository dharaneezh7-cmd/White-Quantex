import React from "react"

export default function VerifyEmailPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 bg-[var(--wq-bg-surface)] p-8 rounded-2xl border border-[var(--wq-border)] text-center shadow-xl">
        <h2 className="text-xl font-bold text-[var(--wq-fg)]">Email Verification Required</h2>
        <p className="text-xs text-[var(--wq-fg-muted)]">Please verify your email address to unlock full WQ platform capabilities.</p>
      </div>
    </div>
  )
}
