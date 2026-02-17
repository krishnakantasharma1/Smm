"use client"

import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import { platformsData } from "@/lib/services-data"
import { siteConfig } from "@/lib/site-config"
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
  const pendingOrderRef = useRef<{
    orderId: string
    platform: string
    category: string
    service: string
    link: string
    quantity: string
    email: string
    contact: string
    totalPrice: number
  } | null>(null)

  // On mount and on page focus: try to recover any payment that was interrupted
  useEffect(() => {
    const recoverPendingPayment = async () => {
      try {
        const raw = sessionStorage.getItem("htg_pending_order")
        if (!raw) return
        const pending = JSON.parse(raw)
        if (!pending?.orderId) return

        console.log("[recovery] Found pending order, checking payment status:", pending.orderId)

        const res = await fetch("/api/check-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: pending.orderId }),
        })
        const data = await res.json()

        if (data.captured) {
          console.log("[recovery] Payment was captured! Processing order...")
          sessionStorage.removeItem("htg_pending_order")

          // Save to My Orders
          try {
            const existingOrders = JSON.parse(localStorage.getItem("htg_orders") || "[]")
            // Don't add duplicate
            const alreadyExists = existingOrders.some((o: {id: string}) => o.id === pending.orderId)
            if (!alreadyExists) {
              existingOrders.unshift({
                id: pending.orderId,
                paymentId: data.paymentId || "via-webhook",
                platform: pending.platform,
                category: pending.category,
                service: pending.service,
                link: pending.link,
                quantity: pending.quantity,
                email: pending.email,
                contact: pending.contact,
                totalPrice: pending.totalPrice,
                placedAt: new Date().toISOString(),
              })
              localStorage.setItem("htg_orders", JSON.stringify(existingOrders))
              window.dispatchEvent(new Event("htg_orders_updated"))
            }
          } catch (e) {
            console.error("[recovery] Failed to save order:", e)
          }

          toast.success("✅ Payment confirmed! Your order has been placed. We will get back to you soon.", {
            duration: 10000,
          })
        } else {
          console.log("[recovery] Payment not captured yet:", data)
        }
      } catch (e) {
        console.error("[recovery] Error checking pending order:", e)
      }
    }

    recoverPendingPayment()

    // Also check on tab focus (user comes back from UPI app)
    const handleFocus = () => recoverPendingPayment()
    window.addEventListener("focus", handleFocus)
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") recoverPendingPayment()
    })
    return () => window.removeEventListener("focus", handleFocus)
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

  const handlePlaceOrder = async () => {
    // Validate individual fields with specific messages
    if (!platform) {
      toast.error("Please select a platform")
      return
    }
    if (!category) {
      toast.error("Please select a category")
      return
    }
    if (!service) {
      toast.error("Please select a service")
      return
    }
    if (!link) {
      toast.error("Please enter your account or post link")
      return
    }
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      toast.error("Please enter a valid quantity")
      return
    }
    if (!email) {
      toast.error("Please enter your email address")
      return
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address")
      return
    }
    if (!contact) {
      toast.error("Please enter your Telegram username or phone number")
      return
    }
    if (!termsAccepted) {
      toast.error("Please accept the terms and conditions")
      return
    }
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
      // Wait for Razorpay SDK to load (retry up to 5 seconds)
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

      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalPrice }),
      })

      const data = await res.json()

      if (!res.ok || !data.orderId) {
        toast.error(data.error || "Failed to create order. Please try again.")
        setLoading(false)
        return
      }

      // Save pending order to sessionStorage BEFORE opening Razorpay
      // This allows recovery if user closes popup, switches to UPI app, or page crashes
      const pendingOrder = {
        orderId: data.orderId,
        platform, category, service, link, quantity, email, contact, totalPrice,
      }
      pendingOrderRef.current = pendingOrder
      try {
        sessionStorage.setItem("htg_pending_order", JSON.stringify(pendingOrder))
      } catch (e) {
        console.error("Failed to save pending order:", e)
      }

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
                orderDetails: {
                  platform,
                  category,
                  service,
                  link,
                  quantity,
                  email,
                  contact,
                  totalPrice,
                },
              }),
            })

            const verifyData = await verifyRes.json()

            if (verifyData.success) {
              toast.success("✅ Payment successful! We will get back to you soon.", {
                duration: 8000,
              })
              // Save order to localStorage for My Orders page
              try {
                const existingOrders = JSON.parse(localStorage.getItem("htg_orders") || "[]")
                const newOrder = {
                  id: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                  platform,
                  category,
                  service,
                  link,
                  quantity,
                  email,
                  contact,
                  totalPrice,
                  status: "Processing",
                  placedAt: new Date().toISOString(),
                }
                existingOrders.unshift(newOrder)
                localStorage.setItem("htg_orders", JSON.stringify(existingOrders))
                // Clear pending order — normal flow succeeded
                sessionStorage.removeItem("htg_pending_order")
                pendingOrderRef.current = null
                // Notify header to show My Orders instantly without refresh
                window.dispatchEvent(new Event("htg_orders_updated"))
              } catch (e) {
                console.error("Failed to save order locally:", e)
              }
              // Reset entire form
              setPlatform("")
              setCategory("")
              setService("")
              setLink("")
              setQuantity("")
              setEmail("")
              setContact("")
              setTermsAccepted(false)
              setLoading(false)
            } else {
              toast.error(verifyData.error || "Payment verification failed. Please contact support at htgstudio0@gmail.com")
              setLoading(false)
            }
          } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown error"
            toast.error(`Payment verification error: ${message}. Please contact support at htgstudio0@gmail.com`)
            setLoading(false)
          }
        },
        modal: {
          ondismiss: async function () {
            // Don't immediately assume cancelled — user may have paid via UPI app
            // Check Razorpay directly to see if payment was captured
            const pending = pendingOrderRef.current
            if (pending?.orderId) {
              toast.info("Checking payment status...", { duration: 3000 })
              try {
                const checkRes = await fetch("/api/check-order", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ orderId: pending.orderId }),
                })
                const checkData = await checkRes.json()

                if (checkData.captured) {
                  // Payment went through! Process it
                  sessionStorage.removeItem("htg_pending_order")
                  pendingOrderRef.current = null

                  const existingOrders = JSON.parse(localStorage.getItem("htg_orders") || "[]")
                  const alreadyExists = existingOrders.some((o: {id: string}) => o.id === pending.orderId)
                  if (!alreadyExists) {
                    existingOrders.unshift({
                      id: pending.orderId,
                      paymentId: checkData.paymentId || "captured",
                      platform: pending.platform,
                      category: pending.category,
                      service: pending.service,
                      link: pending.link,
                      quantity: pending.quantity,
                      email: pending.email,
                      contact: pending.contact,
                      totalPrice: pending.totalPrice,
                      placedAt: new Date().toISOString(),
                    })
                    localStorage.setItem("htg_orders", JSON.stringify(existingOrders))
                    window.dispatchEvent(new Event("htg_orders_updated"))
                  }

                  toast.success("✅ Payment confirmed! Your order has been placed. We will get back to you soon.", {
                    duration: 10000,
                  })
                  setPlatform(""); setCategory(""); setService(""); setLink("")
                  setQuantity(""); setEmail(""); setContact(""); setTermsAccepted(false)
                } else {
                  // Genuinely cancelled or payment pending
                  toast.info("Payment was cancelled. If you completed payment, it will be confirmed shortly.", {
                    duration: 6000,
                  })
                }
              } catch (e) {
                toast.info("Payment was cancelled. If you completed payment, please wait — it will be confirmed automatically.")
              }
            } else {
              toast.info("Payment was cancelled. You can try again anytime.")
            }
            setLoading(false)
          },
        },
        prefill: {
          email: email,
          contact: contact,
        },
        theme: {
          color: "#0066FF",
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on("payment.failed", function (response: { error: { code: string; description: string; reason: string } }) {
        toast.error(`Payment failed: ${response.error.description || response.error.reason || "Unknown error"}`)
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
