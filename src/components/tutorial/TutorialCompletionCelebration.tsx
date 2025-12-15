"use client"

import { Tutorial, TutorialProgress } from "@/types"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Trophy, Sparkles, Clock, CheckCircle2, Share2, Zap } from "lucide-react"
import { getTimeElapsed } from "@/lib/tutorial-progress"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import confetti from "canvas-confetti"
import { toast } from "sonner"

interface TutorialCompletionCelebrationProps {
  tutorial: Tutorial
  progress: TutorialProgress
  isOpen: boolean
  onClose: () => void
}

export default function TutorialCompletionCelebration({
  tutorial,
  progress,
  isOpen,
  onClose,
}: TutorialCompletionCelebrationProps) {
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Trigger epic confetti with FlowKit colors
      const duration = 4000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 80, zIndex: 9999 }

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min
      }

      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 60 * (timeLeft / duration)
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#FF6633', '#FFB366', '#FFA500', '#FF8C00'] // FlowKit orange shades
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#FF6633', '#FFB366', '#FFA500', '#FF8C00']
        })
      }, 200)

      setTimeout(() => setShowContent(true), 400)

      return () => clearInterval(interval)
    }
  }, [isOpen])

  const timeElapsed = getTimeElapsed(progress)

  const handleShare = () => {
    const text = `I just completed "${tutorial.title}" on FlowKit! 🎉 Check out 150+ free n8n workflow templates at flowkit.in`
    
    if (navigator.share) {
      navigator.share({
        title: "FlowKit Tutorial Completed!",
        text: text,
        url: window.location.href,
      }).catch(() => {
        navigator.clipboard.writeText(text)
        toast.success("Copied to clipboard!")
      })
    } else {
      navigator.clipboard.writeText(text)
      toast.success("Copied to clipboard!")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-2 border-primary/50 shadow-2xl shadow-primary/20">
        {/* FlowKit theme gradient */}
        <div className="relative bg-gradient-to-br from-black via-primary/5 to-black p-10">
          {/* Animated glow effect with primary color */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 animate-pulse" />
          
          {showContent && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="relative space-y-8 text-center"
            >
              {/* Epic Trophy Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 150, damping: 12 }}
                className="flex justify-center"
              >
                <div className="relative">
                  {/* Primary color glow layers */}
                  <div className="absolute inset-0 bg-primary/40 rounded-full blur-2xl animate-pulse" />
                  <div className="absolute inset-0 bg-primary/60 rounded-full blur-xl animate-ping" style={{ animationDuration: '2s' }} />
                  
                  {/* Trophy container with FlowKit colors */}
                  <motion.div 
                    animate={{ 
                      rotateY: [0, 360],
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity, 
                      ease: "linear" 
                    }}
                    className="relative bg-gradient-to-br from-primary to-orange-600 p-8 rounded-full shadow-2xl shadow-primary/30"
                  >
                    <Trophy className="h-20 w-20 text-white drop-shadow-lg" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Epic Title with FlowKit styling */}
              <div className="space-y-3">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-5xl font-black font-mono uppercase tracking-tight flex items-center justify-center gap-3"
                >
                  <Sparkles className="h-10 w-10 text-primary animate-pulse" />
                  <span className="bg-gradient-to-r from-white via-white to-primary bg-clip-text text-transparent">
                    COMPLETE!
                  </span>
                  <Sparkles className="h-10 w-10 text-primary animate-pulse" />
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg font-mono text-muted-foreground"
                >
                  Tutorial Finished Successfully
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="inline-block px-6 py-3 bg-primary/10 backdrop-blur rounded-full border-2 border-primary/30"
                >
                  <p className="text-xl font-bold font-mono text-primary">
                    {tutorial.title}
                  </p>
                </motion.div>
              </div>

              {/* Stats Grid matching FlowKit style */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-3 gap-4"
              >
                <Card className="border-2 border-green-500/30 bg-green-500/5">
                  <CardContent className="p-6 text-center">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-3" />
                    </motion.div>
                    <p className="text-3xl font-black font-mono text-white">
                      {tutorial.steps.length}
                    </p>
                    <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mt-1">
                      Steps Mastered
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-blue-500/30 bg-blue-500/5">
                  <CardContent className="p-6 text-center">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      <Clock className="h-10 w-10 text-blue-500 mx-auto mb-3" />
                    </motion.div>
                    <p className="text-3xl font-black font-mono text-white">
                      {timeElapsed}
                    </p>
                    <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mt-1">
                      Time Invested
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-primary/50 bg-primary/10">
                  <CardContent className="p-6 text-center">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Zap className="h-10 w-10 text-primary mx-auto mb-3" />
                    </motion.div>
                    <p className="text-3xl font-black font-mono text-primary">
                      100%
                    </p>
                    <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mt-1">
                      Achievement
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Motivational message */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="bg-primary/10 border-2 border-primary/20 rounded-lg p-5"
              >
                <p className="font-mono text-base leading-relaxed">
                  🚀 <span className="font-bold text-primary">Congratulations!</span> You've mastered this workflow.
                  You're now ready to build amazing automations in production!
                </p>
              </motion.div>

              {/* Action Buttons matching FlowKit style */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex gap-4 justify-center pt-2"
              >
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="font-mono gap-2 border-2 border-primary/30 hover:bg-primary/10"
                  size="lg"
                >
                  <Share2 className="h-5 w-5" />
                  Share Victory
                </Button>
                <Button
                  onClick={onClose}
                  className="font-mono gap-2 bg-gradient-to-r from-primary to-orange-600 hover:from-orange-500 hover:to-primary shadow-lg shadow-primary/25"
                  size="lg"
                >
                  <Sparkles className="h-5 w-5" />
                  Continue Exploring
                </Button>
              </motion.div>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
