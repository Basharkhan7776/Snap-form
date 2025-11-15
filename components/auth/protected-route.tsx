"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/hooks/use-auth"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
  requireSuperAdmin?: boolean
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
  requireSuperAdmin = false
}: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, isAdmin, isSuperAdmin, isLoading } = useAuth()

  useEffect(() => {
    if (isLoading) return

    // Check authentication
    if (!isAuthenticated) {
      router.push("/auth")
      return
    }

    // Check admin permission
    if (requireSuperAdmin && !isSuperAdmin) {
      router.push("/dashboard")
      return
    }

    if (requireAdmin && !isAdmin) {
      router.push("/dashboard")
      return
    }
  }, [isAuthenticated, isAdmin, isSuperAdmin, isLoading, requireAdmin, requireSuperAdmin, router])

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  // Don't render if not authenticated or missing permissions
  if (!isAuthenticated) return null
  if (requireSuperAdmin && !isSuperAdmin) return null
  if (requireAdmin && !isAdmin) return null

  return <>{children}</>
}
