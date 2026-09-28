import { Router } from "express"
import { Community } from "../models/Community.mjs"

const router = Router()

// GET /api/communities - List all hubs
router.get("/", async (req, res) => {
  try {
    const communities = await Community.find().sort({ memberCount: -1 }).lean()
    const wqUserId = req.headers["x-wq-user-id"] || "wq-uuid-demo-author"

    const formatted = communities.map((c) => ({
      id: c._id.toString(),
      name: c.name,
      slug: c.slug,
      description: c.description,
      coverImageUrl: c.coverImageUrl || "",
      iconUrl: c.iconUrl || "",
      memberCount: c.memberCount || 1,
      membersCount: c.memberCount || 1,
      postCount: c.postCount || 0,
      isPrivate: c.isPrivate || false,
      rules: c.rules || [],
      categories: c.categories || [],
      isJoined: (c.members || []).includes(wqUserId),
      createdBy: c.createdByWqUserId,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }))

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

    const wqUserId = req.headers["x-wq-user-id"] || "wq-uuid-demo-author"

    res.json({
      success: true,
      message: "Community details retrieved",
      data: {
        id: c._id.toString(),
        name: c.name,
        slug: c.slug,
        description: c.description,
        coverImageUrl: c.coverImageUrl || "",
        iconUrl: c.iconUrl || "",
        memberCount: c.memberCount || 1,
        membersCount: c.memberCount || 1,
        postCount: c.postCount || 0,
        isPrivate: c.isPrivate || false,
        rules: c.rules || [],
        categories: c.categories || [],
        isJoined: (c.members || []).includes(wqUserId),
        createdBy: c.createdByWqUserId,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/communities - Create Hub
router.post("/", async (req, res) => {
  try {
    const { name, description, category, isPrivate, rules, coverImageUrl, iconUrl } = req.body
    const wqUserId = req.headers["x-wq-user-id"] || "wq-uuid-demo-author"

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Community name is required" })
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")

    const existing = await Community.findOne({ $or: [{ name: name.trim() }, { slug }] })
    if (existing) {
      return res.status(409).json({ success: false, message: "Community with this name already exists." })
    }

    const comm = new Community({
      name: name.trim(),
      slug,
      description: description || "An official White Quantex community hub.",
      coverImageUrl: coverImageUrl || "",
      iconUrl: iconUrl || "",
      memberCount: 1,
      members: [wqUserId],
      isPrivate: Boolean(isPrivate),
      createdByWqUserId: wqUserId,
      categories: category ? [category] : ["General"],
      rules: rules || ["Professional conduct required", "Verified secondary transactions only"],
    })

    await comm.save()

    res.status(201).json({
      success: true,
      message: "Community hub created",
      data: {
        id: comm._id.toString(),
        name: comm.name,
        slug: comm.slug,
        description: comm.description,
        memberCount: comm.memberCount,
        membersCount: comm.memberCount,
        postCount: 0,
        isPrivate: comm.isPrivate,
        categories: comm.categories,
        isJoined: true,
        createdAt: comm.createdAt,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/communities/:id/join - Join Hub
router.post("/:id/join", async (req, res) => {
  try {
    const wqUserId = req.headers["x-wq-user-id"] || "wq-uuid-demo-author"
    const comm = await Community.findById(req.params.id)

    if (!comm) {
      return res.status(404).json({ success: false, message: "Community not found" })
    }

    if (!comm.members.includes(wqUserId)) {
      comm.members.push(wqUserId)
      comm.memberCount = (comm.memberCount || 0) + 1
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
router.delete("/:id/join", async (req, res) => {
  try {
    const wqUserId = req.headers["x-wq-user-id"] || "wq-uuid-demo-author"
    const comm = await Community.findById(req.params.id)

    if (!comm) {
      return res.status(404).json({ success: false, message: "Community not found" })
    }

    if (comm.members.includes(wqUserId)) {
      comm.members = comm.members.filter((m) => m !== wqUserId)
      comm.memberCount = Math.max(1, (comm.memberCount || 1) - 1)
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

export default router
