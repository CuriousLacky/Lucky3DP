"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import { trackAddToCart } from "@/components/GoogleAnalytics";
import type { PosterData } from "@/lib/poster-data";

export default function PosterCard({ poster }: { poster: PosterData }) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({
      id: poster.id,
      name: poster.name,
      price: poster.packPrice ?? poster.price,
      image: poster.emoji,
      packSize: poster.packSize,
      category: "premade",
      tag: poster.tag,
      packType: poster.packSize ? "7pack" : "single",
    });
    setAdded(true);
    trackAddToCart(poster.name, poster.packPrice ?? poster.price);
    setTimeout(() => setAdded(false), 1600);
  }

  const isPack = !!poster.packSize;

  return (
    <div className="group glass rounded-2xl overflow-hidden hover:border-gold/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(212,168,83,0.06)]">
      {/* Image area */}
      <div className="relative">
        <div
          className={`aspect-[3/4] bg-gradient-to-br ${poster.gradient} flex items-center justify-center transition-transform duration-500 group-hover:scale-[1.03]`}
        >
          <span className="text-5xl drop-shadow-lg">{poster.emoji}</span>
        </div>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-base/70 backdrop-blur-sm border border-white/10 text-gray-300 font-medium">
            {poster.tag}
          </span>
          {isPack && (
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-gold/20 backdrop-blur-sm border border-gold/20 text-gold font-semibold">
              {poster.packSize} posters
            </span>
          )}
        </div>

        {/* Quick-add overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-base/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
          <button
            onClick={handleAdd}
            className={`px-5 py-2 rounded-xl text-xs font-heading font-semibold transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 ${
              added
                ? "bg-emerald-500 text-white scale-95"
                : "bg-gold text-base hover:bg-gold-light hover:scale-105"
            }`}
          >
            {added ? "✓ Added!" : "Add to Cart"}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-heading font-semibold text-sm leading-tight mb-1.5 group-hover:text-gold transition-colors truncate">
          {poster.name}
        </h3>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading font-bold text-gold text-base">
              ₹{poster.packPrice ?? poster.price}
            </span>
            {isPack && (
              <span className="text-[10px] text-gray-500 line-through">
                ₹{poster.price * (poster.packSize || 1)}
              </span>
            )}
          </div>

          {/* Mobile add button (visible on non-hover devices) */}
          <button
            onClick={handleAdd}
            className={`lg:hidden text-[10px] px-2.5 py-1.5 rounded-lg font-medium transition-all ${
              added
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-gold/10 text-gold hover:bg-gold/20"
            }`}
          >
            {added ? "✓" : "+ Cart"}
          </button>
        </div>

        {!isPack && (
          <p className="text-[10px] text-gray-600 mt-1.5">
            or <span className="text-gold/70">7 for ₹249</span>
          </p>
        )}
      </div>
    </div>
  );
}
