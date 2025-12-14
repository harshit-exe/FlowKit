/**
 * Review Approval Buttons Component
 * Client-side component for approving/rejecting reviews
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ReviewApprovalButtonsProps {
  reviewId: string;
}

export function ReviewApprovalButtons({ reviewId }: ReviewApprovalButtonsProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAction = async (action: 'approve' | 'reject') => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/portfolios/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, action }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.message || `Failed to ${action} review`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={() => handleAction('approve')}
        disabled={loading}
        size="sm"
        className="bg-green-600 hover:bg-green-700"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Approve
          </>
        )}
      </Button>

      <Button
        onClick={() => handleAction('reject')}
        disabled={loading}
        size="sm"
        variant="destructive"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <XCircle className="w-4 h-4 mr-2" />
            Reject
          </>
        )}
      </Button>
    </div>
  );
}
