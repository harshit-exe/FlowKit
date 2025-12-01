import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
