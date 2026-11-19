import express from "express"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"

import healthRouter from "./routes/health.mjs"
import postsRouter from "./routes/posts.mjs"
import communitiesRouter from "./routes/communities.mjs"
import followsRouter from "./routes/follows.mjs"
import membersRouter from "./routes/members.mjs"
import notificationsRouter from "./routes/notifications.mjs"
import messagesRouter from "./routes/messages.mjs"

const app = express()

// ── Security Hardening: Helmet with strict headers ───────────────────────────
app.use(helmet({ contentSecurityPolicy: false }))

// ── Security Hardening: Restrict CORS from wildcards ─────────────────────────
const ALLOWED_ORIGINS = new Set([
  "http://localhost:7000",
  "http://localhost:5173",
  "http://127.0.0.1:7000",
  "http://127.0.0.1:5173",
  "http://localhost:7001",
  "http://127.0.0.1:7001",
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",").map((s) => s.trim()) : []),
])

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server or curl requests with no origin
      if (!origin || ALLOWED_ORIGINS.has(origin)) {
        return callback(null, true)
      }
      return callback(new Error(`CORS blocked for unauthorized origin: ${origin}`))
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-WQ-User-Id", "X-Requested-With", "Accept"],
  })
)

// ── Security Hardening: Rate Limiting Middleware ──────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 300, // Max 300 requests per 15 minutes per IP
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, message: "Too many requests from this IP, please try again after 15 minutes." },
})

const mutationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60, // Max 60 write actions per 15 min per IP
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, message: "Action rate limit reached. Please wait before creating more content." },
})

app.use("/api/", globalLimiter)
app.use(express.json({ limit: "5mb" }))

// ── Apply routes with mutation rate limiting on write operations ─────────────
app.use("/api/health", healthRouter)
app.use("/api/posts", (req, res, next) => {
  if (["POST", "PUT", "DELETE"].includes(req.method)) return mutationLimiter(req, res, next)
  next()
}, postsRouter)
app.use("/api/communities", (req, res, next) => {
  if (["POST", "PUT", "DELETE"].includes(req.method)) return mutationLimiter(req, res, next)
  next()
}, communitiesRouter)
app.use("/api/follows", (req, res, next) => {
  if (["POST", "DELETE"].includes(req.method)) return mutationLimiter(req, res, next)
  next()
}, followsRouter)
app.use("/api/members", membersRouter)
app.use("/api/notifications", notificationsRouter)
app.use("/api/messages", (req, res, next) => {
  if (["POST", "DELETE"].includes(req.method)) return mutationLimiter(req, res, next)
  next()
}, messagesRouter)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Node API route not found" })
})

// Centralized Error Handler (Hides detailed internal stack traces from client)
app.use((err, req, res, next) => {
  const isDev = process.env.NODE_ENV === "development"
  console.error(`[API Error] ${req.method} ${req.url}:`, err.message)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(isDev ? { stack: err.stack } : {}),
  })
})

export default app
