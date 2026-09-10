import React, { useState } from "react"
import { Link, useNavigate } from "react-router"
import { ArrowRight, Eye, EyeOff } from "lucide-react"
import { authService } from "@/services/auth/authService"
import { useAuthStore } from "@/stores/auth-store"

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const setUser = useAuthStore((s) => s.setUser)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const trimmedFirstName = firstName.trim()
    const trimmedLastName = lastName.trim()
    const trimmedEmail = email.trim()

    // First name validation
    if (!trimmedFirstName) {
      setError("First name is required.")
      return
    }

    if (trimmedFirstName.length < 2) {
      setError("First name must be at least 2 characters.")
      return
    }

    // Last name validation
    if (!trimmedLastName) {
      setError("Last name is required.")
      return
    }

    if (trimmedLastName.length < 2) {
      setError("Last name must be at least 2 characters.")
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!trimmedEmail) {
      setError("Email address is required.")
      return
    }

    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address.")
      return
    }

    // Strong password validation
    if (password.length < 12) {
      setError("Password must be at least 12 characters long.")
      return
    }

    if (/\s/.test(password)) {
      setError("Password must not contain spaces.")
      return
    }

    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter.")
      return
    }

    if (!/[a-z]/.test(password)) {
      setError("Password must contain at least one lowercase letter.")
      return
    }

    if (!/[0-9]/.test(password)) {
      setError("Password must contain at least one number.")
      return
    }

    if (!/[!@#$%^&*(),.?":{}|<>_\-\\[\]\/+=;'`~]/.test(password)) {
      setError("Password must contain at least one special character.")
      return
    }

    // Confirm password
    if (!confirmPassword) {
      setError("Please confirm your password.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)

    try {
      const user = await authService.register({
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        email: trimmedEmail,
        password,
        role: "FOUNDER",
      })

      setUser(user)
      navigate("/dashboard")
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Registration failed. Please check your inputs."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md space-y-8 bg-[var(--wq-bg-surface)] p-8 rounded-2xl border border-[var(--wq-border)] shadow-xl">

        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <span className="font-sans text-lg font-extrabold text-[var(--wq-fg)]">
              WHITE{" "}
              <span className="text-[#00d09c]">
                QUANTEX
              </span>
            </span>
          </Link>

          <h2 className="text-xl font-bold text-[var(--wq-fg)]">
            Create WQ Identity
          </h2>

          <p className="text-xs text-[var(--wq-fg-muted)]">
            Permanent WQ UUID Generation Authority
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-400">
            {error}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* First Name & Last Name */}
          <div className="grid grid-cols-2 gap-3">

            <div>
              <label className="block text-xs font-bold text-[var(--wq-fg)] mb-1">
                First Name
              </label>

              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Alex"
                autoComplete="given-name"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] text-xs text-[var(--wq-fg)] focus:outline-none focus:border-[#00d09c]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--wq-fg)] mb-1">
                Last Name
              </label>

              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Vance"
                autoComplete="family-name"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] text-xs text-[var(--wq-fg)] focus:outline-none focus:border-[#00d09c]"
              />
            </div>

          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-[var(--wq-fg)] mb-1">
              Email Address
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@company.com"
              autoComplete="email"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] text-xs text-[var(--wq-fg)] focus:outline-none focus:border-[#00d09c]"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-[var(--wq-fg)] mb-1">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                autoComplete="new-password"
                minLength={12}
                className="w-full px-3.5 py-2.5 pr-11 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] text-xs text-[var(--wq-fg)] focus:outline-none focus:border-[#00d09c]"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--wq-fg-muted)] hover:text-[#00d09c] transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            <p className="text-[10px] text-[var(--wq-fg-muted)] mt-1.5">
              12+ characters • Uppercase • Lowercase • Number • Special character
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold text-[var(--wq-fg)] mb-1">
              Confirm Password
            </label>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                minLength={12}
                className="w-full px-3.5 py-2.5 pr-11 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] text-xs text-[var(--wq-fg)] focus:outline-none focus:border-[#00d09c]"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword((prev) => !prev)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--wq-fg-muted)] hover:text-[#00d09c] transition-colors"
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {confirmPassword && password !== confirmPassword && (
              <p className="text-[11px] text-rose-400 mt-1">
                Passwords do not match.
              </p>
            )}

            {confirmPassword && password === confirmPassword && (
              <p className="text-[11px] text-emerald-400 mt-1">
                Passwords match.
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#00d09c] text-black font-extrabold text-xs hover:bg-[#00b888] shadow-lg shadow-[#00d09c]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Generating WQ Identity..."
              : "Create Account & Get WQ UUID"}

            <ArrowRight className="h-4 w-4" />
          </button>

        </form>

        {/* Login Link */}
        <p className="text-center text-xs text-[var(--wq-fg-muted)] pt-2 border-t border-[var(--wq-border)]">
          Already registered?{" "}
          <Link
            to="/login"
            className="font-bold text-[#00d09c] hover:underline"
          >
            Sign In
          </Link>
        </p>

      </div>
    </div>
  )
}