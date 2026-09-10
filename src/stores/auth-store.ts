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

export const useAuthStore = create<AuthStoreState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),
  clearAuth: () => set({ user: null, isAuthenticated: false, isLoading: false }),
}))
