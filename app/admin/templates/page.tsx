"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { templatesApi } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { Plus, Pencil, Trash2 } from "lucide-react"

type Template = {
  id: string
  title: string
  description?: string
  iconSymbol?: string
  fields: any[]
  createdAt: string
}

export default function AdminTemplatesPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [templates, setTemplates] = useState<Template[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [iconSymbol, setIconSymbol] = useState("")
  const [fields, setFields] = useState("[]")

  useEffect(() => {
    loadTemplates()
  }, [])

  async function loadTemplates() {
    try {
      setLoading(true)
      const response = await templatesApi.list()
      if (response.success && response.data) {
        setTemplates(response.data)
      }
    } catch (error) {
      console.error("Failed to load templates:", error)
      toast({
        title: "Error",
        description: "Failed to load templates.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  function openCreateDialog() {
    setSelectedTemplate(null)
    setTitle("")
    setDescription("")
    setIconSymbol("")
    setFields("[]")
    setDialogOpen(true)
  }

  function openEditDialog(template: Template) {
    setSelectedTemplate(template)
    setTitle(template.title)
    setDescription(template.description || "")
    setIconSymbol(template.iconSymbol || "")
    setFields(JSON.stringify(template.fields, null, 2))
    setDialogOpen(true)
  }

  function openDeleteDialog(template: Template) {
    setSelectedTemplate(template)
    setDeleteDialogOpen(true)
  }

  async function handleSave() {
    try {
      setSaving(true)

      // Parse fields JSON
      let parsedFields
      try {
        parsedFields = JSON.parse(fields)
      } catch {
        toast({
          title: "Invalid JSON",
          description: "The fields JSON is invalid.",
          variant: "destructive",
        })
        return
      }

      const data = {
        title,
        description,
        iconSymbol,
        fields: parsedFields,
      }

      if (selectedTemplate) {
        // Update existing
        const response = await templatesApi.update(selectedTemplate.id, data)
        if (response.success) {
          setTemplates(templates.map((t) => (t.id === selectedTemplate.id ? response.data : t)))
          toast({ title: "Template updated", description: "Template has been updated successfully." })
        }
      } else {
        // Create new
        const response = await templatesApi.create(data)
        if (response.success) {
          setTemplates([...templates, response.data])
          toast({ title: "Template created", description: "Template has been created successfully." })
        }
      }

      setDialogOpen(false)
    } catch (error) {
      console.error("Failed to save template:", error)
      toast({
        title: "Error",
        description: "Failed to save template.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!selectedTemplate) return

    try {
      setDeleting(true)
      await templatesApi.delete(selectedTemplate.id)
      setTemplates(templates.filter((t) => t.id !== selectedTemplate.id))
      toast({ title: "Template deleted", description: "Template has been deleted successfully." })
      setDeleteDialogOpen(false)
      setSelectedTemplate(null)
    } catch (error) {
      console.error("Failed to delete template:", error)
      toast({
        title: "Error",
        description: "Failed to delete template.",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="px-6 py-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Template Management</h1>
          <p className="text-muted-foreground">Create and manage form templates</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Templates ({templates.length})</CardTitle>
          <CardDescription>Templates available to all users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Icon</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Fields</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No templates found
                    </TableCell>
                  </TableRow>
                ) : (
                  templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="text-lg">{template.iconSymbol || "📄"}</TableCell>
                      <TableCell className="font-medium">{template.title}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {template.description || "—"}
                      </TableCell>
                      <TableCell>{template.fields.length} fields</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(template.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(template)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(template)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTemplate ? "Edit Template" : "Create Template"}</DialogTitle>
            <DialogDescription>
              {selectedTemplate
                ? "Update the template details below."
                : "Create a new template that users can use to start their forms."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Contact Form"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="A simple contact form..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icon">Icon Symbol (emoji)</Label>
              <Input
                id="icon"
                placeholder="📝"
                value={iconSymbol}
                onChange={(e) => setIconSymbol(e.target.value)}
                className="max-w-xs"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fields">Fields (JSON)</Label>
              <Textarea
                id="fields"
                placeholder='[{"id": "f1", "type": "short_text", "label": "Name", "required": true}]'
                value={fields}
                onChange={(e) => setFields(e.target.value)}
                className="font-mono text-sm min-h-[200px]"
              />
              <p className="text-xs text-muted-foreground">
                Enter fields as a JSON array with id, type, label, required, and options
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !title}>
              {saving ? "Saving..." : selectedTemplate ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this template. This action cannot be undone.
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
