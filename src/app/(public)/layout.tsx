"use client"

import Navbar from "@/components/layout/Navbar"
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
      {!isHomePage && <Navbar />}
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
