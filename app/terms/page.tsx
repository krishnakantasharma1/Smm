import { siteConfig } from "@/lib/site-config"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: `Terms & Conditions - ${siteConfig.name}`,
  description: "Terms and conditions for using HTG Studio social media services.",
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <h1 className="mb-8 text-3xl font-bold text-foreground md:text-4xl">Terms & Conditions</h1>

      <div className="flex flex-col gap-6 text-muted-foreground">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Acceptance of Terms</h2>
          <p className="leading-relaxed">
            By accessing and using {siteConfig.name} and placing an order for any of our
            services, you agree to be bound by these Terms and Conditions. If you do not agree
            to these terms, please do not use our services.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Nature of Services</h2>
          <p className="leading-relaxed">
            {siteConfig.name} provides social media marketing services including but not
            limited to views, likes, followers, subscribers, comments, and members for
            platforms such as YouTube, Instagram, and Telegram. These services are digital in
            nature and are delivered online.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Service Delivery & Reversibility</h2>
          <p className="leading-relaxed">
            Our services involve increasing social media metrics (views, likes, followers,
            etc.). It is important to understand that{" "}
            <strong className="text-foreground">
              these services are inherently reversible
            </strong>
            . This means:
          </p>
          <ul className="mt-2 flex flex-col gap-1 pl-5">
            <li className="list-disc">
              After delivery, the numbers (likes, views, followers, etc.) may drop or fluctuate
              due to the social media platform&apos;s algorithms and policies.
            </li>
            <li className="list-disc">
              {siteConfig.name} completes the service by delivering the ordered quantity.
              Once the delivery is verified, our obligation is fulfilled.
            </li>
            <li className="list-disc">
              We are not responsible for any drops that occur after the service has been
              verified as delivered, unless a specific refill guarantee is included in the
              service description.
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Verification & Confirmation</h2>
          <p className="leading-relaxed">
            After the service is delivered, our team will check and verify that the ordered
            quantity has been delivered to your account or post. We may contact you to confirm
            that the numbers have increased. Once you confirm that the delivery was successful,
            the order is considered complete and closed.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-3 text-lg font-semibold text-foreground">No Refunds</h2>
          <p className="leading-relaxed">
            <strong className="text-foreground">Once a service is delivered and verified, no refunds will be
            issued.</strong> By placing an order, you agree to this no-refund policy. Please refer to
            our Refund Policy page for detailed information on exceptions.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Account Responsibility</h2>
          <p className="leading-relaxed">
            You are solely responsible for the social media accounts you provide for our
            services. {siteConfig.name} is not liable for:
          </p>
          <ul className="mt-2 flex flex-col gap-1 pl-5">
            <li className="list-disc">Any bans, restrictions, or suspensions on your social media accounts.</li>
            <li className="list-disc">Content violations or policy breaches on your accounts.</li>
            <li className="list-disc">
              Any consequences arising from the use of third-party growth services on social
              media platforms.
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Payment</h2>
          <p className="leading-relaxed">
            All payments are processed securely through Razorpay. You agree to pay the full
            amount shown at checkout before the service is initiated. The minimum order value
            is Rs.{siteConfig.minOrderValue}. All prices are listed in Indian Rupees (INR).
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Accuracy of Information</h2>
          <p className="leading-relaxed">
            You agree to provide accurate and correct information when placing an order,
            including your social media link, email address, and contact details. We are not
            responsible for failed deliveries due to incorrect information provided by you.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Modifications</h2>
          <p className="leading-relaxed">
            {siteConfig.name} reserves the right to modify these Terms and Conditions at any
            time. Changes will be effective immediately upon posting on this page. Your
            continued use of our services constitutes your acceptance of the updated terms.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Contact</h2>
          <p className="leading-relaxed">
            For any questions regarding these Terms and Conditions, please contact us at{" "}
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
