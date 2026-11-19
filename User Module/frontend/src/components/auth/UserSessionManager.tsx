import React, { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router"
import {
  ShieldCheck,
  Laptop,
  Smartphone,
  Tablet,
  Globe,
  Clock,
  LogOut,
  RefreshCw,
  Activity,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Radio,
  MapPin,
  Send,
} from "lucide-react"
import { authService } from "@/services/auth/authService"
import { useAuthStore } from "@/stores/auth-store"
import { UserSession, UserActivity } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"

export function UserSessionManager() {
  const navigate = useNavigate()
  const { user, clearAuth, currentSession, setCurrentSession } = useAuthStore()

  const [sessions, setSessions] = useState<UserSession[]>([])
  const [activities, setActivities] = useState<UserActivity[]>([])
  const [loading, setLoading] = useState(false)
  const [terminating, setTerminating] = useState(false)
  const [customActionText, setCustomActionText] = useState("")

  const loadSessionData = useCallback(async () => {
    setLoading(true)
    try {
      const [curr, allSessions, acts] = await Promise.all([
        authService.getCurrentSession(),
        authService.getActiveSessions(),
        authService.getRecentActivities(30),
      ])

      if (curr) setCurrentSession(curr)
      setSessions(allSessions)
      setActivities(acts)
    } catch (err) {
      console.error("Failed to load session auth data:", err)
    } finally {
      setLoading(false)
    }
  }, [setCurrentSession])

  useEffect(() => {
    loadSessionData()
    // Periodic refresh every 30 seconds
    const interval = setInterval(loadSessionData, 30000)
    return () => clearInterval(interval)
  }, [loadSessionData])

  const handleLogoutAndDestroySession = async () => {
    setTerminating(true)
    try {
      await authService.logout()
      toast.success("Session successfully terminated and deleted from database.")
    } catch (e) {
      console.warn("Logout error:", e)
    } finally {
      clearAuth()
      setTerminating(false)
      navigate("/login")
    }
  }

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const success = await authService.deleteSession(sessionId)
      if (success) {
        toast.success("Remote session revoked and deleted.")
        setSessions((prev) => prev.filter((s) => s.id !== sessionId))
      } else {
        toast.error("Failed to delete session.")
      }
    } catch {
      toast.error("Error communicating with session server.")
    }
  }

  const handleRecordManualActivity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customActionText.trim()) return

    try {
      await authService.trackActivity({
        activityType: "INTERACTION",
        activityName: customActionText.trim(),
        path: window.location.pathname,
        metadata: "Logged via Session Activity Manager UI",
      })
      setCustomActionText("")
      toast.success("Activity recorded in session trail!")
      loadSessionData()
    } catch {
      toast.error("Failed to log activity.")
    }
  }

  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return "Never"
    const date = new Date(isoString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHour = Math.floor(diffMin / 60)
    const diffDays = Math.floor(diffHour / 24)

    if (diffSec < 30) return "Active now"
    if (diffSec < 60) return `${diffSec}s ago`
    if (diffMin < 60) return `${diffMin}m ago`
    if (diffHour < 24) return `${diffHour}h ago`
    return `${diffDays}d ago`
  }

  const getDeviceIcon = (deviceType?: string) => {
    const dt = (deviceType || "").toLowerCase()
    if (dt.includes("mobile") || dt.includes("phone")) return <Smartphone className="h-4 w-4" />
    if (dt.includes("tablet") || dt.includes("ipad")) return <Tablet className="h-4 w-4" />
    return <Laptop className="h-4 w-4" />
  }

  const getActivityBadgeColor = (type: string) => {
    switch (type.toUpperCase()) {
      case "LOGIN":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
      case "LOGOUT":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
      case "PAGE_VIEW":
      case "NAVIGATION":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
      case "INTERACTION":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
      case "HEARTBEAT":
        return "bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20"
      default:
        return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
    }
  }

  const activeCurrent = sessions.find((s) => s.isCurrent) || currentSession || sessions[0]

  return (
    <div className="space-y-6">
      {/* ── TOP HEADER & REFRESH ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-[#00d09c] animate-pulse" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Session Authentication & User Activity Tracking
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time server-side session registry, IP identity verification, and stateful activity logging.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={loadSessionData}
            disabled={loading}
            className="h-8 text-xs font-semibold gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Trail
          </Button>

          <Button
            size="sm"
            onClick={handleLogoutAndDestroySession}
            disabled={terminating}
            className="h-8 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white gap-1.5 shadow-sm cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            {terminating ? "Terminating..." : "Logout & Delete Session"}
          </Button>
        </div>
      </div>

      {/* ── CURRENT ACTIVE SESSION CARD ── */}
      <div className="p-5 rounded-2xl border border-[#00d09c]/30 bg-white dark:bg-[#111315] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-28 h-28 bg-[#00d09c]/5 rounded-full pointer-events-none blur-2xl" />

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#00d09c]/10 text-[#00d09c] border border-[#00d09c]/20">
              {getDeviceIcon(activeCurrent?.deviceType)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {activeCurrent?.browser || "Web Browser"} on {activeCurrent?.operatingSystem || "Client OS"}
                </h4>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-bold gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                  CURRENT ACTIVE SESSION
                </Badge>
              </div>

              <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1 font-mono">
                  <Globe className="h-3.5 w-3.5 text-slate-400" /> IP: {activeCurrent?.ipAddress || "127.0.0.1"}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" /> {activeCurrent?.location || "Local Network"}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-slate-400" /> Logged In:{" "}
                  {activeCurrent?.loginAt ? new Date(activeCurrent.loginAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Recently"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Last Activity Heartbeat
              </span>
              <span className="text-xs font-extrabold text-[#00d09c]">
                {formatRelativeTime(activeCurrent?.lastActivityAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Session Token Info Box */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between flex-wrap gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-[#00d09c]" />
            <span>Stateful Database Session · Verified User ID:</span>
            <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 font-mono text-[10px] text-slate-700 dark:text-slate-300">
              {user?.id || user?.wqUserId || "Current Identity"}
            </code>
          </div>
          <span className="text-slate-400">
            Expires in 7 days (or immediately upon website sign-out)
          </span>
        </div>
      </div>

      {/* ── ALL REGISTERED ACTIVE SESSIONS ── */}
      {sessions.length > 1 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Other Active Connected Sessions ({sessions.length - 1})
          </h4>
          <div className="space-y-2">
            {sessions
              .filter((s) => !s.isCurrent && s.id !== activeCurrent?.id)
              .map((s) => (
                <div
                  key={s.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-slate-300">
                      {getDeviceIcon(s.deviceType)}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                        {s.browser} · {s.operatingSystem}
                      </h5>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {s.ipAddress} · {s.location} · Last active {formatRelativeTime(s.lastActivityAt)}
                      </p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteSession(s.id)}
                    className="h-7 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 border-rose-200 dark:border-rose-900/30 gap-1 cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" /> Revoke
                  </Button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ── REAL-TIME USER ACTIVITY TRAIL ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#00d09c]" />
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              User Activity Audit Trail ({activities.length} Recorded Actions)
            </h4>
          </div>

          {/* Quick Manual Activity Test Input */}
          <form onSubmit={handleRecordManualActivity} className="flex items-center gap-1.5">
            <input
              type="text"
              value={customActionText}
              onChange={(e) => setCustomActionText(e.target.value)}
              placeholder="Test custom action (e.g. Screener Export)..."
              className="h-7 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#00d09c] w-52"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!customActionText.trim()}
              className="h-7 px-2.5 text-xs font-semibold bg-[#00d09c] hover:bg-[#00b588] text-slate-950 gap-1 cursor-pointer"
            >
              <Send className="h-3 w-3" /> Log
            </Button>
          </form>
        </div>

        {activities.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 text-slate-400 text-xs">
            No activity records found for this session yet. Navigate through the website to generate live telemetry.
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111315] divide-y divide-slate-100 dark:divide-zinc-800/80 overflow-hidden max-h-[360px] overflow-y-auto">
            {activities.map((act) => (
              <div
                key={act.id}
                className="p-3.5 hover:bg-slate-50/50 dark:hover:bg-zinc-900/30 transition-colors flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <Badge
                    className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border ${getActivityBadgeColor(
                      act.activityType
                    )}`}
                  >
                    {act.activityType}
                  </Badge>
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {act.activityName}
                    </span>
                    {act.path && (
                      <span className="ml-2 font-mono text-[11px] text-slate-400 bg-slate-100 dark:bg-zinc-800/60 px-1.5 py-0.5 rounded">
                        {act.path}
                      </span>
                    )}
                    {act.metadata && (
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{act.metadata}</p>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] text-slate-400 block">
                    {formatRelativeTime(act.createdAt)}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">
                    {act.ipAddress || "127.0.0.1"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
