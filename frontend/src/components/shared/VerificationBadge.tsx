import React from "react"
import { ShieldCheck } from "lucide-react"
import { cn } from "../../lib/utils"
import type { VerificationLevel } from "../../types"

interface VerificationBadgeProps {
  level: VerificationLevel | string
  className?: string
  showLabel?: boolean
}

const levelConfig: Record<string, { label: string; iconColor: string; bg: string; text: string; darkBg: string; darkText: string }> = {
  bronze: {
    label: "Bronze",
    iconColor: "text-amber-500",
    bg: "bg-amber-50",
    text: "text-amber-700",
    darkBg: "dark:bg-amber-900/30",
    darkText: "dark:text-amber-400",
  },
  silver: {
    label: "Silver",
    iconColor: "text-slate-400",
    bg: "bg-slate-100",
    text: "text-slate-600",
    darkBg: "dark:bg-slate-700",
    darkText: "dark:text-slate-300",
  },
  gold: {
    label: "Gold",
    iconColor: "text-yellow-500",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    darkBg: "dark:bg-yellow-900/30",
    darkText: "dark:text-yellow-400",
  },
  platinum: {
    label: "Platinum",
    iconColor: "text-emerald-600",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    darkBg: "dark:bg-emerald-900/30",
    darkText: "dark:text-emerald-400",
  },
}

const defaultConfig = {
  label: "Verified",
  iconColor: "text-emerald-600",
  bg: "bg-emerald-50",
  text: "text-emerald-700",
  darkBg: "dark:bg-emerald-900/30",
  darkText: "dark:text-emerald-400",
}

export const VerificationBadge = React.memo(function VerificationBadge({
  level,
  className,
  showLabel = false,
}: VerificationBadgeProps) {
  const normalizedLevel = (level || "bronze").toString().toLowerCase()
  const config = levelConfig[normalizedLevel] || defaultConfig

  if (!showLabel) {
    return (
      <span
        className={cn("inline-flex items-center", className)}
        title={`Verified — ${config.label}`}
      >
        <ShieldCheck
          className={cn("h-4 w-4", config.iconColor)}
          strokeWidth={2.5}
        />
      </span>
    )
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        config.bg,
        config.text,
        config.darkBg,
        config.darkText,
        className
      )}
    >
      <ShieldCheck className="h-3 w-3" strokeWidth={2.5} />
      {config.label}
    </span>
  )
})
