"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedGlowingSearchBar from "@/components/ui/animated-glowing-search-bar";
import { GithubStarButton } from "@/components/ui/github-star-button";
import { AuthButtons } from "@/components/auth/AuthButtons";

const navigationItems = [
  { title: "Workflows", href: "/workflows" },
  { title: "Categories", href: "/#categories" },
  { title: "AI Builder", href: "/ai-builder" },
  { title: "Bundles", href: "/bundles" },
  { title: "About", href: "/about" },
];

const navStyles = `
  .nav-link {
    position: relative;
    display: inline-block;
  }

  .nav-link::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 0;
    height: 2px;
    background: #FF6B35;
    transition: width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .nav-link:hover::after {
    width: 100%;
  }
`;

interface StickyNavbarProps {
  showOnScroll?: boolean;
  scrollThreshold?: number;
}

export function StickyNavbar({
  showOnScroll = false,
  scrollThreshold = 100,
}: StickyNavbarProps) {
  const [isVisible, setIsVisible] = useState(!showOnScroll);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!showOnScroll) {
      setIsVisible(true);
      return;
    }

    const handleScroll = () => {
      const scrolled = window.scrollY > scrollThreshold;
      setIsVisible(scrolled);
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [showOnScroll, scrollThreshold]);

  // Prevent SSR/hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <>
      <style>{navStyles}</style>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isVisible
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none"
        } ${
          showOnScroll
            ? "bg-black/95 backdrop-blur-lg border-b border-white/10"
            : "bg-black/80 backdrop-blur-md"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-6 h-6 sm:w-7 sm:h-7 relative">
                <Image
                  src="/Union.png"
                  alt="FlowKit Logo"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>
              <span className="text-base sm:text-lg font-poppins font-semibold text-white">
                FlowKit
              </span>
            </Link>

            {/* Desktop Navigation - Left */}
            <div className="hidden lg:flex items-center gap-6">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="nav-link text-sm font-poppins font-normal text-white/90 hover:text-white transition-colors whitespace-nowrap"
                >
                  {item.title}
                </Link>
              ))}
            </div>

            {/* Search Bar - Desktop Center */}
            <div className="hidden md:flex flex-1 justify-center max-w-md mx-4">
              <AnimatedGlowingSearchBar
                placeholder="Search workflows..."
                className="w-full scale-90"
              />
            </div>

            {/* Github Star Button - Desktop Right */}
            <div className="hidden md:flex items-center gap-4 flex-shrink-0">
              <GithubStarButton />
              <AuthButtons />
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 py-4 space-y-4 border-t border-white/10">
              {/* Mobile Search Bar */}
              <div className="pb-4">
                <AnimatedGlowingSearchBar
                  placeholder="Search..."
                  className="scale-90 origin-left"
                />
              </div>

              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block text-sm font-poppins font-medium text-white/80 hover:text-white transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.title}
                </Link>
              ))}
              <div className="pt-2">
                <GithubStarButton className="w-full justify-center" />
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
