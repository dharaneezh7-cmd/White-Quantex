import React from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Bookmark } from "lucide-react"

export default function SavedItemsPage() {
  return (
    <ProtectedRoute>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <h1 className="text-2xl font-extrabold text-[var(--wq-fg)]">Saved Bookmarks & Documents</h1>
        <p className="text-xs text-[var(--wq-fg-muted)]">Saved community posts, venture deals, and academy guides.</p>
      </div>
    </ProtectedRoute>
  )
}
