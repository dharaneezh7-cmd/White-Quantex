import React, { useState, useEffect, useCallback } from "react"
import { Link, useLocation, useNavigate } from "react-router"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  Building2,
  Rocket,
  ArrowRight,
} from "lucide-react"
import { cn } from "../../lib/utils"
import { NAV_LINKS } from "../../constants"
import { useTheme } from "../../context/ThemeContext"
import { Button } from "../ui/button"

export const Navbar = React.memo(function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled((prev) => {
            const isScrolled = window.scrollY > 10
            return prev !== isScrolled ? isScrolled : prev
          })
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300",
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200/80 dark:bg-[#09090b]/90 dark:border-zinc-800/80"
          : "bg-white/90 backdrop-blur-md border-b border-slate-200/60 dark:bg-[#09090b]/90 dark:border-zinc-800/80"
      )}
    >
      <nav className="max-w-[1440px] mx-auto flex h-full items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Left: Identical Logo + Nav */}
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-none bg-slate-900 text-white dark:bg-white dark:text-zinc-950 font-black shadow-sm">
              <span className="text-xs">WQ</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              White <span style={{ color: "#00cf9b" }}>Quantex</span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(link.href)
              return (
                <Link
                  key={link.label}
                  to={link.href}
                  className={cn(
                    "relative px-3 py-2 text-sm font-medium transition-colors rounded-lg",
                    isActive
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-active"
                      className="absolute inset-x-1 -bottom-[1px] h-0.5 rounded-full bg-slate-900 dark:bg-white"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Search Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/about")}
            className="hidden sm:flex h-9 w-9 px-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-zinc-800 cursor-pointer rounded-lg"
          >
            <Search className="h-4 w-4 text-slate-700 dark:text-white" />
            <span className="sr-only">Search</span>
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="h-9 w-9 px-0 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-zinc-800 cursor-pointer rounded-lg"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* User Ecosystem Link */}
          <a
            href="http://localhost:7000"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 transition-colors"
          >
            <span>User Portal</span>
            <ExternalLink className="h-3 w-3" />
          </a>

          {/* Sign In Link */}
          <Link
            to="/login"
            className="hidden sm:inline-flex px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
          >
            Sign In
          </Link>

          {/* Get Started CTA */}
          <Link
            to="/signup"
            className="h-9 px-4 rounded-xl bg-[#00d09c] text-black font-extrabold text-xs hover:bg-[#00b888] shadow-sm shadow-[#00d09c]/20 transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Get Started</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 md:hidden rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="border-b border-slate-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-[#09090b] md:hidden shadow-lg space-y-2"
          >
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(link.href)
              return (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block px-3 py-2 text-sm font-semibold rounded-lg",
                    isActive
                      ? "bg-slate-100 text-slate-900 dark:bg-zinc-800 dark:text-white"
                      : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-zinc-800/50"
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
            <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 flex flex-col gap-2">
              <a
                href="http://localhost:7000"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 text-xs font-bold text-slate-600 dark:text-zinc-400 flex items-center justify-between"
              >
                <span>Switch to User Ecosystem</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
})
