import { siteConfig } from "@/lib/site-config"
import { Shield, Zap, Clock, Users } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: `About Us - ${siteConfig.name}`,
  description: "Learn about HTG Studio and our social media growth services.",
}

const features = [
  {
    icon: Zap,
    title: "Fast Delivery",
    description:
      "Most of our services are delivered within minutes. We prioritize speed without compromising quality.",
  },
  {
    icon: Shield,
    title: "Reliable & Safe",
    description:
      "We use safe methods to deliver our services. Your accounts are always protected with our approach.",
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description:
      "Our team is available around the clock to assist you with any questions or concerns about your orders.",
  },
  {
    icon: Users,
    title: "Trusted by Thousands",
    description:
      "Thousands of content creators and businesses trust us to grow their social media presence every day.",
  },
]

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:py-16">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-foreground md:text-4xl">About {siteConfig.name}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
          We are a professional social media marketing service provider helping content
          creators, businesses, and individuals grow their online presence across YouTube,
          Instagram, and Telegram.
        </p>
      </div>

      <div className="mb-12 rounded-xl border border-border bg-card p-6 md:p-8">
        <h2 className="mb-4 text-xl font-bold text-foreground">Our Mission</h2>
        <p className="leading-relaxed text-muted-foreground">
          At {siteConfig.name}, we believe everyone deserves the opportunity to grow their
          social media presence. Whether you are a budding content creator, a small business
          owner, or an established brand, our services are designed to give you the boost you
          need. We provide high-quality, affordable, and fast social media growth services
          that help you reach your goals.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <feature.icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-xl border border-border bg-card p-6 md:p-8">
        <h2 className="mb-4 text-xl font-bold text-foreground">How It Works</h2>
        <ol className="flex flex-col gap-4">
          <li className="flex items-start gap-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              1
            </span>
            <div>
              <h4 className="font-semibold text-foreground">Select Your Service</h4>
              <p className="text-sm text-muted-foreground">
                Choose your platform (YouTube, Instagram, or Telegram), then select the
                specific category and service you need.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              2
            </span>
            <div>
              <h4 className="font-semibold text-foreground">Enter Details & Pay</h4>
              <p className="text-sm text-muted-foreground">
                Provide your account or post link, desired quantity, and contact details. Then
                make a secure payment via Razorpay.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              3
            </span>
            <div>
              <h4 className="font-semibold text-foreground">We Deliver</h4>
              <p className="text-sm text-muted-foreground">
                Our team processes your order and delivers the service. Most orders are
                completed within minutes to a few hours.
              </p>
            </div>
          </li>
        </ol>
      </div>
    </div>
  )
}
