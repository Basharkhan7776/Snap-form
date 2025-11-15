import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin"

// GET /api/admin/stats - Get system-wide statistics (admin only)
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

    // Get today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get stats in parallel
    const [
      totalUsers,
      totalForms,
      totalResponses,
      activeUsers,
      formsToday,
      responsesToday,
      adminCount,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // Total forms
      prisma.form.count(),

      // Total responses
      prisma.response.count(),

      // Active users (created a form in last 30 days)
      prisma.user.count({
        where: {
          forms: {
            some: {
              createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              },
            },
          },
        },
      }),

      // Forms created today
      prisma.form.count({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),

      // Responses today
      prisma.response.count({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),

      // Admin count
      prisma.user.count({
        where: {
          role: {
            in: ["ADMIN", "SUPER_ADMIN"],
          },
        },
      }),
    ])

    // Get top forms by response count
    const topForms = await prisma.form.findMany({
      select: {
        id: true,
        title: true,
        responseCount: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        responseCount: "desc",
      },
      take: 5,
    })

    // Get recent activity (last 10 forms)
    const recentForms = await prisma.form.findMany({
      select: {
        id: true,
        title: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    })

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalForms,
          totalResponses,
          activeUsers,
          formsToday,
          responsesToday,
          adminCount,
        },
        topForms,
        recentForms,
      },
    })
  } catch (error) {
    console.error("Get admin stats error:", error)

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    )
  }
}
