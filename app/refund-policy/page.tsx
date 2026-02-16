import { siteConfig } from "@/lib/site-config"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: `Refund Policy - ${siteConfig.name}`,
  description: "Refund policy for HTG Studio social media services.",
}

export default function RefundPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <h1 className="mb-8 text-3xl font-bold text-foreground md:text-4xl">Refund Policy</h1>

      <div className="flex flex-col gap-6 text-muted-foreground">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-3 text-lg font-semibold text-foreground">No Refund After Service Delivery</h2>
          <p className="leading-relaxed">
            Once a service has been delivered and the agreed-upon count (views, likes,
            followers, subscribers, members, etc.) has been verified and confirmed by the
            customer, <strong className="text-foreground">no refunds will be issued</strong>. By placing an order, you
            acknowledge and accept this policy.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Verification Process</h2>
          <p className="leading-relaxed">
            After the service is completed, our team will verify that the ordered quantity has
            been delivered. We may contact you to confirm that the numbers have increased as
            expected. Once you confirm that the service has been delivered successfully, our
            obligation is fulfilled.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Drops After Delivery</h2>
          <p className="leading-relaxed">
            Social media services are inherently variable. Numbers (views, likes, followers,
            etc.) may naturally fluctuate or drop after delivery. This is a normal behavior of
            social media platforms. <strong className="text-foreground">{siteConfig.name} is not responsible for any
            drops that occur after the service has been delivered and verified.</strong> Some services
            include a refill guarantee (as specified in the service description) which covers
            drops within the stated refill period.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Account Bans or Restrictions</h2>
          <p className="leading-relaxed">
            {siteConfig.name} is not responsible if your social media account gets banned,
            restricted, or suspended by the platform for any reason, including but not limited
            to the use of third-party growth services. By using our services, you accept full
            responsibility for any consequences to your account.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Exceptions</h2>
          <p className="leading-relaxed">
            Refunds may only be considered in the following rare cases:
          </p>
          <ul className="mt-2 flex flex-col gap-1 pl-5">
            <li className="list-disc">The service was not delivered at all within the stated delivery time.</li>
            <li className="list-disc">A duplicate payment was made in error (verified by our payment system).</li>
            <li className="list-disc">The wrong service was delivered due to an error on our part.</li>
          </ul>
          <p className="mt-3 leading-relaxed">
            In such cases, please contact us at{" "}
            <a href={`mailto:${siteConfig.email}`} className="font-medium text-primary underline">
              {siteConfig.email}
            </a>{" "}
            within 48 hours of placing the order.
          </p>
        </div>
      </div>
    </div>
  )
}
