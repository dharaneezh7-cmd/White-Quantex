import { Server } from "socket.io"
import { Conversation } from "../models/Conversation.mjs"
import { Message } from "../models/Message.mjs"

let io = null

// Real-Time In-Memory Connection & Presence Registry
// Supports multiple concurrent tabs / devices per user
const connectedUsers = new Map() // wqUserId -> Set(socketId)
const userLastSeen = new Map()   // wqUserId -> Date
const typingRegistry = new Map() // socketId -> Set(conversationId)

// Rate limiting map: socketId -> count
const socketRateLimits = new Map()

export function initSocketIO(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
    pingTimeout: 20000,
    pingInterval: 25000,
  })

  // Middleware: Authentication & Identity Validation
  io.use((socket, next) => {
    const auth = socket.handshake.auth || {}
    const query = socket.handshake.query || {}

    const wqUserId = auth.wqUserId || query.wqUserId || auth.userId || query.userId
    const username = auth.username || query.username || "ecosystem_member"

    if (!wqUserId || typeof wqUserId !== "string" || wqUserId.trim() === "" || wqUserId === "undefined" || wqUserId === "null") {
      return next(new Error("Authentication error: valid wqUserId is required"))
    }

    // Attach validated identity to socket instance
    socket.user = {
      id: wqUserId.trim(),
      username: String(username).trim(),
    }

    next()
  })

  io.on("connection", (socket) => {
    const user = socket.user
    const wqUserId = user.id
    const username = user.username

    // ── 1. Register Multi-Device Connection ─────────────────────────────
    if (!connectedUsers.has(wqUserId)) {
      connectedUsers.set(wqUserId, new Set())
    }
    const userSockets = connectedUsers.get(wqUserId)
    const isFirstConnection = userSockets.size === 0
    userSockets.add(socket.id)
    userLastSeen.delete(wqUserId)

    // Join personal user rooms (canonical and legacy)
    socket.join(`user:${wqUserId}`)
    socket.join(`user_${wqUserId}`)

    // Broadcast presence update only on initial connection
    if (isFirstConnection) {
      const presencePayload = {
        wqUserId,
        isOnline: true,
        lastSeen: null,
        timestamp: new Date().toISOString(),
      }
      io.emit("presence:online", presencePayload)
      io.emit("presence_change", presencePayload)
    }

    // Track active typing conversations for this socket to auto-cleanup on disconnect
    typingRegistry.set(socket.id, new Set())

    // ── 2. Conversation Room Joining (With Authorization Check) ─────────
    const handleJoinConversation = async (conversationId, ack) => {
      try {
        if (!conversationId) {
          if (typeof ack === "function") ack({ success: false, message: "conversationId is required" })
          return
        }

        // Authorize: check if user is a participant or auto-register canonical thread
        const conv = await Conversation.findOne({ conversationId }).lean()
        if (conv && !conv.participants.includes(wqUserId)) {
          // If conversation has 2 participants and this user is not one, deny
          if (conv.participants.length >= 2 && !conversationId.includes(wqUserId)) {
            if (typeof ack === "function") ack({ success: false, message: "Unauthorized to join this private conversation" })
            return
          }
          // Add participant to open thread
          await Conversation.updateOne({ conversationId }, { $addToSet: { participants: wqUserId } })
        }

        socket.join(`conversation:${conversationId}`)
        socket.join(`conv_${conversationId}`)

        if (typeof ack === "function") {
          ack({ success: true, conversationId, status: "joined" })
        }
      } catch (err) {
        console.error("[Socket] join conversation error:", err)
        if (typeof ack === "function") ack({ success: false, message: err.message })
      }
    }

    socket.on("conversation:join", (data, ack) => {
      const convId = typeof data === "string" ? data : data?.conversationId
      handleJoinConversation(convId, ack)
    })
    socket.on("join_conversation", (convId, ack) => {
      handleJoinConversation(convId, ack)
    })

    // ── 3. Conversation Room Leaving ────────────────────────────────────
    const handleLeaveConversation = (conversationId, ack) => {
      if (conversationId) {
        socket.leave(`conversation:${conversationId}`)
        socket.leave(`conv_${conversationId}`)
        if (typingRegistry.has(socket.id)) {
          typingRegistry.get(socket.id).delete(conversationId)
        }
        if (typeof ack === "function") ack({ success: true, conversationId, status: "left" })
      }
    }

    socket.on("conversation:leave", (data, ack) => {
      const convId = typeof data === "string" ? data : data?.conversationId
      handleLeaveConversation(convId, ack)
    })
    socket.on("leave_conversation", (convId, ack) => {
      handleLeaveConversation(convId, ack)
    })

    // ── 4. Real-Time Typing Indicators ──────────────────────────────────
    const handleTypingStart = ({ conversationId }) => {
      if (!conversationId) return
      if (typingRegistry.has(socket.id)) {
        typingRegistry.get(socket.id).add(conversationId)
      }

      const payload = {
        conversationId,
        wqUserId,
        username,
        isTyping: true,
        timestamp: new Date().toISOString(),
      }
      socket.to(`conversation:${conversationId}`).emit("typing:start", payload)
      socket.to(`conv_${conversationId}`).emit("user_typing", payload)
    }

    const handleTypingStop = ({ conversationId }) => {
      if (!conversationId) return
      if (typingRegistry.has(socket.id)) {
        typingRegistry.get(socket.id).delete(conversationId)
      }

      const payload = {
        conversationId,
        wqUserId,
        username,
        isTyping: false,
        timestamp: new Date().toISOString(),
      }
      socket.to(`conversation:${conversationId}`).emit("typing:stop", payload)
      socket.to(`conv_${conversationId}`).emit("user_typing", payload)
    }

    socket.on("typing:start", handleTypingStart)
    socket.on("typing_start", handleTypingStart)
    socket.on("typing:stop", handleTypingStop)
    socket.on("typing_stop", handleTypingStop)

    // ── 5. Delivery & Read Receipt Synchronization ──────────────────────
    socket.on("message:delivered", async ({ conversationId, messageId }, ack) => {
      try {
        if (!messageId) return
        await Message.updateOne(
          { _id: messageId, deliveryStatus: "SENT" },
          { $set: { deliveryStatus: "DELIVERED", deliveredAt: new Date() } }
        )
        const payload = { conversationId, messageId, deliveredToWqUserId: wqUserId, deliveryStatus: "DELIVERED" }
        io.to(`conversation:${conversationId}`).emit("message:delivered", payload)
        io.to(`conv_${conversationId}`).emit("message_delivered", payload)
        if (typeof ack === "function") ack({ success: true })
      } catch (err) {
        if (typeof ack === "function") ack({ success: false, error: err.message })
      }
    })

    socket.on("message:read", async ({ conversationId, messageIds }, ack) => {
      try {
        if (!conversationId || !Array.isArray(messageIds) || messageIds.length === 0) return
        await Message.updateMany(
          { _id: { $in: messageIds }, recipientWqUserId: wqUserId },
          { $set: { isRead: true, readAt: new Date(), deliveryStatus: "READ" } }
        )
        await Conversation.updateOne(
          { conversationId },
          {
            $set: {
              [`unreadCounts.${wqUserId}`]: 0,
              "lastMessage.isRead": true,
              "lastMessage.deliveryStatus": "READ",
            },
          }
        )
        const payload = {
          conversationId,
          readerWqUserId: wqUserId,
          messageIds,
          readAt: new Date().toISOString(),
        }
        io.to(`conversation:${conversationId}`).emit("message:read", payload)
        io.to(`conv_${conversationId}`).emit("messages_read", payload)
        if (typeof ack === "function") ack({ success: true })
      } catch (err) {
        if (typeof ack === "function") ack({ success: false, error: err.message })
      }
    })

    // ── 5b. Direct Socket Message Broadcasting ─────────────────────────
    socket.on("message:send", (data, ack) => {
      try {
        const convId = data?.conversationId
        if (!convId) return
        const out = {
          ...data,
          senderWqUserId: wqUserId,
          createdAt: new Date().toISOString(),
        }
        io.to(`conversation:${convId}`).emit("message:new", out)
        io.to(`conv_${convId}`).emit("new_message", out)
        if (typeof ack === "function") ack({ success: true, timestamp: Date.now() })
      } catch (err) {
        if (typeof ack === "function") ack({ success: false, error: err.message })
      }
    })

    socket.on("message:new", (data, ack) => {
      try {
        const convId = data?.conversationId
        if (!convId) return
        io.to(`conversation:${convId}`).emit("message:new", data)
        io.to(`conv_${convId}`).emit("new_message", data)
        if (typeof ack === "function") ack({ success: true, timestamp: Date.now() })
      } catch (err) {
        if (typeof ack === "function") ack({ success: false, error: err.message })
      }
    })

    // ── 6. Message Sync on Reconnect ────────────────────────────────────
    socket.on("sync:request", async ({ conversationId, since }, ack) => {
      try {
        if (!conversationId || !since) {
          if (typeof ack === "function") ack({ success: false, message: "conversationId and since required" })
          return
        }

        const sinceDate = new Date(since)
        const messages = await Message.find({
          conversationId,
          updatedAt: { $gt: sinceDate },
          deletedForUsers: { $ne: wqUserId },
        })
          .sort({ createdAt: 1 })
          .limit(100)
          .lean()

        if (typeof ack === "function") {
          ack({
            success: true,
            conversationId,
            count: messages.length,
            messages: messages.map((m) => ({
              id: m._id.toString(),
              conversationId: m.conversationId,
              senderWqUserId: m.senderWqUserId,
              recipientWqUserId: m.recipientWqUserId,
              isFromMe: m.senderWqUserId === wqUserId,
              content: m.isDeleted ? "This message was deleted" : m.content,
              isDeleted: Boolean(m.isDeleted),
              isEdited: Boolean(m.isEdited),
              deliveryStatus: m.deliveryStatus,
              isRead: m.isRead,
              reactions: m.reactions || [],
              createdAt: m.createdAt,
              updatedAt: m.updatedAt,
            })),
            syncTimestamp: new Date().toISOString(),
          })
        }
      } catch (err) {
        if (typeof ack === "function") ack({ success: false, error: err.message })
      }
    })

    // ── 7. Presence Query ───────────────────────────────────────────────
    socket.on("presence:query", ({ userIds }, ack) => {
      if (!Array.isArray(userIds)) {
        if (typeof ack === "function") ack({})
        return
      }

      const results = {}
      for (const uid of userIds) {
        const isOnline = connectedUsers.has(uid) && connectedUsers.get(uid).size > 0
        results[uid] = {
          isOnline,
          lastSeen: isOnline ? null : (userLastSeen.get(uid)?.toISOString() || null),
        }
      }
      if (typeof ack === "function") ack(results)
    })

    // ── 8. Disconnection Handling ───────────────────────────────────────
    socket.on("disconnect", () => {
      // Clean up typing indicators for rooms this socket was typing in
      if (typingRegistry.has(socket.id)) {
        for (const convId of typingRegistry.get(socket.id)) {
          const payload = {
            conversationId: convId,
            wqUserId,
            username,
            isTyping: false,
          }
          socket.to(`conversation:${convId}`).emit("typing:stop", payload)
          socket.to(`conv_${convId}`).emit("user_typing", payload)
        }
        typingRegistry.delete(socket.id)
      }

      // Decrement socket count in connection registry
      if (connectedUsers.has(wqUserId)) {
        const sockets = connectedUsers.get(wqUserId)
        sockets.delete(socket.id)

        // Only mark user as offline when ALL active sockets/devices disconnect
        if (sockets.size === 0) {
          connectedUsers.delete(wqUserId)
          const now = new Date()
          userLastSeen.set(wqUserId, now)

          const offlinePayload = {
            wqUserId,
            isOnline: false,
            lastSeen: now.toISOString(),
            timestamp: now.toISOString(),
          }
          io.emit("presence:offline", offlinePayload)
          io.emit("presence_change", offlinePayload)
        }
      }
    })
  })

  return io
}

export function getIO() {
  return io
}

export function isUserOnline(wqUserId) {
  return connectedUsers.has(wqUserId) && connectedUsers.get(wqUserId).size > 0
}

export function getUserLastSeen(wqUserId) {
  if (isUserOnline(wqUserId)) return null
  return userLastSeen.get(wqUserId)?.toISOString() || null
}

export function notifyNewMessage(conversationId, messageItem) {
  if (!io) return
  // 1. Broadcast to canonical and legacy conversation rooms
  io.to(`conversation:${conversationId}`).emit("message:new", messageItem)
  io.to(`conv_${conversationId}`).emit("new_message", messageItem)

  // 2. Direct FORCE push to recipient user rooms
  if (messageItem.recipientWqUserId) {
    const updatePayload = {
      conversationId,
      lastMessage: messageItem,
    }
    io.to(`user:${messageItem.recipientWqUserId}`).emit("message:new", messageItem)
    io.to(`user_${messageItem.recipientWqUserId}`).emit("new_message", messageItem)
    io.to(`user:${messageItem.recipientWqUserId}`).emit("conversation:updated", updatePayload)
    io.to(`user_${messageItem.recipientWqUserId}`).emit("conversation_update", updatePayload)
    io.to(`user:${messageItem.recipientWqUserId}`).emit("chat:force_update", {
      conversationId,
      message: messageItem,
      type: "NEW_MESSAGE",
    })
  }

  // 3. Direct FORCE push to sender user rooms (multi-device sync)
  if (messageItem.senderWqUserId) {
    const updatePayload = {
      conversationId,
      lastMessage: messageItem,
    }
    io.to(`user:${messageItem.senderWqUserId}`).emit("message:new", messageItem)
    io.to(`user_${messageItem.senderWqUserId}`).emit("new_message", messageItem)
    io.to(`user:${messageItem.senderWqUserId}`).emit("conversation:updated", updatePayload)
    io.to(`user_${messageItem.senderWqUserId}`).emit("conversation_update", updatePayload)
    io.to(`user:${messageItem.senderWqUserId}`).emit("chat:force_update", {
      conversationId,
      message: messageItem,
      type: "NEW_MESSAGE",
    })
  }
}

export function notifyChatForceUpdate(conversationId, messageItem, updateType = "REPLY") {
  if (!io) return
  const payload = {
    conversationId,
    message: messageItem,
    type: updateType,
    timestamp: new Date().toISOString(),
  }
  // Broadcast to conversation rooms
  io.to(`conversation:${conversationId}`).emit("chat:force_update", payload)
  io.to(`conv_${conversationId}`).emit("chat:force_update", payload)

  // Force delivery to individual user rooms
  if (messageItem?.recipientWqUserId) {
    io.to(`user:${messageItem.recipientWqUserId}`).emit("chat:force_update", payload)
    io.to(`user_${messageItem.recipientWqUserId}`).emit("chat:force_update", payload)
  }
  if (messageItem?.senderWqUserId) {
    io.to(`user:${messageItem.senderWqUserId}`).emit("chat:force_update", payload)
    io.to(`user_${messageItem.senderWqUserId}`).emit("chat:force_update", payload)
  }
}

export function notifyTypingStart(conversationId, wqUserId, username, targetUserId) {
  if (!io) return
  const payload = {
    conversationId,
    wqUserId,
    username,
    isTyping: true,
    timestamp: new Date().toISOString(),
  }
  io.to(`conversation:${conversationId}`).emit("typing:start", payload)
  io.to(`conv_${conversationId}`).emit("user_typing", payload)
  if (targetUserId) {
    io.to(`user:${targetUserId}`).emit("typing:start", payload)
    io.to(`user_${targetUserId}`).emit("user_typing", payload)
  }
}

export function notifyTypingStop(conversationId, wqUserId, username, targetUserId) {
  if (!io) return
  const payload = {
    conversationId,
    wqUserId,
    username,
    isTyping: false,
    timestamp: new Date().toISOString(),
  }
  io.to(`conversation:${conversationId}`).emit("typing:stop", payload)
  io.to(`conv_${conversationId}`).emit("user_typing", payload)
  if (targetUserId) {
    io.to(`user:${targetUserId}`).emit("typing:stop", payload)
    io.to(`user_${targetUserId}`).emit("user_typing", payload)
  }
}

export function notifyMessageDelivered(conversationId, messageId, recipientWqUserId) {
  if (!io) return
  const payload = { conversationId, messageId, deliveredToWqUserId: recipientWqUserId, deliveryStatus: "DELIVERED" }
  io.to(`conversation:${conversationId}`).emit("message:delivered", payload)
  io.to(`conv_${conversationId}`).emit("message_delivered", payload)
}

export function notifyMessageRead(conversationId, readerWqUserId, messageIds) {
  if (!io) return
  const payload = {
    conversationId,
    readerWqUserId,
    messageIds,
    readAt: new Date().toISOString(),
  }
  io.to(`conversation:${conversationId}`).emit("message:read", payload)
  io.to(`conv_${conversationId}`).emit("messages_read", payload)
}

export function notifyMessageReaction(conversationId, messageId, reactions) {
  if (!io) return
  const payload = { conversationId, messageId, reactions }
  io.to(`conversation:${conversationId}`).emit("reaction:updated", payload)
  io.to(`conv_${conversationId}`).emit("message_reactions_update", payload)
}

export function notifyMessageEdited(conversationId, messageItem) {
  if (!io) return
  io.to(`conversation:${conversationId}`).emit("message:edited", messageItem)
  io.to(`conv_${conversationId}`).emit("message_edited", messageItem)
}

export function notifyMessageDeleted(conversationId, messageId, mode) {
  if (!io) return
  const payload = { conversationId, messageId, mode }
  io.to(`conversation:${conversationId}`).emit("message:deleted", payload)
  io.to(`conv_${conversationId}`).emit("message_deleted", payload)
}
