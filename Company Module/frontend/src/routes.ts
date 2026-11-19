import { type RouteConfig, index, route } from "@react-router/dev/routes"

export default [
  // ── 1. Corporate Home Page ────────────────────────────────────────────────
  index("app/page.tsx"),

  // ── 2. About White Quantex Portal ─────────────────────────────────────────
  route("about", "app/about/page.tsx"),

  // ── 3. Account Auth (Email Signup & Login) ────────────────────────────────
  route("signup", "app/signup/page.tsx"),
  route("create-account", "app/signup/page.tsx", { id: "create-account-alias" }),
  route("login", "app/login/page.tsx"),

  // ── 4. Registration Hub & Onboarding ──────────────────────────────────────
  route("register", "app/register/page.tsx"),
  route("register/company", "app/register/company/page.tsx"),
  route("register/venture", "app/register/venture/page.tsx"),

  // ── 5. Corporate Quarterly Financials & Earnings Filing ────────────────────
  route("financials", "app/financials/page.tsx"),

  // ── 6. Corporate & Venture Community Milestone Publisher ───────────────────
  route("post", "app/post/page.tsx"),
  route("publisher", "app/post/page.tsx", { id: "publisher-alias" }),
  route("community-post", "app/post/page.tsx", { id: "community-post-alias" }),

  // ── 7. Confirmation ───────────────────────────────────────────────────────
  route("registration-success", "app/registration-success/page.tsx"),

  // ── 8. Catch-all 404 ──────────────────────────────────────────────────────
  route("*", "app/not-found/page.tsx"),
] satisfies RouteConfig
