import mongoose from "mongoose"
import { Message } from "../models/Message.mjs"
import { Conversation } from "../models/Conversation.mjs"
import { encryptMessage, getKeyFingerprint } from "../services/cryptoService.mjs"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/white_quantex_social"
const convId = "conv_bbc5fd04-2c10-430d-9a14-f29a2d60cccc_wq-test-user-0001"
const user1 = "bbc5fd04-2c10-430d-9a14-f29a2d60cccc"
const user2 = "wq-test-user-0001"

async function seed() {
  await mongoose.connect(MONGODB_URI)
  console.log("Connected to MongoDB")

  const count = await Message.countDocuments({ conversationId: convId })
  if (count < 20) {
    console.log(`Current message count is ${count}. Adding messages up to 25...`)
    const docs = []
    for (let i = count + 1; i <= 25; i++) {
      const sender = i % 2 === 0 ? user1 : user2
      const recipient = i % 2 === 0 ? user2 : user1
      const text = `Discussion dispatch #${i}: Reviewing term sheet covenants and cap table allocation for tranche ${i}. Verified sovereign secondary liquidity ledger.`
      const { ciphertext, iv, authTag, algorithm, keyFingerprint } = encryptMessage(text, convId)

      docs.push({
        conversationId: convId,
        senderWqUserId: sender,
        recipientWqUserId: recipient,
        ciphertext,
        iv,
        authTag,
        algorithm,
        keyFingerprint,
        contentType: "TEXT",
        deliveryStatus: "READ",
        isRead: true,
        createdAt: new Date(Date.now() - (30 - i) * 60000),
      })
    }
    await Message.insertMany(docs)
    console.log(`Inserted ${docs.length} messages.`)
  } else {
    console.log(`Already has ${count} messages.`)
  }

  // Update conversation lastMessage
  const lastMsg = await Message.findOne({ conversationId: convId }).sort({ createdAt: -1 })
  if (lastMsg) {
    await Conversation.findOneAndUpdate(
      { conversationId: convId },
      {
        lastMessage: {
          content: "Discussion dispatch #25: Reviewing term sheet covenants...",
          senderWqUserId: lastMsg.senderWqUserId,
          createdAt: lastMsg.createdAt,
          contentType: "TEXT",
        },
        updatedAt: new Date(),
      }
    )
  }

  await mongoose.disconnect()
  console.log("Finished seeding messages.")
}

seed().catch(err => {
  console.error(err)
  process.exit(1)
})
