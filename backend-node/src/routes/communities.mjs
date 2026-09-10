import { Router } from "express"
import { Community } from "../models/Community.mjs"

const router = Router()

// GET /api/communities
router.get("/", async (req, res) => {
  try {
    const communities = await Community.find().lean()
    const formatted = communities.map((c) => ({
      id: c._id.toString(),
      name: c.name,
      slug: c.slug,
      description: c.description,
      memberCount: c.memberCount,
      postCount: c.postCount,
      isPrivate: c.isPrivate,
      rules: [],
      categories: c.categories || [],
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

export default router
