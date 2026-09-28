export type UserRole = "FOUNDER" | "INVESTOR" | "STUDENT" | "MENTOR" | "CORPORATE" | "ADMIN"
export type AccountType = "INDIVIDUAL" | "ORGANIZATION" | "VENTURE_CAPITAL" | "CORPORATE_ISSUER"
export type VerificationLevel = "NONE" | "BRONZE" | "SILVER" | "GOLD" | "PLATINUM"
export type KycStatus = "PENDING" | "SUBMITTED" | "VERIFIED" | "REJECTED"

export interface WqUser {
  id?: string
  wqUserId: string
  email: string
  firstName: string
  lastName: string
  username: string
  displayName: string
  headline?: string
  bio?: string
  avatarUrl?: string
  coverImageUrl?: string
  location?: string
  website?: string
  roles?: UserRole[]
  primaryRole?: UserRole
  accountType?: AccountType
  verificationLevel?: VerificationLevel
  kycStatus?: KycStatus
  trustScore?: number
}

export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  password: string
  role?: UserRole
  username?: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}
