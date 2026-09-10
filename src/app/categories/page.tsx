import React from "react"
import { INDUSTRIES } from "@/constants"

export default function CategoriesPage() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <h1 className="text-2xl font-extrabold text-[var(--wq-fg)]">Venture Sectors & Categories</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {INDUSTRIES.map((ind) => (
          <div key={ind} className="p-4 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-surface)] card-premium text-xs font-bold text-[var(--wq-fg)] text-center">
            {ind}
          </div>
        ))}
      </div>
    </div>
  )
}
