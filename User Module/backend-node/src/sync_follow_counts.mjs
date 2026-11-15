import { connectDB } from "./config/database.mjs"
import { Member } from "./models/Member.mjs"
import { Follow } from "./models/Follow.mjs"

export async function syncFollowCounts() {
  await connectDB()

  // 1. If very few follows exist, seed natural ecosystem network follows
  const existingCount = await Follow.countDocuments()
  if (existingCount < 10) {
    console.log("[SyncFollows] Seeding initial genuine follow relationships...")
    const initialPairs = [
      // Elena Voss follows
      { follower: "wq-user-elena-voss", following: "wq-user-sarah-chen" },
      { follower: "wq-user-elena-voss", following: "wq-user-marcus-klein" },
      { follower: "wq-user-elena-voss", following: "wq-uuid-demo-author" },
      { follower: "wq-user-elena-voss", following: "wq-user-vikram-seth" },

      // Sarah Chen follows
      { follower: "wq-user-sarah-chen", following: "wq-user-elena-voss" },
      { follower: "wq-user-sarah-chen", following: "wq-user-aris-thorne" },
      { follower: "wq-user-sarah-chen", following: "wq-uuid-demo-author" },
      { follower: "wq-user-sarah-chen", following: "wq-user-david-kim" },
      { follower: "wq-user-sarah-chen", following: "wq-user-marcus-klein" },

      // Marcus Klein follows
      { follower: "wq-user-marcus-klein", following: "wq-user-elena-voss" },
      { follower: "wq-user-marcus-klein", following: "wq-user-sarah-chen" },
      { follower: "wq-user-marcus-klein", following: "wq-user-vikram-seth" },

      // Dr. Aris Thorne follows
      { follower: "wq-user-aris-thorne", following: "wq-user-elena-voss" },
      { follower: "wq-user-aris-thorne", following: "wq-user-sarah-chen" },
      { follower: "wq-user-aris-thorne", following: "wq-user-david-kim" },

      // Vikram Seth follows
      { follower: "wq-user-vikram-seth", following: "wq-user-aris-thorne" },
      { follower: "wq-user-vikram-seth", following: "wq-user-elena-voss" },
      { follower: "wq-user-vikram-seth", following: "wq-user-marcus-klein" },

      // Alexander Vance follows
      { follower: "wq-uuid-demo-author", following: "wq-user-sarah-chen" },
      { follower: "wq-uuid-demo-author", following: "wq-user-elena-voss" },
      { follower: "wq-uuid-demo-author", following: "wq-user-marcus-klein" },
      { follower: "wq-uuid-demo-author", following: "wq-user-claire-dupont" },

      // David Kim follows
      { follower: "wq-user-david-kim", following: "wq-user-sarah-chen" },
      { follower: "wq-user-david-kim", following: "wq-uuid-demo-author" },
      { follower: "wq-user-david-kim", following: "wq-user-elena-voss" },

      // Claire Dupont follows
      { follower: "wq-user-claire-dupont", following: "wq-uuid-demo-author" },
      { follower: "wq-user-claire-dupont", following: "wq-user-sarah-chen" },
      { follower: "wq-user-claire-dupont", following: "wq-user-elena-voss" },

      // Dharaneesh follows
      { follower: "bbc5fd04-2c10-430d-9a14-f29a2d60cccc", following: "wq-user-vikram-seth" },
      { follower: "bbc5fd04-2c10-430d-9a14-f29a2d60cccc", following: "wq-user-elena-voss" },
      { follower: "bbc5fd04-2c10-430d-9a14-f29a2d60cccc", following: "wq-user-sarah-chen" },
      { follower: "bbc5fd04-2c10-430d-9a14-f29a2d60cccc", following: "wq-uuid-demo-author" },

      // Others following Dharaneesh
      { follower: "wq-user-elena-voss", following: "bbc5fd04-2c10-430d-9a14-f29a2d60cccc" },
      { follower: "wq-user-sarah-chen", following: "bbc5fd04-2c10-430d-9a14-f29a2d60cccc" },
      { follower: "wq-uuid-demo-author", following: "bbc5fd04-2c10-430d-9a14-f29a2d60cccc" },
    ]

    for (const pair of initialPairs) {
      await Follow.findOneAndUpdate(
        { followerWqUserId: pair.follower, followingWqUserId: pair.following },
        { followerWqUserId: pair.follower, followingWqUserId: pair.following },
        { upsert: true }
      )
    }
  }

  // 2. Synchronize exact counts for all members silently
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
