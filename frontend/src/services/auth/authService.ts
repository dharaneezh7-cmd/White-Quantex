import { springApi } from "@/services/api/client"
import { WqUser, LoginRequest, RegisterRequest, ApiResponse } from "@/types"

export const authService = {
  async getCurrentUser(): Promise<WqUser> {
    const res = await springApi.get<ApiResponse<WqUser>>("/auth/me")
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
    await springApi.post("/auth/logout")
  },

  async forgotPassword(email: string): Promise<void> {
    await springApi.post("/auth/forgot-password", { email })
  },

  async verifyOtp(email: string, otp: string): Promise<void> {
    await springApi.post("/auth/verify-otp", { email, otp })
  },
}
