export type PosterTag =
  | "Marvel"
  | "DC"
  | "Anime"
  | "Cars"
  | "Nature"
  | "Abstract"
  | "Custom";

export type PosterData = {
  id: string;
  name: string;
  price: number;
  tag: PosterTag;
  emoji: string;
  gradient: string;
  packSize?: number;
  packPrice?: number;
};

export const POSTER_CATALOG: PosterData[] = [
  // ── Marvel ──
  { id: "iron-man-classic", name: "Iron Man Classic", price: 149, tag: "Marvel", emoji: "🦾", gradient: "from-red-900/30 to-amber-900/15" },
  { id: "spider-man-home", name: "Spider-Man Homecoming", price: 149, tag: "Marvel", emoji: "🕷️", gradient: "from-red-900/30 to-blue-900/15" },
  { id: "captain-america", name: "Captain America", price: 149, tag: "Marvel", emoji: "🛡️", gradient: "from-blue-900/30 to-red-900/10" },
  { id: "doctor-strange", name: "Doctor Strange", price: 149, tag: "Marvel", emoji: "✨", gradient: "from-indigo-900/30 to-purple-900/15" },
  { id: "thor-ragnarok", name: "Thor Ragnarok", price: 149, tag: "Marvel", emoji: "⚡", gradient: "from-blue-800/30 to-yellow-900/15" },
  { id: "black-panther", name: "Black Panther", price: 149, tag: "Marvel", emoji: "🐾", gradient: "from-purple-900/30 to-gray-900/15" },
  { id: "hulk-smash", name: "Hulk Smash", price: 149, tag: "Marvel", emoji: "💪", gradient: "from-green-900/30 to-gray-900/15" },
  { id: "avengers-7pk", name: "Avengers Set of 7", price: 249, tag: "Marvel", emoji: "🔥", gradient: "from-purple-900/30 to-blue-900/15", packSize: 7, packPrice: 249 },

  // ── DC ──
  { id: "batman-dark", name: "Batman Dark Knight", price: 149, tag: "DC", emoji: "🦇", gradient: "from-gray-900/40 to-blue-900/10" },
  { id: "superman-hope", name: "Superman Man of Steel", price: 149, tag: "DC", emoji: "💎", gradient: "from-blue-900/30 to-red-900/10" },
  { id: "wonder-woman", name: "Wonder Woman", price: 149, tag: "DC", emoji: "⚔️", gradient: "from-amber-900/30 to-red-900/15" },
  { id: "flash-speed", name: "The Flash", price: 149, tag: "DC", emoji: "⚡", gradient: "from-red-800/30 to-yellow-900/15" },

  // ── Anime ──
  { id: "naruto-sage", name: "Naruto Sage Mode", price: 149, tag: "Anime", emoji: "🍥", gradient: "from-orange-900/30 to-yellow-900/10" },
  { id: "goku-ultra", name: "Goku Ultra Instinct", price: 149, tag: "Anime", emoji: "🐉", gradient: "from-blue-800/30 to-purple-900/15" },
  { id: "one-piece-luffy", name: "Luffy Gear 5", price: 149, tag: "Anime", emoji: "🏴‍☠️", gradient: "from-red-900/30 to-amber-900/15" },
  { id: "aot-eren", name: "Attack on Titan", price: 149, tag: "Anime", emoji: "⚔️", gradient: "from-gray-900/30 to-red-900/15" },

  // ── Cars ──
  { id: "lamborghini", name: "Lamborghini Aventador", price: 149, tag: "Cars", emoji: "🏎️", gradient: "from-yellow-900/30 to-gray-900/10" },
  { id: "porsche-gt", name: "Porsche 911 GT3", price: 149, tag: "Cars", emoji: "🚗", gradient: "from-gray-800/30 to-red-900/10" },
  { id: "mustang-gt", name: "Ford Mustang GT", price: 149, tag: "Cars", emoji: "🐴", gradient: "from-blue-900/30 to-gray-900/15" },

  // ── Nature ──
  { id: "mountain-dawn", name: "Mountain Dawn", price: 149, tag: "Nature", emoji: "🏔️", gradient: "from-cyan-900/30 to-emerald-900/10" },
  { id: "ocean-sunset", name: "Ocean Sunset", price: 149, tag: "Nature", emoji: "🌊", gradient: "from-orange-900/30 to-blue-900/15" },
  { id: "northern-lights", name: "Northern Lights", price: 149, tag: "Nature", emoji: "🌌", gradient: "from-emerald-900/30 to-purple-900/15" },

  // ── Abstract ──
  { id: "neon-geometry", name: "Neon Geometry", price: 149, tag: "Abstract", emoji: "🔷", gradient: "from-cyan-900/30 to-pink-900/10" },
  { id: "fluid-gold", name: "Fluid Gold", price: 149, tag: "Abstract", emoji: "✴️", gradient: "from-amber-900/30 to-orange-900/15" },
  { id: "digital-waves", name: "Digital Waves", price: 149, tag: "Abstract", emoji: "🌀", gradient: "from-purple-900/30 to-cyan-900/10" },
];

export const ALL_TAGS: PosterTag[] = [
  "Marvel",
  "DC",
  "Anime",
  "Cars",
  "Nature",
  "Abstract",
];
