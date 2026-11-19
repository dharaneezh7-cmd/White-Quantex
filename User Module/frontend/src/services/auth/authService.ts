import { springApi } from "@/services/api/client"
import { useAuthStore } from "@/stores/auth-store"
import {
  WqUser,
  LoginRequest,
  RegisterRequest,
  ApiResponse,
  UserSession,
  UserActivity,
  RecordActivityRequest,
} from "@/types"

export const authService = {
  async getCurrentUser(): Promise<WqUser> {
    const res = await springApi.get<ApiResponse<WqUser>>("/auth/me")
    return res.data.data
  },

  async updateProfile(updates: Partial<WqUser>): Promise<WqUser> {
    const res = await springApi.put<ApiResponse<WqUser>>("/auth/profile", updates)
    return res.data.data
  },

  async login(credentials: LoginRequest): Promise<WqUser> {
    const res = await springApi.post<ApiResponse<WqUser>>("/auth/login", credentials)
    return res.data.data
  },

  async demoLogin(): Promise<WqUser> {
    try {
      const res = await springApi.post<ApiResponse<WqUser>>("/auth/demo-login")
      return res.data.data
    } catch {
      return this.login({ email: "demo@whitequantex.com", password: "demo123" })
    }
  },

  async register(data: RegisterRequest): Promise<WqUser> {
    const res = await springApi.post<ApiResponse<WqUser>>("/auth/register", data)
    return res.data.data
  },

  async logout(): Promise<void> {
    try {
      await springApi.post("/auth/logout")
    } catch (e) {
      console.warn("Backend logout notification warning:", e)
    }
  },

  async getCurrentSession(): Promise<UserSession | null> {
    try {
      const res = await springApi.get<ApiResponse<UserSession>>("/auth/session")
      return res.data.data
    } catch {
      return null
    }
  },

  async getActiveSessions(): Promise<UserSession[]> {
    try {
      const res = await springApi.get<ApiResponse<UserSession[]>>("/auth/sessions")
      return res.data.data || []
    } catch {
      return []
    }
  },

  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      await springApi.delete(`/auth/sessions/${sessionId}`)
      return true
    } catch {
      return false
    }
  },

  async trackActivity(payload: RecordActivityRequest): Promise<void> {
    const { isAuthenticated, user } = useAuthStore.getState()
    if (!isAuthenticated || !user) {
      // If user is not logged in, do not track user activity
      return
    }

    try {
      await springApi.post("/auth/session/activity", payload)
    } catch {
      // Activity tracking is non-blocking telemetry
    }
  },

  async getRecentActivities(limit: number = 20): Promise<UserActivity[]> {
    const { isAuthenticated, user } = useAuthStore.getState()
    if (!isAuthenticated || !user) {
      return []
    }

    try {
      const res = await springApi.get<ApiResponse<UserActivity[]>>(`/auth/session/activities?limit=${limit}`)
      return res.data.data || []
    } catch {
      return []
    }
  },

  async forgotPassword(email: string): Promise<void> {
    await springApi.post("/auth/forgot-password", { email })
  },

  async verifyOtp(email: string, otp: string): Promise<void> {
    await springApi.post("/auth/verify-otp", { email, otp })
  },
}
