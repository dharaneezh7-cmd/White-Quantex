export function extractUser(req) {
  const userId = req.headers["x-wq-user-id"] || req.headers["x-user-id"]
  
  if (!userId || userId === "undefined" || userId === "null" || userId.trim() === "") {
    return null
  }

  const email = req.headers["x-wq-user-email"] || req.headers["x-user-email"] || ""
  const name = req.headers["x-wq-user-name"] || req.headers["x-user-name"] || ""
  const username = req.headers["x-wq-user-username"] || req.headers["x-user-username"] || (email ? email.split("@")[0] : "user")
  const avatarUrl = req.headers["x-wq-user-avatar"] || req.headers["x-user-avatar"] || ""
  const headline = req.headers["x-wq-user-headline"] || req.headers["x-user-headline"] || "Verified Ecosystem Member"
  const role = req.headers["x-wq-user-role"] || req.headers["x-user-role"] || "FOUNDER"
  const accountType = req.headers["x-wq-user-account-type"] || req.headers["x-user-account-type"] || "INDIVIDUAL"
  const verificationLevel = req.headers["x-wq-user-verification"] || req.headers["x-user-verification"] || "GOLD"

  return {
    id: userId.trim(),
    email: email.trim(),
    name: name.trim() || username || "Verified User",
    username: username.trim(),
    avatarUrl: avatarUrl.trim(),
    headline: headline.trim(),
    role: role.trim(),
    accountType: accountType.trim(),
    verificationLevel: verificationLevel.trim(),
  }
}

export function authMiddleware(req, res, next) {
  req.user = extractUser(req)
  req.isAuthenticated = Boolean(req.user && req.user.id)
  next()
}

export function requireAuth(req, res, next) {
  req.user = extractUser(req)
  req.isAuthenticated = Boolean(req.user && req.user.id)

  if (!req.isAuthenticated) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Please sign in to perform this action.",
    })
  }

  next()
}
