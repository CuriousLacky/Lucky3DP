"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdGateway from "@/components/AdGateway";

/* ─── Slide Data ──────────────────────────────────────── */

const SLIDES = [
  { id: "posters", label: "Posters" },
  { id: "curious-ai", label: "Curious AI" },
  { id: "agamitech", label: "AgamiTech" },
] as const;

/* ─── Slide 1: Posters ────────────────────────────────── */

function PostersSlide() {
  const posters = [
    { name: "Iron Man", emoji: "🦾" },
    { name: "Spider-Man", emoji: "🕷️" },
    { name: "Avengers", emoji: "🛡️" },
    { name: "Dr. Strange", emoji: "✨" },
  ];

  return (
    <div className="relative h-full flex items-center">
      {/* Warm room gradient BG */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900/30 via-base/80 to-base" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(212,168,83,0.15) 40px, rgba(212,168,83,0.15) 41px),
            repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(212,168,83,0.15) 40px, rgba(212,168,83,0.15) 41px)
          `,
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-8 items-center">
        {/* Left: Info */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-medium mb-6 animate-fade-up">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            Now Available
          </div>

          <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-[3.5rem] leading-[1.1] mb-5 animate-fade-up">
            Color Printed
            <br />
            <span className="text-gold">A4 Posters</span>
          </h1>

          <div className="space-y-2 mb-8 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-40">Pinterest Styles</span>
              <span className="font-heading font-semibold text-sm">
                <span className="text-gold">₹149</span>
                <span className="text-gray-600 mx-1">/</span>
                <span className="text-gold">₹249</span>
                <span className="text-gray-500 text-xs ml-1">(7-pack)</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-40">Custom Photo Printing</span>
              <span className="font-heading font-semibold text-sm">
                <span className="text-cyan">₹170</span>
                <span className="text-gray-600 mx-1">/</span>
                <span className="text-cyan">₹289</span>
                <span className="text-gray-500 text-xs ml-1">(7-pack)</span>
              </span>
            </div>
          </div>

          <div
            className="flex flex-wrap gap-3 animate-fade-up"
            style={{ animationDelay: "0.2s" }}
          >
            <Link
              href="/posters"
              className="group relative px-7 py-3 bg-gold text-base font-heading font-semibold text-sm rounded-xl overflow-hidden transition-all hover:shadow-[0_0_30px_rgba(212,168,83,0.3)] hover:scale-[1.02]"
            >
              <span className="relative z-10">Shop Posters</span>
              <div className="absolute inset-0 bg-gradient-to-r from-gold-light to-gold opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link
              href="/posters?tab=custom"
              className="px-7 py-3 border border-white/10 hover:border-cyan/30 text-sm font-heading font-medium rounded-xl transition-all hover:bg-cyan/5 hover:text-cyan"
            >
              Upload Photos
            </Link>
          </div>
        </div>

        {/* Right: Poster preview cards */}
        <div className="hidden lg:block relative">
          <div className="grid grid-cols-2 gap-3 max-w-sm ml-auto">
            {posters.map((p, i) => (
              <div
                key={p.name}
                className="glass rounded-xl p-4 hover:border-gold/20 transition-all hover:-translate-y-1 cursor-pointer animate-fade-up"
                style={{ animationDelay: `${0.15 + i * 0.08}s` }}
              >
                <div className="aspect-[3/4] bg-gradient-to-br from-base-lighter to-base rounded-lg flex items-center justify-center text-3xl mb-3">
                  {p.emoji}
                </div>
                <p className="font-heading text-xs font-medium truncate">{p.name}</p>
                <p className="text-gold text-xs font-heading font-bold">₹149</p>
              </div>
            ))}
          </div>
          {/* Decorative glow */}
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-gold/8 rounded-full blur-[100px] pointer-events-none" />
        </div>
      </div>
    </div>
  );
}

/* ─── Slide 2: Curious AI ─────────────────────────────── */

function CuriousAISlide() {
  const router = useRouter();
  const [showAd, setShowAd] = useState(false);
  const platforms = [
    { name: "Copy", icon: "📋" },
    { name: "Gemini", icon: "✦" },
    { name: "ChatGPT", icon: "💬" },
    { name: "Perplexity", icon: "🔍" },
  ];

  return (
    <div className="relative h-full flex items-center">
      {/* Tech gradient BG */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan/10 via-base/90 to-indigo-950/30" />
      {/* Radial pulse */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan/[0.03] animate-pulse" />
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(56,189,248,0.3) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-8 items-center">
        {/* Left: Info */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan/10 border border-cyan/20 text-cyan text-xs font-medium mb-6 animate-fade-up">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
            AI Powered
          </div>

          <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-[3.5rem] leading-[1.1] mb-5 animate-fade-up">
            Curious AI
            <br />
            <span className="text-cyan">Prompt Genius</span>
          </h1>

          <p
            className="text-gray-400 text-lg mb-4 max-w-md animate-fade-up"
            style={{ animationDelay: "0.08s" }}
          >
            Generate enhanced prompts in{" "}
            <span className="text-white font-semibold">5 seconds</span>. Copy
            and use anywhere.
          </p>

          <div
            className="flex flex-wrap gap-2 mb-8 animate-fade-up"
            style={{ animationDelay: "0.12s" }}
          >
            {platforms.map((p) => (
              <span
                key={p.name}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-gray-400"
              >
                <span>{p.icon}</span> {p.name}
              </span>
            ))}
          </div>

          <button
            onClick={() => setShowAd(true)}
            className="group relative inline-flex items-center gap-2 px-7 py-3 bg-cyan text-base font-heading font-semibold text-sm rounded-xl overflow-hidden transition-all hover:shadow-[0_0_30px_rgba(56,189,248,0.3)] hover:scale-[1.02] animate-fade-up"
            style={{ animationDelay: "0.18s" }}
          >
            <span className="relative z-10">Open Curious AI</span>
            <svg
              className="w-4 h-4 relative z-10 group-hover:translate-x-0.5 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>

          <AdGateway
            isOpen={showAd}
            onClose={() => setShowAd(false)}
            onComplete={() => {
              setShowAd(false);
              router.push("/curious-ai");
            }}
            title="Loading Curious AI"
            subtitle="Preparing your prompt workspace..."
          />
        </div>

        {/* Right: Prompt preview card */}
        <div className="hidden lg:block relative">
          <div
            className="glass rounded-2xl p-6 max-w-sm ml-auto animate-fade-up"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="ml-auto text-[10px] text-gray-600 font-mono">
                prompt_genius.ai
              </span>
            </div>

            <div className="bg-base/60 rounded-xl p-4 mb-4 border border-white/5">
              <p className="text-xs text-gray-500 mb-2">Example a prompt...</p>
              <p className="text-sm text-gray-300 leading-relaxed">
                &quot;Cinematic cyberpunk city at night with neon
                reflections&quot;
              </p>
              <p className="text-sm text-gray-400 leading-relaxed mt-1">
                &quot;Generate text for blog post&quot;
              </p>
            </div>

            <div className="flex items-center gap-2">
              {platforms.map((p) => (
                <div
                  key={p.name}
                  className="flex-1 flex flex-col items-center gap-1 py-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] cursor-pointer transition-colors"
                >
                  <span className="text-base">{p.icon}</span>
                  <span className="text-[9px] text-gray-500">{p.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Decorative */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-cyan/8 rounded-full blur-[80px] pointer-events-none" />
        </div>
      </div>
    </div>
  );
}

/* ─── Slide 3: AgamiTech ──────────────────────────────── */

function AgamiTechSlide() {
  const [email, setEmail] = useState("");

  return (
    <div className="relative h-full flex items-center">
      {/* Dark wireframe BG */}
      <div className="absolute inset-0 bg-gradient-to-br from-base via-base to-purple-950/20" />
      {/* 3D wireframe grid effect */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(168,85,247,0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168,85,247,0.4) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
          transform: "perspective(500px) rotateX(60deg)",
          transformOrigin: "center 120%",
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium mb-6 animate-fade-up">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            Coming Soon
          </div>

          {/* Logo placeholder */}
          <div
            className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-base-lighter border border-purple-500/10 flex items-center justify-center animate-fade-up"
            style={{ animationDelay: "0.05s" }}
          >
            <span className="text-3xl">🔮</span>
          </div>

          <h1
            className="font-heading font-bold text-4xl sm:text-5xl lg:text-[3.5rem] leading-[1.1] mb-4 animate-fade-up"
            style={{ animationDelay: "0.1s" }}
          >
            <span className="text-purple-300">AgamiTech</span>
          </h1>

          <p
            className="text-xl text-gray-300 mb-2 font-heading animate-fade-up"
            style={{ animationDelay: "0.15s" }}
          >
            Something Big Coming Soon.
          </p>
          <p
            className="text-sm text-gray-500 mb-10 animate-fade-up"
            style={{ animationDelay: "0.18s" }}
          >
            (Unclosed 3D Printing — Non-Active)
          </p>

          {/* Notify Me input */}
          <div
            className="flex items-center gap-2 max-w-sm mx-auto animate-fade-up"
            style={{ animationDelay: "0.22s" }}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/40 transition-colors"
            />
            <button className="px-5 py-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/20 text-purple-300 font-heading font-semibold text-sm rounded-xl transition-all hover:scale-[1.02]">
              Notify Me
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Hero Slider ────────────────────────────────── */

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);

  const INTERVAL = 7000; // 7 seconds per slide

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning || index === current) return;
      setIsTransitioning(true);
      setProgress(0);
      setTimeout(() => {
        setCurrent(index);
        setIsTransitioning(false);
      }, 400);
    },
    [current, isTransitioning]
  );

  // Auto-advance
  useEffect(() => {
    const start = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.min(elapsed / INTERVAL, 1));
    }, 50);

    const autoAdvance = setTimeout(() => {
      goTo((current + 1) % SLIDES.length);
    }, INTERVAL);

    return () => {
      clearTimeout(autoAdvance);
      clearInterval(progressInterval);
    };
  }, [current, goTo]);

  const slideComponents = [<PostersSlide key="p" />, <CuriousAISlide key="c" />, <AgamiTechSlide key="a" />];

  return (
    <section className="relative h-[85vh] min-h-[600px] max-h-[900px] overflow-hidden">
      {/* Slides */}
      <div
        className={`h-full transition-opacity duration-500 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
      >
        {slideComponents[current]}
      </div>

      {/* Bottom navigation bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-8">
          <div className="flex items-end gap-1">
            {SLIDES.map((slide, i) => (
              <button
                key={slide.id}
                onClick={() => goTo(i)}
                className={`group relative flex-1 transition-all duration-300 ${
                  i === current ? "opacity-100" : "opacity-40 hover:opacity-60"
                }`}
              >
                {/* Progress bar track */}
                <div className="h-[3px] rounded-full bg-white/10 overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full transition-all duration-100"
                    style={{
                      width: i === current ? `${progress * 100}%` : i < current ? "100%" : "0%",
                      background:
                        i === 0
                          ? "#D4A853"
                          : i === 1
                            ? "#38BDF8"
                            : "#A855F7",
                    }}
                  />
                </div>

                {/* Label */}
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-heading font-medium tracking-wide transition-colors ${
                      i === current ? "text-white" : "text-gray-500"
                    }`}
                  >
                    {slide.label}
                  </span>
                  {i === 2 && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">
                      Soon
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
