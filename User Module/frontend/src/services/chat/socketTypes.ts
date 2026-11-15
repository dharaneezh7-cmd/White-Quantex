/**
 * White Quantex Real-Time Socket.IO Types & Event Contracts
 */

export type ConnectionStatus = "connecting" | "connected" | "disconnected" | "reconnecting"

export type DeliveryStatus = "SENT" | "DELIVERED" | "READ"

export interface TypingEventPayload {
  conversationId: string
  wqUserId: string
  username: string
  isTyping: boolean
  timestamp?: string
}

export interface PresenceEventPayload {
  wqUserId: string
  isOnline: boolean
  lastSeen: string | null
  timestamp?: string
}

export interface MessageDeliveredPayload {
  conversationId: string
  messageId: string
  deliveredToWqUserId: string
  deliveryStatus: "DELIVERED"
}

export interface MessageReadPayload {
  conversationId: string
  readerWqUserId: string
  messageIds: string[]
  readAt: string
}

export interface SyncRequestPayload {
  conversationId: string
  since: string
}

export interface SyncResponsePayload {
  success: boolean
  conversationId: string
  count: number
  messages: any[]
  syncTimestamp: string
}

export interface SocketEventsMap {
  // Connection
  connect: () => void
  disconnect: (reason: string) => void
  connect_error: (error: Error) => void
  reconnect: (attemptNumber: number) => void

  // Conversation
  "conversation:join": (data: { conversationId: string }, ack?: (res: any) => void) => void
  "conversation:leave": (data: { conversationId: string }, ack?: (res: any) => void) => void
  "conversation:updated": (data: { conversationId: string; lastMessage: any }) => void

  // Message
  "message:new": (message: any) => void
  "message:delivered": (payload: MessageDeliveredPayload) => void
  "message:read": (payload: MessageReadPayload) => void
  "message:edited": (message: any) => void
  "message:deleted": (payload: { conversationId: string; messageId: string; mode: string }) => void
  "chat:force_update": (payload: { conversationId: string; message?: any; type: string; timestamp?: string }) => void
  chat_force_update: (payload: { conversationId: string; message?: any; type: string; timestamp?: string }) => void

  // Typing
  "typing:start": (payload: TypingEventPayload) => void
  "typing:stop": (payload: TypingEventPayload) => void

  // Presence
  "presence:online": (payload: PresenceEventPayload) => void
  "presence:offline": (payload: PresenceEventPayload) => void

  // Sync
  "sync:request": (payload: SyncRequestPayload, ack: (res: SyncResponsePayload) => void) => void
}
