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
