import type { Metadata } from "next";
import { Space_Mono, Poppins } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { Toaster } from "sonner";
import { generateMetadata as generateSEOMetadata, siteConfig, jsonLd, organizationJsonLd } from "@/lib/seo";
import { ThemeProvider } from "@/components/theme-provider";
import AccessGateWrapper from "@/components/AccessGateWrapper";
import NavigationLoader from "@/components/ui/navigation-loader";

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
    <html lang="en" className="dark">
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
        {/* Favicon Links - Explicit for better browser compatibility */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
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
          forcedTheme="dark"
          disableTransitionOnChange={false}
        >
          <NavigationLoader />
          <AccessGateWrapper />
          {children}
          <Toaster 
            position="top-center"
            theme="dark"
            toastOptions={{
              style: {
                background: '#0a0a0a',
                color: '#ffffff',
                border: '2px solid #FF6B35',
                fontFamily: 'var(--font-space-mono)',
                fontSize: '14px',
                borderRadius: '8px',
              },
              className: 'font-mono',
            }}
          />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
