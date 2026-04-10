import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop A4 Posters — Marvel, Anime, Cars & More",
  description:
    "Browse premium A4 color printed posters from ₹149. Marvel, DC, Anime, Cars, Nature, Abstract. Custom photo printing from ₹170. Free shipping across India.",
  openGraph: {
    title: "Shop A4 Posters | LUCKY 3DP",
    description: "Premium posters from ₹149 + custom photo printing from ₹170. Free delivery.",
    url: "/posters",
  },
};

export default function PostersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
