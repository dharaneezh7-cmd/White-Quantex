import React, { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  ArrowLeft, Users, MessageSquare, Send, Smile, Lock, ShieldCheck, Globe,
  MoreVertical, Check, CheckCheck, Loader2, Info, PlusSquare, Heart, Share2,
  Calendar, FileText, UserPlus, PhoneCall, Video, Search, Image as ImageIcon
} from "lucide-react"
import { communityService, type CommunityChatMessage } from "@/services/community/communityService"
import { useAuthStore } from "@/stores/auth-store"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn, formatNumber, getInitials } from "@/lib/utils"

const EMOJI_OPTIONS = ["👍", "❤️", "🚀", "💡", "🔥", "👏"]

export default function CommunityDetailPage() {
  const { communityId } = useParams<{ communityId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user: authUser } = useAuthStore()

  const [activeTab, setActiveTab] = useState<"chat" | "feed" | "members" | "about">("chat")
  const [chatInput, setChatInput] = useState("")
  const [selectedEmojiMsgId, setSelectedEmojiMsgId] = useState<string | null>(null)
  const chatScrollRef = useRef<HTMLDivElement>(null)

  // 1. Fetch community details
  const {
    data: community,
    isLoading: loadingCommunity,
    error: communityError,
  } = useQuery({
    queryKey: ["community-detail", communityId],
    queryFn: () => communityService.getCommunityById(communityId || ""),
    enabled: Boolean(communityId),
    staleTime: 30000,
  })

  // 2. Fetch community group chat messages (WhatsApp style)
  const {
    data: messages = [],
    isLoading: loadingMessages,
    refetch: refetchMessages,
  } = useQuery({
    queryKey: ["community-messages", communityId],
    queryFn: () => communityService.getCommunityMessages(communityId || ""),
    enabled: Boolean(communityId),
    refetchInterval: 3000, // Real-time polling fallback
  })

  // 3. Fetch community posts (dispatches)
  const {
    data: postsData,
    isLoading: loadingPosts,
  } = useQuery({
    queryKey: ["community-posts", communityId],
    queryFn: () => communityService.getFeed(0, 30, { communityId }),
    enabled: Boolean(communityId),
  })

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [messages, activeTab])

  // Mutation: Send message
  const sendMessageMutation = useMutation({
    mutationFn: (text: string) => communityService.sendCommunityMessage(communityId || "", text),
    onSuccess: (newMsg) => {
      setChatInput("")
      queryClient.setQueryData<CommunityChatMessage[]>(["community-messages", communityId], (prev = []) => [
        ...prev,
        newMsg,
      ])
      setTimeout(() => {
        if (chatScrollRef.current) {
          chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
        }
      }, 50)
    },
  })

  // Mutation: React to message
  const reactMutation = useMutation({
    mutationFn: ({ msgId, emoji }: { msgId: string; emoji: string }) =>
      communityService.reactCommunityMessage(communityId || "", msgId, emoji),
    onSuccess: () => {
      setSelectedEmojiMsgId(null)
      refetchMessages()
    },
  })

  // Mutation: Join / Leave community
  const joinMutation = useMutation({
    mutationFn: (isJoined: boolean) =>
      isJoined ? communityService.leaveCommunity(community?.id || "") : communityService.joinCommunity(community?.id || ""),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-detail", communityId] })
      queryClient.invalidateQueries({ queryKey: ["community-hubs"] })
    },
  })

  const handleJoinClick = (isJoinedState: boolean) => {
    if (!authUser?.id) {
      navigate("/login?redirect=" + encodeURIComponent(window.location.pathname))
      return
    }
    joinMutation.mutate(isJoinedState)
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || sendMessageMutation.isPending) return
    sendMessageMutation.mutate(chatInput.trim())
  }

  const isJoined = Boolean(community?.isJoined || community?.isOwner)
  const isOwner = Boolean(community?.isOwner)

  if (loadingCommunity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B0D0E]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  if (communityError || !community) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-[#0B0D0E] text-center space-y-4">
        <Users className="h-12 w-12 text-slate-400" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Community Hub Not Found</h2>
        <p className="text-xs text-slate-500 max-w-sm">The requested community within the White Quantex network does not exist or has been archived.</p>
        <Button onClick={() => navigate("/community")} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold">
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to Communities
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0D0E] text-slate-900 dark:text-white flex flex-col">
      {/* ── Top Bar Header (WhatsApp Group Style) ── */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#121517]/95 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 px-4 py-2.5 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate("/community?tab=communities")}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors shrink-0"
            title="Back to Community"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <Avatar className="h-10 w-10 rounded-full ring-2 ring-emerald-500/20 shrink-0">
            {community.iconUrl ? <AvatarImage src={community.iconUrl} alt={community.name} /> : null}
            <AvatarFallback className="bg-emerald-600 text-white font-black text-sm">
              {getInitials(community.name)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {community.name}
              </h1>
              {community.isPrivate ? (
                <Badge variant="outline" className="text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 font-bold py-0 gap-1">
                  <Lock className="h-2.5 w-2.5" /> Private Group
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-bold py-0 gap-1">
                  <Globe className="h-2.5 w-2.5" /> Public Group
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
              <span>{formatNumber(community.memberCount || 1)} members</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Group within White Quantex</span>
            </p>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant={isJoined ? "outline" : "default"}
            onClick={() => handleJoinClick(Boolean(isJoined))}
            disabled={joinMutation.isPending}
            className={cn(
              "h-8 px-3 text-xs font-bold rounded-lg cursor-pointer transition-all",
              isOwner
                ? "border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/5 cursor-default"
                : isJoined
                ? "border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-300"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            )}
          >
            {isOwner ? "Owner" : isJoined ? "Joined Group" : "+ Join Group"}
          </Button>
        </div>
      </header>

      {/* ── Main Container: Group Chat & Hub Tabs ── */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-5 flex flex-col min-h-0">
        <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)} className="flex-1 flex flex-col min-h-0 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-2">
            <TabsList className="bg-slate-100 dark:bg-zinc-900/80 p-1 rounded-xl">
              <TabsTrigger value="chat" className="text-xs font-bold rounded-lg py-1.5 px-3 flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" /> Group Chat
              </TabsTrigger>
              <TabsTrigger value="feed" className="text-xs font-bold rounded-lg py-1.5 px-3 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" /> Posts & Updates
              </TabsTrigger>
              <TabsTrigger value="members" className="text-xs font-bold rounded-lg py-1.5 px-3 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> Members ({community.memberCount || 1})
              </TabsTrigger>
              <TabsTrigger value="about" className="text-xs font-bold rounded-lg py-1.5 px-3 flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5" /> Guidelines & About
              </TabsTrigger>
            </TabsList>

            <span className="text-[11px] text-slate-400 hidden sm:inline">
              WhatsApp-style encrypted circle communication
            </span>
          </div>

          {/* ── TAB 1: WHATSAPP-STYLE REALTIME GROUP CHAT ── */}
          <TabsContent value="chat" className="flex-1 flex flex-col min-h-[550px] border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-[#101214] shadow-sm">
            {/* Chat background wallpaper texture */}
            <div className="flex-1 flex flex-col overflow-hidden relative bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px]">
              
              {/* Message History List */}
              <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
                {/* System Welcome Message */}
                <div className="flex justify-center my-2">
                  <div className="bg-slate-100 dark:bg-zinc-800/90 border border-slate-200 dark:border-zinc-700/60 rounded-full px-4 py-1 text-[11px] text-slate-500 dark:text-slate-300 font-medium shadow-xs text-center max-w-md">
                    🔒 Messages in <strong>{community.name}</strong> are visible to group members. Professional conduct is enforced.
                  </div>
                </div>

                {loadingMessages ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                    <span className="text-xs">Connecting to group stream...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center space-y-2">
                    <MessageSquare className="h-10 w-10 text-slate-400" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No group messages yet</h3>
                    <p className="text-xs text-slate-400 max-w-sm">Be the first member to start the conversation in this community circle!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = Boolean(authUser?.id && msg.senderWqUserId === authUser.id)
                    const msgTime = new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

                    return (
                      <div
                        key={msg.id}
                        className={cn("flex flex-col group", isMe ? "items-end" : "items-start")}
                      >
                        <div className={cn("flex items-end gap-2 max-w-[85%] sm:max-w-[70%]", isMe ? "flex-row-reverse" : "flex-row")}>
                          {!isMe && (
                            <Avatar className="h-7 w-7 rounded-full shrink-0">
                              {msg.senderAvatarUrl ? <AvatarImage src={msg.senderAvatarUrl} alt={msg.senderName} /> : null}
                              <AvatarFallback className="text-[10px] bg-slate-900 text-white font-bold">
                                {getInitials(msg.senderName)}
                              </AvatarFallback>
                            </Avatar>
                          )}

                          <div
                            className={cn(
                              "rounded-2xl p-3 shadow-xs relative text-xs transition-all",
                              isMe
                                ? "bg-emerald-600 text-white rounded-tr-none"
                                : "bg-slate-100 dark:bg-zinc-800/90 text-slate-900 dark:text-white rounded-tl-none border border-slate-200/60 dark:border-zinc-700/60"
                            )}
                          >
                            {!isMe && (
                              <div className="font-bold text-[10px] text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-1.5">
                                <span>{msg.senderName}</span>
                                {msg.senderUsername && <span className="opacity-70">@{msg.senderUsername}</span>}
                              </div>
                            )}

                            <p className="whitespace-pre-wrap leading-relaxed text-[12px]">{msg.content}</p>

                            {/* Timestamp & Read Tick */}
                            <div className={cn("flex items-center justify-end gap-1 mt-1 text-[9px]", isMe ? "text-emerald-100" : "text-slate-400")}>
                              <span>{msgTime}</span>
                              {isMe && <CheckCheck className="h-3 w-3 text-emerald-200" />}
                            </div>

                            {/* Reactions display */}
                            {msg.reactions && msg.reactions.length > 0 && (
                              <div className="flex items-center gap-1 flex-wrap mt-1.5 pt-1 border-t border-black/10 dark:border-white/10">
                                {msg.reactions.map((r, ri) => (
                                  <span key={ri} className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/30 dark:bg-black/30 font-bold">
                                    {r.emoji}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Quick Emoji Reaction Pill on hover */}
                          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity shrink-0">
                            <button
                              type="button"
                              onClick={() => setSelectedEmojiMsgId(selectedEmojiMsgId === msg.id ? null : msg.id)}
                              className="p-1 rounded-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-400 hover:text-emerald-500 cursor-pointer shadow-xs"
                              title="Add Reaction"
                            >
                              <Smile className="h-3 w-3" />
                            </button>

                            {selectedEmojiMsgId === msg.id && (
                              <div className="flex items-center bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-full px-1.5 py-0.5 shadow-md gap-1">
                                {EMOJI_OPTIONS.map((em) => (
                                  <button
                                    key={em}
                                    type="button"
                                    onClick={() => reactMutation.mutate({ msgId: msg.id, emoji: em })}
                                    className="hover:scale-125 transition-transform text-xs p-0.5 cursor-pointer"
                                  >
                                    {em}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Chat Input Bar or Join Prompt */}
              {isJoined ? (
                <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-white dark:bg-[#121517] border-t border-slate-200 dark:border-zinc-800 flex items-center gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={`Message in #${community.name}...`}
                    className="flex-1 h-10 text-xs bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-1 focus:ring-emerald-500"
                  />
                  <Button
                    type="submit"
                    disabled={!chatInput.trim() || sendMessageMutation.isPending}
                    className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold gap-1.5 cursor-pointer shrink-0 shadow-xs"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Send</span>
                  </Button>
                </form>
              ) : (
                <div className="p-3.5 sm:p-4 bg-slate-100/90 dark:bg-[#121517]/90 border-t border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Lock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Join this community to send messages
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Only joined members can participate in the #{community.name} group chat.
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleJoinClick(false)}
                    disabled={joinMutation.isPending}
                    className="h-9 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold gap-1.5 cursor-pointer shrink-0 shadow-xs"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>Join Community</span>
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── TAB 2: POSTS & UPDATES WITHIN COMMUNITY ── */}
          <TabsContent value="feed" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Official Hub Posts & Community Dispatches
              </h3>
              <Button
                size="sm"
                onClick={() => navigate(`/community?create=true&commId=${community.id}`)}
                className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer flex items-center gap-1.5"
              >
                <PlusSquare className="h-3.5 w-3.5" /> New Community Post
              </Button>
            </div>

            {loadingPosts ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
              </div>
            ) : !postsData?.content || postsData.content.length === 0 ? (
              <div className="py-16 text-center rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 p-6 space-y-2">
                <FileText className="h-8 w-8 mx-auto text-slate-400" />
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">No posts in this community yet</h4>
                <p className="text-[11px] text-slate-400">Publish dispatches, updates, and research to this community circle.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {postsData.content.map((p: any) => (
                  <Card key={p.id} className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#121517] p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 rounded-lg">
                          <AvatarFallback className="text-[10px] font-bold bg-slate-900 text-white">
                            {getInitials(p.author?.displayName || p.authorName || "Member")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white block">
                            {p.author?.displayName || p.authorName || "Ecosystem Member"}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {new Date(p.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[9px] uppercase font-bold">
                        {p.visibility || "PROTECTED"}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{p.content}</p>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── TAB 3: MEMBERS ── */}
          <TabsContent value="members" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Verified Community Members ({community.memberCount || 1})
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {/* Owner Card */}
              <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="h-9 w-9 rounded-full ring-2 ring-amber-500/30">
                    <AvatarFallback className="bg-amber-600 text-white font-bold text-xs">
                      {getInitials(community.ownerName || "Owner")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                      {community.ownerName || "Community Lead"}
                    </span>
                    <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-semibold block">
                      Group Founder / Admin
                    </span>
                  </div>
                </div>
                <Badge className="text-[9px] bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40 uppercase font-extrabold">
                  Admin
                </Badge>
              </div>

              {/* Joined Indicator */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/60 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="h-9 w-9 rounded-full">
                    <AvatarFallback className="bg-emerald-600 text-white font-bold text-xs">
                      {getInitials(authUser?.displayName || "You")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                      {authUser?.displayName || "Your Account"}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Active Member
                    </span>
                  </div>
                </div>
                <Badge className="text-[9px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 uppercase font-extrabold">
                  Active
                </Badge>
              </div>
            </div>
          </TabsContent>

          {/* ── TAB 4: GUIDELINES & ABOUT ── */}
          <TabsContent value="about" className="space-y-4">
            <Card className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#121517] p-5 space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">About This Community Circle</h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{community.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Community Rules & Protocols</h3>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  {(community.rules && community.rules.length > 0 ? community.rules : [
                    "Professional decorum required across all posts and group chats.",
                    "No solicitation outside secondary and venture equity covenants.",
                    "Protected and private access controls must be respected.",
                  ]).map((r: any, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{typeof r === "string" ? r : r.title || r.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
