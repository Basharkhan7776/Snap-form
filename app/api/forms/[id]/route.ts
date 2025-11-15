import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { updateFormSchema } from "@/lib/validation"
import { canAccessForm } from "@/lib/admin"
import { deleteFormFiles } from "@/lib/storage"
import { deleteSpreadsheet, updateSpreadsheetHeaders } from "@/lib/google-sheets"
import { Field } from "@/lib/types"

// GET /api/forms/[id] - Get a single form
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check if this is a public access (form submission view)
    const isPublicAccess = request.headers.get("x-public-access") === "true"

    if (isPublicAccess) {
      // Public access - only return published forms
      const form = await prisma.form.findFirst({
        where: {
          id,
          published: true,
        },
        select: {
          id: true,
          title: true,
          description: true,
          coverUrl: true,
          iconSymbol: true,
          requireEmail: true,
          fields: true,
        },
      })

      if (!form) {
        return NextResponse.json({ error: "Form not found" }, { status: 404 })
      }

      // Increment view count
      await prisma.form.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      })

      return NextResponse.json({
        success: true,
        data: form,
      })
    }

    // Authenticated access
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check access permission
    const hasAccess = await canAccessForm(session.user.id, id)

    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get form with full details
    const form = await prisma.form.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: form,
    })
  } catch (error) {
    console.error("Get form error:", error)
    return NextResponse.json(
      { error: "Failed to fetch form" },
      { status: 500 }
    )
  }
}

// PATCH /api/forms/[id] - Update a form
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

    // Check access permission
    const hasAccess = await canAccessForm(session.user.id, id)

    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateFormSchema.parse(body)

    // Get current form to check if fields changed
    const currentForm = await prisma.form.findUnique({
      where: { id },
    })

    if (!currentForm) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }

    // Update form
    const form = await prisma.form.update({
      where: { id },
      data: {
        ...validatedData,
        fields: validatedData.fields ? (validatedData.fields as any) : undefined,
      },
    })

    // If fields changed and Google Sheet exists, update headers
    if (validatedData.fields && form.googleSheetId) {
      try {
        await updateSpreadsheetHeaders(
          form.googleSheetId,
          validatedData.fields as Field[]
        )
      } catch (error) {
        console.error("Failed to update Google Sheet headers:", error)
        // Don't fail the update if Google Sheets fails
      }
    }

    return NextResponse.json({
      success: true,
      data: form,
    })
  } catch (error) {
    console.error("Update form error:", error)

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid form data", details: error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to update form" },
      { status: 500 }
    )
  }
}

// DELETE /api/forms/[id] - Delete a form
export async function DELETE(
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

    // Check access permission (owner only, not admins)
    const form = await prisma.form.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!form) {
      return NextResponse.json(
        { error: "Form not found or access denied" },
        { status: 404 }
      )
    }

    // Delete associated files
    if (form.coverUrl) {
      try {
        await deleteFormFiles(form.coverUrl)
      } catch (error) {
        console.error("Failed to delete form files:", error)
      }
    }

    // Delete Google Sheet
    if (form.googleSheetId) {
      try {
        await deleteSpreadsheet(form.googleSheetId)
      } catch (error) {
        console.error("Failed to delete Google Sheet:", error)
        // Don't fail if sheet deletion fails
      }
    }

    // Delete form (cascades to responses)
    await prisma.form.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: "Form deleted successfully",
    })
  } catch (error) {
    console.error("Delete form error:", error)
    return NextResponse.json(
      { error: "Failed to delete form" },
      { status: 500 }
    )
  }
}
