"use client"

import { TutorialStep } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, HelpCircle, Info, Target, Lightbulb, Code } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface TutorialStepViewProps {
  step: TutorialStep
  isCompleted: boolean
  onMarkComplete: () => void
}

export default function TutorialStepView({
  step,
  isCompleted,
  onMarkComplete,
}: TutorialStepViewProps) {
  const [showHints, setShowHints] = useState(false)
  const [revealedHints, setRevealedHints] = useState<number>(0)

  const getStepIcon = () => {
    switch (step.type) {
      case "INFO":
        return <Info className="h-5 w-5" />
      case "ACTION":
        return <Target className="h-5 w-5" />
      case "VALIDATION":
        return <CheckCircle2 className="h-5 w-5" />
      case "CHECKPOINT":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      default:
        return <Info className="h-5 w-5" />
    }
  }

  const getStepColor = () => {
    switch (step.type) {
      case "INFO":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "ACTION":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20"
      case "VALIDATION":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20"
      case "CHECKPOINT":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      default:
        return "bg-primary/10 text-primary border-primary/20"
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
          <div className={cn("p-3 rounded-lg border-2", getStepColor())}>
            {getStepIcon()}
          </div>
          <div className="flex-1">
            <Badge variant="outline" className="font-mono mb-2">
              {step.type}
            </Badge>
            <h2 className="text-2xl font-bold font-mono uppercase tracking-tight">
              {step.title}
            </h2>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <Card className="border-2">
        <CardContent className="pt-6 space-y-6">
          {/* Description */}
          <p className="text-lg font-mono leading-relaxed whitespace-pre-wrap">
            {step.description}
          </p>

          {/* Code Snippet */}
          {step.codeSnippet && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-mono font-bold text-muted-foreground">
                <Code className="h-4 w-4" />
                <span className="uppercase">Instructions:</span>
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

      {/* Hints Section */}
      {step.hints && step.hints.length > 0 && (
        <Card className="border-2 border-yellow-500/20 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="font-mono uppercase tracking-wider text-sm flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              Need a hint?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!showHints && revealedHints === 0 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={revealNextHint}
                className="font-mono border-2"
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
                      className="flex gap-3 p-3 bg-background border-2 rounded-lg"
                    >
                      <span className="flex-shrink-0 font-mono font-bold text-yellow-500">
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
                    className="font-mono border-2"
                  >
                    Show Another Hint ({step.hints.length - revealedHints} remaining)
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Mark Complete Button */}
      {!isCompleted && step.type !== "CHECKPOINT" && (
        <Button
          onClick={onMarkComplete}
          size="lg"
          className="w-full font-mono uppercase gap-2"
        >
          <CheckCircle2 className="h-5 w-5" />
          Mark as Complete
        </Button>
      )}

      {isCompleted && (
        <Card className="border-2 border-green-500/50 bg-green-500/10">
          <CardContent className="py-4">
            <div className="flex items-center justify-center gap-2 text-green-600 font-mono font-bold">
              <CheckCircle2 className="h-5 w-5" />
              <span>Step Completed!</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
