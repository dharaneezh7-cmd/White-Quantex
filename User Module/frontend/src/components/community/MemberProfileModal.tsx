import React, { useState, useEffect, useMemo } from "react"
import {
  X, ShieldCheck, Globe, Users, Briefcase, Mail, Share2, Copy, Check,
  ExternalLink, Building2, Sparkles, Award, Radio, Calendar,
  ArrowRight, Heart, MessageSquare, TrendingUp, Lock, CheckCircle2, ShieldAlert,
  Search, Loader2, UserPlus, UserCheck
} from "lucide-react"
import { useNavigate } from "react-router"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs"
import { VerificationBadge } from "../shared/VerificationBadge"
import { formatNumber, getInitials, cn } from "../../lib/utils"
import { useAuthStore } from "../../stores/auth-store"

export interface ProfileMemberData {
  id: string
  name: string
  username?: string
  headline?: string
  bio?: string
  role?: "INVESTOR" | "FOUNDER" | "MEMBER" | "REGISTRY" | string
  location?: string
  avatar?: string
  avatarUrl?: string
  avatarInitials?: string
  avatarColor?: string
  followersCount?: number
  followingCount?: number
  postsCount?: number
  verificationLevel?: "PLATINUM" | "GOLD" | "SILVER" | string
  trustScore?: number
  badgeText?: string
  category?: string
  description?: string
  isCurrentUser?: boolean
  companyId?: string
  ticker?: string
  sectors?: string[]
  affiliations?: string[]
  joinedDate?: string
  verifiedAccreditations?: string[]
  recentDispatches?: Array<{
    id: string
    title?: string
    content: string
    timestamp: string
    likesCount: number
    commentsCount: number
    tag?: string
  }>
}

interface MemberProfileModalProps {
  member: ProfileMemberData | null
  isOpen: boolean
  onClose: () => void
  isFollowing?: boolean
  onToggleFollow?: (memberId: string) => void
}

interface NetworkUserItem {
  id: string
  name: string
  username: string
  avatarUrl: string
  headline: string
  verificationLevel: string
  followersCount: number
  isFollowing?: boolean
}

// ── Followers / Following Tab Component ─────────────────────────────────────
function UserListTabContent({
  type,
  userId,
  count,
}: {
  type: "followers" | "following"
  userId: string
  count: number
}) {
  const [list, setList] = useState<NetworkUserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({})
  const { user: authUser } = useAuthStore()

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3001/api"
    const target = encodeURIComponent(userId)

    fetch(`${apiBase}/follows/${target}/${type}`, {
      headers: {
        ...(authUser?.id ? { "x-wq-user-id": authUser.id } : {}),
      },
    })
      .then((r) => r.json())
      .then((res) => {
        if (!isMounted) return
        if (res.success && Array.isArray(res.data?.list)) {
          setList(res.data.list)
          const map: Record<string, boolean> = {}
          res.data.list.forEach((item: NetworkUserItem) => {
            if (item.isFollowing) map[item.id] = true
          })
          setFollowingMap(map)
        } else {
          setList([])
        }
      })
      .catch(() => {
        if (isMounted) setList([])
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [userId, type, authUser?.id])

  const handleToggleFollow = async (e: React.MouseEvent, targetId: string) => {
    e.stopPropagation()
    const currentlyFollowing = Boolean(followingMap[targetId])
    const nextState = !currentlyFollowing

    // Optimistic UI update
    setFollowingMap((prev) => ({ ...prev, [targetId]: nextState }))

    try {
      const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3001/api"
      const res = await fetch(`${apiBase}/follows/${encodeURIComponent(targetId)}`, {
        method: currentlyFollowing ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authUser?.id ? { "x-wq-user-id": authUser.id } : {}),
        },
      })
      const data = await res.json()
      if (!data.success) {
        // Revert on failure
        setFollowingMap((prev) => ({ ...prev, [targetId]: currentlyFollowing }))
      }
    } catch {
      setFollowingMap((prev) => ({ ...prev, [targetId]: currentlyFollowing }))
    }
  }

  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return list
    const q = searchQuery.toLowerCase().trim()
    return list.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.username.toLowerCase().includes(q) ||
        (item.headline && item.headline.toLowerCase().includes(q))
    )
  }, [list, searchQuery])

  return (
    <div className="space-y-3 focus-visible:outline-none">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search ${type}...`}
          className="pl-8 h-8 text-xs bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-xl"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
          >
            ×
          </button>
        )}
      </div>

      {/* List container */}
      <div className="overflow-y-auto max-h-[340px] space-y-2 pr-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
            <span className="text-xs">Loading {type}...</span>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-400 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800">
            <Users className="h-6 w-6 text-slate-400" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {searchQuery
                ? `No ${type} matching "${searchQuery}"`
                : type === "followers"
                ? "No followers yet"
                : "Not following anyone yet"}
            </p>
            <p className="text-[11px] text-slate-400">
              {type === "followers"
                ? "When ecosystem members follow this account, they will appear here."
                : "Connect with verified members across the platform."}
            </p>
          </div>
        ) : (
          filteredList.map((person) => {
            const isTargetFollowed = Boolean(followingMap[person.id])
            const isSelf = authUser?.id && (authUser.id === person.id || (authUser as any).wqUserId === person.id)

            return (
              <div
                key={person.id}
                className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800/80 bg-slate-50/60 dark:bg-[#16181a] hover:border-emerald-500/30 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Avatar className="h-10 w-10 rounded-xl shrink-0 ring-1 ring-slate-200 dark:ring-zinc-800">
                    {person.avatarUrl ? (
                      <AvatarImage src={person.avatarUrl} alt={person.name} className="object-cover rounded-xl" />
                    ) : null}
                    <AvatarFallback className="text-xs font-bold bg-emerald-700 text-white rounded-xl">
                      {getInitials(person.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {person.name}
                      </span>
                      {person.verificationLevel && person.verificationLevel !== "NONE" && (
                        <VerificationBadge level={person.verificationLevel} />
                      )}
                      {isSelf && (
                        <Badge className="text-[9px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-1 py-0 font-extrabold">
                          YOU
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 truncate">
                      @{person.username}
                    </p>
                    {person.headline && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {person.headline}
                      </p>
                    )}
                  </div>
                </div>

                {/* Follow Button */}
                {!isSelf && (
                  <Button
                    size="sm"
                    variant={isTargetFollowed ? "outline" : "default"}
                    onClick={(e) => handleToggleFollow(e, person.id)}
                    className={cn(
                      "h-7 px-2.5 text-[11px] font-bold rounded-lg cursor-pointer transition-all shrink-0",
                      isTargetFollowed
                        ? "border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    )}
                  >
                    {isTargetFollowed ? (
                      <span className="flex items-center gap-1">
                        <Check className="h-3 w-3 text-emerald-500" /> Following
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <UserPlus className="h-3 w-3" /> Follow
                      </span>
                    )}
                  </Button>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export function MemberProfileModal({
  member,
  isOpen,
  onClose,
  isFollowing = false,
  onToggleFollow,
}: MemberProfileModalProps) {
  const navigate = useNavigate()
  const { user: authUser } = useAuthStore()
  const [copiedLink, setCopiedLink] = useState(false)
  const [messageSent, setMessageSent] = useState(false)
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({})
  const [activeTab, setActiveTab] = useState<string>("overview")

  // Reset to overview when modal opens or member changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab("overview")
    }
  }, [isOpen, member?.id])

  if (!member) return null

  const isSelf = Boolean(
    member.isCurrentUser ||
    (authUser?.id && (member.id === authUser.id || (member as any).wqUserId === authUser.id)) ||
    (authUser?.username && member.username && authUser.username.toLowerCase() === member.username.toLowerCase()) ||
    (authUser?.displayName && member.name && authUser.displayName.toLowerCase().trim() === member.name.toLowerCase().trim()) ||
    (member.name && member.name.toLowerCase().includes("dharaneesh") && authUser?.displayName?.toLowerCase().includes("dharaneesh"))
  )

  const displayName = member.name || "Ecosystem Member"
  const username = member.username || displayName.toLowerCase().replace(/[^a-z0-9]/g, "")
  const role = member.role || "MEMBER"
  const normalizedLevel = (member.verificationLevel || "").toString().toLowerCase().trim()
  const isVerified = Boolean(
    normalizedLevel &&
    normalizedLevel !== "none" &&
    normalizedLevel !== "unverified" &&
    normalizedLevel !== "false"
  )
  const trustScore = typeof member.trustScore === "number" ? member.trustScore : (isVerified ? 90 : 0)
  const followersCount = member.followersCount ?? 0
  const followingCount = member.followingCount ?? 0
  const sampleDispatches = member.recentDispatches || []
  const postsCount = member.postsCount ?? sampleDispatches.length
  const location = member.location || "San Francisco, CA"
  const headline = member.headline || member.category || (isVerified ? "Verified Ecosystem Participant" : "Ecosystem Member")
  const joinedDate = member.joinedDate || "Member since January 2024"

  const sectors = member.sectors && member.sectors.length > 0
    ? member.sectors
    : ["Distributed Systems", "Enterprise AI", "DeepTech", "Delaware Secondary"]

  const accreditations = member.verifiedAccreditations && member.verifiedAccreditations.length > 0
    ? member.verifiedAccreditations.filter((a: string) => !/(kyc|aml|506|statutory|signatory)/i.test(a))
    : [
        "White Quantex Ecosystem Member",
        "Verified Platform Contributor",
      ]

  const defaultBio = member.bio || member.description || (
    `${displayName} is an active technology architect and ecosystem participant on White Quantex. Spearheading enterprise systems development and ecosystem collaboration.`
  )

  const handleCopyLink = () => {
    const url = window.location.origin + `/profile?u=${username}`
    navigator.clipboard.writeText(url)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleSendMessage = () => {
    setMessageSent(true)
    setTimeout(() => {
      setMessageSent(false)
      const targetWqId = (member as any).wqUserId || member.id || username
      const targetUser = member.username || username
      const targetDisplay = displayName
      navigate(`/messages?user=${encodeURIComponent(targetWqId)}&username=${encodeURIComponent(targetUser)}&name=${encodeURIComponent(targetDisplay)}`)
      onClose()
    }, 400)
  }

  const handleTogglePostLike = (postId: string) => {
    setLikedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111315] shadow-2xl rounded-2xl sm:rounded-3xl gap-0">
        <DialogTitle className="sr-only">{displayName} Profile</DialogTitle>
        <DialogDescription className="sr-only">Detailed profile and credentials for {displayName}</DialogDescription>

        {/* ── Banner Header ── */}
        <div className="relative h-28 sm:h-32 bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 overflow-hidden">
          {/* Subtle geometric pattern overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.2),transparent_70%)]" />
          <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:16px_16px]" />

          {/* Top action buttons */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
            <button
              onClick={handleCopyLink}
              title="Copy Profile Link"
              className="h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white flex items-center justify-center transition-all cursor-pointer border border-white/20"
            >
              {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
            <button
              onClick={onClose}
              title="Close Profile"
              className="h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white flex items-center justify-center transition-all cursor-pointer border border-white/20"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Badge indicator in top left */}
          <div className="absolute top-3 left-4 flex items-center gap-2">
            {isVerified ? (
              <Badge className="bg-black/40 backdrop-blur-md text-emerald-400 border border-white/10 text-[10px] font-bold py-0.5">
                <Sparkles className="h-3 w-3 mr-1 text-emerald-400" />
                Verified WQ Profile
              </Badge>
            ) : (
              <Badge className="bg-black/40 backdrop-blur-md text-amber-400 border border-amber-500/30 text-[10px] font-bold py-0.5">
                <ShieldAlert className="h-3 w-3 mr-1 text-amber-400" />
                Unverified Profile
              </Badge>
            )}
          </div>
        </div>

        {/* ── Avatar & Identity Section ── */}
        <div className="px-5 sm:px-6 pt-0 pb-4 relative -mt-12 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div className="flex items-end gap-3.5">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl ring-4 ring-white dark:ring-[#111315] shadow-xl shrink-0 bg-slate-900">
                {member.avatar || member.avatarUrl ? (
                  <AvatarImage src={member.avatar || member.avatarUrl} alt={displayName} className="object-cover" />
                ) : null}
                <AvatarFallback className={cn("text-white font-extrabold text-xl rounded-2xl", member.avatarColor || "bg-emerald-700")}>
                  {member.avatarInitials || getInitials(displayName)}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-0.5 pb-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                    {displayName}
                  </h3>
                  <VerificationBadge level={member.verificationLevel || "NONE"} />
                  {isSelf && (
                    <Badge className="text-[9px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-1.5 py-0 font-extrabold">
                      YOU
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">@{username}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Globe className="h-3 w-3 text-slate-400" /> {location}</span>
                </div>
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
              {isSelf ? (
                <Button
                  size="sm"
                  onClick={() => navigate("/profile")}
                  className="h-8 px-3.5 text-xs font-bold rounded-xl bg-slate-900 text-white dark:bg-white dark:text-black cursor-pointer shadow-sm hover:opacity-90"
                >
                  Edit My Profile
                </Button>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant={isFollowing ? "outline" : "default"}
                    onClick={() => onToggleFollow && onToggleFollow(member.id)}
                    className={cn(
                      "h-8 px-4 text-xs font-bold rounded-xl cursor-pointer transition-all shadow-sm",
                      isFollowing
                        ? "border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-slate-300 bg-white/60 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    )}
                  >
                    {isFollowing ? (
                      <span className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-500" /> Following
                      </span>
                    ) : (
                      "+ Follow"
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSendMessage}
                    className="h-8 px-3 text-xs font-semibold rounded-xl cursor-pointer border-slate-200 dark:border-zinc-800 hover:border-emerald-500/40 text-slate-700 dark:text-slate-300"
                  >
                    <Mail className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                    {messageSent ? "Opening Chat..." : "Message"}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Headline & Badges */}
          <div className="space-y-1 pt-1">
            <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 leading-snug">
              {headline}
            </p>
            {member.badgeText && (
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                <Award className="h-3 w-3" />
                <span>{member.badgeText}</span>
              </div>
            )}
          </div>

          {/* ── Metric Cards Bar (Clickable tabs shortcuts) ── */}
          <div className="grid grid-cols-4 gap-2 pt-2 text-center">
            <div className="p-2 sm:p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/60">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Trust Score</span>
              {isVerified && trustScore > 0 ? (
                <span className="font-extrabold text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-0.5 mt-0.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> {trustScore}%
                </span>
              ) : (
                <span className="font-bold text-xs sm:text-xs text-amber-500 dark:text-amber-400 flex items-center justify-center gap-1 mt-0.5" title="Account identity has not been verified">
                  <ShieldAlert className="h-3.5 w-3.5 text-amber-500 shrink-0" /> Not Verified
                </span>
              )}
            </div>

            <div
              onClick={() => setActiveTab("followers")}
              className={cn(
                "p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer group",
                activeTab === "followers"
                  ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/20"
                  : "border-slate-100 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/60 hover:border-emerald-500/50 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10"
              )}
              title="Click to view followers list"
            >
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Followers
              </span>
              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white mt-0.5 block group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {formatNumber(followersCount)}
              </span>
            </div>

            <div
              onClick={() => setActiveTab("following")}
              className={cn(
                "p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer group",
                activeTab === "following"
                  ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/20"
                  : "border-slate-100 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/60 hover:border-emerald-500/50 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10"
              )}
              title="Click to view following list"
            >
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Following
              </span>
              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white mt-0.5 block group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {formatNumber(followingCount)}
              </span>
            </div>

            <div
              onClick={() => setActiveTab("dispatches")}
              className={cn(
                "p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer group",
                activeTab === "dispatches"
                  ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/20"
                  : "border-slate-100 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/60 hover:border-emerald-500/50 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10"
              )}
              title="Click to view dispatches"
            >
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Dispatches
              </span>
              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white mt-0.5 block group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {postsCount}
              </span>
            </div>
          </div>
        </div>

        {/* ── Content Tabs ── */}
        <div className="px-5 sm:px-6 pb-6 pt-1 border-t border-slate-100 dark:border-zinc-800">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-5 h-9 bg-slate-100 dark:bg-zinc-900 rounded-xl p-1 mb-4 gap-1">
              <TabsTrigger value="overview" className="text-[11px] sm:text-xs font-bold rounded-lg py-1 px-1 truncate">
                Overview
              </TabsTrigger>
              <TabsTrigger value="dispatches" className="text-[11px] sm:text-xs font-bold rounded-lg py-1 px-1 truncate">
                Dispatches ({postsCount})
              </TabsTrigger>
              <TabsTrigger value="followers" className="text-[11px] sm:text-xs font-bold rounded-lg py-1 px-1 truncate">
                Followers ({formatNumber(followersCount)})
              </TabsTrigger>
              <TabsTrigger value="following" className="text-[11px] sm:text-xs font-bold rounded-lg py-1 px-1 truncate">
                Following ({formatNumber(followingCount)})
              </TabsTrigger>
              <TabsTrigger value="credentials" className="text-[11px] sm:text-xs font-bold rounded-lg py-1 px-1 truncate">
                Accreditations
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: OVERVIEW */}
            <TabsContent value="overview" className="space-y-4 focus-visible:outline-none">
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Biography & Executive Thesis
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-[#16181a] p-3.5 rounded-xl border border-slate-100 dark:border-zinc-800">
                  {defaultBio}
                </p>
              </div>

              {/* Sectors of focus */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Sectors & Expertise
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {sectors.map((sec, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                    >
                      {sec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Affiliated entity or company if any */}
              {member.companyId && (
                <div className="p-3 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-[#16181a] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Building2 className="h-4 w-4 text-emerald-500" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {member.companyId}
                      </span>
                      {member.ticker && (
                        <span className="font-mono text-[10px] text-slate-400 ml-1.5">
                          ${member.ticker}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                    Primary Entity
                  </Badge>
                </div>
              )}

              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {joinedDate}
                </span>
                <button
                  onClick={handleCopyLink}
                  className="hover:text-emerald-500 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Share2 className="h-3 w-3" /> Share Profile
                </button>
              </div>
            </TabsContent>

            {/* TAB 2: DISPATCHES */}
            <TabsContent value="dispatches" className="space-y-3 focus-visible:outline-none">
              {sampleDispatches.length === 0 ? (
                <div className="p-8 text-center rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-[#16181a] space-y-2">
                  <MessageSquare className="h-6 w-6 text-slate-400 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No dispatches published yet</p>
                  <p className="text-[11px] text-slate-400">
                    Dispatches published by {displayName} will appear here in real-time.
                  </p>
                </div>
              ) : (
                sampleDispatches.map((disp) => {
                  const isPostLiked = Boolean(likedPosts[disp.id])
                  return (
                    <div
                      key={disp.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-[#16181a] space-y-2 hover:border-emerald-500/40 transition-all"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                          <span>{displayName}</span>
                          {disp.tag && (
                            <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold">
                              #{disp.tag}
                            </span>
                          )}
                        </div>
                        <span className="text-slate-400 text-[10px]">{disp.timestamp}</span>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-normal">
                        {disp.content}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800/80 text-[11px] text-slate-400">
                        <button
                          onClick={() => handleTogglePostLike(disp.id)}
                          className={cn(
                            "flex items-center gap-1 transition-colors cursor-pointer font-semibold",
                            isPostLiked ? "text-rose-500" : "hover:text-rose-500"
                          )}
                        >
                          <Heart className={cn("h-3.5 w-3.5", isPostLiked && "fill-rose-500")} />
                          <span>{disp.likesCount + (isPostLiked ? 1 : 0)} Likes</span>
                        </button>

                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>{disp.commentsCount} Comments</span>
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </TabsContent>

            {/* TAB 3: FOLLOWERS */}
            <TabsContent value="followers" className="focus-visible:outline-none">
              <UserListTabContent
                type="followers"
                userId={member.id}
                count={followersCount}
              />
            </TabsContent>

            {/* TAB 4: FOLLOWING */}
            <TabsContent value="following" className="focus-visible:outline-none">
              <UserListTabContent
                type="following"
                userId={member.id}
                count={followingCount}
              />
            </TabsContent>

            {/* TAB 5: ACCREDITATIONS */}
            <TabsContent value="credentials" className="space-y-3 focus-visible:outline-none">
              {!isVerified ? (
                <div className="p-6 text-center rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-2">
                  <ShieldAlert className="h-7 w-7 text-amber-500 mx-auto" />
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Identity & Credentials Not Verified
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                    This account has not completed identity verification on White Quantex.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    {accreditations.map((acc, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#16181a] flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {acc}
                          </span>
                        </div>
                        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[9px] font-extrabold uppercase shrink-0">
                          VERIFIED
                        </Badge>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5 text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
                    <span>
                      Verified member of the White Quantex innovation ecosystem.
                    </span>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
