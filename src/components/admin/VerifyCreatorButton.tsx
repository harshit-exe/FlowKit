/**
 * Verify Creator Button Component
 * Client-side component for awarding VERIFIED_CREATOR badge
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface VerifyCreatorButtonProps {
  userId: string;
}

export function VerifyCreatorButton({ userId }: VerifyCreatorButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleVerify = async () => {
    if (!confirm('Award VERIFIED_CREATOR badge to this user?')) return;

    setLoading(true);
    try {
      const res = await fetch('/api/admin/portfolios/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to verify creator');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleVerify}
      disabled={loading}
      size="sm"
      className="w-full"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Verifying...
        </>
      ) : (
        <>
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Verify Creator
        </>
      )}
    </Button>
  );
}
