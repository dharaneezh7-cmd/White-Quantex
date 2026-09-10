import React from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Settings, Lock, Bell, User } from "lucide-react"

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <h1 className="text-2xl font-extrabold text-[var(--wq-fg)]">Account & Security Settings</h1>
        <p className="text-xs text-[var(--wq-fg-muted)]">Manage password, two-factor authentication, email preferences, and privacy controls.</p>
      </div>
    </ProtectedRoute>
  )
}
