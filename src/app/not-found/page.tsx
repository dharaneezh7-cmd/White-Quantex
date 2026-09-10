import React from "react"
import { Link } from "react-router"

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <h1 className="text-4xl font-extrabold text-[var(--wq-fg)]">404 — Page Not Found</h1>
      <p className="text-xs text-[var(--wq-fg-muted)] max-w-sm">
        The requested resource or page does not exist in the White Quantex ecosystem.
      </p>
      <Link
        to="/"
        className="px-6 py-2.5 rounded-xl bg-[#00d09c] text-black font-bold text-xs hover:bg-[#00b888]"
      >
        Return to Home Page
      </Link>
    </div>
  )
}
