import { Router } from "express"
import { Member } from "../models/Member.mjs"

const router = Router()

// GET /api/members - List ecosystem members (Founders & Investors)
router.get("/", async (req, res) => {
  try {
    const { role, query } = req.query
    const filter = { isActive: true }

    if (role && role !== "all") {
      filter.role = role.toUpperCase()
    }

    if (query && query.trim()) {
      filter.$or = [
        { name: { $regex: query, $options: "i" } },
        { headline: { $regex: query, $options: "i" } },
        { location: { $regex: query, $options: "i" } },
        { portfolioOrVenture: { $regex: query, $options: "i" } },
      ]
    }

    const members = await Member.find(filter)
      .sort({ followersCount: -1 })
      .lean()

    const formatted = members.map((m) => ({
      id: m.wqUserId || m._id.toString(),
      name: m.name,
      username: m.username,
      headline: m.headline,
      bio: m.bio || "",
      location: m.location,
      avatar: m.avatarUrl || "",
      avatarUrl: m.avatarUrl || "",
      followersCount: m.followersCount || 0,
      followingCount: m.followingCount || 0,
      role: m.role,
      verificationLevel: m.verificationLevel || "GOLD",
      trustScore: m.trustScore || 90,
      portfolioOrVenture: m.portfolioOrVenture || "",
    }))

    res.json({
      success: true,
      message: "Ecosystem members retrieved",
      data: formatted,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/members/:id - Single member
router.get("/:id", async (req, res) => {
  try {
    const member = await Member.findOne({
      $or: [{ wqUserId: req.params.id }, { username: req.params.id }],
      isActive: true,
    }).lean()

    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found" })
    }

    res.json({
      success: true,
      message: "Member details retrieved",
      data: {
        id: member.wqUserId || member._id.toString(),
        name: member.name,
        username: member.username,
        headline: member.headline,
        bio: member.bio || "",
        location: member.location,
        avatar: member.avatarUrl || "",
        avatarUrl: member.avatarUrl || "",
        followersCount: member.followersCount || 0,
        followingCount: member.followingCount || 0,
        role: member.role,
        verificationLevel: member.verificationLevel,
        trustScore: member.trustScore,
        portfolioOrVenture: member.portfolioOrVenture,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router
