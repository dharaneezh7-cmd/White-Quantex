import { Router } from "express"
import { Post } from "../models/Post.mjs"
import { Comment } from "../models/Comment.mjs"
import { Like } from "../models/Like.mjs"
import { Bookmark } from "../models/Bookmark.mjs"

const router = Router()

// GET /api/posts - Feed (paginated)
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page || "0")
    const size = parseInt(req.query.size || "10")

    const posts = await Post.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .skip(page * size)
      .limit(size)
      .lean()

    const totalElements = await Post.countDocuments({ isDeleted: false })

    const formattedPosts = posts.map((p) => ({
      id: p._id.toString(),
      wqAuthorId: p.wqAuthorId,
      author: {
        wqUserId: p.wqAuthorId,
        displayName: p.authorName,
        username: p.authorUsername || "user",
        avatarUrl: p.authorAvatarUrl || "",
        headline: p.authorHeadline || "Verified Member",
        verificationLevel: "GOLD",
      },
      content: p.content,
      mediaUrls: p.mediaUrls || [],
      videoUrl: p.videoUrl,
      postType: p.postType,
      visibility: p.visibility,
      communityId: p.communityId,
      hashtags: p.hashtags || [],
      mentions: p.mentions || [],
      likesCount: p.likesCount,
      commentsCount: p.commentsCount,
      sharesCount: p.sharesCount,
      bookmarksCount: p.bookmarksCount,
      isLiked: false,
      isBookmarked: false,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }))

    res.json({
      success: true,
      message: "Feed retrieved successfully",
      data: {
        content: formattedPosts,
        totalElements,
        totalPages: Math.ceil(totalElements / size),
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

// POST /api/posts - Create Post
router.post("/", async (req, res) => {
  try {
    const { content, mediaUrls, videoUrl, postType, visibility, communityId } = req.body
    const wqAuthorId = req.headers["x-wq-user-id"] || "wq-uuid-demo-author"

    if (!content) {
      return res.status(400).json({ success: false, message: "Post content is required." })
    }

    const post = new Post({
      wqAuthorId,
      authorName: "Alexander Vance",
      authorUsername: "alexvance",
      authorHeadline: "Founder @ Quantum Systems",
      content,
      mediaUrls,
      videoUrl,
      postType: postType || "TEXT",
      visibility: visibility || "PUBLIC",
      communityId,
    })

    await post.save()

    res.status(201).json({
      success: true,
      message: "Post published successfully",
      data: {
        id: post._id.toString(),
        wqAuthorId: post.wqAuthorId,
        author: {
          wqUserId: post.wqAuthorId,
          displayName: post.authorName,
          username: post.authorUsername,
          avatarUrl: "",
          headline: post.authorHeadline,
          verificationLevel: "GOLD",
        },
        content: post.content,
        mediaUrls: post.mediaUrls,
        videoUrl: post.videoUrl,
        postType: post.postType,
        visibility: post.visibility,
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        bookmarksCount: 0,
        isLiked: false,
        isBookmarked: false,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      },
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
      return res.status(409).json({ success: false, message: "Post already liked." })
    }

    await Like.create({ wqUserId, targetId: postId, targetType: "POST" })
    await Post.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } })

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
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Like record not found." })
    }

    await Post.findByIdAndUpdate(postId, { $inc: { likesCount: -1 } })

    res.json({ success: true, message: "Post unliked", data: null, timestamp: new Date().toISOString() })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router
