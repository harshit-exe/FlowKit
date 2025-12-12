"use client";

import { useState } from "react";
import { ArrowBigUp, ArrowBigDown } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuthModal } from "@/context/AuthModalContext";
import { Button } from "@/components/ui/button";

interface VoteComponentProps {
  workflowId: string;
  initialUserVote?: "UPVOTE" | "DOWNVOTE" | null;
  initialUpvotes?: number;
  initialDownvotes?: number;
}

export default function VoteComponent({
  workflowId,
  initialUserVote = null,
  initialUpvotes = 0,
  initialDownvotes = 0,
}: VoteComponentProps) {
  const { data: session } = useSession();
  const { openAuthModal } = useAuthModal();
  const [userVote, setUserVote] = useState<"UPVOTE" | "DOWNVOTE" | null>(
    initialUserVote
  );
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVote = async (type: "UPVOTE" | "DOWNVOTE") => {
    if (!session) {
      openAuthModal();
      return;
    }

    // Optimistic update
    const previousVote = userVote;
    const previousUpvotes = upvotes;
    const previousDownvotes = downvotes;

    if (userVote === type) {
      // Toggle off
      setUserVote(null);
      if (type === "UPVOTE") setUpvotes((prev) => prev - 1);
      else setDownvotes((prev) => prev - 1);
    } else {
      // Switch or new vote
      setUserVote(type);
      if (type === "UPVOTE") {
        setUpvotes((prev) => prev + 1);
        if (previousVote === "DOWNVOTE") setDownvotes((prev) => prev - 1);
      } else {
        setDownvotes((prev) => prev + 1);
        if (previousVote === "UPVOTE") setUpvotes((prev) => prev - 1);
      }
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/workflows/${workflowId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      if (!res.ok) {
        throw new Error("Failed to vote");
      }
    } catch (error) {
      // Revert optimistic update
      setUserVote(previousVote);
      setUpvotes(previousUpvotes);
      setDownvotes(previousDownvotes);
      toast.error("Failed to submit vote");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 p-4 bg-muted/30 rounded-xl border border-border/50">
      <h3 className="text-sm font-medium text-muted-foreground mb-1">
        Did it work for you?
      </h3>
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleVote("UPVOTE")}
          disabled={isSubmitting}
          className={cn(
            "flex items-center gap-2 h-10 px-4 rounded-full transition-all hover:bg-green-500/10 hover:text-green-500",
            userVote === "UPVOTE" &&
              "bg-green-500/20 text-green-500 hover:bg-green-500/30"
          )}
        >
          <ArrowBigUp
            className={cn(
              "h-6 w-6 transition-transform",
              userVote === "UPVOTE" && "scale-110 fill-current"
            )}
          />
          <span className="font-bold text-base">{upvotes}</span>
        </Button>

        <div className="h-8 w-[1px] bg-border/50" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleVote("DOWNVOTE")}
          disabled={isSubmitting}
          className={cn(
            "flex items-center gap-2 h-10 px-4 rounded-full transition-all hover:bg-red-500/10 hover:text-red-500",
            userVote === "DOWNVOTE" &&
              "bg-red-500/20 text-red-500 hover:bg-red-500/30"
          )}
        >
          <ArrowBigDown
            className={cn(
              "h-6 w-6 transition-transform",
              userVote === "DOWNVOTE" && "scale-110 fill-current"
            )}
          />
          <span className="font-bold text-base">{downvotes}</span>
        </Button>
      </div>
    </div>
  );
}
