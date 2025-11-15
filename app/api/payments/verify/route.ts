import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { isUpgradeablePlan } from "@/lib/constants"

export async function POST(request: NextRequest) {
  try {
    // Get session
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = await request.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !plan) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Validate plan
    if (!isUpgradeablePlan(plan)) {
      return NextResponse.json({ success: false, error: "Invalid plan" }, { status: 400 })
    }

    // Verify signature
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`)
    const generatedSignature = hmac.digest("hex")

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 400 })
    }

    // Update user plan
    await prisma.user.update({
      where: { id: session.user.id },
      data: { plan },
    })

    return NextResponse.json({
      success: true,
      message: "Payment verified and plan upgraded successfully",
    })
  } catch (error) {
    console.error("Verify payment error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to verify payment" },
      { status: 500 }
    )
  }
}
