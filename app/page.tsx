"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Sparkles,
  MousePointerClick,
  BarChart3,
  Zap,
  Shield,
  Palette,
  ArrowRight,
  CheckCircle2,
} from "lucide-react"

export default function Page() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        <div className="max-w-4xl mx-auto space-y-8">
          <Badge variant="secondary" className="px-4 py-1.5">
            <Sparkles className="h-3 w-3 mr-2" />
            AI-Assisted Form Builder
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance">
            Build Forms in a{" "}
            <span className="relative">
              <span className="relative z-10">Snap</span>
              <span className="absolute bottom-2 left-0 right-0 h-3 bg-foreground/10 -rotate-1"></span>
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-balance">
            Create, edit, and analyze forms with a minimal and intuitive interface.
            Combines clean design with drag-and-drop features and real-time analytics.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button asChild size="lg" className="gap-2">
              <Link href="/auth">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/dashboard">
                View Dashboard
              </Link>
            </Button>
          </div>

          <div className="flex items-center justify-center gap-6 pt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Google OAuth only</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Everything you need to create powerful forms
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-balance">
              Snap-form simplifies form creation with modern tools and AI assistance,
              inspired by Google Forms but built for the future.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-2 hover:border-foreground/20 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-foreground/5 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6" />
                </div>
                <CardTitle>AI-Assisted Creation</CardTitle>
                <CardDescription>
                  Let AI help you build forms faster with intelligent suggestions and templates.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-foreground/20 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-foreground/5 flex items-center justify-center mb-4">
                  <MousePointerClick className="h-6 w-6" />
                </div>
                <CardTitle>Drag & Drop Builder</CardTitle>
                <CardDescription>
                  Intuitive drag-and-drop interface with live preview. Build forms visually without code.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-foreground/20 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-foreground/5 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <CardTitle>Real-Time Analytics</CardTitle>
                <CardDescription>
                  Visualize responses instantly with beautiful charts and detailed submission tables.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-foreground/20 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-foreground/5 flex items-center justify-center mb-4">
                  <Palette className="h-6 w-6" />
                </div>
                <CardTitle>Minimal Design</CardTitle>
                <CardDescription>
                  Clean, monochrome interface that focuses on functionality and user experience.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-foreground/20 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-foreground/5 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6" />
                </div>
                <CardTitle>Secure Authentication</CardTitle>
                <CardDescription>
                  Google OAuth integration ensures secure and seamless access to your forms.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-foreground/20 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-foreground/5 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6" />
                </div>
                <CardTitle>Lightning Fast</CardTitle>
                <CardDescription>
                  Built with Next.js 14 and optimized for performance. Create and share forms instantly.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              How it works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-balance">
              Create professional forms in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative space-y-4">
              <div className="h-14 w-14 rounded-full bg-foreground text-background flex items-center justify-center text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold">Create Your Form</h3>
              <p className="text-muted-foreground">
                Start from scratch or use AI to generate a form template. Drag and drop fields to build your perfect form.
              </p>
            </div>

            <div className="relative space-y-4">
              <div className="h-14 w-14 rounded-full bg-foreground text-background flex items-center justify-center text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold">Share Instantly</h3>
              <p className="text-muted-foreground">
                Get a shareable link with one click. Your respondents can fill out forms on any device.
              </p>
            </div>

            <div className="relative space-y-4">
              <div className="h-14 w-14 rounded-full bg-foreground text-background flex items-center justify-center text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold">Analyze Results</h3>
              <p className="text-muted-foreground">
                View responses in real-time with charts and tables. Export data for further analysis.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2">
            <CardContent className="pt-12 pb-12 text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Ready to build better forms?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-balance">
                Join users who are creating beautiful, functional forms with Snap-form.
                Get started for free today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button asChild size="lg" className="gap-2">
                  <Link href="/auth">
                    Start Building Now
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="lg">
                  <Link href="/create">
                    Try the Builder
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
