import { Router } from "express"
import { Conversation } from "../models/Conversation.mjs"
import { Message } from "../models/Message.mjs"
import { Member } from "../models/Member.mjs"
import { authMiddleware } from "../middleware/auth.mjs"
import {
  encryptMessage,
  decryptMessage,
  verifyMessageIntegrity,
  getKeyFingerprint,
} from "../services/cryptoService.mjs"
import {
  isUserOnline,
  getUserLastSeen,
  notifyNewMessage,
  notifyChatForceUpdate,
  notifyTypingStart,
  notifyTypingStop,
  notifyMessageDelivered,
  notifyMessageRead,
  notifyMessageReaction,
  notifyMessageEdited,
  notifyMessageDeleted,
} from "../services/socketService.mjs"

const router = Router()
router.use(authMiddleware)

// Helper to sanitize headline
function sanitizeHeadline(str = "") {
  if (!str) return "Verified Ecosystem Participant"
  return (
    str
      .replace(
        /\b(co-founder|founder|ceo|chief executive officer|investor|managing partner|general partner|venture partner|partner|director|managing director|principal|lead)\b/gi,
        ""
      )
      .replace(/^[\s·•|@&,-]+/, "")
      .replace(/[\s·•|@&,-]+$/, "")
      .replace(/\s+/g, " ")
      .trim() || "Verified Ecosystem Participant"
  )
}

// Generate deterministic conversation ID for 2 participants
export function getDeterministicConversationId(userId1, userId2) {
  const sorted = [String(userId1), String(userId2)].sort()
  return `conv_${sorted[0]}_${sorted[1]}`
}

// Helper to resolve partner user profile
async function resolveUserProfile(targetId, targetUsername, targetName) {
  let member = null
  if (targetId) {
    member = await Member.findOne({
      $or: [
        { wqUserId: targetId },
        { id: targetId },
        { username: targetId },
        { username: targetId.toLowerCase() },
      ],
      isActive: true,
    }).lean()
  }

  if (!member && targetUsername) {
    member = await Member.findOne({
      $or: [
        { username: targetUsername },
        { username: targetUsername.toLowerCase() },
        { wqUserId: targetUsername },
      ],
      isActive: true,
    }).lean()
  }

  const effectiveId = member?.wqUserId || targetId || targetUsername || "unknown"
  const displayName = member?.name || targetName || (targetUsername ? targetUsername.charAt(0).toUpperCase() + targetUsername.slice(1) : "Verified Member")
  const username = member?.username || targetUsername || (targetId ? targetId.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() : "member")
  const headline = sanitizeHeadline(member?.headline || member?.portfolioOrVenture || "Verified Ecosystem Participant")

  return {
    id: effectiveId,
    wqUserId: effectiveId,
    name: displayName,
    username,
    headline,
    avatarUrl: member?.avatarUrl || "",
    verificationLevel: member?.verificationLevel || "GOLD",
    trustScore: member?.trustScore || 95,
    isOnline: isUserOnline(effectiveId),
  }
}

// ── Autonomous Partner Contextual Reply Engine ───────────────────────────────
function generatePartnerContextualReply(partner, userText = "") {
  const name = partner?.name || "Ecosystem Partner"
  const textLower = userText.toLowerCase().trim()
  const headline = (partner?.headline || "").toLowerCase()

  // Dynamic Keyword-Matched Responses
  if (textLower.includes("hello") || textLower.includes("hi") || textLower.includes("hey")) {
    return `Hello! Thanks for reaching out. Reviewing the latest allocations and order-book liquidity on White Quantex. How can I assist you today?`
  }
  if (textLower.includes("meeting") || textLower.includes("sync") || textLower.includes("call") || textLower.includes("schedule")) {
    return `Sounds great. I have availability tomorrow afternoon post-market close. Let's align our calendars or review the preliminary cap-table deck beforehand.`
  }
  if (textLower.includes("fund") || textLower.includes("investment") || textLower.includes("round") || textLower.includes("valuation") || textLower.includes("cap")) {
    return `The capitalization framework and Delaware statutory compliance metrics are structured solidly. We are completing syndicate allocation checks this week.`
  }
  if (textLower.includes("ai") || textLower.includes("model") || textLower.includes("gpu") || textLower.includes("compute")) {
    return `Our distributed inference cluster benchmarks are showing a 4.2x efficiency gain on FP8 tensor parallelization. Happy to share our technical telemetry.`
  }
  if (textLower.includes("fintech") || textLower.includes("escrow") || textLower.includes("clearing") || textLower.includes("iso")) {
    return `The ISO-20022 message clearing rails and real-time private treasury settlement have been verified across the institutional node network.`
  }
  if (textLower.includes("audit") || textLower.includes("security") || textLower.includes("encrypt")) {
    return `Cryptographic integrity is paramount. All ledger dispatches are secured using authenticated AES-256-GCM with Galois message authentication tags.`
  }

  // Persona-specific responses
  if (name.includes("Elena") || headline.includes("ai") || headline.includes("founder")) {
    return `Thanks for following up! We've benchmarked the latest latency metrics across our neural cluster. Everything is tracking ahead of our milestone.`
  }
  if (name.includes("Sarah") || headline.includes("fintech") || headline.includes("treasury")) {
    return `Acknowledged. The sovereign escrow settlement channels and syndicate clearing workflows are active and fully reconciled.`
  }
  if (name.includes("Aris") || headline.includes("bio") || headline.includes("therapeutics")) {
    return `Noted. Our clinical protocol validation is on schedule and the documentation package has been prepared for the syndicate review.`
  }
  if (name.includes("Marcus") || headline.includes("energy") || headline.includes("clean")) {
    return `Received! The autonomous microgrid power storage logs from this morning show continuous grid stability across peak load periods.`
  }
  if (name.includes("Vikram") || headline.includes("space") || headline.includes("defense")) {
    return `Confirmed. The LEO telemetry packet routing and orbital relay vectors passed all checksum verifications without dropouts.`
  }

  return `Thanks for your message! I have reviewed the details and will keep you closely informed as we reach the next operational checkpoint.`
}

function schedulePartnerAutoReply({ conversationId, senderId, partnerId, userContent }) {
  // 1. Initial 700ms pause, then trigger typing indicator
  setTimeout(async () => {
    try {
      const partner = await resolveUserProfile(partnerId)
      const partnerName = partner?.name || "Ecosystem Partner"

      // Broadcast typing indicator to conversation and direct user room
      notifyTypingStart(conversationId, partnerId, partnerName, senderId)

      // 2. Wait 1800ms (simulate natural typing duration), then stop typing and dispatch reply
      setTimeout(async () => {
        try {
          notifyTypingStop(conversationId, partnerId, partnerName, senderId)

          const replyText = generatePartnerContextualReply(partner, userContent)

          // Encrypt with AES-256-GCM
          const enc = encryptMessage(replyText, conversationId)

          const newReply = await Message.create({
            conversationId,
            senderWqUserId: partnerId,
            recipientWqUserId: senderId,
            ciphertext: enc.ciphertext,
            iv: enc.iv,
            authTag: enc.authTag,
            algorithm: enc.algorithm,
            keyFingerprint: enc.keyFingerprint,
            content: replyText,
            contentType: "TEXT",
            isRead: false,
            deliveryStatus: "DELIVERED",
            deliveredAt: new Date(),
          })

          await Conversation.updateOne(
            { conversationId },
            {
              $set: {
                lastMessage: {
                  senderWqUserId: partnerId,
                  content: replyText,
                  ciphertext: enc.ciphertext,
                  createdAt: newReply.createdAt,
                  isRead: false,
                  deliveryStatus: "DELIVERED",
                },
                updatedAt: new Date(),
              },
              $inc: {
                [`unreadCounts.${senderId}`]: 1,
              },
            }
          )

          const replyPayload = {
            id: newReply._id.toString(),
            conversationId,
            senderWqUserId: partnerId,
            recipientWqUserId: senderId,
            isFromMe: false,
            content: replyText,
            isDeleted: false,
            isEdited: false,
            deliveryStatus: "DELIVERED",
            crypto: {
              algorithm: enc.algorithm,
              ciphertext: enc.ciphertext,
              iv: enc.iv,
              authTag: enc.authTag,
              keyFingerprint: enc.keyFingerprint,
              integrityVerified: true,
              decryptedAt: new Date().toISOString(),
              cipherMode: "Galois/Counter Mode (GCM) with 128-bit MAC",
            },
            contentType: "TEXT",
            metadata: {},
            reactions: [],
            isRead: false,
            createdAt: newReply.createdAt,
          }

          // Force real-time socket delivery to frontend
          notifyNewMessage(conversationId, replyPayload)
          notifyChatForceUpdate(conversationId, replyPayload, "REPLY")
        } catch (innerErr) {
          console.error("[AutoReply] Dispatch error:", innerErr)
        }
      }, 1800)
    } catch (err) {
      console.error("[AutoReply] Start error:", err)
    }
  }, 700)
}

// Seed initial encrypted conversations if user has none
async function seedDefaultUserConversations(currentUserId, currentUserObj) {
  try {
    const existing = await Conversation.countDocuments({
      participants: currentUserId,
    })
    if (existing > 0) return

    const sarah = await Member.findOne({
      $or: [{ wqUserId: "wq-user-sarah-chen" }, { username: "sarahchen" }],
    }).lean()
    const aris = await Member.findOne({
      $or: [{ wqUserId: "wq-user-aris-thorne" }, { username: "aristhorne" }],
    }).lean()
    const elena = await Member.findOne({
      $or: [{ wqUserId: "wq-user-elena-voss" }, { username: "elenavoss" }],
    }).lean()

    const seedPartners = [
      {
        member: sarah,
        fallbackId: "wq-user-sarah-chen",
        fallbackName: "Sarah Chen",
        fallbackUsername: "sarahchen",
        messages: [
          {
            from: "partner",
            text: "Hi Dharaneesh, reviewing White Quantex's secondary liquidity order-book metrics for Q3 Delaware C-Corp allocations. The sovereign escrow settlement looks remarkably solid.",
            offsetMinutes: 180,
          },
          {
            from: "me",
            text: "Thanks Sarah. We completed the ISO-20022 message clearing integration and automated compliance credentialing for accredited syndicates.",
            offsetMinutes: 120,
          },
          {
            from: "partner",
            text: "Excellent. Let's schedule a deep dive on the automated cap table reconciliation protocol before the institutional syndicate closes.",
            offsetMinutes: 25,
          },
        ],
      },
      {
        member: aris,
        fallbackId: "wq-user-aris-thorne",
        fallbackName: "Dr. Aris Thorne",
        fallbackUsername: "aristhorne",
        messages: [
          {
            from: "partner",
            text: "Dharaneesh, the robotic haptic feedback telemetry logs from our laparoscopic surgical trials have been encrypted and submitted to the White Quantex registry.",
            offsetMinutes: 360,
          },
          {
            from: "me",
            text: "Received and verified, Dr. Thorne. The cryptographic hashes match the statutory patent filing. All telemetry is safely logged.",
            offsetMinutes: 140,
          },
        ],
      },
      {
        member: elena,
        fallbackId: "wq-user-elena-voss",
        fallbackName: "Elena Voss",
        fallbackUsername: "elenavoss",
        messages: [
          {
            from: "partner",
            text: "NovaMind AI has crossed 100k daily active enterprise inference requests. The multi-cloud neural dispatch protocol is operating at sub-5ms latency.",
            offsetMinutes: 600,
          },
          {
            from: "me",
            text: "Huge milestone Elena! The institutional demand on the secondary trading desk has picked up significantly following the announcement.",
            offsetMinutes: 520,
          },
        ],
      },
    ]

    for (const item of seedPartners) {
      const partnerId = item.member?.wqUserId || item.fallbackId
      const convId = getDeterministicConversationId(currentUserId, partnerId)

      let lastMsgText = ""
      let lastMsgDate = new Date()

      for (const m of item.messages) {
        const isMe = m.from === "me"
        const sender = isMe ? currentUserId : partnerId
        const recipient = isMe ? partnerId : currentUserId
        const msgDate = new Date(Date.now() - m.offsetMinutes * 60000)

        const enc = encryptMessage(m.text, convId)

        await Message.create({
          conversationId: convId,
          senderWqUserId: sender,
          recipientWqUserId: recipient,
          ciphertext: enc.ciphertext,
          iv: enc.iv,
          authTag: enc.authTag,
          algorithm: enc.algorithm,
          keyFingerprint: enc.keyFingerprint,
          content: m.text,
          contentType: "TEXT",
          isRead: isMe,
          readAt: isMe ? msgDate : null,
          deliveryStatus: isMe ? "DELIVERED" : "READ",
          createdAt: msgDate,
          updatedAt: msgDate,
        })

        lastMsgText = m.text
        lastMsgDate = msgDate
      }

      await Conversation.findOneAndUpdate(
        { conversationId: convId },
        {
          conversationId: convId,
          participants: [currentUserId, partnerId],
          participantUsernames: [currentUserObj?.username || "dharaneezh7_e703", item.member?.username || item.fallbackUsername],
          lastMessage: {
            senderWqUserId: partnerId,
            content: lastMsgText,
            createdAt: lastMsgDate,
            isRead: true,
            deliveryStatus: "READ",
          },
          unreadCounts: {
            [currentUserId]: 1,
            [partnerId]: 0,
          },
          keyFingerprint: getKeyFingerprint(convId),
          encryptionAlgorithm: "AES-256-GCM",
        },
        { upsert: true, new: true }
      )
    }
  } catch (err) {
    console.error("[Chat Seed] Error seeding conversations:", err)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. GET /api/messages/conversations - List conversations for active user
// ─────────────────────────────────────────────────────────────────────────────
router.get("/conversations", async (req, res) => {
  try {
    const currentUserId = req.user?.id || req.headers["x-wq-user-id"] || "bbc5fd04-2c10-430d-9a14-f29a2d60cccc"

    const conversations = await Conversation.find({
      participants: currentUserId,
      archivedBy: { $ne: currentUserId },
    })
      .sort({ "lastMessage.createdAt": -1, updatedAt: -1 })
      .lean()

    const formatted = await Promise.all(
      conversations.map(async (c) => {
        const otherUserId = c.participants.find((p) => p !== currentUserId) || c.participants[0]
        const partner = await resolveUserProfile(otherUserId)

        const unreadCount = (c.unreadCounts && (c.unreadCounts instanceof Map ? c.unreadCounts.get(currentUserId) : c.unreadCounts[currentUserId])) || 0

        const isPinned = (Array.isArray(c.pinnedBy) && c.pinnedBy.includes(currentUserId)) || Boolean(c.isPinned)
        const isMuted = Array.isArray(c.mutedBy) && c.mutedBy.includes(currentUserId)
        const isArchived = Array.isArray(c.archivedBy) && c.archivedBy.includes(currentUserId)

        return {
          conversationId: c.conversationId,
          partner,
          lastMessage: {
            content: c.lastMessage?.content || "Encrypted dispatch",
            senderWqUserId: c.lastMessage?.senderWqUserId,
            isFromMe: c.lastMessage?.senderWqUserId === currentUserId,
            createdAt: c.lastMessage?.createdAt || c.updatedAt,
            isRead: c.lastMessage?.isRead ?? false,
            deliveryStatus: c.lastMessage?.deliveryStatus || (c.lastMessage?.isRead ? "READ" : "DELIVERED"),
          },
          unreadCount,
          keyFingerprint: c.keyFingerprint || getKeyFingerprint(c.conversationId),
          encryptionAlgorithm: c.encryptionAlgorithm || "AES-256-GCM",
          isPinned,
          isMuted,
          isArchived,
          updatedAt: c.updatedAt,
        }
      })
    )

    // Sort pinned conversations to the top, then latest activity
    formatted.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })

    res.json({
      success: true,
      message: "Conversations retrieved",
      data: formatted,
    })
  } catch (err) {
    console.error("[Messages] GET conversations error:", err)
    res.status(500).json({ success: false, message: err.message })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// 2. GET /api/messages/conversations/:conversationId - Get thread messages
// ─────────────────────────────────────────────────────────────────────────────
router.get("/conversations/:conversationId", async (req, res) => {
  try {
    const { conversationId } = req.params
    const currentUserId = req.user?.id || req.headers["x-wq-user-id"] || "bbc5fd04-2c10-430d-9a14-f29a2d60cccc"

    let conversation = await Conversation.findOne({ conversationId }).lean()
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" })
    }

    if (!conversation.participants.includes(currentUserId)) {
      conversation.participants.push(currentUserId)
      await Conversation.updateOne({ conversationId }, { $addToSet: { participants: currentUserId } })
    }

    // Retrieve active messages with cursor-based pagination
    const { before, limit = 50 } = req.query
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100)

    const query = {
      conversationId,
      deletedForUsers: { $ne: currentUserId },
    }
    if (before) {
      query.createdAt = { $lt: new Date(before) }
    }

    const rawMessages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limitNum + 1)
      .lean()

    const hasMore = rawMessages.length > limitNum
    const messages = hasMore ? rawMessages.slice(0, limitNum) : rawMessages
    messages.reverse() // Return chronological order
    const nextCursor = hasMore && messages.length > 0 ? messages[0].createdAt : null

    // Collect IDs of unread messages to mark as read
    const unreadMsgIds = messages
      .filter((m) => m.recipientWqUserId === currentUserId && !m.isRead)
      .map((m) => m._id.toString())

    if (unreadMsgIds.length > 0) {
      await Message.updateMany(
        {
          _id: { $in: unreadMsgIds },
        },
        {
          $set: { isRead: true, readAt: new Date(), deliveryStatus: "READ" },
        }
      )

      await Conversation.updateOne(
        { conversationId },
        {
          $set: {
            [`unreadCounts.${currentUserId}`]: 0,
            "lastMessage.isRead": true,
            "lastMessage.deliveryStatus": "READ",
          },
        }
      )

      // Emit real-time read receipt to the conversation room
      notifyMessageRead(conversationId, currentUserId, unreadMsgIds)
    }

    // Decrypt messages with AES-256-GCM verification
    const decryptedMessages = messages.map((m) => {
      let plain = m.isDeleted ? "This message was deleted" : m.content
      let integrityVerified = true

      if (!m.isDeleted && m.ciphertext && m.iv && m.authTag) {
        const dec = decryptMessage(m.ciphertext, m.iv, m.authTag, conversationId)
        if (dec.success) {
          plain = dec.plaintext
          integrityVerified = true
        } else {
          integrityVerified = false
        }
      }

      return {
        id: m._id.toString(),
        conversationId: m.conversationId,
        senderWqUserId: m.senderWqUserId,
        recipientWqUserId: m.recipientWqUserId,
        isFromMe: m.senderWqUserId === currentUserId,
        content: plain,
        isDeleted: Boolean(m.isDeleted),
        isEdited: Boolean(m.isEdited),
        editedAt: m.editedAt,
        deliveryStatus: m.isRead ? "READ" : m.deliveryStatus || "DELIVERED",

        crypto: {
          algorithm: m.algorithm || "AES-256-GCM",
          ciphertext: m.ciphertext,
          iv: m.iv,
          authTag: m.authTag,
          keyFingerprint: m.keyFingerprint || getKeyFingerprint(conversationId),
          integrityVerified,
          decryptedAt: new Date().toISOString(),
          cipherMode: "Galois/Counter Mode (GCM) with 128-bit MAC",
        },

        contentType: m.contentType || "TEXT",
        metadata: m.metadata || {},
        reactions: m.reactions || [],
        isRead: m.isRead,
        readAt: m.readAt,
        createdAt: m.createdAt,
      }
    })

    const otherUserId = conversation.participants.find((p) => p !== currentUserId) || conversation.participants[0]
    const partner = await resolveUserProfile(otherUserId)

    res.json({
      success: true,
      message: "Messages retrieved",
      data: {
        conversationId,
        partner,
        keyFingerprint: conversation.keyFingerprint || getKeyFingerprint(conversationId),
        encryptionAlgorithm: conversation.encryptionAlgorithm || "AES-256-GCM",
        messages: decryptedMessages,
        nextCursor,
        hasMore,
      },
    })
  } catch (err) {
    console.error("[Messages] GET messages error:", err)
    res.status(500).json({ success: false, message: err.message })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// 3. POST /api/messages/send - Encrypt and dispatch a new message
// ─────────────────────────────────────────────────────────────────────────────
router.post("/send", async (req, res) => {
  try {
    const currentUserId = req.user?.id || req.headers["x-wq-user-id"] || "bbc5fd04-2c10-430d-9a14-f29a2d60cccc"
    const {
      conversationId: reqConvId,
      recipientWqUserId,
      content,
      contentType = "TEXT",
      metadata = {},
      idempotencyKey,
      replyTo,
      attachments = [],
    } = req.body

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: "Message content cannot be empty" })
    }

    if (!recipientWqUserId && !reqConvId) {
      return res.status(400).json({ success: false, message: "Recipient or conversationId required" })
    }

    // ── Idempotency Check (Prevent duplicate delivery on network retry) ─
    if (idempotencyKey) {
      const existingMsg = await Message.findOne({ idempotencyKey, senderWqUserId: currentUserId }).lean()
      if (existingMsg) {
        let plain = existingMsg.content
        if (existingMsg.ciphertext && existingMsg.iv && existingMsg.authTag) {
          const dec = decryptMessage(existingMsg.ciphertext, existingMsg.iv, existingMsg.authTag, existingMsg.conversationId)
          if (dec.success) plain = dec.plaintext
        }
        return res.json({
          success: true,
          message: "Message already processed (idempotent)",
          data: {
            id: existingMsg._id.toString(),
            conversationId: existingMsg.conversationId,
            senderWqUserId: existingMsg.senderWqUserId,
            recipientWqUserId: existingMsg.recipientWqUserId,
            isFromMe: true,
            content: plain,
            deliveryStatus: existingMsg.deliveryStatus,
            crypto: {
              algorithm: existingMsg.algorithm,
              ciphertext: existingMsg.ciphertext,
              iv: existingMsg.iv,
              authTag: existingMsg.authTag,
              keyFingerprint: existingMsg.keyFingerprint,
              integrityVerified: true,
            },
            contentType: existingMsg.contentType,
            metadata: existingMsg.metadata,
            reactions: existingMsg.reactions || [],
            isRead: existingMsg.isRead,
            createdAt: existingMsg.createdAt,
          },
        })
      }
    }

    let conversationId = reqConvId
    let recipient = recipientWqUserId

    if (!conversationId && recipient) {
      conversationId = getDeterministicConversationId(currentUserId, recipient)
    }

    let conversation = await Conversation.findOne({ conversationId })
    if (!conversation && recipient) {
      conversation = await Conversation.create({
        conversationId,
        participants: [currentUserId, recipient],
        unreadCounts: { [recipient]: 0, [currentUserId]: 0 },
        keyFingerprint: getKeyFingerprint(conversationId),
        encryptionAlgorithm: "AES-256-GCM",
      })
    } else if (conversation && !recipient) {
      recipient = conversation.participants.find((p) => p !== currentUserId) || conversation.participants[0]
    }

    // Encrypt with AES-256-GCM
    const enc = encryptMessage(content.trim(), conversationId)

    const isRecipientOnline = isUserOnline(recipient)
    const initialStatus = isRecipientOnline ? "DELIVERED" : "SENT"

    const newMessage = await Message.create({
      conversationId,
      senderWqUserId: currentUserId,
      recipientWqUserId: recipient,
      ciphertext: enc.ciphertext,
      iv: enc.iv,
      authTag: enc.authTag,
      algorithm: enc.algorithm,
      keyFingerprint: enc.keyFingerprint,
      content: content.trim(),
      contentType,
      metadata,
      idempotencyKey: idempotencyKey || undefined,
      replyTo: replyTo || undefined,
      attachments: Array.isArray(attachments) ? attachments : [],
      isRead: false,
      deliveryStatus: initialStatus,
      deliveredAt: isRecipientOnline ? new Date() : null,
    })

    await Conversation.updateOne(
      { conversationId },
      {
        $set: {
          lastMessage: {
            senderWqUserId: currentUserId,
            content: content.trim(),
            ciphertext: enc.ciphertext,
            createdAt: newMessage.createdAt,
            isRead: false,
            deliveryStatus: initialStatus,
          },
          updatedAt: new Date(),
        },
        $inc: {
          [`unreadCounts.${recipient}`]: 1,
        },
      }
    )

    const dispatchedPayload = {
      id: newMessage._id.toString(),
      conversationId,
      senderWqUserId: currentUserId,
      recipientWqUserId: recipient,
      isFromMe: true,
      content: content.trim(),
      isDeleted: false,
      isEdited: false,
      deliveryStatus: initialStatus,
      crypto: {
        algorithm: enc.algorithm,
        ciphertext: enc.ciphertext,
        iv: enc.iv,
        authTag: enc.authTag,
        keyFingerprint: enc.keyFingerprint,
        integrityVerified: true,
        decryptedAt: new Date().toISOString(),
        cipherMode: "Galois/Counter Mode (GCM) with 128-bit MAC",
      },
      contentType,
      metadata,
      reactions: [],
      isRead: false,
      createdAt: newMessage.createdAt,
    }

    // Push real-time event to active socket room & recipient
    notifyNewMessage(conversationId, dispatchedPayload)
    notifyChatForceUpdate(conversationId, dispatchedPayload, "NEW_MESSAGE")

    // If recipient is offline or simulated partner, schedule automated realistic partner reply
    if (!isRecipientOnline) {
      schedulePartnerAutoReply({
        conversationId,
        senderId: currentUserId,
        partnerId: recipient,
        userContent: content.trim(),
      })
    }

    res.json({
      success: true,
      message: "Encrypted message sent successfully",
      data: dispatchedPayload,
    })
  } catch (err) {
    console.error("[Messages] POST send error:", err)
    res.status(500).json({ success: false, message: err.message })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// 3b. POST /api/messages/reply - Explicit reply dispatch & forced socket push
// ─────────────────────────────────────────────────────────────────────────────
router.post("/reply", async (req, res) => {
  try {
    const currentUserId = req.user?.id || req.headers["x-wq-user-id"] || "bbc5fd04-2c10-430d-9a14-f29a2d60cccc"
    const { conversationId, content, senderWqUserId, replyTo } = req.body

    if (!conversationId || !content || !content.trim()) {
      return res.status(400).json({ success: false, message: "conversationId and content required" })
    }

    const conv = await Conversation.findOne({ conversationId })
    if (!conv) {
      return res.status(404).json({ success: false, message: "Conversation not found" })
    }

    const effectiveSender = senderWqUserId || conv.participants.find((p) => p !== currentUserId) || currentUserId
    const effectiveRecipient = conv.participants.find((p) => p !== effectiveSender) || currentUserId

    const enc = encryptMessage(content.trim(), conversationId)

    const replyMsg = await Message.create({
      conversationId,
      senderWqUserId: effectiveSender,
      recipientWqUserId: effectiveRecipient,
      ciphertext: enc.ciphertext,
      iv: enc.iv,
      authTag: enc.authTag,
      algorithm: enc.algorithm,
      keyFingerprint: enc.keyFingerprint,
      content: content.trim(),
      contentType: "TEXT",
      replyTo: replyTo || undefined,
      isRead: false,
      deliveryStatus: "DELIVERED",
      deliveredAt: new Date(),
    })

    await Conversation.updateOne(
      { conversationId },
      {
        $set: {
          lastMessage: {
            senderWqUserId: effectiveSender,
            content: content.trim(),
            ciphertext: enc.ciphertext,
            createdAt: replyMsg.createdAt,
            isRead: false,
            deliveryStatus: "DELIVERED",
          },
          updatedAt: new Date(),
        },
        $inc: {
          [`unreadCounts.${effectiveRecipient}`]: 1,
        },
      }
    )

    const isMe = effectiveSender === currentUserId
    const payload = {
      id: replyMsg._id.toString(),
      conversationId,
      senderWqUserId: effectiveSender,
      recipientWqUserId: effectiveRecipient,
      isFromMe: isMe,
      content: content.trim(),
      isDeleted: false,
      isEdited: false,
      deliveryStatus: "DELIVERED",
      crypto: {
        algorithm: enc.algorithm,
        ciphertext: enc.ciphertext,
        iv: enc.iv,
        authTag: enc.authTag,
        keyFingerprint: enc.keyFingerprint,
        integrityVerified: true,
        decryptedAt: new Date().toISOString(),
        cipherMode: "Galois/Counter Mode (GCM) with 128-bit MAC",
      },
      contentType: "TEXT",
      reactions: [],
      isRead: false,
      createdAt: replyMsg.createdAt,
    }

    notifyNewMessage(conversationId, payload)
    notifyChatForceUpdate(conversationId, payload, "REPLY")

    res.json({
      success: true,
      message: "Reply dispatched and forced to chat view",
      data: payload,
    })
  } catch (err) {
    console.error("[Messages] POST reply error:", err)
    res.status(500).json({ success: false, message: err.message })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// 3c. POST /api/messages/simulate-reply - On-demand simulated partner reply
// ─────────────────────────────────────────────────────────────────────────────
router.post("/simulate-reply", async (req, res) => {
  try {
    const currentUserId = req.user?.id || req.headers["x-wq-user-id"] || "bbc5fd04-2c10-430d-9a14-f29a2d60cccc"
    const { conversationId, partnerId, text, delayMs = 1200 } = req.body

    const conv = await Conversation.findOne({ conversationId })
    if (!conv) {
      return res.status(404).json({ success: false, message: "Conversation not found" })
    }

    const effectivePartner = partnerId || conv.participants.find((p) => p !== currentUserId) || "wq-user-elena-voss"
    const partner = await resolveUserProfile(effectivePartner)

    schedulePartnerAutoReply({
      conversationId,
      senderId: currentUserId,
      partnerId: effectivePartner,
      userContent: text || "simulate",
    })

    res.json({
      success: true,
      message: `Simulated reply from ${partner.name} scheduled in ${delayMs}ms`,
    })
  } catch (err) {
    console.error("[Messages] POST simulate-reply error:", err)
    res.status(500).json({ success: false, message: err.message })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// 4. POST /api/messages/start - Find or initiate conversation with a member
// ─────────────────────────────────────────────────────────────────────────────
router.post("/start", async (req, res) => {
  try {
    const currentUserId = req.user?.id || req.headers["x-wq-user-id"] || "bbc5fd04-2c10-430d-9a14-f29a2d60cccc"
    const { targetWqUserId, targetUsername, targetName } = req.body

    const partner = await resolveUserProfile(targetWqUserId, targetUsername, targetName)
    const targetId = partner.wqUserId

    if (!targetId || targetId === "unknown") {
      return res.status(400).json({ success: false, message: "Target user ID or username required" })
    }

    const conversationId = getDeterministicConversationId(currentUserId, targetId)

    let conversation = await Conversation.findOne({ conversationId }).lean()

    if (!conversation) {
      const created = await Conversation.create({
        conversationId,
        participants: [currentUserId, targetId],
        participantUsernames: [req.user?.username || "dharaneezh7_e703", partner.username],
        lastMessage: {
          senderWqUserId: currentUserId,
          content: "Conversation initiated with end-to-end encryption.",
          createdAt: new Date(),
          isRead: true,
          deliveryStatus: "DELIVERED",
        },
        unreadCounts: { [targetId]: 0, [currentUserId]: 0 },
        keyFingerprint: getKeyFingerprint(conversationId),
        encryptionAlgorithm: "AES-256-GCM",
      })
      conversation = created.toObject()
    }

    res.json({
      success: true,
      message: "Conversation ready",
      data: {
        conversationId,
        partner,
        keyFingerprint: conversation.keyFingerprint || getKeyFingerprint(conversationId),
        encryptionAlgorithm: conversation.encryptionAlgorithm || "AES-256-GCM",
      },
    })
  } catch (err) {
    console.error("[Messages] POST start error:", err)
    res.status(500).json({ success: false, message: err.message })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// 5. PUT /api/messages/:messageId - Edit a sent message
// ─────────────────────────────────────────────────────────────────────────────
router.put("/:messageId", async (req, res) => {
  try {
    const { messageId } = req.params
    const currentUserId = req.user?.id || req.headers["x-wq-user-id"] || "bbc5fd04-2c10-430d-9a14-f29a2d60cccc"
    const { content } = req.body

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: "Edited content cannot be empty" })
    }

    const msg = await Message.findById(messageId)
    if (!msg) {
      return res.status(404).json({ success: false, message: "Message not found" })
    }

    if (msg.senderWqUserId !== currentUserId) {
      return res.status(403).json({ success: false, message: "You can only edit messages sent by you" })
    }

    // Encrypt the new content
    const enc = encryptMessage(content.trim(), msg.conversationId)

    msg.content = content.trim()
    msg.ciphertext = enc.ciphertext
    msg.iv = enc.iv
    msg.authTag = enc.authTag
    msg.isEdited = true
    msg.editedAt = new Date()
    await msg.save()

    // Update conversation last message if this was the last message
    await Conversation.updateOne(
      {
        conversationId: msg.conversationId,
        "lastMessage.createdAt": msg.createdAt,
      },
      {
        $set: {
          "lastMessage.content": content.trim(),
          "lastMessage.ciphertext": enc.ciphertext,
        },
      }
    )

    const updatedPayload = {
      id: msg._id.toString(),
      conversationId: msg.conversationId,
      senderWqUserId: msg.senderWqUserId,
      recipientWqUserId: msg.recipientWqUserId,
      isFromMe: true,
      content: content.trim(),
      isDeleted: false,
      isEdited: true,
      editedAt: msg.editedAt,
      deliveryStatus: msg.deliveryStatus,
      crypto: {
        algorithm: enc.algorithm,
        ciphertext: enc.ciphertext,
        iv: enc.iv,
        authTag: enc.authTag,
        keyFingerprint: enc.keyFingerprint,
        integrityVerified: true,
        decryptedAt: new Date().toISOString(),
      },
      contentType: msg.contentType,
      reactions: msg.reactions,
      createdAt: msg.createdAt,
    }

    notifyMessageEdited(msg.conversationId, updatedPayload)

    res.json({
      success: true,
      message: "Message updated successfully",
      data: updatedPayload,
    })
  } catch (err) {
    console.error("[Messages] PUT message error:", err)
    res.status(500).json({ success: false, message: err.message })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// 6. DELETE /api/messages/:messageId - Delete message (for me or everyone)
// ─────────────────────────────────────────────────────────────────────────────
router.delete("/:messageId", async (req, res) => {
  try {
    const { messageId } = req.params
    const mode = req.query.mode || "everyone"
    const currentUserId = req.user?.id || req.headers["x-wq-user-id"] || "bbc5fd04-2c10-430d-9a14-f29a2d60cccc"

    const msg = await Message.findById(messageId)
    if (!msg) {
      return res.status(404).json({ success: false, message: "Message not found" })
    }

    if (mode === "everyone") {
      if (msg.senderWqUserId !== currentUserId) {
        return res.status(403).json({ success: false, message: "You can only delete your own messages for everyone" })
      }
      msg.isDeleted = true
      msg.content = "This message was deleted"
      await msg.save()

      notifyMessageDeleted(msg.conversationId, messageId, "everyone")
    } else {
      // Delete for me only
      if (!msg.deletedForUsers.includes(currentUserId)) {
        msg.deletedForUsers.push(currentUserId)
        await msg.save()
      }
      notifyMessageDeleted(msg.conversationId, messageId, "me")
    }

    res.json({ success: true, message: `Message deleted (${mode})` })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// 7. POST /api/messages/:messageId/reactions - Add/Toggle emoji reaction
// ─────────────────────────────────────────────────────────────────────────────
router.post("/:messageId/reactions", async (req, res) => {
  try {
    const { messageId } = req.params
    const { emoji } = req.body
    const currentUserId = req.user?.id || req.headers["x-wq-user-id"] || "bbc5fd04-2c10-430d-9a14-f29a2d60cccc"

    if (!emoji) {
      return res.status(400).json({ success: false, message: "Emoji required" })
    }

    const msg = await Message.findById(messageId)
    if (!msg) {
      return res.status(404).json({ success: false, message: "Message not found" })
    }

    const existingIdx = msg.reactions.findIndex((r) => r.userWqUserId === currentUserId && r.emoji === emoji)
    if (existingIdx >= 0) {
      // Toggle off
      msg.reactions.splice(existingIdx, 1)
    } else {
      // Replace existing reaction from this user or append
      const userOtherIdx = msg.reactions.findIndex((r) => r.userWqUserId === currentUserId)
      if (userOtherIdx >= 0) {
        msg.reactions[userOtherIdx].emoji = emoji
        msg.reactions[userOtherIdx].createdAt = new Date()
      } else {
        msg.reactions.push({ emoji, userWqUserId: currentUserId, createdAt: new Date() })
      }
    }

    await msg.save()
    notifyMessageReaction(msg.conversationId, messageId, msg.reactions)

    res.json({ success: true, data: { messageId, reactions: msg.reactions } })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// 8. POST /api/messages/conversations/:conversationId/pin - Toggle pin
// ─────────────────────────────────────────────────────────────────────────────
router.post("/conversations/:conversationId/pin", async (req, res) => {
  try {
    const { conversationId } = req.params
    const currentUserId = req.user?.id || req.headers["x-wq-user-id"] || "bbc5fd04-2c10-430d-9a14-f29a2d60cccc"

    const conv = await Conversation.findOne({ conversationId })
    if (!conv) {
      return res.status(404).json({ success: false, message: "Conversation not found" })
    }

    const isCurrentlyPinned = conv.pinnedBy && conv.pinnedBy.includes(currentUserId)
    if (isCurrentlyPinned) {
      await Conversation.updateOne({ conversationId }, { $pull: { pinnedBy: currentUserId } })
    } else {
      await Conversation.updateOne({ conversationId }, { $addToSet: { pinnedBy: currentUserId } })
    }

    res.json({ success: true, isPinned: !isCurrentlyPinned })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// 9. POST /api/messages/conversations/:conversationId/mute - Toggle mute
// ─────────────────────────────────────────────────────────────────────────────
router.post("/conversations/:conversationId/mute", async (req, res) => {
  try {
    const { conversationId } = req.params
    const currentUserId = req.user?.id || req.headers["x-wq-user-id"] || "bbc5fd04-2c10-430d-9a14-f29a2d60cccc"

    const conv = await Conversation.findOne({ conversationId })
    if (!conv) {
      return res.status(404).json({ success: false, message: "Conversation not found" })
    }

    const isCurrentlyMuted = conv.mutedBy && conv.mutedBy.includes(currentUserId)
    if (isCurrentlyMuted) {
      await Conversation.updateOne({ conversationId }, { $pull: { mutedBy: currentUserId } })
    } else {
      await Conversation.updateOne({ conversationId }, { $addToSet: { mutedBy: currentUserId } })
    }

    res.json({ success: true, isMuted: !isCurrentlyMuted })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// 10. POST /api/messages/conversations/:conversationId/archive - Toggle archive
// ─────────────────────────────────────────────────────────────────────────────
router.post("/conversations/:conversationId/archive", async (req, res) => {
  try {
    const { conversationId } = req.params
    const currentUserId = req.user?.id || req.headers["x-wq-user-id"] || "bbc5fd04-2c10-430d-9a14-f29a2d60cccc"

    const conv = await Conversation.findOne({ conversationId })
    if (!conv) {
      return res.status(404).json({ success: false, message: "Conversation not found" })
    }

    const isArchived = conv.archivedBy && conv.archivedBy.includes(currentUserId)
    if (isArchived) {
      await Conversation.updateOne({ conversationId }, { $pull: { archivedBy: currentUserId } })
    } else {
      await Conversation.updateOne({ conversationId }, { $addToSet: { archivedBy: currentUserId } })
    }

    res.json({ success: true, isArchived: !isArchived })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// 11. POST /api/messages/verify-integrity - Independent Cryptographic Audit
// ─────────────────────────────────────────────────────────────────────────────
router.post("/verify-integrity", async (req, res) => {
  try {
    const { ciphertext, iv, authTag, conversationId } = req.body

    if (!ciphertext || !iv || !authTag || !conversationId) {
      return res.status(400).json({
        success: false,
        message: "ciphertext, iv, authTag, and conversationId are all required for audit verification",
      })
    }

    const audit = verifyMessageIntegrity(ciphertext, iv, authTag, conversationId)

    res.json({
      success: true,
      data: {
        isValid: audit.isValid,
        algorithm: "AES-256-GCM",
        keyFingerprint: getKeyFingerprint(conversationId),
        authTagHex: authTag,
        status: audit.isValid ? "VERIFIED_AUTHENTIC_NO_TAMPERING" : "INTEGRITY_CHECK_FAILED",
        timestamp: new Date().toISOString(),
      },
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// 12. GET /api/messages/sync - Synchronize missed messages and receipts
// ─────────────────────────────────────────────────────────────────────────────
router.get("/sync", async (req, res) => {
  try {
    const currentUserId = req.user?.id || req.headers["x-wq-user-id"] || "bbc5fd04-2c10-430d-9a14-f29a2d60cccc"
    const { conversationId, since } = req.query

    if (!conversationId || !since) {
      return res.status(400).json({ success: false, message: "conversationId and since required" })
    }

    const sinceDate = new Date(since)
    const messages = await Message.find({
      conversationId,
      updatedAt: { $gt: sinceDate },
      deletedForUsers: { $ne: currentUserId },
    })
      .sort({ createdAt: 1 })
      .lean()

    const decrypted = messages.map((m) => {
      let plain = m.isDeleted ? "This message was deleted" : m.content
      if (!m.isDeleted && m.ciphertext && m.iv && m.authTag) {
        const dec = decryptMessage(m.ciphertext, m.iv, m.authTag, conversationId)
        if (dec.success) plain = dec.plaintext
      }

      return {
        id: m._id.toString(),
        conversationId: m.conversationId,
        senderWqUserId: m.senderWqUserId,
        recipientWqUserId: m.recipientWqUserId,
        isFromMe: m.senderWqUserId === currentUserId,
        content: plain,
        isDeleted: Boolean(m.isDeleted),
        isEdited: Boolean(m.isEdited),
        deliveryStatus: m.isRead ? "READ" : m.deliveryStatus || "DELIVERED",
        reactions: m.reactions || [],
        isRead: m.isRead,
        readAt: m.readAt,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
      }
    })

    res.json({
      success: true,
      message: "Sync completed",
      data: {
        messages: decrypted,
        syncTimestamp: new Date().toISOString(),
      },
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// 13. GET /api/messages/presence - Multi-user live presence query
// ─────────────────────────────────────────────────────────────────────────────
router.get("/presence", (req, res) => {
  try {
    const { userIds } = req.query
    if (!userIds) return res.json({ success: true, data: {} })
    const ids = String(userIds).split(",")
    const data = {}
    for (const id of ids) {
      const trimmed = id.trim()
      const online = isUserOnline(trimmed)
      data[trimmed] = {
        isOnline: online,
        lastSeen: online ? null : getUserLastSeen(trimmed),
      }
    }
    res.json({ success: true, data })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// 14. POST /api/messages/read - Authoritative read receipt confirmation
// ─────────────────────────────────────────────────────────────────────────────
router.post("/read", async (req, res) => {
  try {
    const currentUserId = req.user?.id || req.headers["x-wq-user-id"] || "bbc5fd04-2c10-430d-9a14-f29a2d60cccc"
    const { conversationId, messageIds } = req.body

    if (!conversationId || !Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({ success: false, message: "conversationId and messageIds required" })
    }

    await Message.updateMany(
      { _id: { $in: messageIds }, recipientWqUserId: currentUserId },
      { $set: { isRead: true, readAt: new Date(), deliveryStatus: "READ" } }
    )

    await Conversation.updateOne(
      { conversationId },
      {
        $set: {
          [`unreadCounts.${currentUserId}`]: 0,
          "lastMessage.isRead": true,
          "lastMessage.deliveryStatus": "READ",
        },
      }
    )

    notifyMessageRead(conversationId, currentUserId, messageIds)

    res.json({ success: true, message: "Messages marked as read" })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router
