import { create } from "zustand";
import { persist } from "zustand/middleware";

/* ─── Types ───────────────────────────────────────────── */

export type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  image?: string;          // emoji or Cloudinary URL
  packSize?: number;
  category: "premade" | "custom";
  tag?: string;            // "Marvel", "Anime", etc.
  uploadedImageUrls?: string[];
  packType?: "single" | "4pack" | "7pack";
};

export type PackDealSuggestion = {
  active: boolean;
  singleCount: number;     // how many individual premade posters
  currentTotal: number;    // what they'd pay at ₹149 each
  packTotal: number;       // what they'd pay with 7-pack (₹249)
  savings: number;
};

type CartStore = {
  items: CartItem[];

  // ── Actions ──
  addItem: (item: Omit<CartItem, "qty">) => void;
  addCustomPhotoOrder: (urls: string[], packType: "4pack" | "7pack") => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;

  // ── Derived ──
  getTotal: () => number;
  getSubtotal: () => number;
  getCount: () => number;
  getPremadeSingles: () => CartItem[];
  getPackDealSuggestion: () => PackDealSuggestion;
  applyPackDeal: () => void;

  // ── Convenience aliases ──
  total: () => number;
  count: () => number;
};

/* ─── Constants ───────────────────────────────────────── */

const SINGLE_PRICE = 149;
const PACK7_PRICE = 249;
const PACK_THRESHOLD = 7;

/* ─── Store ───────────────────────────────────────────── */

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      /* ── Add an item ───────────────────────────────── */
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, qty: i.qty + 1 } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, qty: 1 }] };
        }),

      /* ── Add custom photo order ────────────────────── */
      addCustomPhotoOrder: (urls, packType) => {
        const id = `custom-${Date.now()}`;
        const price = packType === "4pack" ? 170 : 289;
        const maxPhotos = packType === "4pack" ? 4 : 7;
        set((state) => ({
          items: [
            ...state.items,
            {
              id,
              name: `Custom Photo Print — ${maxPhotos} Pack`,
              price,
              qty: 1,
              category: "custom" as const,
              packType,
              packSize: maxPhotos,
              uploadedImageUrls: urls,
            },
          ],
        }));
      },

      /* ── Remove ────────────────────────────────────── */
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      /* ── Update quantity ───────────────────────────── */
      updateQty: (id, qty) =>
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter((i) => i.id !== id)
              : state.items.map((i) => (i.id === id ? { ...i, qty } : i)),
        })),

      /* ── Clear ─────────────────────────────────────── */
      clearCart: () => set({ items: [] }),

      /* ── Totals ────────────────────────────────────── */
      getSubtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.qty, 0),

      getTotal: () => get().getSubtotal(), // extend later with shipping/discounts

      getCount: () =>
        get().items.reduce((sum, i) => sum + i.qty, 0),

      // Aliases for backward compat
      total: () => get().getTotal(),
      count: () => get().getCount(),

      /* ── Pack deal logic ───────────────────────────── */
      getPremadeSingles: () =>
        get().items.filter(
          (i) => i.category === "premade" && i.packType === "single"
        ),

      getPackDealSuggestion: () => {
        const singles = get().getPremadeSingles();
        const singleCount = singles.reduce((sum, i) => sum + i.qty, 0);
        const currentTotal = singleCount * SINGLE_PRICE;

        // How many complete packs of 7 + leftover
        const fullPacks = Math.floor(singleCount / PACK_THRESHOLD);
        const leftover = singleCount % PACK_THRESHOLD;
        const packTotal = fullPacks * PACK7_PRICE + leftover * SINGLE_PRICE;
        const savings = currentTotal - packTotal;

        return {
          active: singleCount >= PACK_THRESHOLD,
          singleCount,
          currentTotal,
          packTotal,
          savings,
        };
      },

      /* ── Apply the pack deal ───────────────────────── */
      applyPackDeal: () =>
        set((state) => {
          const singles = state.items.filter(
            (i) => i.category === "premade" && i.packType === "single"
          );
          const others = state.items.filter(
            (i) => !(i.category === "premade" && i.packType === "single")
          );

          // Flatten all singles into a quantity count
          let totalQty = singles.reduce((sum, i) => sum + i.qty, 0);
          if (totalQty < PACK_THRESHOLD) return state;

          const fullPacks = Math.floor(totalQty / PACK_THRESHOLD);
          const leftover = totalQty % PACK_THRESHOLD;

          const newItems: CartItem[] = [...others];

          // Add pack items
          for (let p = 0; p < fullPacks; p++) {
            newItems.push({
              id: `pack-deal-${Date.now()}-${p}`,
              name: "7-Poster Value Pack",
              price: PACK7_PRICE,
              qty: 1,
              category: "premade",
              packType: "7pack",
              packSize: 7,
              image: "🔥",
              tag: "Deal",
            });
          }

          // Keep leftover singles (use the first N singles for naming)
          if (leftover > 0) {
            const leftoverSingles = singles.slice(0, leftover).map((s) => ({
              ...s,
              qty: 1,
            }));
            // If there are fewer unique singles than leftover, just add generic ones
            if (leftoverSingles.length < leftover) {
              const first = singles[0];
              for (let i = leftoverSingles.length; i < leftover; i++) {
                leftoverSingles.push({
                  ...first,
                  id: `leftover-${Date.now()}-${i}`,
                  qty: 1,
                });
              }
            }
            newItems.push(...leftoverSingles);
          }

          return { items: newItems };
        }),
    }),
    { name: "lucky3dp-cart" }
  )
);
