import mongoose from "mongoose"

const messageSchema = new mongoose.Schema(
  {
    conversationId: { type: String, required: true, index: true },
    senderWqUserId: { type: String, required: true, index: true },
    recipientWqUserId: { type: String, required: true, index: true },
    content: { type: String, required: true, maxlength: 2000 },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  { timestamps: true }
)

export const Message = mongoose.model("Message", messageSchema)
