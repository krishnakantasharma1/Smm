import { NextResponse } from "next/server"
import crypto from "crypto"
import nodemailer from "nodemailer"

const RECIPIENT_EMAIL = "htgstudio0@gmail.com"

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

    // ── payment.captured: the most important event ──
    // This fires even if the user closed the popup or switched to UPI app
    if (event.event === "payment.captured") {
      const payment = event.payload?.payment?.entity
      if (payment) {
        console.log("[webhook] Payment captured:", {
          id: payment.id,
          amount: payment.amount / 100,
          email: payment.email,
          contact: payment.contact,
          order_id: payment.order_id,
          method: payment.method,
        })

        // Fetch order details from Razorpay notes (we stored them at creation time)
        let orderNotes: Record<string, string> = {}
        try {
          const keyId = process.env.RAZORPAY_KEY_ID
          const keySecret = process.env.RAZORPAY_KEY_SECRET
          if (keyId && keySecret && payment.order_id) {
            const orderRes = await fetch(
              `https://api.razorpay.com/v1/orders/${payment.order_id}`,
              {
                headers: {
                  Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
                },
              }
            )
            if (orderRes.ok) {
              const orderData = await orderRes.json()
              orderNotes = orderData.notes || {}
            }
          }
        } catch (e) {
          console.error("[webhook] Failed to fetch order notes:", e)
        }

        // Send email notification with full order details from notes
        await sendWebhookEmail(payment, orderNotes)
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

async function sendWebhookEmail(
  payment: {
    id: string
    order_id: string
    amount: number
    email?: string
    contact?: string
    method?: string
    description?: string
  },
  orderNotes: Record<string, string>
) {
  const dateStr = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
  const amountRs = payment.amount / 100

  // Determine if we have full order details from notes
  const hasOrderDetails = !!(orderNotes.platform || orderNotes.service)

  const subject = hasOrderDetails
    ? `New Order (Webhook) | ${orderNotes.platform} | ${orderNotes.category} | Rs.${amountRs}`
    : `Payment Captured (Webhook) | Rs.${amountRs} | ${payment.id}`

  const orderDetailsHtml = hasOrderDetails
    ? `
      <tr style="background:#f8f9fa;"><td style="padding:10px 12px;font-weight:bold;border:1px solid #dee2e6;width:40%;">Platform</td><td style="padding:10px 12px;border:1px solid #dee2e6;">${orderNotes.platform || "N/A"}</td></tr>
      <tr><td style="padding:10px 12px;font-weight:bold;border:1px solid #dee2e6;">Category</td><td style="padding:10px 12px;border:1px solid #dee2e6;">${orderNotes.category || "N/A"}</td></tr>
      <tr style="background:#f8f9fa;"><td style="padding:10px 12px;font-weight:bold;border:1px solid #dee2e6;">Service</td><td style="padding:10px 12px;border:1px solid #dee2e6;">${orderNotes.service || "N/A"}</td></tr>
      <tr><td style="padding:10px 12px;font-weight:bold;border:1px solid #dee2e6;">Link</td><td style="padding:10px 12px;border:1px solid #dee2e6;"><a href="${orderNotes.link || "#"}" style="color:#0066FF;">${orderNotes.link || "N/A"}</a></td></tr>
      <tr style="background:#f8f9fa;"><td style="padding:10px 12px;font-weight:bold;border:1px solid #dee2e6;">Quantity</td><td style="padding:10px 12px;border:1px solid #dee2e6;">${orderNotes.quantity || "N/A"}</td></tr>
    `
    : ""

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <div style="background: #16a34a; padding: 16px 20px; border-radius: 6px 6px 0 0; margin: -20px -20px 20px;">
        <h2 style="color: #fff; margin: 0;">Payment Captured via Webhook</h2>
        <p style="color: #dcfce7; margin: 4px 0 0; font-size: 13px;">${hasOrderDetails ? "Full order details available" : "User may have closed popup - limited details"}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        <tr style="background:#f8f9fa;"><td style="padding:10px 12px;font-weight:bold;border:1px solid #dee2e6;width:40%;">Payment ID</td><td style="padding:10px 12px;border:1px solid #dee2e6;font-family:monospace;">${payment.id}</td></tr>
        <tr><td style="padding:10px 12px;font-weight:bold;border:1px solid #dee2e6;">Order ID</td><td style="padding:10px 12px;border:1px solid #dee2e6;font-family:monospace;">${payment.order_id}</td></tr>
        <tr style="background:#e8f0fe;"><td style="padding:10px 12px;font-weight:bold;border:1px solid #dee2e6;color:#0066FF;">Amount</td><td style="padding:10px 12px;border:1px solid #dee2e6;font-weight:bold;color:#0066FF;font-size:16px;">Rs.${amountRs}</td></tr>
        <tr><td style="padding:10px 12px;font-weight:bold;border:1px solid #dee2e6;">Payment Method</td><td style="padding:10px 12px;border:1px solid #dee2e6;">${payment.method || "N/A"}</td></tr>
        ${orderDetailsHtml}
        <tr style="background:#f8f9fa;"><td style="padding:10px 12px;font-weight:bold;border:1px solid #dee2e6;">Customer Email</td><td style="padding:10px 12px;border:1px solid #dee2e6;">${orderNotes.email || payment.email || "N/A"}</td></tr>
        <tr><td style="padding:10px 12px;font-weight:bold;border:1px solid #dee2e6;">Customer Contact</td><td style="padding:10px 12px;border:1px solid #dee2e6;">${orderNotes.contact || payment.contact || "N/A"}</td></tr>
        ${orderNotes.device_id ? `<tr style="background:#f8f9fa;"><td style="padding:10px 12px;font-weight:bold;border:1px solid #dee2e6;">Device ID</td><td style="padding:10px 12px;border:1px solid #dee2e6;font-family:monospace;font-size:11px;">${orderNotes.device_id}</td></tr>` : ""}
      </table>
      <p style="color:#888;margin-top:16px;font-size:12px;">Received on: ${dateStr}</p>
    </div>
  `

  const orderDetailsText = hasOrderDetails
    ? `
Platform   : ${orderNotes.platform || "N/A"}
Category   : ${orderNotes.category || "N/A"}
Service    : ${orderNotes.service || "N/A"}
Link       : ${orderNotes.link || "N/A"}
Quantity   : ${orderNotes.quantity || "N/A"}
`
    : ""

  const textContent = `
PAYMENT CAPTURED VIA WEBHOOK — HTG Studio
==========================================
Payment ID  : ${payment.id}
Order ID    : ${payment.order_id}
Amount      : Rs.${amountRs}
Method      : ${payment.method || "N/A"}
${orderDetailsText}
Email       : ${orderNotes.email || payment.email || "N/A"}
Contact     : ${orderNotes.contact || payment.contact || "N/A"}
Device ID   : ${orderNotes.device_id || "N/A"}
Date        : ${dateStr}
  `.trim()

  console.log("[webhook] Sending email for captured payment:", payment.id)

  // Try Resend first (works on Vercel)
  const resendKey = process.env.RESEND_API_KEY
  if (resendKey) {
    const res = await fetch("https://api.resend.com/emails", {
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
    const data = await res.json()
    if (res.ok) {
      console.log("[webhook] Email sent via Resend:", data.id)
      return
    }
    console.error("[webhook] Resend failed:", data)
  }

  // Fallback: Gmail SMTP
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS
  if (smtpUser && smtpPass) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: smtpUser, pass: smtpPass },
    })
    await transporter.sendMail({
      from: `"HTG Studio Orders" <${smtpUser}>`,
      to: RECIPIENT_EMAIL,
      subject,
      text: textContent,
      html: htmlContent,
    })
    console.log("[webhook] Email sent via Gmail SMTP")
  }
}

