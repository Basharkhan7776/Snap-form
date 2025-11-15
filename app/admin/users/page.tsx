"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { adminApi } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { Search } from "lucide-react"

type User = {
  id: string
  email: string
  name?: string
  role: "USER" | "ADMIN" | "SUPER_ADMIN"
  plan: "FREE" | "PREMIUM" | "BUSINESS"
  createdAt: string
}

export default function AdminUsersPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState("")
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    try {
      setLoading(true)
      const response = await adminApi.getUsers()
      if (response.success && response.data) {
        setUsers(response.data)
      }
    } catch (error) {
      console.error("Failed to load users:", error)
      toast({
        title: "Error",
        description: "Failed to load users.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function updateUserRole(userId: string, role: "USER" | "ADMIN") {
    try {
      setUpdating(userId)
      const response = await adminApi.updateUser(userId, { role })
      if (response.success) {
        setUsers(users.map((u) => (u.id === userId ? { ...u, role } : u)))
        toast({
          title: "Role updated",
          description: "User role has been updated successfully.",
        })
      }
    } catch (error) {
      console.error("Failed to update user role:", error)
      toast({
        title: "Error",
        description: "Failed to update user role.",
        variant: "destructive",
      })
    } finally {
      setUpdating(null)
    }
  }

  async function updateUserPlan(userId: string, plan: "FREE" | "PREMIUM" | "BUSINESS") {
    try {
      setUpdating(userId)
      const response = await adminApi.updateUser(userId, { plan })
      if (response.success) {
        setUsers(users.map((u) => (u.id === userId ? { ...u, plan } : u)))
        toast({
          title: "Plan updated",
          description: "User plan has been updated successfully.",
        })
      }
    } catch (error) {
      console.error("Failed to update user plan:", error)
      toast({
        title: "Error",
        description: "Failed to update user plan.",
        variant: "destructive",
      })
    } finally {
      setUpdating(null)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.name?.toLowerCase().includes(search.toLowerCase())
  )

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
        <h1 className="text-2xl font-semibold mb-1">User Management</h1>
        <p className="text-muted-foreground">Manage users, roles, and plans</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users ({filteredUsers.length})</CardTitle>
          <CardDescription>
            <div className="flex items-center gap-2 mt-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email or name..."
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
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>{user.name || "—"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === "SUPER_ADMIN"
                              ? "default"
                              : user.role === "ADMIN"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.plan}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {user.role !== "SUPER_ADMIN" && (
                          <div className="flex items-center gap-2">
                            <Select
                              value={user.role}
                              onValueChange={(value) =>
                                updateUserRole(user.id, value as "USER" | "ADMIN")
                              }
                              disabled={updating === user.id}
                            >
                              <SelectTrigger className="w-28">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="USER">User</SelectItem>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select
                              value={user.plan}
                              onValueChange={(value) =>
                                updateUserPlan(user.id, value as "FREE" | "PREMIUM" | "BUSINESS")
                              }
                              disabled={updating === user.id}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="FREE">Free</SelectItem>
                                <SelectItem value="PREMIUM">Premium</SelectItem>
                                <SelectItem value="BUSINESS">Business</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
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
