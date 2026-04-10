import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5">
      {/* Top gradient line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="bg-base-light/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="relative w-8 h-8 rounded-lg overflow-hidden ring-1 ring-white/10">
                  <Image
                    src="/images/Gemini_Generated_Image_mhpanwmhpanwmhpa.png"
                    alt="Lucky 3DP"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <span className="font-heading font-bold text-sm">
                    <span className="text-gold">LUCKY</span>{" "}
                    <span className="text-white">3DP</span>
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed max-w-[220px]">
                Premium A4 color printed posters, custom photo printing, and AI prompt tools. Based in Gwalior, MP.
              </p>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="font-heading font-semibold text-xs text-gold tracking-[0.15em] uppercase mb-4">
                Quick Links
              </h4>
              <div className="space-y-2.5">
                {[
                  { href: "/posters", label: "Shop Posters" },
                  { href: "/curious-ai", label: "Curious AI" },
                  { href: "/cart", label: "Cart" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block text-sm text-gray-500 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-heading font-semibold text-xs text-gold tracking-[0.15em] uppercase mb-4">
                Contact
              </h4>
              <div className="space-y-2.5">
                <a
                  href="https://wa.me/919584604150?text=Hi!%20I'm%20interested%20in%20Lucky%203DP%20posters."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm text-gray-500 hover:text-emerald-400 transition-colors"
                >
                  <span className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-xs">
                    💬
                  </span>
                  +91 95846 04150
                </a>
                <a
                  href="mailto:curiouslacky@gmail.com"
                  className="flex items-center gap-2.5 text-sm text-gray-500 hover:text-cyan transition-colors"
                >
                  <span className="w-7 h-7 rounded-lg bg-cyan/10 flex items-center justify-center text-xs">
                    ✉️
                  </span>
                  curiouslacky@gmail.com
                </a>
              </div>
            </div>

            {/* Payments & Shipping */}
            <div>
              <h4 className="font-heading font-semibold text-xs text-gold tracking-[0.15em] uppercase mb-4">
                We Accept
              </h4>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-xs text-gray-400">
                  <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <path d="M2 10h20" />
                  </svg>
                  Razorpay
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-xs text-gray-400">
                  <span className="text-sm font-bold text-green-400">₹</span>
                  UPI
                </span>
              </div>

              <h4 className="font-heading font-semibold text-xs text-gold tracking-[0.15em] uppercase mb-3">
                Courier
              </h4>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-xs text-gray-400">
                📦 Delhivery
              </span>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-gray-600">
              © 2024 LUCKY 3DP. All rights reserved.
            </p>
            <p className="text-[11px] text-gray-700">
              Made with ☕ in Gwalior
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
