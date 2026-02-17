import { NextResponse } from "next/server"

// Called by the frontend when Razorpay modal closes unexpectedly
// Checks Razorpay directly if the payment was actually captured
export async function POST(request: Request) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 })
    }

    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Not configured" }, { status: 500 })
    }

    // Fetch payments for this order from Razorpay
    const res = await fetch(`https://api.razorpay.com/v1/orders/${orderId}/payments`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      },
    })

    if (!res.ok) {
      const err = await res.json()
      console.error("[check-order] Razorpay error:", err)
      return NextResponse.json({ captured: false, error: err.error?.description }, { status: 200 })
    }

    const data = await res.json()
    const payments = data.items || []

    // Find a captured payment
    const captured = payments.find(
      (p: { status: string; order_id: string }) => p.status === "captured"
    )

    if (captured) {
      return NextResponse.json({
        captured: true,
        paymentId: captured.id,
        orderId: captured.order_id,
        amount: captured.amount / 100,
      })
    }

    // Check if any payment is authorized (captured will follow via webhook)
    const authorized = payments.find(
      (p: { status: string }) => p.status === "authorized"
    )

    return NextResponse.json({
      captured: false,
      authorized: !!authorized,
      totalPayments: payments.length,
    })
  } catch (err) {
    console.error("[check-order] Error:", err)
    return NextResponse.json({ captured: false, error: "Server error" }, { status: 500 })
  }
}
