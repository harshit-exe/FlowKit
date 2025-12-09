"use client"

import { StickyNavbar } from "@/components/ui/sticky-navbar"
import Footer from "@/components/layout/Footer"
import { usePathname } from "next/navigation"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { useEffect } from "react"
import Clarity from "@microsoft/clarity"
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isHomePage = pathname === "/"

  useEffect(() => {
    const clarityProjectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID
    if (clarityProjectId && typeof window !== 'undefined') {
      Clarity.init(clarityProjectId)
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Show sticky navbar with scroll effect on homepage, always visible on other pages */}
      <StickyNavbar
        showOnScroll={isHomePage}
        scrollThreshold={600}
      />
      <main className={`flex-1 ${!isHomePage ? 'pt-20' : ''}`}>
        {children}
        <Analytics />
        <SpeedInsights />
      </main>
      <Footer />
    </div>
  )
}
