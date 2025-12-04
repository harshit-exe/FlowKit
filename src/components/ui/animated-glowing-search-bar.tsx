"use client";

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

interface AnimatedGlowingSearchBarProps {
  placeholder?: string;
  className?: string;
}

const styles = `
  @keyframes border-spin {
    from {
      transform: translate(-50%, -50%) rotate(0deg);
    }
    to {
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }
  .animate-border-spin::before {
    animation: border-spin 3s linear infinite;
  }
`;

const AnimatedGlowingSearchBar = ({
  placeholder = "Search workflows...",
  className = ""
}: AnimatedGlowingSearchBarProps) => {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative flex items-center justify-center ${className}`}>
      <style>{styles}</style>
      <div className="relative flex items-center justify-center group">
        {/* Outer rotating gradient - Primary Orange theme */}
        <div className="absolute z-[-1] overflow-hidden h-full w-full max-h-[70px] max-w-[314px] rounded-xl blur-[3px] animate-border-spin
                        before:absolute before:content-[''] before:z-[-2] before:w-[999px] before:h-[999px] before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2
                        before:bg-[conic-gradient(#000,#FF6B35_5%,#000_38%,#000_50%,#F44E11_60%,#000_87%)]">
        </div>

        {/* Secondary gradient layers - Orange tones */}
        <div className="absolute z-[-1] overflow-hidden h-full w-full max-h-[65px] max-w-[312px] rounded-xl blur-[3px] animate-border-spin
                        before:absolute before:content-[''] before:z-[-2] before:w-[600px] before:h-[600px] before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2
                        before:bg-[conic-gradient(rgba(0,0,0,0),#C73D0D,rgba(0,0,0,0)_10%,rgba(0,0,0,0)_50%,#9A2F0A,rgba(0,0,0,0)_60%)]">
        </div>

        <div className="absolute z-[-1] overflow-hidden h-full w-full max-h-[65px] max-w-[312px] rounded-xl blur-[3px] animate-border-spin
                        before:absolute before:content-[''] before:z-[-2] before:w-[600px] before:h-[600px] before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2
                        before:bg-[conic-gradient(rgba(0,0,0,0),#C73D0D,rgba(0,0,0,0)_10%,rgba(0,0,0,0)_50%,#9A2F0A,rgba(0,0,0,0)_60%)]">
        </div>

        <div className="absolute z-[-1] overflow-hidden h-full w-full max-h-[65px] max-w-[312px] rounded-xl blur-[3px] animate-border-spin
                        before:absolute before:content-[''] before:z-[-2] before:w-[600px] before:h-[600px] before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2
                        before:bg-[conic-gradient(rgba(0,0,0,0),#C73D0D,rgba(0,0,0,0)_10%,rgba(0,0,0,0)_50%,#9A2F0A,rgba(0,0,0,0)_60%)]">
        </div>

        {/* Light layer - Orange glow */}
        <div className="absolute z-[-1] overflow-hidden h-full w-full max-h-[63px] max-w-[307px] rounded-lg blur-[2px] animate-border-spin
                        before:absolute before:content-[''] before:z-[-2] before:w-[600px] before:h-[600px] before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2
                        before:bg-[conic-gradient(rgba(0,0,0,0)_0%,#FFD1C2,rgba(0,0,0,0)_8%,rgba(0,0,0,0)_50%,#FFE8E0,rgba(0,0,0,0)_58%)] before:brightness-140">
        </div>

        {/* Inner dark layer */}
        <div className="absolute z-[-1] overflow-hidden h-full w-full max-h-[59px] max-w-[303px] rounded-xl blur-[0.5px] animate-border-spin
                        before:absolute before:content-[''] before:z-[-2] before:w-[600px] before:h-[600px] before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2
                        before:bg-[conic-gradient(#1c191c,#FF6B35_5%,#1c191c_14%,#1c191c_50%,#F44E11_60%,#1c191c_64%)] before:brightness-130">
        </div>

        {/* Main input container */}
        <div className="relative group">
          <input
            placeholder={placeholder}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-[#010201] border-none w-[301px] h-[56px] rounded-lg text-white px-[59px] text-lg focus:outline-none placeholder-gray-400 font-poppins"
          />

          {/* Orange glow mask */}
          <div className="pointer-events-none w-[30px] h-[20px] absolute bg-[#FF6B35] top-[10px] left-[5px] blur-2xl opacity-80 transition-all duration-2000 group-hover:opacity-0"></div>

          {/* Search icon on the left */}
          <button type="submit" className="absolute left-5 top-[16px] cursor-pointer bg-transparent border-none p-0">
            <Search className="h-6 w-6 text-gray-400 hover:text-primary transition-colors" />
          </button>
        </div>
      </div>
    </form>
  );
};

export default AnimatedGlowingSearchBar;
