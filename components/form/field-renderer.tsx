"use client"

import type React from "react"
import { Controller, type Control, type FieldValues } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { UploadCloud } from "lucide-react"
import { useState } from "react"
import { uploadFile } from "@/lib/helpers/file-upload"

type FieldType =
  | "short_text"
  | "long_text"
  | "multiple_choice"
  | "checkboxes"
  | "dropdown"
  | "image"
  | "file_upload"
  | "section_break"
  | "divider"

type Field = {
  id: string
  type: FieldType
  label: string
  required?: boolean
  options?: string[]
}

type FieldRendererProps = {
  field: Field
  control: Control<FieldValues>
  error?: string
}

export function FieldRenderer({ field, control, error }: FieldRendererProps) {
  const [uploading, setUploading] = useState(false)

  if (field.type === "section_break") {
    return (
      <div className="space-y-2">
        <h3 className="text-lg font-medium">{field.label}</h3>
        <Separator />
      </div>
    )
  }

  if (field.type === "divider") {
    return <Separator />
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={field.id}>
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      {field.type === "short_text" && (
        <Controller
          name={field.id}
          control={control}
          rules={{ required: field.required ? `${field.label} is required` : false }}
          render={({ field: formField }) => (
            <Input
              {...formField}
              id={field.id}
              placeholder="Enter your answer"
              className={error ? "border-red-500" : ""}
            />
          )}
        />
      )}

      {field.type === "long_text" && (
        <Controller
          name={field.id}
          control={control}
          rules={{ required: field.required ? `${field.label} is required` : false }}
          render={({ field: formField }) => (
            <Textarea
              {...formField}
              id={field.id}
              placeholder="Enter your answer"
              className={`min-h-24 ${error ? "border-red-500" : ""}`}
            />
          )}
        />
      )}

      {field.type === "multiple_choice" && (
        <Controller
          name={field.id}
          control={control}
          rules={{ required: field.required ? `${field.label} is required` : false }}
          render={({ field: formField }) => (
            <RadioGroup onValueChange={formField.onChange} value={formField.value}>
              {(field.options || []).map((option, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${field.id}-${idx}`} />
                  <Label htmlFor={`${field.id}-${idx}`} className="cursor-pointer font-normal">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
        />
      )}

      {field.type === "checkboxes" && (
        <Controller
          name={field.id}
          control={control}
          rules={{ required: field.required ? `${field.label} is required` : false }}
          render={({ field: formField }) => {
            const values = formField.value || []
            return (
              <div className="space-y-2">
                {(field.options || []).map((option, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${field.id}-${idx}`}
                      checked={values.includes(option)}
                      onCheckedChange={(checked) => {
                        const newValues = checked
                          ? [...values, option]
                          : values.filter((v: string) => v !== option)
                        formField.onChange(newValues)
                      }}
                    />
                    <Label htmlFor={`${field.id}-${idx}`} className="cursor-pointer font-normal">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            )
          }}
        />
      )}

      {field.type === "dropdown" && (
        <Controller
          name={field.id}
          control={control}
          rules={{ required: field.required ? `${field.label} is required` : false }}
          render={({ field: formField }) => (
            <Select onValueChange={formField.onChange} value={formField.value}>
              <SelectTrigger className={error ? "border-red-500" : ""}>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {(field.options || []).map((option, idx) => (
                  <SelectItem key={idx} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      )}

      {field.type === "image" && (
        <Controller
          name={field.id}
          control={control}
          rules={{ required: field.required ? `${field.label} is required` : false }}
          render={({ field: formField }) => {
            const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0]
              if (!file) return

              // Validate file type
              if (!file.type.startsWith("image/")) {
                alert("Please select an image file")
                return
              }

              try {
                setUploading(true)
                const url = await uploadFile(file)
                formField.onChange(url)
              } catch (error) {
                console.error("Upload error:", error)
                alert("Failed to upload image")
              } finally {
                setUploading(false)
              }
            }

            return (
              <div className="space-y-2">
                {formField.value ? (
                  <div className="relative">
                    <img
                      src={formField.value}
                      alt="Uploaded"
                      className="max-h-64 rounded-md border object-contain"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => formField.onChange("")}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id={`file-${field.id}`}
                      disabled={uploading}
                    />
                    <label htmlFor={`file-${field.id}`}>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        disabled={uploading}
                        asChild
                      >
                        <span>
                          <UploadCloud className="h-4 w-4 mr-2" />
                          {uploading ? "Uploading..." : "Upload Image"}
                        </span>
                      </Button>
                    </label>
                  </div>
                )}
              </div>
            )
          }}
        />
      )}

      {field.type === "file_upload" && (
        <Controller
          name={field.id}
          control={control}
          rules={{ required: field.required ? `${field.label} is required` : false }}
          render={({ field: formField }) => {
            const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0]
              if (!file) return

              try {
                setUploading(true)
                const url = await uploadFile(file)
                formField.onChange(url)
              } catch (error) {
                console.error("Upload error:", error)
                alert("Failed to upload file")
              } finally {
                setUploading(false)
              }
            }

            return (
              <div className="space-y-2">
                {formField.value ? (
                  <div className="flex items-center gap-2">
                    <a
                      href={formField.value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline truncate"
                    >
                      View uploaded file
                    </a>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => formField.onChange("")}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                      id={`file-${field.id}`}
                      disabled={uploading}
                    />
                    <label htmlFor={`file-${field.id}`}>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        disabled={uploading}
                        asChild
                      >
                        <span>
                          <UploadCloud className="h-4 w-4 mr-2" />
                          {uploading ? "Uploading..." : "Upload File"}
                        </span>
                      </Button>
                    </label>
                  </div>
                )}
              </div>
            )
          }}
        />
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
