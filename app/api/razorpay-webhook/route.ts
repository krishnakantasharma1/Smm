import { NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-razorpay-signature")
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET

    if (!webhookSecret) {
      console.error("[webhook] RAZORPAY_WEBHOOK_SECRET not set")
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
    }

    if (!signature) {
      console.warn("[webhook] Missing x-razorpay-signature header")
      return NextResponse.json({ error: "Missing signature" }, { status: 400 })
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex")

    if (expectedSignature !== signature) {
      console.error("[webhook] Invalid signature received")
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const event = JSON.parse(body)
    console.log("[webhook] Event received:", event.event)

    if (event.event === "payment.captured") {
      const payment = event.payload?.payment?.entity
      if (payment) {
        console.log("[webhook] Payment captured:", {
          id: payment.id,
          amount: payment.amount / 100,
          email: payment.email,
          contact: payment.contact,
          order_id: payment.order_id,
        })
      }
    }

    if (event.event === "payment.failed") {
      const payment = event.payload?.payment?.entity
      if (payment) {
        console.warn("[webhook] Payment failed:", {
          id: payment.id,
          order_id: payment.order_id,
          error_description: payment.error_description,
        })
      }
    }

    return NextResponse.json({ status: "ok" })
  } catch (err) {
    console.error("[webhook] Processing error:", err)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
