/**
 * Award Badge Button Component
 * Client-side component for awarding custom badges to users
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Award, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AwardBadgeButtonProps {
  userId: string;
  userName: string;
}

const BADGE_TYPES = [
  { value: 'TOP_CONTRIBUTOR', label: 'Top Contributor', icon: '🏆', color: '#FFD700' },
  { value: 'EXPERT_LEVEL', label: 'Expert Level', icon: '⭐', color: '#FF6B6B' },
  { value: 'COMMUNITY_FAVORITE', label: 'Community Favorite', icon: '❤️', color: '#FF69B4' },
  { value: 'DOWNLOAD_CHAMPION', label: 'Download Champion', icon: '📥', color: '#4CAF50' },
  { value: 'EARLY_ADOPTER', label: 'Early Adopter', icon: '🚀', color: '#2196F3' },
  { value: 'RISING_STAR', label: 'Rising Star', icon: '⭐', color: '#FFC107' },
];

export function AwardBadgeButton({ userId, userName }: AwardBadgeButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAwardBadge = async (badgeType: string) => {
    if (!confirm(`Award ${BADGE_TYPES.find(b => b.value === badgeType)?.label} badge to ${userName}?`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/portfolios/badge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, badgeType }),
      });

      if (res.ok) {
        setOpen(false);
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to award badge');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Award className="w-4 h-4 mr-2" />
          Award Badge
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Award Badge to {userName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          {BADGE_TYPES.map((badge) => (
            <Button
              key={badge.value}
              onClick={() => handleAwardBadge(badge.value)}
              disabled={loading}
              variant="outline"
              className="w-full justify-start"
              style={{ borderColor: badge.color }}
            >
              <span className="mr-2">{badge.icon}</span>
              <span style={{ color: badge.color }} className="font-bold">
                {badge.label}
              </span>
              {loading && <Loader2 className="w-4 h-4 ml-auto animate-spin" />}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
