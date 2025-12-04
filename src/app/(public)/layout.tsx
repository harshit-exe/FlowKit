"use client"

import { StickyNavbar } from "@/components/ui/sticky-navbar"
import Footer from "@/components/layout/Footer"
import { usePathname } from "next/navigation"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isHomePage = pathname === "/"

  return (
    <div className="min-h-screen flex flex-col">
      {/* Show sticky navbar with scroll effect on homepage, always visible on other pages */}
      <StickyNavbar
        showOnScroll={isHomePage}
        scrollThreshold={600}
      />
      <main className={`flex-1 ${!isHomePage ? 'pt-20' : ''}`}>
        {children}
      </main>
      <Footer />
    </div>
  )
}
