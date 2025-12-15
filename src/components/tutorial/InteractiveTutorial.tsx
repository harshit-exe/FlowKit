"use client"

import { Tutorial, TutorialProgress } from "@/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import {
  getTutorialProgress,
  initializeTutorialProgress,
  completeStep,
  updateCurrentStep,
} from "@/lib/tutorial-progress"
import TutorialStepView from "./TutorialStepView"
import TutorialCompletionCelebration from "./TutorialCompletionCelebration"

interface InteractiveTutorialProps {
  tutorial: Tutorial
  isOpen: boolean
  onClose: () => void
}

export default function InteractiveTutorial({
  tutorial,
  isOpen,
  onClose,
}: InteractiveTutorialProps) {
  const [progress, setProgress] = useState<TutorialProgress | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)

  const currentStep = tutorial.steps[currentStepIndex]
  const isLastStep = currentStepIndex === tutorial.steps.length - 1
  const isFirstStep = currentStepIndex === 0

  // Initialize or load progress
  useEffect(() => {
    if (isOpen) {
      let existingProgress = getTutorialProgress(tutorial.id)

      if (!existingProgress) {
        existingProgress = initializeTutorialProgress(tutorial.id)
      }

      setProgress(existingProgress)
      setCurrentStepIndex(existingProgress.currentStep)
    }
  }, [isOpen, tutorial.id])

  // Navigation handlers (defined before use)
  const handleNext = useCallback(() => {
    if (isLastStep) return

    // Check if current step is completed before allowing navigation
    const currentStepCompleted = progress?.completedSteps.includes(currentStep?.id || "")
    
    if (!currentStepCompleted && currentStep?.type !== "INFO") {
      // Show toast notification
      toast.error("Please complete this step before moving forward", {
        description: "Mark the current step as complete to continue"
      })
      return
    }

    setCurrentStepIndex((prev) => Math.min(prev + 1, tutorial.steps.length - 1))
    updateCurrentStep(tutorial.id, currentStepIndex + 1)
  }, [currentStepIndex, tutorial, isLastStep, currentStep, progress])

  const handlePrevious = useCallback(() => {
    if (currentStepIndex === 0) return
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0))
    updateCurrentStep(tutorial.id, currentStepIndex - 1)
  }, [currentStepIndex, tutorial])

  const handleClose = useCallback(() => {
    // Save current position before closing
    if (progress) {
      updateCurrentStep(tutorial.id, currentStepIndex)
    }
    onClose()
  }, [progress, tutorial.id, currentStepIndex, onClose])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === "ArrowRight" && !isLastStep) {
        handleNext()
      } else if (e.key === "ArrowLeft" && !isFirstStep) {
        handlePrevious()
      } else if (e.key === "Escape") {
        handleClose()
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [isOpen, isLastStep, isFirstStep, handleNext, handlePrevious, handleClose])

  const handleStepComplete = useCallback(() => {
    if (!currentStep || !progress) return

    const updatedProgress = completeStep(
      tutorial.id,
      currentStep.id,
      currentStep.order, // Pass step order for sequential validation
      tutorial.steps.length
    )

    setProgress(updatedProgress)

    // If this was the last step and all steps are completed, show celebration
    if (updatedProgress.isCompleted) {
      setShowCelebration(true)
    } else if (!isLastStep) {
      // Auto-advance to next step
      setTimeout(() => handleNext(), 500)
    }
  }, [currentStep, progress, tutorial, isLastStep, handleNext])

  const handleStepClick = (stepIndex: number) => {
    setCurrentStepIndex(stepIndex)
    updateCurrentStep(tutorial.id, stepIndex)
  }

  const isStepCompleted = progress?.completedSteps.includes(currentStep?.id) || false

  if (showCelebration) {
    return (
      <TutorialCompletionCelebration
        tutorial={tutorial}
        progress={progress!}
        isOpen={isOpen}
        onClose={handleClose}
      />
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden p-0 border-2 border-primary/30">
        {/* Ultra-Compact Header - Content First! */}
        <DialogHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-primary/20 px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Compact title */}
              <DialogTitle className="font-mono uppercase text-sm tracking-wider text-primary truncate">
                {tutorial.title}
              </DialogTitle>
              {/* Mini inline progress bar */}
              {progress && (
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300"
                      style={{ 
                        width: `${Math.min(Math.round((progress.completedSteps.length / tutorial.steps.length) * 100), 100)}%` 
                      }}
                    />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                    {currentStepIndex + 1}/{tutorial.steps.length}
                  </span>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="shrink-0 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Maximized Content Area - 80% of screen! */}
        <div className="overflow-y-auto max-h-[calc(95vh-140px)] px-6 py-6">
          {currentStep && (
            <TutorialStepView
              step={currentStep}
              isCompleted={isStepCompleted}
              progress={progress}
              onMarkComplete={handleStepComplete}
            />
          )}
        </div>

        {/* Compact Single-Row Footer - All actions inline */}
        <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-primary/20 px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Previous */}
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstStep}
              size="sm"
              className="font-mono"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>

            {/* Center: Action */}
            <div className="flex-1 flex justify-center">
              {isStepCompleted ? (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-mono text-sm font-bold">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Complete</span>
                </div>
              ) : currentStep?.type !== "CHECKPOINT" ? (
                <Button
                  onClick={handleStepComplete}
                  size="sm"
                  className="font-mono bg-primary hover:bg-primary/90"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark Complete
                </Button>
              ) : null}
            </div>

            {/* Right: Next/Finish */}
            {isLastStep ? (
              <Button
                onClick={handleClose}
                size="sm"
                className="font-mono"
              >
                Finish
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                size="sm"
                className="font-mono"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
