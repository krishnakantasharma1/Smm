import { siteConfig } from "@/lib/site-config"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: `Privacy Policy - ${siteConfig.name}`,
  description: "Privacy policy for HTG Studio social media services.",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <h1 className="mb-8 text-3xl font-bold text-foreground md:text-4xl">Privacy Policy</h1>

      <div className="flex flex-col gap-6 text-muted-foreground">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Information We Collect</h2>
          <p className="leading-relaxed">
            When you place an order on {siteConfig.name}, we collect the following information:
          </p>
          <ul className="mt-2 flex flex-col gap-1 pl-5">
            <li className="list-disc">Your email address</li>
            <li className="list-disc">Your Telegram username or phone number</li>
            <li className="list-disc">The social media account or post link you provide for the service</li>
            <li className="list-disc">Payment transaction details (processed securely by Razorpay)</li>
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-3 text-lg font-semibold text-foreground">How We Use Your Information</h2>
          <p className="leading-relaxed">
            Your information is used solely for the purpose of fulfilling your order and
            communicating with you about your service. We use your email and contact details
            to send order confirmations, delivery updates, and respond to your queries. Your
            social media link is used only to deliver the ordered service.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Data Security</h2>
          <p className="leading-relaxed">
            We take reasonable measures to protect your personal information. All payment
            transactions are processed securely through Razorpay, a PCI-DSS compliant payment
            gateway. We do not store your payment card details on our servers.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Third-Party Sharing</h2>
          <p className="leading-relaxed">
            We do not sell, trade, or share your personal information with third parties,
            except as required to process your order (e.g., payment processing through
            Razorpay) or as required by law.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Cookies</h2>
          <p className="leading-relaxed">
            Our website may use cookies to enhance your browsing experience. These cookies do
            not collect personally identifiable information and are used for functional
            purposes only.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Contact Us</h2>
          <p className="leading-relaxed">
            If you have any questions about this Privacy Policy, please contact us at{" "}
            <a href={`mailto:${siteConfig.email}`} className="font-medium text-primary underline">
              {siteConfig.email}
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
