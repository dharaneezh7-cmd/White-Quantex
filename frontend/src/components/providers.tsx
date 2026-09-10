import React from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "../lib/query-client"
import { ThemeProvider } from "../context/ThemeContext"
import { Navbar } from "./layout/Navbar"
import { Footer } from "./layout/Footer"
import { BottomNavigation } from "./layout/BottomNavigation"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <div className="flex min-h-dvh flex-col bg-[var(--wq-bg)] text-[var(--wq-fg)]">
          <Navbar />
          <main className="flex-1 pt-16 pb-16 md:pb-0">{children}</main>
          <Footer />
          <BottomNavigation />
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
