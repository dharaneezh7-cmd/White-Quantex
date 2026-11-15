import { performance } from "perf_hooks"
import { io } from "socket.io-client"

const BASE_URL = process.env.BASE_URL || "http://localhost:3001"
const STAGES = [10, 50, 100, 250, 500, 1000]

function percentile(arr, p) {
  if (arr.length === 0) return 0
  const sorted = [...arr].sort((a, b) => a - b)
  const index = Math.ceil((p / 100) * sorted.length) - 1
  return sorted[Math.max(0, Math.min(index, sorted.length - 1))]
}

async function runWorker(workerId) {
  const pad = String((workerId % 1000) + 1).padStart(4, "0")
  const senderId = `wq-test-user-${pad}`
  const targetPad = String(((workerId + 42) % 1000) + 1).padStart(4, "0")
  const targetId = `wq-test-user-${targetPad}`

  const latencies = []
  let errors = 0
  let socketConnected = false

  // 1. Socket.IO Handshake
  const t0 = performance.now()
  let socket = null
  try {
    socket = io(BASE_URL, {
      transports: ["websocket", "polling"],
      auth: { wqUserId: senderId, username: `testuser_${pad}` },
      timeout: 5000,
    })

    await new Promise((resolve) => {
      socket.on("connect", () => {
        socketConnected = true
        resolve(true)
      })
      socket.on("connect_error", () => {
        resolve(false)
      })
      setTimeout(() => resolve(false), 3000)
    })
    latencies.push(performance.now() - t0)
  } catch (err) {
    errors++
  }

  // 2. Start Conversation (User Selection Resolution)
  let conversationId = null
  const t1 = performance.now()
  try {
    const res = await fetch(`${BASE_URL}/api/messages/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-wq-user-id": senderId,
      },
      body: JSON.stringify({
        targetWqUserId: targetId,
        targetUsername: `testuser_${targetPad}`,
      }),
    })
    const json = await res.json()
    if (json.success && json.data?.conversationId) {
      conversationId = json.data.conversationId
    } else {
      errors++
    }
    latencies.push(performance.now() - t1)
  } catch (err) {
    errors++
    latencies.push(performance.now() - t1)
  }

  // 3. Send Encrypted Message (AES-256-GCM + DB Insert)
  if (conversationId) {
    const t2 = performance.now()
    try {
      const res = await fetch(`${BASE_URL}/api/messages/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-wq-user-id": senderId,
        },
        body: JSON.stringify({
          conversationId,
          recipientWqUserId: targetId,
          content: `Load test payload dispatch from worker ${workerId} at ${Date.now()}`,
        }),
      })
      const json = await res.json()
      if (!json.success) errors++
      latencies.push(performance.now() - t2)
    } catch (err) {
      errors++
      latencies.push(performance.now() - t2)
    }

    // 4. Retrieve Thread & Decrypt
    const t3 = performance.now()
    try {
      const res = await fetch(`${BASE_URL}/api/messages/conversations/${encodeURIComponent(conversationId)}`, {
        headers: {
          "x-wq-user-id": senderId,
        },
      })
      const json = await res.json()
      if (!json.success || !Array.isArray(json.data?.messages)) errors++
      latencies.push(performance.now() - t3)
    } catch (err) {
      errors++
      latencies.push(performance.now() - t3)
    }
  }

  if (socket) {
    socket.disconnect()
  }

  return {
    workerId,
    socketConnected,
    latencies,
    errors,
  }
}

async function runStage(concurrency) {
  console.log(`\n======================================================================`)
  console.log(`>>> EXECUTING LOAD STAGE: ${concurrency} CONCURRENT CLIENTS`)
  console.log(`======================================================================`)

  const stageStart = performance.now()
  const promises = []

  for (let i = 0; i < concurrency; i++) {
    promises.push(runWorker(i))
  }

  const results = await Promise.all(promises)
  const stageDurationMs = performance.now() - stageStart

  const allLatencies = results.flatMap((r) => r.latencies)
  const totalErrors = results.reduce((sum, r) => sum + r.errors, 0)
  const connectedSockets = results.filter((r) => r.socketConnected).length

  const totalOps = allLatencies.length
  const throughput = ((totalOps / (stageDurationMs / 1000))).toFixed(1)
  const avgLatency = (allLatencies.reduce((a, b) => a + b, 0) / (allLatencies.length || 1)).toFixed(2)
  const p50 = percentile(allLatencies, 50).toFixed(2)
  const p95 = percentile(allLatencies, 95).toFixed(2)
  const p99 = percentile(allLatencies, 99).toFixed(2)
  const minLatency = (Math.min(...allLatencies) || 0).toFixed(2)
  const maxLatency = (Math.max(...allLatencies) || 0).toFixed(2)
  const errorRate = (((totalErrors) / (totalOps + totalErrors || 1)) * 100).toFixed(2)
  const socketRate = (((connectedSockets) / (concurrency || 1)) * 100).toFixed(1)

  const summary = {
    concurrency,
    durationSeconds: (stageDurationMs / 1000).toFixed(2),
    totalOperations: totalOps,
    throughputReqSec: parseFloat(throughput),
    socketConnectRate: `${socketRate}%`,
    avgLatencyMs: parseFloat(avgLatency),
    p50Ms: parseFloat(p50),
    p95Ms: parseFloat(p95),
    p99Ms: parseFloat(p99),
    minLatencyMs: parseFloat(minLatency),
    maxLatencyMs: parseFloat(maxLatency),
    errorCount: totalErrors,
    errorRate: `${errorRate}%`,
  }

  console.table([summary])
  return summary
}

async function runAllStages() {
  console.log("WHITE QUANTEX MESSAGING SYSTEM - PROGRESSIVE LOAD TEST HARNESS")
  console.log(`Target: ${BASE_URL}`)
  console.log(`Timestamp: ${new Date().toISOString()}`)

  const allSummaries = []

  for (const c of STAGES) {
    const summary = await runStage(c)
    allSummaries.push(summary)
    // Small cooldown between stages to allow event loop and DB connections to settle
    await new Promise((r) => setTimeout(r, 1000))
  }

  console.log("\n======================================================================")
  console.log("COMPREHENSIVE PROGRESSIVE LOAD TEST RESULTS SUMMARY")
  console.log("======================================================================")
  console.table(allSummaries)

  return allSummaries
}

runAllStages()
  .then((results) => {
    console.log("\n[Load Test Finished Successfully]")
    process.exit(0)
  })
  .catch((err) => {
    console.error("[Load Test Fatal Error]:", err)
    process.exit(1)
  })
