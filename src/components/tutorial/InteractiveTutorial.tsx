"use client"

import { Tutorial, TutorialProgress } from "@/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
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
  }, [isOpen, currentStepIndex])

  const handleStepComplete = useCallback(() => {
    if (!currentStep || !progress) return

    const updatedProgress = completeStep(
      tutorial.id,
      currentStep.id,
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
  }, [currentStep, progress, tutorial, isLastStep])

  const handleNext = () => {
    if (isLastStep) return

    const nextIndex = currentStepIndex + 1
    setCurrentStepIndex(nextIndex)
    updateCurrentStep(tutorial.id, nextIndex)
  }

  const handlePrevious = () => {
    if (isFirstStep) return

    const prevIndex = currentStepIndex - 1
    setCurrentStepIndex(prevIndex)
    updateCurrentStep(tutorial.id, prevIndex)
  }

  const handleStepClick = (stepIndex: number) => {
    setCurrentStepIndex(stepIndex)
    updateCurrentStep(tutorial.id, stepIndex)
  }

  const handleClose = () => {
    // Save current position before closing
    if (progress) {
      updateCurrentStep(tutorial.id, currentStepIndex)
    }
    onClose()
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <DialogHeader className="sticky top-0 z-10 bg-background border-b-2 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="font-mono uppercase tracking-wider text-xl">
                {tutorial.title}
              </DialogTitle>
              <p className="text-sm text-muted-foreground font-mono mt-1">
                Step {currentStepIndex + 1} of {tutorial.steps.length}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="shrink-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Progress Indicator */}
          {progress && (
            <div className="mt-4">
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
        <div className="p-6">
          {currentStep && (
            <TutorialStepView
              step={currentStep}
              isCompleted={isStepCompleted}
              onMarkComplete={handleStepComplete}
            />
          )}
        </div>

        {/* Navigation Footer */}
        <div className="sticky bottom-0 bg-background border-t-2 p-4 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirstStep}
            className="font-mono"
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
