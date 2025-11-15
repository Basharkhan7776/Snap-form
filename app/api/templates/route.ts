import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createTemplateSchema } from "@/lib/validation"
import { getUserRole, isAdmin } from "@/lib/admin"

// GET /api/templates - List all templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const featured = searchParams.get("featured")

    const where: any = {}

    if (category) {
      where.category = category
    }

    if (featured === "true") {
      where.featured = true
    }

    const templates = await prisma.template.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        iconSymbol: true,
        featured: true,
        useCount: true,
        fields: true,
      },
      orderBy: [
        { featured: "desc" },
        { useCount: "desc" },
        { createdAt: "desc" },
      ],
    })

    return NextResponse.json({
      success: true,
      data: templates,
    })
  } catch (error) {
    console.error("Get templates error:", error)
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    )
  }
}

// POST /api/templates - Create a new template (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const role = await getUserRole(session.user.id)
    if (!isAdmin(role)) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = createTemplateSchema.parse(body)

    const template = await prisma.template.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        fields: validatedData.fields as any,
        iconSymbol: validatedData.iconSymbol || "📋",
        featured: validatedData.featured || false,
      },
    })

    return NextResponse.json({
      success: true,
      data: template,
    })
  } catch (error) {
    console.error("Create template error:", error)

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid template data", details: error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    )
  }
}
