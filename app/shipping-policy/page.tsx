import { siteConfig } from "@/lib/site-config"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: `Shipping Policy - ${siteConfig.name}`,
  description: "Shipping and delivery policy for HTG Studio digital services.",
}

export default function ShippingPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <h1 className="mb-8 text-3xl font-bold text-foreground md:text-4xl">Shipping Policy</h1>

      <div className="flex flex-col gap-6 text-muted-foreground">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Digital Service Delivery</h2>
          <p className="leading-relaxed">
            {siteConfig.name} provides digital social media marketing services. Since all our
            services are delivered digitally (online), there is no physical shipping involved.
            Our services are delivered directly to the social media account or post link you
            provide during the order process.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Delivery Timeframe</h2>
          <p className="leading-relaxed">
            Most of our services begin processing within minutes of a successful payment.
            Typical delivery times are:
          </p>
          <ul className="mt-2 flex flex-col gap-1 pl-5">
            <li className="list-disc">
              <strong className="text-foreground">Instant services:</strong> Delivery begins within 0-10 minutes of
              payment confirmation.
            </li>
            <li className="list-disc">
              <strong className="text-foreground">Fast services:</strong> Delivery begins within 0-1 hour and is
              completed based on the speed mentioned in the service description.
            </li>
            <li className="list-disc">
              <strong className="text-foreground">Standard services:</strong> Delivery may take up to 24-48 hours to
              complete, depending on the quantity ordered and the specific service.
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Delivery Speed</h2>
          <p className="leading-relaxed">
            The speed of delivery varies by service and is clearly stated in each service
            description (e.g., &quot;Speed: 10K/Day&quot;, &quot;Speed: 100K/Day&quot;). The
            actual delivery speed depends on current server load and the platform&apos;s
            response. We strive to meet or exceed the stated delivery speeds.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Order Tracking</h2>
          <p className="leading-relaxed">
            After placing your order, you can track your delivery by checking the count on your
            social media account or post. If you experience any issues with delivery, please
            contact us at{" "}
            <a href={`mailto:${siteConfig.email}`} className="font-medium text-primary underline">
              {siteConfig.email}
            </a>{" "}
            with your order details and payment ID.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-3 text-lg font-semibold text-foreground">No Physical Shipping</h2>
          <p className="leading-relaxed">
            As a digital service provider, we do not ship any physical products. All services
            are fulfilled electronically. No shipping address is required, and no shipping
            charges apply.
          </p>
        </div>
      </div>
    </div>
  )
}
