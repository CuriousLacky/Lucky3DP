"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import PosterCard from "@/components/PosterCard";
import FileUploader from "@/components/FileUploader";
import { POSTER_CATALOG, ALL_TAGS, type PosterTag } from "@/lib/poster-data";
import { useCartStore } from "@/lib/cart-store";

type Tab = "premade" | "custom";

export default function PostersPage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "custom" ? "custom" : "premade";

  const [tab, setTab] = useState<Tab>(initialTab);
  const [activeTag, setActiveTag] = useState<PosterTag | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const cartCount = useCartStore((s) => s.count());

  // Update tab from URL
  useEffect(() => {
    if (searchParams.get("tab") === "custom") setTab("custom");
  }, [searchParams]);

  const filtered = POSTER_CATALOG.filter((p) => {
    if (activeTag !== "All" && p.tag !== activeTag) return false;
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen">
      {/* Header with background */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-transparent" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(212,168,83,0.4) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-gold text-xs font-heading font-semibold tracking-[0.2em] uppercase mb-2 block">
                Shop
              </span>
              <h1 className="font-heading font-bold text-3xl sm:text-4xl">
                <span className="text-gold">Color Printed</span> A4 Posters
              </h1>
              <p className="text-gray-500 text-sm mt-2 max-w-lg">
                High-quality A4 color prints. Choose from curated designs or upload your own photos.
              </p>
            </div>

            {/* Cart indicator */}
            {cartCount > 0 && (
              <a
                href="/cart"
                className="inline-flex items-center gap-2 px-4 py-2 glass rounded-xl hover:border-gold/20 transition-all text-sm shrink-0"
              >
                🛒{" "}
                <span className="text-gold font-heading font-semibold">
                  {cartCount} item{cartCount !== 1 ? "s" : ""}
                </span>
              </a>
            )}
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 p-1 bg-white/[0.03] rounded-xl w-fit">
            <button
              onClick={() => setTab("premade")}
              className={`px-5 py-2.5 rounded-lg text-sm font-heading font-medium transition-all ${
                tab === "premade"
                  ? "bg-gold text-base shadow-lg shadow-gold/10"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              🖼️ Pre-Available
            </button>
            <button
              onClick={() => setTab("custom")}
              className={`px-5 py-2.5 rounded-lg text-sm font-heading font-medium transition-all ${
                tab === "custom"
                  ? "bg-cyan text-base shadow-lg shadow-cyan/10"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              📸 Custom Photos
            </button>
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {tab === "premade" ? (
          <PremadeTab
            activeTag={activeTag}
            setActiveTag={setActiveTag}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            posters={filtered}
          />
        ) : (
          <CustomTab />
        )}
      </div>
    </div>
  );
}

/* ─── Premade Tab ─────────────────────────────────────── */

function PremadeTab({
  activeTag,
  setActiveTag,
  searchQuery,
  setSearchQuery,
  posters,
}: {
  activeTag: PosterTag | "All";
  setActiveTag: (t: PosterTag | "All") => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  posters: typeof POSTER_CATALOG;
}) {
  return (
    <div>
      {/* Pricing banner */}
      <div className="flex flex-wrap items-center gap-3 mb-6 mt-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/15 text-xs text-gold font-medium">
          Singles: ₹149 each
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/15 text-xs text-gold font-medium">
          7-Pack: ₹249 (save ₹794!)
        </span>
      </div>

      {/* Filters & search row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-8">
        {/* Tag filters */}
        <div className="flex items-center gap-1.5 flex-wrap flex-1">
          <button
            onClick={() => setActiveTag("All")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTag === "All"
                ? "bg-white/10 text-white"
                : "bg-white/[0.03] text-gray-500 hover:text-gray-300 hover:bg-white/5"
            }`}
          >
            All
            <span className="ml-1 text-gray-600">{POSTER_CATALOG.length}</span>
          </button>
          {ALL_TAGS.map((tag) => {
            const count = POSTER_CATALOG.filter((p) => p.tag === tag).length;
            return (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTag === tag
                    ? "bg-gold/15 text-gold border border-gold/20"
                    : "bg-white/[0.03] text-gray-500 hover:text-gray-300 hover:bg-white/5"
                }`}
              >
                {tag}
                <span className="ml-1 text-gray-600">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-56">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posters..."
            className="w-full bg-white/[0.03] border border-white/5 rounded-xl pl-9 pr-4 py-2 text-sm placeholder-gray-600 focus:outline-none focus:border-gold/30 transition-colors"
          />
        </div>
      </div>

      {/* Poster grid */}
      {posters.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {posters.map((poster) => (
            <PosterCard key={poster.id} poster={poster} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <span className="text-4xl mb-4 block">🔍</span>
          <p className="text-gray-400 font-heading font-medium">No posters found</p>
          <p className="text-sm text-gray-600 mt-1">Try adjusting your search or filter.</p>
        </div>
      )}
    </div>
  );
}

/* ─── Custom Tab ──────────────────────────────────────── */

function CustomTab() {
  return (
    <div className="mt-2">
      {/* Info header */}
      <div className="glass rounded-2xl p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan/10 border border-cyan/20 flex items-center justify-center text-xl shrink-0">
            📸
          </div>
          <div className="flex-1">
            <h2 className="font-heading font-semibold text-base mb-1">Custom Photo Printing</h2>
            <p className="text-sm text-gray-400">
              Upload your own photos and we&apos;ll print them on high-quality A4 paper. Upload up to 7 photos per order.
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <p className="text-xs text-gray-500">4 photos</p>
              <p className="font-heading font-bold text-cyan">₹170</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-right">
              <p className="text-xs text-gray-500">7 photos</p>
              <p className="font-heading font-bold text-cyan">₹289</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload area */}
      <FileUploader />

      {/* Specs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
        {[
          { label: "Paper Size", value: "A4 (210×297mm)", icon: "📐" },
          { label: "Print Type", value: "Full Color", icon: "🎨" },
          { label: "Max Size", value: "10MB per file", icon: "📁" },
          { label: "Formats", value: "JPG, PNG, WebP", icon: "🖼️" },
        ].map((spec) => (
          <div key={spec.label} className="glass rounded-xl p-4 text-center">
            <span className="text-xl mb-2 block">{spec.icon}</span>
            <p className="text-[10px] text-gray-500 mb-0.5">{spec.label}</p>
            <p className="text-xs font-heading font-semibold">{spec.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
