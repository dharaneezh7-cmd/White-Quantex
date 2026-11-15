import mongoose from "mongoose"

const postSchema = new mongoose.Schema(
  {
    wqAuthorId: { type: String, required: true, index: true }, // Authenticated WQ User ID
    authorName: { type: String, required: true },
    authorUsername: { type: String, default: "user" },
    authorAvatarUrl: { type: String, default: "" },
    authorHeadline: { type: String, default: "Ecosystem Member" },
    authorRole: { type: String, default: "FOUNDER" },
    authorVerificationLevel: { type: String, default: "NONE" },
    authorAccountType: { type: String, default: "INDIVIDUAL" },
    authorType: { type: String, default: "USER" },
    companyId: { type: String },
    ticker: { type: String },
    content: { type: String, required: true, maxlength: 5000 },
    mediaUrls: [{ type: String }],
    videoUrl: { type: String },
    postType: { type: String, enum: ["TEXT", "IMAGE", "VIDEO", "POLL", "LINK", "POST", "UPDATE"], default: "TEXT" },
    visibility: {
      type: String,
      enum: ["PUBLIC", "PROTECTED", "PRIVATE", "FOLLOWERS"],
      default: "PUBLIC",
      uppercase: true,
      index: true,
    },
    communityId: { type: String, index: true },
    communityName: { type: String },
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
postSchema.index({ communityId: 1, createdAt: -1 })
postSchema.index({ wqAuthorId: 1, createdAt: -1 })
postSchema.index({ visibility: 1, createdAt: -1 })

export const Post = mongoose.model("Post", postSchema)
