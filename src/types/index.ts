// ─────────────────────────────────────────────────────────────────────────────
// White Quantex v2 — Core Type Definitions
// Financial types are Spring/PostgreSQL-owned.
// Social types are Node/MongoDB-owned.
// ─────────────────────────────────────────────────────────────────────────────

// ── Enums & Literals ─────────────────────────────────────────────────────────

export type AccountType = "individual" | "company" | "admin"

export type UserRole =
  | "FOUNDER"
  | "INVESTOR"
  | "CORPORATE_INVESTOR"
  | "COMPANY_FUNDRAISING"
  | "MENTOR"
  | "STUDENT"
  | "ADMIN"

export type CompanyType = "STARTUP" | "EXISTING_COMPANY"

export type StartupStage =
  | "IDEA"
  | "PRE_SEED"
  | "SEED"
  | "SERIES_A"
  | "SERIES_B"
  | "GROWTH"
  | "PRE_IPO"

export type VerificationLevel = "NONE" | "BRONZE" | "SILVER" | "GOLD" | "PLATINUM"

export type KycStatus = "NONE" | "PENDING" | "APPROVED" | "REJECTED"

export type PostType = "TEXT" | "IMAGE" | "VIDEO" | "POLL" | "LINK"

export type Visibility =
  | "PUBLIC"
  | "FOLLOWERS"
  | "PRIVATE"
  | "COMPANY_TEAM"
  | "STARTUP_TEAM"
  | "MENTORS"
  | "INVESTORS"

export type InvestmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "REFUNDED"
  | "COMPLETED"

export type CampaignStatus =
  | "DRAFT"
  | "ACTIVE"
  | "PAUSED"
  | "COMPLETED"
  | "CANCELLED"

export type NotificationType =
  | "LIKE"
  | "COMMENT"
  | "FOLLOW"
  | "MENTION"
  | "SHARE"
  | "INVESTMENT"
  | "PORTFOLIO"
  | "TRANSACTION"
  | "VERIFICATION"
  | "DOCUMENT"
  | "CAMPAIGN"
  | "COMMUNITY"
  | "SYSTEM"

// ── Identity & Auth ───────────────────────────────────────────────────────────

export interface WqUser {
  wqUserId: string         // Stable UUID — never changes
  email: string
  firstName: string
  lastName: string
  username: string
  displayName: string
  headline: string
  bio: string
  avatarUrl: string
  coverImageUrl: string
  location: string
  website: string
  linkedinUrl: string
  twitterUrl: string
  githubUrl: string
  phone?: string
  country?: string
  roles: UserRole[]
  primaryRole: UserRole
  accountType: AccountType
  verificationLevel: VerificationLevel
  kycStatus: KycStatus
  trustScore: number
  twoFactorEnabled: boolean
  isEmailVerified: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  user: WqUser | null
  isAuthenticated: boolean
  isLoading: boolean
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
  role: UserRole
  username?: string
}

export interface AuthResponse {
  user: WqUser
  message: string
}

// ── Social Profile (Node-owned counts) ────────────────────────────────────────

export interface SocialProfile {
  wqUserId: string
  followersCount: number
  followingCount: number
  postsCount: number
}

// ── Business Entities (Spring-owned) ─────────────────────────────────────────

export interface Business {
  id: string
  wqOwnerId: string
  ownerName: string
  type: CompanyType
  name: string
  legalName?: string
  tagline: string
  description: string
  industry: string
  stage: StartupStage
  location: string
  website?: string
  logoUrl?: string
  coverImageUrl?: string
  linkedinUrl?: string
  twitterUrl?: string
  foundedYear?: number
  employeeCount?: number
  verificationLevel: VerificationLevel
  trustScore: number
  riskScore?: number
  fundingRaised?: number
  valuation?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Startup extends Business {
  type: "STARTUP"
  startupStage: StartupStage
  targetFunding?: number
  revenueModel?: string
  burnRate?: number
  monthlyRevenue?: number
  growthRate?: number
  teamSize?: number
  patentCount?: number
}

export interface Company extends Business {
  type: "EXISTING_COMPANY"
  registrationNumber?: string
  taxId?: string
  annualRevenue?: number
  profitMargin?: number
  marketCap?: number
}

// ── Investment (Spring-owned) ─────────────────────────────────────────────────

export interface FundraisingCampaign {
  id: string
  businessId: string
  businessName: string
  status: CampaignStatus
  targetAmount: number
  raisedAmount: number
  minInvestment: number
  maxInvestment?: number
  equityOffered: number
  sharePrice: number
  totalShares: number
  availableShares: number
  startDate: string
  endDate: string
  description?: string
  highlights?: string[]
  createdAt: string
  updatedAt: string
}

export interface Investment {
  id: string
  wqInvestorId: string
  businessId: string
  businessName: string
  campaignId: string
  amount: number
  shares: number
  equityPercentage: number
  sharePrice: number
  status: InvestmentStatus
  investedAt: string
  updatedAt: string
}

export interface Portfolio {
  totalInvested: number
  currentValue: number
  totalReturn: number
  returnPercentage: number
  holdings: Holding[]
}

export interface Holding {
  id: string
  businessId: string
  businessName: string
  businessLogoUrl?: string
  industry: string
  investedAmount: number
  currentValue: number
  shares: number
  equityPercentage: number
  investedAt: string
}

export interface CapTableEntry {
  id: string
  businessId: string
  wqHolderId: string
  holderName: string
  holderType: "FOUNDER" | "INVESTOR" | "EMPLOYEE" | "ADVISOR"
  shares: number
  shareClass: string
  equityPercentage: number
  investedAmount?: number
  grantDate: string
}

export interface WatchlistItem {
  id: string
  businessId: string
  businessName: string
  businessLogoUrl?: string
  industry: string
  stage: StartupStage
  addedAt: string
}

export interface Transaction {
  id: string
  wqUserId: string
  type: "CREDIT" | "DEBIT" | "INVESTMENT" | "REFUND" | "DISTRIBUTION"
  amount: number
  balanceAfter: number
  description: string
  referenceId?: string
  createdAt: string
}

// ── Markets (Spring-owned) ────────────────────────────────────────────────────

export interface Market {
  symbol: string
  name: string
  category: string
  description?: string
  currentValue?: number
  changePercent?: number
  changeValue?: number
  volume?: number
  marketCap?: number
  lastUpdated?: string
}

// ── Social / Community (Node-owned) ──────────────────────────────────────────

export interface Post {
  id: string
  wqAuthorId: string
  author: PostAuthor
  content: string
  mediaUrls: string[]
  videoUrl?: string
  postType: PostType
  visibility: Visibility
  communityId?: string
  communityName?: string
  hashtags: string[]
  mentions: string[]
  likesCount: number
  commentsCount: number
  sharesCount: number
  bookmarksCount: number
  isLiked: boolean
  isBookmarked: boolean
  createdAt: string
  updatedAt: string
}

export interface PostAuthor {
  wqUserId: string
  displayName: string
  username: string
  headline: string
  avatarUrl: string
  verificationLevel: VerificationLevel
}

export interface Comment {
  id: string
  postId: string
  wqAuthorId: string
  author: PostAuthor
  content: string
  likesCount: number
  isLiked: boolean
  parentCommentId?: string
  replies?: Comment[]
  createdAt: string
  updatedAt: string
}

export interface Community {
  id: string
  name: string
  slug: string
  description: string
  coverImageUrl?: string
  iconUrl?: string
  memberCount: number
  postCount: number
  isPrivate: boolean
  rules: CommunityRule[]
  categories: string[]
  createdBy: string
  isMember?: boolean
  isModeratorOrAdmin?: boolean
  createdAt: string
  updatedAt: string
}

export interface CommunityRule {
  id: string
  title: string
  description: string
  order: number
}

// ── Messaging (Node-owned) ────────────────────────────────────────────────────

export interface Conversation {
  id: string
  participantIds: string[]
  participants: ConversationParticipant[]
  lastMessage?: string
  lastMessageAt?: string
  unreadCount: number
  createdAt: string
}

export interface ConversationParticipant {
  wqUserId: string
  displayName: string
  avatarUrl: string
  username: string
}

export interface Message {
  id: string
  conversationId: string
  senderWqUserId: string
  sender: ConversationParticipant
  content: string
  isRead: boolean
  readAt?: string
  createdAt: string
}

// ── Notifications ─────────────────────────────────────────────────────────────

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  actorName?: string
  actorAvatarUrl?: string
  targetId?: string
  targetType?: string
  link?: string
  isRead: boolean
  source: "SOCIAL" | "INVESTMENT"
  createdAt: string
}

// ── API Wrapper ───────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  timestamp: string
}

export interface PagedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}

// ── Dashboard / Analytics ─────────────────────────────────────────────────────

export interface InvestorDashboardStats {
  totalInvested: number
  currentPortfolioValue: number
  totalReturn: number
  returnPercentage: number
  activeInvestments: number
  watchlistCount: number
  recentTransactions: Transaction[]
}

export interface CompanyDashboardStats {
  totalFundsRaised: number
  activeInvestors: number
  campaignProgress: number
  trustScore: number
  verificationLevel: VerificationLevel
  activeCampaigns: FundraisingCampaign[]
}

export interface PlatformStats {
  totalStartups: number
  totalInvestors: number
  totalFounders: number
  totalFundsRaised: number
  totalInvestments: number
  totalCommunityMembers: number
}

// ── Verification ──────────────────────────────────────────────────────────────

export interface KycVerification {
  id: string
  wqUserId: string
  status: KycStatus
  documentType: string
  documentUrl: string
  selfieUrl?: string
  rejectionReason?: string
  submittedAt: string
  reviewedAt?: string
}

// ── Search ────────────────────────────────────────────────────────────────────

export interface SearchResults {
  users: WqUser[]
  startups: Startup[]
  companies: Company[]
  posts: Post[]
  communities: Community[]
  total: number
}

export interface SearchFilters {
  query: string
  type?: "users" | "startups" | "companies" | "posts" | "communities" | "all"
  industry?: string
  stage?: StartupStage
  verificationLevel?: VerificationLevel
  page?: number
  size?: number
}
