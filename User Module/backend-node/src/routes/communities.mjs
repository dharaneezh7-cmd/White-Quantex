import { Router } from "express"
import { Community } from "../models/Community.mjs"
import { CommunityMessage } from "../models/CommunityMessage.mjs"
import { Member } from "../models/Member.mjs"
import { authMiddleware, requireAuth } from "../middleware/auth.mjs"
import { sanitizeHtml } from "../utils/security.mjs"

const router = Router()

// Apply authentication middleware to all routes (populates req.user if present)
router.use(authMiddleware)

function formatCommunity(c, userId) {
  const isOwner = Boolean(userId && c.createdByWqUserId === userId)
  const isJoined = Boolean(userId && (c.members || []).includes(userId))

  return {
    id: c._id.toString(),
    name: c.name,
    slug: c.slug,
    description: c.description,
    coverImageUrl: c.coverImageUrl || "",
    iconUrl: c.iconUrl || "",
    memberCount: c.memberCount || 1,
    membersCount: c.memberCount || 1,
    postCount: c.postCount || 0,
    isPrivate: Boolean(c.isPrivate),
    rules: c.rules || [],
    categories: c.categories || [],
    members: c.members || [],
    createdBy: c.createdByWqUserId,
    ownerId: c.createdByWqUserId,
    ownerName: c.ownerName || (isOwner ? "You" : "Community Lead"),
    ownerUsername: c.ownerUsername || "",
    isOwner,
    isJoined,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }
}

// GET /api/communities - List all hubs
router.get("/", async (req, res) => {
  try {
    const communities = await Community.find().sort({ memberCount: -1 }).lean()
    const userId = req.user?.id

    const formatted = communities.map((c) => formatCommunity(c, userId))

    res.json({
      success: true,
      message: "Communities retrieved",
      data: formatted,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/communities/:id - Single hub details
router.get("/:id", async (req, res) => {
  try {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id)
    const query = isObjectId ? { _id: req.params.id } : { slug: req.params.id }
    const c = await Community.findOne(query).lean()

    if (!c) {
      return res.status(404).json({ success: false, message: "Community not found" })
    }

    const userId = req.user?.id

    res.json({
      success: true,
      message: "Community details retrieved",
      data: formatCommunity(c, userId),
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/communities - Create Hub (Strict Ownership Binding)
router.post("/", requireAuth, async (req, res) => {
  try {
    const { name, description, category, isPrivate, rules, coverImageUrl, iconUrl } = req.body
    
    // Ownership MUST strictly bind to authenticated user
    const user = req.user
    const createdByWqUserId = user.id

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Community name is required." })
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")

    const existing = await Community.findOne({ $or: [{ name: name.trim() }, { slug }] })
    if (existing) {
      return res.status(409).json({ success: false, message: "A community hub with this name already exists." })
    }

    const comm = new Community({
      name: sanitizeHtml(name.trim()),
      slug,
      description: sanitizeHtml(description?.trim() || "An official White Quantex community hub."),
      coverImageUrl: coverImageUrl || "",
      iconUrl: iconUrl || "",
      memberCount: 1,
      members: [createdByWqUserId], // Creator automatically becomes first member
      isPrivate: Boolean(isPrivate),
      createdByWqUserId, // Strict ownership assigned to authenticated user
      ownerName: user.name,
      ownerUsername: user.username,
      categories: category ? [category] : ["General"],
      rules: rules && rules.length > 0 ? rules : ["Professional conduct required", "Verified secondary transactions only"],
    })

    await comm.save()

    res.status(201).json({
      success: true,
      message: "Community hub created successfully",
      data: formatCommunity(comm, createdByWqUserId),
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// PUT /api/communities/:id - Edit Hub (Owner Only)
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const comm = await Community.findById(req.params.id)
    if (!comm) {
      return res.status(404).json({ success: false, message: "Community hub not found." })
    }

    // Enforce ownership authorization
    if (comm.createdByWqUserId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Forbidden. Only the hub owner can edit this community hub.",
      })
    }

    const { description, category, isPrivate, rules, coverImageUrl, iconUrl } = req.body

    if (description !== undefined) comm.description = description.trim()
    if (category) comm.categories = [category]
    if (isPrivate !== undefined) comm.isPrivate = Boolean(isPrivate)
    if (rules && Array.isArray(rules)) comm.rules = rules
    if (coverImageUrl !== undefined) comm.coverImageUrl = coverImageUrl
    if (iconUrl !== undefined) comm.iconUrl = iconUrl

    // Owner ID and creator remain immutable
    await comm.save()

    res.json({
      success: true,
      message: "Community hub updated successfully",
      data: formatCommunity(comm, req.user.id),
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// DELETE /api/communities/:id - Delete Hub (Owner Only)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const comm = await Community.findById(req.params.id)
    if (!comm) {
      return res.status(404).json({ success: false, message: "Community hub not found." })
    }

    // Enforce ownership authorization
    if (comm.createdByWqUserId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Forbidden. Only the hub owner can delete this community hub.",
      })
    }

    await Community.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: "Community hub deleted successfully",
      data: { id: req.params.id },
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/communities/:id/join - Join Hub
router.post("/:id/join", requireAuth, async (req, res) => {
  try {
    const wqUserId = req.user.id
    const comm = await Community.findById(req.params.id)

    if (!comm) {
      return res.status(404).json({ success: false, message: "Community not found" })
    }

    if (!comm.members.includes(wqUserId)) {
      comm.members.push(wqUserId)
      comm.memberCount = comm.members.length
      await comm.save()
    }

    res.json({
      success: true,
      message: "Joined community hub",
      data: { id: comm._id.toString(), isJoined: true, memberCount: comm.memberCount },
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// DELETE /api/communities/:id/join - Leave Hub
router.delete("/:id/join", requireAuth, async (req, res) => {
  try {
    const wqUserId = req.user.id
    const comm = await Community.findById(req.params.id)

    if (!comm) {
      return res.status(404).json({ success: false, message: "Community not found" })
    }

    if (comm.members.includes(wqUserId)) {
      comm.members = comm.members.filter((m) => m !== wqUserId)
      comm.memberCount = comm.members.length
      await comm.save()
    }

    res.json({
      success: true,
      message: "Left community hub",
      data: { id: comm._id.toString(), isJoined: false, memberCount: comm.memberCount },
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/communities/:id/messages - Get messages in community WhatsApp-style group chat
router.get("/:id/messages", async (req, res) => {
  try {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id)
    const comm = await Community.findOne(isObjectId ? { _id: req.params.id } : { slug: req.params.id }).lean()
    if (!comm) {
      return res.status(404).json({ success: false, message: "Community not found" })
    }

    const commId = comm._id.toString()
    const messages = await CommunityMessage.find({ communityId: commId, isDeleted: false })
      .sort({ createdAt: 1 })
      .limit(100)
      .lean()

    const formatted = messages.map((m) => ({
      id: m._id.toString(),
      communityId: m.communityId,
      senderWqUserId: m.senderWqUserId,
      senderName: m.senderName,
      senderUsername: m.senderUsername,
      senderAvatarUrl: m.senderAvatarUrl,
      content: m.content,
      mediaUrl: m.mediaUrl,
      reactions: m.reactions || [],
      createdAt: m.createdAt,
    }))

    res.json({
      success: true,
      message: "Community messages retrieved",
      data: formatted,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/communities/:id/messages - Send message to community WhatsApp-style group chat
router.post("/:id/messages", requireAuth, async (req, res) => {
  try {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id)
    const comm = await Community.findOne(isObjectId ? { _id: req.params.id } : { slug: req.params.id })
    if (!comm) {
      return res.status(404).json({ success: false, message: "Community not found" })
    }

    const { content, mediaUrl } = req.body
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: "Message content cannot be empty" })
    }

    const user = req.user
    const senderWqUserId = user.id

    // Check if user has joined this community (or is the owner)
    const isMember = (comm.members || []).includes(senderWqUserId) || comm.createdByWqUserId === senderWqUserId
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "You must join this community before you can send messages in the group chat.",
      })
    }

    const senderName = user.name || "Ecosystem Participant"
    const senderUsername = user.username || ""

    // Fetch avatar if available
    const member = await Member.findOne({ wqUserId: senderWqUserId }).lean()
    const senderAvatarUrl = member?.avatarUrl || member?.avatar || ""

    const msg = new CommunityMessage({
      communityId: comm._id.toString(),
      senderWqUserId,
      senderName,
      senderUsername,
      senderAvatarUrl,
      content: sanitizeHtml(content.trim()),
      mediaUrl: mediaUrl ? mediaUrl.trim() : "",
    })

    await msg.save()

    res.status(201).json({
      success: true,
      message: "Message sent",
      data: {
        id: msg._id.toString(),
        communityId: msg.communityId,
        senderWqUserId: msg.senderWqUserId,
        senderName: msg.senderName,
        senderUsername: msg.senderUsername,
        senderAvatarUrl: msg.senderAvatarUrl,
        content: msg.content,
        mediaUrl: msg.mediaUrl,
        reactions: msg.reactions,
        createdAt: msg.createdAt,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/communities/:id/messages/:msgId/reaction - React to message
router.post("/:id/messages/:msgId/reaction", requireAuth, async (req, res) => {
  try {
    const { emoji } = req.body
    if (!emoji) {
      return res.status(400).json({ success: false, message: "Emoji required" })
    }

    const msg = await CommunityMessage.findById(req.params.msgId)
    if (!msg) {
      return res.status(404).json({ success: false, message: "Message not found" })
    }

    const userId = req.user.id
    const existingIndex = msg.reactions.findIndex((r) => r.wqUserId === userId && r.emoji === emoji)
    if (existingIndex > -1) {
      msg.reactions.splice(existingIndex, 1)
    } else {
      msg.reactions.push({
        emoji,
        wqUserId: userId,
        username: req.user.username || "",
      })
    }

    await msg.save()

    res.json({
      success: true,
      message: "Reaction updated",
      data: msg.reactions,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router
