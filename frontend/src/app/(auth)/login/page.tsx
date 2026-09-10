import React, { useState } from "react"
import { Link, useNavigate } from "react-router"
import { Sparkles, ArrowRight, Lock, Mail } from "lucide-react"
import { authService } from "@/services/auth/authService"
import { useAuthStore } from "@/stores/auth-store"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const setUser = useAuthStore((s) => s.setUser)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const user = await authService.login({ email, password })
      setUser(user)
      navigate("/dashboard")
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid credentials or session expired.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md space-y-8 bg-[var(--wq-bg-surface)] p-8 rounded-2xl border border-[var(--wq-border)] shadow-xl">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <span className="font-sans text-lg font-extrabold text-[var(--wq-fg)]">
              WHITE <span className="text-[#00d09c]">QUANTEX</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-[var(--wq-fg)]">Sign In to Your Account</h2>
          <p className="text-xs text-[var(--wq-fg-muted)]">Central Identity Authentication (Spring Boot Authority)</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--wq-fg)] mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--wq-fg-muted)]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@email.com"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] text-xs text-[var(--wq-fg)] focus:outline-none focus:border-[#00d09c]"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-[var(--wq-fg)]">Password</label>
              <Link to="/forgot-password" className="text-[11px] font-semibold text-[#00d09c] hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--wq-fg-muted)]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-bg-elevated)] text-xs text-[var(--wq-fg)] focus:outline-none focus:border-[#00d09c]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#00d09c] text-black font-extrabold text-xs hover:bg-[#00b888] shadow-lg shadow-[#00d09c]/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? "Authenticating..." : "Sign In to Ecosystem"} <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="text-center text-xs text-[var(--wq-fg-muted)] pt-2 border-t border-[var(--wq-border)]">
          Don't have a White Quantex ID?{" "}
          <Link to="/register" className="font-bold text-[#00d09c] hover:underline">
            Register Here
          </Link>
        </p>
      </div>
    </div>
  )
}
