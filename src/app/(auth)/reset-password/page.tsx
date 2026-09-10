import React from "react"
import { Link } from "react-router"

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 bg-[var(--wq-bg-surface)] p-8 rounded-2xl border border-[var(--wq-border)] shadow-xl">
        <h2 className="text-xl font-bold text-[var(--wq-fg)]">Set New Password</h2>
        <p className="text-xs text-[var(--wq-fg-muted)]">Enter your OTP code and new password.</p>
      </div>
    </div>
  )
}
