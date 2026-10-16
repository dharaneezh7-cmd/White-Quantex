import React, { useState } from "react"
import { useParams, Link, useNavigate } from "react-router"
import {
  ArrowLeft, ShieldCheck, Globe, Users, Briefcase, Mail, Share2, Copy, Check,
  ExternalLink, Building2, Sparkles, Award, Radio, Calendar, Heart, MessageSquare
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { VerificationBadge } from "@/components/shared/VerificationBadge"
import { formatNumber, getInitials, cn } from "@/lib/utils"

export default function FounderProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [copiedLink, setCopiedLink] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [messageSent, setMessageSent] = useState(false)

  // Curated demo profile matching the ecosystem members & followers
  const profile = {
    id: id || "founder-1",
    name: id?.includes("thorne") ? "Dr. Aris Thorne" : id?.includes("voss") ? "Elena Voss" : id?.includes("klein") ? "Marcus Klein" : id?.includes("seth") ? "Vikram Seth" : "Alexander Vance",
    username: id?.includes("thorne") ? "aris_thorne" : id?.includes("voss") ? "elenavoss" : id?.includes("klein") ? "marcusklein" : "alexvance",
    headline: id?.includes("thorne") ? "Founder @ MediSync Robotics" : id?.includes("voss") ? "Founder & CEO @ NovaMind AI" : "Founder & System Architect",
    bio: "Pioneering autonomous distributed architectures, private statutory compliance, and secondary liquidity order clearing on White Quantex.",
    role: "FOUNDER",
    location: "San Francisco, CA",
    followersCount: 4820,
    followingCount: 310,
    postsCount: 24,
    verificationLevel: "PLATINUM",
    trustScore: 98,
    badgeText: "Verified Founder & Statutory Signatory",
    sectors: ["Distributed Systems", "Enterprise AI", "DeepTech", "Delaware Secondary"],
    accreditations: [
      "Delaware C-Corp Founder & Principal Officer",
      "White Quantex Platinum Trust Verification (Score 98)",
      "Statutory Cap Table Signatory Authority",
      "Automated Escrow Protocol Filer",
    ],
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/community" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-500 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Community & Ecosystem
        </Link>
        <button
          onClick={handleCopy}
          className="text-xs font-semibold text-slate-500 hover:text-emerald-500 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          {copiedLink ? "Link Copied" : "Share Profile"}
        </button>
      </div>

      <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111315] shadow-xl overflow-hidden">
        {/* Banner */}
        <div className="h-36 sm:h-44 bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.2),transparent_70%)]" />
          <div className="absolute top-4 left-4">
            <Badge className="bg-black/40 backdrop-blur-md text-emerald-400 border border-white/10 text-xs font-bold py-1">
              <Sparkles className="h-3 w-3 mr-1 text-emerald-400" />
              Verified Founder Directory
            </Badge>
          </div>
        </div>

        {/* Identity bar */}
        <div className="px-6 sm:px-8 pb-6 relative -mt-16 sm:-mt-20 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <Avatar className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl ring-4 ring-white dark:ring-[#111315] shadow-2xl shrink-0 bg-slate-900">
                <AvatarFallback className="text-white font-black text-2xl rounded-2xl bg-emerald-700">
                  {getInitials(profile.name)}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1 pb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {profile.name}
                  </h1>
                  <VerificationBadge level={profile.verificationLevel} />
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">@{profile.username}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Globe className="h-3 w-3 text-slate-400" /> {profile.location}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                onClick={() => setIsFollowing((p) => !p)}
                className={cn(
                  "h-9 px-5 text-xs font-bold rounded-xl cursor-pointer shadow-sm transition-all",
                  isFollowing
                    ? "border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-slate-300 bg-white/60 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                )}
              >
                {isFollowing ? "Following" : "+ Follow"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setMessageSent(true)
                  setTimeout(() => {
                    setMessageSent(false)
                    navigate(`/messages?user=${profile.username}`)
                  }, 800)
                }}
                className="h-9 px-4 text-xs font-semibold rounded-xl border-slate-200 dark:border-zinc-800 hover:border-emerald-500/40 cursor-pointer"
              >
                <Mail className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                {messageSent ? "Opening Chat..." : "Message"}
              </Button>
            </div>
          </div>

          <p className="text-sm font-medium text-slate-700 dark:text-slate-200 pt-1">
            {profile.headline}
          </p>

          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-3 pt-3 text-center">
            <div className="p-3 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/60">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Trust Score</span>
              <span className="font-extrabold text-sm sm:text-base text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" /> {profile.trustScore}%
              </span>
            </div>
            <div className="p-3 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/60">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Followers</span>
              <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mt-0.5 block">
                {formatNumber(profile.followersCount)}
              </span>
            </div>
            <div className="p-3 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/60">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Following</span>
              <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mt-0.5 block">
                {formatNumber(profile.followingCount)}
              </span>
            </div>
            <div className="p-3 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/60">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Dispatches</span>
              <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mt-0.5 block">
                {profile.postsCount}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800">
            <Tabs defaultValue="bio" className="w-full">
              <TabsList className="w-full grid grid-cols-2 h-10 bg-slate-100 dark:bg-zinc-900 rounded-xl p-1 mb-4">
                <TabsTrigger value="bio" className="text-xs font-bold rounded-lg">Overview & Focus</TabsTrigger>
                <TabsTrigger value="credentials" className="text-xs font-bold rounded-lg">Accreditations</TabsTrigger>
              </TabsList>

              <TabsContent value="bio" className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#16181a] border border-slate-100 dark:border-zinc-800 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {profile.bio}
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expertise Sectors</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.sectors.map((s, i) => (
                      <span key={i} className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="credentials" className="space-y-2.5">
                {profile.accreditations.map((acc, i) => (
                  <div key={i} className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#16181a] flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      <span>{acc}</span>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[9px] font-bold">VERIFIED</Badge>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
