import mongoose from "mongoose"

const postSchema = new mongoose.Schema(
  {
    wqAuthorId: { type: String, required: true, index: true }, // Canonical WQ User UUID
    authorName: { type: String, required: true },
    authorUsername: { type: String },
    authorAvatarUrl: { type: String },
    authorHeadline: { type: String },
    content: { type: String, required: true, maxlength: 5000 },
    mediaUrls: [{ type: String }],
    videoUrl: { type: String },
    postType: { type: String, enum: ["TEXT", "IMAGE", "VIDEO", "POLL"], default: "TEXT" },
    visibility: { type: String, enum: ["PUBLIC", "FOLLOWERS", "PRIVATE"], default: "PUBLIC" },
    communityId: { type: String, index: true },
    hashtags: [{ type: String, index: true }],
    mentions: [{ type: String }],
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    sharesCount: { type: Number, default: 0 },
    bookmarksCount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
)

postSchema.index({ createdAt: -1 })

export const Post = mongoose.model("Post", postSchema)
