"use client";

import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";

/* ─── GA4 Script Component ────────────────────────────── */

export default function GoogleAnalytics() {
  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            page_path: window.location.pathname,
            send_page_view: true,
          });
        `}
      </Script>
    </>
  );
}

/* ─── Event Tracking Helpers ──────────────────────────── */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

function gtag(...args: any[]) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag(...args);
  }
}

/** Track any custom event */
export function trackEvent(
  action: string,
  category: string,
  label?: string,
  value?: number
) {
  gtag("event", action, {
    event_category: category,
    event_label: label,
    value,
  });
}

/* ── Pre-built tracking functions ─────────────────────── */

export function trackAddToCart(productName: string, price: number) {
  gtag("event", "add_to_cart", {
    currency: "INR",
    value: price,
    items: [{ item_name: productName, price }],
  });
}

export function trackCheckoutStarted(total: number, itemCount: number) {
  gtag("event", "begin_checkout", {
    currency: "INR",
    value: total,
    items: [{ item_name: `${itemCount} items`, price: total }],
  });
}

export function trackPaymentCompleted(orderNumber: string, total: number) {
  gtag("event", "purchase", {
    transaction_id: orderNumber,
    currency: "INR",
    value: total,
  });
}

export function trackCuriousAIOpened() {
  trackEvent("curious_ai_opened", "engagement", "Curious AI Page");
}

export function trackPromptCopied(category: string, platform?: string) {
  trackEvent("prompt_copied", "curious_ai", platform || category);
}

export function trackAdViewed(duration: number) {
  trackEvent("ad_viewed", "monetization", "Adsterra Gateway", duration);
}

export function trackPageView(path: string) {
  gtag("event", "page_view", { page_path: path });
}
