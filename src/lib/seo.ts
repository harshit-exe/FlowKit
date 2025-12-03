/**
 * SEO Configuration and Utilities
 * Centralized SEO settings for FlowKit
 */

export const siteConfig = {
  name: "FlowKit",
  domain: "flowkit.in",
  url: "https://www.flowkit.in",
  title: "FlowKit - Free n8n Workflow Templates & AI Builder",
  description: "Discover 1000+ free n8n workflow templates. Build automation workflows with AI, browse by category, and deploy instantly. Open-source workflow marketplace.",
  keywords: [
    "n8n workflows",
    "workflow templates",
    "automation templates",
    "n8n marketplace",
    "workflow automation",
    "n8n templates free",
    "workflow builder",
    "ai workflow generator",
    "automation workflows",
    "n8n community",
    "workflow hub",
    "n8n integrations",
    "automation tools",
    "no-code automation"
  ],
  author: "FlowKit Team",
  creator: "@flowkit",
  publisher: "FlowKit",

  // Social Media
  social: {
    twitter: "@flowkit_io",
    github: "https://github.com/yourusername/flowkit",
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
      icon: "/favicon.ico",
      shortcut: "/favicon-16x16.png",
      apple: "/apple-touch-icon.png",
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
