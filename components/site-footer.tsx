import Link from "next/link"
import { Zap } from "lucide-react"
import { siteConfig } from "@/lib/site-config"

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <Link href="/" className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">{siteConfig.name}</span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Your trusted partner for social media growth services. Fast, reliable, and affordable.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">Quick Links</h3>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">New Order</Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-muted-foreground transition-colors hover:text-foreground">About Us</Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Contact Us</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">Legal</h3>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/refund-policy" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Refund Policy</Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Shipping Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Terms & Conditions</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
