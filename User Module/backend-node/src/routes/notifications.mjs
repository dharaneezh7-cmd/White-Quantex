import { Router } from "express"
import { Notification } from "../models/Notification.mjs"

const router = Router()

// GET /api/notifications - List notifications
router.get("/", async (req, res) => {
  try {
    const wqUserId = req.headers["x-wq-user-id"] || "wq-uuid-demo-author"
    const filterType = req.query.filter || "all"

    const query = {
      $or: [{ wqUserId }, { wqUserId: "all" }, { wqUserId: "wq-uuid-demo-author" }],
    }

    if (filterType === "mentions") {
      query.type = "COMMENT"
    } else if (filterType === "activity") {
      query.type = { $in: ["LIKE", "FOLLOW", "VENTURE"] }
    }

    const notifs = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(30)
      .lean()

    const formatted = notifs.map((n) => ({
      id: n._id.toString(),
      type: n.type,
      actor: {
        name: n.actorName,
        avatar: n.actorAvatarUrl || "",
        role: n.actorHeadline || n.actorRole || "Verified Community Member",
      },
      message: n.message,
      targetId: n.targetId,
      time: timeAgo(n.createdAt),
      read: n.isRead,
    }))

    res.json({
      success: true,
      message: "Notifications retrieved",
      data: formatted,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// PATCH /api/notifications/:id/read - Mark read
router.patch("/:id/read", async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true })
    res.json({ success: true, message: "Notification marked as read" })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/notifications/read-all - Mark all read
router.post("/read-all", async (req, res) => {
  try {
    const wqUserId = req.headers["x-wq-user-id"] || "wq-uuid-demo-author"
    await Notification.updateMany({ wqUserId }, { isRead: true })
    res.json({ success: true, message: "All notifications marked as read" })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

function timeAgo(date) {
  if (!date) return "Just now"
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  if (seconds < 60) return `${Math.max(1, seconds)}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default router
