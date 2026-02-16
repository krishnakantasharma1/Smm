"use client"

import { useState, useMemo, useCallback } from "react"
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
    if (!platform || !category || !service || !link || !quantity || !email || !contact) {
      toast.error("Please fill in all fields")
      return
    }
    if (!termsAccepted) {
      toast.error("Please accept the terms and conditions")
      return
    }
    if (totalPrice < siteConfig.minOrderValue) {
      toast.error(`Minimum order value is Rs.${siteConfig.minOrderValue}`)
      return
    }
    if (selectedService?.minOrder && Number(quantity) < selectedService.minOrder) {
      toast.error(`Minimum order quantity is ${selectedService.minOrder}`)
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalPrice }),
      })

      const data = await res.json()

      if (!data.orderId) {
        throw new Error("Failed to create order")
      }

      const options = {
        key: data.keyId,
        amount: Math.round(totalPrice * 100),
        currency: "INR",
        name: siteConfig.name,
        description: `${platform} - ${category} - ${service.substring(0, 50)}...`,
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
              toast.success("Payment Done! We will get back to you soon.", {
                duration: 6000,
              })
              setPlatform("")
              setCategory("")
              setService("")
              setLink("")
              setQuantity("")
              setEmail("")
              setContact("")
              setTermsAccepted(false)
            } else {
              toast.error("Payment verification failed. Please contact support.")
            }
          } catch {
            toast.error("Something went wrong verifying payment. Please contact support.")
          }
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
      rzp.open()
    } catch {
      toast.error("Something went wrong. Please try again.")
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
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select Service" />
              </SelectTrigger>
              <SelectContent>
                {selectedCategory.services.map((s, idx) => (
                  <SelectItem key={idx} value={s.name}>
                    <span className="block max-w-[500px] truncate">{s.name}</span>
                    <span className="ml-2 font-semibold text-primary">
                      Rs.{s.price}/1000
                    </span>
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
