import { siteConfig } from "@/lib/site-config"
import { Mail, MessageCircle } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: `Contact Us - ${siteConfig.name}`,
  description: "Get in touch with HTG Studio for any queries about our social media services.",
}

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:py-16">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-foreground md:text-4xl">Contact Us</h1>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
          Have questions or need support? We are here to help. Reach out to us through any of
          the channels below.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-7 w-7 text-primary" />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-foreground">Email Us</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Send us an email and we will get back to you as soon as possible.
          </p>
          <a
            href={`mailto:${siteConfig.email}`}
            className="inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {siteConfig.email}
          </a>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <MessageCircle className="h-7 w-7 text-primary" />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-foreground">Telegram</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Reach out to us on Telegram for quick support and order-related queries.
          </p>
          <span className="inline-block rounded-lg bg-secondary px-6 py-2.5 text-sm font-medium text-secondary-foreground">
            <a href="https://t.me/Htglinks" target="_blank" rel="noopener noreferrer" >Contact via Telegram</a>
          </span>
        </div>
      </div>

      <div className="mt-10 rounded-xl border border-border bg-card p-6 md:p-8">
        <h2 className="mb-4 text-xl font-bold text-foreground">Frequently Asked Questions</h2>
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="mb-1 font-semibold text-foreground">How long does delivery take?</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Most services are delivered within minutes. Some services may take up to a few
              hours depending on the quantity and type of service ordered.
            </p>
          </div>
          <div>
            <h3 className="mb-1 font-semibold text-foreground">Is my account safe?</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Yes, we use industry-standard methods that are safe for your accounts. We never
              ask for your passwords or login credentials.
            </p>
          </div>
          <div>
            <h3 className="mb-1 font-semibold text-foreground">What payment methods do you accept?</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We accept all major payment methods through Razorpay, including UPI, credit/debit
              cards, net banking, and wallets.
            </p>
          </div>
          <div>
            <h3 className="mb-1 font-semibold text-foreground">Can I get a refund?</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Please refer to our Refund Policy page for detailed information. In general, once
              a service is delivered and the count is verified, refunds are not applicable.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
