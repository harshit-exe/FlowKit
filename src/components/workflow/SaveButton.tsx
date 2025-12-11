"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { useAuthModal } from "@/context/AuthModalContext";

export default function SaveButton({ workflowId, initialSaved = false }: { workflowId: string, initialSaved?: boolean }) {
  const { data: session } = useSession();
  const { openAuthModal } = useAuthModal();
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleSave = async () => {
    if (!session) {
      openAuthModal();
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/workflows/${workflowId}/save`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        setIsSaved(data.saved);
        toast.success(data.saved ? "Workflow saved" : "Workflow removed from saved");
      } else {
        toast.error("Failed to update save status");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={handleToggleSave}
      disabled={isLoading}
      className={cn(
        "gap-2 transition-colors",
        isSaved ? "bg-pink-500/10 text-pink-500 border-pink-500/50 hover:bg-pink-500/20" : ""
      )}
    >
      <Heart className={cn("h-4 w-4", isSaved ? "fill-current" : "")} />
      {isSaved ? "Saved" : "Save"}
    </Button>
  );
}
