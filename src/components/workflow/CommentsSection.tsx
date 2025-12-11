"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    name: string | null;
    image: string | null;
  };
  replies: Comment[];
}

import { useAuthModal } from "@/context/AuthModalContext";

// ... (keep interface)

export default function CommentsSection({ workflowId }: { workflowId: string }) {
  const { data: session } = useSession();
  const { openAuthModal } = useAuthModal();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchComments(1, true);
  }, [workflowId]);

  const fetchComments = async (pageNum: number, reset = false) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/workflows/${workflowId}/comments?page=${pageNum}&limit=5`);
      if (res.ok) {
        const data = await res.json();
        if (reset) {
          setComments(data.comments);
        } else {
          setComments((prev) => [...prev, ...data.comments]);
        }
        setHasMore(data.pagination.page < data.pagination.totalPages);
        setPage(pageNum);
      }
    } catch (error) {
      console.error("Failed to fetch comments", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    fetchComments(page + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      openAuthModal();
      return;
    }
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/workflows/${workflowId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });

      if (res.ok) {
        setNewComment("");
        fetchComments(1, true); // Reset to first page to show new comment
        toast.success("Comment posted");
      } else {
        toast.error("Failed to post comment");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 mt-8">
      <h3 className="text-xl font-bold font-mono">Comments ({comments.length}+)</h3>

      {session ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Share your thoughts..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="bg-white/5 border-white/10 min-h-[100px]"
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Post Comment
          </Button>
        </form>
      ) : (
        <div className="p-4 bg-white/5 rounded-lg text-center">
          <p className="text-gray-400 mb-2">Sign in to join the discussion</p>
          <Button variant="outline" onClick={openAuthModal}>
            Sign In
          </Button>
        </div>
      )}

      <div className="space-y-6">
        {comments.length > 0 ? (
          <>
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-4">
                <Avatar>
                  <AvatarImage src={comment.user.image || ""} />
                  <AvatarFallback>{comment.user.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{comment.user.name}</span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">{comment.content}</p>
                </div>
              </div>
            ))}
            
            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button 
                  variant="outline" 
                  onClick={handleLoadMore} 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Load More Comments
                </Button>
              </div>
            )}
          </>
        ) : (
          !isLoading && <p className="text-gray-500 text-center py-4">No comments yet. Be the first!</p>
        )}
        
        {isLoading && comments.length === 0 && (
           <div className="flex justify-center py-4">
             <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
           </div>
        )}
      </div>
    </div>
  );
}
