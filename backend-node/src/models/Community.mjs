import mongoose from "mongoose"

const communitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    coverImageUrl: { type: String },
    iconUrl: { type: String },
    memberCount: { type: Number, default: 1 },
    postCount: { type: Number, default: 0 },
    isPrivate: { type: Boolean, default: false },
    createdByWqUserId: { type: String, required: true },
    moderatorWqUserIds: [{ type: String }],
    categories: [{ type: String }],
  },
  { timestamps: true }
)

export const Community = mongoose.model("Community", communitySchema)
