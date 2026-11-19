import { useEffect, useRef } from "react"
import { useLocation } from "react-router"
import { useAuthStore } from "@/stores/auth-store"
import { authService } from "@/services/auth/authService"

const getRouteLabel = (pathname: string): string => {
  if (pathname === "/" || pathname === "") return "Homepage"
  if (pathname.startsWith("/login")) return "Login Page"
  if (pathname.startsWith("/register")) return "Registration Page"
  if (pathname.startsWith("/dashboard")) return "Executive Dashboard"
  if (pathname.startsWith("/markets")) return "Secondary Markets & Stock Screener"
  if (pathname.startsWith("/explore")) return "Institutional Directory & Explore"
  if (pathname.startsWith("/ventures")) return "Venture Capital & Deal Flow"
  if (pathname.startsWith("/community")) return "Ecosystem Community Hub"
  if (pathname.startsWith("/messages")) return "Encrypted Investor Messages"
  if (pathname.startsWith("/profile")) return "User Profile & Security Hub"
  if (pathname.startsWith("/settings")) return "Platform Settings"
  if (pathname.startsWith("/companies")) return "Corporate Profile & Analysis"
  return pathname
}

export function useActivityTracker() {
  const location = useLocation()
  const { user, isAuthenticated } = useAuthStore()
  const lastTrackedPath = useRef<string>("")
  const lastHeartbeat = useRef<number>(Date.now())

  // Track page view / navigation on route change
  useEffect(() => {
    if (!isAuthenticated || !user) return

    const currentPath = location.pathname
    if (currentPath === lastTrackedPath.current) return
    lastTrackedPath.current = currentPath

    const pageLabel = getRouteLabel(currentPath)

    authService.trackActivity({
      activityType: "PAGE_VIEW",
      activityName: `Navigated to ${pageLabel}`,
      path: currentPath,
      metadata: JSON.stringify({
        search: location.search,
        timestamp: new Date().toISOString(),
      }),
    })
  }, [location.pathname, location.search, isAuthenticated, user])

  // Periodic heartbeat / user pulse every 90 seconds
  useEffect(() => {
    if (!isAuthenticated || !user) return

    const interval = setInterval(() => {
      authService.trackActivity({
        activityType: "HEARTBEAT",
        activityName: "Active Session Pulse",
        path: location.pathname,
      })
      lastHeartbeat.current = Date.now()
    }, 90000)

    return () => clearInterval(interval)
  }, [isAuthenticated, user, location.pathname])

  return {
    trackAction: (activityName: string, activityType: string = "INTERACTION", metadata?: any) => {
      if (!isAuthenticated || !user) return
      authService.trackActivity({
        activityType,
        activityName,
        path: location.pathname,
        metadata: metadata ? (typeof metadata === "string" ? metadata : JSON.stringify(metadata)) : undefined,
      })
    },
  }
}
