import React from "react"
import { useNavigate, useLocation } from "react-router"
import { Home, Users, Compass, ArrowRightLeft, PlusSquare, TrendingUp, Briefcase, Wallet } from "lucide-react"

export function BottomNavigation() {
  const navigate = useNavigate()
  const location = useLocation()
  const isCommunity = location.pathname.startsWith("/community") || location.pathname === "/" || location.pathname === "/home"

  const handleNavTab = (tab: "home" | "communities" | "people") => {
    if (window.location.pathname.startsWith("/community")) {
      window.dispatchEvent(new CustomEvent("set-community-tab", { detail: tab }))
    } else {
      navigate(`/community?tab=${tab}`)
    }
  }

  const handleToggleMode = () => {
    if (isCommunity) {
      navigate("/ventures")
    } else {
      navigate("/community")
    }
  }

  const handleCreatePost = () => {
    if (window.location.pathname.startsWith("/community")) {
      window.dispatchEvent(new CustomEvent("open-create-post-modal"))
    } else {
      navigate("/community?create=true")
    }
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-[#060809]/95 backdrop-blur-xl px-2 py-2 shadow-2xl">
      <div className="grid grid-cols-5 items-center justify-items-center max-w-md mx-auto">
        {isCommunity ? (
          <>
            {/* 1. Home Tab -> Community For You */}
            <button
              onClick={() => handleNavTab("home")}
              className="flex flex-col items-center justify-center gap-0.5 py-1 text-slate-600 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors cursor-pointer active:scale-95 px-2"
            >
              <Home className="h-5 w-5 text-slate-700 dark:text-white" />
              <span className="text-[10px] font-bold">Home</span>
            </button>

            {/* 2. Community Hubs Tab -> Community Hubs */}
            <button
              onClick={() => handleNavTab("communities")}
              className="flex flex-col items-center justify-center gap-0.5 py-1 text-slate-600 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors cursor-pointer active:scale-95 px-2"
            >
              <Users className="h-5 w-5 text-slate-700 dark:text-white" />
              <span className="text-[10px] font-bold">Hubs</span>
            </button>

            {/* 3. CENTER: WQ Logo Switcher ONLY (Community <-> Investment) */}
            <button
              onClick={handleToggleMode}
              title="Switch Mode (Community / Investment)"
              className="shrink-0 flex flex-col items-center justify-center cursor-pointer active:scale-95 group px-2"
            >
              <div className="h-9 w-9 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-zinc-950 font-black text-xs flex items-center justify-center tracking-tighter border border-slate-700 dark:border-zinc-300 shadow-md group-hover:scale-105 transition-all">
                WQ
              </div>
              <span className="text-[9px] font-extrabold text-emerald-500 flex items-center gap-0.5 mt-0.5">
                Community <ArrowRightLeft className="h-2.5 w-2.5" />
              </span>
            </button>

            {/* 4. Network / Founders Tab -> Community People */}
            <button
              onClick={() => handleNavTab("people")}
              className="flex flex-col items-center justify-center gap-0.5 py-1 text-slate-600 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors cursor-pointer active:scale-95 px-2"
            >
              <Compass className="h-5 w-5 text-slate-700 dark:text-white" />
              <span className="text-[10px] font-bold">Network</span>
            </button>

            {/* 5. Create Post Option */}
            <button
              onClick={handleCreatePost}
              className="flex flex-col items-center justify-center gap-0.5 py-1 text-slate-600 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors cursor-pointer active:scale-95 px-2"
            >
              <PlusSquare className="h-5 w-5 text-slate-700 dark:text-white" />
              <span className="text-[10px] font-bold">Post</span>
            </button>
          </>
        ) : (
          <>
            {/* 1. Explore Section */}
            <button
              onClick={() => navigate("/explore")}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 transition-colors cursor-pointer active:scale-95 px-2 ${
                location.pathname.startsWith("/explore")
                  ? "text-emerald-500 font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400"
              }`}
            >
              <Compass className="h-5 w-5 text-slate-700 dark:text-white" />
              <span className="text-[10px] font-bold">Explore</span>
            </button>

            {/* 2. Markets Section */}
            <button
              onClick={() => navigate("/markets")}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 transition-colors cursor-pointer active:scale-95 px-2 ${
                location.pathname.startsWith("/markets")
                  ? "text-emerald-500 font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400"
              }`}
            >
              <TrendingUp className="h-5 w-5 text-slate-700 dark:text-white" />
              <span className="text-[10px] font-bold">Markets</span>
            </button>

            {/* 3. CENTER: WQ Logo Switcher ONLY (Investment -> Community) */}
            <button
              onClick={handleToggleMode}
              title="Switch Mode (Community / Investment)"
              className="shrink-0 flex flex-col items-center justify-center cursor-pointer active:scale-95 group px-2"
            >
              <div className="h-9 w-9 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-zinc-950 font-black text-xs flex items-center justify-center tracking-tighter border border-slate-700 dark:border-zinc-300 shadow-md group-hover:scale-105 transition-all">
                WQ
              </div>
              <span className="text-[9px] font-extrabold text-emerald-500 flex items-center gap-0.5 mt-0.5">
                Investment <ArrowRightLeft className="h-2.5 w-2.5" />
              </span>
            </button>

            {/* 4. Ventures Section */}
            <button
              onClick={() => navigate("/ventures")}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 transition-colors cursor-pointer active:scale-95 px-2 ${
                location.pathname.startsWith("/ventures")
                  ? "text-emerald-500 font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400"
              }`}
            >
              <Briefcase className="h-5 w-5 text-slate-700 dark:text-white" />
              <span className="text-[10px] font-bold">Ventures</span>
            </button>

            {/* 5. Holdings Section */}
            <button
              onClick={() => navigate("/holdings")}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 transition-colors cursor-pointer active:scale-95 px-2 ${
                location.pathname.startsWith("/holdings")
                  ? "text-emerald-500 font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400"
              }`}
            >
              <Wallet className="h-5 w-5 text-slate-700 dark:text-white" />
              <span className="text-[10px] font-bold">Holdings</span>
            </button>
          </>
        )}
      </div>
    </div>
  )
}
