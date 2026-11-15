import { nodeApi } from "@/services/api/client"

export interface ChatPartner {
  id: string
  wqUserId: string
  name: string
  username: string
  headline: string
  avatarUrl: string
  verificationLevel: string
  trustScore: number
  isOnline?: boolean
}

export interface CryptoAuditEnvelope {
  algorithm: string
  ciphertext: string
  iv: string
  authTag: string
  keyFingerprint: string
  integrityVerified: boolean
  decryptedAt: string
  cipherMode?: string
}

export interface MessageItem {
  id: string
  conversationId: string
  senderWqUserId: string
  recipientWqUserId: string
  isFromMe: boolean
  content: string
  crypto: CryptoAuditEnvelope
  contentType: "TEXT" | "CODE" | "DOCUMENT" | "IMAGE" | "SYSTEM"
  metadata?: Record<string, any>
  reactions?: Array<{ emoji: string; userWqUserId: string; createdAt?: string }>
  isRead: boolean
  readAt?: string
  deliveryStatus?: "SENT" | "DELIVERED" | "READ"
  isEdited?: boolean
  editedAt?: string
  isDeleted?: boolean
  createdAt: string
}

export interface ConversationItem {
  conversationId: string
  partner: ChatPartner
  lastMessage: {
    content: string
    senderWqUserId?: string
    isFromMe: boolean
    createdAt: string
    isRead: boolean
    deliveryStatus?: "SENT" | "DELIVERED" | "READ"
  }
  unreadCount: number
  keyFingerprint: string
  encryptionAlgorithm: string
  isPinned: boolean
  isMuted?: boolean
  isArchived?: boolean
  updatedAt: string
}

export interface ThreadData {
  conversationId: string
  partner: ChatPartner
  keyFingerprint: string
  encryptionAlgorithm: string
  messages: MessageItem[]
  nextCursor?: string | null
  hasMore?: boolean
}

export interface SendMessagePayload {
  conversationId?: string
  recipientWqUserId?: string
  content: string
  contentType?: "TEXT" | "CODE" | "DOCUMENT" | "IMAGE" | "SYSTEM"
  metadata?: Record<string, any>
  idempotencyKey?: string
  replyTo?: { messageId: string; senderWqUserId: string; preview: string }
  attachments?: Array<{ url: string; name: string; size: number; mimeType: string }>
}

export const chatService = {
  /**
   * Retrieves all direct encrypted conversations for the current user
   */
  async getConversations(): Promise<ConversationItem[]> {
    const res = await nodeApi.get("/messages/conversations")
    if (res.data?.success && Array.isArray(res.data?.data)) {
      return res.data.data
    }
    return []
  },

  /**
   * Retrieves message thread for a given conversation with cryptographic integrity verification & cursor pagination
   */
  async getMessages(conversationId: string, before?: string, limit = 50): Promise<ThreadData | null> {
    const params = new URLSearchParams()
    if (before) params.append("before", before)
    if (limit) params.append("limit", String(limit))
    const qs = params.toString() ? `?${params.toString()}` : ""
    const res = await nodeApi.get(`/messages/conversations/${encodeURIComponent(conversationId)}${qs}`)
    if (res.data?.success && res.data?.data) {
      return res.data.data
    }
    return null
  },

  /**
   * Marks specified messages as read with authoritative database persistence
   */
  async markAsRead(conversationId: string, messageIds: string[]): Promise<void> {
    await nodeApi.post("/messages/read", { conversationId, messageIds })
  },

  /**
   * Synchronizes messages updated or created since a given timestamp
   */
  async syncMissedMessages(conversationId: string, since: string): Promise<MessageItem[]> {
    const res = await nodeApi.get(`/messages/sync?conversationId=${encodeURIComponent(conversationId)}&since=${encodeURIComponent(since)}`)
    if (res.data?.success && res.data?.data?.messages) {
      return res.data.data.messages
    }
    return []
  },

  /**
   * Queries real-time presence (online status and last seen) for multiple user IDs
   */
  async queryLivePresence(userIds: string[]): Promise<Record<string, { isOnline: boolean; lastSeen: string | null }>> {
    const res = await nodeApi.get(`/messages/presence?userIds=${encodeURIComponent(userIds.join(","))}`)
    if (res.data?.success && res.data?.data) {
      return res.data.data
    }
    return {}
  },

  /**
   * Encrypts and sends a message using AES-256-GCM
   */
  async sendMessage(payload: SendMessagePayload): Promise<MessageItem> {
    const res = await nodeApi.post("/messages/send", payload)
    if (res.data?.success && res.data?.data) {
      return res.data.data
    }
    throw new Error(res.data?.message || "Failed to dispatch encrypted message")
  },

  /**
   * Finds or initiates a secure encrypted conversation with a target user
   */
  async startConversation(
    targetWqUserId?: string,
    targetUsername?: string,
    targetName?: string
  ): Promise<{ conversationId: string; partner: ChatPartner }> {
    const res = await nodeApi.post("/messages/start", {
      targetWqUserId,
      targetUsername,
      targetName,
    })
    if (res.data?.success && res.data?.data) {
      return res.data.data
    }
    throw new Error(res.data?.message || "Failed to initialize secure conversation")
  },

  /**
   * Edits a message previously sent by the current user
   */
  async editMessage(messageId: string, content: string): Promise<MessageItem> {
    const res = await nodeApi.put(`/messages/${encodeURIComponent(messageId)}`, { content })
    if (res.data?.success && res.data?.data) {
      return res.data.data
    }
    throw new Error(res.data?.message || "Failed to edit message")
  },

  /**
   * Deletes a message for everyone or for the current user
   */
  async deleteMessage(messageId: string, mode: "everyone" | "me" = "everyone"): Promise<boolean> {
    const res = await nodeApi.delete(`/messages/${encodeURIComponent(messageId)}?mode=${mode}`)
    return Boolean(res.data?.success)
  },

  /**
   * Toggles an emoji reaction on a message
   */
  async toggleReaction(
    messageId: string,
    emoji: string
  ): Promise<{ messageId: string; reactions: Array<{ emoji: string; userWqUserId: string }> }> {
    const res = await nodeApi.post(`/messages/${encodeURIComponent(messageId)}/reactions`, { emoji })
    if (res.data?.success && res.data?.data) {
      return res.data.data
    }
    throw new Error(res.data?.message || "Failed to update reaction")
  },

  /**
   * Pins or unpins a conversation
   */
  async togglePin(conversationId: string): Promise<boolean> {
    const res = await nodeApi.post(`/messages/conversations/${encodeURIComponent(conversationId)}/pin`)
    return Boolean(res.data?.isPinned)
  },

  /**
   * Mutes or unmutes a conversation
   */
  async toggleMute(conversationId: string): Promise<boolean> {
    const res = await nodeApi.post(`/messages/conversations/${encodeURIComponent(conversationId)}/mute`)
    return Boolean(res.data?.isMuted)
  },

  /**
   * Archives or unarchives a conversation
   */
  async toggleArchive(conversationId: string): Promise<boolean> {
    const res = await nodeApi.post(`/messages/conversations/${encodeURIComponent(conversationId)}/archive`)
    return Boolean(res.data?.isArchived)
  },

  /**
   * Performs an independent cryptographic audit of ciphertext and Galois MAC auth tag
   */
  async verifyIntegrity(payload: {
    ciphertext: string
    iv: string
    authTag: string
    conversationId: string
  }): Promise<{ isValid: boolean; status: string; keyFingerprint: string; timestamp: string }> {
    const res = await nodeApi.post("/messages/verify-integrity", payload)
    if (res.data?.success && res.data?.data) {
      return res.data.data
    }
    throw new Error(res.data?.message || "Cryptographic audit failed")
  },

  /**
   * Dispatches an explicit reply to a conversation, forcing backend real-time push
   */
  async replyMessage(conversationId: string, content: string, replyToMessageId?: string): Promise<MessageItem> {
    const res = await nodeApi.post("/messages/reply", { conversationId, content, replyTo: replyToMessageId })
    if (res.data?.success && res.data?.data) {
      return res.data.data
    }
    throw new Error(res.data?.message || "Failed to dispatch reply")
  },

  /**
   * Triggers a simulated partner reply to verify real-time frontend update without reloading
   */
  async simulateReply(conversationId: string, partnerId?: string, text?: string): Promise<{ success: boolean; message: string }> {
    const res = await nodeApi.post("/messages/simulate-reply", { conversationId, partnerId, text })
    if (res.data?.success) {
      return res.data
    }
    throw new Error(res.data?.message || "Failed to trigger simulated reply")
  },
}
