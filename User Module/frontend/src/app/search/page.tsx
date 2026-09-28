import React, { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router"
import { Search, Users, Building2, TrendingUp, ArrowLeft, ShieldCheck, MessageSquare, Heart, Bookmark } from "lucide-react"
import { FounderCard } from "../../components/shared/FounderCard"
import { InvestorCard } from "../../components/shared/InvestorCard"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Card, CardContent } from "../../components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { VerificationBadge } from "../../components/shared/VerificationBadge"

const SAMPLE_POSTS = [
  {
    id: "post-search-1",
    author: { displayName: "Elena Voss", headline: "Founder & CEO @ NovaMind AI", verificationLevel: "GOLD" },
    content: "Excited to share that NovaMind AI has officially crossed 100k daily active inference requests! Huge milestone for our engineering team.",
    postType: "IMAGE",
    likesCount: 142,
    commentsCount: 28,
  },
  {
    id: "post-search-2",
    author: { displayName: "Marcus Klein", headline: "CEO @ VerdeGrid Energy", verificationLevel: "SILVER" },
    content: "We're expanding our smart grid pilot across 5 European municipal hubs! Looking to connect with B2B utility partners.",
    postType: "TEXT",
    likesCount: 89,
    commentsCount: 14,
  },
  {
    id: "post-search-3",
    author: { displayName: "Sarah Chen", headline: "General Partner @ Sequoia Capital", verificationLevel: "PLATINUM" },
    content: "Key takeaway from our latest Venture Report: AI infrastructure startups focusing on vertical domain compliance are outperforming horizontal models.",
    postType: "TEXT",
    likesCount: 230,
    commentsCount: 45,
  },
]

const SAMPLE_PEOPLE = [
  { id: "f1", name: "Elena Voss", headline: "Founder @ NovaMind AI", location: "San Francisco, CA", followersCount: 14200, role: "FOUNDER", verificationLevel: "GOLD" },
  { id: "f2", name: "Marcus Klein", headline: "CEO @ VerdeGrid Energy", location: "Berlin, Germany", followersCount: 8900, role: "FOUNDER", verificationLevel: "SILVER" },
  { id: "i1", name: "Sarah Chen", headline: "General Partner @ Sequoia Capital", location: "Menlo Park, CA", followersCount: 24500, role: "INVESTOR", verificationLevel: "PLATINUM" },
  { id: "i2", name: "David Kim", headline: "Managing Director @ Founders Fund", location: "New York, NY", followersCount: 18900, role: "INVESTOR", verificationLevel: "GOLD" },
  { id: "f3", name: "Alex Vance", headline: "Founder & CTO @ Quantum Systems", location: "Boston, MA", followersCount: 11200, role: "FOUNDER", verificationLevel: "GOLD" },
]

const SAMPLE_VENTURES = [
  { id: "v1", name: "NovaMind AI", stage: "Series A", target: "$10,000,000", sector: "AI & ML", description: "Enterprise LLM compliance and fast inference engine." },
  { id: "v2", name: "VerdeGrid Energy", stage: "Series A", target: "$3,500,000", sector: "CleanTech", description: "Smart grid infrastructure for municipal European power grids." },
  { id: "v3", name: "Quantum Systems", stage: "Seed", target: "$2,000,000", sector: "Quantum Tech", description: "Fault-tolerant quantum simulation algorithms for drug discovery." },
  { id: "v4", name: "BioHelix Labs", stage: "Series B", target: "$15,000,000", sector: "BioTech", description: "CRISPR gene delivery systems for localized therapeutics." },
  { id: "v5", name: "HyperLedger Pay", stage: "Series A", target: "$5,000,000", sector: "Fintech", description: "Cross-border instant B2B settlement network." },
]

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const typeParam = searchParams.get("type") || "people"
  const [activeSearchType, setActiveSearchType] = useState<"people" | "ventures">(
    typeParam === "ventures" ? "ventures" : "people"
  )
  const [query, setQuery] = useState("")

  useEffect(() => {
    const t = searchParams.get("type")
    if (t === "ventures" || t === "people") {
      setActiveSearchType(t)
    }
  }, [searchParams])

  const handleTabChange = (type: "people" | "ventures") => {
    setActiveSearchType(type)
    setSearchParams({ type })
  }

  const filteredPosts = SAMPLE_POSTS.filter((post) => {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return (
      post.content.toLowerCase().includes(q) ||
      post.author.displayName.toLowerCase().includes(q) ||
      post.author.headline.toLowerCase().includes(q)
    )
  })

  const filteredPeople = SAMPLE_PEOPLE.filter((person) => {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return (
      person.name.toLowerCase().includes(q) ||
      person.headline.toLowerCase().includes(q) ||
      person.location.toLowerCase().includes(q)
    )
  })

  const filteredVentures = SAMPLE_VENTURES.filter((venture) => {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return (
      venture.name.toLowerCase().includes(q) ||
      venture.sector.toLowerCase().includes(q) ||
      venture.description.toLowerCase().includes(q)
    )
  })

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-2 cursor-pointer transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {activeSearchType === "people" ? "Community Search (Posts & People)" : "Investment Search (Companies & Ventures)"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {activeSearchType === "people"
              ? "Search posts, discussions, verified founders, and network members."
              : "Search active fundraising startups, company profiles, and venture deals."}
          </p>
        </div>

        {/* Search Mode Filter Tabs */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl border border-slate-200 dark:border-zinc-800 shrink-0">
          <button
            onClick={() => handleTabChange("people")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSearchType === "people"
                ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Users className="h-4 w-4" /> Posts & People
          </button>
          <button
            onClick={() => handleTabChange("ventures")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSearchType === "ventures"
                ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Building2 className="h-4 w-4" /> Companies & Ventures
          </button>
        </div>
      </div>

      {/* Main Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder={
            activeSearchType === "people"
              ? "Search posts & people by keywords, founder names, topic..."
              : "Search companies & ventures by startup name, sector, description..."
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
        />
      </div>

      {/* Search Results Display */}
      {activeSearchType === "people" ? (
        <div className="space-y-6 pt-2">
          
          {/* Section 1: Matched People */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-zinc-800 pb-2">
              <span className="font-extrabold uppercase text-[11px] text-slate-900 dark:text-white tracking-wider flex items-center gap-1.5">
                <Users className="h-4 w-4 text-emerald-500" /> People & Founders ({filteredPeople.length})
              </span>
              <span className="font-semibold text-emerald-500 flex items-center gap-1 text-[11px]">
                <ShieldCheck className="h-3.5 w-3.5" /> Verified Network
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPeople.map((person, i) => (
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

          {/* Section 2: Matched Posts */}
          <div className="space-y-3 pt-4">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-zinc-800 pb-2">
              <span className="font-extrabold uppercase text-[11px] text-slate-900 dark:text-white tracking-wider flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4 text-emerald-500" /> Community Feed Posts ({filteredPosts.length})
              </span>
            </div>

            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#121618] p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 rounded-lg">
                        <AvatarFallback className="bg-slate-900 text-white font-bold text-xs">
                          {post.author.displayName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{post.author.displayName}</span>
                          <VerificationBadge level={post.author.verificationLevel || "GOLD"} />
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{post.author.headline}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-bold border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-slate-300">
                      {post.postType}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                    {post.content}
                  </p>

                  <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-bold text-xs"><Heart className="h-3.5 w-3.5" /> {post.likesCount}</span>
                    <span className="flex items-center gap-1 font-bold text-xs"><MessageSquare className="h-3.5 w-3.5" /> {post.commentsCount}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

        </div>
      ) : (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-zinc-800 pb-2">
            <span>Found {filteredVentures.length} companies & ventures matching query</span>
            <span className="font-semibold text-emerald-500 flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" /> Active Investment Deals
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVentures.map((venture) => (
              <div
                key={venture.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#121212] space-y-3 hover:border-emerald-500/50 transition-all shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] font-bold border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-300">
                      {venture.stage}
                    </Badge>
                    <span className="text-xs font-extrabold text-emerald-500">{venture.target}</span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{venture.name}</h3>
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{venture.sector}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 line-clamp-2 leading-relaxed">
                      {venture.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Company</span>
                  <Button
                    size="sm"
                    onClick={() => navigate(`/companies/${venture.id}`)}
                    className="h-7 px-3 text-[11px] font-bold bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-zinc-950 rounded-lg cursor-pointer"
                  >
                    View Deal
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
