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

// Global Request Interceptor injecting active WQ user identity
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
        if (user?.email) {
          config.headers = config.headers || {}
          config.headers["X-WQ-User-Email"] = user.email
        }
        if (user?.displayName) {
          config.headers = config.headers || {}
          config.headers["X-WQ-User-Name"] = user.displayName
        }
        if (user?.username) {
          config.headers = config.headers || {}
          config.headers["X-WQ-User-Username"] = user.username
        }
      }
    } catch {}
  }
  return config
}

springApi.interceptors.request.use(attachUserContext)
nodeApi.interceptors.request.use(attachUserContext)

// Global Response Interceptors for Error Handling
springApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Session expired or unauthorized
    }
    return Promise.reject(error)
  }
)

nodeApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Session expired or unauthorized
    }
    return Promise.reject(error)
  }
)
