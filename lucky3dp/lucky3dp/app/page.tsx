import ParticleField from "@/components/ParticleField";
import HeroSlider from "@/components/HeroSlider";
import FeaturedPosters from "@/components/FeaturedPosters";
import HowItWorks from "@/components/HowItWorks";

export default function HomePage() {
  return (
    <div className="relative">
      {/* Floating particle background */}
      <ParticleField />

      {/* Hero Slider — 3 sections */}
      <HeroSlider />

      {/* Featured Posters grid */}
      <FeaturedPosters />

      {/* How It Works — 4-step flow */}
      <HowItWorks />

      {/* CTA Banner before footer */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gold/5 via-transparent to-cyan/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-base via-transparent to-base" />

        <div className="relative max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="font-heading font-bold text-3xl sm:text-4xl mb-4">
            Ready to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-cyan">
              get started
            </span>
            ?
          </h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Browse our poster collection, try Curious AI, or upload your own
            photos for custom printing.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="/posters"
              className="px-7 py-3 bg-gold text-base font-heading font-semibold text-sm rounded-xl hover:bg-gold-light transition-all hover:shadow-[0_0_30px_rgba(212,168,83,0.2)] hover:scale-[1.02]"
            >
              Shop Posters
            </a>
            <a
              href="/curious-ai"
              className="px-7 py-3 border border-white/10 hover:border-cyan/30 text-sm font-heading font-medium rounded-xl transition-all hover:bg-cyan/5 hover:text-cyan"
            >
              Try Curious AI
            </a>
            <a
              href="https://wa.me/919584604150"
              target="_blank"
              rel="noopener noreferrer"
              className="px-7 py-3 bg-emerald-600/20 border border-emerald-600/20 text-emerald-400 text-sm font-heading font-medium rounded-xl transition-all hover:bg-emerald-600/30"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
