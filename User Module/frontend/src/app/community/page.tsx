import React, { useState, useEffect, useRef, useMemo } from "react"
import {
  Home, Search, Users, MessageSquare, PlusSquare, Heart, Bookmark, Share2,
  Sparkles, TrendingUp, Lock, FileText, UserCheck, BookOpen, Bell,
  ShieldCheck, CheckCircle2, UserPlus, MessageCircle, ArrowUpRight, Filter,
  PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Menu, X, Image as ImageIcon, Compass,
  Send, Loader2, Building2, ExternalLink, Copy, Check, Briefcase, Globe, Calendar, Radio,
  Newspaper, Clock, ArrowRight, Rocket, User, Pencil, Trash2, AlertCircle, RefreshCw, Zap
} from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate, useSearchParams } from "react-router"
import { Card, CardContent } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Badge } from "../../components/ui/badge"
import { VerificationBadge } from "../../components/shared/VerificationBadge"
import { FounderCard } from "../../components/shared/FounderCard"
import { InvestorCard } from "../../components/shared/InvestorCard"
import { MemberProfileModal, type ProfileMemberData } from "../../components/community/MemberProfileModal"
import { useAuthStore } from "../../stores/auth-store"
import { communityService, type CommunityMember, type CommunityNotification } from "../../services/community/communityService"
import { exploreService, type CorporateNews } from "../../services/explore/exploreService"
import { getCompanyLogoStyle } from "../explore/utils/exploreUtils"
import { formatNumber, getInitials, cn } from "../../lib/utils"
import type { Post, Comment, Community } from "../../types"

// User-friendly creation timestamp formatter
function formatPostTimestamp(dateStr?: string): string {
  if (!dateStr) return ""
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date)
  } catch {
    return dateStr
  }
}

// Notification icon resolver based on notification type
function getNotificationIcon(type: string) {
  switch (type) {
    case "LIKE":
      return Heart
    case "FOLLOW":
      return UserPlus
    case "VENTURE":
      return TrendingUp
    case "VERIFICATION":
      return ShieldCheck
    case "COMMENT":
      return MessageCircle
    default:
      return Bell
  }
}

// Helper to determine if a post originates from an operating Company Account (Registered via http://localhost:7001)
export function isCompanyAccountPost(p: Post): boolean {
  const authorType = (p.authorType || p.author?.authorType || "").toUpperCase()
  const accountType = (p.authorAccountType || p.author?.accountType || "").toUpperCase()
  if (authorType === "COMPANY" || accountType === "COMPANY" || accountType === "CORPORATE_ISSUER") {
    return true
  }
  if (p.id?.startsWith("official-post-") || p.id?.startsWith("company-post-")) {
    return true
  }
  return false
}

// Helper to determine if a post originates from an institutional Venture Account (Registered via http://localhost:7001)
export function isVentureAccountPost(p: Post): boolean {
  const authorType = (p.authorType || p.author?.authorType || "").toUpperCase()
  const accountType = (p.authorAccountType || p.author?.accountType || "").toUpperCase()
  if (authorType === "VENTURE" || accountType === "VENTURE" || accountType === "VENTURE_CAPITAL") {
    return true
  }
  if (p.id?.startsWith("venture-post-")) {
    return true
  }
  return false
}

// Helper to determine if a post originates from a User Account (Registered via http://localhost:7000)
export function isUserAccountPost(p: Post): boolean {
  return !isCompanyAccountPost(p) && !isVentureAccountPost(p)
}

// Resolve the official Company or Venture Name when posting from a corporate or venture account
export function resolvePostAccountName(post: Post): string {
  const isCompany = isCompanyAccountPost(post)
  const isVenture = isVentureAccountPost(post)

  if (!isCompany && !isVenture) {
    return post.author?.displayName || (post as any).authorName || "Ecosystem Member"
  }

  // 1. If explicit companyId is set and is human-readable (not a generic internal ID)
  if (post.companyId && !post.companyId.startsWith("comp-") && !post.companyId.startsWith("wq-")) {
    return post.companyId
  }

  // 2. Extract company/venture name from headline if format is "... @ Company Name" (e.g. "Partner @ European Tech Horizons" -> "European Tech Horizons")
  const rawHeadline = post.author?.headline || (post as any).authorHeadline || ""
  const atMatch = rawHeadline.match(/@\s*([^,·•|]+)/)
  if (atMatch && atMatch[1]?.trim()) {
    return atMatch[1].trim()
  }

  // 3. Known ticker dictionary for verified issuers and venture funds
  if (post.ticker) {
    const cleanTicker = post.ticker.replace("$", "").trim().toUpperCase()
    const KNOWN_ENTITY_MAP: Record<string, string> = {
      ETH: "European Tech Horizons",
      AFT: "AeroFusion Technologies",
      AFSN: "AeroFusion Technologies",
      OCGN: "OmniCognition Labs",
      VGRD: "VerdeGrid Energy Systems",
      TFLOW: "TechFlow AI Solutions Inc.",
      GGRID: "NovaGrid Energy Networks",
      NVMD: "NovaMind AI",
      MSRB: "MediSync Robotics Corp",
      OLNT: "OmniLogic NeuroTech Ltd",
      QSC: "Quantex Sovereign Capital",
      SEQ: "Sequoia Capital",
      FFND: "Founders Fund",
      GHV: "Green Horizon Ventures",
    }
    if (KNOWN_ENTITY_MAP[cleanTicker]) {
      return KNOWN_ENTITY_MAP[cleanTicker]
    }
  }

  // 4. If author displayName is already a company/entity name, use it
  const authorDisplay = post.author?.displayName || (post as any).authorName || ""
  if (/\b(inc|corp|ltd|technologies|labs|systems|capital|horizons|ventures|fund|partners|consortium|energy|robotics|ai)\b/i.test(authorDisplay)) {
    return authorDisplay
  }

  // 5. If companyId starts with "comp-", convert slug
  if (post.companyId) {
    const slug = post.companyId.replace(/^comp-/, "").toUpperCase()
    if (slug === "ETH") return "European Tech Horizons"
    if (slug === "AFT") return "AeroFusion Technologies"
    if (slug === "OCGN") return "OmniCognition Labs"
    if (slug === "VGRD") return "VerdeGrid Energy Systems"
    return slug.replace(/-/g, " ")
  }

  return authorDisplay || (isCompany ? "Corporate Account" : "Venture Account")
}

export function resolvePostAvatarInitials(post: Post, accountName: string): string {
  const isCompany = isCompanyAccountPost(post)
  const isVenture = isVentureAccountPost(post)
  if (isCompany || isVenture) {
    if (post.ticker) {
      return post.ticker.replace("$", "").slice(0, 3).toUpperCase()
    }
    return getInitials(accountName)
  }
  return getInitials(accountName)
}

// Interactive Post Comments Component
function PostCommentsSection({ postId }: { postId: string }) {
  const queryClient = useQueryClient()
  const { user: authUser } = useAuthStore()
  const [commentText, setCommentText] = useState("")

  const { data: comments, isLoading } = useQuery({
    queryKey: ["post-comments", postId],
    queryFn: () => communityService.getComments(postId),
    staleTime: 5_000,
  })

  const addCommentMutation = useMutation({
    mutationFn: (content: string) => communityService.addComment(postId, content),
    onSuccess: () => {
      setCommentText("")
      communityService.trackActivity(postId, { activityType: "COMMENT" })
      queryClient.invalidateQueries({ queryKey: ["post-comments", postId] })
      queryClient.invalidateQueries({ queryKey: ["community-posts"] })
    },
  })

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => communityService.deleteComment(postId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-comments", postId] })
      queryClient.invalidateQueries({ queryKey: ["community-posts"] })
    },
  })

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim() || addCommentMutation.isPending) return
    addCommentMutation.mutate(commentText.trim())
  }

  return (
    <div className="pt-3 mt-3 border-t border-slate-100 dark:border-zinc-800/80 space-y-3">
      {/* Comment Form */}
      <form onSubmit={handleAddComment} className="flex items-center gap-2">
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Write a constructive insight or comment..."
          className="flex-1 text-xs bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white rounded-[8px] px-3 py-2 outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-400"
        />
        <Button
          type="submit"
          size="sm"
          disabled={!commentText.trim() || addCommentMutation.isPending}
          className="h-8 px-3 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-[8px] shrink-0 cursor-pointer"
        >
          {addCommentMutation.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
        </Button>
      </form>

      {/* Comments List */}
      {isLoading ? (
        <div className="py-2 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading comments...
        </div>
      ) : !comments || comments.length === 0 ? (
        <p className="text-[11px] text-slate-400 py-1 italic">No comments yet. Be the first to reply!</p>
      ) : (
        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
          {comments.map((c) => {
            const isCommentAuthor = Boolean(
              (authUser?.id && (c.author?.id === authUser.id || (c as any).wqAuthorId === authUser.id)) ||
              ((authUser as any)?.wqUserId && (c.author?.id === (authUser as any).wqUserId || (c as any).wqAuthorId === (authUser as any).wqUserId)) ||
              (authUser?.username && c.author?.username === authUser.username)
            )
            const commentAuthorName = (isCommentAuthor && authUser?.displayName)
              ? authUser.displayName
              : (c.author?.displayName || (c as any).authorName || "Member")
            const commentAvatar = (isCommentAuthor && authUser?.avatarUrl)
              ? authUser.avatarUrl
              : c.author?.avatarUrl
            const commentInitials = getInitials(commentAuthorName)

            return (
              <div
                key={c.id}
                className="p-2.5 rounded-[8px] bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800/60 flex items-start gap-2.5"
              >
                <Avatar className="h-7 w-7 rounded-[6px] shrink-0">
                  <AvatarImage src={commentAvatar} alt={commentAuthorName} />
                  <AvatarFallback className="text-[10px] font-bold bg-slate-800 text-white rounded-[6px]">
                    {commentInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] font-bold text-slate-900 dark:text-white">
                        {commentAuthorName}
                      </span>
                      {c.author?.verificationLevel && (
                        <VerificationBadge level={c.author.verificationLevel} />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400">
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ""}
                      </span>
                      {isCommentAuthor && (
                        <button
                          type="button"
                          onClick={() => deleteCommentMutation.mutate(c.id)}
                          disabled={deleteCommentMutation.isPending}
                          title="Delete comment"
                          className="p-0.5 rounded text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                    {c.content}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function CommunityPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const companyIdParam = searchParams.get("companyId")
  const companyTickerParam = searchParams.get("ticker")
  const companyNameParam = searchParams.get("company")

  const { user: authUser } = useAuthStore()
  const currentUserId = authUser?.id || (authUser as any)?.wqUserId || "u-1"
  const currentUserDisplayName =
    authUser?.displayName ||
    [authUser?.firstName, authUser?.lastName].filter(Boolean).join(" ") ||
    authUser?.username ||
    "User"

  const currentUser = {
    id: currentUserId,
    wqUserId: currentUserId,
    displayName: currentUserDisplayName,
    username: authUser?.username || "user",
    avatarUrl: authUser?.avatarUrl || "",
    email: authUser?.email || null,
    verificationLevel: authUser?.verificationLevel || "NONE",
    trustScore: authUser?.trustScore,
    primaryRole: authUser?.primaryRole || "FOUNDER",
    headline: authUser?.headline || "Ecosystem Member",
  }
  const queryClient = useQueryClient()

  // State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true)
  const [rightSearchQuery, setRightSearchQuery] = useState("")
  const [isSearchVisibleMobile, setIsSearchVisibleMobile] = useState(true)
  const lastScrollY = useRef(0)

  const handleFeedScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentScrollY = e.currentTarget.scrollTop
    const diff = currentScrollY - lastScrollY.current

    // Always show search bar when near the top of the feed
    if (currentScrollY <= 15) {
      setIsSearchVisibleMobile(true)
      lastScrollY.current = currentScrollY
      return
    }

    // Scroll delta threshold to avoid jitter / noise
    if (Math.abs(diff) >= 8) {
      if (diff > 0) {
        // Scrolling DOWN -> SHOW search bar
        setIsSearchVisibleMobile(true)
      } else {
        // Scrolling UPWARD -> HIDE search bar
        setIsSearchVisibleMobile(false)
      }
      lastScrollY.current = currentScrollY
    }
  }

  const [postContent, setPostContent] = useState("")
  const [selectedPostType] = useState<string>("POST")
  const [selectedVisibility, setSelectedVisibility] = useState<"PUBLIC" | "PROTECTED" | "PRIVATE">("PUBLIC")
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>("")
  const [mediaUrlInput, setMediaUrlInput] = useState("")
  const [createPostError, setCreatePostError] = useState<string | null>(null)

  // Edit Post State
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [editContent, setEditContent] = useState("")
  const [editVisibility, setEditVisibility] = useState<"PUBLIC" | "PROTECTED" | "PRIVATE">("PUBLIC")
  const [editPostError, setEditPostError] = useState<string | null>(null)

  // Tabs & Filters
  const [isPostModalOpen, setIsPostModalOpen] = useState(false)
  const [isCreateCommunityModalOpen, setIsCreateCommunityModalOpen] = useState(false)
  const [createCommunityError, setCreateCommunityError] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [commName, setCommName] = useState("")
  const [commDesc, setCommDesc] = useState("")
  const [commCategory, setCommCategory] = useState("AI & ML")
  const [commIsPrivate, setCommIsPrivate] = useState(false)

  const [activeTab, setActiveTab] = useState<"home" | "communities" | "people" | "news">(() => {
    if (typeof window !== "undefined") {
      const urlTab = new URLSearchParams(window.location.search).get("tab") as any
      if (urlTab) return urlTab
      const saved = sessionStorage.getItem("wq_community_tab") as any
      if (saved) return saved
    }
    return "home"
  })
  const [feedFilter, setFeedFilter] = useState<"all" | "companies" | "ventures" | "my_posts">(() => {
    if (typeof window !== "undefined") return (sessionStorage.getItem("wq_feed_filter") as any) || "all"
    return "all"
  })
  const [communitySubFilter, setCommunitySubFilter] = useState<"all" | "my_communities">(() => {
    if (typeof window !== "undefined") return (sessionStorage.getItem("wq_comm_subfilter") as any) || "all"
    return "all"
  })
  const [peopleSubFilter, setPeopleSubFilter] = useState<"all" | "founders" | "investors">(() => {
    if (typeof window !== "undefined") return (sessionStorage.getItem("wq_people_subfilter") as any) || "all"
    return "all"
  })
  const [notifFilter, setNotifFilter] = useState<"all" | "mentions" | "activity">("all")

  // News State
  const [newsCategoryFilter, setNewsCategoryFilter] = useState<string>(() => {
    if (typeof window !== "undefined") return sessionStorage.getItem("wq_news_cat") || "ALL"
    return "ALL"
  })
  const [newsSearchQuery, setNewsSearchQuery] = useState<string>(() => {
    if (typeof window !== "undefined") return sessionStorage.getItem("wq_news_search") || ""
    return ""
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("wq_community_tab", activeTab)
      sessionStorage.setItem("wq_feed_filter", feedFilter)
      sessionStorage.setItem("wq_comm_subfilter", communitySubFilter)
      sessionStorage.setItem("wq_people_subfilter", peopleSubFilter)
      sessionStorage.setItem("wq_news_cat", newsCategoryFilter)
      sessionStorage.setItem("wq_news_search", newsSearchQuery)
    }
  }, [activeTab, feedFilter, communitySubFilter, peopleSubFilter, newsCategoryFilter, newsSearchQuery])
  const [bookmarkedNews, setBookmarkedNews] = useState<Record<string, boolean>>({})
  const [selectedNewsArticle, setSelectedNewsArticle] = useState<CorporateNews | null>(null)
  const [copiedNewsId, setCopiedNewsId] = useState<string | null>(null)

  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null)

  // Local Overrides
  const [likedPostsMap, setLikedPostsMap] = useState<Record<string, boolean>>({})
  const [likesDeltaMap, setLikesDeltaMap] = useState<Record<string, number>>({})
  const [bookmarkedPostsMap, setBookmarkedPostsMap] = useState<Record<string, boolean>>({})
  const [joinedCommunities, setJoinedCommunities] = useState<Record<string, boolean>>({})
  const [followedCompanies, setFollowedCompanies] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("wq_followed_companies")
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })
  const [companySubTab, setCompanySubTab] = useState<"all" | "dispatches" | "communities" | "followers" | "following" | "about">("all")
  const [copiedCIK, setCopiedCIK] = useState(false)
  const [followedUsersMap, setFollowedUsersMap] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("wq_followed_users")
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })
  const [inspectedMember, setInspectedMember] = useState<ProfileMemberData | null>(null)
  const { data: serverFollowingIds } = useQuery({
    queryKey: ["user-follows"],
    queryFn: () => communityService.getFollowingList(),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (serverFollowingIds && serverFollowingIds.length > 0) {
      setFollowedUsersMap((prev) => {
        const next = { ...prev }
        serverFollowingIds.forEach((id) => {
          next[id] = true
        })
        try {
          localStorage.setItem("wq_followed_users", JSON.stringify(next))
        } catch {}
        return next
      })
    }
  }, [serverFollowingIds])

  const toggleFollowUser = async (userId: string) => {
    if (!userId) return
    const isCurrentlyFollowing = Boolean(
      followedUsersMap[userId] ||
      (inspectedMember && (inspectedMember.id === userId || inspectedMember.username === userId) && (followedUsersMap[inspectedMember.id] || (inspectedMember.username && followedUsersMap[inspectedMember.username])))
    )
    const newFollowingState = !isCurrentlyFollowing
    const delta = newFollowingState ? 1 : -1

    // 1. Optimistic update in followedUsersMap
    setFollowedUsersMap((prev) => {
      const next = { ...prev, [userId]: newFollowingState }
      if (inspectedMember && (inspectedMember.id === userId || inspectedMember.username === userId)) {
        next[inspectedMember.id] = newFollowingState
        if (inspectedMember.username) next[inspectedMember.username] = newFollowingState
      }
      try {
        localStorage.setItem("wq_followed_users", JSON.stringify(next))
      } catch {}
      return next
    })

    // 2. Optimistic update on inspectedMember
    setInspectedMember((prev) => {
      if (!prev) return prev
      if (prev.id === userId || prev.username === userId) {
        const currentFollowers = prev.followersCount ?? 0
        return {
          ...prev,
          followersCount: Math.max(0, currentFollowers + delta),
        }
      }
      return prev
    })

    // 3. Call backend API
    try {
      const res = newFollowingState
        ? await communityService.followUser(userId)
        : await communityService.unfollowUser(userId)

      if (res && typeof res.followersCount === "number") {
        setInspectedMember((prev) => {
          if (!prev) return prev
          if (prev.id === userId || prev.username === userId) {
            return {
              ...prev,
              followersCount: res.followersCount,
            }
          }
          return prev
        })
      }
      queryClient.invalidateQueries({ queryKey: ["community-members"] })
      queryClient.invalidateQueries({ queryKey: ["user-follows"] })
    } catch (err: any) {
      console.warn("Follow API sync note:", err?.message)
    }
  }

  useEffect(() => {
    const handleOpenModal = () => setIsPostModalOpen(true)
    const handleToggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev)
    const handleTabChange = (e: any) => {
      if (e.detail && (e.detail === "home" || e.detail === "communities" || e.detail === "people" || e.detail === "news")) {
        setActiveTab(e.detail)
      }
    }
    window.addEventListener("open-create-post-modal", handleOpenModal)
    window.addEventListener("toggle-community-mobile-menu", handleToggleMobileMenu)
    window.addEventListener("set-community-tab", handleTabChange)

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      if (params.get("create") === "true") {
        setIsPostModalOpen(true)
      }
      const tabParam = params.get("tab")
      if (tabParam === "home" || tabParam === "communities" || tabParam === "people" || tabParam === "news") {
        setActiveTab(tabParam)
      }
    }

    return () => {
      window.removeEventListener("open-create-post-modal", handleOpenModal)
      window.removeEventListener("toggle-community-mobile-menu", handleToggleMobileMenu)
      window.removeEventListener("set-community-tab", handleTabChange)
    }
  }, [])

  // Recommendation Algorithm State: "suggested" active by default
  const [feedAlgorithmMode, setFeedAlgorithmMode] = useState<"suggested" | "latest">("suggested")
  const [refreshSeed, setRefreshSeed] = useState<string>(() => Date.now().toString())
  const [isRefreshingFeed, setIsRefreshingFeed] = useState(false)

  // Interactive handler to refresh recommendations on demand
  const handleRefreshFeed = () => {
    setIsRefreshingFeed(true)
    const newSeed = Date.now().toString()
    setRefreshSeed(newSeed)
    queryClient.invalidateQueries({ queryKey: ["community-posts"] })
    setTimeout(() => setIsRefreshingFeed(false), 600)
  }

  // Queries - Algorithmic suggested feed on refresh & load, with latest fallback
  const { data: postsData, isLoading: isPostsLoading } = useQuery({
    queryKey: ["community-posts", feedAlgorithmMode, refreshSeed, feedFilter, rightSearchQuery],
    queryFn: () => {
      if (feedAlgorithmMode === "suggested") {
        return communityService.getSuggestedFeed(0, 50, {
          refreshSeed,
          filter: feedFilter !== "all" ? feedFilter : undefined,
          query: rightSearchQuery || undefined,
        })
      }
      return communityService.getFeed(0, 50, {
        query: rightSearchQuery || undefined,
      })
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
  })
  const posts: Post[] = postsData?.content ?? []
  const topInterestTags = (postsData as any)?.topTags || []
  const topPostTypes = (postsData as any)?.topPostTypes || []
  const hasPersonalization = Boolean((postsData as any)?.hasPersonalization)

  // Batch track impression for top displayed posts
  useEffect(() => {
    if (posts && posts.length > 0) {
      const views = posts.slice(0, 10).map((p) => ({
        postId: p.id,
        activityType: "VIEW",
        postType: p.postType,
        hashtags: p.hashtags,
        authorId: p.wqAuthorId,
        communityId: p.communityId,
      }))
      communityService.trackBatchActivities(views)
    }
  }, [posts])

  // Synchronized posts published directly from Company Module
  const [companyModulePosts, setCompanyModulePosts] = useState<Post[]>(() => {
    if (typeof window === "undefined") return []
    try {
      const saved = localStorage.getItem("wq_company_module_posts")
      if (!saved) return []
      const list = JSON.parse(saved)
      return list.map((p: any) => {
        const compName = resolvePostAccountName(p)
        return {
          ...p,
          companyId: p.companyId || compName,
          author: {
            ...p.author,
            displayName: (isCompanyAccountPost(p) || isVentureAccountPost(p)) ? compName : (p.author?.displayName || compName),
          },
        }
      })
    } catch {
      return []
    }
  })

  useEffect(() => {
    const handleSyncCompanyModulePosts = () => {
      try {
        const saved = localStorage.getItem("wq_company_module_posts")
        if (saved) {
          const list = JSON.parse(saved)
          const normalized = list.map((p: any) => {
            const compName = resolvePostAccountName(p)
            return {
              ...p,
              companyId: p.companyId || compName,
              author: {
                ...p.author,
                displayName: (isCompanyAccountPost(p) || isVentureAccountPost(p)) ? compName : (p.author?.displayName || compName),
              },
            }
          })
          setCompanyModulePosts(normalized)
        }
      } catch {}
    }

    window.addEventListener("storage", handleSyncCompanyModulePosts)

    let bc: BroadcastChannel | null = null
    try {
      bc = new BroadcastChannel("wq_posts_channel")
      bc.onmessage = (event) => {
        if (event.data?.type === "NEW_POST") {
          handleSyncCompanyModulePosts()
          queryClient.invalidateQueries({ queryKey: ["community-posts"] })
        }
      }
    } catch {}

    return () => {
      window.removeEventListener("storage", handleSyncCompanyModulePosts)
      bc?.close()
    }
  }, [queryClient])

  // Combined pool of all posts (preserves algorithmic ranking for suggested mode)
  const allPostsPool: Post[] = useMemo(() => {
    const map = new Map<string, Post>()
    if (feedAlgorithmMode === "suggested") {
      posts.forEach((p) => map.set(p.id, p))
      companyModulePosts.forEach((p) => {
        if (!map.has(p.id)) map.set(p.id, p)
      })
    } else {
      companyModulePosts.forEach((p) => map.set(p.id, p))
      posts.forEach((p) => {
        if (!map.has(p.id)) map.set(p.id, p)
      })
    }
    return Array.from(map.values())
  }, [companyModulePosts, posts, feedAlgorithmMode])

  const { data: communitiesData } = useQuery({
    queryKey: ["community-hubs"],
    queryFn: () => communityService.getCommunities(),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })
  const communities = communitiesData ?? []

  const { data: membersData, isLoading: isMembersLoading } = useQuery({
    queryKey: ["community-members", peopleSubFilter, rightSearchQuery],
    queryFn: () =>
      communityService.getMembers(
        peopleSubFilter === "all" ? undefined : peopleSubFilter === "founders" ? "FOUNDER" : "INVESTOR",
        rightSearchQuery.trim() || undefined
      ),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })
  const members: CommunityMember[] = membersData ?? []

  const { data: notificationsData, isLoading: isNotificationsLoading } = useQuery({
    queryKey: ["community-notifications", notifFilter],
    queryFn: () => communityService.getNotifications(notifFilter === "all" ? undefined : notifFilter),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })
  const notifications: CommunityNotification[] = notificationsData ?? []

  // Mutations
  const createPostMutation = useMutation({
    mutationFn: (payload: any) => communityService.createPost(payload),
    onSuccess: () => {
      setPostContent("")
      setMediaUrlInput("")
      setSelectedCommunityId("")
      setSelectedVisibility("PUBLIC")
      setCreatePostError(null)
      setIsPostModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ["community-posts"] })
    },
    onError: (err: any) => {
      setCreatePostError(err?.response?.data?.message || err?.message || "Failed to publish post. Please try again.")
    },
  })

  const updatePostMutation = useMutation({
    mutationFn: ({ postId, payload }: { postId: string; payload: any }) =>
      communityService.updatePost(postId, payload),
    onSuccess: () => {
      setEditingPost(null)
      setEditContent("")
      setEditPostError(null)
      queryClient.invalidateQueries({ queryKey: ["community-posts"] })
    },
    onError: (err: any) => {
      setEditPostError(err?.response?.data?.message || err?.message || "Failed to update post.")
    },
  })

  const deletePostMutation = useMutation({
    mutationFn: (postId: string) => communityService.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] })
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || err?.message || "Failed to delete post.")
    },
  })

  const handleEditPostSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPost) return
    if (!editContent.trim()) {
      setEditPostError("Post content cannot be empty.")
      return
    }
    setEditPostError(null)
    updatePostMutation.mutate({
      postId: editingPost.id,
      payload: {
        content: editContent.trim(),
        visibility: editVisibility,
      },
    })
  }

  const createCommunityMutation = useMutation({
    mutationFn: (payload: any) => communityService.createCommunity(payload),
    onSuccess: (newComm) => {
      setIsCreateCommunityModalOpen(false)
      setCommName("")
      setCommDesc("")
      setCreateCommunityError(null)
      queryClient.invalidateQueries({ queryKey: ["community-hubs"] })
      if (newComm?.id) {
        setJoinedCommunities((prev) => ({ ...prev, [newComm.id]: true }))
      }
    },
    onError: (err: any) => {
      setCreateCommunityError(err?.response?.data?.message || err?.message || "Failed to create community hub.")
    },
  })

  const deleteCommunityMutation = useMutation({
    mutationFn: (commId: string) => communityService.deleteCommunity(commId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-hubs"] })
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || err?.message || "Failed to delete community hub.")
    },
  })

  const handleCreateCommunitySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!commName.trim()) {
      setCreateCommunityError("Community hub name is required.")
      return
    }
    setCreateCommunityError(null)
    createCommunityMutation.mutate({
      name: commName.trim(),
      description: commDesc.trim(),
      category: commCategory,
      isPrivate: commIsPrivate,
    })
  }

  const likeMutation = useMutation({
    mutationFn: ({ postId, isLiked }: { postId: string; isLiked: boolean }) =>
      isLiked ? communityService.unlikePost(postId) : communityService.likePost(postId),
  })

  const bookmarkMutation = useMutation({
    mutationFn: ({ postId, isBookmarked }: { postId: string; isBookmarked: boolean }) =>
      isBookmarked ? communityService.unbookmarkPost(postId) : communityService.bookmarkPost(postId),
  })

  const handleToggleLike = (postId: string, currentIsLiked: boolean) => {
    const isCurrentlyLiked = likedPostsMap[postId] !== undefined ? likedPostsMap[postId] : currentIsLiked
    const newIsLiked = !isCurrentlyLiked

    setLikedPostsMap((prev) => ({ ...prev, [postId]: newIsLiked }))
    setLikesDeltaMap((prev) => ({
      ...prev,
      [postId]: (prev[postId] || 0) + (newIsLiked ? 1 : -1),
    }))

    if (newIsLiked) {
      const targetPost = allPostsPool.find((p) => p.id === postId)
      communityService.trackActivity(postId, {
        activityType: "LIKE",
        postType: targetPost?.postType,
        hashtags: targetPost?.hashtags,
        authorId: targetPost?.wqAuthorId,
        authorAccountType: targetPost?.authorAccountType,
      })
    }

    likeMutation.mutate({ postId, isLiked: isCurrentlyLiked })
  }

  const handleToggleBookmark = (postId: string, currentIsBookmarked: boolean) => {
    const isCurrentlyBookmarked = bookmarkedPostsMap[postId] !== undefined ? bookmarkedPostsMap[postId] : currentIsBookmarked
    const newIsBookmarked = !isCurrentlyBookmarked

    setBookmarkedPostsMap((prev) => ({ ...prev, [postId]: newIsBookmarked }))

    if (newIsBookmarked) {
      const targetPost = allPostsPool.find((p) => p.id === postId)
      communityService.trackActivity(postId, {
        activityType: "BOOKMARK",
        postType: targetPost?.postType,
        hashtags: targetPost?.hashtags,
        authorId: targetPost?.wqAuthorId,
        authorAccountType: targetPost?.authorAccountType,
      })
    }

    bookmarkMutation.mutate({ postId, isBookmarked: isCurrentlyBookmarked })
  }

  const handleCreatePostSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!postContent.trim()) {
      setCreatePostError("Please write something before publishing.")
      return
    }
    setCreatePostError(null)
    createPostMutation.mutate({
      content: postContent.trim(),
      postType: selectedPostType,
      visibility: selectedVisibility,
      communityId: selectedCommunityId || undefined,
      mediaUrls: mediaUrlInput ? [mediaUrlInput.trim()] : undefined,
    })
  }

  const joinCommunityMutation = useMutation({
    mutationFn: ({ commId, isJoined }: { commId: string; isJoined: boolean }) =>
      isJoined ? communityService.leaveCommunity(commId) : communityService.joinCommunity(commId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-hubs"] })
    },
  })

  const toggleJoinCommunity = (commId: string) => {
    const isCurrentlyJoined = Boolean(joinedCommunities[commId])
    setJoinedCommunities((prev) => ({ ...prev, [commId]: !isCurrentlyJoined }))
    joinCommunityMutation.mutate({ commId, isJoined: isCurrentlyJoined })
  }

  const markNotifReadMutation = useMutation({
    mutationFn: (notifId: string) => communityService.markNotificationRead(notifId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-notifications"] })
    },
  })

  const markAllNotifsMutation = useMutation({
    mutationFn: () => communityService.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-notifications"] })
    },
  })

  const markAllNotifsRead = () => {
    markAllNotifsMutation.mutate()
  }

  // Focused Company Query & Active Profile
  const { data: focusedCompany } = useQuery({
    queryKey: ["community-focused-company", companyIdParam],
    queryFn: () => exploreService.getCompanyById(companyIdParam!),
    enabled: Boolean(companyIdParam),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })

  const activeCompanyProfile = companyIdParam
    ? {
        id: companyIdParam,
        name: focusedCompany?.name || companyNameParam || "Company",
        ticker: focusedCompany?.ticker || companyTickerParam || "",
        logoColor: focusedCompany?.logoColor || "bg-indigo-600",
        sector: focusedCompany?.sector || "Technology",
        subIndustry: focusedCompany?.subIndustry || "Industrial Innovations",
        valuation: focusedCompany?.valuation || "$84.6M",
        annualRevenue: focusedCompany?.annualRevenue || "$28.8M ARR",
        ceo: focusedCompany?.ceo || "Dmitri Martinez",
        employees: focusedCompany?.employees || 229,
        foundedYear: focusedCompany?.foundedYear || 2022,
        status: focusedCompany?.status || "Active Trading",
        exchangeTier: focusedCompany?.exchangeTier || "Tier-1 Institutional",
        headquarters: focusedCompany?.headquarters || "San Diego, CA",
        legalEntity: focusedCompany?.legalEntity || focusedCompany?.name || companyNameParam || "Delaware C-Corp",
        cik: focusedCompany?.cik || "CIK-0002100102",
        verificationLevel: focusedCompany?.verificationLevel || "PLATINUM",
        trustScore: focusedCompany?.trustScore || 90,
        description: focusedCompany?.description || "Engineers institutional verified execution for enterprise allocators and private market syndicates.",
      }
    : null

  const isCompanyFollowed = Boolean(activeCompanyProfile && followedCompanies[activeCompanyProfile.id])

  // Live Corporate & Ecosystem News Query
  const { data: rawNews = [], isLoading: isNewsLoading } = useQuery({
    queryKey: ["community-corporate-news", activeCompanyProfile?.ticker || "ALL"],
    queryFn: () => exploreService.getNews(activeCompanyProfile?.ticker || "ALL", "ALL"),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: false,
  })

  // Comprehensive verified fallback dispatches
  const fallbackEcosystemNews: CorporateNews[] = useMemo(() => [
    {
      id: "news-1",
      companyId: "c1",
      companyName: "AeroFusion Technologies Ltd.",
      ticker: "ZEPR",
      logoColor: "#10b981",
      category: "Regulatory & SEC",
      title: "SEC Form 8-K Disclosure: Tier-1 Synthetic Aperture Radar Contract Executed",
      snippet: "AeroFusion has formally registered definitive commercial delivery contracts for enterprise aerospace telemetry data clearing with federal and commercial allocators.",
      sentiment: "BULLISH",
      impactMetric: "+$14.2M ARR",
      source: "SEC EDGAR / White-Quantex Wire",
      readTime: "3 min read",
      isActionRequired: false,
      publishedAt: "10 mins ago",
    },
    {
      id: "news-2",
      companyId: "c2",
      companyName: "OmniCognition Labs",
      ticker: "OCGN",
      logoColor: "#6366f1",
      category: "Earnings & Capital",
      title: "Q3 Institutional Shareholder Letter: Enterprise LLM Deployment Across 240 Nodes",
      snippet: "Executive management reports 84% gross margins on private cluster inference deployments with net retention reaching 142% among accredited enterprise partners.",
      sentiment: "POSITIVE",
      impactMetric: "84% Margin",
      source: "Bloomberg Terminal",
      readTime: "4 min read",
      isActionRequired: false,
      publishedAt: "45 mins ago",
    },
    {
      id: "news-3",
      companyId: "c3",
      companyName: "TechFlow AI Solutions Inc.",
      ticker: "TFLOW",
      logoColor: "#6366f1",
      category: "Enterprise Distributed Inference",
      title: "TechFlow AI Closes $40M Enterprise Cloud Inference Deal; ARR Exceeds $15M",
      snippet: "TechFlow AI signed a 3-year enterprise cloud compute agreement with a Fortune 50 consortium. Annual recurring revenue (ARR) surged past $15.2M (+112% YoY), reinforcing strong momentum leading into its upcoming Series B pricing round.",
      sentiment: "BULLISH",
      impactMetric: "+18.4% Uplift",
      source: "TechCrunch Venture",
      readTime: "3 min read",
      isActionRequired: false,
      publishedAt: "2 hours ago",
    },
    {
      id: "news-4",
      companyId: "c4",
      companyName: "Vortex Spatial Systems",
      ticker: "VRTX",
      logoColor: "#8b5cf6",
      category: "Partnerships",
      title: "Vortex Spatial & Quantum Dynamics Announce Strategic Clearing Protocol",
      snippet: "Joint venture protocol establishes verified secondary liquidity settlement across distributed satellite ground station assets.",
      sentiment: "STRATEGIC",
      impactMetric: "Joint Venture",
      source: "Financial Times",
      readTime: "5 min read",
      isActionRequired: false,
      publishedAt: "5 hours ago",
    },
    {
      id: "news-5",
      companyId: "c5",
      companyName: "NovaGrid Energy Networks",
      ticker: "GGRID",
      logoColor: "#f59e0b",
      category: "Dispatches",
      title: "Delaware C-Corp Annual General Meeting Date Announced; Proxy Materials Issued",
      snippet: "Shareholder voting opens for board reappointment and capital expenditure authorization for high-voltage energy storage installations.",
      sentiment: "NEUTRAL",
      impactMetric: "AGM Proxy",
      source: "White-Quantex Wire",
      readTime: "3 min read",
      isActionRequired: true,
      actionLabel: "View Proxy",
      publishedAt: "8 hours ago",
    },
    {
      id: "news-6",
      companyId: "c6",
      companyName: "QuantumMatrix Systems",
      ticker: "QMAT",
      logoColor: "#3b82f6",
      category: "Earnings & Capital",
      title: "Series B Institutional Syndicate Oversubscribed by 210% with Tier-1 Clearing",
      snippet: "Lead partners confirm allocation closure at $180M post-money valuation, with secondary escrow deposits finalized in institutional custody.",
      sentiment: "BULLISH",
      impactMetric: "$35M Raised",
      source: "PitchBook / White-Quantex Wire",
      readTime: "4 min read",
      isActionRequired: false,
      publishedAt: "12 hours ago",
    },
  ], [])

  const newsList: CorporateNews[] = useMemo(() => {
    const list = rawNews && rawNews.length > 0 ? rawNews : fallbackEcosystemNews
    return list.filter((item) => {
      if (activeCompanyProfile?.ticker && item.ticker && item.ticker !== activeCompanyProfile.ticker) {
        return false
      }
      if (newsCategoryFilter !== "ALL") {
        const itemCat = (item.category || "").toLowerCase()
        const filterCat = newsCategoryFilter.toLowerCase()
        if (!itemCat.includes(filterCat)) return false
      }
      if (newsSearchQuery.trim()) {
        const q = newsSearchQuery.toLowerCase()
        const matchTitle = item.title?.toLowerCase().includes(q)
        const matchSnippet = item.snippet?.toLowerCase().includes(q)
        const matchComp = item.companyName?.toLowerCase().includes(q)
        const matchTicker = item.ticker?.toLowerCase().includes(q)
        if (!matchTitle && !matchSnippet && !matchComp && !matchTicker) return false
      }
      return true
    })
  }, [rawNews, fallbackEcosystemNews, activeCompanyProfile?.ticker, newsCategoryFilter, newsSearchQuery])

  const toggleFollowCompany = (compKey: string) => {
    setFollowedCompanies((prev) => {
      const next = { ...prev, [compKey]: !prev[compKey] }
      try {
        localStorage.setItem("wq_followed_companies", JSON.stringify(next))
      } catch {}
      return next
    })
  }

  const baseFollowerCount = useMemo(() => {
    if (!activeCompanyProfile) return 0
    const score = activeCompanyProfile.trustScore || 85
    return Math.round(score * 15.6) + 210
  }, [activeCompanyProfile])

  const followerDisplayCount = baseFollowerCount + (isCompanyFollowed ? 1 : 0)
  const followingDisplayCount = 18

  const handleCopyCIK = (cikStr?: string) => {
    if (cikStr) {
      navigator.clipboard.writeText(cikStr)
      setCopiedCIK(true)
      setTimeout(() => setCopiedCIK(false), 2500)
    }
  }

  const clearCompanyFilter = () => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete("companyId")
    nextParams.delete("ticker")
    nextParams.delete("company")
    setSearchParams(nextParams, { replace: true })
  }

  const handleStartCompanyPost = () => {
    if (activeCompanyProfile?.ticker) {
      setPostContent((prev) => (prev ? `${prev} $${activeCompanyProfile.ticker} ` : `$${activeCompanyProfile.ticker} `))
    }
    setIsPostModalOpen(true)
  }

  // ── Affiliated Communities tailored to this company ──
  const companyAffiliatedCommunities = useMemo(() => {
    if (!activeCompanyProfile) return []

    const compSector = activeCompanyProfile.sector || "CleanTech"
    const compSubIndustry = activeCompanyProfile.subIndustry || "Industrial Innovations"

    // Sector Hub
    const matchedSector = communities.find((c: any) =>
      c.name?.toLowerCase().includes(compSector.toLowerCase()) ||
      c.description?.toLowerCase().includes(compSector.toLowerCase())
    )

    const sectorHub = matchedSector || {
      id: `hub-sector-${activeCompanyProfile.id}`,
      name: `${compSector} & Infrastructure Leaders`,
      slug: `${compSector.toLowerCase().replace(/[^a-z0-9]/g, "-")}-hub`,
      description: `Collaborative institutional working group for verified ${compSector} corporate founders, engineers, and accredited capital syndicates.`,
      memberCount: 1140,
      postCount: 58,
    }

    // Delaware or Corporate Governance Hub
    const delawareHub = communities.find((c: any) =>
      c.slug === "delaware-issuers" || c.name?.toLowerCase().includes("delaware")
    ) || {
      id: `hub-delaware-${activeCompanyProfile.id}`,
      name: "Delaware Statutory Corporate Issuers",
      slug: "delaware-issuers",
      description: "Private secondary liquidity, corporate governance, investor relations, 409A valuations, and cap table management.",
      memberCount: 1650,
      postCount: 112,
    }

    // Company specific investor circle hub
    const investorCircleHub = {
      id: `hub-circle-${activeCompanyProfile.id}`,
      name: `${activeCompanyProfile.name} Shareholder & Investor Circle`,
      slug: `${activeCompanyProfile.ticker ? activeCompanyProfile.ticker.toLowerCase() : "corp"}-investors`,
      description: `Private accredited circle for ${activeCompanyProfile.name} ($${activeCompanyProfile.ticker}) cap table shareholders, secondary traders, and leadership.`,
      memberCount: 428,
      postCount: 24,
    }

    return [
      { ...sectorHub, role: "Primary Corporate Issuer Hub", isPrimary: true },
      { ...delawareHub, role: "Delaware C-Corp Registered Member", isPrimary: false },
      { ...investorCircleHub, role: "Official Corporate Investor Hub", isPrimary: false }
    ]
  }, [activeCompanyProfile, communities])

  // ── Company-Specific Official Posts directly from Leadership & Legal ──
  const companyOfficialPosts: Post[] = useMemo(() => {
    if (!activeCompanyProfile) return []
    const c = activeCompanyProfile
    const ceoName = c.ceo || "Dmitri Martinez"
    const subInd = c.subIndustry?.toLowerCase() || c.sector.toLowerCase()

    return [
      {
        id: `official-post-${c.id}-1`,
        wqAuthorId: `author-${c.id}-corporate`,
        author: {
          wqUserId: `author-${c.id}-corporate`,
          displayName: c.name,
          username: c.ticker ? c.ticker.toLowerCase() : c.name.toLowerCase().replace(/[^a-z0-9]/g, ""),
          headline: `Corporate Account • ${ceoName}, CEO`,
          avatarUrl: "",
          verificationLevel: (c.verificationLevel as any) || "PLATINUM",
          authorAccountType: "COMPANY",
          authorType: "COMPANY",
          companyId: c.name,
          ticker: c.ticker,
        },
        authorAccountType: "COMPANY",
        authorType: "COMPANY",
        companyId: c.name,
        ticker: c.ticker,
        content: `Excited to present our Q3 operational milestone for ${c.name} ($${c.ticker}). We successfully concluded commercial pilot trials across our ${subInd} architecture, demonstrating a 3.8x throughput increase with zero thermal downtime. Thank you to our Delaware syndicates and institutional partners on White Quantex.`,
        mediaUrls: [],
        postType: "UPDATE" as any,
        visibility: "PUBLIC" as any,
        communityName: `${c.sector} & Infrastructure Leaders`,
        hashtags: [c.sector.replace(/[^a-zA-Z]/g, ""), "Milestone", c.ticker || "Tech"],
        mentions: [c.ticker],
        likesCount: 184,
        commentsCount: 0,
        sharesCount: 14,
        bookmarksCount: 31,
        isLiked: false,
        isBookmarked: false,
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: `official-post-${c.id}-2`,
        wqAuthorId: `author-${c.id}-legal`,
        author: {
          wqUserId: `author-${c.id}-legal`,
          displayName: c.name,
          username: `${c.ticker.toLowerCase()}_legal`,
          headline: `Corporate Governance & Regulatory Affairs`,
          avatarUrl: "",
          verificationLevel: "GOLD" as any,
          authorAccountType: "COMPANY",
          authorType: "COMPANY",
          companyId: c.name,
          ticker: c.ticker,
        },
        authorAccountType: "COMPANY",
        authorType: "COMPANY",
        companyId: c.name,
        ticker: c.ticker,
        content: `Official Statutory Notice: ${c.name} has submitted its updated Delaware statutory annual filing and secondary trading covenants. Verified accredited shareholders can review the updated 409A valuation schedule and unallocated option pool reserve details in the corporate data room.`,
        mediaUrls: [],
        postType: "UPDATE" as any,
        visibility: "PUBLIC" as any,
        communityName: "Delaware Statutory Corporate Issuers",
        hashtags: ["DelawareCorp", "SECRegistry", "Governance", c.ticker],
        mentions: [],
        likesCount: 96,
        commentsCount: 0,
        sharesCount: 8,
        bookmarksCount: 19,
        isLiked: false,
        isBookmarked: false,
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
      {
        id: `official-post-${c.id}-3`,
        wqAuthorId: `author-${c.id}-corporate`,
        author: {
          wqUserId: `author-${c.id}-corporate`,
          displayName: c.name,
          username: c.ticker ? c.ticker.toLowerCase() : c.name.toLowerCase().replace(/[^a-z0-9]/g, ""),
          headline: `Corporate Account • Official Expansion Notice`,
          avatarUrl: "",
          verificationLevel: (c.verificationLevel as any) || "PLATINUM",
          authorAccountType: "COMPANY",
          authorType: "COMPANY",
          companyId: c.name,
          ticker: c.ticker,
        },
        authorAccountType: "COMPANY",
        authorType: "COMPANY",
        companyId: c.name,
        ticker: c.ticker,
        content: `Commercial expansion update: ${c.name} closed a multi-year enterprise compute & deployment contract with a Fortune 100 consortium. Our ARR run-rate has expanded past ${c.annualRevenue}, reflecting strong institutional demand for verified scalable execution.`,
        mediaUrls: [],
        postType: "UPDATE" as any,
        visibility: "PUBLIC" as any,
        communityName: `${c.sector} & Infrastructure Leaders`,
        hashtags: ["ARR", "Growth", "VentureLiquidity", c.ticker],
        mentions: [c.ticker],
        likesCount: 242,
        commentsCount: 0,
        sharesCount: 21,
        bookmarksCount: 45,
        isLiked: false,
        isBookmarked: false,
        createdAt: new Date(Date.now() - 11 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 11 * 86400000).toISOString(),
      },
    ]
  }, [activeCompanyProfile])

  // ── Company-Specific Followers List ──
  const companyFollowers = useMemo(() => {
    if (!activeCompanyProfile) return []

    const list: any[] = []

    // If current user is following, include them at the very top
    if (isCompanyFollowed) {
      list.push({
        id: currentUser.id || "current-user",
        name: currentUser.displayName || "You",
        username: (currentUser.displayName || "you").toLowerCase().replace(/[^a-z0-9]/g, ""),
        headline: currentUser.headline || "Ecosystem Member",
        role: currentUser.primaryRole || "MEMBER",
        location: (authUser as any)?.location || "Global Network",
        avatar: currentUser.avatarUrl || "",
        followersCount: (authUser as any)?.followersCount ?? 0,
        followingCount: Object.values(followedUsersMap).filter(Boolean).length,
        verificationLevel: currentUser.verificationLevel || "NONE",
        trustScore: currentUser.trustScore,
        isCurrentUser: true,
        badgeText: "You (Active Follower)",
      })
    }

    // Curated high-conviction institutional & verified ecosystem followers
    const ecosystemFollowers = [
      {
        id: `foll-${activeCompanyProfile.id}-1`,
        name: "Elena Rostova",
        username: "erostova",
        headline: "General Partner @ Green Horizon Ventures",
        role: "INVESTOR",
        location: "San Francisco, CA",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        followersCount: 3820,
        followingCount: 412,
        postsCount: 28,
        verificationLevel: "PLATINUM",
        trustScore: 99,
        badgeText: "Lead Series-A Syndicate",
        bio: `General Partner at Green Horizon Ventures leading Series A & B co-investment allocations in verified corporate issuers like ${activeCompanyProfile.name}. Focus on statutory cap table structuring, clean technology commercialization, and sovereign secondary liquidity.`,
        sectors: ["Venture Capital", "CleanTech", "Energy Transition", "Secondary Markets"],
        verifiedAccreditations: [
          "Venture Syndicate Participant",
          "Series-A Co-Investor",
          "White Quantex Sovereign Trust: Platinum Tier",
          "ESG Reporting Oversight Member",
        ],
      },
      {
        id: `foll-${activeCompanyProfile.id}-2`,
        name: "Marcus Vance",
        username: "mvance_quant",
        headline: "Managing Director @ Apex CleanTech Syndicate",
        role: "INVESTOR",
        location: "New York, NY",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        followersCount: 2450,
        followingCount: 280,
        postsCount: 19,
        verificationLevel: "PLATINUM",
        trustScore: 96,
        badgeText: "Cap Table Shareholder",
        bio: `Managing director structuring secondary share transfers, escrow settlement covenants, and corporate governance for institutional LPs. Shareholder and strategic backer of ${activeCompanyProfile.name}.`,
        sectors: ["Secondary Liquidity", "Energy Transition", "Asset Management"],
        verifiedAccreditations: [
          "Syndicate Manager",
          "Ecosystem Shareholder",
          "Escrow Protocol Participant",
        ],
      },
      {
        id: `foll-${activeCompanyProfile.id}-3`,
        name: "Dr. Aris Thorne",
        username: "aris_thorne",
        headline: `Lead Infrastructure Architect & ${activeCompanyProfile.sector} Specialist`,
        role: "FOUNDER",
        location: "Boston, MA",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        followersCount: 1890,
        followingCount: 195,
        postsCount: 24,
        verificationLevel: "GOLD",
        trustScore: 94,
        badgeText: "Technical Advisor",
        bio: `Senior systems architect and advisor specializing in high-reliability telemetry, autonomous grid interconnects, and machine-intelligence systems. Technical advisor to ${activeCompanyProfile.name}.`,
        sectors: ["Industrial Architecture", "Clean Infrastructure", "Edge Compute", "Robotics"],
        verifiedAccreditations: [
          "Technical Advisory Board Member",
          "White Quantex Gold Verified Architect",
          "Technical Patent Contributor",
        ],
      },
      {
        id: `foll-${activeCompanyProfile.id}-4`,
        name: "Sarah Jenkins",
        username: "sjenkins_vc",
        headline: "Principal @ West Coast Climate Allocators",
        role: "INVESTOR",
        location: "San Diego, CA",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        followersCount: 1620,
        followingCount: 310,
        postsCount: 15,
        verificationLevel: "GOLD",
        trustScore: 92,
        badgeText: "Secondary Allocator",
        bio: `Principal investor allocating growth capital across private climate and secondary infrastructure. Direct syndicate participant in ${activeCompanyProfile.name} secondary rounds.`,
        sectors: ["Climate Tech", "Secondary Allocations", "Growth Equity"],
        verifiedAccreditations: [
          "Institutional Allocator",
          "White Quantex Verified Secondary Allocator",
        ],
      },
      {
        id: `foll-${activeCompanyProfile.id}-5`,
        name: "David Kim",
        username: "davidkim_capital",
        headline: "Quantitative Secondary Trading Lead",
        role: "INVESTOR",
        location: "Chicago, IL",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
        followersCount: 940,
        followingCount: 120,
        postsCount: 12,
        verificationLevel: "GOLD",
        trustScore: 91,
        badgeText: "Liquidity Provider",
        bio: `Leading private secondary market-making and quantitative order routing for enterprise equities. Continuous liquidity provider for ${activeCompanyProfile.name}.`,
        sectors: ["Market Making", "Algorithmic Clearing", "Secondary Trading"],
        verifiedAccreditations: [
          "Secondary Liquidity Provider",
          "Clearing Node Participant",
        ],
      },
      {
        id: `foll-${activeCompanyProfile.id}-6`,
        name: "Amara Diallo",
        username: "amara_global",
        headline: "Infrastructure Angel & Cap Table Member",
        role: "INVESTOR",
        location: "London, UK",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
        followersCount: 4210,
        followingCount: 520,
        postsCount: 31,
        verificationLevel: "PLATINUM",
        trustScore: 98,
        badgeText: "Cap Table Member",
        bio: `Cross-border venture angel and early cap table participant. Active investor across European and US growth issuers including ${activeCompanyProfile.name}.`,
        sectors: ["Cross-Border Angel", "Enterprise Software", "Clean Energy", "Venture Syndicates"],
        verifiedAccreditations: [
          "Verified Shareholder",
          "White Quantex Platinum Trust Certified",
        ],
      },
    ]

    list.push(...ecosystemFollowers)

    if (members && members.length > 0) {
      const additional = members.slice(0, 4).map((m) => ({
        ...m,
        badgeText: "Ecosystem Member",
      }))
      list.push(...additional)
    }

    return list
  }, [activeCompanyProfile, isCompanyFollowed, currentUser, members])

  // ── Entities / Partners Followed by this Company (18 Following) ──
  const companyFollowing = useMemo(() => {
    if (!activeCompanyProfile) return []

    const sectorName = activeCompanyProfile.sector || "CleanTech"

    return [
      {
        id: "flw-1",
        name: "Delaware Division of Corporations & Registry",
        category: "Regulatory & Statutory Registry",
        location: "Dover, DE",
        description: "Official Delaware corporate filing registry, statutory legal records, and 409A charter filings.",
        avatarInitials: "DOC",
        avatarColor: "bg-blue-600",
        verificationLevel: "PLATINUM",
      },
      {
        id: "flw-2",
        name: "Green Horizon Ventures",
        category: "Lead Venture Syndicate Partner",
        location: "San Francisco, CA",
        description: `Early-stage institutional lead capital partner specializing in verified ${sectorName} commercialization.`,
        avatarInitials: "GHV",
        avatarColor: "bg-emerald-600",
        verificationLevel: "PLATINUM",
      },
      {
        id: "flw-3",
        name: "White Quantex Secondary Clearing Rail",
        category: "Clearing & Settlement Protocol",
        location: "New York, NY",
        description: "ISO-20022 escrow settlement rail facilitating accredited private secondary share transfers.",
        avatarInitials: "WQC",
        avatarColor: "bg-slate-900",
        verificationLevel: "PLATINUM",
      },
      {
        id: "flw-4",
        name: `${sectorName} & Infrastructure Leaders Hub`,
        category: "Primary Sector Ecosystem Consortium",
        location: "Global",
        description: `Verified institutional working forum for founders, researchers, and syndicate managers in ${sectorName}.`,
        avatarInitials: "SIL",
        avatarColor: "bg-cyan-600",
        verificationLevel: "PLATINUM",
      },
      {
        id: "flw-5",
        name: "Delaware Statutory Corporate Issuers Hub",
        category: "Issuer Governance Hub",
        location: "Wilmington, DE",
        description: "Private secondary liquidity, corporate governance covenants, and verified cap table administration.",
        avatarInitials: "DSC",
        avatarColor: "bg-indigo-600",
        verificationLevel: "GOLD",
      },
      {
        id: "flw-6",
        name: "Apex CleanTech Syndicate Consortium",
        category: "Institutional Capital Group",
        location: "Boston, MA",
        description: "Accredited syndicate allocating growth compute and operational infrastructure across portfolio leaders.",
        avatarInitials: "ACS",
        avatarColor: "bg-amber-600",
        verificationLevel: "PLATINUM",
      },
      {
        id: "flw-7",
        name: "Global Standards for Clean Industrial Transition",
        category: "Regulatory Standards Organization",
        location: "Zurich, Switzerland",
        description: "Carbon verification, thermodynamic efficiency benchmarking, and corporate reporting covenants.",
        avatarInitials: "GSI",
        avatarColor: "bg-purple-600",
        verificationLevel: "GOLD",
      },
      {
        id: "flw-8",
        name: "Silicon Valley Compute & Infrastructure Rail",
        category: "Technology Deployment Partner",
        location: "Palo Alto, CA",
        description: "High-throughput industrial compute cluster providing verified low-latency data room integrations.",
        avatarInitials: "SVC",
        avatarColor: "bg-rose-600",
        verificationLevel: "GOLD",
      },
    ]
  }, [activeCompanyProfile])

  const filteredPosts = useMemo(() => {
    let pool: Post[] = allPostsPool

    if (activeCompanyProfile) {
      if (companySubTab === "dispatches") {
        pool = companyOfficialPosts
      } else {
        // "all" tab: merge official company posts + community mentions
        const cName = activeCompanyProfile.name.toLowerCase()
        const cTicker = activeCompanyProfile.ticker ? activeCompanyProfile.ticker.toLowerCase() : ""
        const communityMatches = allPostsPool.filter((p) => {
          return (
            (cTicker && p.content?.toLowerCase().includes(`$${cTicker}`)) ||
            (cTicker && p.content?.toLowerCase().includes(cTicker)) ||
            (cName && p.content?.toLowerCase().includes(cName)) ||
            (cName && p.author?.headline?.toLowerCase().includes(cName)) ||
            (cName && p.author?.displayName?.toLowerCase().includes(cName))
          )
        })
        pool = [...companyOfficialPosts, ...communityMatches]
      }
    } else {
      if (feedFilter === "companies") {
        // STRICT: ONLY show posts posted by a COMPANY account!
        pool = pool.filter((p) => isCompanyAccountPost(p))
        if (companyOfficialPosts && companyOfficialPosts.length > 0) {
          const existingIds = new Set(pool.map((p) => p.id))
          const additional = companyOfficialPosts.filter((p) => !existingIds.has(p.id))
          pool = [...additional, ...pool]
        }
      } else if (feedFilter === "ventures") {
        // STRICT: ONLY show posts posted by a VENTURE account!
        pool = pool.filter((p) => isVentureAccountPost(p))
      } else if (feedFilter === "my_posts") {
        const uId = currentUser.id
        const uName = (currentUser.displayName || "").toLowerCase()
        pool = pool.filter((p) => {
          return (
            p.wqAuthorId === uId ||
            p.author?.wqUserId === uId ||
            Boolean(p.author?.displayName && p.author.displayName.toLowerCase() === uName)
          )
        })
      }
    }

    if (rightSearchQuery.trim()) {
      const q = rightSearchQuery.toLowerCase()
      pool = pool.filter((p) =>
        p.content?.toLowerCase().includes(q) ||
        p.author?.displayName?.toLowerCase().includes(q) ||
        p.author?.headline?.toLowerCase().includes(q) ||
        p.postType?.toLowerCase().includes(q)
      )
    }

    return pool
  }, [allPostsPool, activeCompanyProfile, companySubTab, companyOfficialPosts, rightSearchQuery, feedFilter, currentUser])

  const unreadNotifCount = notifications.filter((n) => !n.read).length

  return (
    <div className="w-full bg-slate-50 dark:bg-[#000000] text-slate-900 dark:text-slate-50 h-[calc(100dvh-4rem-4rem)] md:h-[calc(100vh-4rem)] pt-0 overflow-hidden flex flex-col transition-colors duration">
      
      {/* ─── UNIFIED TOP HEADER BAR (HIDDEN ON MOBILE, VISIBLE ON DESKTOP) ─── */}
      <div className="hidden md:flex w-full h-14 px-4 shrink-0 items-center justify-between border-b border-slate-200 dark:border-zinc-800/90 bg-white dark:bg-[#000000] text-slate-900 dark:text-white backdrop-blur-2xl z-20 shadow-xs dark:shadow-md transition-colors duration-200">
        
        {/* Left Sidebar Circular Menu Control */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              setIsSidebarOpen(!isSidebarOpen)
              setIsMobileMenuOpen(!isMobileMenuOpen)
            }}
            title={isSidebarOpen ? "Hide Menu Options" : "Show Menu Options"}
            className="h-8 w-8 rounded-full border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 transition-all duration-300 cursor-pointer flex items-center justify-center shrink-0 shadow-2xs"
          >
            <Menu className="h-4 w-4 text-slate-700 dark:text-white" />
          </button>
          {isSidebarOpen && (
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 leading-none">
              Overview
            </span>
          )}
        </div>

        {/* Center Section: Tabs (For You | Communities | Founders & Network | News) */}
        <div className="flex items-center gap-5 sm:gap-6 h-full">
          <button
            onClick={() => setActiveTab("home")}
            className={cn(
              "h-full px-1 text-xs sm:text-sm font-extrabold transition-all cursor-pointer border-b-2 flex items-center justify-center leading-none",
              activeTab === "home"
                ? "border-slate-900 dark:border-white text-slate-900 dark:text-white"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            For You
          </button>

          <button
            onClick={() => setActiveTab("communities")}
            className={cn(
              "h-full px-1 text-xs sm:text-sm font-extrabold transition-all cursor-pointer border-b-2 flex items-center justify-center leading-none",
              activeTab === "communities"
                ? "border-slate-900 dark:border-white text-slate-900 dark:text-white"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            Communities
          </button>

          <button
            onClick={() => setActiveTab("people")}
            className={cn(
              "h-full px-1 text-xs sm:text-sm font-extrabold transition-all cursor-pointer border-b-2 flex items-center justify-center leading-none",
              activeTab === "people"
                ? "border-slate-900 dark:border-white text-slate-900 dark:text-white"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            Founders & Network
          </button>

          <button
            onClick={() => setActiveTab("news")}
            className={cn(
              "h-full px-1 text-xs sm:text-sm font-extrabold transition-all cursor-pointer border-b-2 flex items-center justify-center leading-none",
              activeTab === "news"
                ? "border-slate-900 dark:border-white text-slate-900 dark:text-white"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            News
          </button>
        </div>

        {/* Active Company Filter Indicator Pill in Desktop Header */}
        {activeCompanyProfile && (
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            <Building2 className="h-3.5 w-3.5" />
            <span className="truncate max-w-[160px]">{activeCompanyProfile.name}</span>
            {activeCompanyProfile.ticker && (
              <span className="font-mono text-[10px] opacity-80">${activeCompanyProfile.ticker}</span>
            )}
            <button
              onClick={clearCompanyFilter}
              title="Clear company filter"
              className="hover:text-emerald-300 ml-1 p-0.5 rounded cursor-pointer transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Right Section: Search Bar + Quick Post + Notifications */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative w-44 lg:w-56">
            <div className="flex items-center h-8 rounded-full border border-slate-200 dark:border-zinc-800 bg-slate-100/80 dark:bg-zinc-900/90 px-3 gap-2">
              <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search posts & people..."
                value={rightSearchQuery}
                onChange={(e) => setRightSearchQuery(e.target.value)}
                className="w-full text-xs bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder:text-slate-400 p-0"
              />
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => setIsPostModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-full h-8 px-3.5 flex items-center gap-1.5 cursor-pointer shadow-sm transition-all duration-300"
          >
            <PlusSquare className="h-3.5 w-3.5 text-white" /> + Post
          </Button>

          <button
            onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
            title={isRightSidebarOpen ? "Close Notifications" : "Open Notifications"}
            className="h-8 px-3 rounded-full border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 transition-all duration-300 cursor-pointer shrink-0 flex items-center gap-2 text-xs font-bold shadow-2xs"
          >
            {isRightSidebarOpen ? (
              <>
                <PanelRightClose className="h-4 w-4 text-slate-700 dark:text-white" />
                <span className="hidden lg:inline text-xs font-bold text-slate-700 dark:text-white">Notifications</span>
              </>
            ) : (
              <>
                <PanelRightOpen className="h-4 w-4 text-slate-700 dark:text-white" />
                <span className="hidden lg:inline text-xs font-bold text-slate-700 dark:text-white">Notifications</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ─── THREE INDEPENDENT DIV COMMUNITY LAYOUT (FULL WIDTH EDGE-TO-EDGE) ─── */}
      <div className="w-full px-0 sm:px-4 pt-0 sm:pt-2 pb-0 sm:pb-3 flex gap-6 flex-1 overflow-hidden">
        
        {/* =================================================================== */}
        {/* ─── 1. DIV 1: SIDEBAR (LIQUID GLASS CONTAINER) ───────────────────── */}
        {/* =================================================================== */}
        <div
          className={cn(
            "hidden lg:flex flex-col justify-between space-y-3 shrink-0 h-full overflow-hidden pr-4 border-r border-slate-200/80 dark:border-zinc-800/80 transition-all duration-300",
            isSidebarOpen ? "w-[240px]" : "w-[68px]"
          )}
        >
          <Card className="rounded-none border-slate-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-[#0E1113]/70 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] flex-1 flex flex-col justify-between overflow-hidden">

            {/* Menu Items SCROLLABLE area */}
            <CardContent className={cn("flex-1 overflow-y-auto space-y-1 transition-all duration-300", isSidebarOpen ? "p-3" : "p-2")}>
              <button
                onClick={() => { setActiveTab("home"); setFeedFilter("all"); }}
                title="Home"
                className={cn(
                  "w-full flex items-center text-[13.5px] font-bold transition-all cursor-pointer",
                  isSidebarOpen ? "gap-3 px-3 py-2.5 rounded-[10px]" : "justify-center p-2.5 rounded-[8px]",
                  activeTab === "home" && feedFilter === "all"
                    ? "bg-[#1A282D] dark:bg-[#1A282D] text-white dark:text-white font-extrabold shadow-2xs"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800/80"
                )}
              >
                <Home className="h-[18px] w-[18px] shrink-0 text-slate-700 dark:text-white" />
                {isSidebarOpen && <span className="truncate">Home</span>}
              </button>

              <button
                onClick={() => { setActiveTab("home"); setFeedFilter("companies"); }}
                title="Companies Post"
                className={cn(
                  "w-full flex items-center text-[13.5px] font-bold transition-all cursor-pointer",
                  isSidebarOpen ? "gap-3 px-3 py-2.5 rounded-[10px]" : "justify-center p-2.5 rounded-[8px]",
                  activeTab === "home" && feedFilter === "companies"
                    ? "bg-[#1A282D] dark:bg-[#1A282D] text-white dark:text-white font-extrabold shadow-2xs"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800/80"
                )}
              >
                <Building2 className="h-[18px] w-[18px] shrink-0 text-slate-700 dark:text-white" />
                {isSidebarOpen && <span className="truncate">Companies Post</span>}
              </button>

              <button
                onClick={() => { setActiveTab("home"); setFeedFilter("ventures"); }}
                title="Ventures Post"
                className={cn(
                  "w-full flex items-center text-[13.5px] font-bold transition-all cursor-pointer",
                  isSidebarOpen ? "gap-3 px-3 py-2.5 rounded-[10px]" : "justify-center p-2.5 rounded-[8px]",
                  activeTab === "home" && feedFilter === "ventures"
                    ? "bg-[#1A282D] dark:bg-[#1A282D] text-white dark:text-white font-extrabold shadow-2xs"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800/80"
                )}
              >
                <Rocket className="h-[18px] w-[18px] shrink-0 text-slate-700 dark:text-white" />
                {isSidebarOpen && <span className="truncate">Ventures Post</span>}
              </button>

              <button
                onClick={() => { setActiveTab("home"); setFeedFilter("my_posts"); }}
                title="My Posts"
                className={cn(
                  "w-full flex items-center text-[13.5px] font-bold transition-all cursor-pointer",
                  isSidebarOpen ? "gap-3 px-3 py-2.5 rounded-[10px]" : "justify-center p-2.5 rounded-[8px]",
                  activeTab === "home" && feedFilter === "my_posts"
                    ? "bg-[#1A282D] dark:bg-[#1A282D] text-white dark:text-white font-extrabold shadow-2xs"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800/80"
                )}
              >
                <FileText className="h-[18px] w-[18px] shrink-0 text-slate-700 dark:text-white" />
                {isSidebarOpen && <span className="truncate">My Posts</span>}
              </button>

              <button
                onClick={() => { setActiveTab("communities"); setCommunitySubFilter("all"); }}
                title="Popular Hubs"
                className={cn(
                  "w-full flex items-center text-[13.5px] font-bold transition-all cursor-pointer",
                  isSidebarOpen ? "gap-3 px-3 py-2.5 rounded-[10px]" : "justify-center p-2.5 rounded-[8px]",
                  activeTab === "communities" && communitySubFilter === "all"
                    ? "bg-[#1A282D] dark:bg-[#1A282D] text-white dark:text-white font-extrabold shadow-2xs"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800/80"
                )}
              >
                <Users className="h-[18px] w-[18px] shrink-0 text-slate-700 dark:text-white" />
                {isSidebarOpen && <span className="truncate">Popular Hubs</span>}
              </button>

              <button
                onClick={() => { setActiveTab("communities"); setCommunitySubFilter("my_communities"); }}
                title="My Communities"
                className={cn(
                  "w-full flex items-center text-[13.5px] font-bold transition-all cursor-pointer",
                  isSidebarOpen ? "gap-3 px-3 py-2.5 rounded-[10px]" : "justify-center p-2.5 rounded-[8px]",
                  activeTab === "communities" && communitySubFilter === "my_communities"
                    ? "bg-[#1A282D] dark:bg-[#1A282D] text-white dark:text-white font-extrabold shadow-2xs"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800/80"
                )}
              >
                <CheckCircle2 className="h-[18px] w-[18px] shrink-0 text-slate-700 dark:text-white" />
                {isSidebarOpen && <span className="truncate">My Communities</span>}
              </button>

              <button
                onClick={() => setActiveTab("people")}
                title="Explore Network"
                className={cn(
                  "w-full flex items-center text-[13.5px] font-bold transition-all cursor-pointer",
                  isSidebarOpen ? "gap-3 px-3 py-2.5 rounded-[10px]" : "justify-center p-2.5 rounded-[8px]",
                  activeTab === "people"
                    ? "bg-[#1A282D] dark:bg-[#1A282D] text-white dark:text-white font-extrabold shadow-2xs"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800/80"
                )}
              >
                <Compass className="h-[18px] w-[18px] shrink-0 text-slate-700 dark:text-white" />
                {isSidebarOpen && <span className="truncate">Explore Network</span>}
              </button>

              <button
                onClick={() => setActiveTab("news")}
                title="Ecosystem News"
                className={cn(
                  "w-full flex items-center text-[13.5px] font-bold transition-all cursor-pointer",
                  isSidebarOpen ? "gap-3 px-3 py-2.5 rounded-[10px]" : "justify-center p-2.5 rounded-[8px]",
                  activeTab === "news"
                    ? "bg-[#1A282D] dark:bg-[#1A282D] text-white dark:text-white font-extrabold shadow-2xs"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800/80"
                )}
              >
                <Newspaper className="h-[18px] w-[18px] shrink-0 text-slate-700 dark:text-white" />
                {isSidebarOpen && <span className="truncate">Ecosystem News</span>}
              </button>

              <button
                onClick={() => navigate("/profile")}
                title="Profile"
                className={cn(
                  "w-full flex items-center text-[13.5px] font-bold transition-all cursor-pointer",
                  isSidebarOpen ? "gap-3 px-3 py-2.5 rounded-[10px]" : "justify-center p-2.5 rounded-[8px]",
                  "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800/80"
                )}
              >
                <User className="h-[18px] w-[18px] shrink-0 text-slate-700 dark:text-white" />
                {isSidebarOpen && <span className="truncate">Profile</span>}
              </button>

              <button
                onClick={() => setIsCreateCommunityModalOpen(true)}
                title="Start a Community"
                className={cn(
                  "w-full flex items-center text-[13.5px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer",
                  isSidebarOpen ? "gap-3 px-3 py-2.5 rounded-[10px]" : "justify-center p-2.5 rounded-[8px]"
                )}
              >
                <PlusSquare className="h-[18px] w-[18px] text-slate-700 dark:text-white shrink-0" />
                {isSidebarOpen && <span className="truncate">Start a Community</span>}
              </button>

              <div className="pt-2 my-2 border-t border-slate-100 dark:border-zinc-800">
                {isSidebarOpen && (
                  <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 pb-1">
                    Ecosystem & Tools
                  </p>
                )}
              </div>
              <button
                onClick={() => navigate("/community-guidelines")}
                title="Community Policy"
                className={cn(
                  "w-full flex items-center rounded-[8px] text-[13.5px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer",
                  isSidebarOpen ? "gap-3 px-3 py-2.5" : "justify-center p-2.5"
                )}
              >
                <FileText className="h-[18px] w-[18px] text-slate-700 dark:text-white shrink-0" />
                {isSidebarOpen && <span className="truncate">Community Policy</span>}
              </button>

              <button
                onClick={() => navigate("/terms")}
                title="Community Rules"
                className={cn(
                  "w-full flex items-center rounded-[8px] text-[13.5px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer",
                  isSidebarOpen ? "gap-3 px-3 py-2.5" : "justify-center p-2.5"
                )}
              >
                <BookOpen className="h-[18px] w-[18px] text-slate-700 dark:text-white shrink-0" />
                {isSidebarOpen && <span className="truncate">Community Rules</span>}
              </button>

              <button
                onClick={() => navigate("/privacy")}
                title="Privacy Policy"
                className={cn(
                  "w-full flex items-center rounded-[8px] text-[13.5px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer",
                  isSidebarOpen ? "gap-3 px-3 py-2.5" : "justify-center p-2.5"
                )}
              >
                <Lock className="h-[18px] w-[18px] text-slate-700 dark:text-white shrink-0" />
                {isSidebarOpen && <span className="truncate">Privacy Policy</span>}
              </button>
            </CardContent>
          </Card>
        </div>

        {/* =================================================================== */}
        {/* ─── 2. DIV 2: POST & MAIN FEED (INDEPENDENT SCROLLABLE FEED) ────── */}
        {/* =================================================================== */}
        <div
          onScroll={handleFeedScroll}
          className="flex-1 min-w-0 space-y-0 sm:space-y-4 h-full overflow-y-auto px-0 sm:px-1"
        >
          {/* MOBILE TOP SEARCH BAR */}
          <div
            className={cn(
              "md:hidden p-3 border-b border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-[#060809]/95 backdrop-blur-md sticky top-0 z-20 shrink-0 shadow-xs transition-all duration-300 ease-in-out transform",
              isSearchVisibleMobile
                ? "translate-y-0 opacity-100"
                : "-translate-y-full opacity-0 pointer-events-none"
            )}
          >
            <div className="flex items-center h-9 rounded-full border border-slate-200 dark:border-zinc-800 bg-slate-100/90 dark:bg-zinc-900/90 px-3.5 gap-2 shadow-xs">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search posts & people..."
                value={rightSearchQuery}
                onChange={(e) => setRightSearchQuery(e.target.value)}
                className="w-full text-xs bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder:text-slate-400 p-0 font-medium"
              />
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          {activeTab === "communities" ? (
            <div className="space-y-4 p-3 sm:p-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-[10px] bg-white/90 dark:bg-[#121212] backdrop-blur-xl border border-slate-200 dark:border-zinc-800 shadow-xs">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-700 dark:text-white" /> Ecosystem Community Hubs
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Join sector-specific hubs, syndicate groups, and founder circles.</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-zinc-900 rounded-full border border-slate-200/60 dark:border-zinc-800">
                    <button
                      onClick={() => setCommunitySubFilter("all")}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer",
                        communitySubFilter === "all"
                          ? "bg-[#10B981] text-white shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      )}
                    >
                      All Hubs
                    </button>
                    <button
                      onClick={() => setCommunitySubFilter("my_communities")}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
                        communitySubFilter === "my_communities"
                          ? "bg-[#10B981] text-white shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      )}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> My Communities
                    </button>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setIsCreateCommunityModalOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-[8px] h-8 px-3 cursor-pointer shrink-0 flex items-center gap-1.5 shadow-sm"
                  >
                    <PlusSquare className="h-3.5 w-3.5" /> + Create Hub
                  </Button>
                </div>
              </div>

              {communities.filter((comm: any) => {
                if (communitySubFilter === "my_communities") {
                  const isOwner = Boolean(
                    currentUser?.id &&
                    (comm.createdBy === currentUser.id ||
                      comm.ownerId === currentUser.id ||
                      comm.isOwner)
                  )
                  const isJoined = Boolean(joinedCommunities[comm.id] || comm.isJoined)
                  if (!isOwner && !isJoined) return false
                }
                if (!rightSearchQuery.trim()) return true
                return (
                  comm.name?.toLowerCase().includes(rightSearchQuery.toLowerCase()) ||
                  comm.description?.toLowerCase().includes(rightSearchQuery.toLowerCase())
                )
              }).length === 0 ? (
                <div className="py-16 text-center rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 p-6 space-y-2">
                  <Users className="h-8 w-8 mx-auto text-slate-400" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {communitySubFilter === "my_communities"
                      ? "You haven't created or joined any community hubs yet."
                      : "No community hubs found matching your search."}
                  </p>
                  {communitySubFilter === "my_communities" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCommunitySubFilter("all")}
                      className="mt-2 text-xs"
                    >
                      Explore All Hubs
                    </Button>
                  ) : null}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {communities.filter((comm: any) => {
                    if (communitySubFilter === "my_communities") {
                      const isOwner = Boolean(
                        currentUser?.id &&
                        (comm.createdBy === currentUser.id ||
                          comm.ownerId === currentUser.id ||
                          comm.isOwner)
                      )
                      const isJoined = Boolean(joinedCommunities[comm.id] || comm.isJoined)
                      if (!isOwner && !isJoined) return false
                    }
                    if (!rightSearchQuery.trim()) return true
                    return (
                      comm.name?.toLowerCase().includes(rightSearchQuery.toLowerCase()) ||
                      comm.description?.toLowerCase().includes(rightSearchQuery.toLowerCase())
                    )
                  }).map((comm: any) => {
                    const isOwner = Boolean(
                      currentUser?.id &&
                      (comm.createdBy === currentUser.id ||
                        comm.ownerId === currentUser.id ||
                        comm.isOwner)
                    )
                    const isJoined = Boolean(joinedCommunities[comm.id] || comm.isJoined)
                    const ownerDisplayName = isOwner
                      ? `${currentUser.displayName || "You"} (You)`
                      : comm.ownerName || "Community Lead"

                    return (
                      <Card key={comm.id} className="rounded-[10px] border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-[#121212] p-4 flex flex-col justify-between space-y-3 hover:border-emerald-500/40 transition-colors shadow-xs">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="h-9 w-9 rounded-[8px] bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-white flex items-center justify-center font-bold text-sm shrink-0">
                              <Users className="h-5 w-5 text-slate-700 dark:text-white" />
                            </div>
                            <div className="flex items-center gap-1.5">
                              {isOwner && (
                                <Badge className="text-[10px] bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-extrabold uppercase">
                                  Owner
                                </Badge>
                              )}
                              <Badge className="text-[10px] bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 border-none font-semibold">
                                {formatNumber(comm.memberCount || comm.membersCount || 1)} Members
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">{comm.name}</h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">{comm.description}</p>
                            
                            {/* Hub Owner & Creation Metadata */}
                            <div className="flex items-center gap-1.5 mt-2.5 text-[10px] text-slate-400 flex-wrap">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3 text-slate-400" />
                                <span>Owner: <strong className="text-slate-700 dark:text-slate-300">{ownerDisplayName}</strong></span>
                              </span>
                              {comm.createdAt && (
                                <>
                                  <span className="text-slate-300 dark:text-zinc-700">•</span>
                                  <span>Created {new Date(comm.createdAt).toLocaleDateString()}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                              {comm.categories?.[0] || "Community Hub"}
                            </span>
                            {isOwner && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete '${comm.name}'? This cannot be undone.`)) {
                                    deleteCommunityMutation.mutate(comm.id)
                                  }
                                }}
                                className="text-[10px] font-bold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 cursor-pointer p-0.5"
                                title="Delete Hub (Owner Only)"
                              >
                                <Trash2 className="h-3 w-3" /> Delete Hub
                              </button>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant={isJoined || isOwner ? "outline" : "default"}
                            onClick={() => {
                              if (!isOwner) {
                                toggleJoinCommunity(comm.id)
                              }
                            }}
                            className={cn(
                              "h-7 px-3 text-[11px] font-bold rounded-[8px] cursor-pointer",
                              isOwner
                                ? "border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/5 cursor-default"
                                : isJoined
                                ? "border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-300"
                                : "bg-emerald-600 hover:bg-emerald-700 text-white"
                            )}
                          >
                            {isOwner ? "Owner" : isJoined ? "Joined" : "+ Join Hub"}
                          </Button>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          ) : activeTab === "people" ? (
            <div className="space-y-4 p-3 sm:p-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-slate-700 dark:text-white" /> Ecosystem People & Network
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Connect with verified members of the White Quantex ecosystem.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPeopleSubFilter("all")}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border",
                      "bg-[#10B981] text-white border-[#10B981]"
                    )}
                  >
                    All Members
                  </button>
                </div>
              </div>

              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                {isMembersLoading ? (
                  <div className="col-span-full py-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                    <Sparkles className="h-4 w-4 animate-spin text-slate-700 dark:text-white" /> Loading ecosystem members...
                  </div>
                ) : members.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-xs text-slate-500">
                    No members found matching your search.
                  </div>
                ) : (
                  members.map((person, i) => {
                    const isUserFollowed = Boolean(
                      followedUsersMap[person.id] ||
                      (person.wqUserId && followedUsersMap[person.wqUserId]) ||
                      (person.username && followedUsersMap[person.username])
                    )
                    const isThisCurrentUser = Boolean(
                      (currentUser?.id && (person.id === currentUser.id || person.wqUserId === currentUser.id)) ||
                      (currentUserDisplayName && person.name && currentUserDisplayName.toLowerCase().trim() === person.name.toLowerCase().trim()) ||
                      (currentUser.username && person.username && currentUser.username.toLowerCase().trim() === person.username.toLowerCase().trim())
                    )
                    const adjustedFollowers = (person.followersCount || 0) + (!isThisCurrentUser && isUserFollowed && (person.followersCount || 0) === 0 ? 1 : 0)

                    const handleInspectPerson = () => {
                      navigate(`/profile/${encodeURIComponent(person.username || person.id || person.wqUserId || "member")}`)
                    }

                    return (
                      <div key={person.id}>
                        {person.role === "FOUNDER" ? (
                          <FounderCard
                            founder={{
                              ...person,
                              avatarUrl: person.avatar || person.avatarUrl,
                              followersCount: adjustedFollowers,
                            }}
                            index={i}
                            isFollowing={isUserFollowed}
                            onToggleFollow={() => toggleFollowUser(person.id || person.wqUserId || person.username)}
                            onCardClick={handleInspectPerson}
                          />
                        ) : (
                          <InvestorCard
                            investor={{
                              ...person,
                              avatarUrl: person.avatar || person.avatarUrl,
                              followersCount: adjustedFollowers,
                            }}
                            index={i}
                            isFollowing={isUserFollowed}
                            onToggleFollow={() => toggleFollowUser(person.id || person.wqUserId || person.username)}
                            onCardClick={handleInspectPerson}
                          />
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          ) : activeTab === "news" ? (
            <div className="space-y-4 p-3 sm:p-0">
              {/* NEWS HEADER & STATS BAR */}
              <div className="p-4 sm:p-5 rounded-[12px] bg-white/90 dark:bg-[#121212] backdrop-blur-xl border border-slate-200 dark:border-zinc-800 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-[#00d09c] flex items-center justify-center font-bold">
                        <Newspaper className="h-4 w-4" />
                      </div>
                      <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        Ecosystem & Corporate News
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Authoritative corporate disclosures, regulatory SEC filings, enterprise funding letters, and ecosystem dispatches.
                    </p>
                  </div>

                  {activeCompanyProfile ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold shrink-0">
                      <Building2 className="h-3.5 w-3.5" />
                      <span className="truncate max-w-[140px]">{activeCompanyProfile.name}</span>
                      <button
                        onClick={clearCompanyFilter}
                        className="p-0.5 hover:text-emerald-300 rounded cursor-pointer transition-colors"
                        title="Show all ecosystem news"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <Badge className="bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-none text-[11px] font-mono font-bold shrink-0 self-start sm:self-auto">
                      {newsList.length} Dispatches Live
                    </Badge>
                  )}
                </div>

                {/* Filter Pills & Search */}
                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
                    {[
                      { id: "ALL", label: "All News" },
                      { id: "Regulatory", label: "Regulatory & SEC" },
                      { id: "Dispatches", label: "Dispatches" },
                      { id: "Earnings", label: "Earnings & Capital" },
                      { id: "Technology", label: "Tech & Patents" },
                      { id: "Partnerships", label: "Partnerships" },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setNewsCategoryFilter(cat.id)}
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap border",
                          newsCategoryFilter === cat.id
                            ? "bg-[#10B981] text-white border-[#10B981] shadow-xs"
                            : "bg-white dark:bg-zinc-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-zinc-800 hover:border-emerald-500/50"
                        )}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative shrink-0 md:w-60">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={newsSearchQuery}
                      onChange={(e) => setNewsSearchQuery(e.target.value)}
                      placeholder="Search news, tickers..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-zinc-800 border-0 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    {newsSearchQuery && (
                      <button
                        onClick={() => setNewsSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* NEWS FEED ARTICLES */}
              {isNewsLoading ? (
                <div className="py-16 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4 animate-spin text-emerald-500" />
                  Loading verified ecosystem dispatches...
                </div>
              ) : newsList.length === 0 ? (
                <div className="py-16 text-center rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 p-6 space-y-2">
                  <Newspaper className="h-8 w-8 mx-auto text-slate-400" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    No dispatches found matching your filters.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { setNewsCategoryFilter("ALL"); setNewsSearchQuery(""); }}
                    className="mt-2 text-xs"
                  >
                    Reset Filters
                  </Button>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {newsList.map((item) => {
                    const isBookmarked = Boolean(bookmarkedNews[item.id])
                    const isCopied = copiedNewsId === item.id

                    return (
                      <Card
                        key={item.id}
                        className="rounded-[12px] border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-[#121212] p-4 sm:p-5 hover:border-emerald-500/40 transition-all shadow-xs space-y-3"
                      >
                        {/* News Card Top Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {item.ticker ? (
                              <button
                                onClick={() => navigate(`/companies/${item.ticker}`)}
                                style={getCompanyLogoStyle(item.logoColor, item.ticker)}
                                className="h-8 w-8 rounded-lg text-white font-extrabold flex items-center justify-center text-xs shadow-xs ring-1 ring-white/20 shrink-0 cursor-pointer hover:opacity-90"
                                title={`View ${item.companyName} profile`}
                              >
                                {item.ticker.slice(0, 2)}
                              </button>
                            ) : (
                              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-[#00d09c] font-bold flex items-center justify-center text-xs shrink-0">
                                WQ
                              </div>
                            )}

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                                  {item.companyName || "Ecosystem Dispatch"}
                                </span>
                                {item.ticker && (
                                  <button
                                    onClick={() => navigate(`/companies/${item.ticker}`)}
                                    className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-emerald-500 cursor-pointer"
                                  >
                                    ${item.ticker}
                                  </button>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500 dark:text-zinc-400">
                                <span>{item.source}</span>
                                <span>·</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> {item.publishedAt}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {item.impactMetric && (
                              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                {item.impactMetric}
                              </span>
                            )}
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider",
                                item.sentiment === "BULLISH"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-[#00d09c]"
                                  : item.sentiment === "POSITIVE"
                                  ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
                                  : item.sentiment === "STRATEGIC"
                                  ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                                  : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                              )}
                            >
                              {item.category || item.sentiment}
                            </span>
                          </div>
                        </div>

                        {/* Headline & Snippet */}
                        <div
                          className="space-y-1.5 cursor-pointer group"
                          onClick={() => setSelectedNewsArticle(item)}
                        >
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-[#00d09c] transition-colors leading-snug">
                            {item.title}
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed line-clamp-2">
                            {item.snippet}
                          </p>
                        </div>

                        {/* Footer Actions */}
                        <div className="pt-2.5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedNewsArticle(item)}
                              className="font-bold text-emerald-600 dark:text-[#00d09c] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              Read Full Story <ArrowRight className="h-3 w-3" />
                            </button>
                            {item.ticker && (
                              <button
                                onClick={() => navigate(`/companies/${item.ticker}`)}
                                className="text-slate-500 hover:text-slate-700 dark:hover:text-white font-medium flex items-center gap-1 cursor-pointer hidden sm:inline-flex"
                              >
                                Company Dossier <ExternalLink className="h-3 w-3" />
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 text-slate-400">
                            <button
                              onClick={() => {
                                setBookmarkedNews((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                              }}
                              title={isBookmarked ? "Remove Bookmark" : "Bookmark Story"}
                              className={cn(
                                "p-1.5 rounded-lg transition-colors cursor-pointer",
                                isBookmarked
                                  ? "text-emerald-500 bg-emerald-500/10"
                                  : "hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-700 dark:hover:text-white"
                              )}
                            >
                              <Bookmark className={cn("h-3.5 w-3.5", isBookmarked && "fill-emerald-500")} />
                            </button>

                            <button
                              onClick={() => {
                                if (typeof window !== "undefined") {
                                  navigator.clipboard.writeText(`${window.location.origin}/community?tab=news#${item.id}`)
                                  setCopiedNewsId(item.id)
                                  setTimeout(() => setCopiedNewsId(null), 2000)
                                }
                              }}
                              title="Copy news link"
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                            >
                              {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Share2 className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* COMPANY PROFILE SHOWCASE CARD (WHEN NAVIGATED WITH COMPANY CONTEXT) */}
              {activeCompanyProfile && (
                <div className="mb-4 rounded-[14px] border border-emerald-500/30 dark:border-emerald-500/20 bg-linear-to-b from-emerald-500/5 via-white/80 to-white/95 dark:from-emerald-950/20 dark:via-[#111417]/90 dark:to-[#0c0e10]/95 backdrop-blur-xl p-4 sm:p-5 shadow-lg relative overflow-hidden transition-all">
                  <div className="absolute -right-16 -top-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                  {/* Header: Logo, Identity & Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10">
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div
                        style={getCompanyLogoStyle(activeCompanyProfile.logoColor, activeCompanyProfile.ticker || activeCompanyProfile.name)}
                        className="h-14 w-14 rounded-xl flex items-center justify-center font-black text-lg shadow-md shrink-0 border border-white/20 select-none"
                      >
                        {activeCompanyProfile.ticker
                          ? activeCompanyProfile.ticker.slice(0, 3)
                          : activeCompanyProfile.name.slice(0, 2).toUpperCase()}
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight truncate">
                            {activeCompanyProfile.name}
                          </h2>
                          {activeCompanyProfile.ticker && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs">
                              ${activeCompanyProfile.ticker}
                            </span>
                          )}
                          <Badge className="bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-extrabold text-[10px] px-2 py-0.5 rounded-md gap-1">
                            <ShieldCheck className="h-3 w-3" /> VERIFIED DOSSIER
                          </Badge>
                        </div>

                        {/* Interactive Follower, Following & Hubs Navigation Buttons */}
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 pt-0.5">
                          <button
                            type="button"
                            onClick={() => setCompanySubTab("followers")}
                            title="Click to view all followers of this company"
                            className={cn(
                              "flex items-center gap-1 transition-all cursor-pointer rounded-md px-1.5 py-0.5 -mx-1",
                              companySubTab === "followers"
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-black shadow-2xs"
                                : "hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-emerald-500"
                            )}
                          >
                            <strong className="text-slate-900 dark:text-white font-extrabold">
                              {formatNumber(followerDisplayCount)}
                            </strong>
                            <span className="text-slate-500 dark:text-slate-400 text-[11px] underline decoration-slate-300 dark:decoration-zinc-700 underline-offset-2">
                              Followers
                            </span>
                          </button>

                          <span className="text-slate-300 dark:text-zinc-700 select-none">•</span>

                          <button
                            type="button"
                            onClick={() => setCompanySubTab("following")}
                            title="Click to view entities and partners followed by this company"
                            className={cn(
                              "flex items-center gap-1 transition-all cursor-pointer rounded-md px-1.5 py-0.5 -mx-1",
                              companySubTab === "following"
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-black shadow-2xs"
                                : "hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-emerald-500"
                            )}
                          >
                            <strong className="text-slate-900 dark:text-white font-extrabold">
                              {followingDisplayCount}
                            </strong>
                            <span className="text-slate-500 dark:text-slate-400 text-[11px] underline decoration-slate-300 dark:decoration-zinc-700 underline-offset-2">
                              Following
                            </span>
                          </button>

                          <span className="text-slate-300 dark:text-zinc-700 select-none">•</span>

                          <button
                            type="button"
                            onClick={() => setCompanySubTab("communities")}
                            title="Click to view affiliated community hubs"
                            className={cn(
                              "flex items-center gap-1 transition-all cursor-pointer rounded-md px-1.5 py-0.5 -mx-1",
                              companySubTab === "communities"
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-black shadow-2xs"
                                : "hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-emerald-500"
                            )}
                          >
                            <strong className="text-slate-900 dark:text-white font-extrabold">
                              {companyAffiliatedCommunities.length}
                            </strong>
                            <span className="text-slate-500 dark:text-slate-400 text-[11px] underline decoration-slate-300 dark:decoration-zinc-700 underline-offset-2">
                              Hubs
                            </span>
                          </button>
                        </div>

                        {/* Sector, Entity, HQ & CIK */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {activeCompanyProfile.sector}
                          </span>
                          {activeCompanyProfile.legalEntity && (
                            <>
                              <span className="text-slate-300 dark:text-zinc-700">•</span>
                              <span className="truncate">{activeCompanyProfile.legalEntity}</span>
                            </>
                          )}
                          {activeCompanyProfile.headquarters && (
                            <>
                              <span className="text-slate-300 dark:text-zinc-700">•</span>
                              <span>{activeCompanyProfile.headquarters}</span>
                            </>
                          )}
                          {activeCompanyProfile.cik && (
                            <>
                              <span className="text-slate-300 dark:text-zinc-700">•</span>
                              <button
                                onClick={() => handleCopyCIK(activeCompanyProfile.cik)}
                                title="Click to copy SEC CIK"
                                className="font-mono text-[11px] hover:text-emerald-500 flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <span>CIK: {activeCompanyProfile.cik}</span>
                                {copiedCIK ? (
                                  <Check className="h-3 w-3 text-emerald-500" />
                                ) : (
                                  <Copy className="h-2.5 w-2.5 text-slate-400" />
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                      {/* Interactive Follow / Following Button */}
                      <Button
                        size="sm"
                        onClick={() => toggleFollowCompany(activeCompanyProfile.id)}
                        className={cn(
                          "h-8 px-3 text-xs font-bold rounded-lg cursor-pointer transition-all duration-200 flex items-center gap-1.5 shadow-2xs",
                          isCompanyFollowed
                            ? "bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-900 dark:text-white border border-slate-300 dark:border-zinc-700"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white"
                        )}
                      >
                        {isCompanyFollowed ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            <span>Following</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-3.5 w-3.5" />
                            <span>Follow</span>
                          </>
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={clearCompanyFilter}
                        title="Clear Company Filter and view full community feed"
                        className="h-8 px-2.5 text-xs font-semibold rounded-lg border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5 mr-1" />
                        Clear Filter
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => navigate(`/companies/${activeCompanyProfile.id}`)}
                        className="h-8 px-3 text-xs font-bold rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 cursor-pointer shadow-xs flex items-center gap-1.5"
                      >
                        <Building2 className="h-3.5 w-3.5" />
                        <span>View Dossier</span>
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Description snippet if present */}
                  {activeCompanyProfile.description && (
                    <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {activeCompanyProfile.description}
                    </p>
                  )}

                  {/* Metric Strip */}
                  <div className="mt-3.5 pt-3 border-t border-slate-200/80 dark:border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-slate-100/70 dark:bg-zinc-900/60 border border-slate-200/50 dark:border-zinc-800/50">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Valuation</div>
                      <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                        {activeCompanyProfile.valuation}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-100/70 dark:bg-zinc-900/60 border border-slate-200/50 dark:border-zinc-800/50">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Revenue ARR</div>
                      <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                        {activeCompanyProfile.annualRevenue}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-100/70 dark:bg-zinc-900/60 border border-slate-200/50 dark:border-zinc-800/50">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Leadership</div>
                      <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white mt-0.5 truncate">
                        {activeCompanyProfile.ceo}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-100/70 dark:bg-zinc-900/60 border border-slate-200/50 dark:border-zinc-800/50">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Ecosystem Trust</div>
                      <div className="text-xs sm:text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        {activeCompanyProfile.trustScore}% Score
                      </div>
                    </div>
                  </div>

                  {/* Company Section Sub-Tabs & Actions Bar */}
                  <div className="mt-3.5 pt-3 border-t border-slate-200/80 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                      <button
                        onClick={() => setCompanySubTab("all")}
                        className={cn(
                          "px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5",
                          companySubTab === "all"
                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-xs"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                        )}
                      >
                        <span>All Activity</span>
                        <span className={cn(
                          "px-1.5 py-0.5 rounded-full text-[10px]",
                          companySubTab === "all" ? "bg-white/20 dark:bg-black/20" : "bg-slate-200 dark:bg-zinc-800"
                        )}>
                          {filteredPosts.length}
                        </span>
                      </button>

                      <button
                        onClick={() => setCompanySubTab("dispatches")}
                        className={cn(
                          "px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5",
                          companySubTab === "dispatches"
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                        )}
                      >
                        <Radio className="h-3 w-3 text-emerald-400" />
                        <span>Official Dispatches</span>
                        <span className={cn(
                          "px-1.5 py-0.5 rounded-full text-[10px]",
                          companySubTab === "dispatches" ? "bg-white/20" : "bg-slate-200 dark:bg-zinc-800"
                        )}>
                          {companyOfficialPosts.length}
                        </span>
                      </button>

                      <button
                        onClick={() => setCompanySubTab("communities")}
                        className={cn(
                          "px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5",
                          companySubTab === "communities"
                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-xs"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                        )}
                      >
                        <Users className="h-3 w-3" />
                        <span>Affiliated Hubs</span>
                        <span className={cn(
                          "px-1.5 py-0.5 rounded-full text-[10px]",
                          companySubTab === "communities" ? "bg-white/20 dark:bg-black/20" : "bg-slate-200 dark:bg-zinc-800"
                        )}>
                          {companyAffiliatedCommunities.length}
                        </span>
                      </button>

                      <button
                        onClick={() => setCompanySubTab("followers")}
                        className={cn(
                          "px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0",
                          companySubTab === "followers"
                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-xs"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                        )}
                      >
                        <UserCheck className="h-3 w-3" />
                        <span>Followers</span>
                        <span className={cn(
                          "px-1.5 py-0.5 rounded-full text-[10px]",
                          companySubTab === "followers" ? "bg-white/20 dark:bg-black/20" : "bg-slate-200 dark:bg-zinc-800"
                        )}>
                          {formatNumber(followerDisplayCount)}
                        </span>
                      </button>

                      <button
                        onClick={() => setCompanySubTab("following")}
                        className={cn(
                          "px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0",
                          companySubTab === "following"
                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-xs"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                        )}
                      >
                        <UserPlus className="h-3 w-3" />
                        <span>Following</span>
                        <span className={cn(
                          "px-1.5 py-0.5 rounded-full text-[10px]",
                          companySubTab === "following" ? "bg-white/20 dark:bg-black/20" : "bg-slate-200 dark:bg-zinc-800"
                        )}>
                          {followingDisplayCount}
                        </span>
                      </button>

                      <button
                        onClick={() => setCompanySubTab("about")}
                        className={cn(
                          "px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5",
                          companySubTab === "about"
                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-xs"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                        )}
                      >
                        <Briefcase className="h-3 w-3" />
                        <span>About & Governance</span>
                      </button>
                    </div>

                    <Button
                      size="sm"
                      onClick={handleStartCompanyPost}
                      className="h-8 px-3 text-xs font-bold bg-[#00d09c] hover:bg-[#00b888] text-slate-950 rounded-lg cursor-pointer flex items-center gap-1.5 shadow-xs shrink-0"
                    >
                      <PlusSquare className="h-3.5 w-3.5" />
                      <span>Post Discussion</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* VIEW: AFFILIATED COMMUNITIES BELONGING TO THIS COMPANY */}
              {activeCompanyProfile && companySubTab === "communities" ? (
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between px-1">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-2">
                        <Users className="h-4 w-4 text-emerald-500" />
                        Communities Belongs to {activeCompanyProfile.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Official corporate hubs, Delaware statutory liquidity syndicate, and accredited investor circles.
                      </p>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                      {companyAffiliatedCommunities.length} Linked Hubs
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {companyAffiliatedCommunities.map((hub: any) => {
                      const isJoined = Boolean(joinedCommunities[hub.id])
                      return (
                        <Card
                          key={hub.id}
                          className="rounded-[12px] border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-[#121212] p-4 flex flex-col justify-between space-y-3 hover:border-emerald-500/40 transition-all shadow-xs"
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between gap-2">
                              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-500/20">
                                <Users className="h-5 w-5" />
                              </div>
                              <Badge className="text-[10px] bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 border-none font-semibold">
                                {formatNumber(hub.memberCount || 1000)} Members
                              </Badge>
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                                  {hub.name}
                                </h5>
                                {hub.isPrimary && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                    PRIMARY
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide block mt-0.5">
                                {hub.role}
                              </span>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                                {hub.description}
                              </p>
                            </div>
                          </div>

                          <div className="pt-2.5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
                            <span className="text-[10px] font-medium text-slate-400">
                              {hub.postCount || 42} active discussions
                            </span>
                            <Button
                              size="sm"
                              variant={isJoined ? "outline" : "default"}
                              onClick={() => toggleJoinCommunity(hub.id)}
                              className={cn(
                                "h-7 px-3 text-[11px] font-bold rounded-lg cursor-pointer transition-all",
                                isJoined
                                  ? "border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-300"
                                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
                              )}
                            >
                              {isJoined ? "Joined Hub" : "+ Join Hub"}
                            </Button>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              ) : activeCompanyProfile && companySubTab === "followers" ? (
                /* VIEW: FOLLOWERS OF THE COMPANY */
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between px-1">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-emerald-500" />
                        Followers of {activeCompanyProfile.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Accredited private allocators, venture syndicates, and verified founders following this company.
                      </p>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                      {formatNumber(followerDisplayCount)} Verified Followers
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {companyFollowers.map((person: any) => {
                      const isUserFollowed = Boolean(followedUsersMap[person.id])
                      return (
                        <Card
                          key={person.id}
                          onClick={() => navigate(`/profile/${encodeURIComponent(person.username || person.id)}`)}
                          className="rounded-[12px] border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-[#121212] p-4 flex flex-col justify-between space-y-3 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 hover:shadow-md transition-all shadow-xs cursor-pointer group"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <Avatar className="h-10 w-10 rounded-xl ring-2 ring-transparent group-hover:ring-emerald-500/40 transition-all shrink-0">
                                {person.avatar && <AvatarImage src={person.avatar} alt={person.name} />}
                                <AvatarFallback className="bg-slate-900 text-white font-bold text-xs rounded-xl">
                                  {getInitials(person.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-500 transition-colors">
                                    {person.name}
                                  </span>
                                  <VerificationBadge level={person.verificationLevel} />
                                  {person.isCurrentUser && (
                                    <Badge className="text-[9px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-1 py-0 font-extrabold">
                                      YOU
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                  {person.headline}
                                </p>
                                <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                  <Globe className="h-2.5 w-2.5" /> {person.location}
                                </span>
                              </div>
                            </div>

                            {person.isCurrentUser ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleFollowCompany(activeCompanyProfile.id)
                                }}
                                className="h-7 px-2.5 text-[11px] font-bold rounded-lg cursor-pointer border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-slate-300 shrink-0"
                              >
                                Following
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant={isUserFollowed ? "outline" : "default"}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleFollowUser(person.id)
                                }}
                                className={cn(
                                  "h-7 px-2.5 text-[11px] font-bold rounded-lg cursor-pointer shrink-0 transition-all",
                                  isUserFollowed
                                    ? "border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-300"
                                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                                )}
                              >
                                {isUserFollowed ? "Following" : "+ Follow"}
                              </Button>
                            )}
                          </div>

                          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[10px]">
                            {person.badgeText ? (
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                {person.badgeText}
                              </span>
                            ) : (
                              <span className="text-slate-400 font-medium">
                                {formatNumber(person.followersCount || 120)} Followers
                              </span>
                            )}
                            <div className="flex items-center gap-2.5">
                              <span className="font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                                {person.trustScore}% Trust Score
                              </span>
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                                View Profile →
                              </span>
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              ) : activeCompanyProfile && companySubTab === "following" ? (
                /* VIEW: ENTITIES & PARTNERS FOLLOWED BY THE COMPANY */
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between px-1">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-emerald-500" />
                        Partners & Entities Followed by {activeCompanyProfile.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Institutional syndicates, infrastructure rails, and statutory registries followed by {activeCompanyProfile.name}.
                      </p>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                      {followingDisplayCount} Followed Partners
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {companyFollowing.map((entity: any) => {
                      const isEntityFollowed = followedUsersMap[entity.id] !== undefined
                        ? followedUsersMap[entity.id]
                        : true
                      return (
                        <Card
                          key={entity.id}
                          onClick={() => navigate(`/profile/${encodeURIComponent(entity.username || entity.id || entity.name)}`)}
                          className="rounded-[12px] border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-[#121212] p-4 flex flex-col justify-between space-y-3 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 transition-all shadow-xs cursor-pointer group"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center font-black text-xs text-white shrink-0 shadow-xs ring-2 ring-transparent group-hover:ring-emerald-500/40 transition-all", entity.avatarColor || "bg-indigo-600")}>
                                {entity.avatarInitials}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-500 transition-colors">
                                    {entity.name}
                                  </span>
                                  <VerificationBadge level={entity.verificationLevel} />
                                </div>
                                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide block mt-0.5">
                                  {entity.category}
                                </span>
                                <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                  <Globe className="h-2.5 w-2.5" /> {entity.location}
                                </span>
                              </div>
                            </div>

                            <Button
                              size="sm"
                              variant={isEntityFollowed ? "outline" : "default"}
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleFollowUser(entity.id)
                              }}
                              className={cn(
                                "h-7 px-2.5 text-[11px] font-bold rounded-lg cursor-pointer shrink-0 transition-all",
                                isEntityFollowed
                                  ? "border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-300"
                                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
                              )}
                            >
                              {isEntityFollowed ? "Following" : "+ Follow"}
                            </Button>
                          </div>

                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            {entity.description}
                          </p>

                          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[10px]">
                            <span className="font-semibold text-slate-500">
                              Statutory Verified Partner
                            </span>
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                              View Profile →
                            </span>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              ) : activeCompanyProfile && companySubTab === "about" ? (
                /* VIEW: MORE ABOUT THE COMPANY & GOVERNANCE */
                <Card className="rounded-[14px] border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-[#121212] p-5 mb-6 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-emerald-500" />
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        About {activeCompanyProfile.name}
                      </h4>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-bold text-emerald-600 border-emerald-500/30">
                      {activeCompanyProfile.exchangeTier}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {activeCompanyProfile.description}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-2">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Legal Entity</span>
                      <p className="font-bold text-slate-900 dark:text-white">{activeCompanyProfile.legalEntity}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Headquarters</span>
                      <p className="font-bold text-slate-900 dark:text-white">{activeCompanyProfile.headquarters}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Employees</span>
                      <p className="font-bold text-slate-900 dark:text-white">{activeCompanyProfile.employees} Team Members</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Founded Year</span>
                      <p className="font-bold text-slate-900 dark:text-white">{activeCompanyProfile.foundedYear}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Trading Status</span>
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">{activeCompanyProfile.status}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">SEC Registry</span>
                      <p className="font-mono font-bold text-slate-900 dark:text-white">{activeCompanyProfile.cik}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Verified Cap Table & 409A Valuations on White Quantex.
                    </span>
                    <Button
                      size="sm"
                      onClick={() => navigate(`/companies/${activeCompanyProfile.id}`)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg h-8 px-3.5 cursor-pointer flex items-center gap-1.5"
                    >
                      <Building2 className="h-3.5 w-3.5" />
                      <span>Open Full Institutional Dossier</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </Card>
              ) : null}

              {/* FEED POST CARDS (WHEN ON ALL ACTIVITY OR OFFICIAL DISPATCHES) */}
              {(companySubTab === "all" || companySubTab === "dispatches" || !activeCompanyProfile) && (
                <>
                  {/* Active Feed Filter Dismissible Banner */}
                  {feedFilter !== "all" && !activeCompanyProfile && (
                    <div className="mb-3 p-3 rounded-[12px] bg-white/90 dark:bg-[#121212] border border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-2 text-xs min-w-0">
                        {feedFilter === "companies" && (
                          <>
                            <Building2 className="h-4 w-4 text-blue-500 shrink-0" />
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 dark:text-white">Company Accounts Feed</span>
                              <span className="hidden sm:inline text-slate-500 dark:text-slate-400 ml-1.5">· Showing strictly posts authored by verified Corporate Issuers</span>
                            </div>
                          </>
                        )}
                        {feedFilter === "ventures" && (
                          <>
                            <Rocket className="h-4 w-4 text-purple-500 shrink-0" />
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 dark:text-white">Venture Accounts Feed</span>
                              <span className="hidden sm:inline text-slate-500 dark:text-slate-400 ml-1.5">· Showing strictly posts authored by Venture Capital & Syndicate accounts</span>
                            </div>
                          </>
                        )}
                        {feedFilter === "my_posts" && (
                          <>
                            <FileText className="h-4 w-4 text-emerald-500 shrink-0" />
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 dark:text-white">Authored by You</span>
                              <span className="hidden sm:inline text-slate-500 dark:text-slate-400 ml-1.5">· Posts published by your account</span>
                            </div>
                          </>
                        )}
                        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold shrink-0">
                          {filteredPosts.length} {filteredPosts.length === 1 ? "Post" : "Posts"}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {(feedFilter === "companies" || feedFilter === "ventures") && (
                          <a
                            href="http://localhost:5173/post"
                            target="_blank"
                            rel="noreferrer"
                            className="hidden md:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-[#00d09c] hover:underline"
                            title="Open Company & Venture Post Publisher in Company Module"
                          >
                            <span>Post in Company Module</span>
                            <ArrowUpRight className="h-3 w-3" />
                          </a>
                        )}
                        <button
                          onClick={() => setFeedFilter("all")}
                          className="text-[11px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span>Show All</span>
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  )}

                  {isPostsLoading ? (
                    <div className="py-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                      <Sparkles className="h-4 w-4 animate-spin text-slate-700 dark:text-white" /> Loading feed...
                    </div>
                  ) : filteredPosts.length === 0 ? (
                    <Card className="rounded-[10px] border-slate-200 dark:border-zinc-800 dark:bg-[#121212]">
                      <CardContent className="py-12 text-center text-xs text-slate-500 space-y-3">
                        {activeCompanyProfile ? (
                          <div className="max-w-md mx-auto space-y-3">
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                              No community posts specifically tagging {activeCompanyProfile.name} yet.
                            </p>
                            <p className="text-xs text-slate-400">
                              Be the first to share an update, question, or investment insight about ${activeCompanyProfile.ticker || activeCompanyProfile.name}!
                            </p>
                            <div className="flex items-center justify-center gap-2 pt-2">
                              <Button
                                size="sm"
                                onClick={handleStartCompanyPost}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg h-8 px-3 cursor-pointer"
                              >
                                + Post About {activeCompanyProfile.name}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={clearCompanyFilter}
                                className="text-xs font-bold rounded-lg h-8 px-3 cursor-pointer border-slate-200 dark:border-zinc-700"
                              >
                                Show All Community Posts
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2 py-4">
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                              {feedFilter === "my_posts"
                                ? "You haven't published any posts yet."
                                : feedFilter === "companies"
                                ? "No posts found from Company Accounts yet."
                                : feedFilter === "ventures"
                                ? "No posts found from Venture Accounts yet."
                                : "No posts found matching search criteria."}
                            </p>
                            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                              {feedFilter === "companies"
                                ? "Companies can post official corporate dispatches directly from the White Quantex Company Module."
                                : feedFilter === "ventures"
                                ? "Ventures can post funding calls, syndicate rounds, and memos directly from the Company Module."
                                : ""}
                            </p>
                            <div className="flex items-center justify-center gap-2 pt-2">
                              {(feedFilter === "companies" || feedFilter === "ventures") && (
                                <a
                                  href="http://localhost:5173/post"
                                  target="_blank"
                                  rel="noreferrer"
                                  className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors"
                                >
                                  <span>Post in Company Module</span>
                                  <ArrowUpRight className="h-3.5 w-3.5" />
                                </a>
                              )}
                              {feedFilter !== "all" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setFeedFilter("all")}
                                  className="text-xs font-bold cursor-pointer"
                                >
                                  Reset to All Posts
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                filteredPosts.map((post: Post) => {
                  const isLiked = likedPostsMap[post.id] !== undefined ? likedPostsMap[post.id] : Boolean(post.isLiked)
                  const likesCount = Math.max(0, (post.likesCount || 0) + (likesDeltaMap[post.id] || 0))
                  const isBookmarked = bookmarkedPostsMap[post.id] !== undefined ? bookmarkedPostsMap[post.id] : Boolean(post.isBookmarked)
                  const isOfficial = post.id.startsWith("official-post-")
                  const isCompany = isCompanyAccountPost(post)
                  const isVenture = isVentureAccountPost(post)
                  const isAuthor = Boolean(
                    post.isAuthor ||
                    (currentUser?.id && (
                      post.wqAuthorId === currentUser.id ||
                      post.author?.id === currentUser.id ||
                      post.author?.wqUserId === currentUser.id
                    )) ||
                    (currentUser?.wqUserId && (
                      post.wqAuthorId === currentUser.wqUserId ||
                      post.author?.id === currentUser.wqUserId ||
                      post.author?.wqUserId === currentUser.wqUserId
                    )) ||
                    (currentUser?.username && (
                      (post as any).authorUsername === currentUser.username ||
                      post.author?.username === currentUser.username
                    )) ||
                    (authUser?.id && (
                      post.wqAuthorId === authUser.id ||
                      post.author?.id === authUser.id ||
                      post.author?.wqUserId === authUser.id
                    )) ||
                    ((authUser as any)?.wqUserId && (
                      post.wqAuthorId === (authUser as any).wqUserId ||
                      post.author?.id === (authUser as any).wqUserId ||
                      post.author?.wqUserId === (authUser as any).wqUserId
                    )) ||
                    (authUser?.username && (
                      (post as any).authorUsername === authUser.username ||
                      post.author?.username === authUser.username
                    ))
                  )

                  const defaultAccountName = resolvePostAccountName(post)
                  const accountDisplayName = (isAuthor && currentUser?.displayName && !isCompany && !isVenture)
                    ? currentUser.displayName
                    : defaultAccountName

                  const accountHeadline = (isAuthor && currentUser?.headline && !isCompany && !isVenture)
                    ? currentUser.headline
                    : (post.author?.headline || (post as any).authorHeadline || (isCompany ? `Corporate Issuer • $${post.ticker || "WQ"}` : isVenture ? "Venture Capital Partner" : "Ecosystem Member"))

                  const accountAvatarUrl = (isAuthor && currentUser?.avatarUrl && !isCompany && !isVenture)
                    ? currentUser.avatarUrl
                    : (post.author?.avatarUrl || (post as any).authorAvatarUrl)

                  const avatarInitials = (isAuthor && !isCompany && !isVenture)
                    ? getInitials(accountDisplayName)
                    : resolvePostAvatarInitials(post, accountDisplayName)

                  return (
                    <Card key={post.id} className="rounded-none sm:rounded-[14px] border-x-0 border-t-0 border-b border-slate-200 dark:border-white/20 sm:dark:border-zinc-800/80 bg-transparent sm:bg-white/70 dark:sm:bg-[#121618]/70 backdrop-blur-xl shadow-none sm:shadow-[0_8px_32px_0_rgba(0,0,0,0.04)] dark:sm:shadow-[0_8px_32px_0_rgba(0,0,0,0.25)] hover:border-emerald-500/40 transition-all duration-300 mb-0 sm:mb-4">
                      <CardContent className="p-4 sm:p-5 space-y-4">
                        
                        {/* Post Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div
                            onClick={() => {
                              communityService.trackActivity(post.id, {
                                activityType: "PROFILE_VIEW",
                                authorId: post.wqAuthorId,
                                postType: post.postType,
                                hashtags: post.hashtags,
                              })
                              const authorObj = (post.author || {}) as any
                              const postAny = post as any
                              const authorId = authorObj.id || post.wqAuthorId || post.author?.wqUserId

                              // Find all posts authored by this account in the current feed pool
                              const authorPosts = allPostsPool.filter((p: any) => {
                                const pAuthorId = p.author?.id || p.author?.wqUserId || p.wqAuthorId
                                if (authorId && pAuthorId) {
                                  return pAuthorId === authorId
                                }
                                const pAuthorName = p.author?.displayName || p.author?.name
                                return accountDisplayName && pAuthorName === accountDisplayName
                              })

                              // Build real dispatches matching this user's posts
                              const realDispatches = (authorPosts.length > 0 ? authorPosts : [post]).map((p: any) => ({
                                id: p.id,
                                content: p.content,
                                timestamp: p.timestamp || "Recently",
                                likesCount: p.likesCount || 0,
                                commentsCount: p.commentsCount || 0,
                                tag: p.tags?.[0] || p.category || (p.visibility === "PROTECTED" ? "Protected" : p.visibility === "PRIVATE" ? "Private" : "Public"),
                              }))

                              const KNOWN_AUTHOR_MAP: Record<string, string> = {
                                "wq-user-elena-voss": "elenavoss",
                                "wq-user-marcus-klein": "marcusklein",
                                "wq-user-aris-thorne": "aristhorne",
                                "wq-user-vikram-seth": "vikramseth",
                                "wq-user-sarah-chen": "sarahchen",
                                "wq-user-david-kim": "davidkim",
                                "wq-user-alexander-vance": "alexandervance",
                                "wq-user-claire-dupont": "clairedupont",
                              }

                              const matchedMember = members.find((m) =>
                                (authorId && (m.id === authorId || m.wqUserId === authorId)) ||
                                (authorObj.username && m.username?.toLowerCase() === authorObj.username?.toLowerCase()) ||
                                (accountDisplayName && m.name?.toLowerCase() === accountDisplayName.toLowerCase())
                              )

                              const isActuallyCurrentUser = Boolean(
                                isAuthor ||
                                (currentUser?.id && (authorId === currentUser.id || authorId === (authUser as any)?.wqUserId)) ||
                                (currentUserDisplayName && accountDisplayName && currentUserDisplayName.toLowerCase().trim() === accountDisplayName.toLowerCase().trim()) ||
                                (currentUser.username && authorObj.username && currentUser.username.toLowerCase().trim() === authorObj.username.toLowerCase().trim()) ||
                                (accountDisplayName && accountDisplayName.toLowerCase().includes("dharaneesh") && currentUserDisplayName?.toLowerCase().includes("dharaneesh"))
                              )

                              const isTargetFollowed = Boolean(
                                followedUsersMap[authorId] ||
                                (matchedMember && followedUsersMap[matchedMember.id]) ||
                                (authorObj.username && followedUsersMap[authorObj.username])
                              )

                              const targetUsername = isActuallyCurrentUser && currentUser.username
                                ? currentUser.username
                                : (
                                    (authorId && KNOWN_AUTHOR_MAP[authorId]) ||
                                    (post.wqAuthorId && KNOWN_AUTHOR_MAP[post.wqAuthorId]) ||
                                    matchedMember?.username ||
                                    (post.author?.username && post.author.username !== "user" ? post.author.username : null) ||
                                    (authorObj.username && authorObj.username !== "user" ? authorObj.username : null) ||
                                    (post as any).authorUsername ||
                                    authorId ||
                                    (post.ticker ? post.ticker.toLowerCase() : accountDisplayName.toLowerCase().replace(/[^a-z0-9]/g, ""))
                                  )
                              navigate(`/profile/${encodeURIComponent(targetUsername)}`)
                            }}
                            className="flex items-center gap-3 cursor-pointer group/author hover:opacity-90 transition-opacity"
                            title="Click to view profile"
                          >
                            <Avatar className="h-10 w-10 rounded-[10px] ring-2 ring-transparent group-hover/author:ring-emerald-500/40 transition-all shrink-0">
                              <AvatarImage src={accountAvatarUrl} alt={accountDisplayName} />
                              <AvatarFallback className={cn("text-white font-bold text-xs rounded-[10px]", isAuthor ? "bg-[#00d09c] text-black font-extrabold" : isCompany ? "bg-blue-700" : isVenture ? "bg-purple-800" : "bg-slate-900")}>
                                {avatarInitials}
                              </AvatarFallback>
                            </Avatar>

                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-bold text-slate-900 dark:text-white group-hover/author:text-emerald-500 transition-colors">
                                  {accountDisplayName}
                                </span>
                                <VerificationBadge level={post.author?.verificationLevel || (post as any).authorVerificationLevel || (isCompany || isVenture ? "PLATINUM" : "NONE")} />
                                {isCompany && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 inline-flex items-center gap-1 shrink-0">
                                    <Building2 className="h-2.5 w-2.5" /> Company Account
                                  </span>
                                )}
                                {isVenture && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 inline-flex items-center gap-1 shrink-0">
                                    <Rocket className="h-2.5 w-2.5" /> Venture Account
                                  </span>
                                )}
                                {/* For regular user accounts registered on http://localhost:7000, do not show any badge */}
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                {accountHeadline}
                              </p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1 flex-wrap">
                                {post.createdAt && (
                                  <span className="flex items-center gap-1 font-medium">
                                    <Clock className="h-2.5 w-2.5" />
                                    <span>Posted on: {formatPostTimestamp(post.createdAt)}</span>
                                  </span>
                                )}
                                {post.communityName && (
                                  <>
                                    <span className="text-slate-300 dark:text-zinc-700">•</span>
                                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                      <Users className="h-2.5 w-2.5" />
                                      <span>{post.communityName}</span>
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Visibility Badge */}
                            {post.visibility === "PRIVATE" ? (
                              <Badge variant="outline" className="text-[10px] font-bold bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-[6px] gap-1 shrink-0">
                                <Lock className="h-2.5 w-2.5" />
                                <span>Private</span>
                              </Badge>
                            ) : post.visibility === "PROTECTED" ? (
                              <Badge variant="outline" className="text-[10px] font-bold bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 rounded-[6px] gap-1 shrink-0">
                                <ShieldCheck className="h-2.5 w-2.5" />
                                <span>Protected</span>
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] font-bold bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400 rounded-[6px] gap-1 shrink-0">
                                <Globe className="h-2.5 w-2.5" />
                                <span>Public</span>
                              </Badge>
                            )}

                            {post.impactMetric && (
                              <span className="hidden sm:inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                {post.impactMetric}
                              </span>
                            )}
                            {isOfficial ? (
                              <Badge className="text-[10px] font-extrabold bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-[6px] gap-1 shrink-0">
                                <Radio className="h-2.5 w-2.5 animate-pulse" />
                                <span>OFFICIAL DISPATCH</span>
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] font-bold bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-slate-300 rounded-[6px] shrink-0">
                                {post.postType || "POST"}
                              </Badge>
                            )}

                            {/* Author Edit / Delete controls */}
                            {isAuthor && !isOfficial && (
                              <div className="flex items-center gap-1 border-l border-slate-200 dark:border-zinc-800 pl-2 ml-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingPost(post)
                                    setEditContent(post.content)
                                    setEditVisibility((post.visibility as any) || "PUBLIC")
                                    setEditPostError(null)
                                  }}
                                  className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer"
                                  title="Edit post"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm("Are you sure you want to delete this post?")) {
                                      deletePostMutation.mutate(post.id)
                                    }
                                  }}
                                  className="p-1.5 rounded-md hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                                  title="Delete post"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Post Content Text */}
                        <p className="text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-line">
                          {post.content}
                        </p>

                        {/* Post Media Attachment */}
                        {post.mediaUrls && post.mediaUrls.length > 0 && (
                          <div className="relative overflow-hidden rounded-[10px] border border-slate-200 dark:border-zinc-800 bg-black/40 p-1">
                            <img
                              src={post.mediaUrls[0]}
                              alt="Post attachment"
                              className="w-full object-cover max-h-96 rounded-[8px]"
                            />
                          </div>
                        )}

                        {/* Post Action Buttons */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-zinc-800 text-xs">
                          <div className="flex items-center gap-4">
                            {/* Like */}
                            <button
                              type="button"
                              onClick={() => handleToggleLike(post.id, Boolean(post.isLiked))}
                              className={cn(
                                "flex items-center gap-1.5 font-bold transition-all text-xs cursor-pointer select-none",
                                isLiked ? "text-rose-600 dark:text-rose-500" : "text-slate-500 dark:text-slate-400 hover:text-rose-600"
                              )}
                            >
                              <Heart className={cn("h-4 w-4", isLiked && "fill-rose-600 text-rose-600")} />
                              <span>{likesCount}</span>
                            </button>

                            {/* Comment */}
                            <button
                              onClick={() => {
                                setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)
                                communityService.trackActivity(post.id, {
                                  activityType: "CLICK",
                                  postType: post.postType,
                                  hashtags: post.hashtags,
                                })
                              }}
                              className="flex items-center gap-1.5 font-bold text-slate-500 dark:text-slate-400 hover:text-emerald-500 transition-colors text-xs cursor-pointer"
                            >
                              <MessageSquare className="h-4 w-4" />
                              <span>{post.commentsCount || 0}</span>
                            </button>

                            {/* Share */}
                            <button
                              onClick={() => {
                                if (typeof window !== "undefined") {
                                  navigator.clipboard?.writeText(window.location.href)
                                  alert("Post link copied!")
                                  communityService.trackActivity(post.id, {
                                    activityType: "SHARE",
                                    postType: post.postType,
                                    hashtags: post.hashtags,
                                    authorId: post.wqAuthorId,
                                  })
                                }
                              }}
                              className="flex items-center gap-1.5 font-bold text-slate-500 dark:text-slate-400 hover:text-emerald-500 transition-colors text-xs cursor-pointer"
                            >
                              <Share2 className="h-4 w-4" />
                              <span>Share</span>
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleToggleBookmark(post.id, Boolean(post.isBookmarked))}
                            className={cn(
                              "flex items-center gap-1 font-bold transition-all text-xs cursor-pointer select-none",
                              isBookmarked ? "text-amber-500" : "text-slate-500 dark:text-slate-400 hover:text-amber-500"
                            )}
                          >
                            <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-amber-500 text-amber-500")} />
                          </button>
                        </div>

                        {/* Post Comments Section */}
                        {activeCommentPostId === post.id && (
                          <PostCommentsSection postId={post.id} />
                        )}
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </>
          )}
        </>
      )}

        </div>

        {/* =================================================================== */}
        {/* ─── 3. DIV 3: USER NOTIFICATIONS (OPEN OR CLOSED) ────────────────── */}
        {/* =================================================================== */}
        <div
          className={cn(
            "flex-col space-y-4 shrink-0 h-full overflow-y-auto pl-4 border-l border-slate-200 dark:border-zinc-800/80 transition-all duration-300",
            isRightSidebarOpen ? "hidden xl:flex w-[320px] opacity-100" : "w-0 opacity-0 overflow-hidden pointer-events-none hidden"
          )}
        >
          <Card className="rounded-none border-slate-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-[#0E1113]/70 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
            <CardContent className="p-4 space-y-4">
              
              {/* Notifications Top Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-slate-700 dark:text-white" />
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Notifications
                  </h3>
                  {unreadNotifCount > 0 && (
                    <Badge className="text-[10px] h-5 px-1.5 bg-emerald-500/15 text-emerald-500 border-none font-extrabold rounded-full">
                      {unreadNotifCount} New
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={markAllNotifsRead}
                    className="text-[11px] font-semibold text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer"
                  >
                    Mark read
                  </button>
                  <button
                    onClick={() => setIsRightSidebarOpen(false)}
                    title="Close Notifications Sidebar"
                    className="p-1 rounded-[6px] text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <PanelRightClose className="h-4 w-4 text-slate-500 dark:text-slate-400 hover:text-rose-500" />
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-zinc-900 rounded-[8px]">
                {(["all", "mentions", "activity"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setNotifFilter(tab)}
                    className={cn(
                      "flex-1 py-1 text-[11px] font-bold capitalize rounded-[6px] transition-colors cursor-pointer",
                      notifFilter === tab
                        ? "bg-white text-slate-900 dark:bg-zinc-800 dark:text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Notification List Items */}
              <div className="space-y-3">
                {isNotificationsLoading ? (
                  <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 animate-spin" /> Loading alerts...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const IconComp = getNotificationIcon(notif.type)
                    return (
                      <div
                        key={notif.id}
                        onClick={() => {
                          if (!notif.read) markNotifReadMutation.mutate(notif.id)
                        }}
                        className={cn(
                          "p-3 rounded-[10px] border transition-all cursor-pointer flex items-start gap-3",
                          notif.read
                            ? "border-slate-200/60 dark:border-zinc-800/60 bg-white/40 dark:bg-zinc-900/40 opacity-75"
                            : "border-slate-300 dark:border-zinc-700/80 bg-slate-50/90 dark:bg-zinc-900/90 shadow-xs"
                        )}
                      >
                        <div className="h-8 w-8 rounded-[8px] flex items-center justify-center shrink-0 text-xs font-bold bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-white">
                          <IconComp className="h-4 w-4 text-slate-700 dark:text-white" />
                        </div>

                        <div className="min-w-0 flex-1 space-y-0.5">
                          <p className="text-xs text-slate-800 dark:text-slate-200 leading-snug">
                            <span className="font-bold text-slate-900 dark:text-white">{notif.actor?.name} </span>
                            {notif.message}
                          </p>
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] text-slate-400 font-medium">{notif.time}</span>
                            {!notif.read && (
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium">Real-time alerts active</span>
                <button
                  onClick={() => navigate("/notifications")}
                  className="text-[11px] font-bold text-emerald-500 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  View All <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>

            </CardContent>
          </Card>
        </div>

      </div>

      {/* ─── CREATE POST MODAL ───────────────────────────────────────────── */}
      {isPostModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-lg rounded-[16px] border border-slate-200/80 dark:border-zinc-700/60 bg-white/80 dark:bg-[#0E1113]/85 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.4)] overflow-hidden">
            <CardContent className="p-5 space-y-4">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <PlusSquare className="h-5 w-5 text-emerald-500" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Create New Post
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Error Alert */}
              {createPostError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{createPostError}</span>
                </div>
              )}

              {/* Author Info */}
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 rounded-[10px]">
                  <AvatarFallback className="bg-slate-900 text-white font-bold text-xs">
                    {getInitials(currentUser.displayName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {currentUser.displayName}
                    </span>
                    <VerificationBadge level={currentUser.verificationLevel || "GOLD"} />
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Publishing as @{currentUser.username} • {currentUser.headline}
                  </span>
                </div>
              </div>

              {/* Textarea */}
              <textarea
                placeholder="Share a startup milestone, question, or innovation update with the founder network..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                rows={4}
                autoFocus
                className="w-full text-xs bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white rounded-[10px] p-3 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
              />

              {/* Visibility Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Post Visibility
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedVisibility("PUBLIC")}
                    className={cn(
                      "flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer text-center",
                      selectedVisibility === "PUBLIC"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500"
                        : "border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-zinc-700"
                    )}
                  >
                    <Globe className="h-4 w-4 mb-1" />
                    <span>Public</span>
                    <span className="text-[9px] font-normal text-slate-400 mt-0.5">Visible to all</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedVisibility("PROTECTED")}
                    className={cn(
                      "flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer text-center",
                      selectedVisibility === "PROTECTED"
                        ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500"
                        : "border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-zinc-700"
                    )}
                  >
                    <ShieldCheck className="h-4 w-4 mb-1" />
                    <span>Protected</span>
                    <span className="text-[9px] font-normal text-slate-400 mt-0.5">Auth / Hub members</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedVisibility("PRIVATE")}
                    className={cn(
                      "flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer text-center",
                      selectedVisibility === "PRIVATE"
                        ? "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500"
                        : "border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-zinc-700"
                    )}
                  >
                    <Lock className="h-4 w-4 mb-1" />
                    <span>Private</span>
                    <span className="text-[9px] font-normal text-slate-400 mt-0.5">Only author</span>
                  </button>
                </div>
              </div>

              {/* Optional Community Hub Selection */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Community Hub (Optional)</span>
                  {selectedCommunityId && (
                    <button
                      type="button"
                      onClick={() => setSelectedCommunityId("")}
                      className="text-[10px] text-emerald-500 hover:underline cursor-pointer"
                    >
                      Clear Hub
                    </button>
                  )}
                </label>
                <select
                  value={selectedCommunityId}
                  onChange={(e) => setSelectedCommunityId(e.target.value)}
                  className="w-full h-9 text-xs bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white rounded-[8px] px-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">General Ecosystem Feed (No Hub)</option>
                  {communities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.membersCount || 1} members)
                    </option>
                  ))}
                </select>
              </div>

              {/* Attachment Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <ImageIcon className="h-3.5 w-3.5 text-slate-400" /> Image / Media URL (Optional)
                </label>
                <Input
                  placeholder="Paste image or media link..."
                  value={mediaUrlInput}
                  onChange={(e) => setMediaUrlInput(e.target.value)}
                  className="h-8 text-xs bg-slate-50 dark:bg-zinc-900/90 border-slate-200 dark:border-zinc-800 rounded-[8px]"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPostModalOpen(false)}
                  className="text-xs font-bold rounded-[8px] h-9 px-4 border-slate-200 dark:border-zinc-800 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleCreatePostSubmit}
                  disabled={!postContent.trim() || createPostMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-[8px] h-9 px-5 cursor-pointer shadow-sm"
                >
                  {createPostMutation.isPending ? "Publishing..." : "Publish Post"}
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── EDIT POST MODAL ─────────────────────────────────────────────── */}
      {editingPost && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-lg rounded-[16px] border border-slate-200/80 dark:border-zinc-700/60 bg-white/80 dark:bg-[#0E1113]/85 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.4)] overflow-hidden">
            <CardContent className="p-5 space-y-4">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Pencil className="h-5 w-5 text-emerald-500" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Edit Post
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingPost(null)
                    setEditPostError(null)
                  }}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Error Alert */}
              {editPostError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{editPostError}</span>
                </div>
              )}

              {/* Author Info */}
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 rounded-[10px]">
                  <AvatarFallback className="bg-slate-900 text-white font-bold text-xs">
                    {getInitials(currentUser.displayName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {currentUser.displayName}
                    </span>
                    <VerificationBadge level={currentUser.verificationLevel || "GOLD"} />
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Editing post as author
                  </span>
                </div>
              </div>

              {/* Textarea */}
              <textarea
                placeholder="Update your post content..."
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={4}
                autoFocus
                className="w-full text-xs bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white rounded-[10px] p-3 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
              />

              {/* Visibility Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Post Visibility
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditVisibility("PUBLIC")}
                    className={cn(
                      "flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer text-center",
                      editVisibility === "PUBLIC"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500"
                        : "border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-zinc-700"
                    )}
                  >
                    <Globe className="h-4 w-4 mb-1" />
                    <span>Public</span>
                    <span className="text-[9px] font-normal text-slate-400 mt-0.5">Visible to all</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditVisibility("PROTECTED")}
                    className={cn(
                      "flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer text-center",
                      editVisibility === "PROTECTED"
                        ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500"
                        : "border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-zinc-700"
                    )}
                  >
                    <ShieldCheck className="h-4 w-4 mb-1" />
                    <span>Protected</span>
                    <span className="text-[9px] font-normal text-slate-400 mt-0.5">Auth / Hub members</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditVisibility("PRIVATE")}
                    className={cn(
                      "flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer text-center",
                      editVisibility === "PRIVATE"
                        ? "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500"
                        : "border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-zinc-700"
                    )}
                  >
                    <Lock className="h-4 w-4 mb-1" />
                    <span>Private</span>
                    <span className="text-[9px] font-normal text-slate-400 mt-0.5">Only author</span>
                  </button>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingPost(null)
                    setEditPostError(null)
                  }}
                  className="text-xs font-bold rounded-[8px] h-9 px-4 border-slate-200 dark:border-zinc-800 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleEditPostSubmit}
                  disabled={!editContent.trim() || updatePostMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-[8px] h-9 px-5 cursor-pointer shadow-sm"
                >
                  {updatePostMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── CREATE COMMUNITY MODAL ─────────────────────────────────────── */}
      {isCreateCommunityModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-lg rounded-[16px] border border-slate-200/80 dark:border-zinc-700/60 bg-white/80 dark:bg-[#0E1113]/85 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.4)] overflow-hidden">
            <CardContent className="p-5 space-y-4">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-500" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Create Ecosystem Hub
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateCommunityModalOpen(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Creator / Owner Info */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800">
                <Avatar className="h-9 w-9 rounded-[8px]">
                  <AvatarFallback className="bg-slate-900 text-white font-bold text-xs">
                    {getInitials(currentUser.displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {currentUser.displayName}
                    </span>
                    <Badge className="text-[9px] bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-1 py-0 font-extrabold uppercase">
                      Owner
                    </Badge>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    You will be recorded as the founding owner and initial member of this hub.
                  </p>
                </div>
              </div>

              {/* Error Alert */}
              {createCommunityError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{createCommunityError}</span>
                </div>
              )}

              {/* Community Name Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Community / Hub Name
                </label>
                <Input
                  placeholder="e.g. Quantum AI Founders Syndicate"
                  value={commName}
                  onChange={(e) => setCommName(e.target.value)}
                  autoFocus
                  className="h-9 text-xs bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white rounded-[8px]"
                />
              </div>

              {/* Category & Privacy */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Sector Category
                  </label>
                  <select
                    value={commCategory}
                    onChange={(e) => setCommCategory(e.target.value)}
                    className="w-full h-9 text-xs bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white rounded-[8px] px-2.5 focus:outline-none"
                  >
                    <option value="AI & ML">AI & Machine Learning</option>
                    <option value="Fintech">Fintech & Banking</option>
                    <option value="CleanTech">CleanTech & Energy</option>
                    <option value="SaaS">B2B Enterprise SaaS</option>
                    <option value="BioTech">BioTech & Health</option>
                    <option value="Web3">Web3 & Crypto</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Access Privacy
                  </label>
                  <select
                    value={commIsPrivate ? "private" : "public"}
                    onChange={(e) => setCommIsPrivate(e.target.value === "private")}
                    className="w-full h-9 text-xs bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white rounded-[8px] px-2.5 focus:outline-none"
                  >
                    <option value="public">Public (Open to Network)</option>
                    <option value="private">Private (Invite Only)</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Description & Purpose
                </label>
                <textarea
                  placeholder="Describe the mission, member eligibility, and topics of this hub..."
                  value={commDesc}
                  onChange={(e) => setCommDesc(e.target.value)}
                  rows={3}
                  className="w-full text-xs bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white rounded-[8px] p-3 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateCommunityModalOpen(false)}
                  className="text-xs font-bold rounded-[8px] h-9 px-4 border-slate-200 dark:border-zinc-800 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleCreateCommunitySubmit}
                  disabled={!commName.trim() || createCommunityMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-[8px] h-9 px-5 cursor-pointer shadow-sm"
                >
                  {createCommunityMutation.isPending ? "Creating..." : "Create Hub"}
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>
      )}
      {/* ─── MOBILE SLIDE-OVER MENU DRAWER MODAL ───────────────────────── */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/70 backdrop-blur-xs lg:hidden animate-in fade-in duration-200">
          <div className="w-[280px] h-full bg-white dark:bg-[#0E1113] border-r border-slate-200 dark:border-zinc-800 p-5 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-200 shadow-2xl">
            
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-zinc-950 font-black text-xs flex items-center justify-center">
                    WQ
                  </div>
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">Community Menu</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Section */}
              <div className="space-y-1">
                <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 pb-1">Navigation Feeds</p>
                <button
                  onClick={() => { setActiveTab("home"); setFeedFilter("all"); setIsMobileMenuOpen(false) }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-xs font-bold transition-all cursor-pointer",
                    activeTab === "home" && feedFilter === "all" ? "bg-[#1A282D] text-white" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                  )}
                >
                  <Home className="h-4 w-4" /> Home Feed
                </button>
                <button
                  onClick={() => { setActiveTab("home"); setFeedFilter("companies"); setIsMobileMenuOpen(false) }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-xs font-bold transition-all cursor-pointer",
                    activeTab === "home" && feedFilter === "companies" ? "bg-[#1A282D] text-white" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                  )}
                >
                  <Building2 className="h-4 w-4" /> Companies Post
                </button>
                <button
                  onClick={() => { setActiveTab("home"); setFeedFilter("ventures"); setIsMobileMenuOpen(false) }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-xs font-bold transition-all cursor-pointer",
                    activeTab === "home" && feedFilter === "ventures" ? "bg-[#1A282D] text-white" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                  )}
                >
                  <Rocket className="h-4 w-4" /> Ventures Post
                </button>
                <button
                  onClick={() => { setActiveTab("home"); setFeedFilter("my_posts"); setIsMobileMenuOpen(false) }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-xs font-bold transition-all cursor-pointer",
                    activeTab === "home" && feedFilter === "my_posts" ? "bg-[#1A282D] text-white" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                  )}
                >
                  <FileText className="h-4 w-4" /> My Posts
                </button>
                <button
                  onClick={() => { setActiveTab("communities"); setCommunitySubFilter("all"); setIsMobileMenuOpen(false) }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-xs font-bold transition-all cursor-pointer",
                    activeTab === "communities" && communitySubFilter === "all" ? "bg-[#1A282D] text-white" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                  )}
                >
                  <Users className="h-4 w-4" /> Popular Hubs
                </button>
                <button
                  onClick={() => { setActiveTab("communities"); setCommunitySubFilter("my_communities"); setIsMobileMenuOpen(false) }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-xs font-bold transition-all cursor-pointer",
                    activeTab === "communities" && communitySubFilter === "my_communities" ? "bg-[#1A282D] text-white" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                  )}
                >
                  <CheckCircle2 className="h-4 w-4" /> My Communities
                </button>
                <button
                  onClick={() => { setActiveTab("people"); setIsMobileMenuOpen(false) }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-xs font-bold transition-all cursor-pointer",
                    activeTab === "people" ? "bg-[#1A282D] text-white" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                  )}
                >
                  <Compass className="h-4 w-4" /> Founders & Network
                </button>
                <button
                  onClick={() => { setActiveTab("news"); setIsMobileMenuOpen(false) }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-xs font-bold transition-all cursor-pointer",
                    activeTab === "news" ? "bg-[#1A282D] text-white" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                  )}
                >
                  <Newspaper className="h-4 w-4" /> Ecosystem News
                </button>
                <button
                  onClick={() => { navigate("/profile"); setIsMobileMenuOpen(false) }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-xs font-bold transition-all cursor-pointer text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                >
                  <User className="h-4 w-4" /> Profile
                </button>
              </div>

              {/* Ecosystem & Tools Section */}
              <div className="space-y-1 pt-3 border-t border-slate-200 dark:border-zinc-800">
                <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 pb-1">Ecosystem Tools</p>
                <button onClick={() => { navigate("/markets"); setIsMobileMenuOpen(false) }} className="w-full flex items-center gap-3 px-3 py-2 rounded-[8px] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer">
                  <TrendingUp className="h-4 w-4" /> Markets & Analytics
                </button>
                <button onClick={() => { navigate("/community-guidelines"); setIsMobileMenuOpen(false) }} className="w-full flex items-center gap-3 px-3 py-2 rounded-[8px] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer">
                  <FileText className="h-4 w-4" /> Community Policy
                </button>
                <button onClick={() => { navigate("/terms"); setIsMobileMenuOpen(false) }} className="w-full flex items-center gap-3 px-3 py-2 rounded-[8px] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer">
                  <BookOpen className="h-4 w-4" /> Community Rules
                </button>
                <button onClick={() => { navigate("/privacy"); setIsMobileMenuOpen(false) }} className="w-full flex items-center gap-3 px-3 py-2 rounded-[8px] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer">
                  <Lock className="h-4 w-4" /> Privacy Policy
                </button>
              </div>
            </div>

          </div>
          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
        </div>
      )}

      {/* ─── Selected News Article Factsheet Modal ───────────────────────── */}
      {selectedNewsArticle && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[88vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-zinc-800 shrink-0 bg-white dark:bg-zinc-900">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-[#00d09c] flex items-center justify-center font-bold shrink-0">
                  <Newspaper className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-[#00d09c] block">
                    Verified Corporate Dispatch
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                    {selectedNewsArticle.source}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedNewsArticle(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200">
                  {selectedNewsArticle.ticker ? `$${selectedNewsArticle.ticker}` : "ECOSYSTEM"}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-[#00d09c]">
                  {selectedNewsArticle.category}
                </span>
                {selectedNewsArticle.impactMetric && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    {selectedNewsArticle.impactMetric}
                  </span>
                )}
                <span className="text-[11px] text-slate-400 flex items-center gap-1 ml-auto">
                  <Clock className="h-3 w-3" /> {selectedNewsArticle.publishedAt}
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                {selectedNewsArticle.title}
              </h2>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                {selectedNewsArticle.snippet}
              </div>

              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Statutory Filing Verification
                </h4>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px] bg-slate-100/60 dark:bg-zinc-800/20 p-3 rounded-lg border border-slate-200/60 dark:border-zinc-800">
                  This release has been verified against Delaware statutory filing records and certified institutional disclosures on the White-Quantex intelligence clearing engine.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0 flex items-center justify-between gap-2">
              <button
                onClick={() => setSelectedNewsArticle(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer"
              >
                Close
              </button>

              {selectedNewsArticle.ticker && (
                <button
                  onClick={() => {
                    navigate(`/companies/${selectedNewsArticle.ticker}`)
                    setSelectedNewsArticle(null)
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-extrabold bg-[#00d09c] hover:bg-[#00b888] text-slate-950 transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#00d09c]/25 active:scale-95"
                >
                  <span>Open Company Profile</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Member / Entity Interactive Profile Modal */}
      <MemberProfileModal
        member={inspectedMember}
        isOpen={Boolean(inspectedMember)}
        onClose={() => setInspectedMember(null)}
        isFollowing={Boolean(
          inspectedMember && (
            followedUsersMap[inspectedMember.id] ||
            (inspectedMember.username && followedUsersMap[inspectedMember.username])
          )
        )}
        onToggleFollow={toggleFollowUser}
      />
    </div>
  )
}
