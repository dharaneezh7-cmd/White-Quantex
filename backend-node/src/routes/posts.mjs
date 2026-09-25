import { Router } from "express"
import { Post } from "../models/Post.mjs"
import { Comment } from "../models/Comment.mjs"
import { Like } from "../models/Like.mjs"
import { Bookmark } from "../models/Bookmark.mjs"
import { Notification } from "../models/Notification.mjs"

const router = Router()

// GET /api/posts - Feed (paginated with search & community filters)
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page || "0")
    const size = parseInt(req.query.size || "10")
    const communityId = req.query.communityId
    const tag = req.query.tag
    const search = req.query.query
    const wqUserId = req.headers["x-wq-user-id"] || "wq-uuid-demo-author"

    const filter = { isDeleted: false }

    if (communityId && communityId !== "all") {
      filter.communityId = communityId
    }

    if (tag && tag !== "All") {
      filter.hashtags = { $in: [new RegExp(`^${tag}$`, "i")] }
    }

    if (search) {
      filter.$or = [
        { content: { $regex: search, $options: "i" } },
        { authorName: { $regex: search, $options: "i" } },
        { authorHeadline: { $regex: search, $options: "i" } },
        { hashtags: { $regex: search, $options: "i" } },
      ]
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
    const postIds = posts.map((p) => p._id.toString())
    const [userLikes, userBookmarks] = await Promise.all([
      Like.find({ wqUserId, targetId: { $in: postIds }, targetType: "POST" }).lean(),
      Bookmark.find({ wqUserId, postId: { $in: postIds } }).lean(),
    ])

    const likedSet = new Set(userLikes.map((l) => l.targetId))
    const bookmarkedSet = new Set(userBookmarks.map((b) => b.postId.toString()))

    const formattedPosts = posts.map((p) => {
      const pid = p._id.toString()
      return {
        id: pid,
        wqAuthorId: p.wqAuthorId,
        author: {
          wqUserId: p.wqAuthorId,
          displayName: p.authorName,
          username: p.authorUsername || "user",
          avatarUrl: p.authorAvatarUrl || "",
          headline: p.authorHeadline || "Verified Member",
          verificationLevel: p.authorVerificationLevel || "GOLD",
        },
        content: p.content,
        mediaUrls: p.mediaUrls || [],
        videoUrl: p.videoUrl,
        postType: p.postType || "TEXT",
        visibility: p.visibility || "PUBLIC",
        communityId: p.communityId,
        hashtags: p.hashtags || [],
        mentions: p.mentions || [],
        likesCount: p.likesCount || 0,
        commentsCount: p.commentsCount || 0,
        sharesCount: p.sharesCount || 0,
        bookmarksCount: p.bookmarksCount || 0,
        isLiked: likedSet.has(pid),
        isBookmarked: bookmarkedSet.has(pid),
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }
    })

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

// GET /api/posts/:id - Single Post
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, isDeleted: false }).lean()
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" })
    }

    const wqUserId = req.headers["x-wq-user-id"] || "wq-uuid-demo-author"
    const [existingLike, existingBookmark] = await Promise.all([
      Like.findOne({ wqUserId, targetId: post._id.toString(), targetType: "POST" }),
      Bookmark.findOne({ wqUserId, postId: post._id.toString() }),
    ])

    const formatted = {
      id: post._id.toString(),
      wqAuthorId: post.wqAuthorId,
      author: {
        wqUserId: post.wqAuthorId,
        displayName: post.authorName,
        username: post.authorUsername || "user",
        avatarUrl: post.authorAvatarUrl || "",
        headline: post.authorHeadline || "Verified Member",
        verificationLevel: post.authorVerificationLevel || "GOLD",
      },
      content: post.content,
      mediaUrls: post.mediaUrls || [],
      videoUrl: post.videoUrl,
      postType: post.postType || "TEXT",
      visibility: post.visibility || "PUBLIC",
      communityId: post.communityId,
      hashtags: post.hashtags || [],
      mentions: post.mentions || [],
      likesCount: post.likesCount || 0,
      commentsCount: post.commentsCount || 0,
      sharesCount: post.sharesCount || 0,
      bookmarksCount: post.bookmarksCount || 0,
      isLiked: !!existingLike,
      isBookmarked: !!existingBookmark,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    }

    res.json({
      success: true,
      message: "Post retrieved",
      data: formatted,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/posts - Create Post
router.post("/", async (req, res) => {
  try {
    const { content, mediaUrls, videoUrl, postType, visibility, communityId } = req.body
    const wqAuthorId = req.headers["x-wq-user-id"] || "wq-uuid-demo-author"
    const authorName = req.headers["x-wq-user-name"] || "Alexander Vance"
    const authorUsername = req.headers["x-wq-user-username"] || "alexvance"
    const authorHeadline = req.headers["x-wq-user-headline"] || "Managing Partner · Quantex Sovereign Capital"

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: "Post content is required." })
    }

    // Extract hashtags from content (e.g. #AI, #CleanTech)
    const extractedHashtags = (content.match(/#[a-zA-Z0-9_]+/g) || []).map((t) => t.replace("#", ""))

    const post = new Post({
      wqAuthorId,
      authorName,
      authorUsername,
      authorHeadline,
      authorRole: "INVESTOR",
      authorVerificationLevel: "PLATINUM",
      content: content.trim(),
      mediaUrls: mediaUrls || [],
      videoUrl,
      postType: postType || (mediaUrls && mediaUrls.length > 0 ? "IMAGE" : "TEXT"),
      visibility: visibility || "PUBLIC",
      communityId: communityId || null,
      hashtags: extractedHashtags,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      bookmarksCount: 0,
    })

    await post.save()

    const formatted = {
      id: post._id.toString(),
      wqAuthorId: post.wqAuthorId,
      author: {
        wqUserId: post.wqAuthorId,
        displayName: post.authorName,
        username: post.authorUsername,
        avatarUrl: post.authorAvatarUrl || "",
        headline: post.authorHeadline,
        verificationLevel: post.authorVerificationLevel,
      },
      content: post.content,
      mediaUrls: post.mediaUrls,
      videoUrl: post.videoUrl,
      postType: post.postType,
      visibility: post.visibility,
      communityId: post.communityId,
      hashtags: post.hashtags,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      bookmarksCount: 0,
      isLiked: false,
      isBookmarked: false,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    }

    res.status(201).json({
      success: true,
      message: "Post published successfully",
      data: formatted,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/posts/:id/like - Persistent Like
router.post("/:id/like", async (req, res) => {
  try {
    const postId = req.params.id
    const wqUserId = req.headers["x-wq-user-id"] || "wq-uuid-demo-author"

    const existingLike = await Like.findOne({ wqUserId, targetId: postId, targetType: "POST" })
    if (existingLike) {
      return res.json({ success: true, message: "Post already liked", data: null })
    }

    await Like.create({ wqUserId, targetId: postId, targetType: "POST" })
    await Post.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } })

    // Create notification for post author
    const post = await Post.findById(postId).lean()
    if (post && post.wqAuthorId !== wqUserId) {
      await Notification.create({
        wqUserId: post.wqAuthorId,
        type: "LIKE",
        actorName: "Alexander Vance",
        actorHeadline: "Managing Partner · Quantex Sovereign Capital",
        actorRole: "INVESTOR",
        message: `liked your post '${post.content.slice(0, 45)}...'.`,
        targetId: postId,
        targetType: "POST",
      })
    }

    res.json({ success: true, message: "Post liked", data: null, timestamp: new Date().toISOString() })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// DELETE /api/posts/:id/like - Persistent Unlike
router.delete("/:id/like", async (req, res) => {
  try {
    const postId = req.params.id
    const wqUserId = req.headers["x-wq-user-id"] || "wq-uuid-demo-author"

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
router.post("/:id/bookmark", async (req, res) => {
  try {
    const postId = req.params.id
    const wqUserId = req.headers["x-wq-user-id"] || "wq-uuid-demo-author"

    const existing = await Bookmark.findOne({ wqUserId, postId })
    if (existing) {
      return res.json({ success: true, message: "Post already bookmarked", data: null })
    }

    await Bookmark.create({ wqUserId, postId })
    await Post.findByIdAndUpdate(postId, { $inc: { bookmarksCount: 1 } })

    res.json({ success: true, message: "Post bookmarked", data: null, timestamp: new Date().toISOString() })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// DELETE /api/posts/:id/bookmark - Remove Bookmark
router.delete("/:id/bookmark", async (req, res) => {
  try {
    const postId = req.params.id
    const wqUserId = req.headers["x-wq-user-id"] || "wq-uuid-demo-author"

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
router.post("/:id/comments", async (req, res) => {
  try {
    const postId = req.params.id
    const { content } = req.body
    const wqAuthorId = req.headers["x-wq-user-id"] || "wq-uuid-demo-author"
    const authorName = req.headers["x-wq-user-name"] || "Alexander Vance"

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: "Comment content is required" })
    }

    const comment = new Comment({
      postId,
      wqAuthorId,
      authorName,
      content: content.trim(),
    })

    await comment.save()
    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } })

    // Create notification for post author
    const post = await Post.findById(postId).lean()
    if (post && post.wqAuthorId !== wqAuthorId) {
      await Notification.create({
        wqUserId: post.wqAuthorId,
        type: "COMMENT",
        actorName: authorName,
        actorHeadline: "Managing Partner · Quantex Sovereign Capital",
        actorRole: "INVESTOR",
        message: `commented on your post: '${content.slice(0, 45)}...'.`,
        targetId: postId,
        targetType: "POST",
      })
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

export default router
