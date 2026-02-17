import { NextResponse } from "next/server"
import crypto from "crypto"
import nodemailer from "nodemailer"

const RECIPIENT_EMAIL = "htgstudio0@gmail.com"

export async function POST(request: Request) {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      orderDetails,
    } = await request.json()

    // Validate required fields
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: "Missing payment details. Please contact support." },
        { status: 400 }
      )
    }

    if (!orderDetails) {
      return NextResponse.json(
        { success: false, error: "Missing order details. Please contact support." },
        { status: 400 }
      )
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keySecret) {
      console.error("Missing RAZORPAY_KEY_SECRET environment variable")
      return NextResponse.json(
        { success: false, error: "Payment gateway is not configured. Please contact support." },
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
      console.error("Payment signature mismatch:", { razorpay_order_id, razorpay_payment_id })
      return NextResponse.json(
        { success: false, error: "Payment signature verification failed. If money was deducted, please contact support with your payment ID: " + razorpay_payment_id },
        { status: 400 }
      )
    }

    // Payment verified - send email in background (don't block the response)
    sendOrderEmail(orderDetails, razorpay_payment_id, razorpay_order_id).catch((emailError) => {
      console.error("Failed to send email notification:", emailError)
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Verify payment error:", err)
    return NextResponse.json(
      { success: false, error: "Server error during payment verification. Please contact support." },
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
  const dateStr = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #0066FF; border-bottom: 2px solid #0066FF; padding-bottom: 10px;">New Order Received!</h2>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <tr style="background: #f8f9fa;">
          <td style="padding: 10px; font-weight: bold; border: 1px solid #dee2e6;">Payment ID</td>
          <td style="padding: 10px; border: 1px solid #dee2e6;">${paymentId}</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold; border: 1px solid #dee2e6;">Order ID</td>
          <td style="padding: 10px; border: 1px solid #dee2e6;">${orderId}</td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 10px; font-weight: bold; border: 1px solid #dee2e6;">Platform</td>
          <td style="padding: 10px; border: 1px solid #dee2e6;">${orderDetails.platform}</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold; border: 1px solid #dee2e6;">Category</td>
          <td style="padding: 10px; border: 1px solid #dee2e6;">${orderDetails.category}</td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 10px; font-weight: bold; border: 1px solid #dee2e6;">Service</td>
          <td style="padding: 10px; border: 1px solid #dee2e6;">${orderDetails.service}</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold; border: 1px solid #dee2e6;">Link</td>
          <td style="padding: 10px; border: 1px solid #dee2e6;"><a href="${orderDetails.link}">${orderDetails.link}</a></td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 10px; font-weight: bold; border: 1px solid #dee2e6;">Quantity</td>
          <td style="padding: 10px; border: 1px solid #dee2e6;">${orderDetails.quantity}</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold; border: 1px solid #dee2e6; color: #0066FF;">Total Price</td>
          <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold; color: #0066FF;">Rs.${orderDetails.totalPrice}</td>
        </tr>
      </table>

      <h3 style="color: #333; margin-top: 20px;">Customer Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="background: #f8f9fa;">
          <td style="padding: 10px; font-weight: bold; border: 1px solid #dee2e6;">Email</td>
          <td style="padding: 10px; border: 1px solid #dee2e6;"><a href="mailto:${orderDetails.email}">${orderDetails.email}</a></td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold; border: 1px solid #dee2e6;">Contact</td>
          <td style="padding: 10px; border: 1px solid #dee2e6;">${orderDetails.contact}</td>
        </tr>
      </table>

      <p style="color: #666; margin-top: 15px; font-size: 13px;">Order placed on: ${dateStr}</p>
    </div>
  `

  const textContent = `
New Order Received!
====================
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

Date: ${dateStr}
  `.trim()

  // Log order details to console as backup
  console.log("=== NEW ORDER ===")
  console.log(textContent)
  console.log("=================")

  // Try sending via Nodemailer with Gmail SMTP
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS

  if (smtpUser && smtpPass) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })

    await transporter.sendMail({
      from: `"HTG Studio Orders" <${smtpUser}>`,
      to: RECIPIENT_EMAIL,
      subject: `New Order - ${orderDetails.platform} | ${orderDetails.category} | Rs.${orderDetails.totalPrice}`,
      text: textContent,
      html: htmlContent,
    })

    console.log("Order email sent successfully to", RECIPIENT_EMAIL)
    return
  }

  // Fallback: Try Resend API
  const resendKey = process.env.RESEND_API_KEY
  if (resendKey) {
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: "orders@htgstudio.com",
        to: RECIPIENT_EMAIL,
        subject: `New Order - ${orderDetails.platform} | ${orderDetails.category} | Rs.${orderDetails.totalPrice}`,
        html: htmlContent,
        text: textContent,
      }),
    })

    if (!resendRes.ok) {
      const resendError = await resendRes.text()
      console.error("Resend API error:", resendError)
    } else {
      console.log("Order email sent via Resend to", RECIPIENT_EMAIL)
    }
    return
  }

  console.warn("No email service configured (SMTP_USER/SMTP_PASS or RESEND_API_KEY). Order details logged to console only.")
}

