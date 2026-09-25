import mongoose from "mongoose"

const memberSchema = new mongoose.Schema(
  {
    wqUserId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true, index: true },
    headline: { type: String, required: true },
    bio: { type: String },
    role: { type: String, enum: ["FOUNDER", "INVESTOR"], required: true, index: true },
    location: { type: String, default: "San Francisco, CA" },
    avatarUrl: { type: String, default: "" },
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    verificationLevel: { type: String, enum: ["PLATINUM", "GOLD", "SILVER"], default: "GOLD" },
    trustScore: { type: Number, default: 92 },
    portfolioOrVenture: { type: String },
    badges: [{ type: String }],
    socialLinks: {
      linkedin: { type: String },
      twitter: { type: String },
      github: { type: String },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

memberSchema.index({ role: 1, followersCount: -1 })

export const Member = mongoose.model("Member", memberSchema)
