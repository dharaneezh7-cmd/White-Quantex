import express from "express"
import cors from "cors"
import helmet from "helmet"

import healthRouter from "./routes/health.mjs"
import postsRouter from "./routes/posts.mjs"
import communitiesRouter from "./routes/communities.mjs"
import followsRouter from "./routes/follows.mjs"
import membersRouter from "./routes/members.mjs"
import notificationsRouter from "./routes/notifications.mjs"
import messagesRouter from "./routes/messages.mjs"

const app = express()

app.use(helmet({ contentSecurityPolicy: false }))
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  })
)
app.use(express.json())

app.use("/api/health", healthRouter)
app.use("/api/posts", postsRouter)
app.use("/api/communities", communitiesRouter)
app.use("/api/follows", followsRouter)
app.use("/api/members", membersRouter)
app.use("/api/notifications", notificationsRouter)
app.use("/api/messages", messagesRouter)

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Node API route not found" })
})

export default app
