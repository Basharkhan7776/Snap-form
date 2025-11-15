import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { analyticsQuerySchema } from "@/lib/validation"
import { canAccessForm } from "@/lib/admin"

// GET /api/forms/[id]/analytics - Get form analytics
export async function GET(
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

    // Check access permission
    const hasAccess = await canAccessForm(session.user.id, id)

    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const { range } = analyticsQuerySchema.parse({
      range: searchParams.get("range"),
    })

    // Calculate date range
    const now = new Date()
    let startDate = new Date()

    switch (range) {
      case "1W":
        startDate.setDate(now.getDate() - 7)
        break
      case "1M":
        startDate.setMonth(now.getMonth() - 1)
        break
      case "1Y":
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    // Get total response count
    const totalResponses = await prisma.response.count({
      where: { formId: id },
    })

    // Get responses in time range
    const responsesInRange = await prisma.response.findMany({
      where: {
        formId: id,
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    // Group by time period
    const responsesByTime = groupResponsesByTime(responsesInRange, range)

    // Get recent submissions (last 10)
    const recentSubmissions = await prisma.response.findMany({
      where: { formId: id },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    })

    return NextResponse.json({
      success: true,
      data: {
        totalResponses,
        responsesByTime,
        recentSubmissions: recentSubmissions.map((r) => ({
          id: r.id,
          email: r.email || "Anonymous",
          date: r.createdAt.toISOString().split("T")[0],
        })),
      },
    })
  } catch (error) {
    console.error("Get analytics error:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}

// Helper function to group responses by time period
function groupResponsesByTime(
  responses: Array<{ createdAt: Date }>,
  range: "1W" | "1M" | "1Y"
): Array<{ label: string; count: number }> {
  const grouped = new Map<string, number>()

  // Initialize time buckets based on range
  const now = new Date()
  let buckets: string[] = []

  if (range === "1W") {
    // Last 7 days
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(now.getDate() - i)
      buckets.push(days[date.getDay()])
    }
  } else if (range === "1M") {
    // Last 30 days (grouped by week)
    buckets = ["Week 1", "Week 2", "Week 3", "Week 4"]
  } else if (range === "1Y") {
    // Last 12 months
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now)
      date.setMonth(now.getMonth() - i)
      buckets.push(months[date.getMonth()])
    }
  }

  // Initialize all buckets with 0
  buckets.forEach((bucket) => grouped.set(bucket, 0))

  // Count responses in each bucket
  responses.forEach((response) => {
    const date = response.createdAt
    let bucket: string

    if (range === "1W") {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      bucket = days[date.getDay()]
    } else if (range === "1M") {
      const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
      const weekNum = Math.floor(daysDiff / 7)
      bucket = `Week ${4 - weekNum}`
    } else {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      bucket = months[date.getMonth()]
    }

    if (grouped.has(bucket)) {
      grouped.set(bucket, (grouped.get(bucket) || 0) + 1)
    }
  })

  return Array.from(grouped.entries()).map(([label, count]) => ({
    label,
    count,
  }))
}
