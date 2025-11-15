import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { paginationSchema } from "@/lib/validation"
import { requireAdmin } from "@/lib/admin"

// GET /api/admin/forms - List all forms (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check admin permission
    await requireAdmin(session.user.id)

    const { searchParams } = new URL(request.url)
    const { page, limit } = paginationSchema.parse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    })

    const skip = (page - 1) * limit

    // Get all forms
    const [forms, total] = await Promise.all([
      prisma.form.findMany({
        select: {
          id: true,
          title: true,
          description: true,
          published: true,
          responseCount: true,
          viewCount: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.form.count(),
    ])

    return NextResponse.json({
      success: true,
      data: forms,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get admin forms error:", error)

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    return NextResponse.json(
      { error: "Failed to fetch forms" },
      { status: 500 }
    )
  }
}
