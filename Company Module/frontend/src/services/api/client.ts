import axios from "axios"

const SPRING_BASE_URL = import.meta.env.VITE_SPRING_BASE_URL || "/api/spring"
const NODE_BASE_URL = import.meta.env.VITE_NODE_BASE_URL || "/api/node"

export const springApi = axios.create({
  baseURL: SPRING_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

export const nodeApi = axios.create({
  baseURL: NODE_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

// Inject user context from localStorage if exists
const attachUserContext = (config: any) => {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("wq_user_session")
      if (saved) {
        const user = JSON.parse(saved)
        const userId = user?.id || user?.wqUserId
        if (userId) {
          config.headers = config.headers || {}
          config.headers["X-WQ-User-Id"] = userId
        }
      }
    } catch {}
  }
  return config
}

springApi.interceptors.request.use(attachUserContext)
nodeApi.interceptors.request.use(attachUserContext)

springApi.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
)

nodeApi.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
)
