import React from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Activity } from "lucide-react"

export default function ActivityLogPage() {
  return (
    <ProtectedRoute>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <h1 className="text-2xl font-extrabold text-[var(--wq-fg)]">Account Activity & Social Interactions</h1>
        <p className="text-xs text-[var(--wq-fg-muted)]">Your post history, comments, and security audit logs.</p>
      </div>
    </ProtectedRoute>
  )
}
