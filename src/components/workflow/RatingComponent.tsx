"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { useAuthModal } from "@/context/AuthModalContext";

export default function RatingComponent({ workflowId, initialRating = 0 }: { workflowId: string, initialRating?: number }) {
  const { data: session } = useSession();
  const { openAuthModal } = useAuthModal();
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRate = async (value: number) => {
    if (!session) {
      openAuthModal();
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/workflows/${workflowId}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });

      if (res.ok) {
        setRating(value);
        toast.success("Rating submitted");
      } else {
        toast.error("Failed to submit rating");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={isSubmitting}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          onClick={() => handleRate(star)}
          className="focus:outline-none transition-transform hover:scale-110"
        >
          <Star
            className={cn(
              "h-5 w-5 transition-colors",
              (hoverRating || rating) >= star
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-600"
            )}
          />
        </button>
      ))}
    </div>
  );
}
