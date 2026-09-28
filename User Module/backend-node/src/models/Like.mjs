import mongoose from "mongoose"

const likeSchema = new mongoose.Schema(
  {
    wqUserId: { type: String, required: true, index: true },
    targetId: { type: String, required: true, index: true },
    targetType: { type: String, enum: ["POST", "COMMENT"], default: "POST" },
  },
  { timestamps: true }
)

likeSchema.index({ wqUserId: 1, targetId: 1, targetType: 1 }, { unique: true })

export const Like = mongoose.model("Like", likeSchema)
