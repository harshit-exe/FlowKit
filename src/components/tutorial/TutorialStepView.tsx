"use client"

import { TutorialStep, TutorialProgress } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, HelpCircle, Info, Target, Lightbulb, Code, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import CredentialSetupCard from "./CredentialSetupCard"
import ExternalResourcesList from "./ExternalResourcesList"
import { canCompleteStep } from "@/lib/tutorial-progress"

interface TutorialStepViewProps {
  step: TutorialStep
  isCompleted: boolean
  progress: TutorialProgress | null
  onMarkComplete: () => void
}

export default function TutorialStepView({
  step,
  isCompleted,
  progress,
  onMarkComplete,
}: TutorialStepViewProps) {
  const [showHints, setShowHints] = useState(false)
  const [revealedHints,  setRevealedHints] = useState<number>(0)
  
  // Check if this step can be completed (sequential validation)
  const canComplete = canCompleteStep(progress, step.order)
  const isLocked = !canComplete && !isCompleted

  const getStepIcon = () => {
    if (isLocked) return <Lock className="h-5 w-5" />
    
    switch (step.type) {
      case "INFO":
        return <Info className="h-5 w-5" />
      case "ACTION":
        return <Target className="h-5 w-5" />
      case "VALIDATION":
        return <CheckCircle2 className="h-5 w-5" />
      case "CHECKPOINT":
        return <CheckCircle2 className="h-5 w-5" />
      default:
        return <Info className="h-5 w-5" />
    }
  }

  const getStepColor = () => {
    if (isLocked) return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30"
    
    switch (step.type) {
      case "INFO":
        // Blue = Calm, trust, knowledge (passive learning)
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
      case "ACTION":
        // Primary Orange = Energy, motivation, action (active doing)
        return "bg-primary/10 text-primary border-primary/30"
      case "VALIDATION":
        // Purple = Mastery, wisdom, checking (validation)
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30"
      case "CHECKPOINT":
        // Green = Success, achievement, milestone
        return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30"
      default:
        return "bg-muted text-muted-foreground border-muted"
    }
  }

  const revealNextHint = () => {
    if (step.hints && revealedHints < step.hints.length) {
      setRevealedHints(revealedHints + 1)
      setShowHints(true)
    }
  }

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className={cn("p-3 rounded-lg border-2 transition-all", getStepColor())}>
            {getStepIcon()}
          </div>
          <div className="flex-1">
            <div className="flex gap-2 mb-2">
              <Badge variant="outline" className="font-mono">
                {step.type}
              </Badge>
              {isLocked && (
                <Badge variant="destructive" className="font-mono gap-1">
                  <Lock className="h-3 w-3" />
                  LOCKED
                </Badge>
              )}
            </div>
            <h2 className="text-2xl font-bold font-mono uppercase tracking-tight">
              {step.title}
            </h2>
          </div>
        </div>
      </div>

      {/* Locked State Message - RED psychology (Stop/Warning) */}
      {isLocked && (
        <Card className="border-2 border-red-500/50 bg-red-500/10">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-mono font-bold text-red-600 dark:text-red-400">
                  Complete Previous Steps First
                </p>
                <p className="text-sm font-mono text-muted-foreground mt-1">
                  You need to complete step {step.order - 1} before you can access this step.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step Content */}
      <Card className={cn("border-2", isLocked && "opacity-60")}>
        <CardContent className="pt-6 space-y-6">
          {/* Description */}
          <p className="text-lg font-mono leading-relaxed whitespace-pre-wrap">
            {step.description}
          </p>

          {/* Credential Setup Cards */}
          {step.credentialLinks && step.credentialLinks.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-mono font-bold text-muted-foreground uppercase flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Credential Setup Required:
              </p>
              <div className="grid gap-3">
                {step.credentialLinks.map((credLink, idx) => (
                  <CredentialSetupCard key={idx} credentialLink={credLink} />
                ))}
              </div>
            </div>
          )}

          {/* Code Snippet */}
          {step.codeSnippet && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-mono font-bold text-muted-foreground">
                <Code className="h-4 w-4" />
                <span className="uppercase">Step-by-Step Instructions:</span>
              </div>
              <Card className="bg-muted/50 border-2">
                <CardContent className="p-4">
                  <pre className="text-sm font-mono whitespace-pre-wrap overflow-x-auto">
                    {step.codeSnippet}
                  </pre>
                </CardContent>
              </Card>
            </div>
          )}

          {/* External Resources */}
          {step.externalResources && step.externalResources.length > 0 && (
            <ExternalResourcesList resources={step.externalResources} />
          )}

          {/* Image */}
          {step.imageUrl && (
            <div className="border-2 rounded-lg overflow-hidden">
              <img
                src={step.imageUrl}
                alt={step.title}
                className="w-full"
              />
            </div>
          )}

          {/* Video */}
          {step.videoUrl && (
            <div className="border-2 rounded-lg overflow-hidden aspect-video">
              <iframe
                src={step.videoUrl}
                className="w-full h-full"
                allowFullScreen
                title={step.title}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hints Section - YELLOW psychology (Guidance/Helpful) */}
      {!isLocked && step.hints && step.hints.length > 0 && (
        <Card className="border-2 border-amber-500/30 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="font-mono uppercase tracking-wider text-sm flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <span className="text-amber-600 dark:text-amber-400">Need a hint?</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!showHints && revealedHints === 0 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={revealNextHint}
                className="font-mono border-2 border-amber-500/30 hover:bg-amber-500/10"
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Show Hint ({step.hints.length} available)
              </Button>
            ) : (
              <>
                <div className="space-y-2">
                  {step.hints.slice(0, revealedHints).map((hint, index) => (
                    <div
                      key={index}
                      className="flex gap-3 p-3 bg-background border-2 border-amber-500/20 rounded-lg"
                    >
                      <span className="flex-shrink-0 font-mono font-bold text-amber-500 text-lg">
                        💡
                      </span>
                      <p className="text-sm font-mono">{hint}</p>
                    </div>
                  ))}
                </div>
                {revealedHints < step.hints.length && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={revealNextHint}
                    className="font-mono border-2 border-amber-500/30 hover:bg-amber-500/10"
                  >
                    Show Another Hint ({step.hints.length - revealedHints} remaining)
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Completion Status - GREEN psychology (Success/Achievement/Reward) */}
      {isCompleted && (
        <Card className="border-2 border-green-500/50 bg-green-500/10">
          <CardContent className="py-4">
            <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 font-mono font-bold">
              <CheckCircle2 className="h-5 w-5" />
              <span>Step Completed! ✓</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
