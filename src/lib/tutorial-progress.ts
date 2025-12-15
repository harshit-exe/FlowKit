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
 * Now with sequential validation
 */
export function completeStep(
    tutorialId: string,
    stepId: string,
    stepOrder: number, // Added step order parameter
    totalSteps: number
): TutorialProgress {
    let progress = getTutorialProgress(tutorialId)

    if (!progress) {
        progress = initializeTutorialProgress(tutorialId)
    }

    // Sequential validation: Check if all previous steps are completed
    if (stepOrder > 1) {
        const previousStepsCompleted = progress.completedSteps.filter(id => {
            // Extract step number from step ID (assumes format "step-1", "step-2", etc.)
            const match = id.match(/step-(\d+)/)
            if (match) {
                const stepNum = parseInt(match[1])
                return stepNum < stepOrder
            }
            return false
        })

        const expectedPreviousSteps = stepOrder - 1
        if (previousStepsCompleted.length < expectedPreviousSteps) {
            // Return progress without marking step complete - user must complete previous steps first
            console.warn(`[TUTORIAL] Cannot complete step ${stepOrder} - previous steps not completed`)
            return progress
        }
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
    const percentage = (progress.completedSteps.length / totalSteps) * 100
    // Use Math.round to ensure 100% shows when all steps complete
    // Cap at 100% to prevent showing values over 100%
    return Math.min(Math.round(percentage), 100)
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

/**
 * Check if a step can be completed (sequential validation)
 */
export function canCompleteStep(
    progress: TutorialProgress | null,
    stepOrder: number
): boolean {
    if (!progress) return stepOrder === 1 // First step is always unlocked

    if (stepOrder === 1) return true // First step is always unlocked

    // Check if all previous steps are completed
    const previousStepsCompleted = progress.completedSteps.filter(id => {
        const match = id.match(/step-(\d+)/)
        if (match) {
            const stepNum = parseInt(match[1])
            return stepNum < stepOrder
        }
        return false
    })

    const expectedPreviousSteps = stepOrder - 1
    return previousStepsCompleted.length >= expectedPreviousSteps
}

/**
 * Check if a step is already completed
 */
export function isStepCompleted(
    progress: TutorialProgress | null,
    stepId: string
): boolean {
    if (!progress) return false
    return progress.completedSteps.includes(stepId)
}
