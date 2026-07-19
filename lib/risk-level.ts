import type { RiskLevel } from './types'

/**
 * Shared risk-conversion function used by the frontend, backend and tests.
 *
 *   0.00 - 0.39 = Low
 *   0.40 - 0.69 = Medium
 *   0.70 - 1.00 = High
 */
export function toRiskLevel(probability: number): RiskLevel {
  const p = Number.isFinite(probability) ? probability : 0
  if (p >= 0.7) return 'High'
  if (p >= 0.4) return 'Medium'
  return 'Low'
}

export const RISK_COLOR_VAR: Record<RiskLevel, string> = {
  Low: 'var(--risk-low)',
  Medium: 'var(--risk-medium)',
  High: 'var(--risk-high)',
}

export function riskBadgeClasses(level: RiskLevel): string {
  switch (level) {
    case 'High':
      return 'bg-[var(--risk-high-soft)] text-[var(--risk-high)] border-[var(--risk-high)]/30'
    case 'Medium':
      return 'bg-[var(--risk-medium-soft)] text-[var(--risk-medium)] border-[var(--risk-medium)]/30'
    default:
      return 'bg-[var(--risk-low-soft)] text-[var(--risk-low)] border-[var(--risk-low)]/30'
  }
}

/**
 * Convert readiness percentage (0-100) to readiness level.
 * Higher percentage = higher readiness = better.
 *
 *   0 - 39 = Low
 *   40 - 69 = Medium
 *   70 - 100 = High
 */
export function getReadinessLevel(
  readinessPercent: number,
): 'Low' | 'Medium' | 'High' {
  const r = Number.isFinite(readinessPercent) ? readinessPercent : 0
  if (r >= 70) return 'High'
  if (r >= 40) return 'Medium'
  return 'Low'
}
