"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { trackPaymentCompleted } from "@/components/GoogleAnalytics";

export default function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const searchParams = useSearchParams();
  const total = searchParams.get("total") || "";
  const [copied, setCopied] = useState(false);

  // Track purchase on mount
  useEffect(() => {
    if (orderId && total) {
      trackPaymentCompleted(orderId, parseFloat(total) || 0);
    }
  }, [orderId, total]);

  // Confetti-like particle effect on mount
  const [showConfetti, setShowConfetti] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(t);
  }, []);

  // Estimated delivery: 5-7 business days from now
  const deliveryStart = new Date();
  deliveryStart.setDate(deliveryStart.getDate() + 5);
  const deliveryEnd = new Date();
  deliveryEnd.setDate(deliveryEnd.getDate() + 7);

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  function copyOrderId() {
    navigator.clipboard.writeText(orderId || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const whatsappMsg = encodeURIComponent(
    `Hi! I just placed order ${orderId} on Lucky 3DP.${total ? ` Total: ₹${total}.` : ""} Please confirm my order. Thank you!`
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* BG effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/[0.03] via-transparent to-transparent" />

      {/* Floating confetti dots */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 60}%`,
                backgroundColor:
                  ["#D4A853", "#38BDF8", "#10B981", "#A855F7", "#F59E0B"][
                    i % 5
                  ],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`,
                opacity: 0.6,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        {/* Success icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="font-heading font-bold text-3xl sm:text-4xl mb-2">
            Order <span className="text-emerald-400">Confirmed!</span>
          </h1>
          <p className="text-gray-400">
            Thank you for your purchase. Your posters are being prepared.
          </p>
        </div>

        {/* Order number card */}
        <div className="glass rounded-2xl p-6 text-center mb-6">
          <p className="text-[10px] text-gray-500 tracking-[0.2em] uppercase mb-2">
            Order Number
          </p>
          <div className="flex items-center justify-center gap-3">
            <p className="font-heading font-bold text-2xl sm:text-3xl text-gold tracking-wider">
              {orderId}
            </p>
            <button
              onClick={copyOrderId}
              className={`p-2 rounded-lg transition-all ${
                copied
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-white/5 text-gray-500 hover:text-white hover:bg-white/10"
              }`}
              title="Copy order number"
            >
              {copied ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Status timeline */}
        <div className="glass rounded-2xl p-6 mb-6">
          <h2 className="font-heading font-semibold text-xs text-gray-500 tracking-[0.15em] uppercase mb-5">
            Order Status
          </h2>

          <div className="space-y-4">
            {[
              {
                label: "Order Placed",
                detail: "Payment received",
                status: "done" as const,
                icon: "✓",
              },
              {
                label: "Processing",
                detail: "Preparing your posters",
                status: "active" as const,
                icon: "⏳",
              },
              {
                label: "Shipped",
                detail: "Via Delhivery courier",
                status: "pending" as const,
                icon: "📦",
              },
              {
                label: "Delivered",
                detail: `Est. ${formatDate(deliveryStart)} – ${formatDate(deliveryEnd)}`,
                status: "pending" as const,
                icon: "🏠",
              },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                {/* Status indicator */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${
                      step.status === "done"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : step.status === "active"
                          ? "bg-gold/20 text-gold border border-gold/30"
                          : "bg-white/5 text-gray-600 border border-white/5"
                    }`}
                  >
                    {step.icon}
                  </div>
                  {i < 3 && (
                    <div
                      className={`w-px h-6 mt-1 ${
                        step.status === "done"
                          ? "bg-emerald-500/30"
                          : "bg-white/5"
                      }`}
                    />
                  )}
                </div>

                {/* Text */}
                <div className="pt-1">
                  <p
                    className={`text-sm font-medium ${
                      step.status === "done"
                        ? "text-emerald-400"
                        : step.status === "active"
                          ? "text-gold"
                          : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-600">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Details grid */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="glass rounded-2xl p-5">
            <h3 className="text-[10px] text-gray-500 tracking-[0.15em] uppercase mb-3">
              Payment
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Status</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Paid
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Method</span>
                <span>Razorpay</span>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <h3 className="text-[10px] text-gray-500 tracking-[0.15em] uppercase mb-3">
              Delivery
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Courier</span>
                <span>📦 Delhivery</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Estimated</span>
                <span className="text-xs">
                  {formatDate(deliveryStart)} – {formatDate(deliveryEnd)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Updates</span>
                <span className="text-emerald-400">WhatsApp ✓</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={`https://wa.me/919584604150?text=${whatsappMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-heading font-semibold text-sm rounded-xl transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.37 0-4.567-.804-6.307-2.156l-.44-.348-2.66.891.891-2.66-.348-.44A9.96 9.96 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z" />
            </svg>
            Share on WhatsApp
          </a>

          <Link
            href="/"
            className="w-full sm:w-auto text-center px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/5 text-sm font-heading font-medium rounded-xl transition-all"
          >
            Back to Home
          </Link>
        </div>

        {/* Support note */}
        <p className="text-center text-xs text-gray-600 mt-8">
          Questions about your order? WhatsApp us at{" "}
          <a
            href="https://wa.me/919584604150"
            className="text-emerald-400 hover:underline"
          >
            +91 95846 04150
          </a>{" "}
          with your order number.
        </p>
      </div>
    </div>
  );
}
