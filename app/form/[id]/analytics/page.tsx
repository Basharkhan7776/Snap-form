"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { analyticsApi, responsesApi } from "@/lib/api-client"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useToast } from "@/hooks/use-toast"

type TimeRange = "1W" | "1M" | "1Y"

type AnalyticsData = {
  label: string
  count: number
}[]

type Response = {
  id: string
  email?: string
  data: Record<string, any>
  createdAt: string
}

function AnalyticsContent() {
  const params = useParams<{ id: string }>()
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id || ""
  const router = useRouter()
  const { toast } = useToast()

  const [range, setRange] = useState<TimeRange>("1W")
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<AnalyticsData>([])
  const [responses, setResponses] = useState<Response[]>([])
  const [stats, setStats] = useState<{ totalResponses: number; avgCompletionTime?: number } | null>(null)

  useEffect(() => {
    if (!id) return
    loadData()
  }, [id, range])

  async function loadData() {
    try {
      setLoading(true)

      // Fetch analytics data
      const analyticsResponse = await analyticsApi.get(id, range)
      if (analyticsResponse.success && analyticsResponse.data) {
        setChartData(analyticsResponse.data.timeSeries || [])
        setStats({
          totalResponses: analyticsResponse.data.totalResponses || 0,
          avgCompletionTime: analyticsResponse.data.avgCompletionTime,
        })
      }

      // Fetch responses list
      const responsesResponse = await responsesApi.list(id, { limit: 20 })
      if (responsesResponse.success && responsesResponse.data) {
        setResponses(responsesResponse.data)
      }
    } catch (error) {
      console.error("Failed to load analytics:", error)
      toast({
        title: "Error",
        description: "Failed to load analytics data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
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

  if (loading) {
    return (
      <div className="px-6 py-6 space-y-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
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
    <div className="px-6 py-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-medium">Form Analytics</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.push(`/edit/${id}`)}>
            Back to Edit
          </Button>
          <Button variant="secondary" onClick={() => window.print()}>
            Download PDF
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardDescription>Total Responses</CardDescription>
            <CardTitle className="text-3xl">{stats?.totalResponses || 0}</CardTitle>
          </CardHeader>
        </Card>
        {stats?.avgCompletionTime && (
          <Card>
            <CardHeader>
              <CardDescription>Avg. Completion Time</CardDescription>
              <CardTitle className="text-3xl">{Math.round(stats.avgCompletionTime)}s</CardTitle>
            </CardHeader>
          </Card>
        )}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Responses Over Time</CardTitle>
            <CardDescription>
              {range === "1W"
                ? "Daily submissions (last 7 days)"
                : range === "1M"
                  ? "Submissions across the last month"
                  : "Monthly submissions (last 12 months)"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 rounded-md border p-1">
            <Button
              size="sm"
              variant={range === "1W" ? "default" : "ghost"}
              onClick={() => setRange("1W")}
              aria-pressed={range === "1W"}
            >
              1W
            </Button>
            <Button
              size="sm"
              variant={range === "1M" ? "default" : "ghost"}
              onClick={() => setRange("1M")}
              aria-pressed={range === "1M"}
            >
              1M
            </Button>
            <Button
              size="sm"
              variant={range === "1Y" ? "default" : "ghost"}
              onClick={() => setRange("1Y")}
              aria-pressed={range === "1Y"}
            >
              1Y
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No data available for this time range
            </div>
          ) : (
            <ChartContainer
              config={{
                count: { label: "Responses", color: "hsl(var(--chart-1))" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="var(--color-count)"
                    fill="var(--color-count)"
                    fillOpacity={0.2}
                    name="Responses"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Responses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
          <CardDescription>Latest {responses.length} entries</CardDescription>
        </CardHeader>
        <CardContent>
          {responses.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No responses yet</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {responses.map((response) => (
                    <TableRow key={response.id}>
                      <TableCell className="font-mono text-xs">{response.id.slice(0, 8)}</TableCell>
                      <TableCell>{response.email || "Anonymous"}</TableCell>
                      <TableCell>{formatDate(response.createdAt)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Show response data in a simple alert for now
                            alert(JSON.stringify(response.data, null, 2))
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <ProtectedRoute>
      <AnalyticsContent />
    </ProtectedRoute>
  )
}
