"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Workflow, Search, Menu, X, LogOut, User as UserIcon } from "lucide-react"
import { GithubStarButton } from "@/components/ui/github-star-button"
import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { data: session, status } = useSession()

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Workflows", href: "/workflows" },
    { name: "Bundles", href: "/bundles" },
    { name: "AI Builder", href: "/ai-builder" },
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <nav className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-lg flex items-center justify-center">
                <Workflow className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">
                FlowKit
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:ml-8 md:flex md:space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/70 hover:bg-muted"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search workflows..."
                  className="pl-10 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:block">
              <GithubStarButton />
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:block">
              {status === "loading" ? (
                <div className="h-9 w-9 bg-muted animate-pulse rounded-full" />
              ) : session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                        <AvatarFallback>{session.user?.name?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {session.user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" asChild>
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search workflows..."
                  className="pl-10 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>

            {/* Mobile Navigation */}
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/70 hover:bg-muted"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Mobile Auth */}
            <div className="pt-4 border-t border-border">
              {session ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user?.image || ""} />
                      <AvatarFallback>{session.user?.name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{session.user?.name}</p>
                      <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/dashboard"
                    className="block px-3 py-2 rounded-md text-base font-medium text-foreground/70 hover:bg-muted"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      signOut()
                      setMobileMenuOpen(false)
                    }}
                    className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-foreground/70 hover:bg-muted"
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <div className="space-y-2 px-3">
                  <Button className="w-full" asChild>
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
