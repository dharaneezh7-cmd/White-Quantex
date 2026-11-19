import mongoose from "mongoose"

const communityMessageSchema = new mongoose.Schema(
  {
    communityId: { type: String, required: true, index: true },
    senderWqUserId: { type: String, required: true, index: true },
    senderName: { type: String, required: true },
    senderUsername: { type: String, default: "" },
    senderAvatarUrl: { type: String, default: "" },
    content: { type: String, required: true },
    mediaUrl: { type: String, default: "" },
    reactions: [
      {
        emoji: { type: String, required: true },
        wqUserId: { type: String, required: true },
        username: { type: String, default: "" },
      },
    ],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
)

communityMessageSchema.index({ communityId: 1, createdAt: 1 })

export const CommunityMessage = mongoose.model("CommunityMessage", communityMessageSchema)
