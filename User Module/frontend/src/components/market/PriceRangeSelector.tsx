import React from "react"

export type TimeRange = "1D" | "1M" | "1Y" | "5Y" | "ALL"

interface PriceRangeSelectorProps {
  selectedRange: TimeRange
  onSelectRange: (range: TimeRange) => void
  disabled?: boolean
}

const RANGES: { id: TimeRange; label: string }[] = [
  { id: "1D", label: "1D" },
  { id: "1M", label: "1M" },
  { id: "1Y", label: "1Y" },
  { id: "5Y", label: "5Y" },
  { id: "ALL", label: "ALL" },
]

export function PriceRangeSelector({
  selectedRange,
  onSelectRange,
  disabled = false,
}: PriceRangeSelectorProps) {
  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700/60">
      {RANGES.map((r) => {
        const isActive = selectedRange === r.id
        return (
          <button
            key={r.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelectRange(r.id)}
            className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              isActive
                ? "bg-slate-900 text-white dark:bg-white dark:text-zinc-950 shadow-xs"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-zinc-700/50"
            }`}
          >
            {r.label}
          </button>
        )
      })}
    </div>
  )
}
