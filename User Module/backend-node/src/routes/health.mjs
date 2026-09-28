import { Router } from "express"

const router = Router()

router.get("/", (req, res) => {
  res.json({
    status: "UP",
    service: "White Quantex Node.js Social & Community Service",
    timestamp: new Date().toISOString(),
  })
})

export default router
