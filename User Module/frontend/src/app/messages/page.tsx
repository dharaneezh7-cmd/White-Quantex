import React, { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { useParams, useSearchParams, useNavigate, Link } from "react-router"
import {
  ShieldCheck, Shield, Lock, Key, Check, CheckCheck, Send, Search,
  Plus, ArrowLeft, RefreshCw, AlertTriangle, Eye, EyeOff, FileText,
  Code, Paperclip, Copy, Trash2, Edit3, Smile, Pin, VolumeX,
  Volume2, Archive, ArchiveRestore, Sparkles, User, Info,
  CheckCircle2, CornerDownLeft, Clock, X, MoreVertical, ArrowDown
} from "lucide-react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { VerificationBadge } from "@/components/shared/VerificationBadge"
import { chatService, ConversationItem, ThreadData, MessageItem, ChatPartner } from "@/services/chat/chatService"
import {
  getSocket,
  subscribeConnectionStatus,
  emitTypingStart,
  emitTypingStop,
  emitMessageDelivered,
  emitMessageRead,
  requestConversationSync,
} from "@/services/chat/socketClient"
import { ConnectionStatus } from "@/services/chat/socketTypes"
import { communityService, CommunityMember } from "@/services/community/communityService"
import { useAuthStore } from "@/stores/auth-store"
import { cn, formatNumber, getInitials } from "@/lib/utils"

const EMOJI_OPTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"]

export default function MessagesPage() {
  const params = useParams<{ conversationId?: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user: authUser } = useAuthStore()

  // Active Identifiers
  const routeConvId = params.conversationId
  const userParam = searchParams.get("user")
  const usernameParam = searchParams.get("username")
  const nameParam = searchParams.get("name")
  const convParam = searchParams.get("conv")

  // State
  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(routeConvId || convParam || null)
  const [threadData, setThreadData] = useState<ThreadData | null>(null)
  const [loadingConversations, setLoadingConversations] = useState(true)
  const [loadingThread, setLoadingThread] = useState(false)
  const [resolvingUser, setResolvingUser] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [hasUnreadBelow, setHasUnreadBelow] = useState(false)

  // Filters & Search (persisted across sub-routes without resets)
  const [searchQuery, setSearchQuery] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("wq_chat_search") || ""
    }
    return ""
  })
  const [activeFilter, setActiveFilter] = useState<"all" | "unread" | "archived">(() => {
    if (typeof window !== "undefined") {
      return (sessionStorage.getItem("wq_chat_filter") as any) || "all"
    }
    return "all"
  })
  const [inputText, setInputText] = useState("")

  // Real-Time Typing & Presence
  const [partnerTyping, setPartnerTyping] = useState<string | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Message Actions State
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState("")
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null)

  // Cryptographic Inspector
  const [rawCiphertextMode, setRawCiphertextMode] = useState(false)
  const [securityModalOpen, setSecurityModalOpen] = useState(false)
  const [inspectMessage, setInspectMessage] = useState<MessageItem | null>(null)
  const [tamperTestStatus, setTamperTestStatus] = useState<"idle" | "tampered" | "verified">("idle")
  const [tamperErrorMsg, setTamperErrorMsg] = useState("")

  // New Chat Modal
  const [newChatModalOpen, setNewChatModalOpen] = useState(false)
  const [allMembers, setAllMembers] = useState<CommunityMember[]>([])
  const [loadingMembers, setLoadingMembers] = useState(false)

  // References & Stale Response Protection
  const chatScrollContainerRef = useRef<HTMLDivElement>(null)
  const activeFetchIdRef = useRef<number>(0)
  const resolutionIdRef = useRef<number>(0)
  const threadCacheRef = useRef<Record<string, ThreadData>>({})
  const activeConversationIdRef = useRef<string | null>(activeConversationId)
  activeConversationIdRef.current = activeConversationId
  const loadingOlderRef = useRef<boolean>(false)
  const [connStatus, setConnStatus] = useState<ConnectionStatus>("connected")

  useEffect(() => {
    return subscribeConnectionStatus(setConnStatus)
  }, [])

  // Independent chat history scrolling — operates ONLY on inner chat container
  const scrollToBottom = useCallback((smooth = true) => {
    if (chatScrollContainerRef.current) {
      const container = chatScrollContainerRef.current
      if (smooth) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: "smooth",
        })
      } else {
        container.scrollTop = container.scrollHeight
      }
    }
  }, [])

  const handleChatScroll = async () => {
    if (!chatScrollContainerRef.current) return
    const el = chatScrollContainerRef.current
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 90
    if (isNearBottom && hasUnreadBelow) {
      setHasUnreadBelow(false)
    }

    // Cursor Pagination: Prepend older messages when scrolling to top
    if (el.scrollTop < 30 && activeConversationId && threadData?.hasMore && !loadingOlderRef.current) {
      const oldestMessage = threadData.messages[0]
      if (oldestMessage) {
        loadingOlderRef.current = true
        const prevScrollHeight = el.scrollHeight
        try {
          const older = await chatService.getMessages(activeConversationId, oldestMessage.createdAt, 25)
          if (older && older.messages.length > 0) {
            setThreadData((prev) => {
              if (!prev) return prev
              const existingIds = new Set(prev.messages.map((m) => m.id))
              const newUnique = older.messages.filter((m) => !existingIds.has(m.id))
              return {
                ...prev,
                messages: [...newUnique, ...prev.messages],
                hasMore: older.hasMore,
                nextCursor: older.nextCursor,
              }
            })
            // Preserve exact scroll position
            requestAnimationFrame(() => {
              if (chatScrollContainerRef.current) {
                const addedHeight = chatScrollContainerRef.current.scrollHeight - prevScrollHeight
                chatScrollContainerRef.current.scrollTop = addedHeight
              }
            })
          }
        } catch (err) {
          console.error("[Messages] Error loading older batch:", err)
        } finally {
          loadingOlderRef.current = false
        }
      }
    }
  }

  // ── 1. Load Conversations ──────────────────────────────────────────────────
  const refreshConversations = useCallback(async () => {
    try {
      const list = await chatService.getConversations()
      setConversations(list)
      return list
    } catch (err) {
      console.error("[Messages] Failed to load conversations:", err)
      return []
    } finally {
      setLoadingConversations(false)
    }
  }, [])

  // ── 2. Select Conversation Without Page Reload ─────────────────────────────
  const handleSelectConversation = useCallback((convId: string) => {
    if (convId === activeConversationId) return
    setActiveConversationId(convId)
    // Update route with preventScrollReset to preserve scroll position and support browser back/forward navigation
    navigate(`/messages/${encodeURIComponent(convId)}`, { preventScrollReset: true })
  }, [activeConversationId, navigate])

  // ── 3. Resolve Canonical Conversation from Route or Query ─────────────────
  useEffect(() => {
    // Priority A: Route parameter /messages/:conversationId
    if (routeConvId) {
      if (routeConvId !== activeConversationId) {
        setActiveConversationId(routeConvId)
      }
      return
    }

    // Priority B: Query param /messages?conv=:conversationId
    if (convParam) {
      setActiveConversationId(convParam)
      navigate(`/messages/${encodeURIComponent(convParam)}`, { replace: true, preventScrollReset: true })
      return
    }

    // Priority C: Target User parameter /messages?user=:userId
    if (userParam) {
      const currentResId = ++resolutionIdRef.current
      setResolvingUser(true)

      const resolveUserChat = async () => {
        try {
          const existing = conversations.find(
            (c) =>
              c.partner?.wqUserId === userParam ||
              c.partner?.id === userParam ||
              (usernameParam && c.partner?.username?.toLowerCase() === usernameParam.toLowerCase()) ||
              (userParam && c.partner?.username?.toLowerCase() === userParam.toLowerCase())
          )

          if (existing) {
            if (resolutionIdRef.current === currentResId) {
              setActiveConversationId(existing.conversationId)
              navigate(`/messages/${encodeURIComponent(existing.conversationId)}`, { replace: true, preventScrollReset: true })
            }
          } else {
            const init = await chatService.startConversation(userParam, usernameParam || undefined, nameParam || undefined)
            if (resolutionIdRef.current === currentResId && init?.conversationId) {
              setActiveConversationId(init.conversationId)
              await refreshConversations()
              navigate(`/messages/${encodeURIComponent(init.conversationId)}`, { replace: true, preventScrollReset: true })
            }
          }
        } catch (err) {
          console.error("[Messages] User resolution error:", err)
        } finally {
          if (resolutionIdRef.current === currentResId) {
            setResolvingUser(false)
          }
        }
      }

      resolveUserChat()
      return
    }

    // Priority D: Default to first conversation on desktop without resetting scroll
    if (!activeConversationId && conversations.length > 0 && typeof window !== "undefined" && window.innerWidth >= 768) {
      const first = conversations[0].conversationId
      setActiveConversationId(first)
      navigate(`/messages/${encodeURIComponent(first)}`, { replace: true, preventScrollReset: true })
    }
  }, [routeConvId, userParam, usernameParam, nameParam, convParam, conversations.length, activeConversationId, navigate, refreshConversations])

  // Initial fetch of conversations on mount
  useEffect(() => {
    refreshConversations()
  }, [refreshConversations])

  // ── 4. Fetch Message Thread (With Race Condition Stale Response Protection) ─
  const fetchThread = useCallback(async (convId: string, showLoader = false) => {
    const currentFetchId = ++activeFetchIdRef.current
    if (showLoader) setLoadingThread(true)

    try {
      const data = await chatService.getMessages(convId)
      // Discard older responses if user switched conversations rapidly (User A -> B -> C)
      if (activeFetchIdRef.current !== currentFetchId) {
        return
      }

      if (data) {
        threadCacheRef.current[convId] = data
      }
      setThreadData(data)
      setHasUnreadBelow(false)

      if (showLoader) {
        // Scroll only the message history container to latest message
        setTimeout(() => {
          if (chatScrollContainerRef.current) {
            chatScrollContainerRef.current.scrollTop = chatScrollContainerRef.current.scrollHeight
          }
        }, 30)
      }
    } catch (err) {
      if (activeFetchIdRef.current === currentFetchId) {
        console.error("[Messages] Failed to fetch thread:", err)
      }
    } finally {
      if (activeFetchIdRef.current === currentFetchId && showLoader) {
        setLoadingThread(false)
      }
    }
  }, [])

  useEffect(() => {
    if (!activeConversationId) {
      setThreadData(null)
      return
    }

    // Check memory cache for instant, zero-flicker conversation switching
    const cached = threadCacheRef.current[activeConversationId]
    if (cached) {
      setThreadData(cached)
      setLoadingThread(false)
      // Background revalidation without destructive blank spinner
      fetchThread(activeConversationId, false)
      setTimeout(() => {
        if (chatScrollContainerRef.current) {
          chatScrollContainerRef.current.scrollTop = chatScrollContainerRef.current.scrollHeight
        }
      }, 10)
    } else {
      fetchThread(activeConversationId, true)
    }
  }, [activeConversationId, fetchThread])

  // ── 5. Socket.IO Real-Time Synchronization ─────────────────────────────────
  useEffect(() => {
    const socket = getSocket(authUser?.id, authUser?.username)

    const joinCurrentRooms = (convId: string | null) => {
      if (convId) {
        socket.emit("join_conversation", convId)
        socket.emit("conversation:join", { conversationId: convId })
      }
    }

    joinCurrentRooms(activeConversationId)

    const handleConnect = () => {
      joinCurrentRooms(activeConversationIdRef.current)
    }

    // New Message Received / Dispatched
    const handleNewMessage = (msg: MessageItem) => {
      const currentActiveId = activeConversationIdRef.current
      const currentUserId = authUser?.id || "bbc5fd04-2c10-430d-9a14-f29a2d60cccc"
      const isMe = msg.senderWqUserId === currentUserId

      // Thread matches if identical convId or participants match
      const isCurrentThread = Boolean(
        currentActiveId && msg.conversationId && (
          msg.conversationId === currentActiveId ||
          (currentActiveId.includes(msg.senderWqUserId) && currentActiveId.includes(msg.recipientWqUserId))
        )
      )

      if (isCurrentThread) {
        // Clear partner typing state when new reply or message arrives
        if (!isMe) {
          setPartnerTyping(null)
        }

        setThreadData((prev) => {
          if (!prev) {
            // Thread not yet loaded into memory: immediately trigger fetch
            if (currentActiveId) fetchThread(currentActiveId)
            return null
          }
          if (prev.messages.some((m) => m.id === msg.id)) return prev

          const updatedMessages = [...prev.messages, { ...msg, isFromMe: isMe }]

          // Update thread cache immediately
          if (threadCacheRef.current && currentActiveId) {
            threadCacheRef.current[currentActiveId] = {
              ...prev,
              messages: updatedMessages,
            }
          }

          return {
            ...prev,
            messages: updatedMessages,
          }
        })

        // Auto-emit read receipt if viewing active thread
        if (!isMe && currentActiveId) {
          emitMessageRead(currentActiveId, [msg.id])
          chatService.markAsRead(currentActiveId, [msg.id]).catch(() => {})
        }

        // Force scroll down for own messages or replies so changes are immediately visible
        const el = chatScrollContainerRef.current
        const isNearBottom = el ? el.scrollHeight - el.scrollTop - el.clientHeight < 160 : true

        if (isMe || isNearBottom || !isMe) {
          setTimeout(() => scrollToBottom(true), 40)
          setTimeout(() => scrollToBottom(false), 120)
          setHasUnreadBelow(false)
        } else {
          setHasUnreadBelow(true)
        }
      }

      // Update sidebar snippet & reorder conversation to top
      setConversations((prev) => {
        let matched = false
        const updated = prev.map((c) => {
          const isThisConv =
            c.conversationId === msg.conversationId ||
            (c.partner?.wqUserId && (c.partner.wqUserId === msg.senderWqUserId || c.partner.wqUserId === msg.recipientWqUserId))

          if (isThisConv) {
            matched = true
            return {
              ...c,
              lastMessage: {
                content: msg.content,
                senderWqUserId: msg.senderWqUserId,
                isFromMe: isMe,
                createdAt: msg.createdAt,
                isRead: msg.isRead,
                deliveryStatus: msg.deliveryStatus || "DELIVERED",
              },
              unreadCount: (!isMe && currentActiveId !== c.conversationId)
                ? (c.unreadCount || 0) + 1
                : 0,
              updatedAt: msg.createdAt,
            }
          }
          return c
        })

        if (!matched && msg.conversationId) {
          refreshConversations()
        }

        return updated.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1
          if (!a.isPinned && b.isPinned) return 1
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        })
      })
    }

    // Force Update Handler (Pushed directly by backend on replies)
    const handleForceUpdate = (payload: { conversationId: string; message?: MessageItem; type: string }) => {
      if (payload.message) {
        handleNewMessage(payload.message)
      } else if (payload.conversationId && payload.conversationId === activeConversationIdRef.current) {
        fetchThread(payload.conversationId)
      }
    }

    // Message Delivered Receipt
    const handleMessageDelivered = (data: { conversationId: string; messageId: string }) => {
      const currentActiveId = activeConversationIdRef.current
      if (data.conversationId === currentActiveId) {
        setThreadData((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            messages: prev.messages.map((m) =>
              m.id === data.messageId && m.deliveryStatus !== "READ"
                ? { ...m, deliveryStatus: "DELIVERED" }
                : m
            ),
          }
        })
      }
    }

    // Typing Indicator
    const handleUserTyping = (data: { conversationId: string; wqUserId: string; username: string; isTyping: boolean }) => {
      const currentActiveId = activeConversationIdRef.current
      const currentUserId = authUser?.id || "bbc5fd04-2c10-430d-9a14-f29a2d60cccc"
      const isCurrent =
        data.conversationId === currentActiveId ||
        (currentActiveId && (currentActiveId.includes(data.wqUserId)))

      if (isCurrent && data.wqUserId !== currentUserId) {
        setPartnerTyping(data.isTyping ? data.username || "Partner" : null)
        if (data.isTyping) {
          setTimeout(() => scrollToBottom(true), 40)
        }
      }
    }

    // Read Receipts
    const handleMessagesRead = (data: { conversationId: string; readerWqUserId: string; messageIds: string[] }) => {
      const currentActiveId = activeConversationIdRef.current
      if (data.conversationId === currentActiveId) {
        setThreadData((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            messages: prev.messages.map((m) =>
              data.messageIds.includes(m.id)
                ? { ...m, isRead: true, deliveryStatus: "READ" }
                : m
            ),
          }
        })
      }
    }

    // Reaction Updates
    const handleReactionUpdate = (data: { conversationId: string; messageId: string; reactions: any[] }) => {
      const currentActiveId = activeConversationIdRef.current
      if (data.conversationId === currentActiveId) {
        setThreadData((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            messages: prev.messages.map((m) =>
              m.id === data.messageId ? { ...m, reactions: data.reactions } : m
            ),
          }
        })
      }
    }

    // Message Edited
    const handleMessageEdited = (editedMsg: MessageItem) => {
      const currentActiveId = activeConversationIdRef.current
      if (editedMsg.conversationId === currentActiveId) {
        setThreadData((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            messages: prev.messages.map((m) =>
              m.id === editedMsg.id
                ? { ...m, content: editedMsg.content, isEdited: true, crypto: editedMsg.crypto }
                : m
            ),
          }
        })
      }
    }

    // Message Deleted
    const handleMessageDeleted = (data: { conversationId: string; messageId: string; mode: string }) => {
      const currentActiveId = activeConversationIdRef.current
      if (data.conversationId === currentActiveId) {
        setThreadData((prev) => {
          if (!prev) return prev
          if (data.mode === "everyone") {
            return {
              ...prev,
              messages: prev.messages.map((m) =>
                m.id === data.messageId
                  ? { ...m, content: "This message was deleted", isDeleted: true }
                  : m
              ),
            }
          }
          return {
            ...prev,
            messages: prev.messages.filter((m) => m.id !== data.messageId),
          }
        })
      }
    }

    // Presence Change
    const handlePresenceChange = (data: { wqUserId: string; isOnline: boolean }) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.partner?.wqUserId === data.wqUserId
            ? { ...c, partner: { ...c.partner, isOnline: data.isOnline } }
            : c
        )
      )
      setThreadData((prev) => {
        if (prev && prev.partner.wqUserId === data.wqUserId) {
          return { ...prev, partner: { ...prev.partner, isOnline: data.isOnline } }
        }
        return prev
      })
    }

    // Reconnection Synchronization
    const handleReconnect = async () => {
      const currentActiveId = activeConversationIdRef.current
      if (currentActiveId) {
        socket.emit("join_conversation", currentActiveId)
        socket.emit("conversation:join", { conversationId: currentActiveId })
        if (threadData?.messages && threadData.messages.length > 0) {
          const lastMsg = threadData.messages[threadData.messages.length - 1]
          const syncRes = await requestConversationSync(currentActiveId, lastMsg.createdAt)
          if (syncRes && Array.isArray(syncRes.messages) && syncRes.messages.length > 0) {
            setThreadData((prev) => {
              if (!prev) return prev
              const existingIds = new Set(prev.messages.map((m) => m.id))
              const newIncoming = syncRes.messages.filter((m) => !existingIds.has(m.id))
              if (newIncoming.length === 0) return prev
              return {
                ...prev,
                messages: [...prev.messages, ...newIncoming],
              }
            })
          }
        }
      }
    }

    // Register listeners
    socket.on("connect", handleConnect)
    socket.on("message:new", handleNewMessage)
    socket.on("new_message", handleNewMessage)
    socket.on("chat:force_update", handleForceUpdate)
    socket.on("chat_force_update", handleForceUpdate)
    socket.on("message:delivered", handleMessageDelivered)
    socket.on("message_delivered", handleMessageDelivered)
    socket.on("message:read", handleMessagesRead)
    socket.on("messages_read", handleMessagesRead)
    socket.on("typing:start", handleUserTyping)
    socket.on("typing:stop", (d) => handleUserTyping({ ...d, isTyping: false }))
    socket.on("user_typing", handleUserTyping)
    socket.on("message_reactions_update", handleReactionUpdate)
    socket.on("reaction:updated", handleReactionUpdate)
    socket.on("message_edited", handleMessageEdited)
    socket.on("message:edited", handleMessageEdited)
    socket.on("message_deleted", handleMessageDeleted)
    socket.on("message:deleted", handleMessageDeleted)
    socket.on("presence:online", (d) => handlePresenceChange({ ...d, isOnline: true }))
    socket.on("presence:offline", (d) => handlePresenceChange({ ...d, isOnline: false }))
    socket.on("presence_change", handlePresenceChange)
    socket.on("reconnect", handleReconnect)

    return () => {
      if (activeConversationId) {
        socket.emit("leave_conversation", activeConversationId)
        socket.emit("conversation:leave", { conversationId: activeConversationId })
      }
      socket.off("connect", handleConnect)
      socket.off("message:new", handleNewMessage)
      socket.off("new_message", handleNewMessage)
      socket.off("chat:force_update", handleForceUpdate)
      socket.off("chat_force_update", handleForceUpdate)
      socket.off("message:delivered", handleMessageDelivered)
      socket.off("message_delivered", handleMessageDelivered)
      socket.off("message:read", handleMessagesRead)
      socket.off("messages_read", handleMessagesRead)
      socket.off("typing:start", handleUserTyping)
      socket.off("typing:stop")
      socket.off("user_typing", handleUserTyping)
      socket.off("message_reactions_update", handleReactionUpdate)
      socket.off("reaction:updated", handleReactionUpdate)
      socket.off("message_edited", handleMessageEdited)
      socket.off("message:edited", handleMessageEdited)
      socket.off("message_deleted", handleMessageDeleted)
      socket.off("message:deleted", handleMessageDeleted)
      socket.off("presence:online")
      socket.off("presence:offline")
      socket.off("presence_change", handlePresenceChange)
      socket.off("reconnect", handleReconnect)
    }
  }, [activeConversationId, authUser?.id, authUser?.username, fetchThread, refreshConversations, scrollToBottom])

  // ── 6. Input Typing & Send Dispatch ────────────────────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInputText(val)

    if (activeConversationId) {
      emitTypingStart(activeConversationId)

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = setTimeout(() => {
        emitTypingStop(activeConversationId)
      }, 1500)
    }
  }

  const handleSendMessage = async (customContent?: string, contentType: "TEXT" | "CODE" | "DOCUMENT" = "TEXT") => {
    const textToSend = customContent || inputText
    if (!textToSend.trim() || !activeConversationId) return

    setSendingMessage(true)
    const optimisticText = textToSend.trim()
    if (!customContent) setInputText("")

    // Stop typing indicator immediately
    emitTypingStop(activeConversationId)
    const idempotencyKey = `idemp_${Date.now()}_${Math.random().toString(36).slice(2)}`

    try {
      const partnerId = threadData?.partner?.wqUserId || threadData?.partner?.id
      const dispatched = await chatService.sendMessage({
        conversationId: activeConversationId,
        recipientWqUserId: partnerId,
        content: optimisticText,
        contentType,
        idempotencyKey,
      })

      setThreadData((prev) => {
        if (!prev) return prev
        if (prev.messages.some((m) => m.id === dispatched.id)) return prev
        return {
          ...prev,
          messages: [...prev.messages, dispatched],
        }
      })

      setConversations((prev) =>
        prev.map((c) =>
          c.conversationId === activeConversationId
            ? {
                ...c,
                lastMessage: {
                  content: optimisticText,
                  senderWqUserId: authUser?.id,
                  isFromMe: true,
                  createdAt: new Date().toISOString(),
                  isRead: false,
                  deliveryStatus: "SENT",
                },
                updatedAt: new Date().toISOString(),
              }
            : c
        )
      )

      // Smooth scroll inside chat container only
      setTimeout(() => scrollToBottom(true), 30)
    } catch (err: any) {
      console.error("[Messages] Send error:", err)
      alert(`Message dispatch failed: ${err.message || "Encryption error"}`)
    } finally {
      setSendingMessage(false)
    }
  }

  // ── 7. Message Actions (Edit, Delete, React) ────────────────────────────────
  const handleSaveEdit = async (messageId: string) => {
    if (!editingContent.trim()) return
    try {
      const updated = await chatService.editMessage(messageId, editingContent.trim())
      setThreadData((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          messages: prev.messages.map((m) => (m.id === messageId ? updated : m)),
        }
      })
      setEditingMessageId(null)
      setEditingContent("")
    } catch (err: any) {
      alert(`Edit failed: ${err.message}`)
    }
  }

  const handleDeleteMessage = async (messageId: string, mode: "everyone" | "me") => {
    try {
      await chatService.deleteMessage(messageId, mode)
      setThreadData((prev) => {
        if (!prev) return prev
        if (mode === "everyone") {
          return {
            ...prev,
            messages: prev.messages.map((m) =>
              m.id === messageId ? { ...m, content: "This message was deleted", isDeleted: true } : m
            ),
          }
        }
        return {
          ...prev,
          messages: prev.messages.filter((m) => m.id !== messageId),
        }
      })
      setActiveActionMenuId(null)
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`)
    }
  }

  const handleToggleReaction = async (messageId: string, emoji: string) => {
    try {
      const res = await chatService.toggleReaction(messageId, emoji)
      setThreadData((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          messages: prev.messages.map((m) =>
            m.id === messageId ? { ...m, reactions: res.reactions } : m
          ),
        }
      })
    } catch (err) {
      console.error("[Messages] Reaction error:", err)
    }
  }

  // ── 8. Conversation Controls (Pin, Mute, Archive) ───────────────────────────
  const handleTogglePin = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const isPinned = await chatService.togglePin(convId)
      setConversations((prev) =>
        prev
          .map((c) => (c.conversationId === convId ? { ...c, isPinned } : c))
          .sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1
            if (!a.isPinned && b.isPinned) return 1
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          })
      )
    } catch (err) {
      console.error("[Messages] Pin error:", err)
    }
  }

  const handleToggleMute = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const isMuted = await chatService.toggleMute(convId)
      setConversations((prev) =>
        prev.map((c) => (c.conversationId === convId ? { ...c, isMuted } : c))
      )
    } catch (err) {
      console.error("[Messages] Mute error:", err)
    }
  }

  const handleToggleArchive = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const isArchived = await chatService.toggleArchive(convId)
      setConversations((prev) =>
        prev.map((c) => (c.conversationId === convId ? { ...c, isArchived } : c))
      )
    } catch (err) {
      console.error("[Messages] Archive error:", err)
    }
  }

  // ── 9. Cryptographic Audit Inspector ────────────────────────────────────────
  const handleOpenInspector = (msg: MessageItem) => {
    setInspectMessage(msg)
    setTamperTestStatus("idle")
    setTamperErrorMsg("")
    setSecurityModalOpen(true)
    setActiveActionMenuId(null)
  }

  const handleRunTamperTest = async (message: MessageItem) => {
    if (!message.crypto) return
    setTamperTestStatus("idle")
    setTamperErrorMsg("")
    try {
      const originalCipher = message.crypto.ciphertext
      const tamperedCipher = originalCipher.startsWith("A") ? "B" + originalCipher.slice(1) : "A" + originalCipher.slice(1)
      const result = await chatService.verifyIntegrity({
        ciphertext: tamperedCipher,
        iv: message.crypto.iv,
        authTag: message.crypto.authTag,
        conversationId: message.conversationId,
      })
      if (result.isValid) {
        setTamperTestStatus("verified")
      } else {
        setTamperTestStatus("tampered")
        setTamperErrorMsg("Galois Authentication Tag mismatch: Tampered ciphertext was rejected by AES-256-GCM verification.")
      }
    } catch (err: any) {
      setTamperTestStatus("tampered")
      setTamperErrorMsg(err.message || "Cryptographic integrity failed. Ciphertext altered in transit.")
    }
  }

  const handleVerifyAuthentic = async (message: MessageItem) => {
    if (!message.crypto) return
    setTamperTestStatus("idle")
    setTamperErrorMsg("")
    try {
      const result = await chatService.verifyIntegrity({
        ciphertext: message.crypto.ciphertext,
        iv: message.crypto.iv,
        authTag: message.crypto.authTag,
        conversationId: message.conversationId,
      })
      if (result.isValid) {
        setTamperTestStatus("verified")
      } else {
        setTamperTestStatus("tampered")
        setTamperErrorMsg("Integrity verification failed.")
      }
    } catch (err: any) {
      setTamperTestStatus("tampered")
      setTamperErrorMsg(err.message)
    }
  }

  // ── 10. Start New Chat Dialog ───────────────────────────────────────────────
  const handleOpenNewChat = async () => {
    setNewChatModalOpen(true)
    if (allMembers.length === 0) {
      setLoadingMembers(true)
      try {
        const members = await communityService.getMembers()
        setAllMembers(members)
      } catch (err) {
        console.error("[Messages] Load members error:", err)
      } finally {
        setLoadingMembers(false)
      }
    }
  }

  const handleSelectMemberToChat = async (targetMember: CommunityMember) => {
    try {
      setNewChatModalOpen(false)
      const targetId = targetMember.wqUserId || targetMember.id
      const res = await chatService.startConversation(targetId, targetMember.username, targetMember.name)
      if (res?.conversationId) {
        setActiveConversationId(res.conversationId)
        await refreshConversations()
        navigate(`/messages/${encodeURIComponent(res.conversationId)}`, { replace: true, preventScrollReset: true })
      }
    } catch (err) {
      console.error("[Messages] Failed to initiate chat:", err)
    }
  }

  // Filtered Conversations List (Search & Filter Persistence)
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      if (activeFilter === "unread" && c.unreadCount === 0) return false
      if (activeFilter === "archived" && !c.isArchived) return false
      if (activeFilter !== "archived" && c.isArchived) return false

      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase().trim()
      const matchName = c.partner?.name?.toLowerCase().includes(q)
      const matchUser = c.partner?.username?.toLowerCase().includes(q)
      const matchLast = c.lastMessage?.content?.toLowerCase().includes(q)
      return matchName || matchUser || matchLast
    })
  }, [conversations, activeFilter, searchQuery])

  // Active Partner Details (prioritize threadData, then conversation list)
  const activePartner: ChatPartner | undefined = useMemo(() => {
    if (threadData?.partner) return threadData.partner
    const fromList = conversations.find((c) => c.conversationId === activeConversationId)?.partner
    if (fromList) return fromList
    if (nameParam || usernameParam || userParam) {
      return {
        id: userParam || "resolving",
        wqUserId: userParam || "resolving",
        name: nameParam || (usernameParam ? usernameParam.charAt(0).toUpperCase() + usernameParam.slice(1) : "Ecosystem Member"),
        username: usernameParam || userParam || "member",
        headline: "Verified Ecosystem Participant",
        avatarUrl: "",
        verificationLevel: "GOLD",
        trustScore: 95,
        isOnline: true,
      }
    }
    return undefined
  }, [threadData?.partner, conversations, activeConversationId, nameParam, usernameParam, userParam])

  return (
    <ProtectedRoute>
      <div className="w-full flex flex-col h-[calc(100vh-4rem)] max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-4">
        {/* Top Status Bar */}
        <div className="w-full mb-2 sm:mb-3 flex items-center justify-between px-1 shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <ShieldCheck className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              White Quantex E2EE Messaging Protocol
            </span>
            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono">
              AES-256-GCM
            </Badge>

            {/* Live Socket Connection Status */}
            <div
              className={cn(
                "hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono border",
                connStatus === "connected"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                  : connStatus === "reconnecting"
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  connStatus === "connected"
                    ? "bg-emerald-500"
                    : connStatus === "reconnecting"
                    ? "bg-amber-500 animate-ping"
                    : "bg-rose-500"
                )}
              />
              <span className="uppercase text-[9px] font-bold">{connStatus}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setRawCiphertextMode(!rawCiphertextMode)}
              className={cn(
                "h-7 px-2.5 text-xs font-semibold rounded-lg cursor-pointer transition-colors",
                rawCiphertextMode
                  ? "bg-amber-500/10 text-amber-500 border border-amber-500/30"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              {rawCiphertextMode ? (
                <>
                  <EyeOff className="h-3.5 w-3.5 mr-1" /> View Plaintext
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5 mr-1" /> View Ciphertext
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Split-Pane Chat Interface */}
        <div className="w-full flex-1 min-h-0 bg-white dark:bg-[#0c0e10] border border-slate-200 dark:border-zinc-800/80 rounded-2xl shadow-xl overflow-hidden flex">
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* LEFT: Conversation List Sidebar                                    */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          <div
            className={cn(
              "w-full md:w-80 lg:w-96 flex-col border-r border-slate-200 dark:border-zinc-800/80 shrink-0 bg-slate-50/50 dark:bg-[#0f1214]",
              activeConversationId ? "hidden md:flex" : "flex"
            )}
          >
            {/* Sidebar Header */}
            <div className="p-3.5 border-b border-slate-200 dark:border-zinc-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">Direct Messages</h1>
                  <p className="text-[11px] text-slate-400">Authenticated Galois Encrypted Stream</p>
                </div>
                <Button
                  size="icon"
                  onClick={handleOpenNewChat}
                  className="h-8 w-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-sm shadow-emerald-500/20"
                  title="New Encrypted Conversation"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    if (typeof window !== "undefined") sessionStorage.setItem("wq_chat_search", e.target.value)
                  }}
                  placeholder="Search dispatches or partners..."
                  className="pl-8 h-8 text-xs bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-xl"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 pt-0.5">
                {(["all", "unread", "archived"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => {
                      setActiveFilter(filter)
                      if (typeof window !== "undefined") sessionStorage.setItem("wq_chat_filter", filter)
                    }}
                    className={cn(
                      "px-2.5 py-1 text-[11px] font-bold rounded-lg capitalize transition-colors cursor-pointer",
                      activeFilter === filter
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversation List Scroll Area */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800/40">
              {loadingConversations ? (
                <div className="p-6 text-center space-y-3">
                  <RefreshCw className="h-5 w-5 animate-spin mx-auto text-emerald-500" />
                  <p className="text-xs text-slate-400">Loading secure threads...</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center space-y-3">
                  <div className="h-10 w-10 mx-auto rounded-xl bg-slate-100 dark:bg-zinc-800/50 flex items-center justify-center text-slate-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-500">No conversations found</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleOpenNewChat}
                    className="text-xs h-7 rounded-lg cursor-pointer"
                  >
                    Start First Thread
                  </Button>
                </div>
              ) : (
                filteredConversations.map((c) => {
                  const isActive = c.conversationId === activeConversationId
                  return (
                    <div
                      key={c.conversationId}
                      data-testid="conversation-item"
                      data-conversation-id={c.conversationId}
                      onClick={() => handleSelectConversation(c.conversationId)}
                      className={cn(
                        "group relative p-3 sm:p-3.5 flex items-start gap-3 cursor-pointer transition-all border-l-2",
                        isActive
                          ? "bg-emerald-500/10 dark:bg-emerald-950/20 border-emerald-500"
                          : "border-transparent hover:bg-slate-100/60 dark:hover:bg-zinc-900/40"
                      )}
                    >
                      {/* Avatar with Online Presence Dot */}
                      <div className="relative shrink-0">
                        <Avatar className="h-10 w-10 rounded-xl ring-1 ring-slate-200 dark:ring-zinc-800">
                          <AvatarImage src={c.partner?.avatarUrl} alt={c.partner?.name} />
                          <AvatarFallback className="bg-slate-800 text-white font-bold text-xs rounded-xl">
                            {getInitials(c.partner?.name || "WQ")}
                          </AvatarFallback>
                        </Avatar>
                        {c.partner?.isOnline && (
                          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0f1214]" />
                        )}
                      </div>

                      {/* Conversation Content Preview */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {c.partner?.name || "Ecosystem Partner"}
                            </span>
                            {c.isPinned && (
                              <Pin className="h-3 w-3 text-emerald-500 fill-emerald-500 shrink-0" />
                            )}
                            {c.isMuted && (
                              <VolumeX className="h-3 w-3 text-slate-400 shrink-0" />
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {c.lastMessage?.createdAt
                              ? new Date(c.lastMessage.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                              : ""}
                          </span>
                        </div>

                        {/* Last message with WhatsApp status ticks */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {c.lastMessage?.isFromMe && (
                              <span className="shrink-0">
                                {c.lastMessage.deliveryStatus === "READ" ? (
                                  <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
                                ) : c.lastMessage.deliveryStatus === "DELIVERED" ? (
                                  <CheckCheck className="h-3.5 w-3.5 text-slate-400" />
                                ) : (
                                  <Check className="h-3.5 w-3.5 text-slate-400" />
                                )}
                              </span>
                            )}
                            <span className="truncate">{c.lastMessage?.content || "Encrypted thread"}</span>
                          </div>

                          {c.unreadCount > 0 && (
                            <span className="shrink-0 px-1.5 py-0.2 rounded-full bg-emerald-600 text-[10px] font-extrabold text-white">
                              {c.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Hover Controls (Pin, Mute, Archive) */}
                      <div className="absolute right-2 top-2 hidden group-hover:flex items-center gap-1 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xs p-1 rounded-lg border border-slate-200 dark:border-zinc-700 shadow-sm">
                        <button
                          onClick={(e) => handleTogglePin(c.conversationId, e)}
                          className="p-1 hover:text-emerald-500 text-slate-400 cursor-pointer"
                          title={c.isPinned ? "Unpin" : "Pin"}
                        >
                          <Pin className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => handleToggleMute(c.conversationId, e)}
                          className="p-1 hover:text-emerald-500 text-slate-400 cursor-pointer"
                          title={c.isMuted ? "Unmute" : "Mute"}
                        >
                          {c.isMuted ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
                        </button>
                        <button
                          onClick={(e) => handleToggleArchive(c.conversationId, e)}
                          className="p-1 hover:text-emerald-500 text-slate-400 cursor-pointer"
                          title={c.isArchived ? "Unarchive" : "Archive"}
                        >
                          {c.isArchived ? <ArchiveRestore className="h-3 w-3" /> : <Archive className="h-3 w-3" />}
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* RIGHT: Active Conversation View                                    */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          <div
            className={cn(
              "flex-1 flex-col min-w-0 bg-white dark:bg-[#0c0e10] relative",
              activeConversationId ? "flex" : "hidden md:flex"
            )}
          >
            {resolvingUser ? (
              /* User Resolution Skeleton */
              <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
                <div className="text-center space-y-1">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Connecting with {nameParam || usernameParam || userParam}...
                  </h4>
                  <p className="text-xs text-slate-400">
                    Establishing hardware-authenticated session key & verifying mutual identity.
                  </p>
                </div>
              </div>
            ) : !activeConversationId ? (
              /* Empty Selection State */
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="h-16 w-16 mx-auto rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">White Quantex Encrypted Communications</h3>
                <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                  Select a direct conversation from the sidebar or initiate a new secure thread. All messages are authenticated and encrypted with Galois/Counter Mode (AES-256-GCM).
                </p>
                <Button
                  onClick={handleOpenNewChat}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold gap-2 cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Start Encrypted Conversation
                </Button>
              </div>
            ) : (
              <>
                {/* ── Active Conversation Top Bar ── */}
                <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-zinc-800/80 bg-slate-50/40 dark:bg-[#0f1214] flex items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Mobile back button */}
                    <button
                      onClick={() => {
                        setActiveConversationId(null)
                        navigate("/messages", { replace: true, preventScrollReset: true })
                      }}
                      className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>

                    <div className="relative shrink-0">
                      <Avatar className="h-10 w-10 rounded-xl ring-2 ring-emerald-500/20">
                        <AvatarImage src={activePartner?.avatarUrl} alt={activePartner?.name} />
                        <AvatarFallback className="bg-slate-800 text-white font-bold text-xs rounded-xl">
                          {getInitials(activePartner?.name || "WQ")}
                        </AvatarFallback>
                      </Avatar>
                      {activePartner?.isOnline && (
                        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0e1113]" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h2 data-testid="active-partner-name" className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                          {activePartner?.name || "Ecosystem Partner"}
                        </h2>
                        {activePartner?.verificationLevel && (
                          <VerificationBadge level={activePartner.verificationLevel} />
                        )}
                        <Link
                          to={`/profile/${activePartner?.username || activePartner?.id}`}
                          className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          @{activePartner?.username || "member"}
                        </Link>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400 truncate">
                        {partnerTyping ? (
                          <span className="text-emerald-500 font-semibold animate-pulse">
                            {partnerTyping} is typing...
                          </span>
                        ) : (
                          <span>{activePartner?.headline || "Verified Ecosystem Participant"}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Top Bar Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSecurityModalOpen(true)}
                      className="h-8 px-2.5 text-xs font-semibold rounded-xl border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 cursor-pointer gap-1.5"
                    >
                      <Key className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Cryptographic Audit</span>
                    </Button>
                  </div>
                </div>

                {/* ── Chat Messages Scroll View (Independent Scroll Container) ── */}
                <div
                  ref={chatScrollContainerRef}
                  data-testid="chat-messages-container"
                  onScroll={handleChatScroll}
                  className="flex-1 overflow-y-auto [scrollbar-gutter:stable] p-4 space-y-4 bg-slate-50/20 dark:bg-[#0a0c0e]"
                >
                  {loadingThread && !threadData ? (
                    <div className="flex items-center justify-center h-full">
                      <RefreshCw className="h-6 w-6 animate-spin text-emerald-500" />
                    </div>
                  ) : threadData?.messages?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-3">
                      <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                        <Lock className="h-6 w-6" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">End-to-End Encrypted Thread</h4>
                      <p className="text-xs text-slate-400 max-w-sm">
                        Send an authenticated dispatch to {activePartner?.name}. All messages are encrypted with AES-256-GCM.
                      </p>
                    </div>
                  ) : (
                    threadData?.messages.map((m) => {
                      const isMe = m.isFromMe
                      const isEditing = editingMessageId === m.id

                      return (
                        <div
                          key={m.id}
                          className={cn("group flex flex-col", isMe ? "items-end" : "items-start")}
                        >
                          <div className={cn("flex items-end gap-2 max-w-[85%] sm:max-w-[70%]", isMe ? "flex-row-reverse" : "flex-row")}>
                            {/* Message Bubble */}
                            <div
                              className={cn(
                                "relative p-3 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-sm transition-all",
                                isMe
                                  ? "bg-emerald-600 text-white rounded-br-xs"
                                  : "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-slate-100 rounded-bl-xs"
                              )}
                            >
                              {/* Inline Edit Form */}
                              {isEditing ? (
                                <div className="space-y-2 min-w-[200px]">
                                  <Input
                                    value={editingContent}
                                    onChange={(e) => setEditingContent(e.target.value)}
                                    className="h-8 text-xs bg-emerald-700 text-white border-emerald-500 focus-visible:ring-white"
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") handleSaveEdit(m.id)
                                      if (e.key === "Escape") setEditingMessageId(null)
                                    }}
                                  />
                                  <div className="flex items-center justify-end gap-1.5">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setEditingMessageId(null)}
                                      className="h-6 px-2 text-[10px] text-white/80 hover:text-white cursor-pointer"
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => handleSaveEdit(m.id)}
                                      className="h-6 px-2.5 text-[10px] bg-white text-emerald-800 hover:bg-slate-100 font-bold cursor-pointer"
                                    >
                                      Save
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  {/* Message Text or Ciphertext Mode */}
                                  {rawCiphertextMode && m.crypto?.ciphertext ? (
                                    <div className="font-mono text-[11px] bg-black/20 p-2 rounded-lg break-all">
                                      <span className="text-amber-300 font-bold">[AES-GCM CIPHERTEXT]:</span>
                                      <p className="mt-1 opacity-90">{m.crypto.ciphertext}</p>
                                    </div>
                                  ) : (
                                    <p className={cn("whitespace-pre-wrap break-words", m.isDeleted && "italic text-slate-400 dark:text-slate-500")}>
                                      {m.content}
                                    </p>
                                  )}

                                  {/* Bottom Metadata: Timestamp, Edited flag, WhatsApp ticks */}
                                  <div
                                    className={cn(
                                      "flex items-center justify-end gap-1 mt-1 text-[10px]",
                                      isMe ? "text-emerald-100/80" : "text-slate-400"
                                    )}
                                  >
                                    {m.isEdited && <span className="italic mr-0.5">edited</span>}
                                    <span>
                                      {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    </span>

                                    {/* WhatsApp Ticks for Sender */}
                                    {isMe && !m.isDeleted && (
                                      <span title={`Status: ${m.deliveryStatus || "SENT"}`}>
                                        {m.deliveryStatus === "READ" ? (
                                          <CheckCheck className="h-3 w-3 text-[#38bdf8] drop-shadow-[0_0_3px_rgba(56,189,248,0.5)]" />
                                        ) : m.deliveryStatus === "DELIVERED" ? (
                                          <CheckCheck className="h-3 w-3 text-emerald-100/90" />
                                        ) : (
                                          <Check className="h-3 w-3 text-emerald-100/70" />
                                        )}
                                      </span>
                                    )}
                                  </div>
                                </>
                              )}

                              {/* Emoji Reaction Display */}
                              {m.reactions && m.reactions.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1.5 pt-1 border-t border-black/10 dark:border-white/10">
                                  {m.reactions.map((r, i) => (
                                    <span
                                      key={i}
                                      onClick={() => handleToggleReaction(m.id, r.emoji)}
                                      className={cn(
                                        "px-1.5 py-0.5 rounded-full text-[11px] cursor-pointer transition-transform hover:scale-110",
                                        r.userWqUserId === authUser?.id
                                          ? "bg-emerald-500/30 text-white"
                                          : "bg-black/10 dark:bg-white/10"
                                      )}
                                    >
                                      {r.emoji}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Message Context Actions (Quick Emoji bar + Dropdown) */}
                            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity shrink-0">
                              {/* Quick Emoji Reaction Pill */}
                              <div className="flex items-center bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-full px-1.5 py-0.5 shadow-sm gap-0.5">
                                {EMOJI_OPTIONS.map((emoji) => (
                                  <button
                                    key={emoji}
                                    onClick={() => handleToggleReaction(m.id, emoji)}
                                    className="hover:scale-125 transition-transform text-xs p-0.5 cursor-pointer"
                                    title={`React ${emoji}`}
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>

                              {/* More Options Dropdown Toggle */}
                              <div className="relative">
                                <button
                                  onClick={() => setActiveActionMenuId(activeActionMenuId === m.id ? null : m.id)}
                                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                                >
                                  <MoreVertical className="h-3.5 w-3.5" />
                                </button>

                                {activeActionMenuId === m.id && (
                                  <div className="absolute right-0 bottom-full mb-1 z-50 w-44 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl py-1 text-xs">
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(m.content)
                                        setActiveActionMenuId(null)
                                      }}
                                      className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                                    >
                                      <Copy className="h-3.5 w-3.5 text-slate-400" /> Copy Text
                                    </button>
                                    <button
                                      onClick={() => handleOpenInspector(m)}
                                      className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                                    >
                                      <Shield className="h-3.5 w-3.5 text-emerald-500" /> Inspect Crypto
                                    </button>

                                    {isMe && !m.isDeleted && (
                                      <button
                                        onClick={() => {
                                          setEditingMessageId(m.id)
                                          setEditingContent(m.content)
                                          setActiveActionMenuId(null)
                                        }}
                                        className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                                      >
                                        <Edit3 className="h-3.5 w-3.5 text-blue-500" /> Edit Message
                                      </button>
                                    )}

                                    {isMe && !m.isDeleted && (
                                      <button
                                        onClick={() => handleDeleteMessage(m.id, "everyone")}
                                        className="w-full px-3 py-1.5 text-left flex items-center gap-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" /> Delete for Everyone
                                      </button>
                                    )}

                                    <button
                                      onClick={() => handleDeleteMessage(m.id, "me")}
                                      className="w-full px-3 py-1.5 text-left flex items-center gap-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" /> Delete for Me
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}

                  {/* Real-Time Partner Typing Bubble (WhatsApp Style) */}
                  {partnerTyping && (
                    <div className="flex items-center gap-2 max-w-[75%] animate-fade-in">
                      <Avatar className="h-7 w-7 rounded-lg ring-1 ring-slate-200 dark:ring-zinc-800 shrink-0">
                        <AvatarImage src={activePartner?.avatarUrl} alt={partnerTyping} />
                        <AvatarFallback className="text-[10px] bg-slate-800 text-white font-bold">
                          {getInitials(partnerTyping)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-white dark:bg-[#16181a] border border-slate-200 dark:border-zinc-800 rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Floating "New Messages Below" Indicator */}
                {hasUnreadBelow && (
                  <button
                    onClick={() => {
                      scrollToBottom(true)
                      setHasUnreadBelow(false)
                    }}
                    className="absolute bottom-20 right-8 z-30 px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xl flex items-center gap-1.5 animate-bounce cursor-pointer border border-emerald-400/40"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                    <span>New messages below</span>
                  </button>
                )}

                {/* ── Bottom Input Dispatch Bar ── */}
                <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-[#0c0e10] shrink-0">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleSendMessage()
                    }}
                    className="flex items-center gap-2"
                  >
                    <Input
                      value={inputText}
                      onChange={handleInputChange}
                      placeholder={`Write encrypted dispatch to ${activePartner?.name || "partner"}...`}
                      disabled={sendingMessage}
                      className="flex-1 h-10 text-xs sm:text-sm bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-xl focus-visible:ring-emerald-500"
                    />

                    <Button
                      type="submit"
                      disabled={!inputText.trim() || sendingMessage}
                      className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold gap-1.5 cursor-pointer shadow-sm shadow-emerald-500/20 shrink-0"
                    >
                      {sendingMessage ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <span>Send</span>
                          <Send className="h-3.5 w-3.5" />
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* MODAL: Cryptographic Galois Inspection & Tamper Audit              */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <Dialog open={securityModalOpen} onOpenChange={setSecurityModalOpen}>
          <DialogContent className="max-w-xl bg-white dark:bg-[#111315] border border-slate-200 dark:border-zinc-800 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-sm font-bold">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Galois/Counter Mode (AES-256-GCM) Cryptographic Audit
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Independent hardware-grade verification of Galois MAC auth tag and ciphertext integrity.
              </DialogDescription>
            </DialogHeader>

            {inspectMessage?.crypto ? (
              <div className="space-y-4 pt-2 text-xs">
                {/* Algorithm & Cipher mode */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 font-mono">
                  <div>
                    <span className="text-slate-400 text-[10px] block">ALGORITHM</span>
                    <span className="font-bold text-emerald-500">{inspectMessage.crypto.algorithm}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">AUTHENTICATION</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">128-bit Galois MAC</span>
                  </div>
                </div>

                {/* Ciphertext */}
                <div className="space-y-1">
                  <span className="text-slate-400 text-[10px] font-mono block">CIPHERTEXT (BASE64)</span>
                  <div className="bg-slate-100 dark:bg-black p-2.5 rounded-lg font-mono text-[11px] break-all max-h-24 overflow-y-auto">
                    {inspectMessage.crypto.ciphertext}
                  </div>
                </div>

                {/* IV & Auth Tag */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <span className="text-slate-400 text-[10px] font-mono block">INITIALIZATION VECTOR (96-BIT)</span>
                    <div className="bg-slate-100 dark:bg-black p-2 rounded-lg font-mono text-[11px] truncate">
                      {inspectMessage.crypto.iv}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400 text-[10px] font-mono block">GALOIS AUTH TAG (128-BIT)</span>
                    <div className="bg-slate-100 dark:bg-black p-2 rounded-lg font-mono text-[11px] truncate text-emerald-500 font-bold">
                      {inspectMessage.crypto.authTag}
                    </div>
                  </div>
                </div>

                {/* Key Fingerprint */}
                <div className="space-y-1">
                  <span className="text-slate-400 text-[10px] font-mono block">SESSION KEY FINGERPRINT</span>
                  <div className="bg-slate-100 dark:bg-black p-2 rounded-lg font-mono text-[11px] text-slate-600 dark:text-slate-300">
                    {inspectMessage.crypto.keyFingerprint}
                  </div>
                </div>

                {/* Tamper Test Alert */}
                {tamperTestStatus === "tampered" && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Galois MAC Verification Failed</span>
                      <span>{tamperErrorMsg}</span>
                    </div>
                  </div>
                )}

                {tamperTestStatus === "verified" && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span className="font-bold">Cryptographically Authentic: Zero tampering detected.</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRunTamperTest(inspectMessage)}
                    className="text-xs rounded-xl border-amber-500/30 text-amber-500 hover:bg-amber-500/10 cursor-pointer"
                  >
                    Simulate Bit-Flip Tamper
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleVerifyAuthentic(inspectMessage)}
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl cursor-pointer"
                  >
                    Verify Authentic
                  </Button>
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* MODAL: New Chat User Discovery                                      */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <Dialog open={newChatModalOpen} onOpenChange={setNewChatModalOpen}>
          <DialogContent className="max-w-md bg-white dark:bg-[#111315] border border-slate-200 dark:border-zinc-800 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold">Initiate Encrypted Conversation</DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Select an ecosystem participant to establish an authenticated direct thread.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 pt-2">
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800/60">
                {loadingMembers ? (
                  <div className="p-6 text-center">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto text-emerald-500" />
                  </div>
                ) : allMembers.length === 0 ? (
                  <p className="p-4 text-xs text-center text-slate-400">No members found</p>
                ) : (
                  allMembers.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => handleSelectMemberToChat(m)}
                      className="p-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-zinc-900 rounded-xl cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar className="h-8 w-8 rounded-lg">
                          <AvatarImage src={m.avatarUrl} alt={m.name} />
                          <AvatarFallback className="text-[10px] font-bold">
                            {getInitials(m.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                            {m.name}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            @{m.username}
                          </span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="h-7 text-[11px] rounded-lg">
                        Chat
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  )
}
