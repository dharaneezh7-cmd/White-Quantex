import { type RouteConfig, index, route } from "@react-router/dev/routes"

export default [
  // ── Landing ─────────────────────────────────────────────────────────────
  index("app/page.tsx"),

  // ── Main Public Navigation ───────────────────────────────────────────────
  route("home", "app/home/page.tsx"),
  route("explore", "app/explore/page.tsx"),
  route("ventures", "app/ventures/page.tsx"),
  route("markets", "app/markets/page.tsx"),
  route("markets/:symbol", "app/markets/[symbol]/page.tsx", { id: "markets-symbol" }),
  route("community", "app/community/page.tsx"),
  route("community/:communityId", "app/community/[communityId]/page.tsx"),
  route("community/:communityId/post/:postId", "app/community/[communityId]/post/[postId]/page.tsx"),
  route("learn", "app/learn/page.tsx"),
  route("learn/articles", "app/learn/articles/page.tsx"),
  route("learn/articles/:id", "app/learn/articles/[id]/page.tsx"),
  route("learn/courses", "app/learn/courses/page.tsx"),
  route("learn/courses/:id", "app/learn/courses/[id]/page.tsx"),
  route("learn/documents", "app/learn/documents/page.tsx"),
  route("learn/progress", "app/learn/progress/page.tsx"),
  route("learn/quizzes", "app/learn/quizzes/page.tsx"),
  route("learn/registration-guide", "app/learn/registration-guide/page.tsx"),
  route("learn/roadmap", "app/learn/roadmap/page.tsx"),
  route("learn/stories", "app/learn/stories/page.tsx"),
  route("learn/tools", "app/learn/tools/page.tsx"),
  route("learn/videos", "app/learn/videos/page.tsx"),
  route("learn/:topic", "app/learn/page.tsx", { id: "learn-topic" }),
  route("jobs", "app/jobs/page.tsx"),
  route("events", "app/events/page.tsx"),
  route("search", "app/search/page.tsx"),
  route("categories", "app/categories/page.tsx"),

  // ── Venture & Company Routes ─────────────────────────────────────────────
  route("startups", "app/explore/page.tsx", { id: "venture-startups" }),
  route("startups/:id", "app/startups/[id]/page.tsx"),
  route("companies", "app/explore/page.tsx", { id: "venture-companies" }),
  route("companies/:id", "app/companies/[id]/page.tsx"),
  route("companies/:id/investment", "app/companies/[id]/investment/page.tsx"),
  route("founders", "app/founders/page.tsx"),
  route("founders/:id", "app/founders/[id]/page.tsx"),
  route("investors", "app/investors/page.tsx"),
  route("investors/:id", "app/investors/[id]/page.tsx"),

  // ── Auth Routes ──────────────────────────────────────────────────────────
  route("login", "app/(auth)/login/page.tsx"),
  route("register", "app/(auth)/register/page.tsx"),
  route("forgot-password", "app/(auth)/forgot-password/page.tsx"),
  route("reset-password", "app/(auth)/reset-password/page.tsx"),
  route("verify-otp", "app/(auth)/verify-otp/page.tsx"),
  route("verify-email", "app/(auth)/verify-email/page.tsx"),
  route("two-factor", "app/(auth)/two-factor/page.tsx"),

  // ── Authenticated Application Routes ────────────────────────────────────
  route("dashboard", "app/dashboard/page.tsx"),
  route("dashboard/admin", "app/dashboard/admin/page.tsx"),
  route("profile", "app/profile/page.tsx"),
  route("profile/saved", "app/profile/saved/page.tsx"),
  route("profile/activity", "app/profile/activity/page.tsx"),
  route("messages", "app/messages/page.tsx"),
  route("notifications", "app/notifications/page.tsx"),
  route("settings", "app/settings/page.tsx"),

  // ── Verification Routes ──────────────────────────────────────────────────
  route("verification", "app/verification/page.tsx"),
  route("verification/admin", "app/verification/admin/page.tsx"),
  route("verification/founder", "app/verification/founder/page.tsx"),
  route("verification/investor", "app/verification/investor/page.tsx"),

  // ── Informational Pages ──────────────────────────────────────────────────
  route("about", "app/about/page.tsx"),
  route("contact", "app/contact/page.tsx"),
  route("help", "app/help/page.tsx"),
  route("privacy", "app/privacy/page.tsx"),
  route("terms", "app/terms/page.tsx"),
  route("cookie-policy", "app/cookie-policy/page.tsx"),
  route("community-guidelines", "app/community-guidelines/page.tsx"),

  // ── Catch-all ────────────────────────────────────────────────────────────
  route("*", "app/not-found/page.tsx"),
] satisfies RouteConfig
