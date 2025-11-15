"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { adminApi } from "@/lib/api-client"
import { Users, FileText, MessageSquare, Layout } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type AdminStats = {
  totalUsers: number
  totalForms: number
  totalResponses: number
  totalTemplates: number
  recentUsers?: Array<{ id: string; email: string; createdAt: string }>
  recentForms?: Array<{ id: string; title: string; createdAt: string }>
}

export default function AdminDashboardPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AdminStats | null>(null)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    try {
      setLoading(true)
      const response = await adminApi.getStats()
      if (response.success && response.data) {
        setStats(response.data)
      }
    } catch (error) {
      console.error("Failed to load admin stats:", error)
      toast({
        title: "Error",
        description: "Failed to load admin statistics.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="px-6 py-6 space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      description: "Registered users",
    },
    {
      title: "Total Forms",
      value: stats?.totalForms || 0,
      icon: FileText,
      description: "Forms created",
    },
    {
      title: "Total Responses",
      value: stats?.totalResponses || 0,
      icon: MessageSquare,
      description: "Form submissions",
    },
    {
      title: "Total Templates",
      value: stats?.totalTemplates || 0,
      icon: Layout,
      description: "Available templates",
    },
  ]

  return (
    <div className="px-6 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Admin Dashboard</h1>
        <p className="text-muted-foreground">System overview and statistics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Latest registered users</CardDescription>
          </CardHeader>
          <CardContent>
            {!stats?.recentUsers || stats.recentUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent users</p>
            ) : (
              <div className="space-y-3">
                {stats.recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Forms */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Forms</CardTitle>
            <CardDescription>Latest created forms</CardDescription>
          </CardHeader>
          <CardContent>
            {!stats?.recentForms || stats.recentForms.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent forms</p>
            ) : (
              <div className="space-y-3">
                {stats.recentForms.map((form) => (
                  <div key={form.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{form.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(form.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
