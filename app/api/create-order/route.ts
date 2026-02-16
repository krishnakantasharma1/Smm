import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { amount } = await request.json()

    if (!amount || amount < 20) {
      return NextResponse.json(
        { error: "Invalid amount. Minimum order is Rs.20" },
        { status: 400 }
      )
    }

    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Payment gateway not configured" },
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
      return NextResponse.json(
        { error: order.error?.description || "Failed to create order" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      orderId: order.id,
      keyId: keyId,
      amount: order.amount,
    })
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
