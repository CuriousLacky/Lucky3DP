"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/cart-store";
import ThemeToggle from "@/components/ThemeToggle";

const NAV_LINKS = [
  { href: "/", label: "HOME" },
  { href: "/posters", label: "POSTERS" },
  { href: "/curious-ai", label: "CURIOUS AI" },
  { href: "#", label: "AGAMITECH", disabled: true },
  { href: "/cart", label: "CART" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const cartCount = useCartStore((s) => s.count());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-base/90 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="relative w-9 h-9 rounded-lg overflow-hidden ring-1 ring-white/10 group-hover:ring-gold/30 transition-all">
              <Image
                src="/images/Gemini_Generated_Image_mhpanwmhpanwmhpa.png"
                alt="Lucky 3DP"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="hidden sm:block">
              <span className="font-heading font-bold text-base tracking-tight">
                <span className="text-gold">LUCKY</span>{" "}
                <span className="text-white">3DP</span>
              </span>
              <p className="text-[9px] text-gray-500 -mt-0.5 leading-none tracking-wide">
                Photos and Curious prompt AI
              </p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`relative px-3.5 py-2 text-[13px] font-heading font-medium tracking-wide transition-all rounded-lg ${
                  link.disabled
                    ? "text-gray-600 cursor-not-allowed pointer-events-none"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
                {link.label === "AGAMITECH" && (
                  <span className="absolute -top-1 -right-1 text-[7px] px-1 py-0.5 rounded bg-purple-500/20 text-purple-400 font-medium">
                    SOON
                  </span>
                )}
                {link.label === "CART" && hydrated && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-gold text-base text-[10px] font-bold">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a
              href="https://wa.me/919584604150?text=Hi!%20I'm%20interested%20in%20Lucky%203DP%20posters."
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-heading font-medium px-4 py-2 rounded-xl transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:scale-[1.02]"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.37 0-4.567-.804-6.307-2.156l-.44-.348-2.66.891.891-2.66-.348-.44A9.96 9.96 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z" />
              </svg>
              Contact
            </a>

            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-2.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {open ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          open ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-base-light/95 backdrop-blur-xl border-t border-white/5 pb-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`block px-6 py-3.5 text-sm font-heading font-medium tracking-wide border-b border-white/[0.03] transition-colors ${
                link.disabled
                  ? "text-gray-600"
                  : "text-gray-400 hover:text-gold hover:bg-white/[0.03]"
              }`}
            >
              {link.label}
              {link.label === "AGAMITECH" && (
                <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">
                  SOON
                </span>
              )}
            </Link>
          ))}
          <a
            href="https://wa.me/919584604150?text=Hi!%20I'm%20interested%20in%20Lucky%203DP%20posters."
            target="_blank"
            rel="noopener noreferrer"
            className="block mx-4 mt-3 mb-2 text-center bg-emerald-600 text-white text-sm font-medium py-3 rounded-xl"
          >
            Contact on WhatsApp
          </a>
        </div>
      </div>
    </nav>
  );
}
