"use client";

import * as React from "react";
import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import LightRays from "@/components/ui/LightRays";
import AnimatedGlowingSearchBar from "@/components/ui/animated-glowing-search-bar";
import { GithubStarButton } from "@/components/ui/github-star-button";

const navigationItems = [
  { title: "Workflows", href: "/workflows" },
  { title: "Bundles", href: "/bundles" },
  { title: "Categories", href: "/#categories" },
  { title: "AI Builder", href: "/ai-builder" },
  { title: "About", href: "/about" },
];

const previewData = {
  automation: {
    image:
      "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=560&h=320&fit=crop",
    title: "AI Automation Workflows",
    subtitle: "Streamline repetitive tasks",
  },
  integration: {
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=560&h=320&fit=crop",
    title: "Integrations",
    subtitle: "Connect your favorite tools",
  },
  productivity: {
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=560&h=320&fit=crop",
    title: "Productivity Boost",
    subtitle: "Boost team efficiency",
  },
};

const previewStyles = `
  .hover-word {
    color: #FF6B35;
    font-weight: 600;
    cursor: pointer;
    position: relative;
    display: inline-block;
    transition: color 0.3s ease;
  }

  .hover-word::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background: #FF6B35;
    transition: width 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  .hover-word:hover::after {
    width: 100%;
  }

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

  .preview-card {
    position: fixed;
    pointer-events: none;
    z-index: 1000;
    opacity: 0;
    transform: translateY(10px) scale(0.95);
    transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    will-change: transform, opacity;
  }

  .preview-card.visible {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  .preview-card-inner {
    background: rgba(0, 0, 0, 0.9);
    border: 2px solid rgba(255, 107, 53, 0.3);
    padding: 8px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    overflow: hidden;
    border-radius: 8px;
  }

  .preview-card img {
    width: 280px;
    height: auto;
    display: block;
    border-radius: 4px;
  }

  .preview-card-title {
    padding: 12px 8px 4px;
    font-size: 0.875rem;
    color: white;
    font-weight: 700;
  }

  .preview-card-subtitle {
    padding: 0 8px 8px;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.6);
  }
`;

interface NewHeroProps {
  totalWorkflows?: number;
}

export function NewHero({ totalWorkflows = 150 }: NewHeroProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePreview, setActivePreview] = useState<
    keyof typeof previewData | null
  >(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleQuickSearch = (query: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  };

  // Preload all images on mount
  useEffect(() => {
    Object.entries(previewData).forEach(([, data]) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.src = data.image;
    });
  }, []);

  const updatePosition = useCallback((e: React.MouseEvent) => {
    const cardWidth = 300;
    const cardHeight = 250;
    const offsetY = 20;

    let x = e.clientX - cardWidth / 2;
    let y = e.clientY - cardHeight - offsetY;

    if (x + cardWidth > window.innerWidth - 20) {
      x = window.innerWidth - cardWidth - 20;
    }
    if (x < 20) {
      x = 20;
    }

    if (y < 20) {
      y = e.clientY + offsetY;
    }

    setPosition({ x, y });
  }, []);

  const handleHoverStart = useCallback(
    (key: keyof typeof previewData, e: React.MouseEvent) => {
      setActivePreview(key);
      setIsVisible(true);
      updatePosition(e);
    },
    [updatePosition]
  );

  const handleHoverMove = useCallback(
    (e: React.MouseEvent) => {
      if (isVisible) {
        updatePosition(e);
      }
    },
    [isVisible, updatePosition]
  );

  const handleHoverEnd = useCallback(() => {
    setIsVisible(false);
  }, []);

  const previewCardData = activePreview ? previewData[activePreview] : null;

  return (
    <div className="relative bg-black overflow-hidden">
      <style>{previewStyles}</style>

      {/* LightRays Component - Subtle white effect */}
      <div className="absolute inset-0 -z-99 opacity-1">
        <LightRays
          raysOrigin="top-center"
          raysColor="#ffffff"
          raysSpeed={0.5}
          lightSpread={3}
          rayLength={0.5}
          fadeDistance={3}
          saturation={0.8}
          followMouse={true}
          mouseInfluence={0.6}
          className="w-full h-full"
        />
      </div>

      {/* Background Gradient Image */}
      <div className="absolute inset-0 z-10">
        <Image
          src="/BG.svg"
          alt="Background"
          fill
          className="object-cover opacity-60"
          priority
          unoptimized
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Navbar */}
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-6 h-6 sm:w-7 sm:h-7 relative flex-shrink-0">
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

            {/* Desktop Navigation - Centered */}
            <div className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="nav-link text-sm font-poppins font-normal text-white/90 hover:text-white transition-colors"
                >
                  {item.title}
                </Link>
              ))}
            </div>

            {/* Github Star Button - Desktop */}
            <div className="hidden md:block">
              <GithubStarButton />
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
        </nav>

        {/* Hero Section */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 md:pt-28 lg:pt-32 pb-4 sm:pb-8">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium font-poppins text-white leading-tight mb-6 sm:mb-8">
              Automate Everything
              <br />
              <span className="inline-flex items-center justify-center flex-wrap gap-2 sm:gap-3">
                <span>with</span>{" "}
                <span className="inline-flex items-center gap-1 sm:gap-2">
                  <span className="bg-gradient-to-b from-orange-100 via-orange-300 to-orange-600 bg-clip-text text-transparent">
                    n8n
                  </span>
                  {/* Tilted Icon - Right next to n8n */}
                  <span className="inline-block relative top-1 transform rotate-12 ml-1">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-20 md:h-20 ">
                      <Image
                        src="/LogoHero.svg"
                        alt=""
                        height={100}
                        width={100}
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  </span>
                </span>
                <span>Workflows</span>
              </span>
            </h1>

            <div className="lg:pt-12 text-base sm:text-lg md:text-xl font-poppins text-white mb-8 sm:mb-10 max-w-3xl mx-auto px-4">
              <span>{totalWorkflows}+ Production-Ready </span>
              <span
                className="hover-word"
                onMouseEnter={(e) => handleHoverStart("automation", e)}
                onMouseMove={handleHoverMove}
                onMouseLeave={handleHoverEnd}
              >
                AI Automation
              </span>
              <span> Workflows. </span>
              <span
                className="hover-word"
                onMouseEnter={(e) => handleHoverStart("integration", e)}
                onMouseMove={handleHoverMove}
                onMouseLeave={handleHoverEnd}
              >
                Integrate
              </span>
              <span>, Improve Integrations And Boost Your </span>
              <span
                className="hover-word"
                onMouseEnter={(e) => handleHoverStart("productivity", e)}
                onMouseMove={handleHoverMove}
                onMouseLeave={handleHoverEnd}
              >
                Productivity
              </span>
              <span>.</span>
            </div>

            {/* Modern Search Bar Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary"></div>
                <span className="text-xs font-poppins text-white/60 tracking-widest uppercase">
                  Free & Open Source
                </span>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary"></div>
              </div>

              <AnimatedGlowingSearchBar
                placeholder="Try slack automation"
                className="mt-4"
                size="normal"
              />

              <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
                <span className="text-xs font-poppins text-white/40">Try:</span>
                <button
                  onClick={() => handleQuickSearch('AI automation')}
                  className="px-3 py-1 text-xs font-poppins bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/70 hover:text-white transition-all"
                >
                  AI Automation
                </button>
                <button
                  onClick={() => handleQuickSearch('Slack')}
                  className="px-3 py-1 text-xs font-poppins bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/70 hover:text-white transition-all"
                >
                  Slack
                </button>
                <button
                  onClick={() => handleQuickSearch('Email')}
                  className="px-3 py-1 text-xs font-poppins bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/70 hover:text-white transition-all"
                >
                  Email
                </button>
                <button
                  onClick={() => handleQuickSearch('Data sync')}
                  className="px-3 py-1 text-xs font-poppins bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/70 hover:text-white transition-all"
                >
                  Data Sync
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Card */}
      {previewCardData && (
        <div
          ref={cardRef}
          className={`preview-card ${isVisible ? "visible" : ""}`}
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
        >
          <div className="preview-card-inner">
            <div className="relative w-full h-[180px]">
              <Image
                src={previewCardData.image}
                alt={previewCardData.title}
                fill
                sizes="560px"
                className="object-cover"
                loading="lazy"
                quality={80}
              />
            </div>
            <div className="preview-card-title font-poppins">
              {previewCardData.title}
            </div>
            <div className="preview-card-subtitle font-poppins">
              {previewCardData.subtitle}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
