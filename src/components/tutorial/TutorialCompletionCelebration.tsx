"use client"

import { Tutorial, TutorialProgress } from "@/types"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Trophy, Sparkles, Clock, CheckCircle2, X, Share2 } from "lucide-react"
import { getTimeElapsed } from "@/lib/tutorial-progress"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import confetti from "canvas-confetti"

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
      // Trigger confetti
      const duration = 3000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min
      }

      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        })
      }, 250)

      // Show content after animation
      setTimeout(() => setShowContent(true), 500)

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
        // Fallback to clipboard
        navigator.clipboard.writeText(text)
      })
    } else {
      navigator.clipboard.writeText(text)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-4 border-primary">
        <div className="relative bg-gradient-to-br from-primary/20 via-background to-primary/10 p-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 z-10"
          >
            <X className="h-5 w-5" />
          </Button>

          {showContent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6 text-center"
            >
              {/* Trophy Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="flex justify-center"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse" />
                  <div className="relative bg-primary p-6 rounded-full">
                    <Trophy className="h-16 w-16 text-primary-foreground" />
                  </div>
                </div>
              </motion.div>

              {/* Congratulations Text */}
              <div className="space-y-2">
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-4xl font-bold font-mono uppercase tracking-tight flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-8 w-8 text-yellow-500" />
                  Tutorial Complete!
                  <Sparkles className="h-8 w-8 text-yellow-500" />
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-xl font-mono text-muted-foreground"
                >
                  You've successfully completed
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-2xl font-bold font-mono text-primary"
                >
                  {tutorial.title}
                </motion.p>
              </div>

              {/* Stats Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="grid grid-cols-3 gap-4"
              >
                <Card className="border-2">
                  <CardContent className="p-4 text-center">
                    <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold font-mono">{tutorial.steps.length}</p>
                    <p className="text-xs font-mono text-muted-foreground uppercase">
                      Steps
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardContent className="p-4 text-center">
                    <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold font-mono">{timeElapsed}</p>
                    <p className="text-xs font-mono text-muted-foreground uppercase">
                      Time
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardContent className="p-4 text-center">
                    <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold font-mono">100%</p>
                    <p className="text-xs font-mono text-muted-foreground uppercase">
                      Complete
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Motivational Message */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="bg-primary/10 border-2 border-primary/20 rounded-lg p-4"
              >
                <p className="font-mono text-sm">
                  🚀 You're now ready to implement this workflow in production!
                  Feel free to customize it to fit your specific needs.
                </p>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
                className="flex gap-3 justify-center pt-4"
              >
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="font-mono gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Share Achievement
                </Button>
                <Button
                  onClick={onClose}
                  className="font-mono gap-2"
                  size="lg"
                >
                  <Sparkles className="h-4 w-4" />
                  Explore More Workflows
                </Button>
              </motion.div>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
