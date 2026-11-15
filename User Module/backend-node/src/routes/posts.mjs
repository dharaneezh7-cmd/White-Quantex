import { Router } from "express"
import { Post } from "../models/Post.mjs"
import { Community } from "../models/Community.mjs"
import { Comment } from "../models/Comment.mjs"
import { Like } from "../models/Like.mjs"
import { Bookmark } from "../models/Bookmark.mjs"
import { Notification } from "../models/Notification.mjs"
import { Member } from "../models/Member.mjs"
import { authMiddleware, requireAuth } from "../middleware/auth.mjs"
import { recommendationService } from "../services/recommendationService.mjs"

const router = Router()

// Apply authentication middleware to all routes (populates req.user if present)
router.use(authMiddleware)

// Helper to format post for frontend consumption
function formatPost(
  p,
  userId,
  likedSet = new Set(),
  bookmarkedSet = new Set(),
  reqUser = null,
  memberObj = null,
  commentCount = null
) {
  const pid = p._id.toString()
  const isOrg =
    p.authorAccountType === "COMPANY" ||
    p.authorAccountType === "VENTURE" ||
    p.authorType === "COMPANY" ||
    p.authorType === "VENTURE"
  let resolvedDisplayName = p.authorName

  if (isOrg) {
    if (p.companyId && !p.companyId.startsWith("comp-") && !p.companyId.startsWith("wq-")) {
      resolvedDisplayName = p.companyId
    } else if (p.authorHeadline && p.authorHeadline.includes("@")) {
      const match = p.authorHeadline.match(/@\s*([^,·•|]+)/)
      if (match && match[1]?.trim()) {
        resolvedDisplayName = match[1].trim()
      }
    }
  }

  // Normalize visibility
  let visibility = (p.visibility || "PUBLIC").toUpperCase()
  if (visibility === "FOLLOWERS") visibility = "PROTECTED"

  const isAuthor = Boolean(
    (userId && p.wqAuthorId === userId) ||
    (reqUser?.id && p.wqAuthorId === reqUser.id) ||
    (reqUser?.username && p.authorUsername === reqUser.username)
  )

  if (isAuthor && !isOrg && reqUser?.name) {
    resolvedDisplayName = reqUser.name
  }

  const resolvedCommentsCount =
    commentCount !== null && commentCount !== undefined ? commentCount : (p.commentsCount || 0)

  return {
    id: pid,
    wqAuthorId: p.wqAuthorId,
    author: {
      id: p.wqAuthorId,
      wqUserId: p.wqAuthorId,
      displayName: resolvedDisplayName,
      username: p.authorUsername || "user",
      avatarUrl: p.authorAvatarUrl || "",
      headline: p.authorHeadline || "Verified Member",
      verificationLevel: p.authorVerificationLevel || "GOLD",
      accountType: p.authorAccountType || "INDIVIDUAL",
      authorType:
        p.authorType ||
        (p.authorAccountType === "COMPANY"
          ? "COMPANY"
          : p.authorAccountType === "VENTURE"
          ? "VENTURE"
          : "USER"),
      role: p.authorRole || "FOUNDER",
      companyId: p.companyId,
      ticker: p.ticker,
      followersCount: memberObj ? (memberObj.followersCount || 0) : (isOrg ? 1240 : 0),
      followingCount: memberObj ? (memberObj.followingCount || 0) : (isOrg ? 85 : 0),
    },
    authorAccountType: p.authorAccountType || "INDIVIDUAL",
    authorType:
      p.authorType ||
      (p.authorAccountType === "COMPANY"
        ? "COMPANY"
        : p.authorAccountType === "VENTURE"
        ? "VENTURE"
        : "USER"),
    companyId: p.companyId,
    ticker: p.ticker,
    content: p.content,
    mediaUrls: p.mediaUrls || [],
    videoUrl: p.videoUrl,
    postType: p.postType || "TEXT",
    visibility,
    communityId: p.communityId,
    communityName: p.communityName,
    hashtags: p.hashtags || [],
    mentions: p.mentions || [],
    likesCount: p.likesCount || 0,
    commentsCount: resolvedCommentsCount,
    sharesCount: p.sharesCount || 0,
    bookmarksCount: p.bookmarksCount || 0,
    isLiked: likedSet.has(pid),
    isBookmarked: bookmarkedSet.has(pid),
    isAuthor,
    recommendationReason: p.recommendationReason || null,
    recommendationScore: p.recommendationScore || null,
    matchedTag: p.matchedTag || null,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }
}

// GET /api/posts - Feed (paginated with search & community filters + visibility enforcement)
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page || "0")
    const size = parseInt(req.query.size || "10")
    const communityId = req.query.communityId
    const tag = req.query.tag
    const search = req.query.query
    const authorId = req.query.authorId
    const userId = req.user?.id

    // ── Build Base Visibility Filter ───────────────────────────────────────────
    let visibilityFilter
    if (!userId) {
      // Unauthenticated users can ONLY see PUBLIC posts
      visibilityFilter = { visibility: "PUBLIC" }
    } else {
      // Authenticated users can see:
      // 1. PUBLIC posts
      // 2. All posts authored by themselves (Public, Protected, or Private)
      // 3. PROTECTED posts:
      //    - If general post (no communityId): visible to authenticated users
      //    - If community post: visible to members of that community or the author
      const userJoinedCommunities = await Community.find({ members: userId }).select("_id").lean()
      const userJoinedCommIds = userJoinedCommunities.map((c) => c._id.toString())

      visibilityFilter = {
        $or: [
          { visibility: "PUBLIC" },
          { wqAuthorId: userId },
          {
            visibility: { $in: ["PROTECTED", "FOLLOWERS"] },
            $or: [
              { communityId: { $in: [null, "", undefined] } },
              { communityId: { $in: userJoinedCommIds } },
            ],
          },
        ],
      }
    }

    const filter = {
      isDeleted: false,
      ...visibilityFilter,
    }

    if (communityId && communityId !== "all") {
      filter.communityId = communityId
    }

    if (authorId) {
      filter.wqAuthorId = authorId
    }

    if (tag && tag !== "All") {
      filter.hashtags = { $in: [new RegExp(`^${tag}$`, "i")] }
    }

    if (search) {
      const searchRegex = { $regex: search, $options: "i" }
      const searchConditions = [
        { content: searchRegex },
        { authorName: searchRegex },
        { authorHeadline: searchRegex },
        { hashtags: searchRegex },
      ]
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: searchConditions }]
        delete filter.$or
      } else {
        filter.$or = searchConditions
      }
    }

    const [posts, totalElements] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(page * size)
        .limit(size)
        .lean(),
      Post.countDocuments(filter),
    ])

    // Check user's likes and bookmarks for these posts
    let likedSet = new Set()
    let bookmarkedSet = new Set()
    if (userId) {
      const postIds = posts.map((p) => p._id.toString())
      const [userLikes, userBookmarks] = await Promise.all([
        Like.find({ wqUserId: userId, targetId: { $in: postIds }, targetType: "POST" }).lean(),
        Bookmark.find({ wqUserId: userId, postId: { $in: postIds } }).lean(),
      ])
      likedSet = new Set(userLikes.map((l) => l.targetId))
      bookmarkedSet = new Set(userBookmarks.map((b) => b.postId.toString()))
    }

    // Query members for author followers count and info
    const authorIds = [...new Set(posts.map((p) => p.wqAuthorId).filter(Boolean))]
    const members = await Member.find({ wqUserId: { $in: authorIds } }).lean()
    const memberMap = new Map(members.map((m) => [m.wqUserId, m]))

    // Query exact comment counts for these posts directly from Comment collection
    const postObjIds = posts.map((p) => p._id)
    const commentCounts = await Comment.aggregate([
      { $match: { postId: { $in: postObjIds }, isDeleted: false } },
      { $group: { _id: "$postId", count: { $sum: 1 } } },
    ])
    const commentCountMap = new Map(commentCounts.map((c) => [c._id.toString(), c.count]))

    const formattedPosts = posts.map((p) =>
      formatPost(
        p,
        userId,
        likedSet,
        bookmarkedSet,
        req.user,
        memberMap.get(p.wqAuthorId),
        commentCountMap.get(p._id.toString()) ?? 0
      )
    )

    res.json({
      success: true,
      message: "Feed retrieved successfully",
      data: {
        content: formattedPosts,
        totalElements,
        totalPages: Math.ceil(totalElements / size) || 1,
        size,
        number: page,
        first: page === 0,
        last: (page + 1) * size >= totalElements,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/posts/suggested - Algorithmic Personalized Feed with Refresh Dynamic Suggestions
router.get("/suggested", async (req, res) => {
  try {
    const page = parseInt(req.query.page || "0")
    const size = parseInt(req.query.size || "15")
    const refreshSeed = req.query.refreshSeed || Date.now().toString()
    const filter = req.query.filter
    const query = req.query.query
    const userId = req.user?.id

    const result = await recommendationService.getSuggestedPosts({
      wqUserId: userId,
      page,
      size,
      refreshSeed,
      filter,
      query,
    })

    const posts = result.posts

    // Check user's likes and bookmarks for these posts
    let likedSet = new Set()
    let bookmarkedSet = new Set()
    if (userId && posts.length > 0) {
      const postIds = posts.map((p) => p._id.toString())
      const [userLikes, userBookmarks] = await Promise.all([
        Like.find({ wqUserId: userId, targetId: { $in: postIds }, targetType: "POST" }).lean(),
        Bookmark.find({ wqUserId: userId, postId: { $in: postIds } }).lean(),
      ])
      likedSet = new Set(userLikes.map((l) => l.targetId))
      bookmarkedSet = new Set(userBookmarks.map((b) => b.postId.toString()))
    }

    // Query members for author followers count and info
    const authorIds = [...new Set(posts.map((p) => p.wqAuthorId).filter(Boolean))]
    const members = await Member.find({ wqUserId: { $in: authorIds } }).lean()
    const memberMap = new Map(members.map((m) => [m.wqUserId, m]))

    // Query exact comment counts
    const postObjIds = posts.map((p) => p._id)
    const commentCounts = await Comment.aggregate([
      { $match: { postId: { $in: postObjIds }, isDeleted: false } },
      { $group: { _id: "$postId", count: { $sum: 1 } } },
    ])
    const commentCountMap = new Map(commentCounts.map((c) => [c._id.toString(), c.count]))

    const formattedPosts = posts.map((p) => {
      const formatted = formatPost(
        p,
        userId,
        likedSet,
        bookmarkedSet,
        req.user,
        memberMap.get(p.wqAuthorId),
        commentCountMap.get(p._id.toString()) ?? 0
      )
      return {
        ...formatted,
        recommendationReason: p.recommendationReason,
        recommendationScore: p.recommendationScore,
        matchedTag: p.matchedTag,
      }
    })

    res.json({
      success: true,
      message: "Personalized suggestions retrieved successfully",
      data: {
        content: formattedPosts,
        totalElements: result.totalElements,
        totalPages: Math.ceil(result.totalElements / size) || 1,
        size,
        number: page,
        first: page === 0,
        last: (page + 1) * size >= result.totalElements,
        refreshSeed: result.refreshSeed,
        topTags: result.topTags,
        topPostTypes: result.topPostTypes,
        hasPersonalization: result.hasPersonalization,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/posts/user/interest-profile - Retrieve user's tracked interest profile & preferred topics
router.get("/user/interest-profile", async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.json({
        success: true,
        data: {
          topTags: [],
          topPostTypes: [],
          totalInteractionsCount: 0,
          isAnonymous: true,
        },
      })
    }

    const profile = await recommendationService.getUserProfile(userId)
    const tagWeights = profile?.tagWeights ? Object.fromEntries(profile.tagWeights) : {}
    const postTypeWeights = profile?.postTypeWeights ? Object.fromEntries(profile.postTypeWeights) : {}

    const sortedTags = Object.entries(tagWeights)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag, score]) => ({ tag, score }))

    const sortedTypes = Object.entries(postTypeWeights)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([type, score]) => ({ type, score }))

    res.json({
      success: true,
      data: {
        topTags: sortedTags,
        topPostTypes: sortedTypes,
        totalInteractionsCount: profile?.totalInteractionsCount || 0,
        lastActiveAt: profile?.lastActiveAt,
        isAnonymous: false,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/posts/activity/batch - Batch view impression tracking
router.post("/activity/batch", async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.json({ success: true, message: "Guest session skipped" })
    }
    const { activities } = req.body
    if (Array.isArray(activities) && activities.length > 0) {
      await recommendationService.recordBatchActivities(userId, activities)
    }
    res.json({ success: true, message: "Activities recorded" })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/posts/:id/activity - Track interaction on a specific post (view, click, share)
router.post("/:id/activity", async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.json({ success: true, message: "Guest activity recorded" })
    }
    const postId = req.params.id
    const { activityType, postType, hashtags, authorId, authorAccountType, communityId } = req.body

    const post = await Post.findById(postId).lean()
    await recommendationService.recordActivity({
      wqUserId: userId,
      activityType: activityType || "CLICK",
      postId,
      postType: postType || post?.postType || "TEXT",
      hashtags: hashtags || post?.hashtags || [],
      authorId: authorId || post?.wqAuthorId,
      authorAccountType: authorAccountType || post?.authorAccountType || "INDIVIDUAL",
      communityId: communityId || post?.communityId,
    })

    res.json({ success: true, message: "Activity logged" })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/posts/:id - Single Post (with strict visibility authorization)
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, isDeleted: false }).lean()
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" })
    }

    const userId = req.user?.id
    const isAuthor = Boolean(userId && post.wqAuthorId === userId)
    let visibility = (post.visibility || "PUBLIC").toUpperCase()
    if (visibility === "FOLLOWERS") visibility = "PROTECTED"

    // ── Enforce Visibility Policy ─────────────────────────────────────────────
    if (visibility === "PRIVATE") {
      if (!isAuthor) {
        return res.status(403).json({
          success: false,
          message: "Access denied. This post is private to its author.",
        })
      }
    } else if (visibility === "PROTECTED") {
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required to view this protected post.",
        })
      }
      if (post.communityId) {
        const isMember = await Community.exists({ _id: post.communityId, members: userId })
        if (!isMember && !isAuthor) {
          return res.status(403).json({
            success: false,
            message: "Access denied. You must be a member of this community to view this protected post.",
          })
        }
      }
    }

    let isLiked = false
    let isBookmarked = false
    if (userId) {
      const [existingLike, existingBookmark] = await Promise.all([
        Like.findOne({ wqUserId: userId, targetId: post._id.toString(), targetType: "POST" }),
        Bookmark.findOne({ wqUserId: userId, postId: post._id.toString() }),
      ])
      isLiked = Boolean(existingLike)
      isBookmarked = Boolean(existingBookmark)
    }

    const likedSet = isLiked ? new Set([post._id.toString()]) : new Set()
    const bookmarkedSet = isBookmarked ? new Set([post._id.toString()]) : new Set()

    const memberObj = await Member.findOne({ wqUserId: post.wqAuthorId }).lean()
    const actualCommentCount = await Comment.countDocuments({ postId: post._id, isDeleted: false })

    res.json({
      success: true,
      message: "Post retrieved",
      data: formatPost(post, userId, likedSet, bookmarkedSet, req.user, memberObj, actualCommentCount),
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/posts - Create Post (Strict Authentication & Author Binding)
router.post("/", requireAuth, async (req, res) => {
  try {
    const {
      content,
      mediaUrls,
      videoUrl,
      postType,
      visibility: rawVisibility,
      communityId,
      companyId,
      ticker,
    } = req.body

    // Author ID MUST be strictly bound to authenticated user from backend context
    const user = req.user
    const wqAuthorId = user.id

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: "Post content is required." })
    }

    // Validate visibility setting: PUBLIC, PROTECTED, PRIVATE
    let visibility = (rawVisibility || "PUBLIC").toUpperCase().trim()
    if (visibility === "FOLLOWERS") visibility = "PROTECTED"
    if (!["PUBLIC", "PROTECTED", "PRIVATE"].includes(visibility)) {
      return res.status(400).json({
        success: false,
        message: "Invalid visibility option. Must be 'PUBLIC', 'PROTECTED', or 'PRIVATE'.",
      })
    }

    // Resolve community name if associated with a community
    let resolvedCommunityName = null
    let validCommunityId = null
    if (communityId && communityId !== "all") {
      const comm = await Community.findById(communityId).lean()
      if (comm) {
        validCommunityId = comm._id.toString()
        resolvedCommunityName = comm.name
      }
    }

    // Extract hashtags from content (e.g. #AI, #CleanTech)
    const extractedHashtags = (content.match(/#[a-zA-Z0-9_]+/g) || []).map((t) => t.replace("#", ""))

    const post = new Post({
      wqAuthorId,
      authorName: user.name,
      authorUsername: user.username,
      authorAvatarUrl: user.avatarUrl || "",
      authorHeadline: user.headline,
      authorRole: user.role || "FOUNDER",
      authorVerificationLevel: user.verificationLevel || "NONE",
      authorAccountType: user.accountType || "INDIVIDUAL",
      authorType: user.accountType === "COMPANY" ? "COMPANY" : user.accountType === "VENTURE" ? "VENTURE" : "USER",
      companyId: companyId || null,
      ticker: ticker || null,
      content: content.trim(),
      mediaUrls: mediaUrls || [],
      videoUrl: videoUrl || null,
      postType: ["TEXT", "IMAGE", "VIDEO", "POLL", "LINK", "POST", "UPDATE"].includes((postType || "").toUpperCase())
        ? (postType || "").toUpperCase()
        : (mediaUrls && mediaUrls.length > 0 ? "IMAGE" : "TEXT"),
      visibility,
      communityId: validCommunityId,
      communityName: resolvedCommunityName,
      hashtags: extractedHashtags,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      bookmarksCount: 0,
    })

    await post.save()

    // Increment postCount in community if applicable
    if (validCommunityId) {
      await Community.findByIdAndUpdate(validCommunityId, { $inc: { postCount: 1 } })
    }

    res.status(201).json({
      success: true,
      message: "Post published successfully",
      data: formatPost(post, wqAuthorId),
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// PUT /api/posts/:id - Edit Post (Author Only, Author ID Unchanged)
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, isDeleted: false })
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" })
    }

    // Verify ownership
    if (post.wqAuthorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Forbidden. You are not authorized to edit another user's post.",
      })
    }

    const { content, mediaUrls, visibility: rawVisibility, postType } = req.body

    if (content !== undefined) {
      if (!content.trim()) {
        return res.status(400).json({ success: false, message: "Post content cannot be empty." })
      }
      post.content = content.trim()
      post.hashtags = (post.content.match(/#[a-zA-Z0-9_]+/g) || []).map((t) => t.replace("#", ""))
    }

    if (rawVisibility !== undefined) {
      let visibility = rawVisibility.toUpperCase().trim()
      if (visibility === "FOLLOWERS") visibility = "PROTECTED"
      if (!["PUBLIC", "PROTECTED", "PRIVATE"].includes(visibility)) {
        return res.status(400).json({
          success: false,
          message: "Invalid visibility. Must be 'PUBLIC', 'PROTECTED', or 'PRIVATE'.",
        })
      }
      post.visibility = visibility
    }

    if (mediaUrls !== undefined) {
      post.mediaUrls = mediaUrls
    }

    if (postType !== undefined) {
      post.postType = postType
    }

    // Crucial: wqAuthorId, authorName, authorUsername remain unchanged
    await post.save()

    res.json({
      success: true,
      message: "Post updated successfully",
      data: formatPost(post, req.user.id),
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// DELETE /api/posts/:id - Delete Post (Author Only)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, isDeleted: false })
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" })
    }

    // Verify ownership
    if (post.wqAuthorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Forbidden. You are not authorized to delete another user's post.",
      })
    }

    post.isDeleted = true
    await post.save()

    // Decrement postCount in community if applicable
    if (post.communityId) {
      await Community.findByIdAndUpdate(post.communityId, { $inc: { postCount: -1 } })
    }

    res.json({
      success: true,
      message: "Post deleted successfully",
      data: { id: post._id.toString() },
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/posts/:id/like - Persistent Like
router.post("/:id/like", requireAuth, async (req, res) => {
  try {
    const postId = req.params.id
    const wqUserId = req.user.id

    const existingLike = await Like.findOne({ wqUserId, targetId: postId, targetType: "POST" })
    if (existingLike) {
      return res.json({ success: true, message: "Post already liked", data: null })
    }

    await Like.create({ wqUserId, targetId: postId, targetType: "POST" })
    await Post.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } })

    // Create notification for post author & track user interest
    const post = await Post.findById(postId).lean()
    if (post) {
      recommendationService
        .recordActivity({
          wqUserId,
          activityType: "LIKE",
          postId,
          postType: post.postType,
          hashtags: post.hashtags,
          authorId: post.wqAuthorId,
          authorAccountType: post.authorAccountType,
          communityId: post.communityId,
        })
        .catch(() => {})

      if (post.wqAuthorId !== wqUserId) {
        await Notification.create({
          wqUserId: post.wqAuthorId,
          type: "LIKE",
          actorName: req.user.name,
          actorHeadline: req.user.headline,
          actorRole: req.user.role,
          message: `liked your post '${post.content.slice(0, 45)}...'.`,
          targetId: postId,
          targetType: "POST",
        })
      }
    }

    res.json({ success: true, message: "Post liked", data: null, timestamp: new Date().toISOString() })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// DELETE /api/posts/:id/like - Persistent Unlike
router.delete("/:id/like", requireAuth, async (req, res) => {
  try {
    const postId = req.params.id
    const wqUserId = req.user.id

    const deleted = await Like.findOneAndDelete({ wqUserId, targetId: postId, targetType: "POST" })
    if (deleted) {
      await Post.findByIdAndUpdate(postId, { $inc: { likesCount: -1 } })
    }

    res.json({ success: true, message: "Post unliked", data: null, timestamp: new Date().toISOString() })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/posts/:id/bookmark - Bookmark Post
router.post("/:id/bookmark", requireAuth, async (req, res) => {
  try {
    const postId = req.params.id
    const wqUserId = req.user.id

    const existing = await Bookmark.findOne({ wqUserId, postId })
    if (existing) {
      return res.json({ success: true, message: "Post already bookmarked", data: null })
    }

    await Bookmark.create({ wqUserId, postId })
    await Post.findByIdAndUpdate(postId, { $inc: { bookmarksCount: 1 } })

    const post = await Post.findById(postId).lean()
    if (post) {
      recommendationService
        .recordActivity({
          wqUserId,
          activityType: "BOOKMARK",
          postId,
          postType: post.postType,
          hashtags: post.hashtags,
          authorId: post.wqAuthorId,
          authorAccountType: post.authorAccountType,
          communityId: post.communityId,
        })
        .catch(() => {})
    }

    res.json({ success: true, message: "Post bookmarked", data: null, timestamp: new Date().toISOString() })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// DELETE /api/posts/:id/bookmark - Remove Bookmark
router.delete("/:id/bookmark", requireAuth, async (req, res) => {
  try {
    const postId = req.params.id
    const wqUserId = req.user.id

    const deleted = await Bookmark.findOneAndDelete({ wqUserId, postId })
    if (deleted) {
      await Post.findByIdAndUpdate(postId, { $inc: { bookmarksCount: -1 } })
    }

    res.json({ success: true, message: "Post unbookmarked", data: null, timestamp: new Date().toISOString() })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/posts/:id/comments - Comments for Post
router.get("/:id/comments", async (req, res) => {
  try {
    const postId = req.params.id
    const comments = await Comment.find({ postId, isDeleted: false })
      .sort({ createdAt: 1 })
      .lean()

    const formatted = comments.map((c) => ({
      id: c._id.toString(),
      postId: c.postId.toString(),
      wqAuthorId: c.wqAuthorId,
      authorName: c.authorName,
      authorAvatarUrl: c.authorAvatarUrl || "",
      content: c.content,
      likesCount: c.likesCount || 0,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }))

    res.json({
      success: true,
      message: "Comments retrieved",
      data: formatted,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/posts/:id/comments - Add Comment
router.post("/:id/comments", requireAuth, async (req, res) => {
  try {
    const postId = req.params.id
    const { content } = req.body
    const wqAuthorId = req.user.id
    const authorName = req.user.name

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: "Comment content is required" })
    }

    const comment = new Comment({
      postId,
      wqAuthorId,
      authorName,
      authorAvatarUrl: req.user.avatarUrl || "",
      content: content.trim(),
    })

    await comment.save()
    const actualCommentsCount = await Comment.countDocuments({ postId, isDeleted: false })
    await Post.findByIdAndUpdate(postId, { $set: { commentsCount: actualCommentsCount } })

    // Create notification for post author & record user interest activity
    const post = await Post.findById(postId).lean()
    if (post) {
      recommendationService
        .recordActivity({
          wqUserId,
          activityType: "COMMENT",
          postId,
          postType: post.postType,
          hashtags: post.hashtags,
          authorId: post.wqAuthorId,
          authorAccountType: post.authorAccountType,
          communityId: post.communityId,
        })
        .catch(() => {})

      if (post.wqAuthorId !== wqAuthorId) {
        await Notification.create({
          wqUserId: post.wqAuthorId,
          type: "COMMENT",
          actorName: authorName,
          actorHeadline: req.user.headline,
          actorRole: req.user.role,
          message: `commented on your post: '${content.slice(0, 45)}...'.`,
          targetId: postId,
          targetType: "POST",
        })
      }
    }

    res.status(201).json({
      success: true,
      message: "Comment added",
      data: {
        id: comment._id.toString(),
        postId: comment.postId.toString(),
        wqAuthorId: comment.wqAuthorId,
        authorName: comment.authorName,
        authorAvatarUrl: comment.authorAvatarUrl || "",
        content: comment.content,
        likesCount: comment.likesCount,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// DELETE /api/posts/:postId/comments/:commentId - Delete Comment
router.delete("/:postId/comments/:commentId", requireAuth, async (req, res) => {
  try {
    const { postId, commentId } = req.params
    const comment = await Comment.findOne({ _id: commentId, postId, isDeleted: false })
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" })
    }

    const post = await Post.findById(postId).lean()
    if (comment.wqAuthorId !== req.user.id && post?.wqAuthorId !== req.user.id) {
      return res.status(403).json({ success: false, message: "Forbidden. Not authorized to delete this comment." })
    }

    comment.isDeleted = true
    await comment.save()

    const actualCount = await Comment.countDocuments({ postId, isDeleted: false })
    await Post.findByIdAndUpdate(postId, { $set: { commentsCount: actualCount } })

    res.json({
      success: true,
      message: "Comment deleted",
      data: { id: commentId, commentsCount: actualCount },
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router
