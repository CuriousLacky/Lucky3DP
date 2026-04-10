"use client";

import { useState, useEffect } from "react";

const WA_URL =
  "https://wa.me/919584604150?text=Hi!%20I'm%20interested%20in%20Lucky%203DP%20posters.";

export default function WhatsAppFloat() {
  const [visible, setVisible] = useState(false);
  const [pulse, setPulse] = useState(true);

  // Show after a short delay so it doesn't flash on load
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(t);
  }, []);

  // Stop pulsing after first click
  function handleClick() {
    setPulse(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Tooltip */}
      <div className="hidden sm:block bg-white text-gray-800 text-xs font-medium px-3 py-2 rounded-xl shadow-xl opacity-0 translate-y-2 animate-[fadeUp_0.3s_2.5s_forwards] pointer-events-none max-w-[180px]">
        Need help? Chat with us!
        <div className="absolute -bottom-1 right-6 w-2 h-2 bg-white transform rotate-45" />
      </div>

      {/* Button */}
      <a
        href={WA_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className={`relative group w-14 h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-400 shadow-xl shadow-emerald-500/30 hover:shadow-emerald-400/40 flex items-center justify-center transition-all duration-300 hover:scale-110 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
        style={{ transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
        aria-label="Chat on WhatsApp"
      >
        {/* Pulse ring */}
        {pulse && (
          <span className="absolute inset-0 rounded-2xl bg-emerald-500/40 animate-ping" />
        )}

        {/* WhatsApp icon */}
        <svg
          className="w-7 h-7 text-white relative z-10"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.37 0-4.567-.804-6.307-2.156l-.44-.348-2.66.891.891-2.66-.348-.44A9.96 9.96 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z" />
        </svg>
      </a>
    </div>
  );
}
