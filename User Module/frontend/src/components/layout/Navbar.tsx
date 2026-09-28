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
  User,
  Settings,
  LogOut,
  LayoutDashboard,
  Bookmark,
  Activity,
  HelpCircle,
} from "lucide-react"
import { cn, getInitials } from "../../lib/utils"
import { NAV_LINKS } from "../../constants"
import { useTheme } from "../../context/ThemeContext"
import { useAuthStore } from "../../stores/auth-store"
import { Button } from "../ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"

export const Navbar = React.memo(function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const { user, isAuthenticated, clearAuth } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeWorkspace, setActiveWorkspace] = useState<"FOUNDER" | "INVESTOR">("FOUNDER")

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

  const handleSignOut = useCallback(() => {
    clearAuth()
    navigate("/")
  }, [clearAuth, navigate])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300",
        scrolled
          ? "glass shadow-sm"
          : "bg-white/90 backdrop-blur-md border-b border-slate-200/60 dark:bg-[#09090b]/90 dark:border-zinc-800/80"
      )}
    >
      <nav className="max-w-[1440px] mx-auto flex h-full items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-none bg-slate-900 text-white dark:bg-white dark:text-zinc-950 font-black">
              <span className="text-xs">WQ</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              White <span style={{color:'#00cf9b'}}>Quantex</span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname.startsWith(link.href)
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
        <div className="flex items-center gap-1">
          {/* Search */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const isCommunity = location.pathname.startsWith("/community") || location.pathname === "/" || location.pathname === "/home"
              navigate(isCommunity ? "/search?type=people" : "/search?type=ventures")
            }}
            className="hidden sm:flex h-9 w-9 px-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 cursor-pointer"
          >
            <Search className="h-4 w-4 text-slate-700 dark:text-white" />
            <span className="sr-only">Search</span>
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/notifications")}
            className="hidden h-9 w-9 px-0 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 sm:flex relative"
          >
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notifications</span>
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="h-9 w-9 px-0 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 relative overflow-hidden transition-transform active:scale-90"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={theme}
                initial={{ y: -16, opacity: 0, rotate: -90, scale: 0.5 }}
                animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
                exit={{ y: 16, opacity: 0, rotate: 90, scale: 0.5 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex items-center justify-center"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4 text-amber-400" />
                ) : (
                  <Moon className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                )}
              </motion.div>
            </AnimatePresence>
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Auth Actions */}
          <div className="hidden items-center gap-2 sm:flex">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="ml-1 h-9 w-9 px-0 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <Avatar className="h-8 w-8 ring-2 ring-slate-200 dark:ring-slate-700">
                      <AvatarImage src={user.avatarUrl} alt={user.displayName || user.firstName} />
                      <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-white">
                        {getInitials(user.displayName || user.firstName)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{user.displayName || `${user.firstName} ${user.lastName}`}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                  </div>

                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 focus:text-slate-900 dark:text-slate-300 dark:hover:text-white dark:focus:text-white">
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 focus:text-slate-900 dark:text-slate-300 dark:hover:text-white dark:focus:text-white">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile/saved" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 focus:text-slate-900 dark:text-slate-300 dark:hover:text-white dark:focus:text-white">
                      <Bookmark className="h-4 w-4" />
                      Saved Items
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile/activity" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 focus:text-slate-900 dark:text-slate-300 dark:hover:text-white dark:focus:text-white">
                      <Activity className="h-4 w-4" />
                      Activity Log
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 focus:text-slate-900 dark:text-slate-300 dark:hover:text-white dark:focus:text-white">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/help" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 focus:text-slate-900 dark:text-slate-300 dark:hover:text-white dark:focus:text-white">
                      <HelpCircle className="h-4 w-4" />
                      Help & Support
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                  
                  {/* Mode Switcher */}
                  <div className="px-2 py-1.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1 px-1">
                      Active Mode
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                      {(["FOUNDER", "INVESTOR"] as const).map((ws) => (
                        <button
                          key={ws}
                          onClick={() => setActiveWorkspace(ws)}
                          className={cn(
                            "px-2 py-1 text-[11px] font-medium rounded transition-colors text-center cursor-pointer",
                            activeWorkspace === ws
                              ? "bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white font-semibold"
                              : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
                          )}
                        >
                          {ws === "FOUNDER" ? "Founder" : "Investor"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />

                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white text-xs font-semibold">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-slate-900 hover:bg-black text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-xs font-semibold shadow-xs">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (window.location.pathname.startsWith("/community")) {
                window.dispatchEvent(new CustomEvent("toggle-community-mobile-menu"))
              } else {
                setMobileOpen(!mobileOpen)
              }
            }}
            className="h-9 w-9 px-0 text-slate-600 dark:text-slate-300 md:hidden cursor-pointer"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-b border-slate-200/80 bg-white/95 backdrop-blur-xl dark:border-slate-800 dark:bg-[#09090b]/95 md:hidden overflow-hidden"
          >
            <div className="space-y-1 px-4 py-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    location.pathname.startsWith(link.href)
                      ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white font-semibold"
                      : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50"
                  )}
                >
                  {link.label}
                </Link>
              ))}

              <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                {isAuthenticated ? (
                  <div className="space-y-1">
                    <Link
                      to="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <User className="h-4 w-4" /> Profile
                    </Link>
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-left"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 pt-1">
                    <Link to="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full text-xs font-semibold">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                      <Button size="sm" className="w-full bg-slate-900 hover:bg-black text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-xs font-semibold">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
})
