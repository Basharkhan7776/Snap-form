import { NextRequest, NextResponse } from "next/server"
import Razorpay from "razorpay"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { PLAN_PRICES, isUpgradeablePlan } from "@/lib/constants"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(request: NextRequest) {
  try {
    // Get session
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { plan } = await request.json()

    if (!plan || !isUpgradeablePlan(plan)) {
      return NextResponse.json({ success: false, error: "Invalid plan" }, { status: 400 })
    }

    const amount = PLAN_PRICES[plan]

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: session.user.id,
        plan,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    })
  } catch (error) {
    console.error("Create order error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 }
    )
  }
}
