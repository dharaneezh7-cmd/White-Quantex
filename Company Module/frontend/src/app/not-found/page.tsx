import React from "react"
import { Link } from "react-router"

export default function NotFoundPage() {
  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-[var(--wq-fg)]">404</h1>
        <p className="text-sm text-[var(--wq-fg-muted)]">This page doesn't exist.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00d09c] text-black rounded-xl font-bold text-xs hover:bg-[#00b888] transition-all"
        >
          ← Back to Registration Portal
        </Link>
      </div>
    </div>
  )
}
