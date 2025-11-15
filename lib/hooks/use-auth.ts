"use client"

import { useSession } from "@/lib/auth-client"
import { UserProfile } from "@/lib/types"

export function useAuth() {
  const { data: session, isPending, error } = useSession()

  const user: UserProfile | null = session?.user
    ? {
        id: session.user.id,
        email: session.user.email!,
        name: session.user.name || undefined,
        image: session.user.image || undefined,
        role: (session.user as any).role || "USER",
        plan: (session.user as any).plan || "FREE",
      }
    : null

  const isAuthenticated = !!session?.user
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN"
  const isSuperAdmin = user?.role === "SUPER_ADMIN"

  return {
    user,
    session,
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    isLoading: isPending,
    error,
  }
}
