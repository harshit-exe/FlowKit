import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ["latin"],
  variable: '--font-space-mono',
});

export const metadata: Metadata = {
  title: "FlowKit - n8n Workflow Library",
  description: "Discover and download 150+ curated n8n workflows. Built for India, by India.",
  keywords: ["n8n", "workflows", "automation", "no-code", "workflow library"],
  authors: [{ name: "FlowKit" }],
  openGraph: {
    title: "FlowKit - n8n Workflow Library",
    description: "Discover and download 150+ curated n8n workflows",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${spaceMono.className} ${spaceMono.variable} font-mono`}>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
