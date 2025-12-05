/**
 * SEO Configuration and Utilities
 * Centralized SEO settings for FlowKit
 */

export const siteConfig = {
  name: "FlowKit",
  domain: "flowkit.in",
  url: "https://www.flowkit.in",
  title: "FlowKit - Free n8n Workflow Templates & Open Source Automation Library",
  description: "Explore 150+ free n8n workflow templates. Open source n8n automation library with AI-powered workflow builder. Download production-ready n8n workflows, templates, and integrations. Free n8n workflow marketplace.",
  keywords: [
    // Primary Keywords
    "n8n workflow",
    "n8n workflows",
    "n8n template",
    "n8n templates",
    "n8n workflow templates",
    "n8n automation",

    // Free & Open Source
    "free n8n workflows",
    "free n8n templates",
    "open source n8n",
    "open source workflow library",
    "open source automation",
    "free workflow templates",

    // Marketplace & Library
    "n8n marketplace",
    "n8n library",
    "n8n workflow library",
    "n8n template library",
    "workflow marketplace",

    // Automation
    "workflow automation",
    "automation workflows",
    "automation templates",
    "workflow templates",
    "no-code automation",
    "low-code automation",

    // AI & Tools
    "ai workflow builder",
    "ai workflow generator",
    "workflow builder",
    "automation builder",

    // Integration
    "n8n integrations",
    "workflow integrations",
    "automation integrations",

    // Community
    "n8n community",
    "n8n examples",
    "n8n workflows free download",
    "n8n workflow examples",

    // Use Cases
    "slack automation n8n",
    "email automation n8n",
    "data sync automation",
    "ai automation workflows",

    // Tools
    "automation tools",
    "workflow tools",
    "n8n workflow hub"
  ],
  author: "FlowKit Team",
  creator: "@flowkit",
  publisher: "FlowKit",

  // Social Media
  social: {
    twitter: "@flowkit_in",
    github: "https://github.com/harshit-exe/FlowKit",
  },

  // Open Graph Images
  ogImage: "/og-image.png",
  twitterImage: "/twitter-image.png",

  // Contact
  email: "hello@flowkit.in",

  // Branding
  themeColor: "#000000",
  backgroundColor: "#ffffff",
};

export const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": siteConfig.name,
  "description": siteConfig.description,
  "url": siteConfig.url,
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${siteConfig.url}/search?q={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  },
  "sameAs": [
    siteConfig.social.github,
  ]
};

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": siteConfig.name,
  "url": siteConfig.url,
  "logo": `${siteConfig.url}/logo.png`,
  "description": siteConfig.description,
  "sameAs": [
    siteConfig.social.github,
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "email": siteConfig.email,
    "contactType": "Customer Service"
  }
};

/**
 * Generate page metadata for SEO
 */
export function generateMetadata({
  title,
  description,
  path = "",
  image,
  noindex = false,
  keywords,
}: {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noindex?: boolean;
  keywords?: string[];
}) {
  const pageTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.title;
  const pageDescription = description || siteConfig.description;
  const pageUrl = `${siteConfig.url}${path}`;
  const pageImage = image || siteConfig.ogImage;
  const pageKeywords = keywords || siteConfig.keywords;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: pageKeywords.join(", "),
    authors: [{ name: siteConfig.author }],
    creator: siteConfig.creator,
    publisher: siteConfig.publisher,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: pageUrl,
    },
    robots: noindex ? "noindex, nofollow" : "index, follow",
    openGraph: {
      type: "website",
      locale: "en_US",
      url: pageUrl,
      title: pageTitle,
      description: pageDescription,
      siteName: siteConfig.name,
      images: [
        {
          url: pageImage,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [pageImage],
      creator: siteConfig.social.twitter,
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/favicon.png", type: "image/png" },
      ],
      shortcut: "/favicon.ico",
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
      other: [
        {
          rel: "icon",
          type: "image/png",
          sizes: "192x192",
          url: "/android-chrome-192x192.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "512x512",
          url: "/android-chrome-512x512.png",
        },
      ],
    },
    manifest: "/site.webmanifest",
  };
}

/**
 * Generate structured data for workflow
 */
export function generateWorkflowJsonLd(workflow: {
  name: string;
  description: string;
  slug: string;
  category: string;
  downloads: number;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    "name": workflow.name,
    "description": workflow.description,
    "url": `${siteConfig.url}/workflows/${workflow.slug}`,
    "programmingLanguage": "JSON",
    "codeRepository": siteConfig.social.github,
    "keywords": [workflow.category, "n8n", "workflow", "automation"],
    "dateCreated": workflow.createdAt.toISOString(),
    "dateModified": workflow.updatedAt.toISOString(),
    "interactionStatistic": {
      "@type": "InteractionCounter",
      "interactionType": "https://schema.org/DownloadAction",
      "userInteractionCount": workflow.downloads
    },
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Cross-platform"
  };
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}
