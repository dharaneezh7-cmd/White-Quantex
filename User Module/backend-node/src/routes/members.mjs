import { Router } from "express"
import mongoose from "mongoose"
import { Member } from "../models/Member.mjs"
import { Post } from "../models/Post.mjs"
import { Comment } from "../models/Comment.mjs"
import { Community } from "../models/Community.mjs"
import { Follow } from "../models/Follow.mjs"
import { authMiddleware } from "../middleware/auth.mjs"

const router = Router()
router.use(authMiddleware)

function sanitizeHeadline(str = "") {
  if (!str) return "Verified Ecosystem Participant"
  return str
    .replace(/\b(co-founder|founder|ceo|chief executive officer|investor|managing partner|general partner|venture partner|partner|director|managing director|principal|lead)\b/gi, "")
    .replace(/^[\s·•|@&,-]+/, "")
    .replace(/[\s·•|@&,-]+$/, "")
    .replace(/\s+/g, " ")
    .trim() || "Verified Ecosystem Participant"
}

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

// GET /api/members/:id - Single member full LinkedIn-style profile
router.get("/:id", async (req, res) => {
  try {
    const rawTarget = (req.params.id || "").trim()
    const targetSlug = rawTarget.toLowerCase().replace(/[^a-z0-9]/g, "")
    const currentViewerId = req.user?.id || req.headers["x-wq-user-id"]

    // 1. Direct search by wqUserId, username, name, or ObjectId
    let member = await Member.findOne({
      $or: [
        { wqUserId: rawTarget },
        { username: rawTarget },
        { username: rawTarget.toLowerCase() },
        { name: rawTarget },
        { name: new RegExp(`^${rawTarget}$`, "i") },
        ...(mongoose.Types.ObjectId.isValid(rawTarget) ? [{ _id: rawTarget }] : []),
      ],
      isActive: true,
    }).lean()

    // 2. Slug / Company / Venture match across all active members
    if (!member) {
      const allMembers = await Member.find({ isActive: true }).lean()
      member = allMembers.find((m) => {
        const mUsername = (m.username || "").toLowerCase().replace(/[^a-z0-9]/g, "")
        const mName = (m.name || "").toLowerCase().replace(/[^a-z0-9]/g, "")
        const mVenture = (m.portfolioOrVenture || "").toLowerCase().replace(/[^a-z0-9]/g, "")
        const mHeadline = (m.headline || "").toLowerCase().replace(/[^a-z0-9]/g, "")
        const mWq = (m.wqUserId || "").toLowerCase().replace(/[^a-z0-9]/g, "")

        return (
          mUsername === targetSlug ||
          mName === targetSlug ||
          mWq === targetSlug ||
          (targetSlug.length >= 4 && mVenture.includes(targetSlug)) ||
          (targetSlug.length >= 4 && targetSlug.includes(mVenture) && mVenture.length >= 4) ||
          (targetSlug.length >= 4 && mHeadline.includes(targetSlug))
        )
      })
    }

    // 3. Search in Posts collection for matching author or company
    if (!member) {
      const authorPost = await Post.findOne({
        $or: [
          { authorUsername: rawTarget },
          { authorUsername: rawTarget.toLowerCase() },
          { wqAuthorId: rawTarget },
          { authorName: rawTarget },
          { authorName: new RegExp(`^${rawTarget}$`, "i") },
          { companyId: new RegExp(`^${rawTarget}$`, "i") },
          { ticker: rawTarget.toUpperCase() },
        ],
      }).lean()

      if (authorPost) {
        // If this post is linked to a registered member, fetch that member's full profile
        if (authorPost.wqAuthorId) {
          member = await Member.findOne({
            $or: [
              { wqUserId: authorPost.wqAuthorId },
              { username: authorPost.authorUsername },
            ],
            isActive: true,
          }).lean()
        }

        // If still not a registered member, construct a valid ecosystem entity
        if (!member) {
          member = {
            wqUserId: authorPost.wqAuthorId || rawTarget,
            name: authorPost.authorName || rawTarget,
            username: authorPost.authorUsername || targetSlug || "member",
            headline: authorPost.authorHeadline || "Verified Ecosystem Participant",
            bio: `${authorPost.authorName || rawTarget} is a verified entity in the White Quantex ecosystem.`,
            location: "San Francisco, CA",
            avatarUrl: authorPost.authorAvatarUrl || "",
            role: authorPost.authorRole || "MEMBER",
            verificationLevel: authorPost.authorVerificationLevel || "GOLD",
            trustScore: 90,
          }
        }
      }
    }

    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found" })
    }

    const memberKey = member.wqUserId || member._id?.toString()

    // 1. Real followers and following counts directly from Follow collection
    const realFollowersCount = await Follow.countDocuments({
      $or: [{ followingWqUserId: memberKey }, { followingWqUserId: member.username }],
    })
    const realFollowingCount = await Follow.countDocuments({
      $or: [{ followerWqUserId: memberKey }, { followerWqUserId: member.username }],
    })

    // 2. Communities created by user
    const createdCommunities = await Community.find({
      $or: [
        { createdByWqUserId: memberKey },
        { createdByWqUserId: member.username },
        { ownerUsername: member.username },
      ],
    }).lean()

    // 3. Communities joined by user
    const joinedCommunities = await Community.find({
      $or: [
        { members: memberKey },
        { members: member.username },
      ],
    }).lean()

    // 4. Posts by this user
    const userPosts = await Post.find({
      $or: [
        { wqAuthorId: memberKey },
        { authorUsername: member.username },
        { authorName: member.name },
      ],
    })
      .sort({ createdAt: -1 })
      .lean()

    // 5. Viewer follow status
    let isFollowing = false
    if (currentViewerId && currentViewerId !== memberKey) {
      const existing = await Follow.findOne({
        followerWqUserId: currentViewerId,
        $or: [{ followingWqUserId: memberKey }, { followingWqUserId: member.username }],
      }).lean()
      isFollowing = Boolean(existing)
    }

    res.json({
      success: true,
      message: "Member details retrieved",
      data: {
        id: memberKey,
        wqUserId: memberKey,
        name: member.name,
        username: member.username,
        headline: sanitizeHeadline(member.headline),
        bio: member.bio || "",
        location: member.location || "San Francisco, CA",
        avatar: member.avatarUrl || "",
        avatarUrl: member.avatarUrl || "",
        socialLinks: member.socialLinks || {},
        followersCount: realFollowersCount,
        followingCount: realFollowingCount,
        postsCount: userPosts.length,
        role: member.role || "MEMBER",
        verificationLevel: member.verificationLevel || "GOLD",
        trustScore: member.trustScore || 90,
        portfolioOrVenture: member.portfolioOrVenture || "",
        isFollowing,
        createdCommunities: createdCommunities.map((c) => ({
          id: c._id.toString(),
          name: c.name,
          slug: c.slug,
          description: c.description,
          iconUrl: c.iconUrl || "",
          coverImageUrl: c.coverImageUrl || "",
          memberCount: c.memberCount || c.members?.length || 1,
          postCount: c.postCount || 0,
          categories: c.categories || [],
          isPrivate: Boolean(c.isPrivate),
        })),
        joinedCommunities: joinedCommunities.map((c) => ({
          id: c._id.toString(),
          name: c.name,
          slug: c.slug,
          description: c.description,
          iconUrl: c.iconUrl || "",
          coverImageUrl: c.coverImageUrl || "",
          memberCount: c.memberCount || c.members?.length || 1,
          postCount: c.postCount || 0,
          categories: c.categories || [],
          isPrivate: Boolean(c.isPrivate),
        })),
        posts: userPosts.map((p) => ({
          id: p._id.toString(),
          title: p.title || "",
          content: p.content,
          postType: p.postType || "TEXT",
          mediaUrls: p.mediaUrls || [],
          ticker: p.ticker || "",
          likesCount: p.likesCount || 0,
          commentsCount: p.commentsCount || 0,
          sharesCount: p.sharesCount || 0,
          createdAt: p.createdAt,
          tags: p.tags || [],
        })),
      },
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// PUT /api/members/profile - Update or upsert current user's profile
router.put("/profile", async (req, res) => {
  try {
    const {
      wqUserId,
      id,
      name,
      displayName,
      username,
      headline,
      bio,
      location,
      role,
      website,
      twitterUrl,
      linkedinUrl,
      githubUrl,
      avatarUrl,
    } = req.body

    const targetUserId = wqUserId || id || req.user?.id || req.headers["x-wq-user-id"] || "wq-uuid-canonical-reference"
    const targetUsername = username || (displayName || name || "user").toLowerCase().replace(/[^a-z0-9]/g, "")
    const resolvedName = displayName || name || "Dharaneesh Viswanathan"

    const existingMember = await Member.findOne({
      $or: [
        { wqUserId: targetUserId },
        { username: targetUsername },
        ...(username ? [{ username }] : []),
        ...(req.user?.username ? [{ username: req.user.username }] : []),
        ...(req.user?.id ? [{ wqUserId: req.user.id }] : []),
      ],
    }).lean()
    const oldUsername = existingMember?.username
    const oldUserId = existingMember?.wqUserId

    const updated = await Member.findOneAndUpdate(
      { $or: [{ wqUserId: targetUserId }, { username: targetUsername }] },
      {
        $set: {
          wqUserId: targetUserId,
          name: resolvedName,
          username: targetUsername,
          headline: headline || "Verified Ecosystem Participant",
          bio: bio || "",
          location: location || "San Francisco, CA",
          role: role ? role.toUpperCase() : "FOUNDER",
          avatarUrl: avatarUrl || "",
          socialLinks: {
            website,
            twitter: twitterUrl,
            linkedin: linkedinUrl,
            github: githubUrl,
          },
          isActive: true,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    // Synchronize author details across all posts created by this user
    await Post.updateMany(
      {
        $or: [
          { wqAuthorId: targetUserId },
          { authorUsername: targetUsername },
          ...(oldUserId ? [{ wqAuthorId: oldUserId }] : []),
          ...(oldUsername ? [{ authorUsername: oldUsername }] : []),
          ...(username ? [{ authorUsername: username }] : []),
          ...(req.user?.id ? [{ wqAuthorId: req.user.id }] : []),
          ...(req.user?.username ? [{ authorUsername: req.user.username }] : []),
        ],
      },
      {
        $set: {
          authorName: resolvedName,
          authorHeadline: headline || "Verified Ecosystem Participant",
          authorUsername: targetUsername,
          authorRole: role ? role.toUpperCase() : "FOUNDER",
          ...(avatarUrl ? { authorAvatarUrl: avatarUrl } : {}),
        },
      }
    )

    // Synchronize author details across all comments created by this user
    await Comment.updateMany(
      {
        $or: [
          { wqAuthorId: targetUserId },
          ...(oldUserId ? [{ wqAuthorId: oldUserId }] : []),
          ...(req.user?.id ? [{ wqAuthorId: req.user.id }] : []),
        ],
      },
      {
        $set: {
          authorName: resolvedName,
          ...(avatarUrl ? { authorAvatarUrl: avatarUrl } : {}),
        },
      }
    )

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: updated,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// PUT /api/members/:id - Update member profile by ID
router.put("/:id", async (req, res) => {
  try {
    const targetUserId = req.params.id
    const {
      name,
      displayName,
      username,
      headline,
      bio,
      location,
      role,
      website,
      twitterUrl,
      linkedinUrl,
      githubUrl,
      avatarUrl,
    } = req.body

    const resolvedName = displayName || name || "Dharaneesh Viswanathan"
    const targetUsername = username || (displayName || name || "user").toLowerCase().replace(/[^a-z0-9]/g, "")

    const existingMember = await Member.findOne({
      $or: [{ wqUserId: targetUserId }, { username: targetUserId }],
    }).lean()
    const oldUsername = existingMember?.username

    const updated = await Member.findOneAndUpdate(
      { $or: [{ wqUserId: targetUserId }, { username: targetUserId }] },
      {
        $set: {
          name: resolvedName,
          username: targetUsername,
          headline: headline || "Verified Ecosystem Participant",
          bio: bio || "",
          location: location || "San Francisco, CA",
          role: role ? role.toUpperCase() : "FOUNDER",
          avatarUrl: avatarUrl || "",
          socialLinks: {
            website,
            twitter: twitterUrl,
            linkedin: linkedinUrl,
            github: githubUrl,
          },
        },
      },
      { upsert: true, new: true }
    )

    // Synchronize author details across all posts created by this user
    await Post.updateMany(
      {
        $or: [
          { wqAuthorId: targetUserId },
          { authorUsername: targetUserId },
          { authorUsername: targetUsername },
          ...(oldUsername ? [{ authorUsername: oldUsername }] : []),
        ],
      },
      {
        $set: {
          authorName: resolvedName,
          authorHeadline: headline || "Verified Ecosystem Participant",
          authorUsername: targetUsername,
          authorRole: role ? role.toUpperCase() : "FOUNDER",
          ...(avatarUrl ? { authorAvatarUrl: avatarUrl } : {}),
        },
      }
    )

    // Synchronize author details across all comments created by this user
    await Comment.updateMany(
      {
        $or: [{ wqAuthorId: targetUserId }],
      },
      {
        $set: {
          authorName: resolvedName,
          ...(avatarUrl ? { authorAvatarUrl: avatarUrl } : {}),
        },
      }
    )

    res.json({
      success: true,
      message: "Member profile updated successfully",
      data: updated,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router

