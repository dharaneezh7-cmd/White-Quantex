import React, { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router"
import { ArrowRight, Eye, EyeOff, ShieldCheck, Mail, Lock, AlertCircle, Sparkles } from "lucide-react"
import { authService } from "@/services/auth/authService"
import { useAuthStore } from "@/stores/auth-store"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const [searchParams] = useSearchParams()
  const nextUrl = searchParams.get("next") || "/register"

  const setUser = useAuthStore((s) => s.setUser)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email.trim()) {
      setError("Please enter your email.")
      return
    }

    if (!password) {
      setError("Please enter your password.")
      return
    }

    try {
      setLoading(true)
      const user = await authService.login({ email: email.trim(), password })
      setUser(user)
      navigate(nextUrl)
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Invalid credentials. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDemoAccess = async () => {
    setError("")
    try {
      setLoading(true)
      const user = await authService.demoLogin()
      setUser(user)
      navigate(nextUrl)
    } catch (err: any) {
      setError("Demo access unavailable. Please try manual login.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center bg-slate-50/50 dark:bg-[#09090b]">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-[#121215] p-8 sm:p-10 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xl">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-none bg-slate-900 text-white dark:bg-white dark:text-zinc-950 font-black shadow-sm">
              <span className="text-xs">WQ</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              White <span style={{ color: "#00cf9b" }}>Quantex</span>
            </span>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight pt-2">
            Sign In to Your Account
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Access your corporate issuer dashboard and venture registration.
          </p>
        </div>

        {/* Demo Fast Login */}
        <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-[#00d09c]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Verified Test Account</span>
            </div>
            <span className="text-[10px] text-slate-500">demo@whitequantex.com</span>
          </div>
          <button
            type="button"
            onClick={handleDemoAccess}
            disabled={loading}
            className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <span>1-Click Test Access</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#18181b] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#00d09c]"
              />
              <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#18181b] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#00d09c]"
              />
              <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#00d09c] text-black font-extrabold text-xs hover:bg-[#00b888] shadow-lg shadow-[#00d09c]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? "Signing in..." : "Sign In & Continue"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Create Account link */}
        <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Don't have an account yet?{" "}
            <Link to="/signup" className="font-bold text-[#00d09c] hover:underline">
              Create Account
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}
