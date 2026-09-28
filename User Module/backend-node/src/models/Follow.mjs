import mongoose from "mongoose"

const followSchema = new mongoose.Schema(
  {
    followerWqUserId: { type: String, required: true, index: true },
    followingWqUserId: { type: String, required: true, index: true },
  },
  { timestamps: true }
)

followSchema.index({ followerWqUserId: 1, followingWqUserId: 1 }, { unique: true })

export const Follow = mongoose.model("Follow", followSchema)
