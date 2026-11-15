import { io, Socket } from "socket.io-client"
import { ConnectionStatus, SyncResponsePayload } from "./socketTypes"

let socketInstance: Socket | null = null
const statusListeners = new Set<(status: ConnectionStatus) => void>()
let currentStatus: ConnectionStatus = "disconnected"

function updateStatus(status: ConnectionStatus) {
  currentStatus = status
  statusListeners.forEach((fn) => {
    try {
      fn(status)
    } catch {}
  })
}

export function subscribeConnectionStatus(callback: (status: ConnectionStatus) => void): () => void {
  statusListeners.add(callback)
  callback(currentStatus)
  return () => {
    statusListeners.delete(callback)
  }
}

export function getSocket(wqUserId?: string, username?: string): Socket {
  if (socketInstance && (socketInstance.connected || socketInstance.active)) {
    return socketInstance
  }

  // Fallback to localStorage session if not passed
  let effectiveUserId = wqUserId
  let effectiveUsername = username

  if (!effectiveUserId && typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("wq_user_session")
      if (saved) {
        const u = JSON.parse(saved)
        effectiveUserId = u.id || u.wqUserId
        effectiveUsername = u.username
      }
    } catch {}
  }

  if (!effectiveUserId) {
    effectiveUserId = "bbc5fd04-2c10-430d-9a14-f29a2d60cccc"
    effectiveUsername = "dharaneezh7_e703"
  }

  const backendUrl = import.meta.env.VITE_NODE_URL || "http://localhost:3001"
  updateStatus("connecting")

  socketInstance = io(backendUrl, {
    transports: ["websocket", "polling"],
    auth: {
      wqUserId: effectiveUserId,
      username: effectiveUsername,
    },
    query: {
      wqUserId: effectiveUserId,
      username: effectiveUsername,
    },
    reconnection: true,
    reconnectionAttempts: 15,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 10000,
  })

  socketInstance.on("connect", () => {
    updateStatus("connected")
  })

  socketInstance.on("disconnect", (reason) => {
    updateStatus(reason === "io server disconnect" ? "disconnected" : "reconnecting")
  })

  socketInstance.on("connect_error", () => {
    updateStatus("reconnecting")
  })

  return socketInstance
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect()
    socketInstance = null
    updateStatus("disconnected")
  }
}

export function emitTypingStart(conversationId: string) {
  const socket = getSocket()
  socket.emit("typing:start", { conversationId })
}

export function emitTypingStop(conversationId: string) {
  const socket = getSocket()
  socket.emit("typing:stop", { conversationId })
}

export function emitMessageDelivered(conversationId: string, messageId: string) {
  const socket = getSocket()
  socket.emit("message:delivered", { conversationId, messageId })
}

export function emitMessageRead(conversationId: string, messageIds: string[]) {
  const socket = getSocket()
  socket.emit("message:read", { conversationId, messageIds })
}

export function requestConversationSync(conversationId: string, since: string): Promise<SyncResponsePayload | null> {
  return new Promise((resolve) => {
    const socket = getSocket()
    if (!socket.connected) {
      resolve(null)
      return
    }
    socket.emit("sync:request", { conversationId, since }, (res: SyncResponsePayload) => {
      resolve(res)
    })
    setTimeout(() => resolve(null), 3500)
  })
}

export function queryPresence(userIds: string[]): Promise<Record<string, { isOnline: boolean; lastSeen: string | null }>> {
  return new Promise((resolve) => {
    const socket = getSocket()
    if (!socket.connected) {
      resolve({})
      return
    }
    socket.emit("presence:query", { userIds }, (res: Record<string, { isOnline: boolean; lastSeen: string | null }>) => {
      resolve(res || {})
    })
    setTimeout(() => resolve({}), 2500)
  })
}
