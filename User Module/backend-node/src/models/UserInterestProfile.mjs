import mongoose from "mongoose"

const userInterestProfileSchema = new mongoose.Schema(
  {
    wqUserId: { type: String, required: true, unique: true, index: true },
    // Tag weights: e.g. { "ai": 25.5, "cleantech": 14.0, ... }
    tagWeights: { type: Map, of: Number, default: {} },
    // Post type preferences: e.g. { "TEXT": 4, "IMAGE": 15, "UPDATE": 8 }
    postTypeWeights: { type: Map, of: Number, default: {} },
    // Author preferences: e.g. { "authorId": 12.0 }
    authorWeights: { type: Map, of: Number, default: {} },
    // Author account type preferences: { "COMPANY": 10, "VENTURE": 8, "INDIVIDUAL": 4 }
    accountTypeWeights: { type: Map, of: Number, default: {} },
    // Community preferences: { "ai-ml-founders": 6.5 }
    communityWeights: { type: Map, of: Number, default: {} },
    // Recently presented/viewed post IDs for novelty & anti-fatigue on refresh
    recentlyViewedPostIds: [{ type: String }],
    totalInteractionsCount: { type: Number, default: 0 },
    lastActiveAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

export const UserInterestProfile = mongoose.model("UserInterestProfile", userInterestProfileSchema)
