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

const DEFAULT_USER: WqUser = {
  id: "bbc5fd04-2c10-430d-9a14-f29a2d60cccc",
  wqUserId: "bbc5fd04-2c10-430d-9a14-f29a2d60cccc",
  email: "dharaneesh@whitequantex.com",
  firstName: "Dharaneesh",
  lastName: "Viswanathan",
  displayName: "Dharaneesh Viswanathan",
  username: "dharaneezh7_e703",
  headline: "Verified Ecosystem Participant",
  bio: "Dharaneesh Viswanathan is an active technology founder, sovereign secondary liquidity architect, and venture ecosystem participant on White Quantex. Spearheading autonomous corporate capitalization, Delaware C-Corp registry compliance, and real-time private share order-book depth.",
  avatarUrl: "",
  coverImageUrl: "",
  location: "San Francisco, CA",
  website: "https://whitequantex.com",
  linkedinUrl: "https://linkedin.com/company/white-quantex",
  twitterUrl: "https://x.com/whitequantex",
  githubUrl: "https://github.com/white-quantex",
  roles: ["FOUNDER"],
  primaryRole: "FOUNDER",
  accountType: "individual",
  verificationLevel: "GOLD",
  kycStatus: "APPROVED",
  trustScore: 92,
  twoFactorEnabled: false,
  isEmailVerified: true,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

const getInitialUser = (): WqUser | null => {
  if (typeof window === "undefined") return DEFAULT_USER
  try {
    const saved = localStorage.getItem("wq_user_session")
    if (saved) return { ...DEFAULT_USER, ...JSON.parse(saved) }
    const profile = localStorage.getItem("wq_user_profile")
    if (profile) return { ...DEFAULT_USER, ...JSON.parse(profile) }
    return DEFAULT_USER
  } catch {
    return DEFAULT_USER
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
        localStorage.setItem("wq_user_profile", JSON.stringify(user))
      } else {
        localStorage.removeItem("wq_user_session")
        localStorage.removeItem("wq_user_profile")
      }
    }
    set({ user, isAuthenticated: !!user, isLoading: false })
  },
  updateUser: (updates) =>
    set((state) => {
      const current = state.user || (typeof window !== "undefined" ? getInitialUser() : null)
      const baseUser: WqUser = current || {
        id: "wq-user-dharaneesh",
        wqUserId: "wq-uuid-canonical-reference",
        email: "dharaneesh@whitequantex.com",
        firstName: "Dharaneesh",
        lastName: "Viswanathan",
        displayName: "Dharaneesh Viswanathan",
        username: "dharaneezh7_e703",
        headline: "Verified Ecosystem Participant",
        bio: "Dharaneesh Viswanathan is an active technology founder, sovereign secondary liquidity architect, and venture ecosystem participant on White Quantex. Spearheading autonomous corporate capitalization, Delaware C-Corp registry compliance, and real-time private share order-book depth.",
        avatarUrl: "",
        coverImageUrl: "",
        location: "San Francisco, CA",
        website: "https://whitequantex.com",
        linkedinUrl: "https://linkedin.com/company/white-quantex",
        twitterUrl: "https://x.com/whitequantex",
        githubUrl: "https://github.com/white-quantex",
        roles: ["FOUNDER"],
        primaryRole: "FOUNDER",
        accountType: "individual",
        verificationLevel: "SILVER",
        kycStatus: "APPROVED",
        trustScore: 85,
        twoFactorEnabled: false,
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const updated: WqUser = {
        ...baseUser,
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
      localStorage.removeItem("wq_user_session")
    }
    set({ user: null, isAuthenticated: false, isLoading: false })
  },
}))
