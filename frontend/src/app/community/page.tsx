import React, { useState, useEffect, useRef } from "react"
import {
  Home, Search, Users, MessageSquare, PlusSquare, Heart, Bookmark, Share2,
  Sparkles, TrendingUp, Lock, FileText, UserCheck, BookOpen, Bell,
  ShieldCheck, CheckCircle2, UserPlus, MessageCircle, ArrowUpRight, Filter,
  PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Menu, X, Image as ImageIcon, Compass
} from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router"
import { Card, CardContent } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Badge } from "../../components/ui/badge"
import { VerificationBadge } from "../../components/shared/VerificationBadge"
import { FounderCard } from "../../components/shared/FounderCard"
import { InvestorCard } from "../../components/shared/InvestorCard"
import { useAuthStore } from "../../stores/auth-store"
import { communityService } from "../../services/community/communityService"
import { formatNumber, getInitials, cn } from "../../lib/utils"
import type { Post } from "../../types"

// Sample Notifications Data
const SAMPLE_NOTIFICATIONS = [
  {
    id: "notif-1",
    type: "LIKE",
    actor: { name: "Elena Voss", avatar: "", role: "Founder @ NovaMind AI" },
    message: "liked your post 'Quantum LLM v2.4 benchmark results released'.",
    time: "2m ago",
    read: false,
    icon: Heart,
    iconColor: "text-white bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700",
  },
  {
    id: "notif-2",
    type: "FOLLOW",
    actor: { name: "Sarah Chen", avatar: "", role: "General Partner @ Sequoia" },
    message: "started following your founder profile.",
    time: "15m ago",
    read: false,
    icon: UserPlus,
    iconColor: "text-white bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700",
  },
  {
    id: "notif-3",
    type: "VENTURE",
    actor: { name: "VerdeGrid Energy", avatar: "", role: "CleanTech Startup" },
    message: "published a new fundraising campaign: $3.5M Series A.",
    time: "1h ago",
    read: false,
    icon: TrendingUp,
    iconColor: "text-white bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700",
  },
  {
    id: "notif-4",
    type: "VERIFICATION",
    actor: { name: "White Quantex Trust", avatar: "", role: "System Security" },
    message: "Your profile verification level upgraded to Gold Verified.",
    time: "3h ago",
    read: true,
    icon: ShieldCheck,
    iconColor: "text-white bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700",
  },
  {
    id: "notif-5",
    type: "COMMENT",
    actor: { name: "David Kim", avatar: "", role: "Managing Director @ Founders Fund" },
    message: "commented: 'Fantastic traction on the enterprise pilot!'",
    time: "5h ago",
    read: true,
    icon: MessageCircle,
    iconColor: "text-white bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700",
  },
]

// Fallback Default Posts
const DEFAULT_POSTS: Post[] = [
  {
    id: "post-demo-1",
    wqAuthorId: "u-2",
    author: {
      wqUserId: "u-2",
      displayName: "Elena Voss",
      username: "elenavoss",
      headline: "Founder & CEO @ NovaMind AI",
      verificationLevel: "GOLD",
      avatarUrl: "",
    },
    content: "Excited to share that NovaMind AI has officially crossed 100k daily active inference requests! Huge milestone for our engineering team. Thank you to the White Quantex founder network for early feedback during our closed beta.",
    postType: "IMAGE",
    visibility: "PUBLIC",
    hashtags: ["AI", "Milestone"],
    mentions: [],
    likesCount: 142,
    commentsCount: 28,
    sharesCount: 12,
    bookmarksCount: 34,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isLiked: false,
    isBookmarked: false,
    mediaUrls: ["https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80"],
  },
  {
    id: "post-demo-2",
    wqAuthorId: "u-3",
    author: {
      wqUserId: "u-3",
      displayName: "Marcus Klein",
      username: "marcusklein",
      headline: "CEO @ VerdeGrid Energy",
      verificationLevel: "SILVER",
      avatarUrl: "",
    },
    content: "We're expanding our smart grid pilot across 5 European municipal hubs! Looking to connect with B2B utility partners and embedded software engineers. Feel free to connect or drop a message.",
    postType: "TEXT",
    visibility: "PUBLIC",
    hashtags: ["CleanTech"],
    mentions: [],
    likesCount: 89,
    commentsCount: 14,
    sharesCount: 5,
    bookmarksCount: 18,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isLiked: false,
    isBookmarked: false,
    mediaUrls: [],
  },
  {
    id: "post-demo-3",
    wqAuthorId: "u-4",
    author: {
      wqUserId: "u-4",
      displayName: "Sarah Chen",
      username: "sarahchen",
      headline: "General Partner @ Sequoia Capital",
      verificationLevel: "PLATINUM",
      avatarUrl: "",
    },
    content: "Key takeaway from our latest Venture Report: AI infrastructure startups focusing on vertical domain compliance are outperforming horizontal models 3x in enterprise retention. What are you building in this space?",
    postType: "TEXT",
    visibility: "PUBLIC",
    hashtags: ["VentureCapital"],
    mentions: [],
    likesCount: 230,
    commentsCount: 45,
    sharesCount: 29,
    bookmarksCount: 60,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isLiked: true,
    isBookmarked: true,
    mediaUrls: [],
  },
]

export default function CommunityPage() {
  const navigate = useNavigate()
  const { user: authUser } = useAuthStore()
  const currentUser = authUser || {
    id: "u-1",
    displayName: "User",
    email: null,
    verificationLevel: null,
    trustScore: 0,
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
  const [selectedVisibility] = useState<string>("PUBLIC")
  const [mediaUrlInput, setMediaUrlInput] = useState("")

  // Tabs & Filters
  const [isPostModalOpen, setIsPostModalOpen] = useState(false)
  const [isCreateCommunityModalOpen, setIsCreateCommunityModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [commName, setCommName] = useState("")
  const [commDesc, setCommDesc] = useState("")
  const [commCategory, setCommCategory] = useState("AI & ML")
  const [commIsPrivate, setCommIsPrivate] = useState(false)

  const [activeTab, setActiveTab] = useState<"home" | "communities" | "people">("home")
  const [peopleSubFilter, setPeopleSubFilter] = useState<"all" | "founders" | "investors">("all")
  const [notifFilter, setNotifFilter] = useState<"all" | "mentions" | "activity">("all")

  // Notifications List State
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS)

  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null)

  // Local Overrides
  const [likedPostsMap, setLikedPostsMap] = useState<Record<string, boolean>>({})
  const [likesDeltaMap, setLikesDeltaMap] = useState<Record<string, number>>({})
  const [bookmarkedPostsMap, setBookmarkedPostsMap] = useState<Record<string, boolean>>({})
  const [joinedCommunities, setJoinedCommunities] = useState<Record<string, boolean>>({
    "comm-1": true,
    "comm-3": true,
  })

  useEffect(() => {
    const handleOpenModal = () => setIsPostModalOpen(true)
    const handleToggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev)
    const handleTabChange = (e: any) => {
      if (e.detail && (e.detail === "home" || e.detail === "communities" || e.detail === "people")) {
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
      if (tabParam === "home" || tabParam === "communities" || tabParam === "people") {
        setActiveTab(tabParam)
      }
    }

    return () => {
      window.removeEventListener("open-create-post-modal", handleOpenModal)
      window.removeEventListener("toggle-community-mobile-menu", handleToggleMobileMenu)
      window.removeEventListener("set-community-tab", handleTabChange)
    }
  }, [])

  // Queries
  const { data: postsData, isLoading: isPostsLoading } = useQuery({
    queryKey: ["community-posts"],
    queryFn: () => communityService.getFeed(0, 50),
    staleTime: 5_000,
  })

  const apiPosts: Post[] = postsData?.content ?? []
  const posts: Post[] = apiPosts.length > 0 ? apiPosts : DEFAULT_POSTS

  const { data: communitiesData } = useQuery({
    queryKey: ["community-hubs"],
    queryFn: () => communityService.getCommunities(),
    staleTime: 10_000,
  })

  const communities = communitiesData ?? [
    { id: "comm-1", name: "AI & ML Innovators", description: "Deep learning, LLMs, and enterprise AI founders.", memberCount: 3420 },
    { id: "comm-2", name: "Fintech & DeFi Hub", description: "Payment infrastructure and blockchain innovation.", memberCount: 2890 },
    { id: "comm-3", name: "CleanTech Pioneers", description: "Decentralized energy grids and carbon solutions.", memberCount: 1750 },
    { id: "comm-4", name: "SaaS Scaleups", description: "B2B SaaS growth strategies and ARR milestones.", memberCount: 4120 },
  ]

  // Mutations
  const createPostMutation = useMutation({
    mutationFn: (payload: any) => communityService.createPost(payload),
    onSuccess: () => {
      setPostContent("")
      setMediaUrlInput("")
      setIsPostModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ["community-posts"] })
    },
  })

  const createCommunityMutation = useMutation({
    mutationFn: (payload: any) => communityService.createCommunity(payload),
    onSuccess: (newComm) => {
      setIsCreateCommunityModalOpen(false)
      setCommName("")
      setCommDesc("")
      queryClient.invalidateQueries({ queryKey: ["community-hubs"] })
      if (newComm?.id) {
        setJoinedCommunities((prev) => ({ ...prev, [newComm.id]: true }))
      }
    },
    onError: () => {
      const newId = `comm-custom-${Date.now()}`
      setJoinedCommunities((prev) => ({ ...prev, [newId]: true }))
      setIsCreateCommunityModalOpen(false)
      setCommName("")
      setCommDesc("")
    },
  })

  const handleCreateCommunitySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!commName.trim()) return
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

    likeMutation.mutate({ postId, isLiked: isCurrentlyLiked })
  }

  const handleToggleBookmark = (postId: string, currentIsBookmarked: boolean) => {
    const isCurrentlyBookmarked = bookmarkedPostsMap[postId] !== undefined ? bookmarkedPostsMap[postId] : currentIsBookmarked
    const newIsBookmarked = !isCurrentlyBookmarked

    setBookmarkedPostsMap((prev) => ({ ...prev, [postId]: newIsBookmarked }))
    bookmarkMutation.mutate({ postId, isBookmarked: isCurrentlyBookmarked })
  }

  const handleCreatePostSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!postContent.trim()) return
    createPostMutation.mutate({
      content: postContent.trim(),
      postType: selectedPostType,
      visibility: selectedVisibility,
      mediaUrls: mediaUrlInput ? [mediaUrlInput.trim()] : undefined,
    })
  }

  const toggleJoinCommunity = (commId: string) => {
    setJoinedCommunities((prev) => ({ ...prev, [commId]: !prev[commId] }))
  }

  const markAllNotifsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const filteredPosts = posts.filter((p) => {
    if (rightSearchQuery.trim()) {
      const q = rightSearchQuery.toLowerCase()
      return (
        p.content.toLowerCase().includes(q) ||
        p.author?.displayName?.toLowerCase().includes(q) ||
        p.postType?.toLowerCase().includes(q)
      )
    }
    return true
  })

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

        {/* Center Section: Tabs (For You | Communities | Founders & Network) */}
        <div className="flex items-center gap-6 h-full">
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
        </div>

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
                onClick={() => setActiveTab("home")}
                title="Home"
                className={cn(
                  "w-full flex items-center text-[13.5px] font-bold transition-all cursor-pointer",
                  isSidebarOpen ? "gap-3 px-3 py-2.5 rounded-[10px]" : "justify-center p-2.5 rounded-[8px]",
                  activeTab === "home"
                    ? "bg-[#1A282D] dark:bg-[#1A282D] text-white dark:text-white font-extrabold shadow-2xs"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800/80"
                )}
              >
                <Home className="h-[18px] w-[18px] shrink-0 text-slate-700 dark:text-white" />
                {isSidebarOpen && <span className="truncate">Home</span>}
              </button>

              <button
                onClick={() => setActiveTab("communities")}
                title="Community"
                className={cn(
                  "w-full flex items-center text-[13.5px] font-bold transition-all cursor-pointer",
                  isSidebarOpen ? "gap-3 px-3 py-2.5 rounded-[10px]" : "justify-center p-2.5 rounded-[8px]",
                  activeTab === "communities"
                    ? "bg-[#1A282D] dark:bg-[#1A282D] text-white dark:text-white font-extrabold shadow-2xs"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800/80"
                )}
              >
                <Users className="h-[18px] w-[18px] shrink-0 text-slate-700 dark:text-white" />
                {isSidebarOpen && <span className="truncate">Popular Hubs</span>}
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
              <div className="flex items-center justify-between p-4 rounded-[10px] bg-white/90 dark:bg-[#121212] backdrop-blur-xl border border-slate-200 dark:border-zinc-800 shadow-xs">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-700 dark:text-white" /> Ecosystem Community Hubs
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Join sector-specific hubs, syndicate groups, and founder circles.</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setIsCreateCommunityModalOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-[8px] h-8 px-3 cursor-pointer shrink-0 flex items-center gap-1.5 shadow-sm"
                >
                  <PlusSquare className="h-3.5 w-3.5" /> + Create Hub
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {communities.filter((comm: any) =>
                  !rightSearchQuery.trim() ||
                  comm.name?.toLowerCase().includes(rightSearchQuery.toLowerCase()) ||
                  comm.description?.toLowerCase().includes(rightSearchQuery.toLowerCase())
                ).map((comm: any) => {
                  const isJoined = Boolean(joinedCommunities[comm.id])
                  return (
                    <Card key={comm.id} className="rounded-[10px] border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-[#121212] p-4 flex flex-col justify-between space-y-3 hover:border-emerald-500/40 transition-colors shadow-xs">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="h-9 w-9 rounded-[8px] bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-white flex items-center justify-center font-bold text-sm shrink-0">
                            <Users className="h-5 w-5 text-slate-700 dark:text-white" />
                          </div>
                          <Badge className="text-[10px] bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 border-none font-semibold">
                            {formatNumber(comm.memberCount || comm.membersCount || 1000)} Members
                          </Badge>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">{comm.name}</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">{comm.description}</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Community Hub</span>
                        <Button
                          size="sm"
                          variant={isJoined ? "outline" : "default"}
                          onClick={() => toggleJoinCommunity(comm.id)}
                          className={cn(
                            "h-7 px-3 text-[11px] font-bold rounded-[8px] cursor-pointer",
                            isJoined
                              ? "border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-300"
                              : "bg-emerald-600 hover:bg-emerald-700 text-white"
                          )}
                        >
                          {isJoined ? "Joined" : "+ Join Hub"}
                        </Button>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          ) : activeTab === "people" ? (
            <div className="space-y-4 p-3 sm:p-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-slate-700 dark:text-white" /> Ecosystem People & Network
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Connect with verified founders, investors, and startup leaders.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPeopleSubFilter("all")}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border",
                      peopleSubFilter === "all"
                        ? "bg-[#10B981] text-white border-[#10B981]"
                        : "bg-white text-slate-700 dark:bg-zinc-900 dark:text-slate-300 border-slate-200 dark:border-zinc-800 hover:border-[#10B981]"
                    )}
                  >
                    All People
                  </button>
                  <button
                    onClick={() => setPeopleSubFilter("founders")}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border",
                      peopleSubFilter === "founders"
                        ? "bg-[#10B981] text-white border-[#10B981]"
                        : "bg-white text-slate-700 dark:bg-zinc-900 dark:text-slate-300 border-slate-200 dark:border-zinc-800 hover:border-[#10B981]"
                    )}
                  >
                    Founders
                  </button>
                  <button
                    onClick={() => setPeopleSubFilter("investors")}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border",
                      peopleSubFilter === "investors"
                        ? "bg-[#10B981] text-white border-[#10B981]"
                        : "bg-white text-slate-700 dark:bg-zinc-900 dark:text-slate-300 border-slate-200 dark:border-zinc-800 hover:border-[#10B981]"
                    )}
                  >
                    Investors
                  </button>
                </div>
              </div>

              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                {[
                  { id: "f1", name: "Elena Voss", headline: "Founder @ NovaMind AI", location: "San Francisco, CA", followersCount: 14200, role: "FOUNDER", verificationLevel: "GOLD" },
                  { id: "f2", name: "Marcus Klein", headline: "CEO @ VerdeGrid Energy", location: "Berlin, Germany", followersCount: 8900, role: "FOUNDER", verificationLevel: "SILVER" },
                  { id: "i1", name: "Sarah Chen", headline: "General Partner @ Sequoia Capital", location: "Menlo Park, CA", followersCount: 24500, role: "INVESTOR", verificationLevel: "PLATINUM" },
                  { id: "i2", name: "David Kim", headline: "Managing Director @ Founders Fund", location: "New York, NY", followersCount: 18900, role: "INVESTOR", verificationLevel: "GOLD" },
                ].filter((person) => {
                  if (peopleSubFilter === "founders") return person.role === "FOUNDER"
                  if (peopleSubFilter === "investors") return person.role === "INVESTOR"
                  return true
                }).map((person, i) => (
                  <div key={person.id}>
                    {person.role === "FOUNDER" ? (
                      <FounderCard founder={person} index={i} />
                    ) : (
                      <InvestorCard investor={person} index={i} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* FEED POST CARDS */}
              {isPostsLoading ? (
                <div className="py-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4 animate-spin text-slate-700 dark:text-white" /> Loading feed...
                </div>
              ) : filteredPosts.length === 0 ? (
                <Card className="rounded-[10px] border-slate-200 dark:border-zinc-800 dark:bg-[#121212]">
                  <CardContent className="py-12 text-center text-xs text-slate-500">
                    No posts found matching search criteria.
                  </CardContent>
                </Card>
              ) : (
                filteredPosts.map((post) => {
                  const isLiked = likedPostsMap[post.id] !== undefined ? likedPostsMap[post.id] : Boolean(post.isLiked)
                  const likesCount = Math.max(0, (post.likesCount || 0) + (likesDeltaMap[post.id] || 0))
                  const isBookmarked = bookmarkedPostsMap[post.id] !== undefined ? bookmarkedPostsMap[post.id] : Boolean(post.isBookmarked)

                  return (
                    <Card key={post.id} className="rounded-none sm:rounded-[14px] border-x-0 border-t-0 border-b border-slate-200 dark:border-white/20 sm:dark:border-zinc-800/80 bg-transparent sm:bg-white/70 dark:sm:bg-[#121618]/70 backdrop-blur-xl shadow-none sm:shadow-[0_8px_32px_0_rgba(0,0,0,0.04)] dark:sm:shadow-[0_8px_32px_0_rgba(0,0,0,0.25)] hover:border-emerald-500/40 transition-all duration-300 mb-0 sm:mb-4">
                      <CardContent className="p-4 sm:p-5 space-y-4">
                        
                        {/* Post Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 rounded-[10px]">
                              <AvatarImage src={post.author?.avatarUrl} alt={post.author?.displayName} />
                              <AvatarFallback className="bg-slate-900 text-white font-bold text-xs rounded-[10px]">
                                {getInitials(post.author?.displayName || "User")}
                              </AvatarFallback>
                            </Avatar>

                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-900 dark:text-white">
                                  {post.author?.displayName || "Alexander Vance"}
                                </span>
                                <VerificationBadge level={post.author?.verificationLevel || "GOLD"} />
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">{post.author?.headline || "Founder @ Quantum Systems"}</p>
                            </div>
                          </div>

                          <Badge variant="outline" className="text-[10px] font-bold bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-slate-300 rounded-[6px]">
                            {post.postType || "POST"}
                          </Badge>
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
                              onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                              className="flex items-center gap-1.5 font-bold text-slate-500 dark:text-slate-400 hover:text-emerald-500 transition-colors text-xs cursor-pointer"
                            >
                              <MessageSquare className="h-4 w-4" />
                              <span>{post.commentsCount || 0}</span>
                            </button>

                            {/* Share */}
                            <button
                              onClick={() => alert("Post link copied!")}
                              className="flex items-center gap-1.5 font-bold text-slate-500 dark:text-slate-400 hover:text-emerald-500 transition-colors text-xs cursor-pointer"
                            >
                              <Share2 className="h-4 w-4" />
                              <span>Share</span>
                            </button>
                          </div>

                          {/* Bookmark */}
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
                      </CardContent>
                    </Card>
                  )
                })
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
                {notifications
                  .filter((n) => {
                    if (notifFilter === "mentions") return n.type === "COMMENT"
                    if (notifFilter === "activity") return n.type === "LIKE" || n.type === "FOLLOW"
                    return true
                  })
                  .map((notif) => {
                    const IconComp = notif.icon
                    return (
                      <div
                        key={notif.id}
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
                            <span className="font-bold text-slate-900 dark:text-white">{notif.actor.name} </span>
                            {notif.message}
                          </p>
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] text-slate-400 font-medium">{notif.time}</span>
                            {!notif.read && (
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-white"></span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
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
                  onClick={() => setIsPostModalOpen(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

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
                    Publishing to Ecosystem Community
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
                  onClick={() => setIsCreateCommunityModalOpen(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

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
                  onClick={() => { setActiveTab("home"); setIsMobileMenuOpen(false) }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-xs font-bold transition-all cursor-pointer",
                    activeTab === "home" ? "bg-[#1A282D] text-white" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                  )}
                >
                  <Home className="h-4 w-4" /> For You Feed
                </button>
                <button
                  onClick={() => { setActiveTab("communities"); setIsMobileMenuOpen(false) }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-xs font-bold transition-all cursor-pointer",
                    activeTab === "communities" ? "bg-[#1A282D] text-white" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                  )}
                >
                  <Users className="h-4 w-4" /> Popular Hubs
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
    </div>
  )
}
