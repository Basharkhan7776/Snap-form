"use client"

import type React from "react"

import { useMemo, useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { formsApi } from "@/lib/api-client"
import { uploadFile, triggerFileInput } from "@/lib/helpers/file-upload"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  PointerSensor,
  closestCenter,
  useDroppable,
  useDraggable,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { GripVertical, LinkIcon, BarChart2, Save, UploadCloud, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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

type Snippet = {
  type: FieldType
  label: string
  category: "Input Fields" | "Choices" | "Media" | "Layout"
}

const SNIPPETS: Snippet[] = [
  { type: "short_text", label: "Short text", category: "Input Fields" },
  { type: "long_text", label: "Long text", category: "Input Fields" },
  { type: "multiple_choice", label: "Multiple choice", category: "Choices" },
  { type: "checkboxes", label: "Checkboxes", category: "Choices" },
  { type: "dropdown", label: "Dropdown", category: "Choices" },
  { type: "image", label: "Image", category: "Media" },
  { type: "file_upload", label: "File upload", category: "Media" },
  { type: "section_break", label: "Section break", category: "Layout" },
  { type: "divider", label: "Divider", category: "Layout" },
]

const defaultLabelFor = (t: FieldType) =>
  ({
    short_text: "Short text",
    long_text: "Long text",
    multiple_choice: "Multiple choice",
    checkboxes: "Checkboxes",
    dropdown: "Dropdown",
    image: "Image",
    file_upload: "File upload",
    section_break: "Section",
    divider: "Divider",
  })[t]

const MOCK_FORMS: Record<
  string,
  {
    title: string
    coverUrl?: string
    iconSymbol?: string
    description?: string
    requireEmail?: boolean
    fields: Field[]
  }
> = {
  "form-1": {
    title: "Customer Feedback",
    coverUrl: "",
    iconSymbol: "📝",
    description: "Help us improve by sharing your thoughts.",
    requireEmail: true,
    fields: [
      { id: "f-a", type: "short_text", label: "Your name", required: true },
      { id: "f-b", type: "multiple_choice", label: "Satisfaction", options: ["Poor", "Ok", "Great"] },
      { id: "f-c", type: "long_text", label: "What can we improve?" },
    ],
  },
  "form-2": {
    title: "Event Registration",
    iconSymbol: "🎫",
    description: "Register your interest for our upcoming event.",
    requireEmail: true,
    fields: [
      { id: "f-a", type: "short_text", label: "Full name", required: true },
      { id: "f-b", type: "short_text", label: "Company" },
      { id: "f-c", type: "dropdown", label: "Ticket type", options: ["General", "VIP"] },
    ],
  },
}

function SortableFieldItem({
  field,
  onChange,
  onRemove,
}: {
  field: Field
  onChange: (id: string, patch: Partial<Field>) => void
  onRemove: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      className={`rounded-md border p-3 flex items-start gap-3 bg-background ${
        isDragging ? "opacity-80 ring-2 ring-foreground/20" : ""
      }`}
    >
      <button
        className="text-muted-foreground cursor-grab mt-1"
        aria-label="Drag handle"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="flex-1 space-y-2">
        <Input value={field.label} onChange={(e) => onChange(field.id, { label: e.target.value })} className="h-8" />
        <div>
          {field.type === "long_text" ? (
            <Textarea placeholder="Long answer..." className="min-h-20" />
          ) : field.type === "multiple_choice" ? (
            <div className="text-sm text-muted-foreground flex gap-4">
              <span>Option A</span>
              <span>Option B</span>
            </div>
          ) : field.type === "checkboxes" ? (
            <div className="text-sm text-muted-foreground flex gap-4">
              <span>Choice 1</span>
              <span>Choice 2</span>
            </div>
          ) : field.type === "dropdown" ? (
            <Input placeholder="Dropdown (mock)" />
          ) : field.type === "image" ? (
            <div className="h-24 w-full rounded-md border border-dashed flex items-center justify-center text-xs text-muted-foreground">
              Image placeholder
            </div>
          ) : field.type === "file_upload" ? (
            <div className="h-10 rounded-md border border-dashed flex items-center justify-center text-xs text-muted-foreground">
              File upload placeholder
            </div>
          ) : field.type === "section_break" ? (
            <div className="py-1">
              <Separator />
            </div>
          ) : field.type === "divider" ? (
            <Separator />
          ) : (
            <Input placeholder="Short answer..." />
          )}
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        aria-label="Remove block"
        className="opacity-70 hover:opacity-100"
        onClick={() => onRemove(field.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </motion.div>
  )
}

function DraggableSnippetCard({
  snippet,
  onClickAdd,
}: {
  snippet: Snippet
  onClickAdd: (t: FieldType) => void
}) {
  const id = `palette-${snippet.type}`
  const { attributes, listeners, setNodeRef } = useDraggable({
    id,
    data: { from: "palette", type: snippet.type },
  })
  return (
    <Card
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing hover:bg-muted transition-colors`}
      onClick={() => onClickAdd(snippet.type)}
      role="button"
      aria-label={`Add ${snippet.label}`}
    >
      <CardContent className="p-3 flex items-center gap-2">
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-sm">{snippet.label}</span>
      </CardContent>
    </Card>
  )
}

function CanvasDroppable({ children }: { children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: "canvas" })
  return (
    <div
      ref={setNodeRef}
      className={`rounded-md border p-3 min-h-[240px] ${isOver ? "border-foreground" : "border-border"} transition-colors`}
    >
      {children}
    </div>
  )
}

function EditPageContent() {
  const params = useParams<{ id: string }>()
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id || ""
  const router = useRouter()
  const { toast } = useToast()

  // Loading & saving states
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingIcon, setUploadingIcon] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Form data
  const [title, setTitle] = useState("")
  const [coverUrl, setCoverUrl] = useState("")
  const [iconSymbol, setIconSymbol] = useState("🧩")
  const [description, setDescription] = useState("")
  const [requireEmail, setRequireEmail] = useState(true)
  const [fields, setFields] = useState<Field[]>([])

  // Fetch form on mount
  useEffect(() => {
    if (!id) return
    loadForm()
  }, [id])

  async function loadForm() {
    try {
      setLoading(true)
      const response = await formsApi.get(id)
      if (response.success && response.data) {
        const form = response.data
        setTitle(form.title || "")
        setCoverUrl(form.coverUrl || "")
        setIconSymbol(form.iconSymbol || "🧩")
        setDescription(form.description || "")
        setRequireEmail(form.requireEmail ?? true)
        setFields(
          (form.fields || []).map((f: any) => ({
            ...f,
            id: f.id || `f-${crypto.randomUUID().slice(0, 8)}`,
          }))
        )
      }
    } catch (error) {
      console.error("Failed to load form:", error)
      toast({
        title: "Error",
        description: "Failed to load form. Please try again.",
        variant: "destructive",
      })
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    try {
      setSaving(true)
      const response = await formsApi.update(id, {
        title,
        description,
        coverUrl,
        iconSymbol,
        requireEmail,
        fields,
      })
      if (response.success) {
        toast({
          title: "Form updated",
          description: "Your changes have been saved successfully.",
        })
      }
    } catch (error) {
      console.error("Failed to save form:", error)
      toast({
        title: "Error",
        description: "Failed to save form. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    try {
      setDeleting(true)
      await formsApi.delete(id)
      toast({
        title: "Form deleted",
        description: "The form has been successfully deleted.",
      })
      router.push("/dashboard")
    } catch (error) {
      console.error("Failed to delete form:", error)
      toast({
        title: "Error",
        description: "Failed to delete form. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  async function handleCoverUpload() {
    triggerFileInput("image/*", async (file) => {
      try {
        setUploadingCover(true)
        const url = await uploadFile(file)
        setCoverUrl(url)
        toast({ title: "Cover uploaded", description: "Cover image uploaded successfully." })
      } catch (error) {
        toast({
          title: "Upload failed",
          description: "Failed to upload cover image.",
          variant: "destructive",
        })
      } finally {
        setUploadingCover(false)
      }
    })
  }

  async function handleIconUpload() {
    triggerFileInput("image/*", async (file) => {
      try {
        setUploadingIcon(true)
        const url = await uploadFile(file)
        setIconSymbol(url)
        toast({ title: "Icon uploaded", description: "Icon uploaded successfully." })
      } catch (error) {
        toast({
          title: "Upload failed",
          description: "Failed to upload icon.",
          variant: "destructive",
        })
      } finally {
        setUploadingIcon(false)
      }
    })
  }

  // DnD state
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))
  const items = useMemo(() => fields.map((f) => f.id), [fields])
  const [activePaletteType, setActivePaletteType] = useState<FieldType | null>(null)
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null)
  const [insertionIndex, setInsertionIndex] = useState<number | null>(null)

  function addField(type: FieldType, atIndex?: number) {
    setFields((prev) => {
      const next: Field = {
        id: `f-${crypto.randomUUID().slice(0, 8)}`,
        type,
        label: defaultLabelFor(type),
      }
      if (typeof atIndex === "number") {
        const copy = prev.slice()
        copy.splice(Math.max(0, Math.min(atIndex, copy.length)), 0, next)
        return copy
      }
      return [...prev, next]
    })
  }

  function onDragStart(ev: DragStartEvent) {
    const from = ev.active.data.current?.from
    if (from === "palette") {
      setActivePaletteType(ev.active.data.current?.type as FieldType)
    } else {
      setActiveFieldId(ev.active.id as string)
    }
  }

  function onDragOver(ev: DragOverEvent) {
    const overId = ev.over?.id as string | undefined
    if (!overId) {
      setInsertionIndex(null)
      return
    }
    if (overId === "canvas") {
      setInsertionIndex(fields.length)
      return
    }
    const idx = fields.findIndex((f) => f.id === overId)
    if (idx >= 0) setInsertionIndex(idx)
    else setInsertionIndex(null)
  }

  function onDragEnd(ev: DragEndEvent) {
    const overId = ev.over?.id as string | undefined
    const fromPalette = !!activePaletteType

    if (fromPalette) {
      if (overId) {
        const at = insertionIndex ?? fields.length
        addField(activePaletteType!, at)
        toast({ title: "Field added", description: `Inserted ${defaultLabelFor(activePaletteType!)}` })
      } else {
        toast({ title: "Not added", description: "Dropped outside the canvas." })
      }
    } else if (activeFieldId) {
      const oldIndex = fields.findIndex((f) => f.id === activeFieldId)
      let newIndex = oldIndex
      if (overId && overId !== "canvas") {
        const idx = fields.findIndex((f) => f.id === overId)
        if (idx >= 0) newIndex = idx
      }
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        setFields((prev) => arrayMove(prev, oldIndex, newIndex))
      }
    }

    setActivePaletteType(null)
    setActiveFieldId(null)
    setInsertionIndex(null)
  }

  function updateField(id: string, patch: Partial<Field>) {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)))
  }

  function removeField(id: string) {
    setFields((prev) => prev.filter((f) => f.id !== id))
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh]">
        <div className="sticky top-0 z-30 border-b bg-background/70 backdrop-blur">
          <div className="mx-auto w-full max-w-6xl px-4 py-3 flex items-center gap-3">
            <Skeleton className="h-9 w-64" />
            <div className="ml-auto flex items-center gap-2">
              <Skeleton className="h-9 w-40" />
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-9 w-36" />
            </div>
          </div>
        </div>
        <div className="mx-auto w-full max-w-6xl px-4 py-6">
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh]">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto w-full max-w-6xl px-4 py-3 flex items-center gap-3">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-9 max-w-xs"
            placeholder="Form title"
            aria-label="Form title"
          />

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={deleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/form/${id}`)
                toast({ title: "Link copied", description: "Form link copied to clipboard." })
              }}
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
            <Button variant="ghost" size="sm" onClick={() => router.push(`/form/${id}/analytics`)}>
              <BarChart2 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>

      {/* Workspace */}
      <div className="mx-auto w-full max-w-6xl px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Snippet Library */}
        <Card className="lg:col-span-3 h-fit">
          <CardHeader>
            <CardTitle>Snippets</CardTitle>
            <CardDescription>Drag to canvas or click to add</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {(["Input Fields", "Choices", "Media", "Layout"] as const).map((cat) => (
              <div key={cat} className="space-y-2">
                <p className="text-xs text-muted-foreground">{cat}</p>
                <div className="grid grid-cols-2 gap-2">
                  {SNIPPETS.filter((s) => s.category === cat).map((s) => (
                    <DraggableSnippetCard key={s.type} snippet={s} onClickAdd={(t) => addField(t)} />
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Center: Canvas */}
        <div className="lg:col-span-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Form Canvas</CardTitle>
              <CardDescription>Reorder with handles. Edit or delete blocks.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDragEnd={onDragEnd}
              >
                <CanvasDroppable>
                  <SortableContext items={items} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                      {fields.length === 0 && (
                        <div className="flex items-center justify-center text-sm text-muted-foreground h-24">
                          Drag snippets here
                        </div>
                      )}
                      {fields.map((f, idx) => (
                        <div key={f.id} className="space-y-3">
                          {/* Insertion indicator */}
                          {activePaletteType && insertionIndex === idx && (
                            <div className="h-0.5 bg-foreground/40 rounded" />
                          )}
                          <SortableFieldItem field={f} onChange={updateField} onRemove={removeField} />
                        </div>
                      ))}
                      {activePaletteType && insertionIndex === fields.length && (
                        <div className="h-0.5 bg-foreground/40 rounded" />
                      )}
                    </div>
                  </SortableContext>
                </CanvasDroppable>
              </DndContext>
            </CardContent>
          </Card>
        </div>

        {/* Right: Preview & Properties */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle>Preview & Properties</CardTitle>
            <CardDescription>Adjust and preview instantly</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="preview" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="preview" className="w-1/2">
                  Preview
                </TabsTrigger>
                <TabsTrigger value="properties" className="w-1/2">
                  Properties
                </TabsTrigger>
              </TabsList>

              <TabsContent value="preview" className="space-y-3 mt-3">
                <div className="rounded-md border overflow-hidden">
                  {coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={coverUrl || "/placeholder.svg"} alt="Cover" className="h-24 w-full object-cover" />
                  ) : (
                    <div className="h-24 w-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                      Cover image
                    </div>
                  )}
                  <div className="p-3 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-md border flex items-center justify-center text-sm">
                        {iconSymbol || "•"}
                      </div>
                      <div className="text-sm font-medium text-pretty">{title}</div>
                    </div>
                    {description && <p className="text-sm text-muted-foreground">{description}</p>}
                    <div className="space-y-2">
                      {fields.map((f) => (
                        <div key={f.id} className="space-y-1">
                          <label className="text-xs">{f.label}</label>
                          {f.type === "long_text" ? (
                            <Textarea className="min-h-16" placeholder="Type here..." />
                          ) : f.type === "multiple_choice" ? (
                            <div className="flex gap-4 text-sm text-muted-foreground">
                              <span>Option A</span>
                              <span>Option B</span>
                            </div>
                          ) : f.type === "checkboxes" ? (
                            <div className="flex gap-4 text-sm text-muted-foreground">
                              <span>Choice 1</span>
                              <span>Choice 2</span>
                            </div>
                          ) : f.type === "dropdown" ? (
                            <Input placeholder="Dropdown (mock)" />
                          ) : f.type === "image" ? (
                            <div className="h-24 w-full rounded-md border border-dashed flex items-center justify-center text-xs text-muted-foreground">
                              Image placeholder
                            </div>
                          ) : f.type === "file_upload" ? (
                            <div className="h-10 rounded-md border border-dashed flex items-center justify-center text-xs text-muted-foreground">
                              File upload placeholder
                            </div>
                          ) : f.type === "section_break" ? (
                            <div className="py-1">
                              <Separator />
                            </div>
                          ) : f.type === "divider" ? (
                            <Separator />
                          ) : (
                            <Input placeholder="Type here..." />
                          )}
                        </div>
                      ))}
                      <Button className="w-full" variant="secondary">
                        Submit
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="properties" className="space-y-4 mt-3">
                <div className="space-y-2">
                  <Label htmlFor="cover">Cover image URL</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="cover"
                      placeholder="https://..."
                      value={coverUrl}
                      onChange={(e) => setCoverUrl(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCoverUpload}
                      disabled={uploadingCover}
                      aria-label="Upload cover"
                    >
                      <UploadCloud className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icon">Icon</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="icon"
                      placeholder="Emoji or letter"
                      value={iconSymbol}
                      onChange={(e) => setIconSymbol(e.target.value)}
                      className="max-w-[160px]"
                    />
                    <div className="h-8 w-8 rounded-full border grid place-items-center text-sm">
                      {iconSymbol || "•"}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleIconUpload}
                      disabled={uploadingIcon}
                      aria-label="Upload icon"
                    >
                      <UploadCloud className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="desc">Description</Label>
                  <Textarea
                    id="desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your form..."
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="requireEmail" className="cursor-pointer">
                      Require email
                    </Label>
                    <p className="text-xs text-muted-foreground">Ask for respondent email (mock)</p>
                  </div>
                  <Switch id="requireEmail" checked={requireEmail} onCheckedChange={setRequireEmail} />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this form and all its responses. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function EditPage() {
  return (
    <ProtectedRoute>
      <EditPageContent />
    </ProtectedRoute>
  )
}
