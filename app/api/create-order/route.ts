import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { amount } = body

    // Validate amount
    const parsedAmount = Number(amount)
    if (!amount || isNaN(parsedAmount) || parsedAmount < 20) {
      return NextResponse.json(
        { error: `Invalid amount (Rs.${parsedAmount || 0}). Minimum order value is Rs.20.` },
        { status: 400 }
      )
    }

    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
      console.error("[create-order] Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET")
      return NextResponse.json(
        { error: "Payment gateway is not configured. Please contact support at htgstudio0@gmail.com" },
        { status: 500 }
      )
    }

    const amountInPaise = Math.round(parsedAmount * 100)
    const receipt = `rcpt_${Date.now()}`

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt,
      }),
    })

    const order = await response.json()

    if (!response.ok) {
      console.error("[create-order] Razorpay API error:", order)
      return NextResponse.json(
        { error: order.error?.description || "Failed to create payment order. Please try again." },
        { status: response.status }
      )
    }

    if (!order.id) {
      console.error("[create-order] No order ID returned:", order)
      return NextResponse.json(
        { error: "Unexpected error creating order. Please try again." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      orderId: order.id,
      keyId: keyId,
      amount: order.amount,
    })
  } catch (err) {
    console.error("[create-order] Unhandled error:", err)
    return NextResponse.json(
      { error: "Server error while creating order. Please try again later." },
      { status: 500 }
    )
  }
}
