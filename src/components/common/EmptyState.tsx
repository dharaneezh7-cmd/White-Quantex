import React from "react"
import { FolderOpen } from "lucide-react"

interface EmptyStateProps {
  icon?: React.ElementType
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--wq-border)] bg-[var(--wq-bg-surface)] p-12 text-center my-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--wq-bg-elevated)] text-[var(--wq-fg-muted)] mb-4">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-base font-bold text-[var(--wq-fg)] mb-1">{title}</h3>
      <p className="text-xs text-[var(--wq-fg-muted)] max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#00d09c] text-black hover:bg-[#00b888] shadow-sm shadow-[#00d09c]/20 transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
