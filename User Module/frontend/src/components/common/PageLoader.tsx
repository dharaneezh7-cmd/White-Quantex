import React, { useEffect, useState, useRef } from "react"
import { useLocation, useNavigation } from "react-router"
import { motion, AnimatePresence } from "framer-motion"
import { useIsFetching } from "@tanstack/react-query"

/**
 * PageProgressBar
 * Sleek, neon emerald top progress bar that animates during:
 * 1. Route navigation transitions (React Router v7 `navigation.state === "loading"`)
 * 2. URL path changes (`location.pathname`)
 * 3. Asynchronous queries (`useIsFetching() > 0`)
 */
export function PageProgressBar() {
  const navigation = useNavigation()
  const location = useLocation()
  const isFetching = useIsFetching()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null)

  const isNavigating = navigation.state !== "idle"
  const isLoading = isNavigating || isFetching > 0

  const startProgress = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current)
    }

    setVisible(true)
    setProgress(15)

    progressTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev < 40) return prev + 12
        if (prev < 70) return prev + 6
        if (prev < 88) return prev + 2
        return prev
      })
    }, 120)
  }

  const completeProgress = () => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current)
      progressTimerRef.current = null
    }

    setProgress(100)
    hideTimerRef.current = setTimeout(() => {
      setVisible(false)
      setProgress(0)
    }, 280)
  }

  // Trigger on route changes
  useEffect(() => {
    startProgress()
    const timer = setTimeout(() => {
      completeProgress()
    }, 250)
    return () => clearTimeout(timer)
  }, [location.pathname, location.search])

  // Trigger on navigation or async query changes
  useEffect(() => {
    if (isLoading) {
      startProgress()
    } else {
      completeProgress()
    }
  }, [isLoading])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current)
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    }
  }, [])

  if (!visible && progress === 0) return null

  return (
    <div
      aria-hidden="true"
      className={`fixed top-0 left-0 right-0 z-[99999] h-[3px] pointer-events-none transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Glow track */}
      <div
        className="h-full bg-gradient-to-r from-[#00d09c] via-emerald-400 to-teal-300 transition-[width] duration-200 ease-out shadow-[0_0_12px_#00d09c,0_0_4px_#00d09c]"
        style={{ width: `${progress}%` }}
      >
        {/* Leading edge light droplet */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-20 h-[6px] bg-white/70 blur-[2px] rounded-full" />
      </div>
    </div>
  )
}

/**
 * PageTransitionWrapper
 * Adds a smooth, hardware-accelerated entrance motion whenever the page route changes.
 */
export function PageTransitionWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{
          duration: 0.22,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="w-full flex-1 flex flex-col"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * PageLoadingFallback
 * Branded White Quantex loading indicator for Suspense boundaries and lazy route chunks.
 */
export function PageLoadingFallback({ message = "Loading White Quantex..." }: { message?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center animate-fade-in">
      {/* Branded dual animated rings */}
      <div className="relative flex items-center justify-center w-16 h-16 mb-5">
        {/* Ambient pulse glow */}
        <div className="absolute inset-0 rounded-full bg-[#00d09c]/15 animate-ping" />
        {/* Outer spinning ring */}
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#00d09c]/30 animate-[spin_4s_linear_infinite]" />
        {/* Main rotating track */}
        <div className="absolute inset-1 rounded-full border-2 border-t-[#00d09c] border-r-transparent border-b-[#00d09c]/40 border-l-transparent animate-spin" />
        {/* Center brand mark */}
        <div className="w-8 h-8 rounded-full bg-[#00d09c]/10 border border-[#00d09c]/40 flex items-center justify-center shadow-[0_0_12px_rgba(0,208,156,0.3)]">
          <span className="text-xs font-black tracking-widest text-[#00d09c]">Q</span>
        </div>
      </div>

      {/* Label */}
      <p className="text-xs font-semibold tracking-wider uppercase text-[var(--wq-fg-muted)] animate-pulse">
        {message}
      </p>
    </div>
  )
}
