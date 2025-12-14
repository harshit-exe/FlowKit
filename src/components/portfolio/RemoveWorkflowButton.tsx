/**
 * Remove Workflow Button Component
 * Client-side component for removing workflows from portfolio
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RemoveWorkflowButtonProps {
  portfolioWorkflowId: string;
}

export function RemoveWorkflowButton({ portfolioWorkflowId }: RemoveWorkflowButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRemove = async () => {
    if (!confirm('Remove this workflow from your portfolio?')) return;

    setLoading(true);
    try {
      const res = await fetch('/api/portfolio/workflows/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolioWorkflowId }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to remove workflow');
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
      onClick={handleRemove}
      disabled={loading}
      variant="destructive"
      size="sm"
      className="font-mono text-xs"
    >
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <X className="w-3 h-3" />
      )}
    </Button>
  );
}
