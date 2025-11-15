import { z } from 'zod'

// ============================================
// FIELD VALIDATION
// ============================================

export const fieldTypeSchema = z.enum([
  "short_text",
  "long_text",
  "multiple_choice",
  "checkboxes",
  "dropdown",
  "image",
  "file_upload",
  "section_break",
  "divider",
])

export const fieldSchema = z.object({
  id: z.string(),
  type: fieldTypeSchema,
  label: z.string().min(1, "Field label is required"),
  required: z.boolean().optional(),
  options: z.array(z.string()).optional(),
  description: z.string().optional(),
  placeholder: z.string().optional(),
})

// ============================================
// FORM VALIDATION
// ============================================

export const createFormSchema = z.object({
  title: z.string().min(1, "Form title is required").max(200, "Title too long"),
  description: z.string().max(1000, "Description too long").optional(),
  coverUrl: z.string().url("Invalid cover URL").optional().or(z.literal("")),
  iconSymbol: z.string().max(10).optional(),
  requireEmail: z.boolean().optional().default(true),
  fields: z.array(fieldSchema).min(0),
})

export const updateFormSchema = createFormSchema.partial().extend({
  published: z.boolean().optional(),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(50, "Slug too long")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
    .optional(),
})

// ============================================
// RESPONSE VALIDATION
// ============================================

/**
 * Generate dynamic Zod schema based on form fields
 * This validates form submissions against the form structure
 */
export function generateResponseSchema(fields: z.infer<typeof fieldSchema>[]) {
  const schema: Record<string, z.ZodTypeAny> = {}

  fields.forEach((field) => {
    let fieldValidator: z.ZodTypeAny

    switch (field.type) {
      case "short_text":
      case "long_text":
        fieldValidator = z.string()
        if (field.required) {
          fieldValidator = fieldValidator.min(1, `${field.label} is required`)
        } else {
          fieldValidator = fieldValidator.optional()
        }
        break

      case "multiple_choice":
      case "dropdown":
        if (field.options && field.options.length > 0) {
          fieldValidator = z.enum(field.options as [string, ...string[]])
        } else {
          fieldValidator = z.string()
        }
        if (field.required) {
          fieldValidator = fieldValidator.refine((val) => val !== undefined, {
            message: `${field.label} is required`,
          })
        } else {
          fieldValidator = fieldValidator.optional()
        }
        break

      case "checkboxes":
        fieldValidator = z.array(z.string())
        if (field.required) {
          fieldValidator = fieldValidator.min(1, `Select at least one option for ${field.label}`)
        } else {
          fieldValidator = fieldValidator.optional()
        }
        break

      case "file_upload":
      case "image":
        // File uploads should provide URLs after upload
        fieldValidator = z.string().url("Invalid file URL")
        if (field.required) {
          fieldValidator = fieldValidator.min(1, `${field.label} is required`)
        } else {
          fieldValidator = fieldValidator.optional()
        }
        break

      case "section_break":
      case "divider":
        // These fields don't collect data
        fieldValidator = z.any().optional()
        break

      default:
        fieldValidator = z.any().optional()
    }

    schema[field.id] = fieldValidator
  })

  return z.object(schema)
}

export const submitResponseSchema = z.object({
  email: z.string().email("Invalid email address").optional(),
  data: z.record(z.any()), // Will be validated with generateResponseSchema
})

// ============================================
// USER VALIDATION
// ============================================

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  image: z.string().url().optional(),
})

export const updateUserRoleSchema = z.object({
  role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]),
})

export const updateUserPlanSchema = z.object({
  plan: z.enum(["FREE", "PREMIUM", "BUSINESS"]),
})

// ============================================
// TEMPLATE VALIDATION
// ============================================

export const createTemplateSchema = z.object({
  title: z.string().min(1, "Template title is required").max(200),
  description: z.string().max(1000).optional(),
  category: z.string().max(50).optional(),
  fields: z.array(fieldSchema).min(1, "Template must have at least one field"),
  iconSymbol: z.string().max(10).optional(),
  featured: z.boolean().optional().default(false),
})

export const updateTemplateSchema = createTemplateSchema.partial()

// ============================================
// FILE UPLOAD VALIDATION
// ============================================

export const FILE_UPLOAD_CONFIG = {
  maxSizeBytes: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: [
    // Images
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    // PDFs
    "application/pdf",
  ],
  allowedExtensions: [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".pdf"],
}

export function validateFileUpload(file: File): { valid: boolean; error?: string } {
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
// QUERY VALIDATION
// ============================================

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
})

export const timeRangeSchema = z.enum(["1W", "1M", "1Y"])

export const analyticsQuerySchema = z.object({
  range: timeRangeSchema.default("1M"),
})

// ============================================
// TYPE EXPORTS
// ============================================

export type CreateFormInput = z.infer<typeof createFormSchema>
export type UpdateFormInput = z.infer<typeof updateFormSchema>
export type SubmitResponseInput = z.infer<typeof submitResponseSchema>
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>
export type PaginationQuery = z.infer<typeof paginationSchema>
export type TimeRange = z.infer<typeof timeRangeSchema>
