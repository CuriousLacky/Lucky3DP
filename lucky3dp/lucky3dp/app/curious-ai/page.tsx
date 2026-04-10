"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import PostCard, { type PostData } from "@/components/PostCard";
import CreatePostModal from "@/components/CreatePostModal";
import AdGateway from "@/components/AdGateway";
import { POST_TYPES, type PostType } from "@/lib/prompt-categories";
import { trackCuriousAIOpened } from "@/components/GoogleAnalytics";

export default function CuriousAIPage() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<PostType | "ALL">("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAdGateway, setShowAdGateway] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  /* ── Fetch posts ────────────────────────────────────── */
  const fetchPosts = useCallback(
    async (reset = false) => {
      if (reset) {
        setLoading(true);
        setCursor(null);
      } else {
        setLoadingMore(true);
      }

      const params = new URLSearchParams({ limit: "12" });
      if (activeFilter !== "ALL") params.set("type", activeFilter);
      if (!reset && cursor) params.set("cursor", cursor);

      try {
        const res = await fetch(`/api/curious/posts?${params}`);
        const data = await res.json();

        if (reset) {
          setPosts(data.posts);
        } else {
          setPosts((prev) => [...prev, ...data.posts]);
        }
        setCursor(data.nextCursor);
        setHasMore(data.hasMore);
      } catch {
        // fail silently
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [activeFilter, cursor]
  );

  /* ── Initial load + filter change ───────────────────── */
  useEffect(() => {
    trackCuriousAIOpened();
  }, []);

  useEffect(() => {
    fetchPosts(true);
  }, [activeFilter]);

  /* ── Infinite scroll ────────────────────────────────── */
  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loadingMore && hasMore) {
          fetchPosts(false);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, fetchPosts]);

  /* ── Create post flow (ad gateway first) ────────────── */
  function handleCreateClick() {
    setShowAdGateway(true);
  }

  function onAdComplete() {
    setShowAdGateway(false);
    setShowCreateModal(true);
  }

  function onPostCreated() {
    fetchPosts(true);
  }

  return (
    <div className="min-h-screen relative">
      {/* BG */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan/[0.02] via-transparent to-transparent pointer-events-none" />

      {/* ── Header ────────────────────────────────────── */}
      <div className="relative border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan/10 border border-cyan/20 text-cyan text-xs font-medium mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
            Community Prompts
          </div>

          <h1 className="font-heading font-bold text-3xl sm:text-4xl mb-2">
            <span className="text-cyan">Curious AI</span>
          </h1>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Share your AI prompts with before &amp; after results. Copy any prompt and try it on Gemini, ChatGPT, or Perplexity.
          </p>
        </div>
      </div>

      {/* ── Sticky toolbar ────────────────────────────── */}
      <div className="sticky top-16 z-30 border-b border-white/5 bg-base/90 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2">
          {/* Filter tabs */}
          <div className="flex items-center gap-1 flex-1 overflow-x-auto pb-1 -mb-1">
            <FilterBtn
              active={activeFilter === "ALL"}
              onClick={() => setActiveFilter("ALL")}
              label="All"
              icon="🔥"
            />
            {POST_TYPES.map((t) => (
              <FilterBtn
                key={t.id}
                active={activeFilter === t.id}
                onClick={() => setActiveFilter(t.id)}
                label={t.shortLabel}
                icon={t.icon}
              />
            ))}
          </div>

          {/* Create button */}
          <button
            onClick={handleCreateClick}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 bg-gold text-base font-heading font-semibold text-xs rounded-xl hover:bg-gold-light transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(212,168,83,0.15)]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">New Post</span>
          </button>
        </div>
      </div>

      {/* ── Feed ──────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-3xl overflow-hidden">
                <div className="px-5 py-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full shimmer" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-24 shimmer rounded" />
                    <div className="h-2 w-16 shimmer rounded" />
                  </div>
                </div>
                <div className="aspect-[4/3] shimmer" />
                <div className="px-5 py-4 space-y-2">
                  <div className="h-3 w-full shimmer rounded" />
                  <div className="h-3 w-3/4 shimmer rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <EmptyState onCreateClick={handleCreateClick} />
        ) : (
          <div className="space-y-5">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}

            {/* Load more sentinel */}
            {hasMore && (
              <div ref={sentinelRef} className="py-8 flex justify-center">
                {loadingMore && (
                  <div className="w-6 h-6 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
                )}
              </div>
            )}

            {!hasMore && posts.length > 0 && (
              <p className="text-center text-xs text-gray-700 py-8">
                You&apos;ve seen all posts
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Floating create button (mobile) ───────────── */}
      <button
        onClick={handleCreateClick}
        className="fixed bottom-6 right-6 sm:hidden w-14 h-14 rounded-2xl bg-gold text-base shadow-xl shadow-gold/20 flex items-center justify-center text-xl hover:scale-110 transition-transform z-40"
      >
        +
      </button>

      {/* ── Modals ────────────────────────────────────── */}
      <AdGateway
        isOpen={showAdGateway}
        onClose={() => setShowAdGateway(false)}
        onComplete={onAdComplete}
        title="Loading Creator Studio"
        subtitle="Setting up your workspace..."
      />

      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={onPostCreated}
      />
    </div>
  );
}

/* ─── Filter Button ───────────────────────────────────── */

function FilterBtn({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-heading font-medium transition-all ${
        active
          ? "bg-white/10 text-white"
          : "text-gray-600 hover:text-gray-400 hover:bg-white/[0.03]"
      }`}
    >
      <span className="text-sm">{icon}</span>
      {label}
    </button>
  );
}

/* ─── Empty State ─────────────────────────────────────── */

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="text-center py-20">
      <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-3xl">
        ✨
      </div>
      <h2 className="font-heading font-bold text-xl mb-2">No posts yet</h2>
      <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
        Be the first to share your AI prompt with before &amp; after results!
      </p>
      <button
        onClick={onCreateClick}
        className="px-6 py-3 bg-gold text-base font-heading font-semibold text-sm rounded-xl hover:bg-gold-light transition-all hover:scale-[1.02]"
      >
        Create First Post
      </button>

      {/* Example prompts to inspire */}
      <div className="mt-12 max-w-md mx-auto">
        <p className="text-[10px] text-gray-600 tracking-wider uppercase mb-4">What people share here</p>
        <div className="grid gap-2 text-left">
          {[
            { type: "📸", title: "Photo Prompt", desc: "Before/after of AI photo edits with the exact prompt used" },
            { type: "🎬", title: "Video Prompt", desc: "AI-generated video results with source prompts" },
            { type: "✍️", title: "Text Prompt", desc: "Best prompts for writing, coding, and more" },
            { type: "✨", title: "Animation Prompt", desc: "Animated effects and transitions with prompts" },
          ].map((item, i) => (
            <div key={i} className="glass rounded-xl p-4 flex items-center gap-3">
              <span className="text-xl">{item.type}</span>
              <div>
                <p className="text-xs font-heading font-semibold">{item.title}</p>
                <p className="text-[10px] text-gray-600">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
