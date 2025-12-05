"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function NavigationLoader() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // When pathname changes, hide the loader
    setLoading(false);
  }, [pathname]);

  useEffect(() => {
    // Intercept all link clicks
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");

      if (link && link.href && !link.target && link.href.startsWith(window.location.origin)) {
        const url = new URL(link.href);
        // Only show loader if navigating to a different page
        if (url.pathname !== pathname) {
          setLoading(true);
        }
      }
    };

    document.addEventListener("click", handleClick, { passive: true });
    return () => document.removeEventListener("click", handleClick);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-transparent">
      <div 
        className="h-full bg-primary transition-all duration-300 ease-out"
        style={{
          width: '100%',
          animation: 'progress 2s ease-in-out infinite'
        }}
      />
      <style jsx>{`
        @keyframes progress {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
