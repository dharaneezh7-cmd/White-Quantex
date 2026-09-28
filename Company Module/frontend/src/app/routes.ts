import { type RouteConfig, index, route } from "@react-router/dev/routes"

export default [
  // Landing / Company Registration Hub
  index("app/page.tsx"),

  // Registration Routes
  route("register/company", "app/register/company/page.tsx"),
  route("register/venture", "app/register/venture/page.tsx"),

  // Success
  route("registration-success", "app/registration-success/page.tsx"),

  // Catch-all
  route("*", "app/not-found/page.tsx"),
] satisfies RouteConfig
