"use client"

import { Tutorial, TutorialProgress } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Clock, GraduationCap, PlayCircle } from "lucide-react"
import { calculateProgress } from "@/lib/tutorial-progress"

interface TutorialCardProps {
  tutorial: Tutorial
  progress?: TutorialProgress | null
  onStart: () => void
}

export default function TutorialCard({ tutorial, progress, onStart }: TutorialCardProps) {
  const progressPercentage = progress
    ? calculateProgress(progress, tutorial.steps.length)
    : 0

  const isCompleted = progress?.isCompleted || false
  const isInProgress = progress && !isCompleted && progress.completedSteps.length > 0

  return (
    <Card className="border-2 hover:border-primary/50 transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="font-mono uppercase tracking-wider text-lg flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              {tutorial.title}
            </CardTitle>
            <CardDescription className="font-mono mt-2">
              {tutorial.description}
            </CardDescription>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant="secondary" className="font-mono">
            {tutorial.difficulty}
          </Badge>
          <Badge variant="outline" className="font-mono gap-1">
            <Clock className="h-3 w-3" />
            {tutorial.estimatedTime}
          </Badge>
          <Badge variant="outline" className="font-mono">
            {tutorial.steps.length} STEPS
          </Badge>
          {isCompleted && (
            <Badge className="font-mono bg-green-600 hover:bg-green-700">
              ✓ COMPLETED
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress bar */}
        {isInProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-mono">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-primary font-bold">{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-xs font-mono text-muted-foreground">
              {progress.completedSteps.length} of {tutorial.steps.length} steps completed
            </p>
          </div>
        )}

        {/* Call to Action */}
        <Button
          onClick={onStart}
          className="w-full font-mono uppercase gap-2"
          size="lg"
        >
          <PlayCircle className="h-5 w-5" />
          {isCompleted
            ? "Restart Tutorial"
            : isInProgress
            ? "Continue Tutorial"
            : "Start Tutorial"}
        </Button>

        {/* Tutorial Preview */}
        {!isInProgress && (
          <div className="pt-4 border-t">
            <p className="text-sm font-mono font-bold mb-2 text-muted-foreground uppercase">
              What you'll learn:
            </p>
            <ul className="space-y-1 text-sm font-mono">
              {tutorial.steps.slice(0, 3).map((step, idx) => (
                <li key={step.id} className="flex gap-2">
                  <span className="text-primary font-bold">{idx + 1}.</span>
                  <span className="text-muted-foreground">{step.title}</span>
                </li>
              ))}
              {tutorial.steps.length > 3 && (
                <li className="text-muted-foreground/50">
                  + {tutorial.steps.length - 3} more steps...
                </li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
