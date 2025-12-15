/**
 * TUTORIAL PROGRESS FIX SCRIPT
 * Run this once to clear corrupted localStorage data
 * Open browser console and paste this code
 */

console.log('[TUTORIAL FIX] Cleaning up localStorage...')

// Get all tutorial progress keys
const tutorialKeys = []
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i)
  if (key && key.startsWith('tutorial_progress_')) {
    tutorialKeys.push(key)
  }
}

console.log(`[TUTORIAL FIX] Found ${tutorialKeys.length} tutorials in localStorage`)

// Check each one for corruption
tutorialKeys.forEach(key => {
  const data = localStorage.getItem(key)
  if (data) {
    try {
      const progress = JSON.parse(data)
      console.log(`[TUTORIAL FIX] ${key}:`, {
        completedSteps: progress.completedSteps.length,
        duplicates: progress.completedSteps.length - new Set(progress.completedSteps).size
      })
      
      // Fix: Remove duplicates
      if (progress.completedSteps) {
        const uniqueSteps = [...new Set(progress.completedSteps)]
        if (uniqueSteps.length !== progress.completedSteps.length) {
          progress.completedSteps = uniqueSteps
          localStorage.setItem(key, JSON.stringify(progress))
          console.log(`[TUTORIAL FIX] ✅ Fixed duplicates in ${key}`)
        }
      }
    } catch (e) {
      console.error(`[TUTORIAL FIX] ❌ Error parsing ${key}:`, e)
    }
  }
})

console.log('[TUTORIAL FIX] ✅ Cleanup complete!')
console.log('[TUTORIAL FIX] Refresh the page to see fixed progress')
