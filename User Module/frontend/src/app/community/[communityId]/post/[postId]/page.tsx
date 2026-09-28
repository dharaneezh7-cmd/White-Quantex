import React from "react"
import { useParams, Link } from "react-router"
import { ArrowLeft, ThumbsUp, MessageSquare, Share2 } from "lucide-react"

export default function PostDetailPage() {
  const { communityId, postId } = useParams()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        to={`/community/${communityId || ""}`}
        className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--wq-fg-muted)] hover:text-[#00d09c]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Community
      </Link>

      <article className="p-6 rounded-2xl border border-[var(--wq-border)] bg-[var(--wq-bg-surface)] space-y-4">
        <h1 className="text-xl font-bold text-[var(--wq-fg)]">Post Thread #{postId}</h1>
        <p className="text-xs text-[var(--wq-fg-muted)]">
          Discussion in <span className="text-[#00d09c] font-semibold">{communityId}</span>
        </p>
        <p className="text-sm text-[var(--wq-fg)] leading-relaxed">
          Full post discussion thread and persistent comments loaded from Node.js / MongoDB.
        </p>
      </article>
    </div>
  )
}
