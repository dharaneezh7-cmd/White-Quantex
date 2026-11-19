import http from "http"
import app from "./app.mjs"
import { connectDB } from "./config/database.mjs"
import { seedCommunityData } from "./seed.mjs"
import { syncCommentCounts } from "./sync_comment_counts.mjs"
import { syncFollowCounts } from "./sync_follow_counts.mjs"
import { initSocketIO } from "./services/socketService.mjs"

const PORT = process.env.PORT || 3001

async function startServer() {
  await connectDB()
  await syncCommentCounts()
  
  const server = http.createServer(app)
  initSocketIO(server)

  server.listen(PORT, "0.0.0.0", 4096, () => {
    console.log(`[Node Backend] Running on http://127.0.0.1:${PORT} with Socket.IO enabled`)
  })
}

startServer()
