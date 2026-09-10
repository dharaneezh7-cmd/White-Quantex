import { nodeApi } from "@/services/api/client"
import { Post, Comment, Community, ApiResponse, PagedResponse } from "@/types"

export const communityService = {
  async getFeed(page = 0, size = 10): Promise<PagedResponse<Post>> {
    const res = await nodeApi.get<ApiResponse<PagedResponse<Post>>>(`/posts?page=${page}&size=${size}`)
    return res.data.data
  },

  async getPostById(id: string): Promise<Post> {
    const res = await nodeApi.get<ApiResponse<Post>>(`/posts/${id}`)
    return res.data.data
  },

  async createPost(data: { content: string; mediaUrls?: string[]; visibility?: string; communityId?: string }): Promise<Post> {
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

  async createCommunity(data: { name: string; description: string; category?: string; isPrivate?: boolean }): Promise<Community> {
    const res = await nodeApi.post<ApiResponse<Community>>("/communities", data)
    return res.data.data
  },

  async followUser(userId: string): Promise<void> {
    await nodeApi.post(`/follows/${userId}`)
  },

  async unfollowUser(userId: string): Promise<void> {
    await nodeApi.delete(`/follows/${userId}`)
  },
}
