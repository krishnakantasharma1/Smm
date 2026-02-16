"use client"

import { useEffect, useState } from "react"
import { Heart, TrendingUp, Users, Eye } from "lucide-react"

const stats = [
  { icon: Users, label: "Happy Clients", value: "50K+" },
  { icon: TrendingUp, label: "Orders Completed", value: "200K+" },
  { icon: Eye, label: "Views Delivered", value: "1B+" },
  { icon: Heart, label: "Satisfaction Rate", value: "99%" },
]

const scrollingItems = [
  "YouTube Views +500K",
  "Instagram Followers +100K",
  "Telegram Members +50K",
  "YouTube Subscribers +10K",
  "Instagram Likes +200K",
  "YouTube Comments +5K",
  "Instagram Reels Views +1M",
  "Telegram Online Members +20K",
]

export function HeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative overflow-hidden bg-card py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            Loved by millions whole over the world
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">
            Grow your social media presence with our fast, reliable, and affordable services.
            Instant delivery, real results.
          </p>
        </div>

        {/* Auto-scrolling gains ticker */}
        {mounted && (
          <div className="relative mt-8 overflow-hidden">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-card to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-card to-transparent" />
            <div className="flex animate-scroll gap-4">
              {[...scrollingItems, ...scrollingItems].map((item, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 rounded-full border border-accent/30 bg-accent/10 px-5 py-2 text-sm font-medium text-foreground"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center rounded-xl border border-border bg-background p-5 text-center"
            >
              <stat.icon className="mb-2 h-6 w-6 text-primary" />
              <span className="text-2xl font-bold text-foreground">{stat.value}</span>
              <span className="mt-1 text-xs text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
