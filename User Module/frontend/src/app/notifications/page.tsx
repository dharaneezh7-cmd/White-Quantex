import React from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Bell, ShieldCheck } from "lucide-react"

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <h1 className="text-2xl font-extrabold text-[var(--wq-fg)]">Unified Notification Center</h1>
        <p className="text-xs text-[var(--wq-fg-muted)]">Combined feed of Social Activity (Node.js) & Financial Alerts (Spring Boot).</p>
      </div>
    </ProtectedRoute>
  )
}
