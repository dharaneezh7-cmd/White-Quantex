import React, { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router"
import { ArrowRight, Eye, EyeOff, ShieldCheck, Mail, Lock, User, AlertCircle, Building2, CheckCircle2 } from "lucide-react"
import { authService } from "@/services/auth/authService"
import { useAuthStore } from "@/stores/auth-store"
import { UserRole } from "@/types"

export default function SignUpPage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<UserRole>("CORPORATE")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(true)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const [searchParams] = useSearchParams()
  const nextUrl = searchParams.get("next") || "/register"

  const setUser = useAuthStore((s) => s.setUser)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const trimmedFirstName = firstName.trim()
    const trimmedLastName = lastName.trim()
    const trimmedEmail = email.trim()

    if (!trimmedFirstName) {
      setError("First name is required.")
      return
    }

    if (trimmedFirstName.length < 2) {
      setError("First name must be at least 2 characters.")
      return
    }

    if (!trimmedLastName) {
      setError("Last name is required.")
      return
    }

    if (trimmedLastName.length < 2) {
      setError("Last name must be at least 2 characters.")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!trimmedEmail) {
      setError("Email address is required.")
      return
    }

    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address.")
      return
    }

    if (!password) {
      setError("Password is required.")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    if (!agreeTerms) {
      setError("You must agree to the Terms of Service to continue.")
      return
    }

    try {
      setLoading(true)
      const user = await authService.register({
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        email: trimmedEmail,
        password,
        role,
      })

      setUser(user)
      navigate(nextUrl)
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Account creation failed. Please check your details and try again."
      setError(msg)
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
            Create Your Account
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Create your account with your email to register and manage your company or venture.
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* First & Last Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5">
                First Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Elena"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#18181b] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#00d09c]"
                />
                <User className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5">
                Last Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Vance"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#18181b] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#00d09c]"
                />
                <User className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5">
              Work Email Address
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

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5">
              Primary Organization Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole("CORPORATE")}
                className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                  role === "CORPORATE"
                    ? "border-[#00d09c] bg-[#00d09c]/10 text-emerald-700 dark:text-[#00d09c]"
                    : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#18181b] text-slate-600 dark:text-slate-400"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>Corporate Issuer</span>
                </div>
                <p className="text-[10px] text-slate-500 font-normal">C-Corp / LLC officer</p>
              </button>

              <button
                type="button"
                onClick={() => setRole("FOUNDER")}
                className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                  role === "FOUNDER"
                    ? "border-[#00d09c] bg-[#00d09c]/10 text-emerald-700 dark:text-[#00d09c]"
                    : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#18181b] text-slate-600 dark:text-slate-400"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Startup Founder</span>
                </div>
                <p className="text-[10px] text-slate-500 font-normal">Venture representative</p>
              </button>
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
                placeholder="At least 6 characters"
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

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#18181b] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#00d09c]"
              />
              <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Terms checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="h-4 w-4 rounded accent-[#00d09c] cursor-pointer"
            />
            <label htmlFor="terms" className="text-[11px] text-slate-500 dark:text-slate-400 cursor-pointer">
              I agree to the{" "}
              <Link to="/about" className="text-[#00d09c] hover:underline">
                Terms of Service
              </Link>{" "}
              and SEC Rule 506(c) disclosures.
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#00d09c] text-black font-extrabold text-xs hover:bg-[#00b888] shadow-lg shadow-[#00d09c]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? "Creating Account..." : "Create Account & Continue"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Sign In link */}
        <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-[#00d09c] hover:underline">
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}
