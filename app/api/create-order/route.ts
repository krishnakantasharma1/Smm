import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { amount } = body

    if (!amount || typeof amount !== "number" || amount < 20) {
      return NextResponse.json(
        { error: `Invalid amount (Rs.${amount || 0}). Minimum order value is Rs.20.` },
        { status: 400 }
      )
    }

    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
      console.error("Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET environment variables")
      return NextResponse.json(
        { error: "Payment gateway is not configured. Please contact support." },
        { status: 500 }
      )
    }

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency: "INR",
        receipt: `order_${Date.now()}`,
      }),
    })

    const order = await response.json()

    if (!response.ok) {
      console.error("Razorpay order creation failed:", order)
      return NextResponse.json(
        { error: order.error?.description || "Failed to create payment order. Please try again." },
        { status: response.status }
      )
    }

    return NextResponse.json({
      orderId: order.id,
      keyId: keyId,
      amount: order.amount,
    })
  } catch (err) {
    console.error("Create order error:", err)
    return NextResponse.json(
      { error: "Server error while creating order. Please try again later." },
      { status: 500 }
    )
  }
}

