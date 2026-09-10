import { Router } from "express"
import { Follow } from "../models/Follow.mjs"

const router = Router()

// POST /api/follows/:userId - Follow User
router.post("/:userId", async (req, res) => {
  try {
    const targetUserId = req.params.userId
    const followerWqUserId = req.headers["x-wq-user-id"] || "wq-uuid-demo-author"

    if (followerWqUserId === targetUserId) {
      return res.status(400).json({ success: false, message: "Cannot follow yourself." })
    }

    await Follow.create({ followerWqUserId, followingWqUserId: targetUserId })

    res.json({ success: true, message: "Followed successfully", data: null, timestamp: new Date().toISOString() })
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: "Already following user." })
    }
    res.status(500).json({ success: false, message: err.message })
  }
})

// DELETE /api/follows/:userId - Unfollow User
router.delete("/:userId", async (req, res) => {
  try {
    const targetUserId = req.params.userId
    const followerWqUserId = req.headers["x-wq-user-id"] || "wq-uuid-demo-author"

    await Follow.findOneAndDelete({ followerWqUserId, followingWqUserId: targetUserId })

    res.json({ success: true, message: "Unfollowed successfully", data: null, timestamp: new Date().toISOString() })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router
