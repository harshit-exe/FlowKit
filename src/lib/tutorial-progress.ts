import { TutorialProgress } from "@/types"

const STORAGE_PREFIX = "flowkit_tutorial_progress_"

/**
 * Get tutorial progress from localStorage
 */
export function getTutorialProgress(tutorialId: string): TutorialProgress | null {
    if (typeof window === "undefined") return null

    try {
        const key = `${STORAGE_PREFIX}${tutorialId}`
        const data = localStorage.getItem(key)

        if (!data) return null

        return JSON.parse(data) as TutorialProgress
    } catch (error) {
        console.error("Error reading tutorial progress:", error)
        return null
    }
}

/**
 * Save tutorial progress to localStorage
 */
export function saveTutorialProgress(progress: TutorialProgress): void {
    if (typeof window === "undefined") return

    try {
        const key = `${STORAGE_PREFIX}${progress.tutorialId}`
        localStorage.setItem(key, JSON.stringify(progress))
    } catch (error) {
        console.error("Error saving tutorial progress:", error)
    }
}

/**
 * Initialize new tutorial progress
 */
export function initializeTutorialProgress(tutorialId: string): TutorialProgress {
    const progress: TutorialProgress = {
        tutorialId,
        currentStep: 0,
        completedSteps: [],
        isCompleted: false,
        startedAt: new Date().toISOString(),
        lastAccessedAt: new Date().toISOString(),
    }

    saveTutorialProgress(progress)
    return progress
}

/**
 * Update progress when completing a step
 */
export function completeStep(
    tutorialId: string,
    stepId: string,
    totalSteps: number
): TutorialProgress {
    let progress = getTutorialProgress(tutorialId)

    if (!progress) {
        progress = initializeTutorialProgress(tutorialId)
    }

    // Add step to completed if not already there
    if (!progress.completedSteps.includes(stepId)) {
        progress.completedSteps.push(stepId)
    }

    // Update last accessed time
    progress.lastAccessedAt = new Date().toISOString()

    // Check if all steps are completed
    if (progress.completedSteps.length >= totalSteps) {
        progress.isCompleted = true
        progress.completedAt = new Date().toISOString()
    }

    saveTutorialProgress(progress)
    return progress
}

/**
 * Update current step position
 */
export function updateCurrentStep(
    tutorialId: string,
    stepIndex: number
): TutorialProgress {
    let progress = getTutorialProgress(tutorialId)

    if (!progress) {
        progress = initializeTutorialProgress(tutorialId)
    }

    progress.currentStep = stepIndex
    progress.lastAccessedAt = new Date().toISOString()

    saveTutorialProgress(progress)
    return progress
}

/**
 * Reset tutorial progress
 */
export function resetTutorialProgress(tutorialId: string): void {
    if (typeof window === "undefined") return

    try {
        const key = `${STORAGE_PREFIX}${tutorialId}`
        localStorage.removeItem(key)
    } catch (error) {
        console.error("Error resetting tutorial progress:", error)
    }
}

/**
 * Get all tutorial progress (for analytics/history)
 */
export function getAllTutorialProgress(): TutorialProgress[] {
    if (typeof window === "undefined") return []

    try {
        const allProgress: TutorialProgress[] = []

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)

            if (key?.startsWith(STORAGE_PREFIX)) {
                const data = localStorage.getItem(key)
                if (data) {
                    allProgress.push(JSON.parse(data))
                }
            }
        }

        return allProgress
    } catch (error) {
        console.error("Error getting all tutorial progress:", error)
        return []
    }
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(progress: TutorialProgress, totalSteps: number): number {
    if (totalSteps === 0) return 0
    return Math.round((progress.completedSteps.length / totalSteps) * 100)
}

/**
 * Get time elapsed since start
 */
export function getTimeElapsed(progress: TutorialProgress): string {
    const start = new Date(progress.startedAt)
    const now = new Date()
    const diffMs = now.getTime() - start.getTime()

    const minutes = Math.floor(diffMs / 60000)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
        const remainingMinutes = minutes % 60
        return `${hours}h ${remainingMinutes}m`
    }

    return `${minutes}m`
}
