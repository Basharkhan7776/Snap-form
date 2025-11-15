"use client"

import { useState } from "react"
import Script from "next/script"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/lib/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { Check } from "lucide-react"

declare global {
  interface Window {
    Razorpay: any
  }
}

const tiers = [
  {
    name: "FREE",
    displayName: "Free",
    price: "₹0",
    features: ["Up to 3 forms", "100 responses/month", "Basic analytics", "Community support"],
  },
  {
    name: "PREMIUM",
    displayName: "Premium",
    price: "₹999",
    priceAmount: 999,
    features: [
      "Unlimited forms",
      "10,000 responses/month",
      "Advanced analytics",
      "Google Sheets export",
      "Priority support",
    ],
  },
  {
    name: "BUSINESS",
    displayName: "Business",
    price: "₹2,999",
    priceAmount: 2999,
    features: [
      "Everything in Premium",
      "Unlimited responses",
      "Team collaboration",
      "Custom branding",
      "API access",
      "SLA & dedicated support",
    ],
  },
]

function ProfileContent() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [processing, setProcessing] = useState<string | null>(null)

  const currentPlan = user?.plan || "FREE"

  async function handleUpgrade(plan: string, amount: number) {
    try {
      setProcessing(plan)

      // Create order
      const orderResponse = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      })

      const orderData = await orderResponse.json()

      if (!orderData.success) {
        throw new Error(orderData.error || "Failed to create order")
      }

      // Initialize Razorpay
      const options = {
        key: orderData.data.keyId,
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: "Snap-form",
        description: `Upgrade to ${plan}`,
        order_id: orderData.data.orderId,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan,
              }),
            })

            const verifyData = await verifyResponse.json()

            if (verifyData.success) {
              toast({
                title: "Payment successful!",
                description: `You have been upgraded to ${plan}.`,
              })
              // Reload to update user session
              window.location.reload()
            } else {
              throw new Error(verifyData.error || "Payment verification failed")
            }
          } catch (error) {
            console.error("Verification error:", error)
            toast({
              title: "Verification failed",
              description: "Payment was successful but verification failed. Contact support.",
              variant: "destructive",
            })
          }
        },
        prefill: {
          email: user?.email,
          name: user?.name,
        },
        theme: {
          color: "#000000",
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()

      razorpay.on("payment.failed", function (response: any) {
        toast({
          title: "Payment failed",
          description: response.error.description,
          variant: "destructive",
        })
      })
    } catch (error) {
      console.error("Payment error:", error)
      toast({
        title: "Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessing(null)
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold mb-2">Plans & Billing</h1>
            <p className="text-muted-foreground">
              Current plan: <Badge variant="secondary">{currentPlan}</Badge>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((tier) => {
              const isCurrentPlan = currentPlan === tier.name
              const isPaidPlan = tier.name !== "FREE"
              const canUpgrade = !isCurrentPlan && tier.name !== "FREE"

              return (
                <Card
                  key={tier.name}
                  className={`flex flex-col ${isCurrentPlan ? "border-primary" : ""}`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{tier.displayName}</CardTitle>
                      {isCurrentPlan && <Badge>Current</Badge>}
                    </div>
                    <CardDescription className="text-2xl font-bold">{tier.price}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col gap-3">
                    <ul className="space-y-2 flex-1">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="pt-4">
                      {isCurrentPlan ? (
                        <Button className="w-full" variant="secondary" disabled>
                          Current Plan
                        </Button>
                      ) : canUpgrade ? (
                        <Button
                          className="w-full"
                          onClick={() => handleUpgrade(tier.name, tier.priceAmount!)}
                          disabled={processing === tier.name}
                        >
                          {processing === tier.name ? "Processing..." : `Upgrade to ${tier.displayName}`}
                        </Button>
                      ) : (
                        <Button className="w-full" variant="outline" disabled>
                          {tier.name === "FREE" ? "Free Forever" : "Contact Sales"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  )
}
