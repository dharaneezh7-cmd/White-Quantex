import { type RouteConfig, index, route } from "@react-router/dev/routes"

export default [
  // ── Landing ─────────────────────────────────────────────────────────────
  index("app/page.tsx"),

  // ── Main Public Navigation ───────────────────────────────────────────────
  route("home", "app/page.tsx", { id: "home-page" }),
  route("explore", "app/explore/page.tsx"),
  route("venture", "app/ventures/page.tsx", { id: "venture-page" }),
  route("ventures", "app/ventures/page.tsx"),
  route("markets", "app/markets/page.tsx"),
  route("market", "app/markets/page.tsx", { id: "market-alias" }),
  route("marketspage", "app/markets/page.tsx", { id: "marketspage-alias" }),
  route("markets/:symbol", "app/markets/[symbol]/page.tsx", { id: "markets-symbol" }),
  route("holdings", "app/holdings/page.tsx"),
  route("holding", "app/holdings/page.tsx", { id: "holding-alias" }),
  route("community", "app/community/page.tsx"),
  route("community/:communityId", "app/community/[communityId]/page.tsx"),
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
  route("verification/company", "app/verification/company/page.tsx"),
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
