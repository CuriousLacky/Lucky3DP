"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<
    "particles" | "logo" | "title" | "subtitle" | "fadeout" | "done"
  >("particles");
  const [titleChars, setTitleChars] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const title = "LUCKY 3DP";

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("logo"), 300),
      setTimeout(() => setPhase("title"), 900),
      setTimeout(() => setPhase("subtitle"), 1800),
      setTimeout(() => setPhase("fadeout"), 2600),
      setTimeout(() => { setPhase("done"); onComplete(); }, 3200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  useEffect(() => {
    if (phase !== "title" && phase !== "subtitle" && phase !== "fadeout") return;
    if (titleChars >= title.length) return;
    const t = setTimeout(() => setTitleChars((c) => c + 1), 80);
    return () => clearTimeout(t);
  }, [phase, titleChars]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    interface Ember { x: number; y: number; vx: number; vy: number; size: number; opacity: number; life: number; maxLife: number; }
    const embers: Ember[] = [];

    function spawn() {
      embers.push({
        x: canvas!.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas!.height / 2 + (Math.random() - 0.5) * 200,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -Math.random() * 2 - 0.5,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.8 + 0.2,
        life: 0,
        maxLife: 60 + Math.random() * 60,
      });
    }

    let raf: number;
    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      if (embers.length < 60) { spawn(); spawn(); }

      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.x += e.vx; e.y += e.vy; e.life++;
        const alpha = e.opacity * (1 - e.life / e.maxLife);
        if (e.life >= e.maxLife) { embers.splice(i, 1); continue; }

        const g = ctx!.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.size * 3);
        g.addColorStop(0, `rgba(212,168,83,${alpha})`);
        g.addColorStop(0.4, `rgba(212,168,83,${alpha * 0.3})`);
        g.addColorStop(1, `rgba(212,168,83,0)`);
        ctx!.beginPath(); ctx!.arc(e.x, e.y, e.size * 3, 0, Math.PI * 2);
        ctx!.fillStyle = g; ctx!.fill();

        ctx!.beginPath(); ctx!.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(232,201,122,${alpha})`; ctx!.fill();
      }
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  if (phase === "done") return null;

  return (
    <div className={`fixed inset-0 z-[100] bg-base flex items-center justify-center transition-opacity duration-[600ms] ${phase === "fadeout" ? "opacity-0" : "opacity-100"}`}>
      <canvas ref={canvasRef} className="absolute inset-0" />

      <div className={`absolute w-64 h-64 rounded-full transition-all duration-1000 ${phase === "particles" ? "opacity-0 scale-50" : "opacity-100 scale-100"}`}
        style={{ background: "radial-gradient(circle, rgba(212,168,83,0.12) 0%, transparent 70%)" }} />

      <div className="relative z-10 flex flex-col items-center">
        <div className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden transition-all duration-700 ${phase === "particles" ? "opacity-0 scale-75 blur-sm" : "opacity-100 scale-100 blur-0"}`}
          style={{ boxShadow: phase !== "particles" ? "0 0 60px rgba(212,168,83,0.3), 0 0 120px rgba(212,168,83,0.1)" : "none" }}>
          <Image src="/images/Gemini_Generated_Image_mhpanwmhpanwmhpa.png" alt="Lucky 3DP" fill className="object-cover" priority />
          <div className={`absolute inset-0 bg-gold/10 ${phase !== "particles" ? "animate-pulse" : ""}`} />
        </div>

        <div className="mt-6 h-10 flex items-center">
          <h1 className="font-heading font-bold text-2xl sm:text-3xl tracking-wider">
            {title.split("").map((char, i) => (
              <span key={i} className={`inline-block transition-all duration-200 ${i < titleChars ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"} ${char === "L" || char === "3" ? "text-gold" : "text-white"}`}>
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
            {titleChars < title.length && <span className="inline-block w-0.5 h-6 bg-gold ml-0.5 animate-pulse" />}
          </h1>
        </div>

        <p className={`text-xs sm:text-sm text-gray-500 mt-2 tracking-wide transition-all duration-700 ${phase === "subtitle" || phase === "fadeout" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
          Photos and Curious prompt AI
        </p>
      </div>
    </div>
  );
}
