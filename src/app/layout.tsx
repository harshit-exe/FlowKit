import type { Metadata } from "next";
import { Space_Mono, Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { generateMetadata as generateSEOMetadata, siteConfig, jsonLd, organizationJsonLd } from "@/lib/seo";
import { ThemeProvider } from "@/components/theme-provider";

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ["latin"],
  variable: '--font-space-mono',
});

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"],
  variable: '--font-poppins',
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
      <body className={`${spaceMono.variable} ${poppins.variable} font-mono`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
