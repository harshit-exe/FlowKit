/**
 * Portfolio Share Button Component
 * Client-side component for sharing portfolio
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Check, Copy } from 'lucide-react';

interface PortfolioShareButtonProps {
  username: string;
  userName: string;
}

export function PortfolioShareButton({ username, userName }: PortfolioShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    const title = `${userName}'s Portfolio`;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
      } catch (error) {
        // User cancelled share
        console.log('Share cancelled');
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="rounded-none font-mono border-2"
      onClick={handleShare}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 mr-2" />
          COPIED!
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4 mr-2" />
          SHARE
        </>
      )}
    </Button>
  );
}
