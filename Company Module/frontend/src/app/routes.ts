import { type RouteConfig, index, route } from "@react-router/dev/routes"

export default [
  // Landing / Company Registration Hub
  index("app/page.tsx"),

  // Registration Routes
  route("register", "app/register/page.tsx"),
  route("register/company", "app/register/company/page.tsx"),
  route("register/venture", "app/register/venture/page.tsx"),

  // Company & Venture Post Publisher
  route("post", "app/post/page.tsx"),
  route("publisher", "app/post/page.tsx"),
  route("community-post", "app/post/page.tsx"),

  // 3-Month Quarterly Financials & Earnings
  route("financials", "app/financials/page.tsx"),

  // Success
  route("registration-success", "app/registration-success/page.tsx"),

  // Catch-all
  route("*", "app/not-found/page.tsx"),
] satisfies RouteConfig
