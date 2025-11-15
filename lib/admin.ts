import { prisma } from './prisma'
import { Role } from './types'

// ============================================
// SUPER ADMIN CONFIGURATION
// ============================================

/**
 * Super Admin Emails
 * These emails have full system access and can:
 * - Promote/demote other admins
 * - Access all forms and responses
 * - View system analytics
 * - Manage all users
 *
 * To add a super admin, add their Google OAuth email to this array
 */
export const SUPER_ADMINS: string[] = [
  // Add super admin emails here
  // Example: "admin@example.com",
]

// ============================================
// ADMIN HELPER FUNCTIONS
// ============================================

/**
 * Check if an email is a super admin
 */
export function isSuperAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  return SUPER_ADMINS.includes(email.toLowerCase())
}

/**
 * Check if a user has admin privileges (ADMIN or SUPER_ADMIN role)
 */
export function isAdmin(role: Role): boolean {
  return role === 'ADMIN' || role === 'SUPER_ADMIN'
}

/**
 * Check if a user is a super admin by role
 */
export function isSuperAdminRole(role: Role): boolean {
  return role === 'SUPER_ADMIN'
}

/**
 * Get user role with admin check
 * If user email is in SUPER_ADMINS array, returns SUPER_ADMIN
 * Otherwise returns the user's database role
 */
export async function getUserRole(userId: string): Promise<Role> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, role: true },
  })

  if (!user) return 'USER'

  // Override role if email is in super admin list
  if (isSuperAdmin(user.email)) {
    // Update database role if needed
    if (user.role !== 'SUPER_ADMIN') {
      await prisma.user.update({
        where: { id: userId },
        data: { role: 'SUPER_ADMIN' },
      })
    }
    return 'SUPER_ADMIN'
  }

  return user.role as Role
}

/**
 * Ensure user has admin privileges
 * Throws error if user is not an admin
 */
export async function requireAdmin(userId: string): Promise<void> {
  const role = await getUserRole(userId)
  if (!isAdmin(role)) {
    throw new Error('Unauthorized: Admin access required')
  }
}

/**
 * Ensure user has super admin privileges
 * Throws error if user is not a super admin
 */
export async function requireSuperAdmin(userId: string): Promise<void> {
  const role = await getUserRole(userId)
  if (!isSuperAdminRole(role)) {
    throw new Error('Unauthorized: Super Admin access required')
  }
}

/**
 * Check if user can access a specific form
 * Returns true if:
 * - User owns the form
 * - User is an admin
 */
export async function canAccessForm(userId: string, formId: string): Promise<boolean> {
  const role = await getUserRole(userId)

  // Admins can access all forms
  if (isAdmin(role)) return true

  // Check if user owns the form
  const form = await prisma.form.findFirst({
    where: {
      id: formId,
      userId: userId,
    },
  })

  return !!form
}

/**
 * Check if user can manage admins
 * Only super admins can manage other admins
 */
export async function canManageAdmins(userId: string): Promise<boolean> {
  const role = await getUserRole(userId)
  return isSuperAdminRole(role)
}
