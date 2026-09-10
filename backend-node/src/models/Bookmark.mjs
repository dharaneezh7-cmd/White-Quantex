import mongoose from "mongoose"

const bookmarkSchema = new mongoose.Schema(
  {
    wqUserId: { type: String, required: true, index: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true, index: true },
  },
  { timestamps: true }
)

bookmarkSchema.index({ wqUserId: 1, postId: 1 }, { unique: true })

export const Bookmark = mongoose.model("Bookmark", bookmarkSchema)
