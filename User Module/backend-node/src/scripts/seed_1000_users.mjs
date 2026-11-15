import mongoose from "mongoose"
import { Member } from "../models/Member.mjs"
import { Conversation } from "../models/Conversation.mjs"
import { Message } from "../models/Message.mjs"
import { encryptMessage, getKeyFingerprint } from "../services/cryptoService.mjs"
import { getDeterministicConversationId } from "../routes/messages.mjs"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/white_quantex_social"

const FIRST_NAMES = [
  "Alexander", "Beatrice", "Carlos", "Dmitri", "Evelyn", "Fabian", "Genevieve", "Hiroshi", "Isabella", "Julian",
  "Katarina", "Liam", "Madeleine", "Nathaniel", "Octavia", "Philippe", "Quinn", "Rowan", "Seraphina", "Tristan",
  "Ursula", "Valentin", "Wilhelmina", "Xavier", "Yasmine", "Zachary", "Adeline", "Bartholomew", "Camilla", "Dominic"
]

const LAST_NAMES = [
  "Vance", "Mercer", "Sinclair", "Sterling", "Kowalski", "Fontaine", "Nakamura", "Al-Mansoor", "Lindqvist", "Dubois",
  "Rousseau", "Castiglione", "Vanderbilt", "Rothschild", "Blackwood", "Montague", "Winter", "Hawthorne", "de Vries", "Sheng"
]

const SECTORS = [
  "Quantitative FinTech", "Neural Architectures", "Renewable Infrastructure", "Autonomous Robotics", "Secondary Liquidity",
  "High-Frequency Market Systems", "Biomedical Telemetry", "Sovereign Escrow Protocols", "Enterprise Cryptography"
]

const SAMPLE_TEXTS = [
  "Reviewing the secondary allocation metrics. Everything matches the cryptographic settlement ledger.",
  "The order-book depth for the Series B equity round has cleared institutional compliance verification.",
  "Telemetry data across the distributed inference nodes has reached statutory audit threshold.",
  "Cryptographic keys derived via PBKDF2/SHA-256 are verified for out-of-band mutual authentication.",
  "Confirmed automated cap-table reconciliation with Delaware C-Corp registry standards.",
  "All AES-256-GCM authentication tags verified. Zero tampering detected across the wire.",
  "Transmitting high-speed algorithmic settlement logs for accredited syndicate clearing."
]

export async function seed1000Users(totalUsers = 1000) {
  console.log(`[Seed 1000 Users] Connecting to MongoDB: ${MONGODB_URI}`)
  await mongoose.connect(MONGODB_URI)

  console.log(`[Seed 1000 Users] Checking existing test users in database...`)
  const existingCount = await Member.countDocuments({ wqUserId: { $regex: /^wq-test-user-/ } })
  console.log(`[Seed 1000 Users] Found ${existingCount} existing test users.`)

  if (existingCount >= totalUsers) {
    console.log(`[Seed 1000 Users] Controlled dataset of ${totalUsers} test users already present.`)
    await mongoose.disconnect()
    return { count: existingCount, created: 0 }
  }

  const toCreate = totalUsers - existingCount
  console.log(`[Seed 1000 Users] Generating ${toCreate} realistic test members...`)

  const membersToInsert = []
  const startIndex = existingCount + 1

  for (let i = startIndex; i <= totalUsers; i++) {
    const pad = String(i).padStart(4, "0")
    const firstName = FIRST_NAMES[(i - 1) % FIRST_NAMES.length]
    const lastName = LAST_NAMES[Math.floor((i - 1) / FIRST_NAMES.length) % LAST_NAMES.length]
    const sector = SECTORS[i % SECTORS.length]
    const wqUserId = `wq-test-user-${pad}`
    const username = `testuser_${pad}`
    const name = `${firstName} ${lastName}`
    const levels = ["GOLD", "SILVER", "PLATINUM"]
    const verificationLevel = levels[i % levels.length]
    const trustScore = 80 + (i % 20)

    membersToInsert.push({
      wqUserId,
      id: wqUserId,
      name,
      username,
      headline: `Verified Ecosystem Participant - ${sector}`,
      role: i % 2 === 0 ? "INVESTOR" : "FOUNDER",
      portfolioOrVenture: sector,
      bio: `${name} is an active participant in White Quantex ecosystem specializing in ${sector} and cryptographic clearing.`,
      avatarUrl: "",
      verificationLevel,
      trustScore,
      followersCount: 5 + (i % 50),
      followingCount: 3 + (i % 30),
      postsCount: 2 + (i % 10),
      isClaimed: true,
      isActive: true,
      createdAt: new Date(Date.now() - (1000 - i) * 3600000),
      updatedAt: new Date(),
    })
  }

  // Batch insert members in chunks of 250 for speed and low memory
  const chunkSize = 250
  for (let c = 0; c < membersToInsert.length; c += chunkSize) {
    const chunk = membersToInsert.slice(c, c + chunkSize)
    await Member.insertMany(chunk)
    console.log(`[Seed 1000 Users] Inserted members chunk ${c + 1} to ${Math.min(c + chunkSize, membersToInsert.length)}`)
  }

  // Seed sample conversations and encrypted dispatches with primary user and test user clusters
  const primaryUserId = "bbc5fd04-2c10-430d-9a14-f29a2d60cccc"
  console.log(`[Seed 1000 Users] Creating realistic conversations and encrypted dispatches...`)

  const conversationsToUpsert = []
  const messagesToInsert = []

  // Connect primary user with first 25 test users
  for (let i = 1; i <= Math.min(25, totalUsers); i++) {
    const pad = String(i).padStart(4, "0")
    const targetUserId = `wq-test-user-${pad}`
    const convId = getDeterministicConversationId(primaryUserId, targetUserId)

    const text1 = SAMPLE_TEXTS[(i * 2) % SAMPLE_TEXTS.length]
    const text2 = SAMPLE_TEXTS[(i * 2 + 1) % SAMPLE_TEXTS.length]

    const enc1 = encryptMessage(text1, convId)
    const enc2 = encryptMessage(text2, convId)

    const date1 = new Date(Date.now() - (30 - i) * 600000)
    const date2 = new Date(Date.now() - (30 - i) * 600000 + 120000)

    messagesToInsert.push({
      conversationId: convId,
      senderWqUserId: targetUserId,
      recipientWqUserId: primaryUserId,
      ciphertext: enc1.ciphertext,
      iv: enc1.iv,
      authTag: enc1.authTag,
      algorithm: enc1.algorithm,
      keyFingerprint: enc1.keyFingerprint,
      content: text1,
      contentType: "TEXT",
      isRead: i > 5, // Leave first 5 as unread to verify unread badges
      readAt: i > 5 ? date1 : null,
      deliveryStatus: i > 5 ? "READ" : "DELIVERED",
      createdAt: date1,
      updatedAt: date1,
    })

    messagesToInsert.push({
      conversationId: convId,
      senderWqUserId: primaryUserId,
      recipientWqUserId: targetUserId,
      ciphertext: enc2.ciphertext,
      iv: enc2.iv,
      authTag: enc2.authTag,
      algorithm: enc2.algorithm,
      keyFingerprint: enc2.keyFingerprint,
      content: text2,
      contentType: "TEXT",
      isRead: true,
      readAt: date2,
      deliveryStatus: "READ",
      createdAt: date2,
      updatedAt: date2,
    })

    conversationsToUpsert.push({
      conversationId: convId,
      participants: [primaryUserId, targetUserId],
      participantUsernames: ["dharaneezh7_e703", `testuser_${pad}`],
      lastMessage: {
        senderWqUserId: primaryUserId,
        content: text2,
        createdAt: date2,
        isRead: true,
        deliveryStatus: "READ",
      },
      unreadCounts: {
        [primaryUserId]: i <= 5 ? 1 : 0,
        [targetUserId]: 0,
      },
      keyFingerprint: getKeyFingerprint(convId),
      encryptionAlgorithm: "AES-256-GCM",
      isPinned: i === 1,
    })
  }

  // Inter-test-user conversations (pairs: test-user-0026 & test-user-0027, etc.)
  for (let i = 26; i <= Math.min(100, totalUsers); i += 2) {
    const pad1 = String(i).padStart(4, "0")
    const pad2 = String(i + 1).padStart(4, "0")
    const userA = `wq-test-user-${pad1}`
    const userB = `wq-test-user-${pad2}`
    const convId = getDeterministicConversationId(userA, userB)

    const text = SAMPLE_TEXTS[i % SAMPLE_TEXTS.length]
    const enc = encryptMessage(text, convId)
    const date = new Date(Date.now() - i * 180000)

    messagesToInsert.push({
      conversationId: convId,
      senderWqUserId: userA,
      recipientWqUserId: userB,
      ciphertext: enc.ciphertext,
      iv: enc.iv,
      authTag: enc.authTag,
      algorithm: enc.algorithm,
      keyFingerprint: enc.keyFingerprint,
      content: text,
      contentType: "TEXT",
      isRead: true,
      readAt: date,
      deliveryStatus: "READ",
      createdAt: date,
      updatedAt: date,
    })

    conversationsToUpsert.push({
      conversationId: convId,
      participants: [userA, userB],
      participantUsernames: [`testuser_${pad1}`, `testuser_${pad2}`],
      lastMessage: {
        senderWqUserId: userA,
        content: text,
        createdAt: date,
        isRead: true,
        deliveryStatus: "READ",
      },
      unreadCounts: { [userA]: 0, [userB]: 0 },
      keyFingerprint: getKeyFingerprint(convId),
      encryptionAlgorithm: "AES-256-GCM",
    })
  }

  // Save conversations
  for (const c of conversationsToUpsert) {
    await Conversation.findOneAndUpdate(
      { conversationId: c.conversationId },
      c,
      { upsert: true, new: true }
    )
  }

  // Insert messages
  if (messagesToInsert.length > 0) {
    await Message.insertMany(messagesToInsert)
  }

  const finalTotal = await Member.countDocuments({ wqUserId: { $regex: /^wq-test-user-/ } })
  const totalConvs = await Conversation.countDocuments()
  const totalMsgs = await Message.countDocuments()

  console.log(`[Seed 1000 Users] Controlled dataset seeded successfully!`)
  console.log(`[Seed 1000 Users] Total test members: ${finalTotal}`)
  console.log(`[Seed 1000 Users] Total conversations in DB: ${totalConvs}`)
  console.log(`[Seed 1000 Users] Total messages in DB: ${totalMsgs}`)

  await mongoose.disconnect()
  return { count: finalTotal, conversations: totalConvs, messages: totalMsgs }
}

if (process.argv[1]?.endsWith("seed_1000_users.mjs")) {
  seed1000Users(1000)
    .then((r) => {
      console.log("Seed finished:", r)
      process.exit(0)
    })
    .catch((err) => {
      console.error("Seed error:", err)
      process.exit(1)
    })
}
