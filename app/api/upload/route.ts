import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { generateFileKey, uploadFileToR2, validateFile } from "@/lib/storage"

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file
    const validation = validateFile({
      size: file.size,
      type: file.type,
      name: file.name,
    })

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Generate unique file key
    const fileKey = generateFileKey(file.name, "uploads")

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to R2
    const publicUrl = await uploadFileToR2(buffer, fileKey, file.type)

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: file.name,
      size: file.size,
      contentType: file.type,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}

// Generate presigned URL for direct client uploads
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filename = searchParams.get("filename")
    const contentType = searchParams.get("contentType")

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: "filename and contentType are required" },
        { status: 400 }
      )
    }

    // Validate file type
    const validation = validateFile({
      size: 0, // Size check happens on client
      type: contentType,
      name: filename,
    })

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Generate presigned URL
    const { generatePresignedUploadUrl } = await import("@/lib/storage")
    const fileKey = generateFileKey(filename, "uploads")
    const presignedUrl = await generatePresignedUploadUrl(fileKey, contentType)

    // Calculate final public URL
    const R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL
    const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME
    const publicUrl = R2_PUBLIC_URL
      ? `${R2_PUBLIC_URL}/${fileKey}`
      : `https://${R2_BUCKET_NAME}.r2.dev/${fileKey}`

    return NextResponse.json({
      success: true,
      presignedUrl,
      publicUrl,
      fileKey,
    })
  } catch (error) {
    console.error("Presigned URL error:", error)
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    )
  }
}
