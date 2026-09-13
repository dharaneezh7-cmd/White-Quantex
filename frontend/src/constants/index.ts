export const NAV_LINKS = [
  { label: "Explore", href: "/explore" },
  { label: "Ventures", href: "/ventures" },
  { label: "Markets", href: "/markets" },
  { label: "Holdings", href: "/holdings" },
  { label: "Community", href: "/community" },
]

export const FOOTER_LINKS = [
  {
    title: "Ecosystem",
    links: [
      { label: "Explore Ventures", href: "/explore" },
      { label: "Startups", href: "/startups" },
      { label: "Established Companies", href: "/companies" },
      { label: "Market Intelligence", href: "/markets" },
      { label: "Community Feed", href: "/community" },
    ],
  },
  {
    title: "Entrepreneurs",
    links: [
      { label: "Founder Verification", href: "/verification/founder" },
      { label: "Job Board", href: "/jobs" },
    ],
  },
  {
    title: "Investors",
    links: [
      { label: "Investor Verification", href: "/verification/investor" },
      { label: "Portfolio Dashboard", href: "/dashboard" },
      { label: "Fundraising Deals", href: "/ventures" },
      { label: "Venture Events", href: "/events" },
    ],
  },
  {
    title: "Company & Legal",
    links: [
      { label: "About White Quantex", href: "/about" },
      { label: "Contact Us", href: "/contact" },
      { label: "Help Center", href: "/help" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookie-policy" },
      { label: "Community Guidelines", href: "/community-guidelines" },
    ],
  },
]

export const INDUSTRIES = [
  "Fintech",
  "HealthTech",
  "EdTech",
  "SaaS",
  "AI & Machine Learning",
  "Blockchain & Web3",
  "CleanTech & Energy",
  "E-Commerce & Retail",
  "Biotech & Life Sciences",
  "AgriTech",
  "SpaceTech",
  "Cybersecurity",
]

export const STARTUP_STAGES = [
  "IDEA",
  "PRE_SEED",
  "SEED",
  "SERIES_A",
  "SERIES_B",
  "GROWTH",
  "PRE_IPO",
] as const

export const VERIFICATION_LEVEL_CONFIG = {
  NONE: { label: "Unverified", color: "text-slate-400 border-slate-600 bg-slate-500/10" },
  BRONZE: { label: "Bronze Verified", color: "text-amber-600 border-amber-500/30 bg-amber-500/10" },
  SILVER: { label: "Silver Verified", color: "text-slate-300 border-slate-400/30 bg-slate-400/10" },
  GOLD: { label: "Gold Verified", color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10" },
  PLATINUM: { label: "Platinum Verified", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
}
