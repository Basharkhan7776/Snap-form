import { useAuth } from "./use-auth"
import { PLAN_LIMITS, type Plan } from "@/lib/constants"

export type { Plan } from "@/lib/constants"

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
