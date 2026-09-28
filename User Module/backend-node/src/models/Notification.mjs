import mongoose from "mongoose"

const notificationSchema = new mongoose.Schema(
  {
    wqUserId: { type: String, required: true, index: true }, // Recipient user
    type: {
      type: String,
      enum: ["LIKE", "COMMENT", "FOLLOW", "VENTURE", "VERIFICATION", "SYSTEM"],
      required: true,
      index: true,
    },
    actorName: { type: String, required: true },
    actorAvatarUrl: { type: String, default: "" },
    actorHeadline: { type: String },
    actorRole: { type: String },
    message: { type: String, required: true },
    targetId: { type: String }, // Post ID or Venture ID
    targetType: { type: String, default: "POST" },
    isRead: { type: Boolean, default: false, index: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

notificationSchema.index({ wqUserId: 1, createdAt: -1 })

export const Notification = mongoose.model("Notification", notificationSchema)
