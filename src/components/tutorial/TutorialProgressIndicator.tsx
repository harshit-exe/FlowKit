"use client"

import { TutorialProgress } from "@/types"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

interface TutorialProgressIndicatorProps {
  currentStep: number
  totalSteps: number
  progress: TutorialProgress
  onStepClick?: (stepIndex: number) => void
}

export default function TutorialProgressIndicator({
  currentStep,
  totalSteps,
  progress,
  onStepClick,
}: TutorialProgressIndicatorProps) {
  const progressPercentage = Math.round(
    (progress.completedSteps.length / totalSteps) * 100
  )

  return (
    <div className="space-y-4">
      {/* Overall Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-mono font-bold">PROGRESS</span>
          <span className="text-sm font-mono text-primary font-bold">
            {progressPercentage}%
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
        <div className="flex justify-between text-xs font-mono text-muted-foreground">
          <span>
            Step {currentStep + 1} of {totalSteps}
          </span>
          <span>
            {progress.completedSteps.length} completed
          </span>
        </div>
      </div>

      {/* Step Breadcrumbs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const isCompleted = progress.completedSteps.length > index
          const isCurrent = index === currentStep
          const isClickable = onStepClick !== undefined

          return (
            <button
              key={index}
              onClick={() => isClickable && onStepClick(index)}
              disabled={!isClickable}
              className={cn(
                "flex items-center gap-1 transition-all",
                isClickable && "cursor-pointer hover:scale-110"
              )}
              aria-label={`Go to step ${index + 1}`}
            >
              <div
                className={cn(
                  "w-8 h-8 flex items-center justify-center rounded-full border-2 font-mono text-xs font-bold transition-all",
                  isCompleted && "bg-primary text-primary-foreground border-primary",
                  isCurrent && !isCompleted && "border-primary bg-primary/10 text-primary animate-pulse",
                  !isCompleted && !isCurrent && "border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              {index < totalSteps - 1 && (
                <div
                  className={cn(
                    "w-4 h-0.5",
                    isCompleted ? "bg-primary" : "bg-muted-foreground/20"
                  )}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
