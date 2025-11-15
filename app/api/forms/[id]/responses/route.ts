import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { submitResponseSchema, generateResponseSchema, paginationSchema } from "@/lib/validation"
import { canAccessForm } from "@/lib/admin"
import { appendResponseToSheet } from "@/lib/google-sheets"
import { Field } from "@/lib/types"
import { PLAN_LIMITS, isValidPlan, type Plan } from "@/lib/constants"

// GET /api/forms/[id]/responses - List form responses
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
    const { page, limit } = paginationSchema.parse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    })

    const skip = (page - 1) * limit

    // Get responses
    const [responses, total] = await Promise.all([
      prisma.response.findMany({
        where: {
          formId: id,
        },
        select: {
          id: true,
          email: true,
          data: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.response.count({
        where: {
          formId: id,
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      data: responses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get responses error:", error)
    return NextResponse.json(
      { error: "Failed to fetch responses" },
      { status: 500 }
    )
  }
}

// POST /api/forms/[id]/responses - Submit a form response
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Get form with user (optimize query to avoid N+1)
    const form = await prisma.form.findFirst({
      where: {
        id,
        published: true, // Only allow responses to published forms
      },
      include: {
        user: {
          select: {
            plan: true,
          },
        },
      },
    })

    if (!form) {
      return NextResponse.json(
        { error: "Form not found or not published" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const baseValidation = submitResponseSchema.parse(body)

    // Validate response data against form fields
    const fields = form.fields as Field[]
    const responseSchema = generateResponseSchema(fields)

    try {
      responseSchema.parse(baseValidation.data)
    } catch (validationError) {
      return NextResponse.json(
        { error: "Invalid response data", details: validationError },
        { status: 400 }
      )
    }

    // Check if email is required
    if (form.requireEmail && !baseValidation.email) {
      return NextResponse.json(
        { error: "Email is required for this form" },
        { status: 400 }
      )
    }

    // Check response limits for form owner (already fetched with form)
    const ownerPlan = (form.user.plan as Plan) || "FREE"
    const planLimits = PLAN_LIMITS[ownerPlan]

    // Check monthly response limit (only if not unlimited)
    // Note: There's still a small race condition window here between check and create.
    // For strict enforcement, consider using database-level constraints or distributed locks.
    if (planLimits.maxResponsesPerMonth !== -1) {
      // Get first day of current month
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      // Count responses this month for all forms owned by this user
      const monthlyResponseCount = await prisma.response.count({
        where: {
          form: {
            userId: form.userId,
          },
          createdAt: {
            gte: firstDayOfMonth,
          },
        },
      })

      if (monthlyResponseCount >= planLimits.maxResponsesPerMonth) {
        return NextResponse.json(
          {
            error: "Response limit reached",
            message: "This form has reached its monthly response limit. Please contact the form owner.",
            code: "RESPONSE_LIMIT_REACHED"
          },
          { status: 403 }
        )
      }
    }

    // Get request metadata
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"
    const referrer = request.headers.get("referer") || request.headers.get("referrer") || null

    // Create response and increment count in a transaction to prevent race conditions
    const response = await prisma.$transaction(async (tx) => {
      // Create response in database
      const newResponse = await tx.response.create({
        data: {
          formId: id,
          email: baseValidation.email,
          data: baseValidation.data as any,
          ipAddress,
          userAgent,
          referrer,
        },
      })

      // Increment response count atomically
      await tx.form.update({
        where: { id },
        data: {
          responseCount: { increment: 1 },
        },
      })

      return newResponse
    })

    // Append to Google Sheet (real-time sync)
    if (form.googleSheetId) {
      try {
        await appendResponseToSheet(
          form.googleSheetId,
          {
            email: response.email || undefined,
            data: response.data as Record<string, any>,
            createdAt: response.createdAt,
          },
          fields
        )
      } catch (error) {
        console.error("Failed to append to Google Sheet:", error)
        // Don't fail the response submission if Google Sheets fails
        // The data is still saved in the database
      }
    }

    return NextResponse.json({
      success: true,
      message: "Response submitted successfully",
      data: {
        id: response.id,
        createdAt: response.createdAt,
      },
    })
  } catch (error) {
    console.error("Submit response error:", error)

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid response data", details: error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to submit response" },
      { status: 500 }
    )
  }
}
