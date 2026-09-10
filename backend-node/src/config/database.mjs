import mongoose from "mongoose"

export async function connectDB() {
  const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/white_quantex_social"
  try {
    await mongoose.connect(mongoURI)
    console.log(`[MongoDB] Connected to database: ${mongoURI}`)
  } catch (error) {
    console.error("[MongoDB] Connection error:", error.message)
    // Non-fatal fallback for dev mode when MongoDB container is not running
  }
}
