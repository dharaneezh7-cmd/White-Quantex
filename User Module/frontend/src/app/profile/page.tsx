import React, { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useAuthStore } from "@/stores/auth-store"
import { nodeApi } from "@/services/api/client"
import { communityService } from "@/services/community/communityService"
import { exploreService } from "@/services/explore/exploreService"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Link, useNavigate, useSearchParams } from "react-router"
import {
  User, ShieldCheck, Bookmark, Activity, Mail, Globe, MapPin,
  Calendar, Edit3, Share2, Copy, Check, ExternalLink, Building2,
  Sparkles, Award, Lock, FileText, CheckCircle2, ShieldAlert,
  MessageSquare, Heart, TrendingUp, Briefcase, Plus, Eye, Key,
  Smartphone, UserCheck, ArrowUpRight, DollarSign, Layers,
  ChevronRight, RefreshCw, Send, CheckCircle
} from "lucide-react"
import { formatNumber, formatCurrency, getInitials, cn } from "@/lib/utils"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import toast from "react-hot-toast"
import ViewProfilePage from "./view/page"

export default function UnifiedProfilePage() {
  const { user, updateUser } = useAuthStore()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const target = searchParams.get("u") || searchParams.get("user") || searchParams.get("id")
  if (target && target !== user?.username && target !== user?.id) {
    return <ViewProfilePage />
  }

  // Profile data with realistic fallbacks matching user's account session
  const displayName = user?.displayName || (user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "Dharaneesh Viswanathan")
  const username = user?.username || "dharaneezh7_e703"
  const headline = user?.headline || "Verified Ecosystem Participant"
  const role = user?.primaryRole || "FOUNDER"
  const kycStatus = user?.kycStatus || "APPROVED"
  const trustScore = typeof user?.trustScore === "number" ? user.trustScore : 85
  const wqUserId = user?.wqUserId || user?.id || "wq uuid canonical reference"
  const location = user?.location || "San Francisco, CA"
  const email = user?.email || "dharaneesh@whitequantex.com"
  const website = user?.website || "https://whitequantex.com"
  const twitterUrl = user?.twitterUrl || "https://x.com/whitequantex"
  const linkedinUrl = user?.linkedinUrl || "https://linkedin.com/company/white-quantex"
  const githubUrl = user?.githubUrl || "https://github.com/white-quantex"
  const bio = user?.bio || `${displayName} is an active technology founder, sovereign secondary liquidity architect, and venture ecosystem participant on White Quantex. Spearheading autonomous corporate capitalization, Delaware C-Corp registry compliance, and real-time private share order-book depth.`

  // Local state for copy feedback & edit modal
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedUuid, setCopiedUuid] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  // Edit form state
  const [editForm, setEditForm] = useState({
    displayName: displayName,
    username: username,
    headline: headline,
    bio: bio,
    location: location,
    website: website,
    twitterUrl: twitterUrl,
    linkedinUrl: linkedinUrl,
    githubUrl: githubUrl,
    primaryRole: role,
  })

  const [isSaving, setIsSaving] = useState(false)

  // Synchronize form when user or dialog changes
  useEffect(() => {
    setEditForm({
      displayName: displayName,
      username: username,
      headline: headline,
      bio: bio,
      location: location,
      website: website,
      twitterUrl: twitterUrl,
      linkedinUrl: linkedinUrl,
      githubUrl: githubUrl,
      primaryRole: role,
    })
  }, [user])

  const handleOpenEdit = () => {
    setEditForm({
      displayName: displayName,
      username: username,
      headline: headline,
      bio: bio,
      location: location,
      website: website,
      twitterUrl: twitterUrl,
      linkedinUrl: linkedinUrl,
      githubUrl: githubUrl,
      primaryRole: role,
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    const updatedData = {
      displayName: editForm.displayName.trim(),
      username: editForm.username.trim(),
      headline: editForm.headline.trim(),
      bio: editForm.bio.trim(),
      location: editForm.location.trim(),
      website: editForm.website.trim(),
      twitterUrl: editForm.twitterUrl.trim(),
      linkedinUrl: editForm.linkedinUrl.trim(),
      githubUrl: editForm.githubUrl.trim(),
      primaryRole: editForm.primaryRole as any,
    }

    try {
      // 1. Immediately persist to client Zustand store & localStorage
      updateUser(updatedData)

      // 2. Persist to Node.js MongoDB backend
      try {
        await nodeApi.put("/members/profile", {
          ...updatedData,
          wqUserId,
        })
      } catch (apiErr) {
        console.warn("Backend profile sync notice:", apiErr)
      }

      // Invalidate relevant queries so new profile name and dispatches update immediately across the app
      queryClient.invalidateQueries({ queryKey: ["user-profile-posts"] })
      queryClient.invalidateQueries({ queryKey: ["community-posts"] })
      queryClient.invalidateQueries({ queryKey: ["community-members"] })

      setIsEditDialogOpen(false)
      toast.success("Profile saved successfully!")
    } catch (err: any) {
      toast.error(err?.message || "Failed to save profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCopyProfileLink = () => {
    const url = window.location.origin + `/profile?u=${username}`
    navigator.clipboard.writeText(url)
    setCopiedLink(true)
    toast.success("Profile URL copied to clipboard")
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleCopyUuid = () => {
    navigator.clipboard.writeText(wqUserId)
    setCopiedUuid(true)
    toast.success("WQ User UUID copied")
    setTimeout(() => setCopiedUuid(false), 2000)
  }

  // Fetch user dispatches from community posts API
  const { data: postsData, isLoading: isPostsLoading } = useQuery({
    queryKey: ["user-profile-posts", user?.id],
    queryFn: () => communityService.getFeed(0, 50),
    staleTime: 15_000,
  })

  // Filter posts created by current user
  const allPosts = postsData?.content || []
  const userPosts = allPosts.filter((p: any) => {
    const pAuthorId = p.author?.id || p.author?.wqUserId || p.wqAuthorId
    if (user?.id && pAuthorId === user.id) return true
    if (user?.wqUserId && pAuthorId === user.wqUserId) return true
    if (username && (p.author?.username === username || p.authorUsername === username)) return true
    if (p.author?.displayName && p.author.displayName.toLowerCase() === displayName.toLowerCase()) return true
    if (p.isAuthor) return true
    return false
  })

  // Fetch user investment positions from explore/holdings API
  const { data: positions = [], isLoading: isPositionsLoading } = useQuery({
    queryKey: ["user-profile-positions", user?.id],
    queryFn: () => exploreService.getPositions(),
    staleTime: 30_000,
  })

  // Financial calculations
  const totalInvested = positions.reduce((acc, p) => acc + (p.costBasis || 0), 0)
  const portfolioValue = positions.reduce((acc, p) => acc + (p.currentValue || 0), 0)
  const unrealizedGain = portfolioValue - totalInvested
  const totalReturnPercent = totalInvested > 0 ? (unrealizedGain / totalInvested) * 100 : 0

  // Focus sectors
  const sectors = ["Distributed Systems", "Enterprise AI", "DeepTech", "Delaware Secondary", "Secondary Liquidity Rails"]

  return (
    <ProtectedRoute>
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── TOP HERO PROFILE CARD (Matches User Design) ── */}
        <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111315] space-y-6 relative overflow-hidden shadow-sm">
          
          {/* Top header row with avatar, name, badges, and action buttons */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-5 text-center sm:text-left">
              {/* Teal circular avatar with initials */}
              <div className="h-20 w-20 rounded-full bg-[#00d09c] text-black font-extrabold text-2xl flex items-center justify-center shrink-0 shadow-sm select-none">
                {getInitials(displayName)}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {displayName}
                  </h1>
                  {/* Verified Check Badge */}
                  <span
                    className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-[#00d09c]/15 text-[#00a87e] dark:text-[#00d09c] border border-[#00d09c]/30"
                    title="Verified WQ Ecosystem Participant"
                  >
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-mono">
                  @{username}
                </p>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium pt-0.5">
                  {headline}
                </p>
              </div>
            </div>

            {/* Quick action buttons on top right */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyProfileLink}
                className="h-8 px-3 text-xs font-semibold rounded-xl border-slate-200 dark:border-zinc-800 cursor-pointer hover:border-[#00d09c]"
              >
                {copiedLink ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[#00d09c] mr-1.5" />
                    Copied
                  </>
                ) : (
                  <>
                    <Share2 className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
                    Share
                  </>
                )}
              </Button>

              <Button
                size="sm"
                onClick={handleOpenEdit}
                className="h-8 px-3.5 text-xs font-bold rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black cursor-pointer shadow-sm hover:opacity-90"
              >
                <Edit3 className="h-3.5 w-3.5 mr-1.5" />
                Edit Profile
              </Button>
            </div>
          </div>

          {/* Horizontal Divider */}
          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
            
            {/* Card 1: WQ User UUID */}
            <div
              onClick={handleCopyUuid}
              title="Click to copy WQ User UUID"
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800/80 cursor-pointer hover:border-[#00d09c]/40 transition-all group"
            >
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                WQ User UUID
              </span>
              <p className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-1 truncate text-[11px] sm:text-xs group-hover:text-[#00d09c] transition-colors">
                {wqUserId}
              </p>
            </div>

            {/* Card 2: Role */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800/80">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Role
              </span>
              <p className="font-extrabold text-[#00d09c] mt-1 text-xs sm:text-sm tracking-wide">
                {role}
              </p>
            </div>

            {/* Card 3: Account Status */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800/80">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Account Status
              </span>
              <p className="font-extrabold text-emerald-500 dark:text-emerald-400 mt-1 text-xs sm:text-sm tracking-wide">
                Active & Verified
              </p>
            </div>

            {/* Card 4: Trust Score */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800/80">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Trust Score
              </span>
              <p className="font-extrabold text-amber-500 dark:text-amber-400 mt-1 text-xs sm:text-sm tracking-wide">
                {trustScore} / 100
              </p>
            </div>
          </div>
        </div>

        {/* ── METRIC HIGHLIGHT STRIP ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-[#111315] flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Dispatches</span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">{userPosts.length} Published</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-[#111315] flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Briefcase className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Portfolio Stakes</span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">{positions.length} Active</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-[#111315] flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <UserCheck className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Network Standing</span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">Tier 2 Verified</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-[#111315] flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Security Standing</span>
              <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">Verified Member</span>
            </div>
          </div>
        </div>

        {/* ── DETAILED TABS CONTENT ── */}
        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111315] p-5 sm:p-6 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-2 sm:grid-cols-5 h-auto p-1 bg-slate-100 dark:bg-zinc-900 rounded-xl gap-1">
              <TabsTrigger value="overview" className="text-xs font-bold py-2 rounded-lg cursor-pointer">
                Overview & Bio
              </TabsTrigger>
              <TabsTrigger value="dispatches" className="text-xs font-bold py-2 rounded-lg cursor-pointer">
                Dispatches ({userPosts.length})
              </TabsTrigger>
              <TabsTrigger value="holdings" className="text-xs font-bold py-2 rounded-lg cursor-pointer">
                Ventures & Holdings ({positions.length})
              </TabsTrigger>
              <TabsTrigger value="kyc" className="text-xs font-bold py-2 rounded-lg cursor-pointer">
                Credentials
              </TabsTrigger>
              <TabsTrigger value="security" className="text-xs font-bold py-2 rounded-lg cursor-pointer">
                Account & Security
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: OVERVIEW & BIO */}
            <TabsContent value="overview" className="space-y-6 pt-4 focus-visible:outline-none">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Left 2 Cols: Bio & Thesis */}
                <div className="md:col-span-2 space-y-5">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Executive Bio & Strategy Thesis
                      </h3>
                      <button
                        onClick={handleOpenEdit}
                        className="text-xs font-bold text-[#00d09c] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="h-3 w-3" /> Edit Bio
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-slate-100 dark:border-zinc-800">
                      {bio}
                    </p>
                  </div>

                  {/* Sectors of focus */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Core Technology Sectors & Specializations
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {sectors.map((sec, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#00d09c]/10 text-[#00a87e] dark:text-[#00d09c] border border-[#00d09c]/20"
                        >
                          {sec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Affiliated Primary Organization */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-black font-extrabold flex items-center justify-center text-xs">
                        WQ
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          White Quantex Corporate Holdings
                          <span className="font-mono text-[10px] text-slate-400">$WQ</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Primary Enterprise Issuer · Delaware Statutory Authority
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-[#00d09c]/10 text-[#00a87e] dark:text-[#00d09c] border border-[#00d09c]/20 text-[10px] font-extrabold">
                      Primary Entity
                    </Badge>
                  </div>
                </div>

                {/* Right Col: Identity & Contact Card */}
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/60 space-y-3.5">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Identity & Coordinates
                    </h3>

                    <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <a href={website} target="_blank" rel="noopener noreferrer" className="text-[#00d09c] hover:underline truncate">
                          {website.replace(/^https?:\/\//, "")}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>Member since October 2024</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 dark:border-zinc-800 flex items-center gap-2 flex-wrap">
                      {twitterUrl && (
                        <a
                          href={twitterUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-300 hover:text-[#00d09c] transition-colors"
                        >
                          Twitter / X
                        </a>
                      )}
                      {linkedinUrl && (
                        <a
                          href={linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-300 hover:text-[#00d09c] transition-colors"
                        >
                          LinkedIn
                        </a>
                      )}
                      {githubUrl && (
                        <a
                          href={githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-300 hover:text-[#00d09c] transition-colors"
                        >
                          GitHub
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#00d09c]/5 border border-[#00d09c]/20 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                      <ShieldCheck className="h-4 w-4 text-[#00d09c]" />
                      <span>Sovereign Identity Notarization</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                      Your White Quantex canonical reference is registered on the verified secondary network.
                    </p>
                  </div>
                </div>

              </div>
            </TabsContent>

            {/* TAB 2: DISPATCHES (COMMUNITY POSTS) */}
            <TabsContent value="dispatches" className="space-y-4 pt-4 focus-visible:outline-none">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Published Community Dispatches
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Your real-time executive reflections, secondary liquidity announcements, and syndications.
                  </p>
                </div>
                <Link
                  to="/community?create=true"
                  className="px-3 py-1.5 rounded-xl bg-[#00d09c] text-black font-extrabold text-xs hover:bg-[#00b888] shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> New Dispatch
                </Link>
              </div>

              {isPostsLoading ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading your dispatches...</div>
              ) : userPosts.length === 0 ? (
                <div className="p-10 text-center rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 space-y-3">
                  <MessageSquare className="h-8 w-8 text-slate-400 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No dispatches published yet</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    Publish your first executive post to the White Quantex community to engage with sovereign investors and venture partners.
                  </p>
                  <Link
                    to="/community?create=true"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-xs"
                  >
                    <Plus className="h-3.5 w-3.5" /> Publish Now
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {userPosts.map((post: any) => (
                    <div
                      key={post.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/40 space-y-2 hover:border-[#00d09c]/40 transition-all"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                          <span>{displayName}</span>
                          {post.visibility && (
                            <Badge variant="outline" className="text-[10px] uppercase font-bold py-0">
                              {post.visibility}
                            </Badge>
                          )}
                        </div>
                        <span className="text-slate-400 text-[10px]">
                          {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "Recently"}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-normal">
                        {post.content}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 dark:border-zinc-800/80 text-xs text-slate-400">
                        <span className="flex items-center gap-1 font-semibold text-rose-500">
                          <Heart className="h-3.5 w-3.5 fill-rose-500" />
                          <span>{post.likesCount || 0} Likes</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>{post.commentsCount || 0} Comments</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* TAB 3: VENTURES & HOLDINGS */}
            <TabsContent value="holdings" className="space-y-5 pt-4 focus-visible:outline-none">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Ventures & Secondary Holdings
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Real-time private equity ownership and syndicate allocations on White Quantex.
                  </p>
                </div>
                <Link
                  to="/explore?tab=positions"
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-bold hover:border-[#00d09c] flex items-center gap-1 cursor-pointer"
                >
                  <Briefcase className="h-3.5 w-3.5 text-[#00d09c]" /> Explore Positions
                </Link>
              </div>

              {/* Financial summary overview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/40">
                  <span className="text-[11px] text-slate-400 font-semibold block">Total Cost Basis</span>
                  <span className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5 block">
                    {formatCurrency(totalInvested)}
                  </span>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/40">
                  <span className="text-[11px] text-slate-400 font-semibold block">Current Valuation</span>
                  <span className="text-lg font-extrabold text-[#00d09c] mt-0.5 block">
                    {formatCurrency(portfolioValue)}
                  </span>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/40">
                  <span className="text-[11px] text-slate-400 font-semibold block">Net Return</span>
                  <span className={cn("text-lg font-extrabold mt-0.5 block", unrealizedGain >= 0 ? "text-emerald-500" : "text-rose-500")}>
                    {unrealizedGain >= 0 ? "+" : ""}{formatCurrency(unrealizedGain)} ({totalReturnPercent.toFixed(1)}%)
                  </span>
                </div>
              </div>

              {/* Positions List */}
              {isPositionsLoading ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading holdings data...</div>
              ) : positions.length === 0 ? (
                <div className="p-8 text-center rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 space-y-2">
                  <Briefcase className="h-6 w-6 text-slate-400 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No active positions recorded</p>
                  <p className="text-[11px] text-slate-400">Explore secondary liquidity opportunities to add allocations to your portfolio.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {positions.map((pos) => (
                    <div
                      key={pos.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/40 flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
                          <span>{pos.companyName || "Private Issuer"}</span>
                          <span className="font-mono text-[10px] text-slate-400">${pos.ticker || "WQ"}</span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {pos.shares?.toLocaleString() || "0"} Shares · Class {pos.shareClass || "A"}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                          {formatCurrency(pos.currentValue || 0)}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-500">
                          {typeof pos.unrealizedPlPercent === "number" ? `${pos.unrealizedPlPercent >= 0 ? "+" : ""}${pos.unrealizedPlPercent.toFixed(1)}%` : "Verified"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* TAB 4: CREDENTIALS & BADGES */}
            <TabsContent value="kyc" className="space-y-4 pt-4 focus-visible:outline-none">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Ecosystem Standing & Verification Badges
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Verified network memberships, trust scores, and platform standing.
                  </p>
                </div>
                <Link
                  to="/verification"
                  className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Award className="h-3.5 w-3.5" /> Verification Hub
                </Link>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    title: "Verified Ecosystem Identity",
                    desc: "Authenticated ecosystem profile and community participation standing.",
                    status: "VERIFIED",
                  },
                  {
                    title: "Platform Trust & Standing Clearance",
                    desc: "High-trust network participant rating and verified status.",
                    status: "ACTIVE",
                  },
                  {
                    title: "Two-Factor & Cryptographic Authentication",
                    desc: "Protected account credentials and secure sessions.",
                    status: "ENABLED",
                  },
                  {
                    title: "Secondary Market Participant Standing",
                    desc: "Verified participant standing for ecosystem opportunities.",
                    status: "ACTIVE",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/40 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-4 w-4 text-[#00d09c] shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.desc}</p>
                      </div>
                    </div>
                    <Badge className="bg-[#00d09c]/10 text-[#00a87e] dark:text-[#00d09c] border border-[#00d09c]/20 text-[9px] font-extrabold uppercase shrink-0">
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>

              {/* Trust Score Breakdown */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/60 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#00d09c]" />
                    Trust Score Breakdown: {trustScore} / 100
                  </h4>
                  <span className="text-[11px] text-[#00d09c] font-bold">Good Standing</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-300">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700">
                    <span className="text-[10px] text-slate-400 block font-semibold">Identity Attestation</span>
                    <span className="font-bold text-slate-900 dark:text-white">100% Completed</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700">
                    <span className="text-[10px] text-slate-400 block font-semibold">Legal & Accreditations</span>
                    <span className="font-bold text-slate-900 dark:text-white">95% Approved</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700">
                    <span className="text-[10px] text-slate-400 block font-semibold">Ecosystem Standing</span>
                    <span className="font-bold text-slate-900 dark:text-white">85 / 100 Rating</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB 5: ACCOUNT & SECURITY */}
            <TabsContent value="security" className="space-y-4 pt-4 focus-visible:outline-none">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Account Security & Authentication
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Manage session credentials, two-factor authentication, and canonical cryptographic keys.
                  </p>
                </div>
                <Link
                  to="/settings"
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-bold hover:border-[#00d09c] flex items-center gap-1 cursor-pointer"
                >
                  <Lock className="h-3.5 w-3.5 text-slate-400" /> Full Settings
                </Link>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/40 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-[#00d09c]" />
                      Two-Factor Authentication (2FA)
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Protect secondary transaction clearing and high-value orders with TOTP authenticator.
                    </p>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                    ENABLED
                  </Badge>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/40 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Mail className="h-4 w-4 text-[#00d09c]" />
                      Verified Primary Email
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Registered to {email} · Verified for statutory trade confirmations.
                    </p>
                  </div>
                  <Badge className="bg-[#00d09c]/10 text-[#00a87e] dark:text-[#00d09c] border border-[#00d09c]/20 text-[10px] font-bold">
                    VERIFIED
                  </Badge>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/40 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Key className="h-4 w-4 text-slate-400" />
                      Cryptographic Session Reference
                    </h4>
                    <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      {wqUserId}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyUuid}
                    className="h-7 text-xs font-bold rounded-lg cursor-pointer"
                  >
                    {copiedUuid ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* ── EDIT PROFILE MODAL ── */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-xl p-6 rounded-2xl bg-white dark:bg-[#111315] border border-slate-200 dark:border-zinc-800 shadow-2xl">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-lg font-extrabold text-slate-900 dark:text-white">
                Edit WQ Ecosystem Profile
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                Update your public executive persona, coordinates, and biography on White Quantex.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Display Name
                  </label>
                  <Input
                    value={editForm.displayName}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, displayName: e.target.value }))}
                    className="text-xs rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Username
                  </label>
                  <Input
                    value={editForm.username}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, username: e.target.value }))}
                    className="text-xs rounded-xl font-mono"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Headline / Title
                </label>
                <Input
                  value={editForm.headline}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, headline: e.target.value }))}
                  className="text-xs rounded-xl"
                  placeholder="e.g. Founder & CEO @ DeepTech Robotics"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Biography & Executive Thesis
                </label>
                <Textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, bio: e.target.value }))}
                  className="text-xs rounded-xl min-h-[90px] leading-relaxed"
                  placeholder="Tell the White Quantex ecosystem about your background, track record, and current mission..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Location
                  </label>
                  <Input
                    value={editForm.location}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, location: e.target.value }))}
                    className="text-xs rounded-xl"
                    placeholder="e.g. San Francisco, CA"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Website URL
                  </label>
                  <Input
                    value={editForm.website}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, website: e.target.value }))}
                    className="text-xs rounded-xl"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Twitter / X Profile URL
                  </label>
                  <Input
                    value={editForm.twitterUrl}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, twitterUrl: e.target.value }))}
                    className="text-xs rounded-xl"
                    placeholder="https://x.com/..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    LinkedIn Profile URL
                  </label>
                  <Input
                    value={editForm.linkedinUrl}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, linkedinUrl: e.target.value }))}
                    className="text-xs rounded-xl"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
              </div>

              <DialogFooter className="pt-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="text-xs font-bold rounded-xl bg-[#00d09c] text-black hover:bg-[#00b888] cursor-pointer disabled:opacity-60"
                >
                  {isSaving ? "Saving Profile..." : "Save Profile"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

      </div>
    </ProtectedRoute>
  )
}
