"use client";

import { useState, useEffect, useCallback } from "react";
import SplashScreen from "@/components/SplashScreen";
import PageTransition from "@/components/PageTransition";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showSplash, setShowSplash] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Only show splash on first visit per session
    const seen = sessionStorage.getItem("lucky3dp-splash-seen");
    if (seen) setShowSplash(false);
  }, []);

  const onSplashComplete = useCallback(() => {
    setShowSplash(false);
    sessionStorage.setItem("lucky3dp-splash-seen", "1");
  }, []);

  // SSR: render children immediately
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <>
      {showSplash && <SplashScreen onComplete={onSplashComplete} />}
      <div
        className={`transition-opacity duration-500 ${
          showSplash ? "opacity-0" : "opacity-100"
        }`}
      >
        <PageTransition>{children}</PageTransition>
      </div>
    </>
  );
}
