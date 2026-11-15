import mongoose from "mongoose"

const messageSchema = new mongoose.Schema(
  {
    conversationId: { type: String, required: true, index: true },
    senderWqUserId: { type: String, required: true, index: true },
    recipientWqUserId: { type: String, required: true, index: true },
    
    // Cryptographic Fields
    ciphertext: { type: String, required: true },
    iv: { type: String, required: true },
    authTag: { type: String, required: true },
    algorithm: { type: String, default: "AES-256-GCM" },
    keyFingerprint: { type: String, default: "" },
    
    // Plaintext content (decrypted in transit for authorized caller)
    content: { type: String, default: "" },

    contentType: {
      type: String,
      enum: ["TEXT", "CODE", "DOCUMENT", "IMAGE", "SYSTEM"],
      default: "TEXT",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    reactions: [
      {
        emoji: { type: String },
        userWqUserId: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    deliveryStatus: {
      type: String,
      enum: ["SENT", "DELIVERED", "READ"],
      default: "SENT",
    },
    deliveredAt: { type: Date },
    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
    deletedForUsers: {
      type: [String],
      default: [],
    },
    idempotencyKey: {
      type: String,
      index: true,
      sparse: true,
    },
    replyTo: {
      messageId: { type: String },
      senderWqUserId: { type: String },
      preview: { type: String },
    },
    attachments: [
      {
        url: { type: String },
        name: { type: String },
        size: { type: Number },
        mimeType: { type: String },
      },
    ],
  },
  { timestamps: true }
)

// Compound indexes for optimal retrieval, cursor pagination, and sync
messageSchema.index({ conversationId: 1, createdAt: 1 })
messageSchema.index({ conversationId: 1, createdAt: -1 })
messageSchema.index({ conversationId: 1, updatedAt: -1 })
messageSchema.index({ recipientWqUserId: 1, isRead: 1 })
messageSchema.index({ idempotencyKey: 1, senderWqUserId: 1 })

export const Message = mongoose.model("Message", messageSchema)
