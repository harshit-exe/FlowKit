"use client";

import { useEffect, useState } from "react";
import { Github } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface GithubStarButtonProps {
  className?: string;
}

export function GithubStarButton({ className }: GithubStarButtonProps) {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    async function fetchStars() {
      try {
        // Using a default repo for now, can be parameterized
        const res = await fetch(
          "https://img.shields.io/github/stars/keenthemes/reui.json"
        );
        const data = await res.json();
        // shields.io gives: { "name": "GitHub Repo stars", "value": "1.5k", ... }
        // Parse "1.5k" to number if needed, or just use the string value
        // The user's snippet parsed it, so we'll try to keep it flexible
        const value = data.value;
        if (value.includes("k")) {
            setStars(parseFloat(value.replace("k", "")) * 1000);
        } else {
            setStars(parseInt(value));
        }
      } catch (e) {
        console.error("Failed to fetch stars", e);
        setStars(0);
      }
    }
    fetchStars();
  }, []);

  return (
    <Link
      href="https://github.com/keenthemes/reui"
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        buttonVariants({ variant: "outline" }),
        "group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-white/10 bg-white/5 px-6 py-2 font-medium text-white transition-all hover:bg-white/10 hover:text-white hover:border-white/20",
        className
      )}
    >
      <Github className="h-4 w-4 transition-transform group-hover:scale-110" />
      <span>Star on GitHub</span>
      {stars !== null && (
        <>
          <div className="h-4 w-[1px] bg-white/20" />
          <span className="font-mono text-xs text-white/70 group-hover:text-white">
            {stars.toLocaleString()}
          </span>
        </>
      )}
      
      {/* Shine effect */}
      <div className="absolute inset-0 -z-10 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-[100%]" />
    </Link>
  );
}
