import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { generateMetadata as generateSEOMetadata, siteConfig, jsonLd, organizationJsonLd } from "@/lib/seo";
import { ThemeProvider } from "@/components/theme-provider";

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ["latin"],
  variable: '--font-space-mono',
});

export const metadata: Metadata = generateSEOMetadata({});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Structured Data - Website */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {/* Theme Color */}
        <meta name="theme-color" content={siteConfig.themeColor} />
        {/* Verification Tags (Add these after setting up search consoles) */}
        {/* <meta name="google-site-verification" content="YOUR_GOOGLE_CODE" /> */}
        {/* <meta name="msvalidate.01" content="YOUR_BING_CODE" /> */}
      </head>
      <body className={`${spaceMono.className} ${spaceMono.variable} font-mono`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          {/* Grid Overlay */}
          <div
            className="fixed inset-0 pointer-events-none z-0 grid-overlay"
            style={{
              backgroundImage: 'url(/grid.png)',
              backgroundRepeat: 'repeat',
              backgroundSize: '40px 40px',
            }}
          />
          <div className="relative z-10">
            {children}
          </div>
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
