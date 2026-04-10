/**
 * JSON-LD Structured Data for SEO
 * Used in layout and page-level components.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://lucky3dp.netlify.app";

/* ─── Organization (Homepage) ─────────────────────────── */

export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Lucky 3DP",
    alternateName: "LUCKY 3DP",
    url: SITE_URL,
    logo: `${SITE_URL}/images/Gemini_Generated_Image_mhpanwmhpanwmhpa.png`,
    description:
      "Premium A4 color printed posters, custom photo printing, and AI prompt tools. Based in Gwalior, India.",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-9584604150",
      contactType: "customer service",
      availableLanguage: ["English", "Hindi"],
      areaServed: "IN",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Gwalior",
      addressRegion: "Madhya Pradesh",
      addressCountry: "IN",
    },
    sameAs: [
      "https://wa.me/919584604150",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/* ─── Product (Poster pages) ──────────────────────────── */

export function ProductJsonLd({
  name,
  description,
  price,
  image,
  slug,
  inStock = true,
}: {
  name: string;
  description: string;
  price: number;
  image?: string;
  slug: string;
  inStock?: boolean;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image: image || `${SITE_URL}/images/Gemini_Generated_Image_mhpanwmhpanwmhpa.png`,
    url: `${SITE_URL}/posters#${slug}`,
    brand: {
      "@type": "Brand",
      name: "Lucky 3DP",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: price.toString(),
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Lucky 3DP",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0",
          currency: "INR",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 2,
            unitCode: "d",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 3,
            maxValue: 7,
            unitCode: "d",
          },
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "IN",
        },
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/* ─── WebSite (search action) ─────────────────────────── */

export function WebSiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Lucky 3DP",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/posters?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/* ─── ItemList (poster catalog) ───────────────────────── */

export function ItemListJsonLd({
  items,
}: {
  items: { name: string; price: number; position: number; url: string }[];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item) => ({
      "@type": "ListItem",
      position: item.position,
      item: {
        "@type": "Product",
        name: item.name,
        url: item.url,
        offers: {
          "@type": "Offer",
          priceCurrency: "INR",
          price: item.price.toString(),
        },
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
