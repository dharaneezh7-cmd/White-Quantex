import { nodeApi } from "@/services/api/client"
import { useAuthStore } from "@/stores/auth-store"
import { Post, Comment, Community, ApiResponse, PagedResponse } from "@/types"

export interface CommunityMember {
  id: string
  wqUserId?: string
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

  /**
   * Algorithmic recommendation feed tailored to user activity & preferred topics/types.
   * Changes dynamically whenever page is refreshed or refreshSeed is updated.
   */
  async getSuggestedFeed(
    page = 0,
    size = 20,
    options: { refreshSeed?: string | number; filter?: string; query?: string } = {}
  ): Promise<PagedResponse<Post> & {
    refreshSeed?: string
    topTags?: Array<{ tag: string; score: number }>
    topPostTypes?: Array<{ type: string; score: number }>
    hasPersonalization?: boolean
  }> {
    const params = new URLSearchParams()
    params.set("page", String(page))
    params.set("size", String(size))
    if (options.refreshSeed) params.set("refreshSeed", String(options.refreshSeed))
    if (options.filter) params.set("filter", options.filter)
    if (options.query) params.set("query", options.query)

    const res = await nodeApi.get<ApiResponse<any>>(`/posts/suggested?${params.toString()}`)
    return res.data.data
  },

  /**
   * Track specific user action (VIEW, CLICK, LIKE, COMMENT, BOOKMARK, SHARE, PROFILE_VIEW)
   */
  async trackActivity(
    postId: string,
    data: {
      activityType: "VIEW" | "CLICK" | "LIKE" | "COMMENT" | "BOOKMARK" | "SHARE" | "PROFILE_VIEW" | string
      postType?: string
      hashtags?: string[]
      authorId?: string
      authorAccountType?: string
      communityId?: string
    }
  ): Promise<void> {
    const { isAuthenticated, user } = useAuthStore.getState()
    if (!isAuthenticated || !user) {
      // If user is not logged in, do not track user activity
      return
    }

    try {
      await nodeApi.post(`/posts/${postId}/activity`, data)
    } catch {
      // Non-blocking background telemetry
    }
  },

  /**
   * Batch track view impressions
   */
  async trackBatchActivities(
    activities: Array<{
      postId?: string
      activityType: string
      postType?: string
      hashtags?: string[]
      authorId?: string
      communityId?: string
    }>
  ): Promise<void> {
    const { isAuthenticated, user } = useAuthStore.getState()
    if (!isAuthenticated || !user) {
      // If user is not logged in, do not track user activity
      return
    }

    try {
      await nodeApi.post("/posts/activity/batch", { activities })
    } catch {
      // Non-blocking background telemetry
    }
  },

  /**
   * Retrieve user interest profile and top preferences
   */
  async getUserInterestProfile(): Promise<{
    topTags: Array<{ tag: string; score: number }>
    topPostTypes: Array<{ type: string; score: number }>
    totalInteractionsCount: number
    lastActiveAt?: string
    isAnonymous: boolean
  }> {
    const res = await nodeApi.get<ApiResponse<any>>("/posts/user/interest-profile")
    return res.data.data
  },

  async getPostById(id: string): Promise<Post> {
    const res = await nodeApi.get<ApiResponse<Post>>(`/posts/${id}`)
    return res.data.data
  },

  async createPost(data: {
    content: string
    mediaUrls?: string[]
    visibility?: "PUBLIC" | "PROTECTED" | "PRIVATE" | string
    communityId?: string
    postType?: string
  }): Promise<Post> {
    const res = await nodeApi.post<ApiResponse<Post>>("/posts", data)
    return res.data.data
  },

  async updatePost(
    postId: string,
    data: {
      content?: string
      mediaUrls?: string[]
      visibility?: "PUBLIC" | "PROTECTED" | "PRIVATE" | string
      postType?: string
    }
  ): Promise<Post> {
    const res = await nodeApi.put<ApiResponse<Post>>(`/posts/${postId}`, data)
    return res.data.data
  },

  async deletePost(postId: string): Promise<void> {
    await nodeApi.delete(`/posts/${postId}`)
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

  async deleteComment(postId: string, commentId: string): Promise<void> {
    await nodeApi.delete(`/posts/${postId}/comments/${commentId}`)
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

  async updateCommunity(
    communityId: string,
    data: {
      description?: string
      category?: string
      isPrivate?: boolean
      rules?: string[]
    }
  ): Promise<Community> {
    const res = await nodeApi.put<ApiResponse<Community>>(`/communities/${communityId}`, data)
    return res.data.data
  },

  async deleteCommunity(communityId: string): Promise<void> {
    await nodeApi.delete(`/communities/${communityId}`)
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

  async getFollowingList(): Promise<string[]> {
    const res = await nodeApi.get<ApiResponse<{ followingIds: string[] }>>("/follows")
    return res.data?.data?.followingIds || []
  },

  async getFollowStatus(userId: string): Promise<{ isFollowing: boolean; followersCount: number }> {
    const res = await nodeApi.get<ApiResponse<{ isFollowing: boolean; followersCount: number }>>(
      `/follows/${userId}/status`
    )
    return res.data.data
  },

  async followUser(userId: string): Promise<{ isFollowing: boolean; followersCount: number }> {
    const res = await nodeApi.post<ApiResponse<{ isFollowing: boolean; followersCount: number }>>(
      `/follows/${userId}`
    )
    return res.data.data
  },

  async unfollowUser(userId: string): Promise<{ isFollowing: boolean; followersCount: number }> {
    const res = await nodeApi.delete<ApiResponse<{ isFollowing: boolean; followersCount: number }>>(
      `/follows/${userId}`
    )
    return res.data.data
  },
}
