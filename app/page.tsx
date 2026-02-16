import Script from "next/script"
import { HeroSection } from "@/components/hero-section"
import { OrderForm } from "@/components/order-form"

export default function HomePage() {
  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <HeroSection />
      <section className="py-10 md:py-14">
        <div className="mx-auto max-w-2xl px-4">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">Our Services</h2>
            <p className="mt-2 text-muted-foreground">
              Choose your platform, pick a service, and grow your presence instantly
            </p>
          </div>
          <OrderForm />
        </div>
      </section>
    </>
  )
}
