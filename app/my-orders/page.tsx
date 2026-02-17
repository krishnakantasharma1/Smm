"use client"

import { useEffect, useState, useCallback } from "react"
import { Package, CheckCircle, IndianRupee, ExternalLink, RefreshCw, Search, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import Link from "next/link"
import { getDeviceId } from "@/lib/device-id"

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

interface PendingOrder {
  orderId: string
  platform: string
  category: string
  service: string
  link: string
  quantity: string
  email: string
  contact: string
  totalPrice: number
  deviceId: string
  createdAt: string
}

const ORDERS_KEY = "htg_orders"
const PENDING_ORDERS_KEY = "htg_pending_orders"

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([])
  const [loaded, setLoaded] = useState(false)
  const [recovering, setRecovering] = useState(false)
  const [recoverEmail, setRecoverEmail] = useState("")
  const [showRecovery, setShowRecovery] = useState(false)
  const [autoRecoveryDone, setAutoRecoveryDone] = useState(false)

  const loadOrders = useCallback(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]")
      setOrders(stored)
    } catch {
      setOrders([])
    }
    try {
      const pending = JSON.parse(localStorage.getItem(PENDING_ORDERS_KEY) || "[]")
      // Filter out expired (>24h)
      const valid = pending.filter((p: PendingOrder) => {
        const age = Date.now() - new Date(p.createdAt).getTime()
        return age < 24 * 60 * 60 * 1000
      })
      setPendingOrders(valid)
    } catch {
      setPendingOrders([])
    }
    setLoaded(true)
  }, [])

  // Check pending orders against Razorpay on mount
  const checkPendingOrders = useCallback(async () => {
    let pendingList: PendingOrder[] = []
    try {
      pendingList = JSON.parse(localStorage.getItem(PENDING_ORDERS_KEY) || "[]")
    } catch {
      return
    }

    if (pendingList.length === 0) return

    let updated = false

    for (const pending of pendingList) {
      try {
        const res = await fetch("/api/check-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: pending.orderId }),
        })
        const data = await res.json()

        if (data.captured) {
          // Move from pending to confirmed
          const details = data.orderDetails || {}
          const existingOrders = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]")
          const alreadyExists = existingOrders.some((o: Order) => o.id === pending.orderId)

          if (!alreadyExists) {
            existingOrders.unshift({
              id: pending.orderId,
              paymentId: data.paymentId || "via-recovery",
              platform: pending.platform || details.platform || "",
              category: pending.category || details.category || "",
              service: pending.service || details.service || "",
              link: pending.link || details.link || "",
              quantity: pending.quantity || details.quantity || "",
              email: pending.email || details.email || "",
              contact: pending.contact || details.contact || "",
              totalPrice: pending.totalPrice || details.totalPrice || data.amount || 0,
              placedAt: pending.createdAt || new Date().toISOString(),
            })
            localStorage.setItem(ORDERS_KEY, JSON.stringify(existingOrders))
            window.dispatchEvent(new Event("htg_orders_updated"))
            updated = true
          }

          // Remove from pending
          const remainingPending = JSON.parse(localStorage.getItem(PENDING_ORDERS_KEY) || "[]")
            .filter((p: PendingOrder) => p.orderId !== pending.orderId)
          localStorage.setItem(PENDING_ORDERS_KEY, JSON.stringify(remainingPending))
        }
      } catch {
        // Continue checking others
      }
    }

    if (updated) {
      toast.success("Recovered confirmed orders!")
      loadOrders()
    }
  }, [loadOrders])

  // Auto-recover using device ID on mount
  const autoRecoverByDeviceId = useCallback(async () => {
    try {
      const deviceId = getDeviceId()
      if (!deviceId) return

      const res = await fetch("/api/recover-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId }),
      })

      if (!res.ok) return
      const data = await res.json()

      if (data.orders && data.orders.length > 0) {
        const existingOrders: Order[] = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]")
        let added = 0

        for (const recovered of data.orders) {
          if (!existingOrders.some((o) => o.id === recovered.id)) {
            existingOrders.unshift(recovered)
            added++
          }
        }

        if (added > 0) {
          localStorage.setItem(ORDERS_KEY, JSON.stringify(existingOrders))
          window.dispatchEvent(new Event("htg_orders_updated"))
          loadOrders()
          toast.success(`Recovered ${added} order${added > 1 ? "s" : ""} from server!`)
        }
      }
    } catch {
      // Silent fail for auto-recovery
    }
    setAutoRecoveryDone(true)
  }, [loadOrders])

  useEffect(() => {
    loadOrders()
    checkPendingOrders()
    autoRecoverByDeviceId()
  }, [loadOrders, checkPendingOrders, autoRecoverByDeviceId])

  // Manual recovery by email
  const handleRecoverByEmail = async () => {
    if (!recoverEmail) {
      toast.error("Please enter your email address")
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(recoverEmail)) {
      toast.error("Please enter a valid email address")
      return
    }

    setRecovering(true)
    try {
      const deviceId = getDeviceId()
      const res = await fetch("/api/recover-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId, email: recoverEmail }),
      })

      if (!res.ok) {
        toast.error("Failed to recover orders. Please try again.")
        setRecovering(false)
        return
      }

      const data = await res.json()

      if (data.orders && data.orders.length > 0) {
        const existingOrders: Order[] = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]")
        let added = 0

        for (const recovered of data.orders) {
          if (!existingOrders.some((o) => o.id === recovered.id)) {
            existingOrders.unshift(recovered)
            added++
          }
        }

        if (added > 0) {
          localStorage.setItem(ORDERS_KEY, JSON.stringify(existingOrders))
          window.dispatchEvent(new Event("htg_orders_updated"))
          loadOrders()
          toast.success(`Recovered ${added} order${added > 1 ? "s" : ""}!`)
        } else {
          toast.info("All orders are already showing. No new orders found.")
        }
      } else {
        toast.info("No orders found for this email address.")
      }
    } catch {
      toast.error("Failed to recover orders. Please try again.")
    }
    setRecovering(false)
  }

  if (!loaded || !autoRecoveryDone) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    )
  }

  if (orders.length === 0 && pendingOrders.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
          <Package className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="mb-3 text-2xl font-bold text-foreground">No orders yet</h1>
        <p className="mb-8 text-muted-foreground">
          Orders you place will appear here automatically on this device.
        </p>

        {/* Recovery section for empty state */}
        <div className="mx-auto mb-8 max-w-sm rounded-xl border border-border bg-card p-6">
          <h3 className="mb-2 text-sm font-semibold text-foreground">Missing an order?</h3>
          <p className="mb-4 text-xs text-muted-foreground">
            If you paid but your order is not showing (browser closed, different device), enter your email to recover it.
          </p>
          <div className="flex flex-col gap-3">
            <Input
              type="email"
              value={recoverEmail}
              onChange={(e) => setRecoverEmail(e.target.value)}
              placeholder="Email used during payment"
              className="bg-background"
            />
            <Button
              onClick={handleRecoverByEmail}
              disabled={recovering}
              size="sm"
              variant="outline"
              className="w-full"
            >
              {recovering ? (
                <>
                  <RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-3.5 w-3.5" />
                  Recover Orders
                </>
              )}
            </Button>
          </div>
        </div>

        <Link href="/">
          <Button size="lg">Place Your First Order</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {orders.length} order{orders.length !== 1 ? "s" : ""} on this device
            {pendingOrders.length > 0 && (
              <span className="ml-1 text-amber-500">
                ({pendingOrders.length} pending)
              </span>
            )}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowRecovery(!showRecovery)}
          className="flex-shrink-0"
        >
          <Search className="mr-1.5 h-3.5 w-3.5" />
          Recover
        </Button>
      </div>

      {/* Recovery panel */}
      {showRecovery && (
        <div className="mb-6 rounded-xl border border-border bg-card p-5">
          <h3 className="mb-1 text-sm font-semibold text-foreground">Recover Missing Orders</h3>
          <p className="mb-3 text-xs text-muted-foreground">
            If you paid but your order is not showing (browser closed, app switched, different device), enter the email you used during payment.
          </p>
          <div className="flex gap-2">
            <Input
              type="email"
              value={recoverEmail}
              onChange={(e) => setRecoverEmail(e.target.value)}
              placeholder="Email used during payment"
              className="bg-background"
            />
            <Button
              onClick={handleRecoverByEmail}
              disabled={recovering}
              size="default"
              className="flex-shrink-0"
            >
              {recovering ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                "Search"
              )}
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {/* Pending orders */}
        {pendingOrders.map((pending) => {
          const date = new Date(pending.createdAt)
          const dateStr = date.toLocaleString("en-IN", {
            day: "numeric", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
          })

          return (
            <div
              key={pending.orderId}
              className="rounded-xl border border-amber-500/30 bg-card p-5 shadow-sm"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                    <Clock className="h-4 w-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {pending.platform} — {pending.category}
                    </p>
                    <p className="text-xs text-muted-foreground">{dateStr}</p>
                  </div>
                </div>
                <span className="flex-shrink-0 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-500">
                  Verifying Payment...
                </span>
              </div>

              <div className="mb-3 rounded-lg bg-muted/50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Service</p>
                <p className="text-sm text-foreground leading-snug">{pending.service}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-muted-foreground">Quantity</p>
                  <p className="text-sm font-medium text-foreground">{pending.quantity}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="flex items-center text-sm font-bold text-primary">
                    <IndianRupee className="h-3 w-3" />
                    {pending.totalPrice}
                  </p>
                </div>
              </div>

              <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  This payment is being verified. If you completed payment, it will be confirmed automatically. 
                  If not confirmed within a few minutes, use the Recover button above.
                </p>
              </div>
            </div>
          )
        })}

        {/* Confirmed orders */}
        {orders.map((order) => {
          const date = new Date(order.placedAt)
          const dateStr = date.toLocaleString("en-IN", {
            day: "numeric", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
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
                  Order Placed
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
          Your order history is stored in this browser. If you switch devices or clear data, use the Recover button with your email. For any issues, contact us with your Payment ID at htgstudio0@gmail.com
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

