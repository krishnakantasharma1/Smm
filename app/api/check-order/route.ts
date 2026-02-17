import { NextResponse } from "next/server"

// Called by the frontend when Razorpay modal closes unexpectedly
// Checks Razorpay directly if the payment was actually captured
// Also returns order notes so the client can recover full order details
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

    const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`

    // Fetch the order itself to get notes (order details stored at creation time)
    const orderRes = await fetch(`https://api.razorpay.com/v1/orders/${orderId}`, {
      headers: { Authorization: authHeader },
    })

    let orderNotes: Record<string, string> = {}
    if (orderRes.ok) {
      const orderData = await orderRes.json()
      orderNotes = orderData.notes || {}
    }

    // Fetch payments for this order from Razorpay
    const res = await fetch(`https://api.razorpay.com/v1/orders/${orderId}/payments`, {
      headers: { Authorization: authHeader },
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
        // Return order details from notes for recovery
        orderDetails: {
          platform: orderNotes.platform || "",
          category: orderNotes.category || "",
          service: orderNotes.service || "",
          link: orderNotes.link || "",
          quantity: orderNotes.quantity || "",
          email: orderNotes.email || "",
          contact: orderNotes.contact || "",
          totalPrice: orderNotes.total_price ? Number(orderNotes.total_price) : captured.amount / 100,
          deviceId: orderNotes.device_id || "",
        },
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
      orderDetails: {
        platform: orderNotes.platform || "",
        category: orderNotes.category || "",
        service: orderNotes.service || "",
        link: orderNotes.link || "",
        quantity: orderNotes.quantity || "",
        email: orderNotes.email || "",
        contact: orderNotes.contact || "",
        totalPrice: orderNotes.total_price ? Number(orderNotes.total_price) : 0,
        deviceId: orderNotes.device_id || "",
      },
    })
  } catch (err) {
    console.error("[check-order] Error:", err)
    return NextResponse.json({ captured: false, error: "Server error" }, { status: 500 })
  }
}

