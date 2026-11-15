import { Post } from "../models/Post.mjs"
import { Like } from "../models/Like.mjs"
import { Bookmark } from "../models/Bookmark.mjs"
import { Comment } from "../models/Comment.mjs"
import { Community } from "../models/Community.mjs"
import { UserActivity } from "../models/UserActivity.mjs"
import { UserInterestProfile } from "../models/UserInterestProfile.mjs"

// Activity weights
const ACTIVITY_WEIGHTS = {
  COMMENT: 5.0,
  BOOKMARK: 4.0,
  SHARE: 3.5,
  LIKE: 3.0,
  CLICK: 2.0,
  PROFILE_VIEW: 2.0,
  POST_CREATE: 4.0,
  VIEW: 0.5,
}

// Pseudo-random hash for deterministic jitter per refresh seed & post ID
function pseudoRandom(str) {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return ((h >>> 0) % 10000) / 10000
}

export const recommendationService = {
  /**
   * Record a single user activity and update their interest profile
   */
  async recordActivity({
    wqUserId,
    activityType,
    postId,
    postType,
    hashtags = [],
    authorId,
    authorAccountType = "INDIVIDUAL",
    communityId,
    weight,
    metadata,
  }) {
    if (!wqUserId) return null

    const resolvedWeight = weight || ACTIVITY_WEIGHTS[activityType] || 1.0

    // 1. Create activity record
    const activity = await UserActivity.create({
      wqUserId,
      activityType,
      postId: postId ? postId : undefined,
      postType: postType || "TEXT",
      hashtags: Array.isArray(hashtags) ? hashtags.map((h) => h.toLowerCase().replace("#", "")) : [],
      authorId,
      authorAccountType,
      communityId,
      weight: resolvedWeight,
      metadata,
    })

    // 2. Incrementally update UserInterestProfile
    try {
      let profile = await UserInterestProfile.findOne({ wqUserId })
      if (!profile) {
        profile = new UserInterestProfile({
          wqUserId,
          tagWeights: new Map(),
          postTypeWeights: new Map(),
          authorWeights: new Map(),
          accountTypeWeights: new Map(),
          communityWeights: new Map(),
          recentlyViewedPostIds: [],
          totalInteractionsCount: 0,
        })
      }

      // Update tag weights
      if (Array.isArray(hashtags) && hashtags.length > 0) {
        hashtags.forEach((tag) => {
          const cleanTag = tag.toLowerCase().replace("#", "").trim()
          if (!cleanTag) return
          const cur = profile.tagWeights.get(cleanTag) || 0
          profile.tagWeights.set(cleanTag, Number((cur + resolvedWeight).toFixed(2)))
        })
      }

      // Update post type weight
      if (postType) {
        const curType = profile.postTypeWeights.get(postType) || 0
        profile.postTypeWeights.set(postType, Number((curType + resolvedWeight).toFixed(2)))
      }

      // Update author weight
      if (authorId && authorId !== wqUserId) {
        const curAuthor = profile.authorWeights.get(authorId) || 0
        profile.authorWeights.set(authorId, Number((curAuthor + resolvedWeight).toFixed(2)))
      }

      // Update account type weight
      if (authorAccountType) {
        const curAcc = profile.accountTypeWeights.get(authorAccountType) || 0
        profile.accountTypeWeights.set(authorAccountType, Number((curAcc + resolvedWeight).toFixed(2)))
      }

      // Update community weight
      if (communityId) {
        const curComm = profile.communityWeights.get(communityId) || 0
        profile.communityWeights.set(communityId, Number((curComm + resolvedWeight).toFixed(2)))
      }

      // If view or click, add to recentlyViewedPostIds (keep maximum 60 items)
      if (postId && (activityType === "VIEW" || activityType === "CLICK")) {
        const pidStr = postId.toString()
        const recent = profile.recentlyViewedPostIds || []
        const filtered = recent.filter((id) => id !== pidStr)
        filtered.push(pidStr)
        if (filtered.length > 60) {
          filtered.splice(0, filtered.length - 60)
        }
        profile.recentlyViewedPostIds = filtered
      }

      profile.totalInteractionsCount = (profile.totalInteractionsCount || 0) + 1
      profile.lastActiveAt = new Date()

      await profile.save()
    } catch (err) {
      console.error("[Recommendation] Error updating user interest profile:", err.message)
    }

    return activity
  },

  /**
   * Record multiple activities (e.g. view impressions batch)
   */
  async recordBatchActivities(wqUserId, activities = []) {
    if (!wqUserId || !Array.isArray(activities) || activities.length === 0) return

    for (const act of activities) {
      await this.recordActivity({
        wqUserId,
        ...act,
      })
    }
  },

  /**
   * Get or bootstrap User Interest Profile
   */
  async getUserProfile(wqUserId) {
    if (!wqUserId) return null

    let profile = await UserInterestProfile.findOne({ wqUserId })
    if (profile) return profile

    // Bootstrap profile from existing likes, bookmarks, and comments in database
    profile = new UserInterestProfile({
      wqUserId,
      tagWeights: new Map(),
      postTypeWeights: new Map(),
      authorWeights: new Map(),
      accountTypeWeights: new Map(),
      communityWeights: new Map(),
      recentlyViewedPostIds: [],
      totalInteractionsCount: 0,
    })

    try {
      const [userLikes, userBookmarks, userComments] = await Promise.all([
        Like.find({ wqUserId, targetType: "POST" }).lean(),
        Bookmark.find({ wqUserId }).lean(),
        Comment.find({ wqAuthorId: wqUserId, isDeleted: false }).lean(),
      ])

      const likedPostIds = userLikes.map((l) => l.targetId)
      const bookmarkedPostIds = userBookmarks.map((b) => b.postId)
      const commentedPostIds = userComments.map((c) => c.postId)

      const allInteractedIds = [...new Set([...likedPostIds, ...bookmarkedPostIds, ...commentedPostIds])]
      if (allInteractedIds.length > 0) {
        const posts = await Post.find({ _id: { $in: allInteractedIds } }).lean()
        posts.forEach((p) => {
          const hashtags = p.hashtags || []
          hashtags.forEach((t) => {
            const clean = t.toLowerCase().replace("#", "")
            const cur = profile.tagWeights.get(clean) || 0
            profile.tagWeights.set(clean, cur + 3)
          })
          if (p.postType) {
            const curType = profile.postTypeWeights.get(p.postType) || 0
            profile.postTypeWeights.set(p.postType, curType + 2)
          }
          if (p.wqAuthorId) {
            const curA = profile.authorWeights.get(p.wqAuthorId) || 0
            profile.authorWeights.set(p.wqAuthorId, curA + 2)
          }
          if (p.authorAccountType) {
            const curAcc = profile.accountTypeWeights.get(p.authorAccountType) || 0
            profile.accountTypeWeights.set(p.authorAccountType, curAcc + 2)
          }
        })
        profile.totalInteractionsCount = allInteractedIds.length
      }

      await profile.save()
    } catch (err) {
      console.error("[Recommendation] Error bootstrapping profile:", err.message)
    }

    return profile
  },

  /**
   * Recommendation Algorithm: Suggest new & personalized posts for user
   * Incorporates:
   * 1. Topic/Hashtag Affinity
   * 2. Post Format/Type Preference
   * 3. Author/Account Affinity
   * 4. Social Proof & Engagement Quality
   * 5. Recency Decay
   * 6. Anti-fatigue / Novelty bonus on previously viewed posts
   * 7. Refresh Seed Jitter (dynamic variety upon every page refresh)
   */
  async getSuggestedPosts({
    wqUserId,
    page = 0,
    size = 15,
    refreshSeed = Date.now().toString(),
    filter,
    query,
  }) {
    // 1. Get or bootstrap user profile
    const profile = wqUserId ? await this.getUserProfile(wqUserId) : null

    // 2. Build base candidate filter
    let visibilityFilter
    if (!wqUserId) {
      visibilityFilter = { visibility: "PUBLIC" }
    } else {
      const userJoinedCommunities = await Community.find({ members: wqUserId }).select("_id").lean()
      const userJoinedCommIds = userJoinedCommunities.map((c) => c._id.toString())

      visibilityFilter = {
        $or: [
          { visibility: "PUBLIC" },
          { wqAuthorId: wqUserId },
          {
            visibility: { $in: ["PROTECTED", "FOLLOWERS"] },
            $or: [
              { communityId: { $in: [null, "", undefined] } },
              { communityId: { $in: userJoinedCommIds } },
            ],
          },
        ],
      }
    }

    const baseFilter = {
      isDeleted: false,
      ...visibilityFilter,
    }

    if (filter === "companies") {
      baseFilter.authorAccountType = "COMPANY"
    } else if (filter === "ventures") {
      baseFilter.authorAccountType = "VENTURE"
    } else if (filter === "my_posts" && wqUserId) {
      baseFilter.wqAuthorId = wqUserId
    }

    if (query && query.trim()) {
      const regex = { $regex: query.trim(), $options: "i" }
      baseFilter.$or = [
        { content: regex },
        { authorName: regex },
        { authorHeadline: regex },
        { hashtags: regex },
      ]
    }

    // 3. Fetch candidate pool (up to 200 posts)
    const candidatePosts = await Post.find(baseFilter)
      .sort({ createdAt: -1 })
      .limit(200)
      .lean()

    if (candidatePosts.length === 0) {
      return {
        posts: [],
        totalElements: 0,
        refreshSeed,
        topTags: [],
        topPostTypes: [],
      }
    }

    // Convert profile weights to plain lookup objects
    const tagWeights = profile?.tagWeights ? Object.fromEntries(profile.tagWeights) : {}
    const postTypeWeights = profile?.postTypeWeights ? Object.fromEntries(profile.postTypeWeights) : {}
    const authorWeights = profile?.authorWeights ? Object.fromEntries(profile.authorWeights) : {}
    const accountTypeWeights = profile?.accountTypeWeights ? Object.fromEntries(profile.accountTypeWeights) : {}
    const communityWeights = profile?.communityWeights ? Object.fromEntries(profile.communityWeights) : {}
    const recentlyViewedSet = new Set(profile?.recentlyViewedPostIds || [])

    const hasUserHistory = profile && profile.totalInteractionsCount > 0
    const now = Date.now()

    // 4. Score each candidate post
    const scoredCandidates = candidatePosts.map((post) => {
      const pid = post._id.toString()
      const postTags = (post.hashtags || []).map((t) => t.toLowerCase().replace("#", "").trim())
      const pType = post.postType || "TEXT"
      const authorId = post.wqAuthorId
      const accountType = post.authorAccountType || "INDIVIDUAL"
      const commId = post.communityId

      // A. Topic Affinity
      let topicScore = 0
      let matchedTag = ""
      postTags.forEach((tag) => {
        const weight = tagWeights[tag] || 0
        if (weight > 0) {
          topicScore += weight
          if (!matchedTag || weight > (tagWeights[matchedTag] || 0)) {
            matchedTag = tag
          }
        }
      })

      // B. Post Type Preference
      const typeScore = postTypeWeights[pType] || 0

      // C. Author & Entity Affinity
      const authorScore = (authorWeights[authorId] || 0) + (accountTypeWeights[accountType] || 0)

      // D. Community Affinity
      const commScore = commId ? (communityWeights[commId] || 0) : 0

      // E. Engagement Quality Score
      const likes = post.likesCount || 0
      const comments = post.commentsCount || 0
      const bookmarks = post.bookmarksCount || 0
      const shares = post.sharesCount || 0
      const rawEngagement = likes * 1.5 + comments * 3.0 + bookmarks * 2.0 + shares * 2.5
      const engagementScore = Math.log10(1 + rawEngagement) * 6.0

      // F. Verification Level Bonus
      let verificationBoost = 0
      const level = (post.authorVerificationLevel || "").toUpperCase()
      if (level === "PLATINUM") verificationBoost = 3.0
      else if (level === "GOLD") verificationBoost = 2.0
      else if (level === "SILVER") verificationBoost = 1.0

      // G. Recency Decay (exponential decay over time)
      const hoursAgo = Math.max(0, (now - new Date(post.createdAt).getTime()) / 3600000)
      const recencyScore = Math.exp(-0.015 * hoursAgo) * 8.0 // Fresh posts get up to +8 pts

      // H. Novelty / Anti-Fatigue Modifier
      // Posts shown in recent sessions get downweighted so refreshing shows new items!
      const wasRecentlyViewed = recentlyViewedSet.has(pid)
      const noveltyModifier = wasRecentlyViewed ? 0.35 : 1.0

      // I. Refresh Seed Jitter & Dynamic Diversity
      // Generates a dynamic offset between -4.0 and +4.0 specific to this (refreshSeed + post)
      // This ensures that refreshing the page dynamically rotates candidates!
      const jitterFactor = (pseudoRandom(`${refreshSeed}_${pid}`) - 0.5) * 8.0

      // Composite Personalized Score Calculation
      let compositeScore = 0
      if (hasUserHistory) {
        compositeScore =
          (topicScore * 2.5 +
            typeScore * 1.5 +
            authorScore * 1.8 +
            commScore * 1.2 +
            engagementScore * 1.0 +
            verificationBoost +
            recencyScore) *
            noveltyModifier +
          jitterFactor
      } else {
        // Cold start (new user): quality + recency + diversity jitter
        compositeScore =
          (engagementScore * 2.0 + verificationBoost * 1.5 + recencyScore * 2.0) * noveltyModifier +
          jitterFactor
      }

      // Generate human-friendly recommendation reason
      let recommendationReason = "Suggested for you"
      if (matchedTag) {
        recommendationReason = `Based on your interest in #${matchedTag}`
      } else if (typeScore > 3 && pType !== "TEXT") {
        recommendationReason = `Matches your preference for ${pType.toLowerCase()} posts`
      } else if (authorScore > 4) {
        recommendationReason = `From an entity you interact with`
      } else if (engagementScore > 10) {
        recommendationReason = postTags[0] ? `Trending in #${postTags[0]}` : "Trending in Community"
      } else if (hoursAgo < 12) {
        recommendationReason = postTags[0] ? `Fresh insight in #${postTags[0]}` : "Fresh Community Update"
      } else if (verificationBoost >= 2.0) {
        recommendationReason = "High-reputation verified dispatch"
      }

      return {
        ...post,
        recommendationScore: Number(compositeScore.toFixed(3)),
        recommendationReason,
        matchedTag: matchedTag || (postTags[0] || ""),
      }
    })

    // 5. Sort candidates by composite recommendation score descending
    scoredCandidates.sort((a, b) => b.recommendationScore - a.recommendationScore)

    // 6. Pagination
    const startIndex = page * size
    const paginatedPosts = scoredCandidates.slice(startIndex, startIndex + size)

    // 7. Update recentlyViewedPostIds with this batch for anti-fatigue on subsequent refreshes
    if (wqUserId && profile && paginatedPosts.length > 0) {
      const shownIds = paginatedPosts.map((p) => p._id.toString())
      const currentRecent = profile.recentlyViewedPostIds || []
      const mergedRecent = [...new Set([...currentRecent, ...shownIds])]
      if (mergedRecent.length > 60) {
        mergedRecent.splice(0, mergedRecent.length - 60)
      }
      profile.recentlyViewedPostIds = mergedRecent
      await profile.save().catch((err) => console.error("[Recommendation] Save recent error:", err.message))
    }

    // Top tags & types for user visibility
    const sortedTags = Object.entries(tagWeights)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, score]) => ({ tag, score }))

    const sortedTypes = Object.entries(postTypeWeights)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type, score]) => ({ type, score }))

    return {
      posts: paginatedPosts,
      totalElements: scoredCandidates.length,
      refreshSeed,
      topTags: sortedTags,
      topPostTypes: sortedTypes,
      hasPersonalization: hasUserHistory,
    }
  },
}
