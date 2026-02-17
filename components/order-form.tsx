"use client"

import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import { platformsData } from "@/lib/services-data"
import { siteConfig } from "@/lib/site-config"
import { getDeviceId } from "@/lib/device-id"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { ChevronRight, ShoppingCart, IndianRupee } from "lucide-react"

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any
  }
}

const PENDING_ORDERS_KEY = "htg_pending_orders"
const ORDERS_KEY = "htg_orders"

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

function getPendingOrders(): PendingOrder[] {
  try {
    return JSON.parse(localStorage.getItem(PENDING_ORDERS_KEY) || "[]")
  } catch {
    return []
  }
}

function savePendingOrder(order: PendingOrder) {
  const existing = getPendingOrders()
  // Don't add duplicate
  if (!existing.some((o) => o.orderId === order.orderId)) {
    existing.push(order)
  }
  localStorage.setItem(PENDING_ORDERS_KEY, JSON.stringify(existing))
}

function removePendingOrder(orderId: string) {
  const existing = getPendingOrders().filter((o) => o.orderId !== orderId)
  localStorage.setItem(PENDING_ORDERS_KEY, JSON.stringify(existing))
}

function saveConfirmedOrder(order: {
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
}) {
  try {
    const existingOrders = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]")
    // Don't add duplicate
    if (existingOrders.some((o: { id: string }) => o.id === order.id)) return false
    existingOrders.unshift(order)
    localStorage.setItem(ORDERS_KEY, JSON.stringify(existingOrders))
    window.dispatchEvent(new Event("htg_orders_updated"))
    return true
  } catch {
    return false
  }
}

export function OrderForm() {
  const [platform, setPlatform] = useState("")
  const [category, setCategory] = useState("")
  const [service, setService] = useState("")
  const [link, setLink] = useState("")
  const [quantity, setQuantity] = useState("")
  const [email, setEmail] = useState("")
  const [contact, setContact] = useState("")
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const pendingOrderRef = useRef<PendingOrder | null>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Recovery system: check ALL pending orders on mount, focus, and visibility ──
  useEffect(() => {
    const recoverAllPendingOrders = async () => {
      const pending = getPendingOrders()
      if (pending.length === 0) return

      // Clean up orders older than 24 hours (Razorpay orders expire)
      const now = Date.now()
      const validPending = pending.filter((p) => {
        const age = now - new Date(p.createdAt).getTime()
        return age < 24 * 60 * 60 * 1000 // 24 hours
      })

      // Remove expired ones
      if (validPending.length !== pending.length) {
        localStorage.setItem(PENDING_ORDERS_KEY, JSON.stringify(validPending))
      }

      for (const pendingOrder of validPending) {
        try {
          const res = await fetch("/api/check-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: pendingOrder.orderId }),
          })
          const data = await res.json()

          if (data.captured) {
            // Payment was captured! Save the order and remove from pending
            removePendingOrder(pendingOrder.orderId)

            const details = data.orderDetails || {}
            const saved = saveConfirmedOrder({
              id: pendingOrder.orderId,
              paymentId: data.paymentId || "via-recovery",
              platform: pendingOrder.platform || details.platform || "",
              category: pendingOrder.category || details.category || "",
              service: pendingOrder.service || details.service || "",
              link: pendingOrder.link || details.link || "",
              quantity: pendingOrder.quantity || details.quantity || "",
              email: pendingOrder.email || details.email || "",
              contact: pendingOrder.contact || details.contact || "",
              totalPrice: pendingOrder.totalPrice || details.totalPrice || data.amount || 0,
              placedAt: pendingOrder.createdAt || new Date().toISOString(),
            })

            if (saved) {
              toast.success("Payment confirmed! Your order has been placed. We will get back to you soon.", {
                duration: 10000,
              })
            }
          }
        } catch {
          // Silently fail for individual order checks
        }
      }
    }

    // Run immediately on mount
    recoverAllPendingOrders()

    // Run on tab focus (user returns from UPI app)
    const handleFocus = () => recoverAllPendingOrders()
    const handleVisibility = () => {
      if (document.visibilityState === "visible") recoverAllPendingOrders()
    }

    window.addEventListener("focus", handleFocus)
    document.addEventListener("visibilitychange", handleVisibility)

    // Also run periodically every 10 seconds while there are pending orders
    const periodicCheck = setInterval(() => {
      if (getPendingOrders().length > 0) {
        recoverAllPendingOrders()
      }
    }, 10000)

    return () => {
      window.removeEventListener("focus", handleFocus)
      document.removeEventListener("visibilitychange", handleVisibility)
      clearInterval(periodicCheck)
    }
  }, [])

  const selectedPlatform = useMemo(
    () => platformsData.find((p) => p.name === platform),
    [platform]
  )

  const selectedCategory = useMemo(
    () => selectedPlatform?.categories.find((c) => c.name === category),
    [selectedPlatform, category]
  )

  const selectedService = useMemo(
    () => selectedCategory?.services.find((s) => s.name === service),
    [selectedCategory, service]
  )

  const totalPrice = useMemo(() => {
    if (!selectedService || !quantity || isNaN(Number(quantity))) return 0
    const qty = Number(quantity)
    return Math.ceil((selectedService.price / 1000) * qty * 100) / 100
  }, [selectedService, quantity])

  const handlePlatformChange = useCallback((val: string) => {
    setPlatform(val)
    setCategory("")
    setService("")
    setQuantity("")
  }, [])

  const handleCategoryChange = useCallback((val: string) => {
    setCategory(val)
    setService("")
    setQuantity("")
  }, [])

  const handleServiceChange = useCallback((val: string) => {
    setService(val)
    setQuantity("")
  }, [])

  // ── Polling: aggressive check after Razorpay modal interaction ──
  const startPolling = useCallback((orderId: string, pending: PendingOrder) => {
    if (pollingRef.current) clearInterval(pollingRef.current)

    let attempts = 0
    const maxAttempts = 30 // Poll for up to 5 minutes (every 10s)

    pollingRef.current = setInterval(async () => {
      attempts++
      if (attempts > maxAttempts) {
        if (pollingRef.current) clearInterval(pollingRef.current)
        pollingRef.current = null
        return
      }

      try {
        const res = await fetch("/api/check-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        })
        const data = await res.json()

        if (data.captured) {
          if (pollingRef.current) clearInterval(pollingRef.current)
          pollingRef.current = null
          removePendingOrder(orderId)
          pendingOrderRef.current = null

          const details = data.orderDetails || {}
          const saved = saveConfirmedOrder({
            id: orderId,
            paymentId: data.paymentId || "via-polling",
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

          if (saved) {
            toast.success("Payment confirmed! Your order has been placed. We will get back to you soon.", {
              duration: 10000,
            })
            // Reset form
            setPlatform(""); setCategory(""); setService(""); setLink("")
            setQuantity(""); setEmail(""); setContact(""); setTermsAccepted(false)
          }
        }
      } catch {
        // Continue polling on error
      }
    }, 10000) // Every 10 seconds
  }, [])

  const handlePlaceOrder = async () => {
    // Validate individual fields with specific messages
    if (!platform) { toast.error("Please select a platform"); return }
    if (!category) { toast.error("Please select a category"); return }
    if (!service) { toast.error("Please select a service"); return }
    if (!link) { toast.error("Please enter your account or post link"); return }
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      toast.error("Please enter a valid quantity"); return
    }
    if (!email) { toast.error("Please enter your email address"); return }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) { toast.error("Please enter a valid email address"); return }
    if (!contact) { toast.error("Please enter your Telegram username or phone number"); return }
    if (!termsAccepted) { toast.error("Please accept the terms and conditions"); return }
    if (totalPrice < siteConfig.minOrderValue) {
      toast.error(`Minimum order value is Rs.${siteConfig.minOrderValue}. Please increase your quantity.`)
      return
    }
    if (selectedService?.minOrder && Number(quantity) < selectedService.minOrder) {
      toast.error(`Minimum order quantity for this service is ${selectedService.minOrder}`)
      return
    }

    setLoading(true)

    try {
      // Wait for Razorpay SDK to load
      if (typeof window.Razorpay === "undefined") {
        let waited = 0
        await new Promise<void>((resolve, reject) => {
          const interval = setInterval(() => {
            waited += 200
            if (typeof window.Razorpay !== "undefined") {
              clearInterval(interval)
              resolve()
            } else if (waited >= 5000) {
              clearInterval(interval)
              reject(new Error("Payment gateway failed to load. Please refresh the page and try again."))
            }
          }, 200)
        })
      }

      const deviceId = getDeviceId()
      const orderDetails = { platform, category, service, link, quantity, email, contact, totalPrice }

      // Create order with full details stored in Razorpay notes
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalPrice, orderDetails, deviceId }),
      })

      const data = await res.json()

      if (!res.ok || !data.orderId) {
        toast.error(data.error || "Failed to create order. Please try again.")
        setLoading(false)
        return
      }

      // Save pending order to localStorage BEFORE opening Razorpay
      // This persists even if the browser closes entirely
      const pendingOrder: PendingOrder = {
        orderId: data.orderId,
        platform, category, service, link, quantity, email, contact, totalPrice,
        deviceId,
        createdAt: new Date().toISOString(),
      }
      pendingOrderRef.current = pendingOrder
      savePendingOrder(pendingOrder)

      const options = {
        key: data.keyId,
        amount: Math.round(totalPrice * 100),
        currency: "INR",
        name: siteConfig.name,
        description: `${platform} - ${category} - ${service.substring(0, 50)}`,
        order_id: data.orderId,
        handler: async function (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) {
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                orderDetails: { platform, category, service, link, quantity, email, contact, totalPrice },
              }),
            })

            const verifyData = await verifyRes.json()

            if (verifyData.success) {
              toast.success("Payment successful! We will get back to you soon.", {
                duration: 8000,
              })
              // Remove from pending and save as confirmed
              removePendingOrder(data.orderId)
              pendingOrderRef.current = null
              if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null }

              saveConfirmedOrder({
                id: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                platform, category, service, link, quantity, email, contact, totalPrice,
                status: "Processing",
                placedAt: new Date().toISOString(),
              } as never)

              // Reset form
              setPlatform(""); setCategory(""); setService(""); setLink("")
              setQuantity(""); setEmail(""); setContact(""); setTermsAccepted(false)
              setLoading(false)
            } else {
              // Verification failed but payment might still be captured
              // Start polling as safety net
              startPolling(data.orderId, pendingOrder)
              toast.error(verifyData.error || "Payment verification failed. Please contact support at htgstudio0@gmail.com")
              setLoading(false)
            }
          } catch {
            // Network error during verification - start polling
            startPolling(data.orderId, pendingOrder)
            toast.error("Payment verification error. If you completed payment, it will be confirmed automatically.")
            setLoading(false)
          }
        },
        modal: {
          ondismiss: async function () {
            // User closed the Razorpay modal - payment may still be processing
            // Check immediately, then start aggressive polling
            const pending = pendingOrderRef.current
            if (pending?.orderId) {
              toast.info("Checking payment status...", { duration: 3000 })

              // Immediate check
              try {
                const checkRes = await fetch("/api/check-order", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ orderId: pending.orderId }),
                })
                const checkData = await checkRes.json()

                if (checkData.captured) {
                  removePendingOrder(pending.orderId)
                  pendingOrderRef.current = null

                  const details = checkData.orderDetails || {}
                  saveConfirmedOrder({
                    id: pending.orderId,
                    paymentId: checkData.paymentId || "captured",
                    platform: pending.platform || details.platform,
                    category: pending.category || details.category,
                    service: pending.service || details.service,
                    link: pending.link || details.link,
                    quantity: pending.quantity || details.quantity,
                    email: pending.email || details.email,
                    contact: pending.contact || details.contact,
                    totalPrice: pending.totalPrice || details.totalPrice,
                    placedAt: pending.createdAt || new Date().toISOString(),
                  })

                  toast.success("Payment confirmed! Your order has been placed. We will get back to you soon.", {
                    duration: 10000,
                  })
                  setPlatform(""); setCategory(""); setService(""); setLink("")
                  setQuantity(""); setEmail(""); setContact(""); setTermsAccepted(false)
                } else if (checkData.authorized) {
                  // Payment is authorized but not yet captured - it will be captured soon
                  toast.info("Payment is being processed. Your order will appear shortly.", { duration: 8000 })
                  startPolling(pending.orderId, pending)
                } else {
                  // Not captured yet - could still be processing (UPI takes time)
                  toast.info("If you completed payment, your order will be confirmed automatically. Check 'My Orders' in a few minutes.", {
                    duration: 8000,
                  })
                  // Start polling anyway - UPI payments can take 30+ seconds
                  startPolling(pending.orderId, pending)
                }
              } catch {
                toast.info("If you completed payment, it will be confirmed automatically.")
                startPolling(pending.orderId, pending)
              }
            } else {
              toast.info("Payment was cancelled. You can try again anytime.")
            }
            setLoading(false)
          },
        },
        prefill: { email, contact },
        theme: { color: "#0066FF" },
        notes: {
          device_id: deviceId,
          platform,
          category,
          service: service.substring(0, 255),
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on("payment.failed", function (response: { error: { code: string; description: string; reason: string } }) {
        toast.error(`Payment failed: ${response.error.description || response.error.reason || "Unknown error"}`)
        // Don't remove from pending - user might retry
        setLoading(false)
      })
      rzp.open()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error"
      toast.error(`Error: ${message}. Please try again or contact support.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <ShoppingCart className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Place Your Order</h2>
          <p className="text-sm text-muted-foreground">Select your service and fill in the details</p>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {/* Platform */}
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium text-foreground">Our Services</Label>
          <Select value={platform} onValueChange={handlePlatformChange}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select Platform" />
            </SelectTrigger>
            <SelectContent>
              {platformsData
                .filter((p) => p.clickable)
                .map((p) => (
                  <SelectItem key={p.name} value={p.name}>
                    {p.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category */}
        {selectedPlatform && selectedPlatform.clickable && (
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-foreground">Category</Label>
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {selectedPlatform.categories.map((c) => (
                  <SelectItem key={c.name} value={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Service */}
        {selectedCategory && (
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-foreground">Service</Label>
            <Select value={service} onValueChange={handleServiceChange}>
              <SelectTrigger className="bg-background overflow-hidden">
                <SelectValue placeholder="Select Service">
                  {service && (
                    <span className="block truncate text-sm">{service}</span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="w-[var(--radix-select-trigger-width)] max-w-[calc(100vw-2.5rem)] overflow-x-hidden">
                {selectedCategory.services.map((s, idx) => (
                  <SelectItem key={idx} value={s.name} className="items-start pr-2 [&>span:first-child]:hidden">
                    <div className="flex w-full flex-col gap-0.5 py-0.5 min-w-0">
                      <span className="block whitespace-normal break-words leading-snug text-sm">{s.name}</span>
                      <span className="block font-semibold text-primary text-xs">Rs.{s.price}/1000</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Selected service info */}
        {selectedService && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-primary">Selected Service</p>
            <p className="text-sm leading-relaxed text-foreground">{selectedService.name}</p>
            <p className="mt-1 text-sm font-semibold text-primary">
              Rs.{selectedService.price} per 1000
              {selectedService.minOrder && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  (Min. order: {selectedService.minOrder})
                </span>
              )}
            </p>
          </div>
        )}

        {/* Link */}
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium text-foreground">Account / Post Link</Label>
          <Input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=... or profile link"
            className="bg-background"
          />
        </div>

        {/* Quantity */}
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium text-foreground">Quantity</Label>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder={selectedService?.minOrder ? `Minimum ${selectedService.minOrder}` : "Enter quantity"}
            min={selectedService?.minOrder || 1}
            className="bg-background"
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium text-foreground">Email Address</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="bg-background"
          />
        </div>

        {/* Contact */}
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium text-foreground">Telegram Username / Phone Number</Label>
          <Input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="@username or +91XXXXXXXXXX"
            className="bg-background"
          />
        </div>

        {/* Price */}
        {selectedService && quantity && Number(quantity) > 0 && (
          <div className="rounded-lg border border-accent/30 bg-accent/10 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Total Charges</span>
              <span className="flex items-center text-2xl font-bold text-accent-foreground">
                <IndianRupee className="mr-1 h-5 w-5" />
                {totalPrice.toFixed(2)}
              </span>
            </div>
            {totalPrice < siteConfig.minOrderValue && (
              <p className="mt-2 text-xs text-destructive">
                Minimum order value is Rs.{siteConfig.minOrderValue}
              </p>
            )}
          </div>
        )}

        {/* Terms */}
        <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-4">
          <Checkbox
            id="terms"
            checked={termsAccepted}
            onCheckedChange={(checked) => setTermsAccepted(checked === true)}
            className="mt-0.5"
          />
          <Label htmlFor="terms" className="text-sm leading-relaxed text-muted-foreground">
            I accept the{" "}
            <a href="/terms" target="_blank" className="font-medium text-primary underline">
              Terms & Conditions
            </a>
            ,{" "}
            <a href="/refund-policy" target="_blank" className="font-medium text-primary underline">
              Refund Policy
            </a>
            , and understand that services are non-refundable once delivered.
          </Label>
        </div>

        {/* Submit */}
        <Button
          onClick={handlePlaceOrder}
          disabled={loading || !termsAccepted}
          size="lg"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {loading ? (
            "Processing..."
          ) : (
            <>
              Place Order <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

