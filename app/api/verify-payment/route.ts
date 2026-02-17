import { NextResponse } from "next/server"
import crypto from "crypto"
import nodemailer from "nodemailer"

const RECIPIENT_EMAIL = "htgstudio0@gmail.com"

interface OrderDetails {
  platform: string
  category: string
  service: string
  link: string
  quantity: string
  totalPrice: number
  email: string
  contact: string
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      orderDetails,
    } = body

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
      console.error("[verify-payment] Missing RAZORPAY_KEY_SECRET")
      return NextResponse.json(
        { success: false, error: "Payment gateway is not configured. Please contact support." },
        { status: 500 }
      )
    }

    // Verify Razorpay signature
    const signatureBody = `${razorpay_order_id}|${razorpay_payment_id}`
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(signatureBody)
      .digest("hex")

    if (expectedSignature !== razorpay_signature) {
      console.error("[verify-payment] Signature mismatch for order:", razorpay_order_id)
      return NextResponse.json(
        {
          success: false,
          error: `Payment signature verification failed. If money was deducted, contact support with payment ID: ${razorpay_payment_id}`,
        },
        { status: 400 }
      )
    }

    // IMPORTANT: await the email — do NOT fire-and-forget on Vercel
    // Vercel kills background tasks the moment the response is sent
    try {
      await sendOrderEmail(orderDetails as OrderDetails, razorpay_payment_id, razorpay_order_id)
    } catch (emailErr) {
      // Log but don't block the success response
      console.error("[verify-payment] Email failed:", emailErr)
    }

    // Send confirmation email to the customer via Brevo HTTP API
    // Wrapped in its own try/catch so it never affects the admin email or success response
    try {
      await sendCustomerConfirmationEmail(orderDetails as OrderDetails, razorpay_payment_id, razorpay_order_id)
    } catch (customerEmailErr) {
      console.error("[verify-payment] Customer confirmation email failed:", customerEmailErr)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[verify-payment] Unhandled error:", err)
    return NextResponse.json(
      { success: false, error: "Server error during payment verification. Please contact support." },
      { status: 500 }
    )
  }
}

async function sendOrderEmail(
  orderDetails: OrderDetails,
  paymentId: string,
  orderId: string
): Promise<void> {
  const dateStr = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })

  const subject = `New Order ✅ ${orderDetails.platform} | ${orderDetails.category} | Rs.${orderDetails.totalPrice}`

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <div style="background: #0066FF; padding: 16px 20px; border-radius: 6px 6px 0 0; margin: -20px -20px 20px;">
        <h2 style="color: #ffffff; margin: 0; font-size: 20px;">🛒 New Order Received!</h2>
      </div>
      <h3 style="color: #333; margin-top: 0;">Order Details</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr style="background: #f8f9fa;">
          <td style="padding: 10px 12px; font-weight: bold; border: 1px solid #dee2e6; width: 40%;">Payment ID</td>
          <td style="padding: 10px 12px; border: 1px solid #dee2e6; font-family: monospace;">${paymentId}</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; font-weight: bold; border: 1px solid #dee2e6;">Order ID</td>
          <td style="padding: 10px 12px; border: 1px solid #dee2e6; font-family: monospace;">${orderId}</td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 10px 12px; font-weight: bold; border: 1px solid #dee2e6;">Platform</td>
          <td style="padding: 10px 12px; border: 1px solid #dee2e6;">${orderDetails.platform}</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; font-weight: bold; border: 1px solid #dee2e6;">Category</td>
          <td style="padding: 10px 12px; border: 1px solid #dee2e6;">${orderDetails.category}</td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 10px 12px; font-weight: bold; border: 1px solid #dee2e6;">Service</td>
          <td style="padding: 10px 12px; border: 1px solid #dee2e6;">${orderDetails.service}</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; font-weight: bold; border: 1px solid #dee2e6;">Link</td>
          <td style="padding: 10px 12px; border: 1px solid #dee2e6;"><a href="${orderDetails.link}" style="color: #0066FF;">${orderDetails.link}</a></td>
        </tr>
        <tr style="background: #f8f9fa;">
          <td style="padding: 10px 12px; font-weight: bold; border: 1px solid #dee2e6;">Quantity</td>
          <td style="padding: 10px 12px; border: 1px solid #dee2e6;">${orderDetails.quantity}</td>
        </tr>
        <tr style="background: #e8f0fe;">
          <td style="padding: 10px 12px; font-weight: bold; border: 1px solid #dee2e6; color: #0066FF;">Total Paid</td>
          <td style="padding: 10px 12px; border: 1px solid #dee2e6; font-weight: bold; color: #0066FF; font-size: 16px;">Rs.${orderDetails.totalPrice}</td>
        </tr>
      </table>
      <h3 style="color: #333;">Customer Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="background: #f8f9fa;">
          <td style="padding: 10px 12px; font-weight: bold; border: 1px solid #dee2e6; width: 40%;">Email</td>
          <td style="padding: 10px 12px; border: 1px solid #dee2e6;"><a href="mailto:${orderDetails.email}" style="color: #0066FF;">${orderDetails.email}</a></td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; font-weight: bold; border: 1px solid #dee2e6;">Contact</td>
          <td style="padding: 10px 12px; border: 1px solid #dee2e6;">${orderDetails.contact}</td>
        </tr>
      </table>
      <p style="color: #888; margin-top: 20px; font-size: 12px; border-top: 1px solid #eee; padding-top: 12px;">
        Order received on: ${dateStr}<br/>HTG Studio — Social Media Growth Services
      </p>
    </div>
  `

  const textContent = `
NEW ORDER RECEIVED — HTG Studio
================================
Payment ID : ${paymentId}
Order ID   : ${orderId}
Date       : ${dateStr}

SERVICE INFO
------------
Platform   : ${orderDetails.platform}
Category   : ${orderDetails.category}
Service    : ${orderDetails.service}
Link       : ${orderDetails.link}
Quantity   : ${orderDetails.quantity}
Total Paid : Rs.${orderDetails.totalPrice}

CUSTOMER
--------
Email      : ${orderDetails.email}
Contact    : ${orderDetails.contact}
  `.trim()

  console.log("[sendOrderEmail] Attempting to send email for payment:", paymentId)

  // ── OPTION 1: Resend API (works on Vercel) ──
  const resendKey = process.env.RESEND_API_KEY
  console.log("[sendOrderEmail] RESEND_API_KEY present:", !!resendKey)

  if (resendKey) {
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: RECIPIENT_EMAIL,
        subject,
        html: htmlContent,
        text: textContent,
      }),
    })

    const resendData = await resendRes.json()
    console.log("[sendOrderEmail] Resend response:", resendRes.status, JSON.stringify(resendData))

    if (resendRes.ok) {
      console.log("[sendOrderEmail] ✅ Sent via Resend to", RECIPIENT_EMAIL)
      return
    } else {
      console.error("[sendOrderEmail] ❌ Resend failed:", resendData)
    }
  }

  // ── OPTION 2: Gmail SMTP (works locally) ──
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS
  console.log("[sendOrderEmail] SMTP_USER present:", !!smtpUser)

  if (smtpUser && smtpPass) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: smtpUser, pass: smtpPass },
      pool: false,
    })
    await transporter.sendMail({
      from: `"HTG Studio Orders" <${smtpUser}>`,
      to: RECIPIENT_EMAIL,
      subject,
      text: textContent,
      html: htmlContent,
    })
    console.log("[sendOrderEmail] ✅ Sent via Gmail SMTP to", RECIPIENT_EMAIL)
    return
  }

  console.warn("[sendOrderEmail] ⚠️ No email service available. Order logged to console only.")
}

// ─────────────────────────────────────────────────────────────────────
// Customer Confirmation Email via Brevo HTTP API (port 443, never blocked)
// ─────────────────────────────────────────────────────────────────────
async function sendCustomerConfirmationEmail(
  orderDetails: OrderDetails,
  paymentId: string,
  orderId: string
): Promise<void> {
  const brevoApiKey = process.env.BREVO_API_KEY
  if (!brevoApiKey) {
    console.warn("[sendCustomerEmail] BREVO_API_KEY not set — skipping customer email")
    return
  }

  if (!orderDetails.email) {
    console.warn("[sendCustomerEmail] No customer email address — skipping")
    return
  }

  const dateStr = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })

  const subject = `Order Confirmed — SSM Reselling | ${orderDetails.platform} - ${orderDetails.category}`

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <!-- Header -->
      <div style="background: #0066FF; padding: 24px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700;">SSM Reselling</h1>
        <p style="color: #cce0ff; margin: 6px 0 0; font-size: 13px;">Social Media Growth Services</p>
      </div>

      <!-- Body -->
      <div style="padding: 24px 20px;">
        <div style="background: #e6f4ea; border: 1px solid #b7dfbf; border-radius: 6px; padding: 14px 16px; margin-bottom: 20px; text-align: center;">
          <h2 style="color: #1a7f37; margin: 0; font-size: 18px;">Order Confirmed</h2>
          <p style="color: #2d6a3f; margin: 6px 0 0; font-size: 14px;">Your payment was successful and your order has been placed.</p>
        </div>

        <p style="color: #333; font-size: 14px; line-height: 1.6; margin: 0 0 18px;">
          Hi there,<br/>
          Thank you for your order! We have received your payment and your order is now being processed. We will get back to you soon with an update.
        </p>

        <!-- Order Summary -->
        <h3 style="color: #333; font-size: 15px; margin: 0 0 10px; border-bottom: 2px solid #0066FF; padding-bottom: 6px;">Order Summary</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr style="background: #f8f9fa;">
            <td style="padding: 10px 12px; font-weight: bold; border: 1px solid #dee2e6; width: 40%; font-size: 13px; color: #555;">Platform</td>
            <td style="padding: 10px 12px; border: 1px solid #dee2e6; font-size: 13px; color: #333;">${orderDetails.platform}</td>
          </tr>
          <tr>
            <td style="padding: 10px 12px; font-weight: bold; border: 1px solid #dee2e6; font-size: 13px; color: #555;">Category</td>
            <td style="padding: 10px 12px; border: 1px solid #dee2e6; font-size: 13px; color: #333;">${orderDetails.category}</td>
          </tr>
          <tr style="background: #f8f9fa;">
            <td style="padding: 10px 12px; font-weight: bold; border: 1px solid #dee2e6; font-size: 13px; color: #555;">Service</td>
            <td style="padding: 10px 12px; border: 1px solid #dee2e6; font-size: 13px; color: #333;">${orderDetails.service}</td>
          </tr>
          <tr>
            <td style="padding: 10px 12px; font-weight: bold; border: 1px solid #dee2e6; font-size: 13px; color: #555;">Quantity</td>
            <td style="padding: 10px 12px; border: 1px solid #dee2e6; font-size: 13px; color: #333;">${orderDetails.quantity}</td>
          </tr>
          <tr style="background: #e8f0fe;">
            <td style="padding: 10px 12px; font-weight: bold; border: 1px solid #dee2e6; font-size: 13px; color: #0066FF;">Total Paid</td>
            <td style="padding: 10px 12px; border: 1px solid #dee2e6; font-weight: bold; color: #0066FF; font-size: 15px;">Rs.${orderDetails.totalPrice}</td>
          </tr>
        </table>

        <!-- Reference IDs -->
        <h3 style="color: #333; font-size: 15px; margin: 0 0 10px; border-bottom: 2px solid #0066FF; padding-bottom: 6px;">Payment Reference</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr style="background: #f8f9fa;">
            <td style="padding: 10px 12px; font-weight: bold; border: 1px solid #dee2e6; width: 40%; font-size: 13px; color: #555;">Payment ID</td>
            <td style="padding: 10px 12px; border: 1px solid #dee2e6; font-size: 13px; color: #333; font-family: monospace;">${paymentId}</td>
          </tr>
          <tr>
            <td style="padding: 10px 12px; font-weight: bold; border: 1px solid #dee2e6; font-size: 13px; color: #555;">Order ID</td>
            <td style="padding: 10px 12px; border: 1px solid #dee2e6; font-size: 13px; color: #333; font-family: monospace;">${orderId}</td>
          </tr>
          <tr style="background: #f8f9fa;">
            <td style="padding: 10px 12px; font-weight: bold; border: 1px solid #dee2e6; font-size: 13px; color: #555;">Date</td>
            <td style="padding: 10px 12px; border: 1px solid #dee2e6; font-size: 13px; color: #333;">${dateStr}</td>
          </tr>
        </table>

        <!-- Support Note -->
        <div style="background: #f8f9fa; border-radius: 6px; padding: 14px 16px; margin-bottom: 10px;">
          <p style="color: #555; font-size: 13px; line-height: 1.6; margin: 0;">
            If you have any questions about your order, feel free to reach out to us at
            <a href="mailto:htgstudio0@gmail.com" style="color: #0066FF; text-decoration: none;">htgstudio0@gmail.com</a>.
            Please include your Payment ID for faster assistance.
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div style="background: #f1f3f5; padding: 16px 20px; text-align: center; border-top: 1px solid #e0e0e0;">
        <p style="color: #888; font-size: 12px; margin: 0;">SSM Reselling — Social Media Growth Services</p>
        <p style="color: #aaa; font-size: 11px; margin: 4px 0 0;">This is an automated confirmation. Please do not reply to this email.</p>
      </div>
    </div>
  `

  const textContent = `
ORDER CONFIRMED — SSM Reselling
================================

Hi there,
Thank you for your order! We have received your payment and your order is now being processed. We will get back to you soon with an update.

ORDER SUMMARY
-------------
Platform   : ${orderDetails.platform}
Category   : ${orderDetails.category}
Service    : ${orderDetails.service}
Quantity   : ${orderDetails.quantity}
Total Paid : Rs.${orderDetails.totalPrice}

PAYMENT REFERENCE
-----------------
Payment ID : ${paymentId}
Order ID   : ${orderId}
Date       : ${dateStr}

If you have any questions, contact us at htgstudio0@gmail.com with your Payment ID.

SSM Reselling — Social Media Growth Services
  `.trim()

  console.log("[sendCustomerEmail] Sending confirmation to:", orderDetails.email)

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "content-type": "application/json",
      "api-key": brevoApiKey,
    },
    body: JSON.stringify({
      sender: { name: "SSM Reselling", email: "krishnakantasharma297@gmail.com" },
      to: [{ email: orderDetails.email }],
      subject,
      htmlContent,
      textContent,
    }),
  })

  const data = await res.json()

  if (res.ok) {
    console.log("[sendCustomerEmail] Sent via Brevo to", orderDetails.email, "messageId:", data.messageId)
  } else {
    console.error("[sendCustomerEmail] Brevo API error:", res.status, JSON.stringify(data))
    throw new Error(`Brevo API returned ${res.status}: ${JSON.stringify(data)}`)
  }
}

