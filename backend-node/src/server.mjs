import app from "./app.mjs"
import { connectDB } from "./config/database.mjs"

const PORT = process.env.PORT || 3001

async function startServer() {
  await connectDB()
  app.listen(PORT, () => {
    console.log(`[Node Backend] Running on http://localhost:${PORT}`)
  })
}

startServer()
