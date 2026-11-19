import { create } from "zustand"
import { WqUser, UserSession } from "@/types"

interface AuthStoreState {
  user: WqUser | null
  currentSession: UserSession | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: WqUser | null) => void
  setCurrentSession: (session: UserSession | null) => void
  updateUser: (updates: Partial<WqUser>) => void
  clearAuth: () => void
}

const getInitialUser = (): WqUser | null => {
  if (typeof window === "undefined") return null
  try {
    if (localStorage.getItem("wq_logged_out") === "true") {
      return null
    }
    const saved = localStorage.getItem("wq_user_session")
    if (saved) return JSON.parse(saved)
    const profile = localStorage.getItem("wq_user_profile")
    if (profile) return JSON.parse(profile)
    return null
  } catch {
    return null
  }
}

const getInitialSession = (): UserSession | null => {
  if (typeof window === "undefined") return null
  try {
    const saved = localStorage.getItem("wq_active_session")
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

const initialUser = getInitialUser()
const initialSession = getInitialSession()

export const useAuthStore = create<AuthStoreState>((set) => ({
  user: initialUser,
  currentSession: initialSession,
  isAuthenticated: !!initialUser,
  isLoading: false,
  setUser: (user) => {
    if (typeof window !== "undefined") {
      if (user) {
        localStorage.removeItem("wq_logged_out")
        localStorage.setItem("wq_user_session", JSON.stringify(user))
        localStorage.setItem("wq_user_profile", JSON.stringify(user))
      } else {
        localStorage.setItem("wq_logged_out", "true")
        localStorage.removeItem("wq_user_session")
        localStorage.removeItem("wq_user_profile")
        localStorage.removeItem("wq_active_session")
      }
    }
    set({ user, isAuthenticated: !!user, isLoading: false })
  },
  setCurrentSession: (currentSession) => {
    if (typeof window !== "undefined") {
      if (currentSession) {
        localStorage.setItem("wq_active_session", JSON.stringify(currentSession))
      } else {
        localStorage.removeItem("wq_active_session")
      }
    }
    set({ currentSession })
  },
  updateUser: (updates) =>
    set((state) => {
      if (!state.user) return state
      const updated: WqUser = {
        ...state.user,
        ...updates,
        updatedAt: new Date().toISOString(),
      }
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("wq_user_session", JSON.stringify(updated))
          localStorage.setItem("wq_user_profile", JSON.stringify(updated))
        } catch (e) {
          console.error("Failed to save to localStorage", e)
        }
      }
      return { user: updated, isAuthenticated: true }
    }),
  clearAuth: () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("wq_logged_out", "true")
        localStorage.removeItem("wq_user_session")
        localStorage.removeItem("wq_user_profile")
        localStorage.removeItem("wq_active_session")
        sessionStorage.clear()
      } catch (e) {
        console.error("Failed to clear localStorage", e)
      }
    }
    set({ user: null, currentSession: null, isAuthenticated: false, isLoading: false })
  },
}))
