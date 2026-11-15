import mongoose from "mongoose"

const conversationSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    participants: {
      type: [String],
      required: true,
      index: true,
    },
    participantUsernames: {
      type: [String],
      default: [],
    },
    lastMessage: {
      senderWqUserId: { type: String },
      content: { type: String },
      ciphertext: { type: String },
      createdAt: { type: Date },
      isRead: { type: Boolean, default: false },
      deliveryStatus: { type: String, default: "SENT" },
    },
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },
    keyFingerprint: {
      type: String,
      default: "",
    },
    encryptionAlgorithm: {
      type: String,
      default: "AES-256-GCM",
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    archivedBy: {
      type: [String],
      default: [],
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    pinnedBy: {
      type: [String],
      default: [],
    },
    mutedBy: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
)

// Index for conversation listing performance
conversationSchema.index({ participants: 1, updatedAt: -1 })

export const Conversation = mongoose.model("Conversation", conversationSchema)
