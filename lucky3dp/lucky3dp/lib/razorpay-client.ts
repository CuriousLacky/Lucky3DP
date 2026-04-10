/* ─── Razorpay Window Types ───────────────────────────── */

export interface RazorpayOptions {
  key: string;
  amount: number; // in paise
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayInstance {
  open: () => void;
  close: () => void;
  on: (event: string, handler: (response: unknown) => void) => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

/* ─── Load Razorpay Script ────────────────────────────── */

let loaded = false;

export function loadRazorpayScript(): Promise<boolean> {
  if (loaded) return Promise.resolve(true);

  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);

    if (window.Razorpay) {
      loaded = true;
      return resolve(true);
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      loaded = true;
      resolve(true);
    };
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/* ─── Open Razorpay Checkout ──────────────────────────── */

export function openRazorpayCheckout(
  options: RazorpayOptions
): RazorpayInstance | null {
  if (typeof window === "undefined" || !window.Razorpay) return null;
  const rzp = new window.Razorpay(options);
  rzp.open();
  return rzp;
}
