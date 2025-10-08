"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { motion, useInView, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion"
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
  const { scrollYProgress } = useScroll()
  const scaleProgress = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <div className="min-h-screen overflow-x-hidden relative">
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500/60 via-red-400/40 to-foreground/50 origin-left z-50"
        style={{ scaleX: scaleProgress }}
      />

      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* How It Works Section */}
      <HowItWorksSection />

      <Separator className="my-20" />

      {/* CTA Section */}
      <CTASection />
    </div>
  )
}

// Hero Section Component
function HeroSection() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <section ref={ref} className="relative min-h-[100vh] flex flex-col items-center justify-center text-center px-6 py-20 overflow-hidden">
      {/* Animated gradient background with red accents */}
      <motion.div className="absolute inset-0 -z-10" style={{ y }}>
        <div className="absolute inset-0 bg-background bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <motion.div
          className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-red-500/10 via-foreground/5 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-gradient-to-tl from-foreground/5 via-red-400/10 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 bg-gradient-to-br from-red-500/5 to-transparent rounded-full blur-2xl"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </motion.div>

      {/* Floating particles */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 4 + 1,
            height: Math.random() * 4 + 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: i % 3 === 0 ? "rgba(239, 68, 68, 0.3)" : "rgba(128, 128, 128, 0.2)",
          }}
          animate={{
            y: [0, -50, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      <motion.div className="max-w-5xl mx-auto space-y-8 relative z-10" style={{ opacity }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="secondary" className="px-5 py-2 backdrop-blur-md bg-background/60 border border-red-500/20 shadow-lg shadow-red-500/10">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="h-3.5 w-3.5 mr-2 text-red-500" />
            </motion.div>
            <span className="bg-gradient-to-r from-foreground via-red-500/80 to-foreground bg-clip-text text-transparent font-medium">
              AI-Assisted Form Builder
            </span>
          </Badge>
        </motion.div>

        <motion.h1
          className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight text-balance"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Build Forms in a{" "}
          <motion.span
            className="relative inline-block"
            whileHover={{ scale: 1.05, rotate: -2 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <span className="relative z-10 bg-gradient-to-br from-foreground via-red-500 to-foreground bg-clip-text text-transparent">
              Snap
            </span>
            <motion.span
              className="absolute bottom-3 left-0 right-0 h-4 bg-gradient-to-r from-red-500/30 via-red-400/20 to-foreground/20 -rotate-1 rounded blur-sm"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
            <motion.span
              className="absolute bottom-3 left-0 right-0 h-4 bg-gradient-to-r from-red-500/50 via-foreground/20 to-red-400/30 -rotate-1 rounded"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            />
          </motion.span>
        </motion.h1>

        <motion.p
          className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed text-balance"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Create, edit, and analyze forms with a minimal and intuitive interface.
          <span className="text-red-500/80 font-medium"> Powered by AI</span>, enhanced by design.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <MagneticButton>
            <Button asChild size="lg" className="gap-2 text-lg px-8 relative overflow-hidden group bg-gradient-to-r from-foreground via-red-500/20 to-foreground hover:shadow-lg hover:shadow-red-500/20 transition-all">
              <Link href="/auth">
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/30 to-transparent"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </MagneticButton>

          <MagneticButton>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 backdrop-blur-sm border-foreground/10 hover:border-red-500/30 hover:bg-red-500/5 transition-all">
              <Link href="/dashboard">View Dashboard</Link>
            </Button>
          </MagneticButton>
        </motion.div>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <CheckCircle2 className="h-4 w-4 text-red-500/70" />
            <span>No credit card required</span>
          </motion.div>
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <CheckCircle2 className="h-4 w-4 text-red-500/70" />
            <span>Google OAuth only</span>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{
          opacity: { delay: 1 },
          y: { duration: 2, repeat: Infinity },
        }}
      >
        <div className="w-6 h-10 border-2 border-foreground/20 rounded-full flex justify-center relative overflow-hidden">
          <motion.div
            className="w-1.5 h-1.5 bg-gradient-to-b from-red-500 to-foreground rounded-full mt-2"
            animate={{ y: [0, 16, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  )
}

// Features Section Component
function FeaturesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="relative px-6 py-32 overflow-hidden">
      {/* Background gradient with red */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background -z-10">
        <motion.div
          className="absolute top-1/4 right-0 w-1/3 h-1/3 bg-gradient-to-l from-red-500/10 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto space-y-16">
        <FadeInWhenVisible>
          <div className="text-center space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-br from-foreground via-red-500/60 to-foreground bg-clip-text text-transparent">
                Everything you need to create powerful forms
              </h2>
            </motion.div>
            <motion.p
              className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Snap-form simplifies form creation with modern tools and AI assistance,
              inspired by Google Forms but built for the future.
            </motion.p>
          </div>
        </FadeInWhenVisible>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Sparkles,
              title: "AI-Assisted Creation",
              description: "Let AI help you build forms faster with intelligent suggestions and templates.",
              delay: 0,
              accent: "red",
            },
            {
              icon: MousePointerClick,
              title: "Drag & Drop Builder",
              description: "Intuitive drag-and-drop interface with live preview. Build forms visually without code.",
              delay: 0.1,
              accent: "gray",
            },
            {
              icon: BarChart3,
              title: "Real-Time Analytics",
              description: "Visualize responses instantly with beautiful charts and detailed submission tables.",
              delay: 0.2,
              accent: "red",
            },
            {
              icon: Palette,
              title: "Minimal Design",
              description: "Clean, monochrome interface that focuses on functionality and user experience.",
              delay: 0.3,
              accent: "gray",
            },
            {
              icon: Shield,
              title: "Secure Authentication",
              description: "Google OAuth integration ensures secure and seamless access to your forms.",
              delay: 0.4,
              accent: "red",
            },
            {
              icon: Zap,
              title: "Lightning Fast",
              description: "Built with Next.js 14 and optimized for performance. Create and share forms instantly.",
              delay: 0.5,
              accent: "gray",
            },
          ].map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  )
}

// How It Works Section
function HowItWorksSection() {
  return (
    <section className="relative px-6 py-32">
      <div className="max-w-5xl mx-auto space-y-16">
        <FadeInWhenVisible>
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-br from-foreground via-red-500/60 to-foreground bg-clip-text text-transparent">
              How it works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
              Create professional forms in three simple steps
            </p>
          </div>
        </FadeInWhenVisible>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connection lines with red gradient */}
          <div className="hidden md:block absolute top-7 left-[16.666%] right-[16.666%] h-0.5 bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />

          {[
            {
              number: "1",
              title: "Create Your Form",
              description: "Start from scratch or use AI to generate a form template. Drag and drop fields to build your perfect form.",
              delay: 0,
            },
            {
              number: "2",
              title: "Share Instantly",
              description: "Get a shareable link with one click. Your respondents can fill out forms on any device.",
              delay: 0.2,
            },
            {
              number: "3",
              title: "Analyze Results",
              description: "View responses in real-time with charts and tables. Export data for further analysis.",
              delay: 0.4,
            },
          ].map((step, index) => (
            <motion.div
              key={index}
              className="relative space-y-4 group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: step.delay }}
            >
              <motion.div
                className="h-16 w-16 rounded-full bg-gradient-to-br from-foreground via-red-500 to-foreground text-background flex items-center justify-center text-2xl font-bold relative z-10 shadow-xl shadow-red-500/20"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.span
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: step.delay + 0.2, type: "spring" }}
                >
                  {step.number}
                </motion.span>
                {/* Pulse ring */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-red-500/50"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.3,
                  }}
                />
              </motion.div>
              <h3 className="text-2xl font-semibold group-hover:text-red-500/80 transition-colors">
                {step.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// CTA Section
function CTASection() {
  return (
    <section className="relative px-6 py-32 overflow-hidden">
      {/* Animated background with red */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-red-500/15 via-foreground/10 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Card className="border-2 backdrop-blur-sm bg-background/50 hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-500 overflow-hidden relative group border-foreground/10 hover:border-red-500/30">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
            <CardContent className="pt-16 pb-16 text-center space-y-8 relative z-10">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-br from-foreground via-red-500 to-foreground bg-clip-text text-transparent">
                  Ready to build better forms?
                </h2>
              </motion.div>

              <motion.p
                className="text-lg text-muted-foreground max-w-xl mx-auto text-balance"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                Join users who are creating beautiful, functional forms with Snap-form.
                Get started for free today.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <MagneticButton>
                  <Button asChild size="lg" className="gap-2 text-lg px-8 relative overflow-hidden group bg-gradient-to-r from-foreground via-red-500/20 to-foreground hover:shadow-lg hover:shadow-red-500/20">
                    <Link href="/auth">
                      <motion.span
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/30 to-transparent"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "100%" }}
                        transition={{ duration: 0.6 }}
                      />
                      Start Building Now
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                </MagneticButton>

                <MagneticButton>
                  <Button asChild variant="ghost" size="lg" className="text-lg px-8 hover:bg-red-500/5 hover:text-red-500 transition-colors">
                    <Link href="/create">Try the Builder</Link>
                  </Button>
                </MagneticButton>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}

// Helper Components
function FadeInWhenVisible({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      {children}
    </motion.div>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  delay,
  accent,
}: {
  icon: any
  title: string
  description: string
  delay: number
  accent: "red" | "gray"
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -12, scale: 1.02 }}
    >
      <Card className={`h-full border-2 transition-all duration-300 relative group overflow-hidden backdrop-blur-sm bg-background/50 ${
        accent === "red"
          ? "hover:border-red-500/40 hover:shadow-xl hover:shadow-red-500/10"
          : "hover:border-foreground/30 hover:shadow-xl"
      }`}>
        {/* Gradient hover effect */}
        <motion.div
          className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
            accent === "red"
              ? "bg-gradient-to-br from-red-500/10 to-transparent"
              : "bg-gradient-to-br from-foreground/5 to-transparent"
          }`}
        />

        <CardHeader className="relative z-10">
          <motion.div
            className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-6 relative overflow-hidden group-hover:shadow-xl transition-all ${
              accent === "red"
                ? "bg-gradient-to-br from-red-500/15 to-red-400/5 group-hover:from-red-500/25 group-hover:to-red-400/10"
                : "bg-gradient-to-br from-foreground/10 to-foreground/5"
            }`}
            whileHover={{ rotate: [0, -5, 5, -5, 0], scale: 1.1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
              transition={{ duration: 0.6, delay: delay + 0.2, type: "spring" }}
            >
              <Icon className={`h-8 w-8 relative z-10 ${accent === "red" ? "text-red-500" : ""}`} />
            </motion.div>

            {/* Shine effect */}
            <motion.div
              className={`absolute inset-0 bg-gradient-to-r from-transparent to-transparent ${
                accent === "red" ? "via-red-500/30" : "via-white/20"
              }`}
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.6 }}
            />
          </motion.div>

          <CardTitle className="text-xl mb-3 group-hover:text-foreground/80 transition-colors">
            {title}
          </CardTitle>
          <CardDescription className="leading-relaxed">
            {description}
          </CardDescription>
        </CardHeader>
      </Card>
    </motion.div>
  )
}

// Magnetic Button Component
function MagneticButton({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return
    const { clientX, clientY } = e
    const { left, top, width, height } = ref.current.getBoundingClientRect()
    const x = clientX - (left + width / 2)
    const y = clientY - (top + height / 2)
    setPosition({ x: x * 0.3, y: y * 0.3 })
  }

  const reset = () => {
    setPosition({ x: 0, y: 0 })
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
    >
      {children}
    </motion.div>
  )
}
