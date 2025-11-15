// Shared TypeScript types for Snap-form

// ============================================
// FORM FIELD TYPES
// ============================================

export type FieldType =
  | "short_text"
  | "long_text"
  | "multiple_choice"
  | "checkboxes"
  | "dropdown"
  | "image"
  | "file_upload"
  | "section_break"
  | "divider"

export type Field = {
  id: string
  type: FieldType
  label: string
  required?: boolean
  options?: string[] // For multiple_choice, checkboxes, dropdown
  description?: string // Optional helper text
  placeholder?: string // For text inputs
}

export type Snippet = {
  type: FieldType
  label: string
  category: "Input Fields" | "Choices" | "Media" | "Layout"
}

// ============================================
// FORM TYPES
// ============================================

export type FormSettings = {
  title: string
  description?: string
  coverUrl?: string
  iconSymbol?: string
  requireEmail?: boolean
}

export type FormData = FormSettings & {
  fields: Field[]
}

// ============================================
// RESPONSE TYPES
// ============================================

export type ResponseData = {
  [fieldId: string]: string | string[] | File | null
}

export type FormResponse = {
  id: string
  formId: string
  email?: string
  data: ResponseData
  createdAt: Date
}

// ============================================
// USER TYPES
// ============================================

export type Role = "USER" | "ADMIN" | "SUPER_ADMIN"
export type Plan = "FREE" | "PREMIUM" | "BUSINESS"

export type UserProfile = {
  id: string
  email: string
  name?: string
  image?: string
  role: Role
  plan: Plan
}

// ============================================
// ANALYTICS TYPES
// ============================================

export type TimeRange = "1W" | "1M" | "1Y"

export type AnalyticsDataPoint = {
  label: string
  count: number
}

export type FormAnalytics = {
  formId: string
  totalResponses: number
  responsesByTime: AnalyticsDataPoint[]
  recentSubmissions: Array<{
    id: string
    email?: string
    date: string
  }>
}

// ============================================
// ADMIN TYPES
// ============================================

export type AdminStats = {
  totalUsers: number
  totalForms: number
  totalResponses: number
  activeUsers: number
  formsToday: number
  responsesToday: number
}

// ============================================
// API RESPONSE TYPES
// ============================================

export type ApiResponse<T = any> = {
  success: boolean
  data?: T
  error?: string
}

export type PaginatedResponse<T> = {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
