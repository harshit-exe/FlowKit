"use client"

import { Tutorial } from "@/types"
import { useState, useEffect } from "react"
import TutorialCard from "./TutorialCard"
import InteractiveTutorial from "./InteractiveTutorial"
import { getTutorialProgress } from "@/lib/tutorial-progress"

interface TutorialSectionProps {
  workflowSlug: string
}

export default function TutorialSection({ workflowSlug }: TutorialSectionProps) {
  const [tutorial, setTutorial] = useState<Tutorial | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [progress, setProgress] = useState(getTutorialProgress(""))

  useEffect(() => {
    async function fetchTutorial() {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/tutorials/${workflowSlug}`)

        if (response.ok) {
          const data = await response.json()
          // Handle new database API response format
          if (data.success && data.tutorial) {
            setTutorial(data.tutorial)
            setProgress(getTutorialProgress(data.tutorial.id))
          } else {
            setTutorial(null)
          }
        } else {
          setTutorial(null)
        }
      } catch (error) {
        console.error("Failed to load tutorial:", error)
        setTutorial(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTutorial()
  }, [workflowSlug])

  // Update progress when tutorial opens/closes
  useEffect(() => {
    if (tutorial && !isOpen) {
      setProgress(getTutorialProgress(tutorial.id))
    }
  }, [isOpen, tutorial])

  if (isLoading) {
    return (
      <div className="text-center py-12 font-mono text-muted-foreground">
        <div className="animate-pulse">Loading tutorial...</div>
      </div>
    )
  }

  if (!tutorial) {
    return (
      <div className="text-center py-12 text-muted-foreground font-mono space-y-2">
        <p className="text-lg">No interactive tutorial available yet</p>
        <p className="text-sm">Check back soon for step-by-step guidance!</p>
      </div>
    )
  }

  return (
    <>
      <TutorialCard
        tutorial={tutorial}
        progress={progress}
        onStart={() => setIsOpen(true)}
      />

      <InteractiveTutorial
        tutorial={tutorial}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}
