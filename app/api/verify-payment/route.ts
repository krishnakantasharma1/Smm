import { NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      orderDetails,
    } = await request.json()

    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keySecret) {
      return NextResponse.json(
        { success: false, error: "Payment gateway not configured" },
        { status: 500 }
      )
    }

    // Verify signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body)
      .digest("hex")

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, error: "Invalid payment signature" },
        { status: 400 }
      )
    }

    // Send order details to email
    const emailBody = `
New Order Received!
====================

Payment ID: ${razorpay_payment_id}
Order ID: ${razorpay_order_id}

Order Details:
- Platform: ${orderDetails.platform}
- Category: ${orderDetails.category}
- Service: ${orderDetails.service}
- Link: ${orderDetails.link}
- Quantity: ${orderDetails.quantity}
- Total Price: Rs.${orderDetails.totalPrice}

Customer Details:
- Email: ${orderDetails.email}
- Contact: ${orderDetails.contact}

Date: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
    `.trim()

    // Send email via Razorpay / fallback: log for now, use a proper email service
    // For production, integrate with an email API (e.g., Resend, SendGrid, etc.)
    console.log("=== NEW ORDER ===")
    console.log(emailBody)
    console.log("=================")

    // Try to send email notification
    try {
      await sendOrderEmail(orderDetails, razorpay_payment_id, razorpay_order_id)
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError)
      // Don't fail the payment verification if email fails
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

async function sendOrderEmail(
  orderDetails: {
    platform: string
    category: string
    service: string
    link: string
    quantity: string
    totalPrice: number
    email: string
    contact: string
  },
  paymentId: string,
  orderId: string
) {
  const RECIPIENT_EMAIL = "htgstudio0@gmail.com"

  // If you have a Resend API key set up, use it
  const resendKey = process.env.RESEND_API_KEY
  if (resendKey) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: "orders@htgstudio.com",
        to: RECIPIENT_EMAIL,
        subject: `New Order - ${orderDetails.platform} | ${orderDetails.category}`,
        text: `
New Order Received!

Payment ID: ${paymentId}
Order ID: ${orderId}

Platform: ${orderDetails.platform}
Category: ${orderDetails.category}
Service: ${orderDetails.service}
Link: ${orderDetails.link}
Quantity: ${orderDetails.quantity}
Total Price: Rs.${orderDetails.totalPrice}

Customer Email: ${orderDetails.email}
Customer Contact: ${orderDetails.contact}

Date: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
        `.trim(),
      }),
    })
  }
}
