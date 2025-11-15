import { ApiResponse, PaginatedResponse } from "./types"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message)
    this.name = "ApiError"
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "An error occurred" }))
    throw new ApiError(
      error.error || error.message || `HTTP ${response.status}`,
      response.status,
      error
    )
  }

  return response.json()
}

export const api = {
  // GET request
  async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    const queryString = params
      ? "?" + new URLSearchParams(Object.entries(params).filter(([_, v]) => v != null)).toString()
      : ""

    const response = await fetch(`${BASE_URL}${url}${queryString}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })

    return handleResponse<T>(response)
  },

  // GET request for public access
  async getPublic<T>(url: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-public-access": "true",
      },
    })

    return handleResponse<T>(response)
  },

  // POST request
  async post<T>(url: string, data?: any): Promise<T> {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: data ? JSON.stringify(data) : undefined,
    })

    return handleResponse<T>(response)
  },

  // PATCH request
  async patch<T>(url: string, data: any): Promise<T> {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    })

    return handleResponse<T>(response)
  },

  // DELETE request
  async delete<T>(url: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })

    return handleResponse<T>(response)
  },

  // Upload file
  async upload(file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch(`${BASE_URL}/api/upload`, {
      method: "POST",
      credentials: "include",
      body: formData,
    })

    const result = await handleResponse<ApiResponse<{ url: string; filename: string }>>(response)
    if (!result.success || !result.data) {
      throw new Error("Upload failed")
    }

    return result.data
  },
}

// Typed API functions for better DX
export const formsApi = {
  list: (params?: { page?: number; limit?: number }) =>
    api.get<PaginatedResponse<any>>("/api/forms", params),

  get: (id: string) => api.get<ApiResponse<any>>(`/api/forms/${id}`),

  getPublic: (id: string) => api.getPublic<ApiResponse<any>>(`/api/forms/${id}`),

  create: (data: any) => api.post<ApiResponse<any>>("/api/forms", data),

  update: (id: string, data: any) => api.patch<ApiResponse<any>>(`/api/forms/${id}`, data),

  delete: (id: string) => api.delete<ApiResponse>(`/api/forms/${id}`),
}

export const responsesApi = {
  list: (formId: string, params?: { page?: number; limit?: number }) =>
    api.get<PaginatedResponse<any>>(`/api/forms/${formId}/responses`, params),

  submit: (formId: string, data: any) =>
    api.post<ApiResponse<any>>(`/api/forms/${formId}/responses`, data),
}

export const analyticsApi = {
  get: (formId: string, range: "1W" | "1M" | "1Y" = "1M") =>
    api.get<ApiResponse<any>>(`/api/forms/${formId}/analytics`, { range }),
}

export const templatesApi = {
  list: (params?: { category?: string; featured?: boolean }) =>
    api.get<ApiResponse<any[]>>("/api/templates", params),

  create: (data: any) => api.post<ApiResponse<any>>("/api/templates", data),
}

export const adminApi = {
  users: {
    list: (params?: { page?: number; limit?: number }) =>
      api.get<PaginatedResponse<any>>("/api/admin/users", params),

    update: (id: string, data: { role?: string; plan?: string }) =>
      api.patch<ApiResponse<any>>(`/api/admin/users/${id}`, data),
  },

  forms: {
    list: (params?: { page?: number; limit?: number }) =>
      api.get<PaginatedResponse<any>>("/api/admin/forms", params),
  },

  stats: () => api.get<ApiResponse<any>>("/api/admin/stats"),
}

export { ApiError }
