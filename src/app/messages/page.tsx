import React from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { MessageSquare, Send } from "lucide-react"

export default function MessagesPage() {
  return (
    <ProtectedRoute>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-8rem)]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full">
          <div className="md:col-span-4 border border-[var(--wq-border)] bg-[var(--wq-bg-surface)] rounded-2xl p-4 space-y-4">
            <h2 className="text-sm font-bold text-[var(--wq-fg)]">Direct Conversations</h2>
            <div className="text-xs text-[var(--wq-fg-muted)]">No active messages yet.</div>
          </div>
          <div className="md:col-span-8 border border-[var(--wq-border)] bg-[var(--wq-bg-surface)] rounded-2xl p-6 flex flex-col justify-between">
            <div className="text-xs text-[var(--wq-fg-muted)]">Select a conversation to start messaging.</div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
