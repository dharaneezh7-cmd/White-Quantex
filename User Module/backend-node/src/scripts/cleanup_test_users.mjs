import mongoose from "mongoose"
import { Member } from "../models/Member.mjs"
import { Conversation } from "../models/Conversation.mjs"
import { Message } from "../models/Message.mjs"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/white_quantex_social"

export async function cleanupTestUsers() {
  console.log(`[Cleanup Test Users] Connecting to MongoDB: ${MONGODB_URI}`)
  await mongoose.connect(MONGODB_URI)

  const deletedMembers = await Member.deleteMany({ wqUserId: { $regex: /^wq-test-user-/ } })
  console.log(`[Cleanup Test Users] Removed ${deletedMembers.deletedCount} test members.`)

  const deletedConvs = await Conversation.deleteMany({ conversationId: { $regex: /wq-test-user-/ } })
  console.log(`[Cleanup Test Users] Removed ${deletedConvs.deletedCount} test conversations.`)

  const deletedMsgs = await Message.deleteMany({
    $or: [
      { senderWqUserId: { $regex: /^wq-test-user-/ } },
      { recipientWqUserId: { $regex: /^wq-test-user-/ } },
      { conversationId: { $regex: /wq-test-user-/ } },
    ],
  })
  console.log(`[Cleanup Test Users] Removed ${deletedMsgs.deletedCount} test messages.`)

  await mongoose.disconnect()
  return {
    deletedMembers: deletedMembers.deletedCount,
    deletedConversations: deletedConvs.deletedCount,
    deletedMessages: deletedMsgs.deletedCount,
  }
}

if (process.argv[1]?.endsWith("cleanup_test_users.mjs")) {
  cleanupTestUsers()
    .then((r) => {
      console.log("Cleanup finished:", r)
      process.exit(0)
    })
    .catch((err) => {
      console.error("Cleanup error:", err)
      process.exit(1)
    })
}
