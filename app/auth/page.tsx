"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FcGoogle } from "react-icons/fc"
import { useToast } from "@/hooks/use-toast"
import { signIn } from "@/lib/auth-client"
import { useAuth } from "@/lib/hooks/use-auth"

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { isAuthenticated, isLoading } = useAuth()
  const [signingIn, setSigningIn] = useState(false)

  const redirect = searchParams.get("redirect") || "/dashboard"

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push(redirect)
    }
  }, [isAuthenticated, isLoading, router, redirect])

  const handleGoogleSignIn = async () => {
    try {
      setSigningIn(true)

      await signIn.social({
        provider: "google",
        callbackURL: redirect,
      })

      // BetterAuth will handle the redirect
    } catch (error) {
      console.error("Sign-in error:", error)
      toast({
        title: "Sign-in failed",
        description: "Could not sign in with Google. Please try again.",
        variant: "destructive",
      })
      setSigningIn(false)
    }
  }

  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-center">Sign in to Snap-form</CardTitle>
          <CardDescription className="text-center">
            Use your Google account to create and manage forms
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button
            variant="secondary"
            className="gap-2"
            onClick={handleGoogleSignIn}
            disabled={signingIn}
          >
            {signingIn ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Signing in...
              </>
            ) : (
              <>
                <FcGoogle className="h-5 w-5" />
                Get started with Google
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
