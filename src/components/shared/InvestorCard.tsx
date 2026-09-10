import React, { useState } from "react"
import { MapPin, Users, Check, ArrowUpRight } from "lucide-react"
import { useNavigate } from "react-router"
import { motion } from "framer-motion"
import { formatNumber, getInitials, cn } from "../../lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import { VerificationBadge } from "./VerificationBadge"

interface InvestorCardProps {
  investor?: any
  index?: number
}

export const InvestorCard = React.memo(function InvestorCard({ investor, index = 0 }: InvestorCardProps) {
  const navigate = useNavigate()
  const investorId = investor?.id ? String(investor.id) : "u-investor-1"
  const name = investor?.name || `${investor?.firstName || "Investor"} ${investor?.lastName || ""}`.trim()
  const followersCount = investor?.followersCount ?? 12800
  const [isFollowing, setIsFollowing] = useState(Boolean(investor?.isFollowing))

  const handleFollowToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFollowing((prev) => !prev)
  }

  const handleCardClick = () => {
    navigate(`/investors/${investorId}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className="h-full"
    >
      <div
        onClick={handleCardClick}
        className="cursor-pointer group h-full rounded-[10px] border border-slate-200 bg-white p-5 card-premium hover:border-amber-500/40 dark:border-zinc-800 dark:bg-[#18181b] shadow-sm flex flex-col justify-between"
      >
        <div>
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12 ring-2 ring-slate-100 dark:ring-zinc-800 shrink-0 rounded-[10px]">
              <AvatarImage src={investor?.avatarUrl} alt={name} className="rounded-[10px] object-cover" />
              <AvatarFallback className="bg-amber-50 dark:bg-amber-950/40 text-sm font-semibold text-amber-700 dark:text-amber-400 font-bold rounded-[10px]">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="truncate text-sm font-semibold text-slate-900 group-hover:text-amber-600 transition-colors dark:text-white dark:group-hover:text-amber-400">
                  {name}
                </h3>
                {investor?.verificationLevel && <VerificationBadge level={investor.verificationLevel} />}
              </div>
              <p className="mt-0.5 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">{investor?.headline || investor?.bio || "Ecosystem Investor"}</p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            {investor?.location && (
              <span className="flex items-center gap-1 truncate">
                <MapPin className="h-3 w-3 text-amber-500" />{investor.location}
              </span>
            )}
            <span className="flex items-center gap-1 shrink-0">
              <Users className="h-3.5 w-3.5 text-slate-400" />
              {formatNumber(followersCount)} followers
            </span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800/80">
          <Button
            variant="outline"
            size="sm"
            onClick={handleFollowToggle}
            className={cn(
              "w-full rounded-[10px] px-4 py-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border-zinc-700 shadow-xs cursor-pointer",
              isFollowing && "bg-zinc-900 dark:bg-zinc-900 border-zinc-600 text-amber-400"
            )}
          >
            {isFollowing ? (
              <>
                <Check className="h-3.5 w-3.5 text-amber-400" />
                <span>Following</span>
              </>
            ) : (
              "+ Follow"
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  )
})
