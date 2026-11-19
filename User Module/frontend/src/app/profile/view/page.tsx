import React, { useState, useEffect, useMemo } from "react"
import { useParams, useSearchParams, Link, useNavigate } from "react-router"
import {
  ArrowLeft, ShieldCheck, Globe, Users, Briefcase, Mail, Share2, Copy, Check,
  ExternalLink, Building2, Sparkles, Award, Calendar, Heart, MessageSquare,
  Lock, CheckCircle2, ShieldAlert, Search, Loader2, UserPlus, UserCheck,
  TrendingUp, MapPin, Hash, Plus, ArrowUpRight, Compass, Bookmark
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { VerificationBadge } from "@/components/shared/VerificationBadge"
import { formatNumber, getInitials, cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/auth-store"

interface CommunityItem {
  id: string
  name: string
  slug: string
  description: string
  iconUrl?: string
  coverImageUrl?: string
  memberCount: number
  postCount: number
  categories?: string[]
  isPrivate?: boolean
}

interface PostItem {
  id: string
  title?: string
  content: string
  postType?: string
  mediaUrls?: string[]
  ticker?: string
  likesCount: number
  commentsCount: number
  sharesCount: number
  createdAt: string
  tags?: string[]
}

interface FollowUserItem {
  id: string
  name: string
  username: string
  avatarUrl: string
  headline: string
  verificationLevel: string
  followersCount: number
  isFollowing?: boolean
  hasPrivateAccess?: boolean
}

export default function ViewProfilePage() {
  const params = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user: authUser } = useAuthStore()

  // Target identifier from URL param or query string
  const targetId = params.username || searchParams.get("u") || searchParams.get("id") || "elenavoss"

  const [loading, setLoading] = useState(true)
  const [member, setMember] = useState<any>(null)
  const [copiedLink, setCopiedLink] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [activeTab, setActiveTab] = useState("about")

  // Followers & Following lists state
  const [followersList, setFollowersList] = useState<FollowUserItem[]>([])
  const [followingList, setFollowingList] = useState<FollowUserItem[]>([])
  const [loadingFollowers, setLoadingFollowers] = useState(false)
  const [loadingFollowing, setLoadingFollowing] = useState(false)
  const [followerSearch, setFollowerSearch] = useState("")
  const [followingSearch, setFollowingSearch] = useState("")

  // Fetch Member Profile
  useEffect(() => {
    let isMounted = true
    setLoading(true)

    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3001/api"
    fetch(`${apiBase}/members/${encodeURIComponent(targetId)}`, {
      headers: {
        ...(authUser?.id ? { "x-wq-user-id": authUser.id } : {}),
      },
    })
      .then((res) => res.json())
      .then((json) => {
        if (!isMounted) return
        if (json.success && json.data) {
          const d = json.data
          setMember(d)
          setIsFollowing(Boolean(d.isFollowing))
          setFollowersCount(d.followersCount || 0)
          setFollowingCount(d.followingCount || 0)
        } else {
          setMember(null)
        }
      })
      .catch(() => {
        if (isMounted) setMember(null)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [targetId, authUser?.id])

  // Fetch Followers when switching to followers tab
  useEffect(() => {
    if (activeTab === "followers" && member?.id) {
      setLoadingFollowers(true)
      const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3001/api"
      fetch(`${apiBase}/follows/${encodeURIComponent(member.id)}/followers`, {
        headers: {
          ...(authUser?.id ? { "x-wq-user-id": authUser.id } : {}),
        },
      })
        .then((r) => r.json())
        .then((res) => {
          if (res.success && Array.isArray(res.data?.list)) {
            setFollowersList(res.data.list)
            setFollowersCount(res.data.total ?? res.data.list.length)
          }
        })
        .catch(() => {})
        .finally(() => setLoadingFollowers(false))
    }
  }, [activeTab, member?.id, authUser?.id])

  // Fetch Following when switching to following tab
  useEffect(() => {
    if (activeTab === "following" && member?.id) {
      setLoadingFollowing(true)
      const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3001/api"
      fetch(`${apiBase}/follows/${encodeURIComponent(member.id)}/following`, {
        headers: {
          ...(authUser?.id ? { "x-wq-user-id": authUser.id } : {}),
        },
      })
        .then((r) => r.json())
        .then((res) => {
          if (res.success && Array.isArray(res.data?.list)) {
            setFollowingList(res.data.list)
            setFollowingCount(res.data.total ?? res.data.list.length)
          }
        })
        .catch(() => {})
        .finally(() => setLoadingFollowing(false))
    }
  }, [activeTab, member?.id, authUser?.id])

  // Toggle follow on this user
  const handleToggleFollowProfile = async () => {
    if (!member) return
    const nextState = !isFollowing
    setIsFollowing(nextState)
    setFollowersCount((prev) => Math.max(0, prev + (nextState ? 1 : -1)))

    try {
      const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3001/api"
      const res = await fetch(`${apiBase}/follows/${encodeURIComponent(member.id)}`, {
        method: nextState ? "POST" : "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(authUser?.id ? { "x-wq-user-id": authUser.id } : {}),
        },
      })
      const json = await res.json()
      if (!json.success) {
        setIsFollowing(!nextState)
        setFollowersCount((prev) => Math.max(0, prev + (!nextState ? 1 : -1)))
      }
    } catch {
      setIsFollowing(!nextState)
      setFollowersCount((prev) => Math.max(0, prev + (!nextState ? 1 : -1)))
    }
  }

  // Toggle follow on item in list
  const handleToggleFollowInList = async (targetUserId: string, currentStatus: boolean, isFollowersTab: boolean) => {
    const nextStatus = !currentStatus

    if (isFollowersTab) {
      setFollowersList((prev) =>
        prev.map((u) => (u.id === targetUserId ? { ...u, isFollowing: nextStatus } : u))
      )
    } else {
      setFollowingList((prev) =>
        prev.map((u) => (u.id === targetUserId ? { ...u, isFollowing: nextStatus } : u))
      )
    }

    try {
      const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3001/api"
      await fetch(`${apiBase}/follows/${encodeURIComponent(targetUserId)}`, {
        method: nextStatus ? "POST" : "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(authUser?.id ? { "x-wq-user-id": authUser.id } : {}),
        },
      })
    } catch {
      // Revert on error
      if (isFollowersTab) {
        setFollowersList((prev) =>
          prev.map((u) => (u.id === targetUserId ? { ...u, isFollowing: currentStatus } : u))
        )
      } else {
        setFollowingList((prev) =>
          prev.map((u) => (u.id === targetUserId ? { ...u, isFollowing: currentStatus } : u))
        )
      }
    }
  }

  // Toggle private access for a follower (only author/self can do this)
  const handleTogglePrivateAccess = async (targetFollowerId: string) => {
    setFollowersList((prev) =>
      prev.map((u) => (u.id === targetFollowerId ? { ...u, hasPrivateAccess: !u.hasPrivateAccess } : u))
    )

    try {
      const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3001/api"
      const res = await fetch(`${apiBase}/follows/${encodeURIComponent(targetFollowerId)}/private-access`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authUser?.id ? { "x-wq-user-id": authUser.id } : {}),
        },
      })
      const data = await res.json()
      if (!data.success) {
        setFollowersList((prev) =>
          prev.map((u) => (u.id === targetFollowerId ? { ...u, hasPrivateAccess: !u.hasPrivateAccess } : u))
        )
      }
    } catch {
      setFollowersList((prev) =>
        prev.map((u) => (u.id === targetFollowerId ? { ...u, hasPrivateAccess: !u.hasPrivateAccess } : u))
      )
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Loading White Quantex profile...
        </span>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Profile Not Found</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          The requested ecosystem profile @{targetId} does not exist or has been made private.
        </p>
        <Button onClick={() => navigate("/community")} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold">
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Community
        </Button>
      </div>
    )
  }

  const isSelf = Boolean(
    authUser?.id &&
    (member.id === authUser.id ||
      member.wqUserId === authUser.id ||
      (member.username && authUser.username && member.username.toLowerCase() === authUser.username.toLowerCase()))
  )

  const displayName = member.name || "Ecosystem Participant"
  const username = member.username || "member"
  const headline = member.headline || "Verified Ecosystem Participant"
  const location = member.location || "San Francisco, CA"
  const bio = member.bio || `${displayName} is an active technology architect and ecosystem participant on White Quantex. Spearheading enterprise systems development and ecosystem collaboration.`
  const trustScore = typeof member.trustScore === "number" ? member.trustScore : 90
  const isVerified = member.verificationLevel && member.verificationLevel !== "NONE"
  const posts: PostItem[] = member.posts || []
  const createdCommunities: CommunityItem[] = member.createdCommunities || []
  const joinedCommunities: CommunityItem[] = member.joinedCommunities || []

  // Filtered Followers / Following
  const filteredFollowers = followersList.filter((f) => {
    if (!followerSearch.trim()) return true
    const q = followerSearch.toLowerCase().trim()
    return f.name.toLowerCase().includes(q) || f.username.toLowerCase().includes(q) || (f.headline && f.headline.toLowerCase().includes(q))
  })

  const filteredFollowing = followingList.filter((f) => {
    if (!followingSearch.trim()) return true
    const q = followingSearch.toLowerCase().trim()
    return f.name.toLowerCase().includes(q) || f.username.toLowerCase().includes(q) || (f.headline && f.headline.toLowerCase().includes(q))
  })

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#0c0d0e] py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ── Top Bar Breadcrumb ── */}
        <div className="flex items-center justify-between">
          <Link
            to="/community"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Community
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#151719] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-emerald-500/40 transition-all cursor-pointer shadow-xs"
            >
              {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedLink ? "Link Copied" : "Share Profile"}
            </button>
          </div>
        </div>

        {/* ── Grid Layout: Main Profile Card (2 cols) + Sidebar (1 col) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left / Main Content (2 Columns) ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* ── Hero Profile Card (LinkedIn Style) ── */}
            <div className="rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-[#111315] shadow-sm overflow-hidden">
              {/* Cover Banner */}
              <div className="relative h-36 sm:h-48 bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.2),transparent_70%)]" />
                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:20px_20px]" />

                {/* Badge top left */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <Badge className="bg-black/40 backdrop-blur-md text-emerald-400 border border-white/10 text-xs font-bold py-1 px-3">
                    <Sparkles className="h-3.5 w-3.5 mr-1.5 text-emerald-400" />
                    Verified White Quantex Profile
                  </Badge>
                </div>
              </div>

              {/* Avatar & Action Section */}
              <div className="px-6 sm:px-8 pb-6 relative -mt-16 sm:-mt-20 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="flex items-end gap-4">
                    <Avatar className="h-28 w-28 sm:h-32 sm:w-32 rounded-2xl ring-4 ring-white dark:ring-[#111315] shadow-2xl shrink-0 bg-slate-900">
                      {member.avatarUrl || member.avatar ? (
                        <AvatarImage src={member.avatarUrl || member.avatar} alt={displayName} className="object-cover rounded-2xl" />
                      ) : null}
                      <AvatarFallback className="text-white font-black text-2xl sm:text-3xl rounded-2xl bg-emerald-700">
                        {getInitials(displayName)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="space-y-1 pb-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                          {displayName}
                        </h1>
                        <VerificationBadge level={member.verificationLevel || "GOLD"} />
                        {isSelf && (
                          <Badge className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 font-extrabold">
                            YOU
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">@{username}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-slate-400" /> {location}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3 text-slate-400" /> Joined Jan 2024</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                    {isSelf ? (
                      <Button
                        size="sm"
                        onClick={() => navigate("/profile")}
                        className="h-9 px-4 text-xs font-bold rounded-xl bg-slate-900 text-white dark:bg-white dark:text-black cursor-pointer shadow-sm hover:opacity-90"
                      >
                        Edit My Profile
                      </Button>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant={isFollowing ? "outline" : "default"}
                          onClick={handleToggleFollowProfile}
                          className={cn(
                            "h-9 px-5 text-xs font-bold rounded-xl cursor-pointer transition-all shadow-sm",
                            isFollowing
                              ? "border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800"
                              : "bg-emerald-600 hover:bg-emerald-700 text-white"
                          )}
                        >
                          {isFollowing ? (
                            <span className="flex items-center gap-1.5">
                              <Check className="h-3.5 w-3.5 text-emerald-500" /> Following
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5">
                              <UserPlus className="h-3.5 w-3.5" /> + Follow
                            </span>
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          data-testid="profile-message-btn"
                          onClick={() => {
                            const targetWqId = member?.wqUserId || member?.id || username
                            const targetUser = member?.username || username
                            const targetDisplay = member?.name || displayName
                            navigate(`/messages?user=${encodeURIComponent(targetWqId)}&username=${encodeURIComponent(targetUser)}&name=${encodeURIComponent(targetDisplay)}`)
                          }}
                          className="h-9 px-4 text-xs font-semibold rounded-xl cursor-pointer border-slate-200 dark:border-zinc-800 hover:border-emerald-500/40 text-slate-700 dark:text-slate-300 bg-white dark:bg-zinc-900"
                        >
                          <Mail className="h-3.5 w-3.5 mr-1.5 text-emerald-500" /> Message
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Professional Headline */}
                <p className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                  {headline}
                </p>

                {/* ── Metric Cards Bar (Real Counts) ── */}
                <div className="grid grid-cols-4 gap-2 pt-2 text-center">
                  <div className="p-3 rounded-2xl border border-slate-100 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/60">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Trust Score</span>
                    <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" /> {trustScore}%
                    </span>
                  </div>

                  <div
                    onClick={() => setActiveTab("followers")}
                    className={cn(
                      "p-3 rounded-2xl border transition-all cursor-pointer group",
                      activeTab === "followers"
                        ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/20 shadow-xs"
                        : "border-slate-100 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/60 hover:border-emerald-500/50 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10"
                    )}
                    title="Click to view full followers list"
                  >
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      Followers
                    </span>
                    <span className="font-black text-sm text-slate-900 dark:text-white mt-0.5 block group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {formatNumber(followersCount)}
                    </span>
                  </div>

                  <div
                    onClick={() => setActiveTab("following")}
                    className={cn(
                      "p-3 rounded-2xl border transition-all cursor-pointer group",
                      activeTab === "following"
                        ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/20 shadow-xs"
                        : "border-slate-100 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/60 hover:border-emerald-500/50 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10"
                    )}
                    title="Click to view full following list"
                  >
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      Following
                    </span>
                    <span className="font-black text-sm text-slate-900 dark:text-white mt-0.5 block group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {formatNumber(followingCount)}
                    </span>
                  </div>

                  <div
                    onClick={() => setActiveTab("activity")}
                    className={cn(
                      "p-3 rounded-2xl border transition-all cursor-pointer group",
                      activeTab === "activity"
                        ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/20 shadow-xs"
                        : "border-slate-100 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/60 hover:border-emerald-500/50 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10"
                    )}
                    title="Click to view dispatches & posts"
                  >
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      Dispatches
                    </span>
                    <span className="font-black text-sm text-slate-900 dark:text-white mt-0.5 block group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {posts.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Main Content Tabs (LinkedIn Style) ── */}
            <div className="rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-[#111315] shadow-sm p-5 sm:p-6 space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full flex items-center justify-between h-10 bg-slate-100 dark:bg-zinc-900 rounded-xl p-1 mb-6 overflow-x-auto gap-1">
                  <TabsTrigger value="about" className="text-xs font-bold rounded-lg py-1.5 px-3 flex-1 min-w-[70px]">
                    About
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="text-xs font-bold rounded-lg py-1.5 px-3 flex-1 min-w-[90px]">
                    Activity ({posts.length})
                  </TabsTrigger>
                  <TabsTrigger value="communities" className="text-xs font-bold rounded-lg py-1.5 px-3 flex-1 min-w-[110px]">
                    Communities ({createdCommunities.length + joinedCommunities.length})
                  </TabsTrigger>
                  <TabsTrigger value="followers" className="text-xs font-bold rounded-lg py-1.5 px-3 flex-1 min-w-[95px]">
                    Followers ({followersCount})
                  </TabsTrigger>
                  <TabsTrigger value="following" className="text-xs font-bold rounded-lg py-1.5 px-3 flex-1 min-w-[95px]">
                    Following ({followingCount})
                  </TabsTrigger>
                </TabsList>

                {/* ── TAB 1: ABOUT (BIO & EXPERTISE) ── */}
                <TabsContent value="about" className="space-y-6 focus-visible:outline-none">
                  {/* Bio */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Biography & Professional Thesis
                    </h3>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-[#16181a] p-4 rounded-2xl border border-slate-100 dark:border-zinc-800">
                      {bio}
                    </p>
                  </div>

                  {/* Sectors of focus */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Sectors & Functional Expertise
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {["Distributed Systems", "Enterprise AI", "DeepTech", "Delaware Secondary", "Secondary Clearing", "ISO-20022 Rails"].map((sec, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                        >
                          {sec}
                        </span>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* ── TAB 2: ACTIVITY / POSTS ── */}
                <TabsContent value="activity" className="space-y-4 focus-visible:outline-none">
                  {posts.length === 0 ? (
                    <div className="py-16 text-center rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-[#16181a] space-y-2">
                      <MessageSquare className="h-8 w-8 text-slate-400 mx-auto" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No dispatches published yet</p>
                      <p className="text-[11px] text-slate-400">
                        Dispatches published by {displayName} will appear here in real-time.
                      </p>
                    </div>
                  ) : (
                    posts.map((post) => (
                      <div
                        key={post.id}
                        className="p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/60 dark:bg-[#16181a] space-y-3 hover:border-emerald-500/40 transition-all"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8 rounded-lg shrink-0">
                              <AvatarFallback className="text-[11px] font-bold bg-emerald-700 text-white rounded-lg">
                                {getInitials(displayName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white block text-xs">
                                {displayName}
                              </span>
                              <span className="text-[11px] text-slate-400 block">
                                {new Date(post.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          </div>
                          {post.ticker && (
                            <Badge variant="outline" className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                              ${post.ticker}
                            </Badge>
                          )}
                        </div>

                        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                          {post.content}
                        </p>

                        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-zinc-800 text-xs text-slate-500">
                          <span className="flex items-center gap-1.5 font-semibold text-rose-500">
                            <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
                            {post.likesCount} Likes
                          </span>
                          <span className="flex items-center gap-1.5 font-semibold text-slate-400">
                            <MessageSquare className="h-3.5 w-3.5" />
                            {post.commentsCount} Comments
                          </span>
                          <button
                            onClick={() => navigate(`/community`)}
                            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            View in Feed <ArrowUpRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>

                {/* ── TAB 3: COMMUNITIES (CREATED & JOINED) ── */}
                <TabsContent value="communities" className="space-y-6 focus-visible:outline-none">
                  {/* Communities Created */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Compass className="h-3.5 w-3.5 text-emerald-500" /> Communities Created ({createdCommunities.length})
                      </h3>
                    </div>

                    {createdCommunities.length === 0 ? (
                      <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 text-center text-xs text-slate-400">
                        {displayName} has not created any public community hubs yet.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {createdCommunities.map((hub) => (
                          <div
                            key={hub.id}
                            className="p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/60 dark:bg-[#16181a] space-y-2 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                  {hub.name}
                                </h4>
                                <Badge className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-bold">
                                  Creator
                                </Badge>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                {hub.description}
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-slate-400">
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3 text-emerald-500" /> {formatNumber(hub.memberCount)} members
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/community/${hub.slug || hub.id}`)}
                                className="h-6 px-2 text-[10px] font-bold rounded-lg border-slate-200 dark:border-zinc-700"
                              >
                                View Hub
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Communities Joined */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-emerald-500" /> Communities Joined ({joinedCommunities.length})
                      </h3>
                    </div>

                    {joinedCommunities.length === 0 ? (
                      <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 text-center text-xs text-slate-400">
                        {displayName} has not joined any other community hubs.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {joinedCommunities.map((hub) => (
                          <div
                            key={hub.id}
                            className="p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/60 dark:bg-[#16181a] space-y-2 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                  {hub.name}
                                </h4>
                                <Badge className="text-[9px] bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 font-bold">
                                  Member
                                </Badge>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                {hub.description}
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-slate-400">
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3 text-slate-400" /> {formatNumber(hub.memberCount)} members
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/community/${hub.slug || hub.id}`)}
                                className="h-6 px-2 text-[10px] font-bold rounded-lg border-slate-200 dark:border-zinc-700"
                              >
                                View Hub
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* ── TAB 4: FOLLOWERS (REAL LIST) ── */}
                <TabsContent value="followers" className="space-y-4 focus-visible:outline-none">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <Input
                      value={followerSearch}
                      onChange={(e) => setFollowerSearch(e.target.value)}
                      placeholder="Search followers by name or handle..."
                      className="pl-8 h-8 text-xs bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-xl"
                    />
                    {followerSearch && (
                      <button
                        onClick={() => setFollowerSearch("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {loadingFollowers ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
                      <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
                      <span className="text-xs">Loading followers...</span>
                    </div>
                  ) : filteredFollowers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
                      <Users className="h-6 w-6 text-slate-400" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {followerSearch ? `No followers matching "${followerSearch}"` : "No followers yet"}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Ecosystem members who follow {displayName} will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredFollowers.map((user) => (
                        <div
                          key={user.id}
                          onClick={() => navigate(`/profile/${user.username || user.id}`)}
                          className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-slate-100 dark:border-zinc-800 bg-slate-50/60 dark:bg-[#16181a] hover:border-emerald-500/40 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <Avatar className="h-10 w-10 rounded-xl shrink-0 ring-1 ring-slate-200 dark:ring-zinc-800">
                              {user.avatarUrl ? (
                                <AvatarImage src={user.avatarUrl} alt={user.name} className="object-cover rounded-xl" />
                              ) : null}
                              <AvatarFallback className="text-xs font-bold bg-emerald-700 text-white rounded-xl">
                                {getInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                  {user.name}
                                </span>
                                <VerificationBadge level={user.verificationLevel} />
                              </div>
                              <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 truncate">
                                @{user.username}
                              </p>
                              {user.headline && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                  {user.headline}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Private Access Toggle (Only visible to profile owner/author) */}
                            {isSelf && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleTogglePrivateAccess(user.id)
                                }}
                                title={user.hasPrivateAccess ? "Revoke Private Access" : "Grant Private Access"}
                                className={cn(
                                  "h-7 px-2.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1",
                                  user.hasPrivateAccess
                                    ? "bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400"
                                    : "bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-500 hover:text-rose-500"
                                )}
                              >
                                <Lock className="h-3 w-3" />
                                <span>{user.hasPrivateAccess ? "Private Access" : "Grant Private"}</span>
                              </button>
                            )}

                            <Button
                              size="sm"
                              variant={user.isFollowing ? "outline" : "default"}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleToggleFollowInList(user.id, Boolean(user.isFollowing), true)
                              }}
                              className={cn(
                                "h-7 px-3 text-[11px] font-bold rounded-lg cursor-pointer transition-all shrink-0",
                                user.isFollowing
                                  ? "border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800"
                                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
                              )}
                            >
                              {user.isFollowing ? (
                                <span className="flex items-center gap-1">
                                  <Check className="h-3 w-3 text-emerald-500" /> Following
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <UserPlus className="h-3 w-3" /> Follow
                                </span>
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* ── TAB 5: FOLLOWING (REAL LIST) ── */}
                <TabsContent value="following" className="space-y-4 focus-visible:outline-none">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <Input
                      value={followingSearch}
                      onChange={(e) => setFollowingSearch(e.target.value)}
                      placeholder="Search accounts followed..."
                      className="pl-8 h-8 text-xs bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-xl"
                    />
                    {followingSearch && (
                      <button
                        onClick={() => setFollowingSearch("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {loadingFollowing ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
                      <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
                      <span className="text-xs">Loading accounts followed...</span>
                    </div>
                  ) : filteredFollowing.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
                      <Users className="h-6 w-6 text-slate-400" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {followingSearch ? `No followed accounts matching "${followingSearch}"` : "Not following anyone yet"}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Verified profiles {displayName} follows will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredFollowing.map((user) => (
                        <div
                          key={user.id}
                          onClick={() => navigate(`/profile/${user.username || user.id}`)}
                          className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-slate-100 dark:border-zinc-800 bg-slate-50/60 dark:bg-[#16181a] hover:border-emerald-500/40 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <Avatar className="h-10 w-10 rounded-xl shrink-0 ring-1 ring-slate-200 dark:ring-zinc-800">
                              {user.avatarUrl ? (
                                <AvatarImage src={user.avatarUrl} alt={user.name} className="object-cover rounded-xl" />
                              ) : null}
                              <AvatarFallback className="text-xs font-bold bg-emerald-700 text-white rounded-xl">
                                {getInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                  {user.name}
                                </span>
                                <VerificationBadge level={user.verificationLevel} />
                              </div>
                              <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 truncate">
                                @{user.username}
                              </p>
                              {user.headline && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                  {user.headline}
                                </p>
                              )}
                            </div>
                          </div>

                          <Button
                            size="sm"
                            variant={user.isFollowing ? "outline" : "default"}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleToggleFollowInList(user.id, Boolean(user.isFollowing), false)
                            }}
                            className={cn(
                              "h-7 px-3 text-[11px] font-bold rounded-lg cursor-pointer transition-all shrink-0",
                              user.isFollowing
                                ? "border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800"
                                : "bg-emerald-600 hover:bg-emerald-700 text-white"
                            )}
                          >
                            {user.isFollowing ? (
                              <span className="flex items-center gap-1">
                                <Check className="h-3 w-3 text-emerald-500" /> Following
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <UserPlus className="h-3 w-3" /> Follow
                              </span>
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* ── Right Column: LinkedIn-style sidebar widgets ── */}
          <div className="space-y-6">
            {/* Primary Entity / Organization */}
            {member.portfolioOrVenture && (
              <div className="rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-[#111315] shadow-sm p-5 space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-emerald-500" /> Primary Entity Affiliation
                </h3>
                <div className="p-3.5 rounded-2xl border border-slate-100 dark:border-zinc-800 bg-slate-50/80 dark:bg-[#16181a] space-y-1.5">
                  <span className="text-sm font-bold text-slate-900 dark:text-white block">
                    {member.portfolioOrVenture}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    Verified Ecosystem Partner Organization
                  </span>
                  <div className="pt-2">
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                      Ecosystem Partner
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Standing & Verification Widget */}
            <div className="rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-[#111315] shadow-sm p-5 space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Standing & Verification
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                  <span className="font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Account Standing
                  </span>
                  <span className="font-bold text-[10px]">ACTIVE & VERIFIED</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-[#16181a]">
                  <span className="text-slate-600 dark:text-slate-400">Trust Integrity Rating</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{trustScore}% Verified</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-[#16181a]">
                  <span className="text-slate-600 dark:text-slate-400">Clearance Tier</span>
                  <span className="font-bold text-slate-900 dark:text-white">{member.verificationLevel || "GOLD"}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions / Share */}
            <div className="rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-[#111315] shadow-sm p-5 space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Network Actions
              </h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={handleCopyLink}
                  className="w-full justify-start text-xs font-semibold rounded-xl border-slate-200 dark:border-zinc-800 h-9"
                >
                  <Share2 className="h-3.5 w-3.5 mr-2 text-slate-500" />
                  {copiedLink ? "Link Copied to Clipboard" : "Share Profile Link"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/community")}
                  className="w-full justify-start text-xs font-semibold rounded-xl border-slate-200 dark:border-zinc-800 h-9"
                >
                  <Users className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                  Explore Ecosystem People
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
