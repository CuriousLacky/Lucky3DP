"use client";

import Link from "next/link";
import { useCartStore, type CartItem } from "@/lib/cart-store";
import { useState, useEffect } from "react";

export default function CartPage() {
  // Hydration guard — zustand persist reads localStorage after mount
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQty = useCartStore((s) => s.updateQty);
  const clearCart = useCartStore((s) => s.clearCart);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const getCount = useCartStore((s) => s.getCount);
  const getPackDealSuggestion = useCartStore((s) => s.getPackDealSuggestion);
  const applyPackDeal = useCartStore((s) => s.applyPackDeal);

  if (!hydrated) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-2xl h-24 shimmer" />
          ))}
        </div>
      </div>
    );
  }

  const subtotal = getSubtotal();
  const totalItems = getCount();
  const packDeal = getPackDealSuggestion();
  const premadeItems = items.filter((i) => i.category === "premade");
  const customItems = items.filter((i) => i.category === "custom");

  /* ── Empty state ────────────────────────────────────── */
  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
          <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
        </div>

        <h1 className="font-heading font-bold text-2xl mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-8 max-w-xs mx-auto">
          Browse our poster collection or upload custom photos to get started.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/posters"
            className="px-6 py-3 bg-gold text-base font-heading font-semibold text-sm rounded-xl hover:bg-gold-light transition-all hover:scale-[1.02]"
          >
            🖼️ Shop Posters
          </Link>
          <Link
            href="/posters?tab=custom"
            className="px-6 py-3 border border-white/10 hover:border-cyan/30 text-sm font-heading font-medium rounded-xl transition-all hover:bg-cyan/5 hover:text-cyan"
          >
            📸 Upload Photos
          </Link>
        </div>
      </div>
    );
  }

  /* ── Cart with items ────────────────────────────────── */
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/[0.03] to-transparent" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-4">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-gold text-xs font-heading font-semibold tracking-[0.2em] uppercase mb-2 block">
                Review
              </span>
              <h1 className="font-heading font-bold text-3xl sm:text-4xl">
                Your <span className="text-gold">Cart</span>
              </h1>
            </div>
            <p className="text-sm text-gray-500">
              {totalItems} item{totalItems !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Pack deal suggestion banner */}
        {packDeal.active && (
          <PackDealBanner deal={packDeal} onApply={applyPackDeal} />
        )}

        {/* Main content: 2-column on desktop */}
        <div className="grid lg:grid-cols-[1fr_340px] gap-6 mt-6">
          {/* Left: Item list */}
          <div className="space-y-3">
            {/* Premade section */}
            {premadeItems.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                  <h2 className="text-xs font-heading font-semibold text-gray-500 tracking-wider uppercase">
                    Premade Posters
                  </h2>
                  <span className="text-[10px] text-gray-600">({premadeItems.length})</span>
                </div>
                {premadeItems.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    onUpdateQty={updateQty}
                    onRemove={removeItem}
                  />
                ))}
              </div>
            )}

            {/* Custom section */}
            {customItems.length > 0 && (
              <div className={premadeItems.length > 0 ? "mt-6" : ""}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan" />
                  <h2 className="text-xs font-heading font-semibold text-gray-500 tracking-wider uppercase">
                    Custom Photo Prints
                  </h2>
                  <span className="text-[10px] text-gray-600">({customItems.length})</span>
                </div>
                {customItems.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    onUpdateQty={updateQty}
                    onRemove={removeItem}
                  />
                ))}
              </div>
            )}

            {/* Clear cart */}
            <div className="pt-4 flex justify-end">
              <button
                onClick={clearCart}
                className="text-xs text-gray-600 hover:text-red-400 transition-colors flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear cart
              </button>
            </div>
          </div>

          {/* Right: Order summary sidebar */}
          <div className="lg:sticky lg:top-24 h-fit">
            <OrderSummary
              subtotal={subtotal}
              itemCount={totalItems}
              packDeal={packDeal}
            />
          </div>
        </div>

        {/* Continue shopping */}
        <div className="mt-8 text-center">
          <Link
            href="/posters"
            className="text-sm text-gray-500 hover:text-gold transition-colors"
          >
            ← Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── Cart Item Row ───────────────────────────────────── */

function CartItemRow({
  item,
  onUpdateQty,
  onRemove,
}: {
  item: CartItem;
  onUpdateQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}) {
  const isCustom = item.category === "custom";
  const accentColor = isCustom ? "cyan" : "gold";
  const lineTotal = item.price * item.qty;

  return (
    <div className="glass rounded-2xl p-4 sm:p-5 mb-3 group hover:border-white/10 transition-all">
      <div className="flex gap-4">
        {/* Thumbnail */}
        <div className="shrink-0">
          {isCustom && item.uploadedImageUrls && item.uploadedImageUrls.length > 0 ? (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-base-lighter relative">
              <img
                src={item.uploadedImageUrls[0]}
                alt={item.name}
                className="w-full h-full object-cover"
              />
              {item.uploadedImageUrls.length > 1 && (
                <div className="absolute bottom-1 right-1 text-[9px] px-1.5 py-0.5 rounded bg-base/80 backdrop-blur-sm text-gray-300 font-medium">
                  +{item.uploadedImageUrls.length - 1}
                </div>
              )}
            </div>
          ) : (
            <div
              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gradient-to-br ${
                isCustom
                  ? "from-cyan/10 to-base-lighter"
                  : "from-amber-900/20 to-base-lighter"
              } flex items-center justify-center text-3xl sm:text-4xl`}
            >
              {item.image || (isCustom ? "📸" : "🖼️")}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-heading font-semibold text-sm sm:text-base leading-tight truncate">
                {item.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                {item.tag && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-gray-500">
                    {item.tag}
                  </span>
                )}
                {item.packSize && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md ${
                      isCustom ? "bg-cyan/10 text-cyan" : "bg-gold/10 text-gold"
                    }`}
                  >
                    {item.packSize} items
                  </span>
                )}
                <span className="text-xs text-gray-600">
                  ₹{item.price} each
                </span>
              </div>
            </div>

            {/* Line total */}
            <span
              className={`font-heading font-bold text-base sm:text-lg shrink-0 ${
                isCustom ? "text-cyan" : "text-gold"
              }`}
            >
              ₹{lineTotal}
            </span>
          </div>

          {/* Custom photo thumbnails */}
          {isCustom && item.uploadedImageUrls && item.uploadedImageUrls.length > 1 && (
            <div className="flex gap-1.5 mt-3 overflow-x-auto pb-1">
              {item.uploadedImageUrls.map((url, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-lg overflow-hidden bg-base-lighter shrink-0 ring-1 ring-white/5"
                >
                  <img
                    src={url}
                    alt={`Photo ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Quantity controls + Remove */}
          <div className="flex items-center justify-between mt-3 sm:mt-4">
            <div className="flex items-center gap-1">
              {/* Decrease */}
              <button
                onClick={() => onUpdateQty(item.id, item.qty - 1)}
                className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>

              {/* Quantity display */}
              <span className="w-10 h-8 flex items-center justify-center font-heading font-semibold text-sm">
                {item.qty}
              </span>

              {/* Increase */}
              <button
                onClick={() => onUpdateQty(item.id, item.qty + 1)}
                className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {/* Remove */}
            <button
              onClick={() => onRemove(item.id)}
              className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 sm:opacity-100"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Pack Deal Banner ────────────────────────────────── */

function PackDealBanner({
  deal,
  onApply,
}: {
  deal: { singleCount: number; currentTotal: number; packTotal: number; savings: number };
  onApply: () => void;
}) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl mt-2">
      {/* BG gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-gold/10 via-amber-500/5 to-gold/10" />
      <div className="absolute inset-0 bg-base/40" />

      <div className="relative p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-gold/15 border border-gold/20 flex items-center justify-center text-2xl shrink-0">
          🎉
        </div>

        {/* Text */}
        <div className="flex-1">
          <h3 className="font-heading font-semibold text-sm text-gold mb-0.5">
            Pack Deal Available!
          </h3>
          <p className="text-sm text-gray-400">
            You have{" "}
            <span className="text-white font-medium">{deal.singleCount} individual posters</span>{" "}
            at ₹{deal.currentTotal}. Get them as a 7-pack for{" "}
            <span className="text-gold font-semibold">₹{deal.packTotal}</span> and save{" "}
            <span className="text-emerald-400 font-semibold">₹{deal.savings}</span>!
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onApply}
            className="px-5 py-2.5 bg-gold text-base font-heading font-semibold text-sm rounded-xl hover:bg-gold-light transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(212,168,83,0.2)]"
          >
            Apply Deal — Save ₹{deal.savings}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Decorative shimmer */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
    </div>
  );
}

/* ─── Order Summary ───────────────────────────────────── */

function OrderSummary({
  subtotal,
  itemCount,
  packDeal,
}: {
  subtotal: number;
  itemCount: number;
  packDeal: { active: boolean; savings: number };
}) {
  const shipping = 0; // free shipping
  const total = subtotal;

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5">
        <h2 className="font-heading font-semibold text-sm tracking-wide">
          Order Summary
        </h2>
      </div>

      {/* Breakdown */}
      <div className="p-6 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">
            Subtotal ({itemCount} item{itemCount !== 1 ? "s" : ""})
          </span>
          <span>₹{subtotal}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Shipping</span>
          <span className="text-emerald-400 font-medium">Free</span>
        </div>

        {packDeal.active && (
          <div className="flex justify-between text-sm">
            <span className="text-emerald-400">Potential savings</span>
            <span className="text-emerald-400 font-medium">-₹{packDeal.savings}</span>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-white/5 pt-3">
          <div className="flex justify-between items-center">
            <span className="font-heading font-semibold">Total</span>
            <span className="font-heading font-bold text-2xl text-gold">
              ₹{total}
            </span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 pb-6">
        <Link
          href="/checkout"
          className="block w-full text-center bg-gold text-base font-heading font-semibold py-3.5 rounded-xl transition-all hover:bg-gold-light hover:shadow-[0_0_30px_rgba(212,168,83,0.2)] hover:scale-[1.01]"
        >
          Proceed to Checkout →
        </Link>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <span className="flex items-center gap-1 text-[10px] text-gray-600">
            <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Secure
          </span>
          <span className="flex items-center gap-1 text-[10px] text-gray-600">
            <span className="text-blue-400">₹</span>
            Razorpay
          </span>
          <span className="flex items-center gap-1 text-[10px] text-gray-600">
            📦 Delhivery
          </span>
        </div>
      </div>

      {/* WhatsApp help */}
      <div className="border-t border-white/5 px-6 py-4">
        <a
          href="https://wa.me/919584604150?text=Hi! I have a question about my order."
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-emerald-400 transition-colors"
        >
          <span>💬</span>
          Need help? Chat on WhatsApp
        </a>
      </div>
    </div>
  );
}
