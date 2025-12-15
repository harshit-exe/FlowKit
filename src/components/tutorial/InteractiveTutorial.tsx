"use client"

import { Tutorial, TutorialProgress } from "@/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import {
  getTutorialProgress,
  initializeTutorialProgress,
  completeStep,
  updateCurrentStep,
} from "@/lib/tutorial-progress"
import TutorialStepView from "./TutorialStepView"
import TutorialProgressIndicator from "./TutorialProgressIndicator"
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 border-2 border-primary/30">
        {/* Header with FlowKit theme */}
        <DialogHeader className="sticky top-0 z-10 bg-gradient-to-r from-black via-primary/5 to-black backdrop-blur border-b-2 border-primary/20 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="font-mono uppercase tracking-wider text-xl text-primary">
                {tutorial.title}
              </DialogTitle>
              <p className="text-sm font-mono mt-2 flex items-center gap-2 text-muted-foreground">
                <span className="px-2 py-1 bg-primary/10 rounded border border-primary/30">
                  Step {currentStepIndex + 1} of {tutorial.steps.length}
                </span>
                <span className="text-muted-foreground/40">•</span>
                <span className="text-primary">{tutorial.difficulty}</span>
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="shrink-0 hover:bg-primary/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Progress Indicator */}
          {progress && (
            <div className="mt-6">
              <TutorialProgressIndicator
                currentStep={currentStepIndex}
                totalSteps={tutorial.steps.length}
                progress={progress}
                onStepClick={handleStepClick}
              />
            </div>
          )}
        </DialogHeader>

        {/* Step Content */}
        <div className="p-6 pb-8 overflow-y-auto max-h-[calc(90vh-240px)]">
          {currentStep && (
            <TutorialStepView
              step={currentStep}
              isCompleted={isStepCompleted}
              progress={progress}
              onMarkComplete={handleStepComplete}
            />
          )}
        </div>

        {/* Navigation Footer */}
        <div className="sticky bottom-0 bg-gradient-to-r from-black via-primary/5 to-black backdrop-blur border-t-2 border-primary/20 p-4 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirstStep}
            className="font-mono border-primary/30 hover:bg-primary/10 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            {isLastStep ? (
              <Button
                onClick={handleClose}
                className="font-mono"
              >
                Finish Tutorial
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="font-mono"
              >
                Next Step
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
