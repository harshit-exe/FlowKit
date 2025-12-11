"use client";

import { useAuthModal } from "@/context/AuthModalContext";
import { Button } from "@/components/ui/button";
import { X, Sparkles, ArrowRight, Lock, Zap, Shield } from "lucide-react";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthModal() {
  const { isOpen, closeAuthModal } = useAuthModal();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg overflow-hidden rounded-2xl border-2 border-primary/20 bg-black shadow-2xl"
        >
          {/* Decorative Gradient */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-primary" />
          
          {/* Close Button */}
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="p-8">
            {/* Header */}
            <div className="text-center space-y-4 mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20 mb-2">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold font-mono uppercase tracking-tight text-white">
                Unlock Full Access
              </h2>
              <p className="text-gray-400 font-mono text-sm leading-relaxed max-w-sm mx-auto">
                Join thousands of developers building the future of automation with FlowKit.
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/5">
                <div className="p-2 rounded-md bg-purple-500/10 text-purple-400">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white font-mono text-sm">Save & Organize</h3>
                  <p className="text-xs text-gray-400 font-mono">Bookmark your favorite workflows</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/5">
                <div className="p-2 rounded-md bg-blue-500/10 text-blue-400">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white font-mono text-sm">AI Workflow Builder</h3>
                  <p className="text-xs text-gray-400 font-mono">Generate unlimited workflows with AI</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/5">
                <div className="p-2 rounded-md bg-green-500/10 text-green-400">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white font-mono text-sm">Community Access</h3>
                  <p className="text-xs text-gray-400 font-mono">Rate, review, and share feedback</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={() => signIn("google")}
                className="w-full font-mono font-bold h-12 text-base"
                size="lg"
              >
                Sign In with Google
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                onClick={() => signIn("github")}
                variant="outline"
                className="w-full font-mono font-bold h-12 text-base border-2"
                size="lg"
              >
                Sign In with GitHub
              </Button>
            </div>

            {/* Footer */}
            <p className="mt-6 text-center text-xs text-gray-500 font-mono">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
