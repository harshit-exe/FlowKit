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
    <div className="w-full flex items-center justify-between gap-4 p-2 bg-muted/40 rounded-full border border-border/50 hover:border-primary/20 transition-colors group">
      <span className="text-xs font-medium text-muted-foreground pl-3 group-hover:text-primary/80 transition-colors">
        Help the community - rate this workflow
      </span>
      
      <div className="flex items-center gap-1 pr-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleVote("UPVOTE")}
          disabled={isSubmitting}
          className={cn(
            "h-8 px-3 rounded-full gap-1.5 hover:bg-green-500/10 hover:text-green-600 transition-all",
            userVote === "UPVOTE" && "bg-green-500/20 text-green-600"
          )}
        >
          <ArrowBigUp
            className={cn(
              "h-5 w-5 transition-transform",
              userVote === "UPVOTE" && "scale-110 fill-current"
            )}
          />
          <span className="font-mono font-bold text-sm">{upvotes}</span>
        </Button>

        <div className="h-4 w-[1px] bg-border" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleVote("DOWNVOTE")}
          disabled={isSubmitting}
          className={cn(
            "h-8 px-3 rounded-full gap-1.5 hover:bg-red-500/10 hover:text-red-600 transition-all",
            userVote === "DOWNVOTE" && "bg-red-500/20 text-red-600"
          )}
        >
          <ArrowBigDown
            className={cn(
              "h-5 w-5 transition-transform",
              userVote === "DOWNVOTE" && "scale-110 fill-current"
            )}
          />
          <span className="font-mono font-bold text-sm">{downvotes}</span>
        </Button>
      </div>
    </div>
  );
}
