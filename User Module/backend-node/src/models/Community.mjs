import mongoose from "mongoose"

const communitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    coverImageUrl: { type: String, default: "" },
    iconUrl: { type: String, default: "" },
    memberCount: { type: Number, default: 1 },
    postCount: { type: Number, default: 0 },
    isPrivate: { type: Boolean, default: false },
    createdByWqUserId: { type: String, required: true },
    moderatorWqUserIds: [{ type: String }],
    members: [{ type: String }],
    categories: [{ type: String }],
    rules: [{ type: String }],
  },
  { timestamps: true }
)

export const Community = mongoose.model("Community", communitySchema)
