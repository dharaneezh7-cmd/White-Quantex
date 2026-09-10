import mongoose from "mongoose"

const commentSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true, index: true },
    wqAuthorId: { type: String, required: true, index: true },
    authorName: { type: String, required: true },
    authorAvatarUrl: { type: String },
    content: { type: String, required: true, maxlength: 1000 },
    likesCount: { type: Number, default: 0 },
    parentCommentId: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
)

export const Comment = mongoose.model("Comment", commentSchema)
