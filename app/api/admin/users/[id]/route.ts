import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { updateUserRoleSchema, updateUserPlanSchema } from "@/lib/validation"
import { requireSuperAdmin } from "@/lib/admin"

// PATCH /api/admin/users/[id] - Update user role or plan (super admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()

    // Check if updating role (requires super admin)
    if (body.role !== undefined) {
      await requireSuperAdmin(session.user.id)
      const validatedData = updateUserRoleSchema.parse(body)

      const user = await prisma.user.update({
        where: { id },
        data: {
          role: validatedData.role,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          plan: true,
        },
      })

      return NextResponse.json({
        success: true,
        data: user,
      })
    }

    // Check if updating plan (also requires super admin for now)
    if (body.plan !== undefined) {
      await requireSuperAdmin(session.user.id)
      const validatedData = updateUserPlanSchema.parse(body)

      const user = await prisma.user.update({
        where: { id },
        data: {
          plan: validatedData.plan,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          plan: true,
        },
      })

      return NextResponse.json({
        success: true,
        data: user,
      })
    }

    return NextResponse.json(
      { error: "No valid update fields provided" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Update user error:", error)

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid update data", details: error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    )
  }
}
