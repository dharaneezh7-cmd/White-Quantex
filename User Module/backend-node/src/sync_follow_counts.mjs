import { connectDB } from "./config/database.mjs"
import { Member } from "./models/Member.mjs"
import { Follow } from "./models/Follow.mjs"

export async function syncFollowCounts() {
  await connectDB()

  // Synchronize exact counts for all members silently
  const members = await Member.find().lean()

  for (const m of members) {
    const key = m.wqUserId
    const realFollowersCount = await Follow.countDocuments({
      $or: [{ followingWqUserId: key }, { followingWqUserId: m.username }],
    })
    const realFollowingCount = await Follow.countDocuments({
      $or: [{ followerWqUserId: key }, { followerWqUserId: m.username }],
    })

    await Member.updateOne(
      { _id: m._id },
      {
        $set: {
          followersCount: realFollowersCount,
          followingCount: realFollowingCount,
        },
      }
    )
  }
}

if (process.argv[1]?.endsWith("sync_follow_counts.mjs")) {
  syncFollowCounts().then(() => process.exit(0))
}
