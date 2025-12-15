"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Workflow,
  FolderOpen,
  Settings,
  LogOut,
  User,
  Box,
  Search,
  Mail,
  Package,
  Inbox,
  ChevronLeft,
  ChevronRight,
  Globe,
  GraduationCap
} from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AdminSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Workflows", href: "/admin/workflows", icon: Workflow },
    { name: "Bundles", href: "/admin/bundles", icon: Package },
    { name: "Tutorials", href: "/admin/tutorials", icon: GraduationCap },
    { name: "Categories", href: "/admin/categories", icon: FolderOpen },
    { name: "Nodes", href: "/admin/nodes", icon: Box },
    { name: "Emails", href: "/admin/emails", icon: Mail },
    { name: "SEO", href: "/admin/seo", icon: Search },
    { name: "Submissions", href: "/admin/submissions", icon: Inbox },
    { name: "Users", href: "/admin/users", icon: User },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div
      className={cn(
        "relative flex flex-col h-screen border-r bg-card transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-6 h-8 w-8 rounded-full border bg-background shadow-md z-50"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      {/* Header */}
      <div className="flex h-16 items-center border-b px-4">
        <Link href="/admin" className="flex items-center gap-2 font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Workflow className="h-5 w-5" />
          </div>
          {!isCollapsed && <span className="text-lg">FlowKit</span>}
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="grid gap-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground",
                  isCollapsed && "justify-center px-2"
                )}
              >
                <item.icon className="h-5 w-5" />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="border-t p-4">
        <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
          <Avatar className="h-9 w-9 border">
            <AvatarImage src={user.image || ""} />
            <AvatarFallback>{user.name?.[0] || "A"}</AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-medium">{user.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>
          )}
        </div>
        
        <div className={cn("mt-4 flex gap-2", isCollapsed ? "flex-col" : "")}>
           <Button
            variant="outline"
            size={isCollapsed ? "icon" : "sm"}
            className={cn("flex-1", isCollapsed ? "w-full" : "")}
            asChild
          >
            <Link href="/" target="_blank">
              <Globe className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">View Site</span>}
            </Link>
          </Button>
          
          <Button
            variant="ghost"
            size={isCollapsed ? "icon" : "sm"}
            className={cn("text-destructive hover:text-destructive hover:bg-destructive/10", isCollapsed ? "w-full" : "")}
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </div>
    </div>
  );
}
