import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount?: number, currency = "USD"): string {
  if (amount === undefined || amount === null) return "$0"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatCompactCurrency(amount?: number): string {
  if (amount === undefined || amount === null) return "$0"
  if (amount >= 1_000_000_000) {
    return `$${(amount / 1_000_000_000).toFixed(1)}B`
  }
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(1)}K`
  }
  return `$${amount.toLocaleString()}`
}

export function formatNumber(num?: number): string {
  if (num === undefined || num === null) return "0"
  return new Intl.NumberFormat("en-US").format(num)
}

export function formatDate(dateString?: string): string {
  if (!dateString) return ""
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
  } catch {
    return dateString
  }
}

export function getInitials(name?: string): string {
  if (!name) return "WQ"
  const parts = name.trim().split(" ")
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-")
}
