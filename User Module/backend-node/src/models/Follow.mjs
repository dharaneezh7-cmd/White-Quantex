import mongoose from "mongoose"

const followSchema = new mongoose.Schema(
  {
    followerWqUserId: { type: String, required: true, index: true },
    followingWqUserId: { type: String, required: true, index: true },
    hasPrivateAccess: { type: Boolean, default: false },
  },
  { timestamps: true }
)

followSchema.index({ followerWqUserId: 1, followingWqUserId: 1 }, { unique: true })
followSchema.index({ followingWqUserId: 1, hasPrivateAccess: 1 })

export const Follow = mongoose.model("Follow", followSchema)
