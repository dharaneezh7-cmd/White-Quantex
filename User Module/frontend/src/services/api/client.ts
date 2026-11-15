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

          if (user?.email) {
            config.headers["X-WQ-User-Email"] = user.email
          }
          const name =
            user?.displayName ||
            [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
            user?.username ||
            "Verified Member"
          config.headers["X-WQ-User-Name"] = name

          if (user?.username) {
            config.headers["X-WQ-User-Username"] = user.username
          }
          if (user?.avatarUrl) {
            config.headers["X-WQ-User-Avatar"] = user.avatarUrl
          }
          if (user?.headline) {
            config.headers["X-WQ-User-Headline"] = user.headline
          }
          const role = user?.primaryRole || user?.role || "FOUNDER"
          config.headers["X-WQ-User-Role"] = role

          const accountType = user?.accountType || "INDIVIDUAL"
          config.headers["X-WQ-User-Account-Type"] = accountType

          const verification = user?.verificationLevel || "NONE"
          config.headers["X-WQ-User-Verification"] = verification
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
