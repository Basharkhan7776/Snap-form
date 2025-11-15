"use client"

import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"
import { FieldRenderer } from "@/components/form/field-renderer"
import { formsApi, responsesApi } from "@/lib/api-client"
import { CheckCircle } from "lucide-react"

type Field = {
  id: string
  type: string
  label: string
  required?: boolean
  options?: string[]
}

type FormData = {
  id: string
  title: string
  description?: string
  coverUrl?: string
  iconSymbol?: string
  requireEmail?: boolean
  fields: Field[]
}

export default function PublicFormPage() {
  const params = useParams<{ id: string }>()
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id || ""

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState<FormData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors },
    register,
  } = useForm()

  useEffect(() => {
    if (!id) return
    loadForm()
  }, [id])

  async function loadForm() {
    try {
      setLoading(true)
      const response = await formsApi.getPublic(id)
      if (response.success && response.data) {
        setForm(response.data)
      } else {
        setError("Form not found")
      }
    } catch (err) {
      console.error("Failed to load form:", err)
      setError("Failed to load form")
    } finally {
      setLoading(false)
    }
  }

  async function onSubmit(data: any) {
    if (!form) return

    try {
      setSubmitting(true)

      // Extract email if required
      const email = form.requireEmail ? data.email : undefined

      // Build response data from field values
      const responseData: Record<string, any> = {}
      form.fields.forEach((field) => {
        if (field.type !== "section_break" && field.type !== "divider") {
          responseData[field.id] = data[field.id] || null
        }
      })

      await responsesApi.submit(id, {
        email,
        data: responseData,
      })

      setSubmitted(true)
    } catch (err) {
      console.error("Failed to submit form:", err)
      setError("Failed to submit form. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="px-6 py-8 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !form) {
    return (
      <div className="px-6 py-8 max-w-2xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">{error || "Form not found"}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="px-6 py-8 max-w-2xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-medium mb-2">Thank you!</h2>
              <p className="text-muted-foreground">Your response has been submitted successfully.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="px-6 py-8 max-w-2xl mx-auto">
      <Card>
        {form.coverUrl && (
          <div className="w-full h-48 overflow-hidden rounded-t-lg">
            <img src={form.coverUrl} alt="Cover" className="w-full h-full object-cover" />
          </div>
        )}
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            {form.iconSymbol && (
              <div className="h-10 w-10 rounded-md border flex items-center justify-center text-lg">
                {form.iconSymbol}
              </div>
            )}
            <CardTitle>{form.title}</CardTitle>
          </div>
          {form.description && <CardDescription>{form.description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email field if required */}
            {form.requireEmail && (
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message as string}</p>
                )}
              </div>
            )}

            {/* Dynamic fields */}
            {form.fields.map((field) => (
              <FieldRenderer
                key={field.id}
                field={field}
                control={control}
                error={errors[field.id]?.message as string}
              />
            ))}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
