"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Gift, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { signIn } from "next-auth/react";
import confetti from "canvas-confetti";

export default function WelcomeModal() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"gift" | "reveal">("gift");

  useEffect(() => {
    // Only show if user is NOT authenticated and hasn't seen it yet
    const hasSeen = localStorage.getItem("flowkit_welcome_seen");
    
    // Small delay to not overwhelm immediately on load
    const timer = setTimeout(() => {
      if (status === "unauthenticated" && !hasSeen) {
        setIsOpen(true);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [status]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("flowkit_welcome_seen", "true");
  };

  const handleOpenGift = () => {
    setStep("reveal");
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FF6B35', '#004E89', '#FFA500'] // Primary, Secondary, Accent
    });
  };

  const handleLogin = (provider: "google" | "github") => {
    localStorage.setItem("flowkit_welcome_seen", "true");
    signIn(provider);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 to-black border border-primary/20 shadow-2xl"
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="p-1">
            <div className="relative overflow-hidden rounded-[22px] bg-black/50 p-8 text-center">
              
              {/* Step 1: The Mystery Gift */}
              {step === "gift" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="py-8"
                >
                  <motion.div
                    animate={{ 
                      y: [0, -10, 0],
                      rotate: [0, -5, 5, 0]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="relative mx-auto w-32 h-32 mb-8 cursor-pointer group"
                    onClick={handleOpenGift}
                  >
                    <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full group-hover:bg-primary/50 transition-all duration-500" />
                    <Gift className="w-full h-full text-primary drop-shadow-[0_0_15px_rgba(255,107,53,0.5)]" />
                    <div className="absolute -top-2 -right-2 bg-secondary text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce">
                      OPEN ME!
                    </div>
                  </motion.div>

                  <h2 className="text-2xl font-bold text-white mb-2">
                    You've Discovered a Gift!
                  </h2>
                  <p className="text-gray-400 mb-8">
                    We have a special welcome reward waiting for you inside.
                  </p>

                  <Button 
                    onClick={handleOpenGift}
                    className="w-full bg-gradient-to-r from-primary to-orange-600 hover:from-orange-500 hover:to-primary text-white font-bold h-12 rounded-xl shadow-lg shadow-primary/25"
                  >
                    Unwrap Gift
                  </Button>
                </motion.div>
              )}

              {/* Step 2: The Reveal */}
              {step === "reveal" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-4"
                >
                  <div className="mb-6 inline-flex p-4 rounded-full bg-primary/10 border border-primary/20">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>

                  <h2 className="text-2xl font-bold text-white mb-6">
                    Welcome Pack Unlocked!
                  </h2>

                  <div className="space-y-3 mb-8 text-left bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-gray-200">Unlimited AI Workflow Generations</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-gray-200">Access to 50+ Premium Templates</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-gray-200">Save & Export Workflows</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={() => handleLogin("google")}
                      className="w-full bg-white text-black hover:bg-gray-200 font-bold h-12 rounded-xl"
                    >
                      Claim with Google
                    </Button>
                    <Button
                      onClick={() => handleLogin("github")}
                      variant="outline"
                      className="w-full border-white/20 hover:bg-white/10 h-12 rounded-xl"
                    >
                      Claim with GitHub
                    </Button>
                  </div>
                  
                  <p className="mt-4 text-xs text-gray-500">
                    Limited time offer for new members.
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
