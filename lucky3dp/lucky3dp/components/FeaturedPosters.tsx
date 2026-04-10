"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const FEATURED = [
  { name: "Iron Man Classic", price: 149, emoji: "🦾", gradient: "from-red-900/20 to-amber-900/10" },
  { name: "Spider-Man", price: 149, emoji: "🕷️", gradient: "from-red-900/20 to-blue-900/10" },
  { name: "Captain America", price: 149, emoji: "🛡️", gradient: "from-blue-900/20 to-red-900/10" },
  { name: "Avengers 7-Pack", price: 249, emoji: "⚡", gradient: "from-purple-900/20 to-blue-900/10", badge: "7 posters" },
  { name: "Doctor Strange", price: 149, emoji: "✨", gradient: "from-indigo-900/20 to-purple-900/10" },
  { name: "Black Panther", price: 149, emoji: "🐾", gradient: "from-purple-900/20 to-base" },
];

export default function FeaturedPosters() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 overflow-hidden">
      {/* Section BG accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div
          className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div>
            <span className="text-gold text-xs font-heading font-semibold tracking-[0.2em] uppercase mb-2 block">
              Collection
            </span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl">
              Featured <span className="text-gold">Posters</span>
            </h2>
          </div>
          <Link
            href="/posters"
            className="text-sm text-gray-400 hover:text-gold transition-colors font-medium group"
          >
            View all posters{" "}
            <span className="inline-block group-hover:translate-x-1 transition-transform">
              →
            </span>
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {FEATURED.map((poster, i) => (
            <Link
              href="/posters"
              key={poster.name}
              className={`group relative glass rounded-2xl p-4 hover:border-gold/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_8px_40px_rgba(212,168,83,0.08)] ${
                visible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12"
              }`}
              style={{ transitionDelay: `${150 + i * 80}ms` }}
            >
              {poster.badge && (
                <span className="absolute top-3 right-3 text-[9px] px-2 py-0.5 rounded-full bg-gold/15 text-gold font-medium z-10">
                  {poster.badge}
                </span>
              )}

              <div
                className={`aspect-[3/4] bg-gradient-to-br ${poster.gradient} rounded-xl flex items-center justify-center text-4xl mb-3 transition-transform duration-300 group-hover:scale-[1.03]`}
              >
                {poster.emoji}
              </div>

              <h3 className="font-heading text-xs font-semibold truncate group-hover:text-gold transition-colors">
                {poster.name}
              </h3>
              <p className="font-heading font-bold text-gold text-sm mt-0.5">
                ₹{poster.price}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
