import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { FILE_UPLOAD_CONFIG } from "./validation"

// ============================================
// CLOUDFLARE R2 CLIENT CONFIGURATION
// ============================================

const R2_ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID
const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID
const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME
const R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
  console.warn("⚠️  Cloudflare R2 credentials not configured. File uploads will not work.")
}

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID || "",
    secretAccessKey: R2_SECRET_ACCESS_KEY || "",
  },
})

// ============================================
// FILE UPLOAD HELPERS
// ============================================

/**
 * Generate a unique file key for R2 storage
 */
export function generateFileKey(originalFilename: string, prefix: string = "uploads"): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  const extension = originalFilename.split(".").pop()
  const sanitizedName = originalFilename
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .substring(0, 50)

  return `${prefix}/${timestamp}-${random}-${sanitizedName}`
}

/**
 * Upload a file to Cloudflare R2
 * Returns the public URL of the uploaded file
 */
export async function uploadFileToR2(
  file: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  if (!R2_BUCKET_NAME) {
    throw new Error("R2 bucket not configured")
  }

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
  })

  await r2Client.send(command)

  // Return public URL
  if (R2_PUBLIC_URL) {
    return `${R2_PUBLIC_URL}/${key}`
  }

  // Fallback to R2.dev URL format (if custom domain not configured)
  return `https://${R2_BUCKET_NAME}.r2.dev/${key}`
}

/**
 * Delete a file from Cloudflare R2
 */
export async function deleteFileFromR2(key: string): Promise<void> {
  if (!R2_BUCKET_NAME) {
    throw new Error("R2 bucket not configured")
  }

  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  })

  await r2Client.send(command)
}

/**
 * Check if a file exists in R2
 */
export async function fileExistsInR2(key: string): Promise<boolean> {
  if (!R2_BUCKET_NAME) {
    return false
  }

  try {
    const command = new HeadObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    })

    await r2Client.send(command)
    return true
  } catch {
    return false
  }
}

/**
 * Generate a presigned URL for direct client uploads
 * This allows uploading files directly from the browser to R2
 */
export async function generatePresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600 // 1 hour
): Promise<string> {
  if (!R2_BUCKET_NAME) {
    throw new Error("R2 bucket not configured")
  }

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  })

  return await getSignedUrl(r2Client, command, { expiresIn })
}

/**
 * Extract R2 key from public URL
 */
export function extractKeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const path = urlObj.pathname

    // Remove leading slash
    return path.startsWith("/") ? path.substring(1) : path
  } catch {
    return null
  }
}

/**
 * Validate file before upload
 */
export function validateFile(file: {
  size: number
  type: string
  name: string
}): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > FILE_UPLOAD_CONFIG.maxSizeBytes) {
    return {
      valid: false,
      error: `File size must be less than ${FILE_UPLOAD_CONFIG.maxSizeBytes / 1024 / 1024}MB`,
    }
  }

  // Check MIME type
  if (!FILE_UPLOAD_CONFIG.allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: "File type not allowed. Only images (JPG, PNG, GIF, WebP, SVG) and PDFs are supported",
    }
  }

  // Check file extension
  const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0]
  if (!extension || !FILE_UPLOAD_CONFIG.allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: "Invalid file extension",
    }
  }

  return { valid: true }
}

// ============================================
// CLEANUP HELPERS
// ============================================

/**
 * Delete files associated with a form (cover image, field uploads)
 * Call this when deleting a form
 */
export async function deleteFormFiles(coverUrl?: string): Promise<void> {
  if (!coverUrl) return

  const key = extractKeyFromUrl(coverUrl)
  if (key) {
    try {
      await deleteFileFromR2(key)
    } catch (error) {
      console.error("Failed to delete form file:", error)
    }
  }
}

/**
 * Delete files from response data (for file_upload and image fields)
 * Call this when deleting a response
 */
export async function deleteResponseFiles(responseData: Record<string, any>): Promise<void> {
  const urls = Object.values(responseData).filter((value) => {
    return typeof value === "string" && value.startsWith("http")
  })

  for (const url of urls) {
    const key = extractKeyFromUrl(url as string)
    if (key) {
      try {
        await deleteFileFromR2(key)
      } catch (error) {
        console.error("Failed to delete response file:", error)
      }
    }
  }
}
