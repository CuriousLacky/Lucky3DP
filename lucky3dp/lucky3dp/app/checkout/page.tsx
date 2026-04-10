"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import {
  shippingSchema,
  type ShippingFormData,
  INDIAN_STATES,
} from "@/lib/shipping-schema";
import {
  loadRazorpayScript,
  openRazorpayCheckout,
} from "@/lib/razorpay-client";
import { FormField, inputClassName } from "@/components/FormField";
import { trackCheckoutStarted, trackPaymentCompleted } from "@/components/GoogleAnalytics";

/* ─── Main Page ───────────────────────────────────────── */

export default function CheckoutPage() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [pinLooking, setPinLooking] = useState(false);
  const [pinService, setPinService] = useState<{
    checked: boolean;
    available: boolean;
    estimatedDays?: number;
    message?: string;
  }>({ checked: false, available: true });

  const items = useCartStore((s) => s.items);
  const getTotal = useCartStore((s) => s.getTotal);
  const getCount = useCartStore((s) => s.getCount);
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => setHydrated(true), []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      pinCode: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      country: "India",
      email: "",
      phone: "",
      whatsappUpdates: true,
    },
  });

  const watchAll = watch();

  /* ── PIN code auto-lookup ───────────────────────────── */
  const pinCode = watch("pinCode");

  const lookupPin = useCallback(
    async (pin: string) => {
      if (!/^\d{6}$/.test(pin)) return;
      setPinLooking(true);
      setPinService({ checked: false, available: true });
      try {
        // Parallel: India Post city/state + Delhivery serviceability
        const [postRes, delRes] = await Promise.allSettled([
          fetch(`/api/pin-lookup?pin=${pin}`),
          fetch(`/api/shipping/check-pincode/${pin}`),
        ]);

        // City/state auto-fill
        if (postRes.status === "fulfilled" && postRes.value.ok) {
          const data = await postRes.value.json();
          if (data.city) setValue("city", data.city, { shouldValidate: true });
          if (data.state) setValue("state", data.state, { shouldValidate: true });
        }

        // Delivery availability
        if (delRes.status === "fulfilled" && delRes.value.ok) {
          const svc = await delRes.value.json();
          setPinService({
            checked: true,
            available: svc.available,
            estimatedDays: svc.estimatedDays,
            message: svc.available
              ? `Delivery available${svc.estimatedDays ? ` (${svc.estimatedDays} days)` : ""}`
              : "Delivery not available at this PIN code",
          });
        } else {
          // If Delhivery check fails, assume available (don't block checkout)
          setPinService({ checked: true, available: true, message: undefined });
        }
      } catch {
        // silent fail — user can still type manually
      } finally {
        setPinLooking(false);
      }
    },
    [setValue]
  );

  useEffect(() => {
    if (pinCode?.length === 6) lookupPin(pinCode);
  }, [pinCode, lookupPin]);

  /* ── Payment flow ───────────────────────────────────── */
  const onSubmit = async (data: ShippingFormData) => {
    if (items.length === 0) return;
    setPaying(true);
    setPayError(null);
    trackCheckoutStarted(getTotal(), getCount());

    try {
      // 1. Load Razorpay
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error("Failed to load payment gateway");

      // 2. Create order on backend
      const createRes = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.id,
            name: item.name,
            quantity: item.qty,
            packType: item.packType || "single",
            unitPrice: item.price,
            uploadedImageUrls: item.uploadedImageUrls || [],
          })),
          shipping: data,
        }),
      });

      if (!createRes.ok) {
        const err = await createRes.json();
        throw new Error(err.error || "Order creation failed");
      }

      const order = await createRes.json();

      // 3. Open Razorpay checkout
      openRazorpayCheckout({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: order.amount * 100,
        currency: order.currency,
        name: "LUCKY 3DP",
        description: `Order ${order.orderNumber}`,
        order_id: order.razorpayOrderId,
        prefill: {
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          contact: `+91${data.phone}`,
        },
        theme: { color: "#D4A853" },
        handler: async (response) => {
          // 4. Verify payment
          try {
            const verifyRes = await fetch("/api/orders/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                orderNumber: order.orderNumber,
              }),
            });

            if (!verifyRes.ok) {
              const err = await verifyRes.json();
              throw new Error(err.error || "Verification failed");
            }

            // 5. Success — clear cart & redirect
            trackPaymentCompleted(order.orderNumber, order.amount);
            clearCart();
            router.push(`/order-confirmation/${order.orderNumber}?total=${order.amount}`);
          } catch (err: any) {
            setPayError(err.message || "Payment verification failed");
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPaying(false);
          },
        },
      });
    } catch (err: any) {
      setPayError(err.message || "Something went wrong");
      setPaying(false);
    }
  };

  /* ── Loading skeleton ───────────────────────────────── */
  if (!hydrated) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="h-10 w-48 shimmer rounded-xl mb-8" />
        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          <div className="glass rounded-2xl h-[600px] shimmer" />
          <div className="glass rounded-2xl h-[400px] shimmer" />
        </div>
      </div>
    );
  }

  /* ── Empty cart redirect ────────────────────────────── */
  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/[0.03] flex items-center justify-center text-3xl">
          🛒
        </div>
        <h1 className="font-heading font-bold text-2xl mb-2">Cart is empty</h1>
        <p className="text-gray-500 mb-6">Add items before checking out.</p>
        <Link
          href="/posters"
          className="inline-block bg-gold text-base font-heading font-semibold px-6 py-3 rounded-xl"
        >
          Shop Posters
        </Link>
      </div>
    );
  }

  const total = getTotal();
  const itemCount = getCount();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/[0.03] to-transparent" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-gray-600 mb-4">
            <Link href="/cart" className="hover:text-gold transition-colors">
              Cart
            </Link>
            <span>→</span>
            <span className="text-gray-400">Checkout</span>
          </div>
          <h1 className="font-heading font-bold text-3xl sm:text-4xl">
            <span className="text-gold">Checkout</span>
          </h1>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20"
      >
        <div className="grid lg:grid-cols-[1fr_360px] gap-6 mt-6">
          {/* ── Left: Shipping Form ───────────────────── */}
          <div className="space-y-6">
            {/* Name */}
            <div className="glass rounded-2xl p-6">
              <h2 className="font-heading font-semibold text-xs text-gray-500 tracking-[0.15em] uppercase mb-5 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-gold/10 flex items-center justify-center text-[10px] text-gold">
                  1
                </span>
                Personal Details
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <FormField
                  label="First Name"
                  required
                  maxLength={46}
                  currentLength={watchAll.firstName?.length || 0}
                  error={errors.firstName?.message}
                >
                  <input
                    {...register("firstName")}
                    maxLength={46}
                    placeholder="Lucky"
                    className={inputClassName(!!errors.firstName)}
                  />
                </FormField>

                <FormField
                  label="Last Name"
                  required
                  maxLength={46}
                  currentLength={watchAll.lastName?.length || 0}
                  error={errors.lastName?.message}
                >
                  <input
                    {...register("lastName")}
                    maxLength={46}
                    placeholder="Sharma"
                    className={inputClassName(!!errors.lastName)}
                  />
                </FormField>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                <FormField
                  label="Email"
                  required
                  error={errors.email?.message}
                >
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="you@email.com"
                    className={inputClassName(!!errors.email)}
                  />
                </FormField>

                <FormField
                  label="Phone"
                  required
                  error={errors.phone?.message}
                >
                  <div className="flex">
                    <span className="flex items-center px-3 bg-base-lighter border border-r-0 border-white/10 rounded-l-xl text-xs text-gray-500">
                      +91
                    </span>
                    <input
                      {...register("phone")}
                      type="tel"
                      maxLength={10}
                      placeholder="9584604150"
                      className={`flex-1 bg-base-lighter border rounded-r-xl px-4 py-2.5 text-sm focus:outline-none transition-colors placeholder-gray-600 ${
                        errors.phone
                          ? "border-red-500/40 focus:border-red-500/60"
                          : "border-white/10 focus:border-gold/40"
                      }`}
                    />
                  </div>
                </FormField>
              </div>
            </div>

            {/* Address */}
            <div className="glass rounded-2xl p-6">
              <h2 className="font-heading font-semibold text-xs text-gray-500 tracking-[0.15em] uppercase mb-5 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-gold/10 flex items-center justify-center text-[10px] text-gold">
                  2
                </span>
                Shipping Address
              </h2>

              {/* PIN + auto-fetch */}
              <div className="grid sm:grid-cols-3 gap-4">
                <FormField
                  label="PIN Code"
                  required
                  error={errors.pinCode?.message}
                >
                  <div className="relative">
                    <input
                      {...register("pinCode")}
                      maxLength={6}
                      placeholder="474001"
                      className={inputClassName(!!errors.pinCode)}
                    />
                    {pinLooking && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
                      </div>
                    )}
                  </div>
                  {pinService.checked && (
                    <p className={`text-[10px] mt-1 flex items-center gap-1 ${
                      pinService.available ? "text-emerald-400" : "text-red-400"
                    }`}>
                      {pinService.available ? (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      {pinService.message}
                    </p>
                  )}
                </FormField>

                <FormField
                  label="City"
                  required
                  maxLength={251}
                  currentLength={watchAll.city?.length || 0}
                  error={errors.city?.message}
                >
                  <input
                    {...register("city")}
                    maxLength={251}
                    placeholder="Gwalior"
                    className={inputClassName(!!errors.city)}
                  />
                </FormField>

                <FormField
                  label="State"
                  required
                  error={errors.state?.message}
                >
                  <select
                    {...register("state")}
                    className={`${inputClassName(!!errors.state)} appearance-none cursor-pointer`}
                  >
                    <option value="" className="bg-base-lighter">
                      Select state
                    </option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s} className="bg-base-lighter">
                        {s}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>

              <div className="mt-4">
                <FormField
                  label="Address Line 1"
                  required
                  maxLength={46}
                  currentLength={watchAll.addressLine1?.length || 0}
                  error={errors.addressLine1?.message}
                >
                  <input
                    {...register("addressLine1")}
                    maxLength={46}
                    placeholder="House/Flat No., Street"
                    className={inputClassName(!!errors.addressLine1)}
                  />
                </FormField>
              </div>

              <div className="mt-4">
                <FormField
                  label="Address Line 2 (optional)"
                  maxLength={46}
                  currentLength={watchAll.addressLine2?.length || 0}
                  error={errors.addressLine2?.message}
                >
                  <input
                    {...register("addressLine2")}
                    maxLength={46}
                    placeholder="Landmark, Area"
                    className={inputClassName(!!errors.addressLine2)}
                  />
                </FormField>
              </div>

              {/* Country locked */}
              <div className="mt-4">
                <FormField label="Country">
                  <div className="w-full bg-base-lighter/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-gray-500 cursor-not-allowed flex items-center gap-2">
                    🇮🇳 India
                    <svg className="w-3 h-3 text-gray-600 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </FormField>
              </div>
            </div>

            {/* WhatsApp opt-in */}
            <div className="glass rounded-2xl p-6">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  {...register("whatsappUpdates")}
                  className="mt-0.5 accent-emerald-500 w-4 h-4"
                />
                <div>
                  <p className="text-sm font-medium group-hover:text-white transition-colors">
                    WhatsApp shipping updates
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Get order tracking & delivery notifications on WhatsApp at +91{watchAll.phone || "..."}
                  </p>
                </div>
                <span className="ml-auto text-lg">💬</span>
              </label>
            </div>
          </div>

          {/* ── Right: Order Summary ──────────────────── */}
          <div className="lg:sticky lg:top-24 h-fit space-y-4">
            {/* Items */}
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5">
                <h2 className="font-heading font-semibold text-xs tracking-[0.15em] uppercase text-gray-500">
                  Order Summary
                </h2>
              </div>

              <div className="p-5 space-y-3 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0 ${
                        item.category === "custom"
                          ? "bg-cyan/10"
                          : "bg-amber-900/20"
                      }`}
                    >
                      {item.category === "custom" &&
                      item.uploadedImageUrls?.[0] ? (
                        <img
                          src={item.uploadedImageUrls[0]}
                          alt=""
                          className="w-full h-full rounded-lg object-cover"
                        />
                      ) : (
                        item.image || "🖼️"
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-gray-600">
                        Qty: {item.qty} × ₹{item.price}
                      </p>
                    </div>
                    <span className="text-xs font-heading font-semibold text-gold shrink-0">
                      ₹{item.price * item.qty}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/5 p-5 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">
                    Subtotal ({itemCount} item{itemCount !== 1 ? "s" : ""})
                  </span>
                  <span>₹{total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Shipping</span>
                  <span className="text-emerald-400">Free</span>
                </div>
                {pinService.checked && pinService.available && pinService.estimatedDays && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Est. Delivery</span>
                    <span className="text-gray-300">{pinService.estimatedDays} days</span>
                  </div>
                )}
                <div className="border-t border-white/5 pt-3 flex justify-between items-center">
                  <span className="font-heading font-semibold">Total</span>
                  <span className="font-heading font-bold text-2xl text-gold">
                    ₹{total}
                  </span>
                </div>
              </div>
            </div>

            {/* Pay button */}
            {/* PIN not serviceable warning */}
            {pinService.checked && !pinService.available && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Delivery is not available at this PIN code. Please try a different address.
              </div>
            )}

            <button
              type="submit"
              disabled={paying || (pinService.checked && !pinService.available)}
              className={`w-full py-4 rounded-xl font-heading font-semibold text-sm transition-all ${
                paying || (pinService.checked && !pinService.available)
                  ? "bg-gold/50 text-base/70 cursor-wait"
                  : "bg-gold text-base hover:bg-gold-light hover:shadow-[0_0_30px_rgba(212,168,83,0.2)] hover:scale-[1.01]"
              }`}
            >
              {paying ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-base/30 border-t-base animate-spin" />
                  Processing...
                </span>
              ) : (
                `Pay ₹${total} with Razorpay →`
              )}
            </button>

            {/* Error */}
            {payError && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 flex items-start gap-2">
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium">Payment failed</p>
                  <p className="text-xs text-red-400/70 mt-0.5">{payError}</p>
                </div>
              </div>
            )}

            {/* Trust */}
            <div className="flex items-center justify-center gap-4 py-2">
              <span className="flex items-center gap-1 text-[10px] text-gray-600">
                <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                SSL Encrypted
              </span>
              <span className="text-[10px] text-gray-600">₹ Razorpay</span>
              <span className="text-[10px] text-gray-600">📦 Delhivery</span>
            </div>

            {/* Edit cart */}
            <div className="text-center">
              <Link
                href="/cart"
                className="text-xs text-gray-600 hover:text-gold transition-colors"
              >
                ← Edit cart
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
