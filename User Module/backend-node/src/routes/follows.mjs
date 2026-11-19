import { Router } from "express"
import { Follow } from "../models/Follow.mjs"
import { Member } from "../models/Member.mjs"
import { Notification } from "../models/Notification.mjs"
import { authMiddleware } from "../middleware/auth.mjs"

const router = Router()
router.use(authMiddleware)

// Helper to resolve canonical user ID/key from Member if possible
async function resolveUserKey(rawId) {
  if (!rawId) return null
  const member = await Member.findOne({
    $or: [{ wqUserId: rawId }, { username: rawId }, { name: rawId }],
  }).lean()
  return member?.wqUserId || rawId
}

// GET /api/follows - Get list of user IDs followed by the current user
router.get("/", async (req, res) => {
  try {
    const followerWqUserId = req.user?.id || req.headers["x-wq-user-id"]
    if (!followerWqUserId) {
      return res.json({ success: true, data: { followingIds: [] }, timestamp: new Date().toISOString() })
    }

    const canonicalFollower = await resolveUserKey(followerWqUserId)

    const follows = await Follow.find({
      $or: [{ followerWqUserId }, { followerWqUserId: canonicalFollower }],
    }).select("followingWqUserId").lean()

    const followingIds = [...new Set(follows.map((f) => f.followingWqUserId))]

    res.json({
      success: true,
      message: "Following list retrieved",
      data: { followingIds },
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/follows/:userId/status - Check follow status and follower count for a user
router.get("/:userId/status", async (req, res) => {
  try {
    const targetUserId = req.params.userId
    const followerWqUserId = req.user?.id || req.headers["x-wq-user-id"]

    const targetKey = (await resolveUserKey(targetUserId)) || targetUserId
    const canonicalFollower = followerWqUserId ? await resolveUserKey(followerWqUserId) : null

    let isFollowing = false
    if (followerWqUserId) {
      const existing = await Follow.findOne({
        $or: [
          { followerWqUserId, followingWqUserId: targetKey },
          { followerWqUserId, followingWqUserId: targetUserId },
          ...(canonicalFollower ? [
            { followerWqUserId: canonicalFollower, followingWqUserId: targetKey },
            { followerWqUserId: canonicalFollower, followingWqUserId: targetUserId },
          ] : [])
        ]
      }).lean()
      isFollowing = Boolean(existing)
    }

    const targetMember = await Member.findOne({
      $or: [{ wqUserId: targetKey }, { wqUserId: targetUserId }, { username: targetUserId }],
    }).lean()

    const followersCount = targetMember?.followersCount ?? (await Follow.countDocuments({
      $or: [{ followingWqUserId: targetKey }, { followingWqUserId: targetUserId }]
    }))

    res.json({
      success: true,
      data: { isFollowing, followersCount },
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/follows/:userId - Follow User
router.post("/:userId", async (req, res) => {
  try {
    const targetUserId = req.params.userId
    const rawFollower = req.user?.id || req.headers["x-wq-user-id"]
    if (!rawFollower) {
      return res.status(401).json({ success: false, message: "Authentication required to follow members." })
    }

    const targetMember = await Member.findOne({
      $or: [{ wqUserId: targetUserId }, { username: targetUserId }],
    })
    const targetKey = targetMember?.wqUserId || targetUserId
    const followerKey = (await resolveUserKey(rawFollower)) || rawFollower

    if (followerKey === targetKey || rawFollower === targetUserId || rawFollower === targetKey) {
      return res.status(400).json({ success: false, message: "Cannot follow yourself." })
    }

    const existing = await Follow.findOne({
      followerWqUserId: followerKey,
      followingWqUserId: targetKey,
    })

    let isNewFollow = false
    if (!existing) {
      await Follow.create({ followerWqUserId: followerKey, followingWqUserId: targetKey })
      isNewFollow = true

      // Increment target member's followersCount
      if (targetMember) {
        targetMember.followersCount = (targetMember.followersCount || 0) + 1
        await targetMember.save()
      } else {
        await Member.updateOne(
          { $or: [{ wqUserId: targetKey }, { username: targetKey }] },
          { $inc: { followersCount: 1 } }
        )
      }

      // Increment follower's followingCount
      await Member.updateOne(
        { $or: [{ wqUserId: followerKey }, { username: followerKey }] },
        { $inc: { followingCount: 1 } }
      )

      // Notify target user
      try {
        const followerMember = await Member.findOne({
          $or: [{ wqUserId: followerKey }, { username: followerKey }],
        }).lean()

        await Notification.create({
          wqUserId: targetKey,
          type: "FOLLOW",
          actorName: followerMember?.name || req.user?.name || "Ecosystem Member",
          actorAvatarUrl: followerMember?.avatarUrl || req.user?.avatarUrl || "",
          actorHeadline: followerMember?.headline || req.user?.headline || "Verified Member",
          actorRole: followerMember?.role || req.user?.role || "FOUNDER",
          message: "started following your ecosystem dispatches and investment activity",
          targetId: followerKey,
          targetType: "USER",
          isRead: false,
        })
      } catch (notifErr) {
        // Notification error non-fatal
      }
    }

    const updatedTarget = await Member.findOne({
      $or: [{ wqUserId: targetKey }, { username: targetKey }],
    }).lean()

    const followersCount = updatedTarget?.followersCount ?? (await Follow.countDocuments({ followingWqUserId: targetKey }))

    res.json({
      success: true,
      message: isNewFollow ? "Followed successfully" : "Already following",
      data: { isFollowing: true, followersCount, targetUserId: targetKey },
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    if (err.code === 11000) {
      return res.json({
        success: true,
        message: "Already following user.",
        data: { isFollowing: true },
        timestamp: new Date().toISOString(),
      })
    }
    res.status(500).json({ success: false, message: err.message })
  }
})

// Helper to sanitize headlines
function sanitizeHeadline(str = "") {
  if (!str) return "Ecosystem Participant"
  return str
    .replace(/\b(co-founder|founder|ceo|investor|managing partner|general partner|venture partner|partner)\b/gi, "")
    .replace(/^\s*&\s*/, "")
    .replace(/\s*&\s*$/, "")
    .replace(/^\s*@\s*/, "")
    .replace(/\s+/g, " ")
    .trim() || "Ecosystem Participant"
}

// GET /api/follows/:userId/followers - Get list of users who follow this user
router.get("/:userId/followers", async (req, res) => {
  try {
    const targetUserId = req.params.userId
    const currentViewerId = req.user?.id || req.headers["x-wq-user-id"]
    const targetKey = (await resolveUserKey(targetUserId)) || targetUserId

    // 1. Fetch real followers recorded in DB
    const followDocs = await Follow.find({
      $or: [{ followingWqUserId: targetKey }, { followingWqUserId: targetUserId }],
    }).select("followerWqUserId").lean()

    const followerIds = [...new Set(followDocs.map((f) => f.followerWqUserId))]

    let realMembers = []
    if (followerIds.length > 0) {
      realMembers = await Member.find({
        $or: followerIds.map((id) => ({ wqUserId: id })),
      }).select("wqUserId name username avatarUrl avatar headline verificationLevel followersCount").lean()
    }

    const memberMap = {}
    for (const m of realMembers) {
      memberMap[m.wqUserId] = m
    }

    // 2. Fetch current viewer's following list to mark isFollowing state
    let viewerFollowingSet = new Set()
    if (currentViewerId) {
      const viewerFollows = await Follow.find({
        $or: [{ followerWqUserId: currentViewerId }],
      }).select("followingWqUserId").lean()
      viewerFollowingSet = new Set(viewerFollows.map((f) => f.followingWqUserId))
    }

    const realList = followerIds.map((id) => {
      const m = memberMap[id]
      const followDoc = followDocs.find((f) => f.followerWqUserId === id)
      return {
        id: m?.wqUserId || id,
        name: m?.name || "Ecosystem Member",
        username: m?.username || id,
        avatarUrl: m?.avatarUrl || m?.avatar || "",
        headline: sanitizeHeadline(m?.headline),
        verificationLevel: m?.verificationLevel || "NONE",
        followersCount: m?.followersCount || 0,
        isFollowing: viewerFollowingSet.has(m?.wqUserId || id),
        hasPrivateAccess: Boolean(followDoc?.hasPrivateAccess),
      }
    })

    res.json({
      success: true,
      data: {
        list: realList,
        total: realList.length,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/follows/:userId/following - Get list of users this user follows
router.get("/:userId/following", async (req, res) => {
  try {
    const targetUserId = req.params.userId
    const currentViewerId = req.user?.id || req.headers["x-wq-user-id"]
    const targetKey = (await resolveUserKey(targetUserId)) || targetUserId

    // 1. Fetch real followed accounts from DB
    const followDocs = await Follow.find({
      $or: [{ followerWqUserId: targetKey }, { followerWqUserId: targetUserId }],
    }).select("followingWqUserId").lean()

    const followingIds = [...new Set(followDocs.map((f) => f.followingWqUserId))]

    let realMembers = []
    if (followingIds.length > 0) {
      realMembers = await Member.find({
        $or: followingIds.map((id) => ({ wqUserId: id })),
      }).select("wqUserId name username avatarUrl avatar headline verificationLevel followersCount").lean()
    }

    const memberMap = {}
    for (const m of realMembers) {
      memberMap[m.wqUserId] = m
    }

    // 2. Fetch viewer following state
    let viewerFollowingSet = new Set()
    if (currentViewerId) {
      const viewerFollows = await Follow.find({
        $or: [{ followerWqUserId: currentViewerId }],
      }).select("followingWqUserId").lean()
      viewerFollowingSet = new Set(viewerFollows.map((f) => f.followingWqUserId))
    }

    const realList = followingIds.map((id) => {
      const m = memberMap[id]
      return {
        id: m?.wqUserId || id,
        name: m?.name || "Ecosystem Member",
        username: m?.username || id,
        avatarUrl: m?.avatarUrl || m?.avatar || "",
        headline: sanitizeHeadline(m?.headline),
        verificationLevel: m?.verificationLevel || "NONE",
        followersCount: m?.followersCount || 0,
        isFollowing: viewerFollowingSet.has(m?.wqUserId || id),
      }
    })

    res.json({
      success: true,
      data: {
        list: realList,
        total: realList.length,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// DELETE /api/follows/:userId - Unfollow User
router.delete("/:userId", async (req, res) => {
  try {
    const targetUserId = req.params.userId
    const rawFollower = req.user?.id || req.headers["x-wq-user-id"]
    if (!rawFollower) {
      return res.status(401).json({ success: false, message: "Authentication required to unfollow members." })
    }

    const targetMember = await Member.findOne({
      $or: [{ wqUserId: targetUserId }, { username: targetUserId }],
    })
    const targetKey = targetMember?.wqUserId || targetUserId
    const followerKey = (await resolveUserKey(rawFollower)) || rawFollower

    const deleted = await Follow.findOneAndDelete({
      $or: [
        { followerWqUserId: followerKey, followingWqUserId: targetKey },
        { followerWqUserId: rawFollower, followingWqUserId: targetKey },
        { followerWqUserId: followerKey, followingWqUserId: targetUserId },
        { followerWqUserId: rawFollower, followingWqUserId: targetUserId },
      ]
    })

    if (deleted) {
      if (targetMember) {
        targetMember.followersCount = Math.max(0, (targetMember.followersCount || 0) - 1)
        await targetMember.save()
      } else {
        await Member.updateOne(
          { $or: [{ wqUserId: targetKey }, { username: targetKey }] },
          { $inc: { followersCount: -1 } }
        )
      }

      await Member.updateOne(
        { $or: [{ wqUserId: followerKey }, { username: followerKey }] },
        { $inc: { followingCount: -1 } }
      )
    }

    const updatedTarget = await Member.findOne({
      $or: [{ wqUserId: targetKey }, { username: targetKey }],
    }).lean()

    const followersCount = updatedTarget?.followersCount ?? (await Follow.countDocuments({ followingWqUserId: targetKey }))

    res.json({
      success: true,
      message: "Unfollowed successfully",
      data: { isFollowing: false, followersCount, targetUserId: targetKey },
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/follows/:userId/private-access - Toggle private access for a follower (Author Only)
router.post("/:userId/private-access", async (req, res) => {
  try {
    const targetFollowerId = req.params.userId
    const currentUserId = req.user?.id || req.headers["x-wq-user-id"]

    if (!currentUserId) {
      return res.status(401).json({ success: false, message: "Authentication required" })
    }

    const currentKey = (await resolveUserKey(currentUserId)) || currentUserId
    const followerKey = (await resolveUserKey(targetFollowerId)) || targetFollowerId

    const followDoc = await Follow.findOne({
      $or: [
        { followerWqUserId: followerKey, followingWqUserId: currentKey },
        { followerWqUserId: targetFollowerId, followingWqUserId: currentKey },
        { followerWqUserId: followerKey, followingWqUserId: currentUserId },
        { followerWqUserId: targetFollowerId, followingWqUserId: currentUserId },
      ],
    })

    if (!followDoc) {
      return res.status(404).json({
        success: false,
        message: "This user is not currently following you.",
      })
    }

    followDoc.hasPrivateAccess = !Boolean(followDoc.hasPrivateAccess)
    await followDoc.save()

    res.json({
      success: true,
      message: followDoc.hasPrivateAccess
        ? "Private access granted to follower"
        : "Private access revoked from follower",
      data: {
        followerId: targetFollowerId,
        hasPrivateAccess: followDoc.hasPrivateAccess,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router
