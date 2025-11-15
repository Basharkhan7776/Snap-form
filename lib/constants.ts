// ============================================
// PLAN LIMITS AND PRICING
// ============================================

export type Plan = "FREE" | "PREMIUM" | "BUSINESS"

export type PlanLimits = {
  maxForms: number
  maxResponsesPerMonth: number
  hasAdvancedAnalytics: boolean
  hasGoogleSheetsExport: boolean
  hasTeamCollaboration: boolean
  hasCustomBranding: boolean
  hasApiAccess: boolean
}

/**
 * Plan limits configuration
 * -1 means unlimited
 */
export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  FREE: {
    maxForms: 3,
    maxResponsesPerMonth: 100,
    hasAdvancedAnalytics: false,
    hasGoogleSheetsExport: false,
    hasTeamCollaboration: false,
    hasCustomBranding: false,
    hasApiAccess: false,
  },
  PREMIUM: {
    maxForms: -1, // unlimited
    maxResponsesPerMonth: 10000,
    hasAdvancedAnalytics: true,
    hasGoogleSheetsExport: true,
    hasTeamCollaboration: false,
    hasCustomBranding: false,
    hasApiAccess: false,
  },
  BUSINESS: {
    maxForms: -1, // unlimited
    maxResponsesPerMonth: -1, // unlimited
    hasAdvancedAnalytics: true,
    hasGoogleSheetsExport: true,
    hasTeamCollaboration: true,
    hasCustomBranding: true,
    hasApiAccess: true,
  },
}

/**
 * Plan prices in INR (paise)
 * For Razorpay payment integration
 */
export const PLAN_PRICES: Record<"PREMIUM" | "BUSINESS", number> = {
  PREMIUM: 999, // ₹999 in paise (9.99 INR)
  BUSINESS: 2999, // ₹2999 in paise (29.99 INR)
}

/**
 * Validate if a plan is valid
 */
export function isValidPlan(plan: string): plan is Plan {
  return plan === "FREE" || plan === "PREMIUM" || plan === "BUSINESS"
}

/**
 * Validate if a plan is upgradeable (PREMIUM or BUSINESS)
 */
export function isUpgradeablePlan(plan: string): plan is "PREMIUM" | "BUSINESS" {
  return plan === "PREMIUM" || plan === "BUSINESS"
}
