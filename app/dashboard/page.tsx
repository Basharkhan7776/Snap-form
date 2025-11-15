"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
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
import { Plus, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formsApi, templatesApi } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { usePlanLimits } from "@/lib/hooks/use-plan-limits"
import { useRouter } from "next/navigation"

function DashboardContent() {
  const { toast } = useToast()
  const router = useRouter()
  const { limits, canCreateForm, plan } = usePlanLimits()
  const [showAll, setShowAll] = useState(false)
  const [forms, setForms] = useState<any[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [formToDelete, setFormToDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)

  // Fetch forms
  useEffect(() => {
    loadForms()
  }, [])

  // Fetch templates
  useEffect(() => {
    loadTemplates()
  }, [])

  const loadForms = async () => {
    try {
      setLoading(true)
      const response = await formsApi.list({ limit: 50 })
      if (response.success && response.data) {
        setForms(response.data)
      }
    } catch (error) {
      console.error("Failed to load forms:", error)
      toast({
        title: "Error",
        description: "Failed to load forms. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadTemplates = async () => {
    try {
      const response = await templatesApi.list()
      if (response.success && response.data) {
        setTemplates(response.data.slice(0, 4)) // Show first 4
      }
    } catch (error) {
      console.error("Failed to load templates:", error)
    }
  }

  const handleDeleteClick = (formId: string) => {
    setFormToDelete(formId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!formToDelete) return

    try {
      setDeleting(true)
      await formsApi.delete(formToDelete)

      toast({
        title: "Form deleted",
        description: "The form has been successfully deleted.",
      })

      // Remove from state
      setForms(forms.filter((f) => f.id !== formToDelete))
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
      setFormToDelete(null)
    }
  }

  const visibleForms = showAll ? forms : forms.slice(0, 5)
  const canCreate = canCreateForm(forms.length)
  const formLimitReached = !canCreate

  const handleCreateFormClick = (e: React.MouseEvent) => {
    if (formLimitReached) {
      e.preventDefault()
      setUpgradeDialogOpen(true)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    } catch {
      return dateString
    }
  }

  return (
    <div className="px-6 py-6 space-y-8">
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-medium">Your Forms</h2>
            {limits.maxForms !== -1 && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                {forms.length}/{limits.maxForms} forms
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {forms.length > 5 && (
              <Button variant="ghost" size="sm" onClick={() => setShowAll((s) => !s)}>
                {showAll ? "Show Less" : "See All"}
              </Button>
            )}
            {formLimitReached ? (
              <Button size="sm" onClick={handleCreateFormClick} variant="default">
                <Plus className="h-4 w-4 mr-2" />
                New Form
              </Button>
            ) : (
              <Button asChild size="sm">
                <Link href="/create">
                  <Plus className="h-4 w-4 mr-2" />
                  New Form
                </Link>
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-9 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : forms.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground mb-4">You haven't created any forms yet</p>
              <Button asChild>
                <Link href="/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Form
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Create New Form Card */}
            {!formLimitReached && (
              <motion.div layout>
                <Card className="h-full">
                  <CardContent className="h-full flex items-center justify-center py-12">
                    <Button asChild variant="secondary" className="gap-2">
                      <Link href="/create">
                        <Plus className="h-4 w-4" />
                        Create New Form
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {visibleForms.map((form) => (
              <motion.div key={form.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base line-clamp-1">{form.title}</CardTitle>
                        <CardDescription>
                          Updated {formatDate(form.updatedAt || form.createdAt)}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/form/${form.id}`}>View Form</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/edit/${form.id}`}>Edit Form</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/form/${form.id}/analytics`}>Analytics</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(form.id)}
                            className="text-red-600"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="flex gap-2">
                    <Button asChild size="sm" variant="secondary">
                      <Link href={`/form/${form.id}`}>View</Link>
                    </Button>
                    <Button asChild size="sm">
                      <Link href={`/edit/${form.id}`}>Edit</Link>
                    </Button>
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/form/${form.id}/analytics`}>Analytics</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <Separator />

      {/* Templates Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Templates</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {templates.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-8 text-center text-muted-foreground">
                No templates available yet
              </CardContent>
            </Card>
          ) : (
            templates.map((template) => (
              <Card key={template.id} className="hover:bg-accent/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {template.iconSymbol && <span>{template.iconSymbol}</span>}
                    <CardTitle className="text-base">{template.title}</CardTitle>
                  </div>
                  {template.description && (
                    <CardDescription className="text-xs line-clamp-2">{template.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <Button asChild size="sm" variant="secondary" className="w-full">
                    <Link href={`/create?template=${template.id}`}>Use Template</Link>
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>

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
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Upgrade Dialog */}
      <AlertDialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Form Limit Reached</AlertDialogTitle>
            <AlertDialogDescription>
              You've reached the maximum of {limits.maxForms} forms on the {plan} plan. Upgrade to Premium or Business for unlimited forms.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push('/profile')}>
              View Plans
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
