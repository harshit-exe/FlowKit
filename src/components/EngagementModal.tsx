"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Heart, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

export default function EngagementModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const [hasSeenModal, setHasSeenModal] = useState(false);

  useEffect(() => {
    // Don't show if logged in
    if (session) return;

    // Check localStorage
    const seen = localStorage.getItem("flowkit_engagement_modal_seen");
    if (seen) {
      setHasSeenModal(true);
      return;
    }

    const handleScroll = () => {
      if (window.scrollY > 800 && !hasSeenModal && !isOpen) {
        setIsOpen(true);
        setHasSeenModal(true);
        localStorage.setItem("flowkit_engagement_modal_seen", "true");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [session, hasSeenModal, isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 z-50 max-w-sm w-full"
        >
          <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-2xl relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
            
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-lg">
                  <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Join the Community</h3>
                  <p className="text-sm text-gray-400">Unlock powerful features</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Heart className="h-4 w-4 text-pink-500" />
                  <span>Save your favorite workflows</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                  <span>Comment and rate templates</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>Access exclusive AI tools</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button className="flex-1 bg-white text-black hover:bg-gray-200" asChild>
                  <Link href="/signup">Sign Up Free</Link>
                </Button>
                <Button variant="outline" className="flex-1 border-white/10 hover:bg-white/5" asChild>
                  <Link href="/login">Login</Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
