// composables/useRubrics.ts - Composable for fetching and caching rubric definitions

import type {
  RubricResponse,
  AvailableSkillsResponse,
  IndicatorRatings,
  SkillEvaluations,
  ValidationResult
} from '~/types/rubrics'
import { logError, debug } from '~/utils/logger'

/**
 * Composable for managing rubric definitions and indicator-based evaluations
 * 
 * Features:
 * - Fetches rubric definitions from backend (single source of truth)
 * - Caches rubrics in memory to avoid redundant API calls
 * - Provides validation helpers for indicator ratings
 * - Never calculates skill percentages (backend responsibility)
 * 
 * @example
 * ```ts
 * const { fetchRubric, fetchAllSkills, validateRatings } = useRubrics()
 * 
 * // Fetch rubric for a skill
 * const shootingRubric = await fetchRubric('Shooting')
 * 
 * // Validate all indicators are rated
 * const validation = validateRatings(evaluations, tasks)
 * if (!validation.isValid) {
 *   console.error(validation.errors)
 * }
 * ```
 */
export function useRubrics() {
  const { $api } = useNuxtApp()

  // In-memory cache for rubrics (survives navigation within session)
  const rubricCache = useState<Record<string, RubricResponse>>('rubric-cache', () => ({}))
  const availableSkills = useState<string[] | null>('available-skills', () => null)

  /**
   * Fetch list of all available skills with rubric definitions
   * Cached after first call
   */
  async function fetchAllSkills(): Promise<string[]> {
    if (availableSkills.value) {
      debug('[useRubrics] Returning cached skills list')
      return availableSkills.value
    }

    try {
      debug('[useRubrics] Fetching available skills from API')
      const response = await $api<AvailableSkillsResponse>('/rubrics/skills')
      availableSkills.value = response.skills
      return response.skills
    } catch (error) {
      logError('[useRubrics] Failed to fetch available skills:', error)
      throw new Error('Failed to load available skills')
    }
  }

  /**
   * Fetch rubric definition for a specific skill
   * Results are cached in memory to avoid redundant API calls
   * 
   * @param skillName - Name of the skill (e.g., "Shooting", "Ball Handling")
   * @returns Rubric definition with indicators and descriptions
   */
  async function fetchRubric(skillName: string): Promise<RubricResponse> {
    // Check cache first
    if (rubricCache.value[skillName]) {
      debug(`[useRubrics] Returning cached rubric for "${skillName}"`)
      return rubricCache.value[skillName]
    }

    try {
      debug(`[useRubrics] Fetching rubric for "${skillName}" from API`)
      const rubric = await $api<RubricResponse>(`/rubrics/${skillName}`)
      
      // Cache the result
      rubricCache.value[skillName] = rubric
      
      return rubric
    } catch (error: unknown) {
      logError(`[useRubrics] Failed to fetch rubric for "${skillName}":`, error)
      
      // Provide helpful error message
      const errorObj = error as { status?: number }
      if (errorObj.status === 404) {
        throw new Error(`Rubric not found for skill "${skillName}". This skill may not support indicator-based evaluation yet.`)
      }
      
      throw new Error(`Failed to load rubric for "${skillName}"`)
    }
  }

  /**
   * Fetch multiple rubrics at once
   * Useful when loading evaluation page with multiple skills
   * 
   * @param skillNames - Array of skill names to fetch
   * @returns Array of rubrics (same order as input)
   */
  async function fetchMultipleRubrics(skillNames: string[]): Promise<RubricResponse[]> {
    try {
      debug(`[useRubrics] Fetching ${skillNames.length} rubrics`)
      
      // Fetch in parallel for better performance
      const promises = skillNames.map(name => fetchRubric(name))
      const rubrics = await Promise.all(promises)
      
      return rubrics
    } catch (error) {
      logError('[useRubrics] Failed to fetch multiple rubrics:', error)
      throw error
    }
  }

  /**
   * Check if all indicators for a skill are rated
   * 
   * @param rubric - Rubric definition for the skill
   * @param ratings - Current indicator ratings
   * @returns true if all indicators have a rating (1, 2, or 3)
   */
  function isSkillComplete(rubric: RubricResponse, ratings: IndicatorRatings): boolean {
    if (!ratings) return false
    
    return rubric.indicators.every(indicator => {
      const rating = ratings[indicator.title]
      return rating === 1 || rating === 2 || rating === 3
    })
  }

  /**
   * Validate that all required indicators are rated across all skills
   * 
   * @param evaluations - All skill evaluations for the current task
   * @param skills - Array of skills with their rubrics
   * @returns Validation result with errors and incomplete skills
   */
  function validateRatings(
    evaluations: SkillEvaluations,
    skills: Array<{ skillId: number; skillName: string; rubric: RubricResponse | null }>
  ): ValidationResult {
    const errors: string[] = []
    const incompleteSkills: string[] = []

    for (const skill of skills) {
      if (!skill.rubric) {
        errors.push(`Rubric not loaded for skill "${skill.skillName}"`)
        continue
      }

      const ratings = evaluations[skill.skillId]
      
      if (!ratings) {
        errors.push(`No ratings provided for skill "${skill.skillName}"`)
        incompleteSkills.push(skill.skillName)
        continue
      }

      // Check each indicator
      const missingIndicators: string[] = []
      
      for (const indicator of skill.rubric.indicators) {
        const rating = ratings[indicator.title]
        
        if (rating !== 1 && rating !== 2 && rating !== 3) {
          missingIndicators.push(indicator.title)
        }
      }

      if (missingIndicators.length > 0) {
        errors.push(
          `Skill "${skill.skillName}" is missing ratings for: ${missingIndicators.join(', ')}`
        )
        incompleteSkills.push(skill.skillName)
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      incompleteSkills
    }
  }

  /**
   * Get progress for a skill (how many indicators are rated)
   * 
   * @param rubric - Rubric definition for the skill
   * @param ratings - Current indicator ratings
   * @returns Object with completed count and total count
   */
  function getSkillProgress(rubric: RubricResponse, ratings: IndicatorRatings): {
    completed: number
    total: number
    percentage: number
  } {
    const total = rubric.indicators.length
    const completed = rubric.indicators.filter(indicator => {
      const rating = ratings?.[indicator.title]
      return rating === 1 || rating === 2 || rating === 3
    }).length

    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    }
  }

  /**
   * Clear all cached rubrics
   * Useful when switching users or refreshing data
   */
  function clearCache() {
    debug('[useRubrics] Clearing rubric cache')
    rubricCache.value = {}
    availableSkills.value = null
  }

  /**
   * Check if a skill name has a rubric definition available
   * Requires fetchAllSkills() to be called first
   * 
   * @param skillName - Name of the skill to check
   * @returns true if rubric exists for this skill
   */
  function hasRubric(skillName: string): boolean {
    if (!availableSkills.value) {
      console.warn('[useRubrics] availableSkills not loaded. Call fetchAllSkills() first.')
      return false
    }
    
    return availableSkills.value.includes(skillName)
  }

  return {
    // Fetch functions
    fetchRubric,
    fetchAllSkills,
    fetchMultipleRubrics,
    
    // Validation functions
    validateRatings,
    isSkillComplete,
    getSkillProgress,
    hasRubric,
    
    // Cache management
    clearCache,
    
    // State (read-only access)
    rubricCache: readonly(rubricCache),
    availableSkills: readonly(availableSkills)
  }
}
