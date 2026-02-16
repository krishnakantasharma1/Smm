import { NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-razorpay-signature")
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET

    if (!webhookSecret || !signature) {
      return NextResponse.json({ error: "Webhook not configured" }, { status: 400 })
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex")

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const event = JSON.parse(body)

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity
      console.log("Payment captured via webhook:", {
        id: payment.id,
        amount: payment.amount / 100,
        email: payment.email,
        contact: payment.contact,
      })
    }

    return NextResponse.json({ status: "ok" })
  } catch {
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
