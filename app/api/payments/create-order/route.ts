import { NextRequest, NextResponse } from "next/server"
import Razorpay from "razorpay"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

const PLAN_PRICES = {
  PREMIUM: 999, // ₹999 in paise (9.99 INR)
  BUSINESS: 2999, // ₹2999 in paise (29.99 INR)
}

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

    if (!plan || !["PREMIUM", "BUSINESS"].includes(plan)) {
      return NextResponse.json({ success: false, error: "Invalid plan" }, { status: 400 })
    }

    const amount = PLAN_PRICES[plan as keyof typeof PLAN_PRICES]

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
