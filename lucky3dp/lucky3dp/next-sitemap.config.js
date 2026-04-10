/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://lucky3dp.netlify.app",
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  changefreq: "weekly",
  priority: 0.7,

  // Exclude private/dynamic routes from sitemap
  exclude: [
    "/cart",
    "/checkout",
    "/order-confirmation/*",
    "/api/*",
  ],

  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/cart", "/checkout", "/order-confirmation/"],
      },
    ],
    additionalSitemaps: [],
  },

  // Custom priority per route
  transform: async (config, path) => {
    const priorities = {
      "/": 1.0,
      "/posters": 0.9,
      "/curious-ai": 0.8,
    };

    return {
      loc: path,
      changefreq: config.changefreq,
      priority: priorities[path] || config.priority,
      lastmod: new Date().toISOString(),
    };
  },
};
