import { useAuth } from "./use-auth"

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

const PLAN_LIMITS: Record<Plan, PlanLimits> = {
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

export function usePlanLimits() {
  const { user } = useAuth()
  const plan = (user?.plan as Plan) || "FREE"
  const limits = PLAN_LIMITS[plan]

  const canCreateForm = (currentFormCount: number) => {
    if (limits.maxForms === -1) return true
    return currentFormCount < limits.maxForms
  }

  const canAcceptResponse = (currentMonthResponses: number) => {
    if (limits.maxResponsesPerMonth === -1) return true
    return currentMonthResponses < limits.maxResponsesPerMonth
  }

  return {
    plan,
    limits,
    canCreateForm,
    canAcceptResponse,
  }
}
