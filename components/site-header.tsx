"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, X, Zap, Package } from "lucide-react"
import { siteConfig } from "@/lib/site-config"
import { Button } from "@/components/ui/button"

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [hasOrders, setHasOrders] = useState(false)

  useEffect(() => {
    try {
      const orders = JSON.parse(localStorage.getItem("htg_orders") || "[]")
      setHasOrders(orders.length > 0)
    } catch {
      setHasOrders(false)
    }
  }, [])

  const navLinks = [
    { href: "/", label: "New Order" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact Us" },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">{siteConfig.name}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          {hasOrders && (
            <Link
              href="/my-orders"
              className="relative flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
            >
              <Package className="h-4 w-4" />
              My Orders
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary" />
            </Link>
          )}
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-card px-4 pb-4 md:hidden">
          <nav className="flex flex-col gap-1 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            {hasOrders && (
              <Link
                href="/my-orders"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
              >
                <Package className="h-4 w-4" />
                My Orders
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
