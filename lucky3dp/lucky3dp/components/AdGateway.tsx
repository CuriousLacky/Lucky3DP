"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { trackAdViewed } from "@/components/GoogleAnalytics";

interface AdGatewayProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  duration?: number; // seconds, default 5
  title?: string;
  subtitle?: string;
}

const RING_SIZE = 120;
const STROKE_WIDTH = 4;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function AdGateway({
  isOpen,
  onClose,
  onComplete,
  duration = 5,
  title = "Your content is loading",
  subtitle = "Please wait while we prepare your experience",
}: AdGatewayProps) {
  const [countdown, setCountdown] = useState(duration);
  const [canContinue, setCanContinue] = useState(false);
  const [progress, setProgress] = useState(0);
  const adContainerRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  /* ── Reset on open ──────────────────────────────────── */
  useEffect(() => {
    if (isOpen) {
      setCountdown(duration);
      setCanContinue(false);
      setProgress(0);
      startTimeRef.current = Date.now();
    }
  }, [isOpen, duration]);

  /* ── Smooth progress animation ──────────────────────── */
  useEffect(() => {
    if (!isOpen || canContinue) return;

    function tick() {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const pct = Math.min(elapsed / duration, 1);
      setProgress(pct);
      setCountdown(Math.max(Math.ceil(duration - elapsed), 0));

      if (pct >= 1) {
        setCanContinue(true);
        trackAdViewed(duration);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isOpen, duration, canContinue]);

  /* ── Load Adsterra script ───────────────────────────── */
  useEffect(() => {
    if (!isOpen || !adContainerRef.current) return;

    const scriptUrl = process.env.NEXT_PUBLIC_ADSTERRA_SCRIPT_URL;
    if (!scriptUrl) return;

    // Clear previous ad
    adContainerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    adContainerRef.current.appendChild(script);

    return () => {
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = "";
      }
    };
  }, [isOpen]);

  /* ── Handlers ───────────────────────────────────────── */
  const handleContinue = useCallback(() => {
    if (!canContinue) return;
    cancelAnimationFrame(rafRef.current);
    onComplete();
  }, [canContinue, onComplete]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && canContinue) {
        handleContinue();
      }
    },
    [canContinue, handleContinue]
  );

  /* ── Prevent body scroll ────────────────────────────── */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      {/* Modal */}
      <div className="relative w-full max-w-lg animate-fade-up">
        {/* Top decorative line */}
        <div className="absolute -top-px left-1/2 -translate-x-1/2 w-40 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

        <div className="glass rounded-3xl overflow-hidden border border-white/[0.08]">
          {/* Header with branding */}
          <div className="relative px-8 pt-8 pb-4 text-center">
            {/* Radial glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-gold/[0.04] rounded-full blur-[60px] pointer-events-none" />

            {/* Logo */}
            <div className="relative w-10 h-10 mx-auto mb-4 rounded-xl overflow-hidden ring-1 ring-white/10">
              <Image
                src="/images/Gemini_Generated_Image_mhpanwmhpanwmhpa.png"
                alt="Lucky 3DP"
                fill
                className="object-cover"
              />
            </div>

            {/* Countdown ring */}
            <div className="relative w-[120px] h-[120px] mx-auto mb-5">
              <svg
                width={RING_SIZE}
                height={RING_SIZE}
                className="transform -rotate-90"
              >
                {/* Track */}
                <circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RADIUS}
                  fill="none"
                  stroke="rgba(255,255,255,0.04)"
                  strokeWidth={STROKE_WIDTH}
                />
                {/* Progress arc */}
                <circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RADIUS}
                  fill="none"
                  stroke={canContinue ? "#10B981" : "#D4A853"}
                  strokeWidth={STROKE_WIDTH}
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-colors duration-300"
                />
              </svg>

              {/* Center number */}
              <div className="absolute inset-0 flex items-center justify-center">
                {canContinue ? (
                  <svg
                    className="w-8 h-8 text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <span className="font-heading font-bold text-3xl text-gold tabular-nums">
                    {countdown}
                  </span>
                )}
              </div>
            </div>

            <h3 className="font-heading font-semibold text-base mb-1">
              {canContinue ? "Ready!" : title}
            </h3>
            <p className="text-xs text-gray-500">
              {canContinue
                ? "Click below to continue"
                : subtitle}
            </p>
          </div>

          {/* Ad container */}
          <div className="px-8 py-4">
            <div
              ref={adContainerRef}
              className="w-full min-h-[160px] rounded-xl bg-base/60 border border-white/[0.04] flex items-center justify-center overflow-hidden"
            >
              {/* Fallback if no Adsterra script */}
              <div className="text-center p-6">
                <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-white/5 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <p className="text-[10px] text-gray-600">Sponsored Content</p>
              </div>
            </div>
          </div>

          {/* Continue button */}
          <div className="px-8 pb-8 pt-2">
            <button
              onClick={handleContinue}
              disabled={!canContinue}
              className={`w-full py-3.5 rounded-xl font-heading font-semibold text-sm transition-all duration-300 ${
                canContinue
                  ? "bg-gold text-base hover:bg-gold-light hover:shadow-[0_0_30px_rgba(212,168,83,0.2)] hover:scale-[1.01] cursor-pointer"
                  : "bg-white/[0.04] text-gray-600 cursor-not-allowed"
              }`}
            >
              {canContinue
                ? "Continue to Curious AI →"
                : `Please wait ${countdown}s...`}
            </button>

            {/* Skip hint for returning users — could add logic */}
            <p className="text-center text-[10px] text-gray-700 mt-3">
              Ads help keep Lucky 3DP free
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
