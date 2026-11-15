import { connectDB } from "./config/database.mjs"
import { Comment } from "./models/Comment.mjs"
import { Post } from "./models/Post.mjs"

export async function syncCommentCounts() {
  await connectDB()

  // 1. Reset all posts commentsCount to 0
  await Post.updateMany({}, { $set: { commentsCount: 0 } })

  // 2. Aggregate actual non-deleted comments by postId
  const counts = await Comment.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: "$postId", count: { $sum: 1 } } },
  ])

  // 3. Set exact count for each post that has comments
  for (const item of counts) {
    if (item._id) {
      await Post.findByIdAndUpdate(item._id, { $set: { commentsCount: item.count } })
    }
  }
}

if (process.argv[1]?.endsWith("sync_comment_counts.mjs")) {
  syncCommentCounts().then(() => process.exit(0))
}
