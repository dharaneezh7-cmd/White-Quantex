import React from "react"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  message?: string
}

export function LoadingSpinner({ size = "md", message }: LoadingSpinnerProps) {
  const dimensions = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  }[size]

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
      <div
        className={`${dimensions} animate-spin rounded-full border-t-[#00d09c] border-r-transparent border-b-[#00d09c] border-l-transparent`}
      />
      {message && <p className="text-xs font-medium text-[var(--wq-fg-muted)] animate-pulse">{message}</p>}
    </div>
  )
}
