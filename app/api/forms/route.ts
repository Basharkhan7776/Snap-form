import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createFormSchema, paginationSchema } from "@/lib/validation"
import { createFormSpreadsheet, shareSpreadsheet } from "@/lib/google-sheets"
import { Field } from "@/lib/types"

// GET /api/forms - List user's forms
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const { page, limit } = paginationSchema.parse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    })

    const skip = (page - 1) * limit

    // Get forms
    const [forms, total] = await Promise.all([
      prisma.form.findMany({
        where: {
          userId: session.user.id,
        },
        select: {
          id: true,
          title: true,
          description: true,
          coverUrl: true,
          iconSymbol: true,
          published: true,
          slug: true,
          responseCount: true,
          viewCount: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.form.count({
        where: {
          userId: session.user.id,
        },
      }),
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
    console.error("Get forms error:", error)
    return NextResponse.json(
      { error: "Failed to fetch forms" },
      { status: 500 }
    )
  }
}

// POST /api/forms - Create a new form
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createFormSchema.parse(body)

    // Create form in database
    const form = await prisma.form.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        coverUrl: validatedData.coverUrl,
        iconSymbol: validatedData.iconSymbol || "📝",
        requireEmail: validatedData.requireEmail ?? true,
        fields: validatedData.fields as any,
        userId: session.user.id,
      },
    })

    // Create Google Sheet for responses (async, don't block response)
    if (validatedData.fields.length > 0) {
      try {
        const { spreadsheetId, spreadsheetUrl } = await createFormSpreadsheet(
          form.id,
          form.title,
          validatedData.fields as Field[]
        )

        // Share with form owner
        await shareSpreadsheet(spreadsheetId, session.user.email!, "writer")

        // Update form with Google Sheet info
        await prisma.form.update({
          where: { id: form.id },
          data: {
            googleSheetId: spreadsheetId,
            googleSheetUrl: spreadsheetUrl,
          },
        })

        form.googleSheetId = spreadsheetId
        form.googleSheetUrl = spreadsheetUrl
      } catch (error) {
        console.error("Failed to create Google Sheet:", error)
        // Don't fail the form creation if Google Sheets fails
      }
    }

    return NextResponse.json({
      success: true,
      data: form,
    })
  } catch (error) {
    console.error("Create form error:", error)

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid form data", details: error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create form" },
      { status: 500 }
    )
  }
}
