import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";

/**
 * Robots.txt configuration
 * Tells search engines how to crawl the site
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/login",
        ],
      },
      {
        userAgent: "GPTBot", // OpenAI
        allow: "/",
        disallow: ["/admin/", "/api/", "/login"],
      },
      {
        userAgent: "ChatGPT-User", // ChatGPT
        allow: "/",
        disallow: ["/admin/", "/api/", "/login"],
      },
      {
        userAgent: "Claude-Web", // Anthropic Claude
        allow: "/",
        disallow: ["/admin/", "/api/", "/login"],
      },
      {
        userAgent: "Google-Extended", // Google AI
        allow: "/",
        disallow: ["/admin/", "/api/", "/login"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
