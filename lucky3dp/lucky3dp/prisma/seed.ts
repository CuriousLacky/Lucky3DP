import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PRODUCTS = [
  // ── Pre-made posters (singles @ ₹149) ──
  {
    name: "Iron Man Classic",
    slug: "iron-man-classic",
    description: "A4 color printed Iron Man poster — classic armor suit.",
    category: "PREMADE_POSTER" as const,
    images: [],
    pricePerUnit: 149,
    packSize: null,
    packPrice: null,
  },
  {
    name: "Spider-Man Homecoming",
    slug: "spider-man-homecoming",
    description: "A4 color printed Spider-Man poster — web-slinging action.",
    category: "PREMADE_POSTER" as const,
    images: [],
    pricePerUnit: 149,
    packSize: null,
    packPrice: null,
  },
  {
    name: "Captain America Shield",
    slug: "captain-america-shield",
    description: "A4 color printed Captain America poster — iconic shield throw.",
    category: "PREMADE_POSTER" as const,
    images: [],
    pricePerUnit: 149,
    packSize: null,
    packPrice: null,
  },
  {
    name: "Doctor Strange Multiverse",
    slug: "doctor-strange-multiverse",
    description: "A4 color printed Doctor Strange poster — mystic arts.",
    category: "PREMADE_POSTER" as const,
    images: [],
    pricePerUnit: 149,
    packSize: null,
    packPrice: null,
  },
  {
    name: "Thor Ragnarok",
    slug: "thor-ragnarok",
    description: "A4 color printed Thor poster — lightning god.",
    category: "PREMADE_POSTER" as const,
    images: [],
    pricePerUnit: 149,
    packSize: null,
    packPrice: null,
  },
  {
    name: "Black Panther Wakanda",
    slug: "black-panther-wakanda",
    description: "A4 color printed Black Panther poster — Wakanda Forever.",
    category: "PREMADE_POSTER" as const,
    images: [],
    pricePerUnit: 149,
    packSize: null,
    packPrice: null,
  },
  {
    name: "Hulk Smash",
    slug: "hulk-smash",
    description: "A4 color printed Hulk poster — green rage.",
    category: "PREMADE_POSTER" as const,
    images: [],
    pricePerUnit: 149,
    packSize: null,
    packPrice: null,
  },

  // ── Pre-made poster packs (7-pack @ ₹249) ──
  {
    name: "Avengers Set of 7",
    slug: "avengers-set-of-7",
    description: "All 7 Avengers A4 posters in one discounted bundle.",
    category: "PREMADE_POSTER" as const,
    images: [],
    pricePerUnit: 249,
    packSize: 7,
    packPrice: 249,
  },

  // ── Custom photo printing ──
  {
    name: "Custom Photo Print — 4 Pack",
    slug: "custom-photo-4pack",
    description: "Upload 4 of your own photos, printed on A4 color.",
    category: "CUSTOM_PHOTO" as const,
    images: [],
    pricePerUnit: 170,
    packSize: 4,
    packPrice: 170,
  },
  {
    name: "Custom Photo Print — 7 Pack",
    slug: "custom-photo-7pack",
    description: "Upload 7 of your own photos, printed on A4 color.",
    category: "CUSTOM_PHOTO" as const,
    images: [],
    pricePerUnit: 289,
    packSize: 7,
    packPrice: 289,
  },
];

async function main() {
  console.log("🌱 Seeding Lucky 3DP database...\n");

  // Clear existing products
  await prisma.product.deleteMany();
  console.log("  Cleared existing products.");

  // Insert all products
  const result = await prisma.product.createMany({ data: PRODUCTS });
  console.log(`  ✅ Inserted ${result.count} products.\n`);

  // Log summary
  const products = await prisma.product.findMany({ orderBy: { createdAt: "asc" } });
  console.log("  Product catalog:");
  for (const p of products) {
    const pack = p.packSize ? ` (${p.packSize}-pack)` : "";
    console.log(`    • ${p.name}${pack} — ₹${p.pricePerUnit}`);
  }

  console.log("\n🎉 Seed complete.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
