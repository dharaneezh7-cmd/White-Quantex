import React from "react"

// ── Deterministic Solid Logo Background Palette (immune to Tailwind CSS purging) ──
export const LOGO_COLOR_MAP: Record<string, string> = {
  "bg-indigo-600": "#4f46e5",
  "bg-indigo-700": "#4338ca",
  "bg-emerald-500": "#10b981",
  "bg-emerald-600": "#059669",
  "bg-emerald-700": "#047857",
  "bg-cyan-600": "#0891b2",
  "bg-cyan-700": "#0e7490",
  "bg-slate-700": "#334155",
  "bg-amber-500": "#f59e0b",
  "bg-amber-600": "#d97706",
  "bg-rose-600": "#e11d48",
  "bg-rose-700": "#be123c",
  "bg-blue-600": "#2563eb",
  "bg-blue-700": "#1d4ed8",
  "bg-purple-600": "#9333ea",
  "bg-purple-700": "#7e22ce",
  "bg-orange-600": "#ea580c",
  "bg-teal-600": "#0d9488",
  "bg-violet-600": "#7c3aed",
  "bg-red-600": "#dc2626",
  "bg-zinc-700": "#3f3f46",
}

export const FALLBACK_PALETTE = [
  "#4f46e5", // Indigo
  "#059669", // Emerald
  "#0891b2", // Cyan
  "#2563eb", // Blue
  "#7c3aed", // Violet
  "#e11d48", // Rose
  "#d97706", // Amber
  "#0d9488", // Teal
  "#4338ca", // Deep Indigo
  "#047857", // Deep Emerald
]

export function getCompanyLogoStyle(colorStr?: string, tickerOrName?: string): React.CSSProperties {
  if (colorStr && LOGO_COLOR_MAP[colorStr]) {
    return { backgroundColor: LOGO_COLOR_MAP[colorStr], color: "#ffffff" }
  }
  if (colorStr && (colorStr.startsWith("#") || colorStr.startsWith("rgb"))) {
    return { backgroundColor: colorStr, color: "#ffffff" }
  }
  const seed = tickerOrName || "WQ"
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  }
  const bg = FALLBACK_PALETTE[Math.abs(hash) % FALLBACK_PALETTE.length]
  return { backgroundColor: bg, color: "#ffffff" }
}
