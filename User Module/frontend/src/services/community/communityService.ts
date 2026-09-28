import { nodeApi } from "@/services/api/client"
import { Post, Comment, Community, ApiResponse, PagedResponse } from "@/types"

export interface CommunityMember {
  id: string
  name: string
  username: string
  headline: string
  bio?: string
  location: string
  avatar: string
  avatarUrl?: string
  followersCount: number
  followingCount: number
  role: "FOUNDER" | "INVESTOR"
  verificationLevel: "PLATINUM" | "GOLD" | "SILVER" | string
  trustScore: number
  portfolioOrVenture?: string
}

export interface CommunityNotification {
  id: string
  type: "LIKE" | "COMMENT" | "FOLLOW" | "VENTURE" | "VERIFICATION" | "SYSTEM" | string
  actor: {
    name: string
    avatar: string
    role: string
  }
  message: string
  targetId?: string
  time: string
  read: boolean
}

export const communityService = {
  async getFeed(
    page = 0,
    size = 10,
    options: { communityId?: string; tag?: string; query?: string } = {}
  ): Promise<PagedResponse<Post>> {
    const params = new URLSearchParams()
    params.set("page", String(page))
    params.set("size", String(size))
    if (options.communityId) params.set("communityId", options.communityId)
    if (options.tag) params.set("tag", options.tag)
    if (options.query) params.set("query", options.query)

    const res = await nodeApi.get<ApiResponse<PagedResponse<Post>>>(`/posts?${params.toString()}`)
    return res.data.data
  },

  async getPostById(id: string): Promise<Post> {
    const res = await nodeApi.get<ApiResponse<Post>>(`/posts/${id}`)
    return res.data.data
  },

  async createPost(data: {
    content: string
    mediaUrls?: string[]
    visibility?: string
    communityId?: string
    postType?: string
  }): Promise<Post> {
    const res = await nodeApi.post<ApiResponse<Post>>("/posts", data)
    return res.data.data
  },

  async likePost(postId: string): Promise<void> {
    await nodeApi.post(`/posts/${postId}/like`)
  },

  async unlikePost(postId: string): Promise<void> {
    await nodeApi.delete(`/posts/${postId}/like`)
  },

  async bookmarkPost(postId: string): Promise<void> {
    await nodeApi.post(`/posts/${postId}/bookmark`)
  },

  async unbookmarkPost(postId: string): Promise<void> {
    await nodeApi.delete(`/posts/${postId}/bookmark`)
  },

  async getComments(postId: string): Promise<Comment[]> {
    const res = await nodeApi.get<ApiResponse<Comment[]>>(`/posts/${postId}/comments`)
    return res.data.data
  },

  async addComment(postId: string, content: string): Promise<Comment> {
    const res = await nodeApi.post<ApiResponse<Comment>>(`/posts/${postId}/comments`, { content })
    return res.data.data
  },

  async getCommunities(): Promise<Community[]> {
    const res = await nodeApi.get<ApiResponse<Community[]>>("/communities")
    return res.data.data
  },

  async getCommunityById(id: string): Promise<Community> {
    const res = await nodeApi.get<ApiResponse<Community>>(`/communities/${id}`)
    return res.data.data
  },

  async createCommunity(data: {
    name: string
    description: string
    category?: string
    isPrivate?: boolean
    rules?: string[]
  }): Promise<Community> {
    const res = await nodeApi.post<ApiResponse<Community>>("/communities", data)
    return res.data.data
  },

  async joinCommunity(communityId: string): Promise<{ isJoined: boolean; memberCount: number }> {
    const res = await nodeApi.post<ApiResponse<{ isJoined: boolean; memberCount: number }>>(
      `/communities/${communityId}/join`
    )
    return res.data.data
  },

  async leaveCommunity(communityId: string): Promise<{ isJoined: boolean; memberCount: number }> {
    const res = await nodeApi.delete<ApiResponse<{ isJoined: boolean; memberCount: number }>>(
      `/communities/${communityId}/join`
    )
    return res.data.data
  },

  async getMembers(role = "all", query = ""): Promise<CommunityMember[]> {
    const params = new URLSearchParams()
    if (role && role !== "all") params.set("role", role)
    if (query) params.set("query", query)

    const res = await nodeApi.get<ApiResponse<CommunityMember[]>>(`/members?${params.toString()}`)
    return res.data.data
  },

  async getNotifications(filter = "all"): Promise<CommunityNotification[]> {
    const res = await nodeApi.get<ApiResponse<CommunityNotification[]>>(`/notifications?filter=${filter}`)
    return res.data.data
  },

  async markNotificationRead(id: string): Promise<void> {
    await nodeApi.patch(`/notifications/${id}/read`)
  },

  async markAllNotificationsRead(): Promise<void> {
    await nodeApi.post("/notifications/read-all")
  },

  async followUser(userId: string): Promise<void> {
    await nodeApi.post(`/follows/${userId}`)
  },

  async unfollowUser(userId: string): Promise<void> {
    await nodeApi.delete(`/follows/${userId}`)
  },
}
