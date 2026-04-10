import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import ClientProviders from "@/components/ClientProviders";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { OrganizationJsonLd } from "@/components/JsonLd";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://lucky3dp.netlify.app";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0D1117" },
    { media: "(prefers-color-scheme: light)", color: "#F8F9FA" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "LUCKY 3DP — Color Printed A4 Posters & Curious AI Prompt Tool",
    template: "%s | LUCKY 3DP",
  },
  description:
    "Premium A4 color printed posters starting at ₹149. Custom photo printing, AI prompt tools, and fast delivery across India via Delhivery. Shop Marvel, Anime, Cars & more.",
  keywords: [
    "A4 posters India",
    "color printed posters",
    "custom photo printing",
    "AI prompt generator",
    "Curious AI",
    "Lucky 3DP",
    "poster printing India",
    "affordable posters",
    "Marvel posters",
    "Anime posters",
  ],
  authors: [{ name: "Lucky 3DP", url: SITE_URL }],
  creator: "Lucky 3DP",
  publisher: "Lucky 3DP",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "LUCKY 3DP",
    title: "LUCKY 3DP — Color Printed A4 Posters & Curious AI Prompt Tool",
    description:
      "Premium A4 color printed posters from ₹149. Custom photo printing & free AI prompt tools. Fast delivery across India.",
    images: [
      {
        url: "/images/Gemini_Generated_Image_mhpanwmhpanwmhpa.png",
        width: 1200,
        height: 630,
        alt: "Lucky 3DP — Color Printed Posters & AI Prompts",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LUCKY 3DP — Color Printed A4 Posters & Curious AI",
    description:
      "Premium A4 posters from ₹149. Custom photo printing & AI prompt tools. Delivery across India.",
    images: ["/images/Gemini_Generated_Image_mhpanwmhpanwmhpa.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/images/Gemini_Generated_Image_mhpanwmhpanwmhpa.png", type: "image/png" },
    ],
    apple: "/images/Gemini_Generated_Image_mhpanwmhpanwmhpa.png",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: SITE_URL,
  },
  category: "E-commerce",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <OrganizationJsonLd />
        <GoogleAnalytics />
      </head>
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <ClientProviders>{children}</ClientProviders>
        </main>
        <Footer />
        <WhatsAppFloat />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
