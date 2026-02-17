"use client"

import { useEffect, useState } from "react"
import { Package, CheckCircle, IndianRupee, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Order {
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
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("htg_orders") || "[]")
      setOrders(stored)
    } catch {
      setOrders([])
    }
    setLoaded(true)
  }, [])

  if (!loaded) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
          <Package className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="mb-3 text-2xl font-bold text-foreground">No orders yet</h1>
        <p className="mb-8 text-muted-foreground">
          Orders you place will appear here automatically on this device.
        </p>
        <Link href="/">
          <Button size="lg">Place Your First Order</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">My Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {orders.length} order{orders.length !== 1 ? "s" : ""} on this device
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {orders.map((order) => {
          const date = new Date(order.placedAt)
          const dateStr = date.toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })

          return (
            <div
              key={order.id}
              className="rounded-xl border border-border bg-card p-5 shadow-sm"
            >
              {/* Header */}
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-green-500/10">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {order.platform} — {order.category}
                    </p>
                    <p className="text-xs text-muted-foreground">{dateStr}</p>
                  </div>
                </div>
                <span className="flex-shrink-0 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-500">
                  ✅ Order Placed
                </span>
              </div>

              {/* Service */}
              <div className="mb-3 rounded-lg bg-muted/50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Service</p>
                <p className="text-sm text-foreground leading-snug">{order.service}</p>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-3 mb-3 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-muted-foreground">Quantity</p>
                  <p className="text-sm font-medium text-foreground">{order.quantity}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Paid</p>
                  <p className="flex items-center text-sm font-bold text-primary">
                    <IndianRupee className="h-3 w-3" />
                    {order.totalPrice}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Link</p>
                  <a
                    href={order.link.startsWith("http") ? order.link : `https://${order.link}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{order.link}</span>
                  </a>
                </div>
              </div>

              {/* Payment ID */}
              <div className="border-t border-border pt-3">
                <p className="text-xs text-muted-foreground font-mono">
                  <span className="text-muted-foreground/60">Payment ID: </span>
                  {order.paymentId}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Info box */}
      <div className="mt-8 rounded-lg border border-border bg-muted/30 p-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <CheckCircle className="h-4 w-4 text-primary" />
          <p className="text-sm font-medium text-foreground">Orders saved on this device</p>
        </div>
        <p className="text-xs text-muted-foreground">
          Your order history is stored in this browser. For any issues, contact us with your Payment ID at htgstudio0@gmail.com
        </p>
      </div>

      <div className="mt-4 text-center">
        <Link href="/">
          <Button variant="outline">Place Another Order</Button>
        </Link>
      </div>
    </div>
  )
}
