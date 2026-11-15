import mongoose from "mongoose"

const userActivitySchema = new mongoose.Schema(
  {
    wqUserId: { type: String, required: true, index: true },
    activityType: {
      type: String,
      enum: ["VIEW", "CLICK", "LIKE", "COMMENT", "BOOKMARK", "SHARE", "POST_CREATE", "PROFILE_VIEW"],
      required: true,
      index: true,
    },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", index: true },
    postType: { type: String, default: "TEXT" }, // TEXT, IMAGE, VIDEO, UPDATE, POLL
    hashtags: [{ type: String }],
    authorId: { type: String, index: true },
    authorAccountType: { type: String, default: "INDIVIDUAL" }, // INDIVIDUAL, COMPANY, VENTURE
    communityId: { type: String },
    weight: { type: Number, default: 1 },
    metadata: { type: mongoose.Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
)

userActivitySchema.index({ wqUserId: 1, timestamp: -1 })
userActivitySchema.index({ wqUserId: 1, postId: 1 })
userActivitySchema.index({ wqUserId: 1, activityType: 1, timestamp: -1 })

export const UserActivity = mongoose.model("UserActivity", userActivitySchema)
