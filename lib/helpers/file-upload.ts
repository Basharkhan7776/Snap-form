import { api } from "@/lib/api-client"

export async function uploadFile(file: File): Promise<string> {
  try {
    const result = await api.upload(file)
    return result.url
  } catch (error) {
    console.error("File upload error:", error)
    throw new Error("Failed to upload file")
  }
}

export function triggerFileInput(
  accept: string,
  onFileSelected: (file: File) => void
) {
  const input = document.createElement("input")
  input.type = "file"
  input.accept = accept
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      onFileSelected(file)
    }
  }
  input.click()
}
