"use client";

import { useEffect, useRef, useState } from "react";

const STEPS = [
  {
    num: "01",
    title: "Browse Posters",
    desc: "Explore our curated collection of pre-available A4 poster designs.",
    icon: "🖼️",
    color: "gold",
  },
  {
    num: "02",
    title: "Use AI Tools",
    desc: "Generate enhanced prompts with Curious AI for any creative need.",
    icon: "✨",
    color: "cyan",
  },
  {
    num: "03",
    title: "Upload Custom",
    desc: "Upload your own photos for high-quality A4 color printing.",
    icon: "📸",
    color: "emerald",
  },
  {
    num: "04",
    title: "Get Delivered",
    desc: "Checkout securely via Razorpay. Fast delivery with Delhivery.",
    icon: "📦",
    color: "purple",
  },
];

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  gold: { bg: "bg-gold/10", text: "text-gold", border: "border-gold/20", glow: "bg-gold/5" },
  cyan: { bg: "bg-cyan/10", text: "text-cyan", border: "border-cyan/20", glow: "bg-cyan/5" },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", glow: "bg-emerald-500/5" },
  purple: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20", glow: "bg-purple-500/5" },
};

export default function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 overflow-hidden">
      {/* BG */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-base-light/50 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div
          className={`text-center mb-16 transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <span className="text-gold text-xs font-heading font-semibold tracking-[0.2em] uppercase mb-2 block">
            Simple Process
          </span>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl">
            How It <span className="text-gold">Works</span>
          </h2>
        </div>

        {/* Steps grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-16 left-[12%] right-[12%] h-[1px] bg-gradient-to-r from-gold/20 via-cyan/20 via-emerald-500/20 to-purple-500/20" />

          {STEPS.map((step, i) => {
            const c = COLOR_MAP[step.color];
            return (
              <div
                key={step.num}
                className={`relative group transition-all duration-700 ${
                  visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                }`}
                style={{ transitionDelay: `${200 + i * 120}ms` }}
              >
                {/* Step card */}
                <div className="glass rounded-2xl p-6 h-full hover:border-white/10 transition-all hover:-translate-y-1">
                  {/* Number + icon */}
                  <div className="flex items-start justify-between mb-5">
                    <div
                      className={`w-12 h-12 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center text-xl transition-transform group-hover:scale-110`}
                    >
                      {step.icon}
                    </div>
                    <span className={`font-heading font-bold text-2xl ${c.text} opacity-30`}>
                      {step.num}
                    </span>
                  </div>

                  <h3 className="font-heading font-semibold text-base mb-2 group-hover:text-white transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                {/* Arrow connector (between cards, desktop only) */}
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:flex absolute -right-3 top-16 z-10 w-6 h-6 items-center justify-center">
                    <svg
                      className="w-4 h-4 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
