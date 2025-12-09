"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LayoutDashboard,
  Workflow as WorkflowIcon,
  FolderOpen,
  Settings,
  LogOut,
  User,
  Menu,
  Box,
  Search as SearchIcon,
  Mail,
  Package,
} from "lucide-react"

interface AdminNavProps {
  user: {
    name?: string | null
    email?: string | null
  }
}

export default function AdminNav({ user }: AdminNavProps) {
  const pathname = usePathname()

  const navItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      name: "Workflows",
      href: "/admin/workflows",
      icon: WorkflowIcon,
    },
    {
      name: "Bundles",
      href: "/admin/bundles",
      icon: Package,
    },
    {
      name: "Categories",
      href: "/admin/categories",
      icon: FolderOpen,
    },
    {
      name: "Nodes",
      href: "/admin/nodes",
      icon: Box,
    },
    {
      name: "Emails",
      href: "/admin/emails",
      icon: Mail,
    },
    {
      name: "SEO",
      href: "/admin/seo",
      icon: SearchIcon,
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ]

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Nav Links */}
          <div className="flex">
            <Link href="/admin" className="flex items-center px-2">
              <WorkflowIcon className="h-6 w-6 text-primary" />
              <span className="ml-2 text-xl font-bold text-foreground">FlowKit Admin</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:ml-8 md:flex md:space-x-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/70 hover:bg-muted"
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <Link href="/" target="_blank">
              <Button variant="outline" size="sm">
                View Site
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.name || "Admin"}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className="cursor-pointer">
                        <Icon className="mr-2 h-4 w-4" />
                        {item.name}
                      </Link>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}
