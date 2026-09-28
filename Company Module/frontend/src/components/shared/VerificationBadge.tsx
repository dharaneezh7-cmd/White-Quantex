import React from "react"
import { ShieldCheck } from "lucide-react"
import { cn } from "../../lib/utils"

export type VerificationLevel = "NONE" | "BRONZE" | "SILVER" | "GOLD" | "PLATINUM"

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

export function VerificationBadge({ level, className, showLabel = false }: VerificationBadgeProps) {
  const normalizedLevel = (level || "bronze").toLowerCase()
  const config = levelConfig[normalizedLevel] || levelConfig.bronze

  if (!showLabel) {
    return (
      <span
        title={`${config.label} Verified`}
        className={cn("inline-flex items-center", config.iconColor, className)}
      >
        <ShieldCheck className="h-4 w-4 fill-current" />
      </span>
    )
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-none px-2 py-0.5 text-xs font-semibold uppercase tracking-wider",
        config.bg,
        config.text,
        config.darkBg,
        config.darkText,
        className
      )}
    >
      <ShieldCheck className="h-3 w-3 fill-current" />
      {config.label}
    </span>
  )
}
