import React, { useState } from "react"
import { Info, ChevronDown } from "lucide-react"

export interface CategoryExplanationBoxProps {
  color?: "emerald" | "amber" | "rose" | "cyan" | "purple"
  lines: [string, string, string, string]
  defaultOpen?: boolean
}

export function CategoryExplanationBox({
  color = "emerald",
  lines,
  defaultOpen = false,
}: CategoryExplanationBoxProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const dotColorClass = {
    emerald: "bg-emerald-500 dark:bg-emerald-400",
    amber: "bg-amber-500 dark:bg-amber-400",
    rose: "bg-rose-500 dark:bg-rose-400",
    cyan: "bg-cyan-500 dark:bg-cyan-400",
    purple: "bg-purple-500 dark:bg-purple-400",
  }[color]

  const infoColorClass = {
    emerald: "text-emerald-600 dark:text-emerald-400",
    amber: "text-amber-600 dark:text-amber-400",
    rose: "text-rose-600 dark:text-rose-400",
    cyan: "text-cyan-600 dark:text-cyan-400",
    purple: "text-purple-600 dark:text-purple-400",
  }[color]

  const hoverBgClass = {
    emerald: "hover:bg-emerald-50/70 dark:hover:bg-emerald-950/30",
    amber: "hover:bg-amber-50/70 dark:hover:bg-amber-950/30",
    rose: "hover:bg-rose-50/70 dark:hover:bg-rose-950/30",
    cyan: "hover:bg-cyan-50/70 dark:hover:bg-cyan-950/30",
    purple: "hover:bg-purple-50/70 dark:hover:bg-purple-950/30",
  }[color]

  return (
    <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between py-1 px-1.5 rounded-lg transition-colors cursor-pointer text-[11px] font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white ${hoverBgClass}`}
      >
        <span className="flex items-center gap-1.5">
          <Info className={`h-3.5 w-3.5 ${infoColorClass}`} />
          <span>About Category</span>
        </span>
        <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
          <span>{isOpen ? "Hide" : "What does this mean?"}</span>
          <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </span>
      </button>

      {isOpen && (
        <div className="mt-2 rounded-xl p-2.5 bg-slate-50/90 dark:bg-zinc-800/50 border border-slate-200/70 dark:border-zinc-800/70 text-[11px] leading-relaxed text-slate-600 dark:text-zinc-300 space-y-1.5 animate-in fade-in-50 duration-200 shadow-2xs">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
            <span className="flex items-center gap-1">
              <Info className={`h-3 w-3 ${infoColorClass}`} />
              <span>Category Definition & Methodology</span>
            </span>
            <span className="text-[9px] font-normal text-slate-400">4-Line Institutional Insight</span>
          </div>
          {lines.map((line, idx) => (
            <p key={idx} className="flex items-start gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${dotColorClass} mt-1.5 shrink-0`} />
              <span>{line}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
