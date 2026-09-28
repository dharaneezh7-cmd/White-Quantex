import React, { useState } from "react"
import { Link, useNavigate } from "react-router"
import { motion } from "framer-motion"
import {
  ArrowRight,
  Users,
  Zap,
  TrendingUp,
  Rocket,
  ShieldCheck,
  Check,
  X,
  BookOpen,
  Building2,
  Award,
  GraduationCap,
  Compass,
  Eye,
  MessageSquare,
  Sparkles,
} from "lucide-react"
import { Button } from "../components/ui/button"
import { VerificationBadge } from "../components/shared/VerificationBadge"

const COMPARISON_DATA = [
  { feature: "Startup Community & Networking", wq: true, linkedin: false, angellist: false, crunchbase: false, reddit: true },
  { feature: "Entrepreneurship Academy & Courses", wq: true, linkedin: false, angellist: false, crunchbase: false, reddit: false },
  { feature: "Multi-Tier Identity Verification", wq: true, linkedin: false, angellist: true, crunchbase: true, reddit: false },
  { feature: "Dedicated Startup & Product Showcase", wq: true, linkedin: false, angellist: true, crunchbase: true, reddit: false },
  { feature: "Verified Founder & Investor Profiles", wq: true, linkedin: true, angellist: true, crunchbase: false, reddit: false },
  { feature: "Official Organization Company Pages", wq: true, linkedin: true, angellist: true, crunchbase: true, reddit: false },
  { feature: "Multi-Role Workspace Switching", wq: true, linkedin: false, angellist: false, crunchbase: false, reddit: false },
  { feature: "Preparation for Future Investment", wq: true, linkedin: false, angellist: true, crunchbase: false, reddit: false },
]

const ROADMAP_DATA = [
  {
    version: "Version 1 (Current)",
    status: "Active & Live",
    title: "Ecosystem Foundation & Networking",
    desc: "Professional networking, startup discovery, company profiles, verified founder profiles, Startup Academy, community discussions, verification, and product showcasing.",
    isCurrent: true,
  },
  {
    version: "Version 2",
    status: "Next Release",
    title: "Mentorship & Corporate Collaboration",
    desc: "Direct mentor guidance channels, founder-investor communication streams, corporate partnership programs, and cross-border business collaboration.",
    isCurrent: false,
  },
  {
    version: "Version 3",
    status: "Upcoming",
    title: "Fundraising & Investment Workflows",
    desc: "Compliant fundraising tools, deal flow management, cap table tracking, due diligence data rooms, and payment integration for accredited investors.",
    isCurrent: false,
  },
  {
    version: "Version 4",
    status: "Future Vision",
    title: "AI Ecosystem Intelligence",
    desc: "AI startup assistant, predictive growth analytics, automated co-founder matching, and global startup ecosystem recommendations.",
    isCurrent: false,
  },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="relative overflow-hidden bg-white text-slate-900 dark:bg-[#09090b] dark:text-slate-50 min-h-screen">
      
      {/* ─── SECTION 1: HERO (Build the Future) ───────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-28 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 via-white to-slate-50 dark:from-[#09090b] dark:via-[#121215] dark:to-[#09090b]" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-[radial-gradient(circle_at_50%_40%,_rgba(74,85,104,0.3)_0%,_rgba(39,42,48,0.15)_50%,_transparent_80%)] blur-2xl pointer-events-none" />

        <div className="relative w-full px-4 sm:px-6 lg:px-8 xl:px-12 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl max-w-5xl mx-auto leading-[1.1]"
          >
            Build the Future. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-300 dark:to-slate-400 bg-clip-text text-transparent">
              From Idea to Global Enterprise.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed"
          >
            White Quantex is the professional startup ecosystem where founders build, companies showcase innovation, investors discover opportunities, and mentors guide the next generation of entrepreneurs.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Button
              size="lg"
              onClick={() => navigate("/register/company")}
              className="h-12 px-7 rounded-none bg-green-500 hover:bg-green-600 text-white border border-green-600 shadow-md text-sm font-bold cursor-pointer inline-flex items-center gap-2"
            >
              <Building2 className="h-4 w-4" />
              <span>Register a Company</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              onClick={() => navigate("/register/venture")}
              className="h-12 px-7 rounded-none bg-purple-600 hover:bg-purple-700 text-white border border-purple-700 shadow-md text-sm font-bold cursor-pointer inline-flex items-center gap-2"
            >
              <Rocket className="h-4 w-4" />
              <span>Register a Venture</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/about")}
              className="h-12 px-7 rounded-none border-slate-300 bg-white text-slate-900 hover:bg-slate-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800 text-sm font-bold cursor-pointer"
            >
              About White Quantex
            </Button>
          </motion.div>

          {/* Platform Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-4xl mx-auto border-t border-slate-200/80 dark:border-slate-800 pt-10"
          >
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">12,500+</p>
              <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">Ecosystem Members</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">3,200+</p>
              <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">Verified Startups</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">60+</p>
              <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">Global Innovation Hubs</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">98%</p>
              <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">Identity Verification</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── SECTION 2: THE PROBLEM (Why Founders & Ecosystems Struggle) ── */}
      <section className="py-24 bg-slate-50/50 dark:bg-[#121215] border-y border-slate-200/60 dark:border-zinc-800">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">The Problem</span>
            <h2 className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
              Why Entrepreneurial Ecosystems Are Broken.
            </h2>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Founders waste time trying to get noticed on generic networks, while investors struggle to verify genuine startup traction.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Isolated Founders", desc: "Founders struggle to build credibility, find verified mentors, and recruit early core team members outside local circles." },
              { title: "Opaque Startup Discovery", desc: "Investors and corporate partners waste hundreds of hours filtering through unverified pitches and noisy databases." },
              { title: "Fragmented Education", desc: "Students and new entrepreneurs lack structured, reliable startup guidance and battle-tested roadmaps." },
              { title: "No Early Visibility", desc: "High-potential startups fail to build authentic audience traction long before formal fundraising cycles begin." },
            ].map((prob, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#18181b]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 mb-4 font-bold text-sm">
                  0{i + 1}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{prob.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{prob.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: THE SOLUTION (8 Pillars of White Quantex) ───────── */}
      <section className="py-24">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">The Solution</span>
            <h2 className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
              The 8 Pillars of White Quantex.
            </h2>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
              A complete ecosystem providing everything needed to build, verify, showcase, and grow a startup.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "1. Explore", icon: Compass, desc: "Discover verified startups, investment campaigns, registered companies, and emerging market sectors." },
              { title: "2. Build", icon: Rocket, desc: "Create startup pages, showcase products, manage official company profiles, and configure professional workspaces." },
              { title: "3. Connect", icon: Users, desc: "Engage in genuine professional networking between founders, investors, mentors, students, and companies." },
              { title: "4. Showcase", icon: Eye, desc: "Publish product updates, milestones, hiring announcements, and company achievements to build traction." },
              { title: "5. Community", icon: MessageSquare, desc: "Participate in technical discussions, articles, webinars, polls, workshops, and ecosystem events." },
              { title: "6. Verify", icon: ShieldCheck, desc: "Build multi-tier credibility through identity verification, business registration checks, and trust scores." },
              { title: "7. Markets", icon: TrendingUp, desc: "Access real-time market intelligence, venture analytics, sector trends, and company watchlists." },
              { title: "8. Grow", icon: Zap, desc: "Gain visibility, followers, network reach, and prepare for future fundraising features." },
            ].map((pillar, idx) => {
              const IconComponent = pillar.icon
              return (
                <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#18181b]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 mb-4">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{pillar.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{pillar.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── SECTION 4: WHO CAN JOIN (Interactive Cards) ─────────────────── */}
      <section className="py-24 bg-slate-50/50 dark:bg-[#121215] border-y border-slate-200/60 dark:border-zinc-800">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Ecosystem Participants</span>
            <h2 className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
              Who Can Join White Quantex?
            </h2>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
              Whether you are an individual or an organization, White Quantex has a dedicated workspace for you.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { title: "Founders", icon: Rocket, desc: "Build startups, publish product updates, recruit team members, and prepare for future fundraising.", link: "/register/venture", linkText: "Register Venture" },
              { title: "Companies", icon: Building2, desc: "Create official company pages, post hiring announcements, showcase achievements, and gain institutional listings.", link: "/register/company", linkText: "Register Company" },
              { title: "Investors", icon: TrendingUp, desc: "Discover verified startups, follow founders, build watchlists, and prepare for future investment features.", link: "/about", linkText: "Explore Accreditation" },
              { title: "Mentors", icon: Award, desc: "Guide founders, answer community questions, publish educational content, and build credibility.", link: "/about", linkText: "Learn More" },
              { title: "Students", icon: GraduationCap, desc: "Explore tech startups, discover career opportunities, connect with founders, and build industry knowledge.", link: "/about", linkText: "Learn More" },
              { title: "Innovators", icon: Zap, desc: "Connect globally, explore partnerships, and participate in collaborative startup discussions.", link: "/register", linkText: "Get Started" },
            ].map((persona, i) => {
              const IconComp = persona.icon
              return (
                <motion.div
                  key={i}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-[#18181b] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 mb-6">
                      <IconComp className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{persona.title}</h3>
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{persona.desc}</p>
                  </div>
                  <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(persona.link)}
                      className="w-full justify-between text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 cursor-pointer"
                    >
                      {persona.linkText} <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── SECTION 5: PLATFORM JOURNEY ─────────────────────────────────── */}
      <section className="py-24">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">The Startup Lifecycle</span>
            <h2 className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
              The Complete Entrepreneurial Journey.
            </h2>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
              From initial idea validation to global scale and future fundraising readiness.
            </p>
          </div>

          <div className="relative border-l-2 border-emerald-500/30 max-w-3xl mx-auto pl-6 space-y-10">
            {[
              { step: "01", title: "Idea & Validation", desc: "Define your core startup vision, research market opportunities, and validate your value proposition." },
              { step: "02", title: "Build & Register", desc: "Create your verified profile, set up company pages, and publish your initial product vision." },
              { step: "03", title: "Connect & Mentor", desc: "Network with verified mentors, co-founders, and industry peers across active communities." },
              { step: "04", title: "Grow & Gain Followers", desc: "Publish product updates, achievements, and hiring posts to build authentic reputation." },
              { step: "05", title: "Future Fundraising Readiness", desc: "Prepare your startup with verified trust scores for upcoming investment workflows." },
            ].map((j, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative group"
              >
                <div className="absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold ring-4 ring-white dark:ring-[#050811]">
                  {idx + 1}
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#18181b]">
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Phase {j.step}</span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1 mb-2">{j.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{j.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 6: PLATFORM FEATURES & COMPARISON ────────────────────── */}
      <section className="py-24 bg-slate-50/50 dark:bg-[#121215] border-y border-slate-200/60 dark:border-zinc-800 overflow-x-auto">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Platform Features</span>
            <h2 className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
              What Makes White Quantex Different
            </h2>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
              Unlike fragmented single-purpose websites, White Quantex integrates community, education, verification, and company showcases into one platform.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#18181b] overflow-hidden">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-[#121215]">
                  <th className="p-4 font-bold text-slate-900 dark:text-white">Feature Capability</th>
                  <th className="p-4 font-extrabold text-emerald-600 dark:text-emerald-400">White Quantex</th>
                  <th className="p-4 font-medium text-slate-500">LinkedIn</th>
                  <th className="p-4 font-medium text-slate-500">AngelList</th>
                  <th className="p-4 font-medium text-slate-500">Crunchbase</th>
                  <th className="p-4 font-medium text-slate-500">Reddit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {COMPARISON_DATA.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-[#192745]/40">
                    <td className="p-4 font-medium text-slate-900 dark:text-slate-200">{row.feature}</td>
                    <td className="p-4"><Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400 stroke-[3]" /></td>
                    <td className="p-4">{row.linkedin ? <Check className="h-4 w-4 text-slate-400" /> : <X className="h-4 w-4 text-slate-300 dark:text-slate-600" />}</td>
                    <td className="p-4">{row.angellist ? <Check className="h-4 w-4 text-slate-400" /> : <X className="h-4 w-4 text-slate-300 dark:text-slate-600" />}</td>
                    <td className="p-4">{row.crunchbase ? <Check className="h-4 w-4 text-slate-400" /> : <X className="h-4 w-4 text-slate-300 dark:text-slate-600" />}</td>
                    <td className="p-4">{row.reddit ? <Check className="h-4 w-4 text-slate-400" /> : <X className="h-4 w-4 text-slate-300 dark:text-slate-600" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─── SECTION 7: SUCCESS STORIES & FEATURED STARTUPS ────────────── */}
      <section className="py-24">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Success Stories</span>
            <h2 className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
              Featured Startups & Innovators
            </h2>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
              Discover innovative companies building products and scaling across industries on White Quantex.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { name: "NovaMind AI", founder: "Elena Voss", industry: "Artificial Intelligence", desc: "Pioneering real-time cognitive analytics for enterprise workflows.", score: 96, level: "gold" },
              { name: "VerdeGrid Energy", founder: "Marcus Klein", industry: "CleanTech", desc: "Building decentralized smart grid management for renewable energy.", score: 92, level: "silver" },
              { name: "HealthBridge Tech", founder: "Amara Osei", industry: "HealthTech", desc: "Deploying telemedicine infrastructure across emerging markets.", score: 94, level: "gold" },
            ].map((s, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#18181b] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">{s.industry}</span>
                    <VerificationBadge level={s.level} showLabel />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{s.name}</h3>
                  <p className="text-xs text-slate-500 mb-3">Founded by {s.founder}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{s.desc}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Trust Score</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{s.score}/100</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 8: FUTURE VISION & VERSION ROADMAP ──────────────────── */}
      <section className="py-24 bg-slate-50/50 dark:bg-[#121215] border-y border-slate-200/60 dark:border-zinc-800">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Long-Term Vision</span>
            <h2 className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
              The White Quantex Version Roadmap
            </h2>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
              We are building the world's most transparent startup ecosystem. Here is our strategic roadmap.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {ROADMAP_DATA.map((item, idx) => (
              <div
                key={idx}
                className={`rounded-2xl border p-6 flex flex-col justify-between transition-all ${
                  item.isCurrent
                    ? "border-emerald-500 bg-white dark:border-emerald-500 dark:bg-[#18181b] shadow-md"
                    : "border-slate-200 bg-white/70 dark:border-zinc-800 dark:bg-[#121215]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-bold uppercase tracking-wider ${item.isCurrent ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
                      {item.version}
                    </span>
                    {item.isCurrent && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                        Active Now
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 9: CALL TO ACTION (Join White Quantex) ─────────────── */}
      <section className="py-24 bg-black text-white border-t border-zinc-800 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-white">
            Join White Quantex. Build the Future.
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Start your company or venture journey today. Register your entity, configure your workspace, and connect with the global ecosystem.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              onClick={() => navigate("/register/company")}
              className="h-12 px-8 bg-green-500 hover:bg-green-600 text-white font-bold text-base cursor-pointer inline-flex items-center gap-2"
            >
              <Building2 className="h-5 w-5" />
              <span>Register a Company</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              onClick={() => navigate("/register/venture")}
              className="h-12 px-8 bg-purple-600 hover:bg-purple-700 text-white font-bold text-base cursor-pointer inline-flex items-center gap-2"
            >
              <Rocket className="h-5 w-5" />
              <span>Register a Venture</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/about")}
              className="h-12 px-8 border-slate-700 bg-transparent text-white hover:bg-slate-800 text-base cursor-pointer"
            >
              About White Quantex
            </Button>
          </div>
        </div>
      </section>

    </div>
  )
}
