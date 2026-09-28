import { create } from "zustand"
import { WqUser } from "@/types"

interface AuthStoreState {
  user: WqUser | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: WqUser | null) => void
  updateUser: (updates: Partial<WqUser>) => void
  clearAuth: () => void
}

const getInitialUser = (): WqUser | null => {
  if (typeof window === "undefined") return null
  try {
    const saved = localStorage.getItem("wq_user_session")
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

const initialUser = getInitialUser()

export const useAuthStore = create<AuthStoreState>((set) => ({
  user: initialUser,
  isAuthenticated: !!initialUser,
  isLoading: false,
  setUser: (user) => {
    if (typeof window !== "undefined") {
      if (user) {
        localStorage.setItem("wq_user_session", JSON.stringify(user))
      } else {
        localStorage.removeItem("wq_user_session")
      }
    }
    set({ user, isAuthenticated: !!user, isLoading: false })
  },
  updateUser: (updates) =>
    set((state) => {
      const updated = state.user ? { ...state.user, ...updates } : null
      if (typeof window !== "undefined" && updated) {
        localStorage.setItem("wq_user_session", JSON.stringify(updated))
      }
      return { user: updated }
    }),
  clearAuth: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("wq_user_session")
    }
    set({ user: null, isAuthenticated: false, isLoading: false })
  },
}))
