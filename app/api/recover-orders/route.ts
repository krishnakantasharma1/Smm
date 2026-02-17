import { NextResponse } from "next/server"

interface RazorpayPayment {
  id: string
  order_id: string
  amount: number
  status: string
  email?: string
  contact?: string
  method?: string
  created_at?: number
  notes?: Record<string, string>
}

interface RazorpayOrder {
  id: string
  amount: number
  status: string
  created_at: number
  notes: Record<string, string>
}

/**
 * Recovers orders for a user by checking Razorpay payments.
 * Accepts deviceId and/or email to find matching captured payments.
 * This is the safety net for when the browser closes during payment.
 */
export async function POST(request: Request) {
  try {
    const { deviceId, email } = await request.json()

    if (!deviceId && !email) {
      return NextResponse.json({ error: "Provide deviceId or email" }, { status: 400 })
    }

    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Not configured" }, { status: 500 })
    }

    const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`
    const recoveredOrders: Array<{
      id: string
      paymentId: string
      platform: string
      category: string
      service: string
      link: string
      quantity: string
      email: string
      contact: string
      totalPrice: number
      placedAt: string
    }> = []

    // Strategy 1: Search by device ID through recent orders
    // Razorpay doesn't support searching notes directly, so we fetch recent orders
    // and filter by device_id note. We check last 100 orders (last ~30 days).
    if (deviceId) {
      try {
        const ordersRes = await fetch(
          `https://api.razorpay.com/v1/orders?count=100&expand[]=payments`,
          { headers: { Authorization: authHeader } }
        )

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json()
          const orders: RazorpayOrder[] = ordersData.items || []

          for (const order of orders) {
            // Match by device ID in notes
            if (order.notes?.device_id === deviceId && order.status === "paid") {
              // Fetch payments for this order
              const paymentsRes = await fetch(
                `https://api.razorpay.com/v1/orders/${order.id}/payments`,
                { headers: { Authorization: authHeader } }
              )

              if (paymentsRes.ok) {
                const paymentsData = await paymentsRes.json()
                const captured = (paymentsData.items || []).find(
                  (p: RazorpayPayment) => p.status === "captured"
                )

                if (captured) {
                  recoveredOrders.push({
                    id: order.id,
                    paymentId: captured.id,
                    platform: order.notes.platform || "",
                    category: order.notes.category || "",
                    service: order.notes.service || "",
                    link: order.notes.link || "",
                    quantity: order.notes.quantity || "",
                    email: order.notes.email || "",
                    contact: order.notes.contact || "",
                    totalPrice: order.notes.total_price
                      ? Number(order.notes.total_price)
                      : order.amount / 100,
                    placedAt: new Date((order.created_at || 0) * 1000).toISOString(),
                  })
                }
              }
            }
          }
        }
      } catch (e) {
        console.error("[recover-orders] Device ID search error:", e)
      }
    }

    // Strategy 2: Search by email through recent payments
    if (email && recoveredOrders.length === 0) {
      try {
        const paymentsRes = await fetch(
          `https://api.razorpay.com/v1/payments?count=50`,
          { headers: { Authorization: authHeader } }
        )

        if (paymentsRes.ok) {
          const paymentsData = await paymentsRes.json()
          const payments: RazorpayPayment[] = paymentsData.items || []

          for (const payment of payments) {
            if (
              payment.status === "captured" &&
              payment.email?.toLowerCase() === email.toLowerCase()
            ) {
              // Fetch the order to get notes
              try {
                const orderRes = await fetch(
                  `https://api.razorpay.com/v1/orders/${payment.order_id}`,
                  { headers: { Authorization: authHeader } }
                )

                if (orderRes.ok) {
                  const order: RazorpayOrder = await orderRes.json()
                  const notes = order.notes || {}

                  // Only include if it has our notes (it's from our platform)
                  if (notes.platform || notes.service) {
                    recoveredOrders.push({
                      id: order.id,
                      paymentId: payment.id,
                      platform: notes.platform || "",
                      category: notes.category || "",
                      service: notes.service || "",
                      link: notes.link || "",
                      quantity: notes.quantity || "",
                      email: notes.email || payment.email || "",
                      contact: notes.contact || payment.contact || "",
                      totalPrice: notes.total_price
                        ? Number(notes.total_price)
                        : payment.amount / 100,
                      placedAt: new Date((order.created_at || 0) * 1000).toISOString(),
                    })
                  }
                }
              } catch {
                // Skip individual order fetch failures
              }
            }
          }
        }
      } catch (e) {
        console.error("[recover-orders] Email search error:", e)
      }
    }

    return NextResponse.json({
      orders: recoveredOrders,
      count: recoveredOrders.length,
    })
  } catch (err) {
    console.error("[recover-orders] Error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

