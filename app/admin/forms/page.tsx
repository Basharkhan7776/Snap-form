"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { adminApi } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { Search, ExternalLink } from "lucide-react"

type Form = {
  id: string
  title: string
  userId: string
  user: { email: string; name?: string }
  _count: { responses: number }
  createdAt: string
  updatedAt: string
}

export default function AdminFormsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [forms, setForms] = useState<Form[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    loadForms()
  }, [])

  async function loadForms() {
    try {
      setLoading(true)
      const response = await adminApi.getForms()
      if (response.success && response.data) {
        setForms(response.data)
      }
    } catch (error) {
      console.error("Failed to load forms:", error)
      toast({
        title: "Error",
        description: "Failed to load forms.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredForms = forms.filter(
    (form) =>
      form.title.toLowerCase().includes(search.toLowerCase()) ||
      form.user.email.toLowerCase().includes(search.toLowerCase()) ||
      form.user.name?.toLowerCase().includes(search.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    } catch {
      return dateString
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
      <div>
        <h1 className="text-2xl font-semibold mb-1">Forms Management</h1>
        <p className="text-muted-foreground">View and manage all forms across the platform</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Forms ({filteredForms.length})</CardTitle>
          <CardDescription>
            <div className="flex items-center gap-2 mt-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or owner..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Responses</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredForms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No forms found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredForms.map((form) => (
                    <TableRow key={form.id}>
                      <TableCell className="font-medium">{form.title}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{form.user.name || form.user.email}</p>
                          <p className="text-xs text-muted-foreground">{form.user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{form._count.responses}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(form.createdAt)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(form.updatedAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/form/${form.id}`} target="_blank">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              View
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/edit/${form.id}`}>Edit</Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/form/${form.id}/analytics`}>Analytics</Link>
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
    </div>
  )
}
