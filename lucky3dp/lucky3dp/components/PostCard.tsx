"use client";

import { useState, useRef } from "react";
import { getPostTypeConfig, PLATFORMS } from "@/lib/prompt-categories";
import { getSessionId } from "@/lib/session";
import { trackPromptCopied } from "@/components/GoogleAnalytics";

export interface PostData {
  id: string;
  authorName: string;
  authorAvatar?: string | null;
  postType: string;
  promptText: string;
  description?: string | null;
  beforeImage?: string | null;
  afterImage?: string | null;
  mediaUrls: string[];
  likes: number;
  likedBy: string[];
  shares: number;
  copyCount: number;
  createdAt: string;
}

export default function PostCard({ post }: { post: PostData }) {
  const config = getPostTypeConfig(post.postType as any);
  const sessionId = typeof window !== "undefined" ? getSessionId() : "";

  const [likes, setLikes] = useState(post.likes);
  const [liked, setLiked] = useState(post.likedBy.includes(sessionId));
  const [copies, setCopies] = useState(post.copyCount);
  const [shares, setShares] = useState(post.shares);
  const [copied, setCopied] = useState(false);
  const [showFullPrompt, setShowFullPrompt] = useState(false);
  const [comparePos, setComparePos] = useState(50); // slider percentage
  const [redirectToast, setRedirectToast] = useState<string | null>(null);
  const compareRef = useRef<HTMLDivElement>(null);

  const hasBeforeAfter = post.beforeImage && post.afterImage;
  const timeAgo = getTimeAgo(post.createdAt);

  /* ── Like ────────────────────────────────────────────── */
  async function handleLike() {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikes((l) => l + (newLiked ? 1 : -1));

    fetch(`/api/curious/posts/${post.id}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    }).catch(() => {
      setLiked(!newLiked);
      setLikes((l) => l + (newLiked ? -1 : 1));
    });
  }

  /* ── Copy prompt ────────────────────────────────────── */
  async function handleCopy() {
    await navigator.clipboard.writeText(post.promptText);
    setCopied(true);
    setCopies((c) => c + 1);
    trackPromptCopied(post.postType, "copy");
    setTimeout(() => setCopied(false), 2000);

    fetch(`/api/curious/posts/${post.id}/copy`, {
      method: "POST",
    }).catch(() => {});
  }

  /* ── Redirect to AI platform (auto-copies first) ───── */
  async function handleRedirect(platformId: string) {
    await navigator.clipboard.writeText(post.promptText);
    setCopied(true);
    setCopies((c) => c + 1);
    trackPromptCopied(post.postType, platformId);

    const platform = PLATFORMS.find((p) => p.id === platformId);
    if (platform) {
      setRedirectToast(platform.label);
      setTimeout(() => setRedirectToast(null), 3000);
      window.open(platform.url, "_blank");
    }

    fetch(`/api/curious/posts/${post.id}/copy`, { method: "POST" }).catch(() => {});
    setTimeout(() => setCopied(false), 2000);
  }

  /* ── Share ───────────────────────────────────────────── */
  async function handleShare() {
    const shareData = {
      title: `${config.label} — Lucky 3DP`,
      text: `Check out this AI prompt: "${post.promptText.slice(0, 100)}..."`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        setShares((s) => s + 1);
      } catch {}
    } else {
      await navigator.clipboard.writeText(
        `${shareData.text}\n${shareData.url}`
      );
      setShares((s) => s + 1);
    }
  }

  /* ── Before/After slider interaction ─────────────────── */
  function handleCompareMove(e: React.MouseEvent | React.TouchEvent) {
    if (!compareRef.current) return;
    const rect = compareRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setComparePos(Math.max(5, Math.min(95, pct)));
  }

  return (
    <div className="glass rounded-3xl overflow-hidden group">
      {/* ── Header ────────────────────────────────────── */}
      <div className="px-5 py-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan/20 to-purple-500/20 flex items-center justify-center text-sm font-bold shrink-0">
          {post.authorAvatar ? (
            <img src={post.authorAvatar} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            post.authorName.charAt(0).toUpperCase()
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-heading font-semibold truncate">
            {post.authorName}
          </p>
          <p className="text-[10px] text-gray-600">{timeAgo}</p>
        </div>
        <span className={`text-[10px] px-2.5 py-1 rounded-lg ${config.bgClass} border ${config.borderClass} font-medium`}>
          {config.icon} {config.shortLabel}
        </span>
      </div>

      {/* ── Before/After Comparison ────────────────────── */}
      {hasBeforeAfter && (
        <div
          ref={compareRef}
          className="relative aspect-square sm:aspect-[4/3] cursor-col-resize select-none overflow-hidden"
          onMouseMove={handleCompareMove}
          onTouchMove={handleCompareMove}
        >
          {/* After image (full) */}
          <img
            src={post.afterImage!}
            alt="After"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Before image (clipped) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${comparePos}%` }}
          >
            <img
              src={post.beforeImage!}
              alt="Before"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ width: `${(100 / comparePos) * 100}%`, maxWidth: "none" }}
            />
          </div>

          {/* Divider line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white/90 z-10 shadow-[0_0_8px_rgba(255,255,255,0.3)]"
            style={{ left: `${comparePos}%` }}
          >
            {/* Handle */}
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
              </svg>
            </div>
          </div>

          {/* Labels */}
          <span className="absolute top-3 left-3 text-[10px] px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white font-medium z-20">
            Before
          </span>
          <span className="absolute top-3 right-3 text-[10px] px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white font-medium z-20">
            After
          </span>
        </div>
      )}

      {/* ── Single image / media gallery ──────────────── */}
      {!hasBeforeAfter && post.mediaUrls.length > 0 && (
        <div className={`${post.mediaUrls.length === 1 ? "" : "grid grid-cols-2 gap-0.5"}`}>
          {post.mediaUrls.slice(0, 4).map((url, i) => (
            <div
              key={i}
              className={`relative overflow-hidden ${
                post.mediaUrls.length === 1 ? "aspect-square sm:aspect-[4/3]" : "aspect-square"
              }`}
            >
              {url.includes("/video/") ? (
                <video
                  src={url}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                  autoPlay
                />
              ) : (
                <img src={url} alt="" className="w-full h-full object-cover" />
              )}
              {i === 3 && post.mediaUrls.length > 4 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-heading font-bold text-xl">
                    +{post.mediaUrls.length - 4}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Action Bar ────────────────────────────────── */}
      <div className="px-5 py-3 flex items-center gap-1">
        {/* Like */}
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
            liked
              ? "text-red-400 bg-red-500/10"
              : "text-gray-500 hover:text-red-400 hover:bg-red-500/5"
          }`}
        >
          <svg
            className={`w-[18px] h-[18px] transition-transform ${liked ? "scale-110" : ""}`}
            fill={liked ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {likes > 0 && <span>{likes}</span>}
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-500 hover:text-cyan hover:bg-cyan/5 transition-all"
        >
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          {shares > 0 && <span>{shares}</span>}
        </button>

        {/* Copy count display */}
        <div className="ml-auto text-[10px] text-gray-600 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {copies} copies
        </div>
      </div>

      {/* ── Prompt Text ───────────────────────────────── */}
      <div className="px-5 pb-3">
        {post.description && (
          <p className="text-sm text-gray-300 mb-2">{post.description}</p>
        )}
        <div
          className={`relative text-xs text-gray-400 leading-relaxed bg-base/40 rounded-xl p-3.5 border border-white/[0.04] ${
            !showFullPrompt && post.promptText.length > 200 ? "max-h-20 overflow-hidden" : ""
          }`}
        >
          <span className="text-[9px] text-gray-600 tracking-wider uppercase block mb-1.5">
            Prompt
          </span>
          <p className="select-all">{post.promptText}</p>

          {!showFullPrompt && post.promptText.length > 200 && (
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-base/90 to-transparent flex items-end justify-center pb-1">
              <button
                onClick={() => setShowFullPrompt(true)}
                className="text-[10px] text-cyan hover:underline"
              >
                Show more
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Copy & Redirect Buttons ───────────────────── */}
      <div className="px-5 pb-5">
        <div className="flex flex-wrap gap-1.5">
          {/* Copy */}
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-heading font-medium transition-all border ${
              copied
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                : "bg-white/[0.04] text-gray-400 border-white/[0.04] hover:bg-white/[0.08] hover:text-white"
            }`}
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Prompt
              </>
            )}
          </button>

          {/* Platform buttons — auto-copy + redirect */}
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleRedirect(p.id)}
              className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-heading font-medium transition-all border ${p.bgClass}`}
            >
              <span className="text-sm">{p.icon}</span>
              {p.label}
              <svg className="w-2.5 h-2.5 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
          ))}
        </div>

        {/* Redirect toast */}
        {redirectToast && (
          <p className="text-[10px] text-emerald-400 mt-2 flex items-center gap-1 animate-fade-up">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Prompt copied! Paste it in {redirectToast}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Time ago helper ──────────────────────────────────── */

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
