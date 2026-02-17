"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import Image from "next/image"
import { Heart, TrendingUp, Users, Eye } from "lucide-react"

// ── Platform logo SVGs (inline, no external dep) ────────────────────────────

function YouTubeLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="5" fill="#FF0000"/>
      <path d="M19.6 7.3s-.2-1.4-.8-2c-.8-.8-1.7-.8-2.1-.9C14.4 4.2 12 4.2 12 4.2s-2.4 0-4.7.2c-.4 0-1.3.1-2.1.9-.6.6-.8 2-.8 2S4.2 8.9 4.2 10.5v1.5c0 1.6.2 3.2.2 3.2s.2 1.4.8 2c.8.8 1.8.8 2.3.9C8.9 18.2 12 18.2 12 18.2s2.4 0 4.7-.3c.4 0 1.3-.1 2.1-.9.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.5c0-1.6-.2-3.2-.2-3.2v.2z" fill="white"/>
      <path d="M10.2 14.5V9.5l5.3 2.5-5.3 2.5z" fill="#FF0000"/>
    </svg>
  )
}

function InstagramLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ig-grad" cx="30%" cy="107%" r="150%">
          <stop offset="0%" stopColor="#fdf497"/>
          <stop offset="5%" stopColor="#fdf497"/>
          <stop offset="45%" stopColor="#fd5949"/>
          <stop offset="60%" stopColor="#d6249f"/>
          <stop offset="90%" stopColor="#285AEB"/>
        </radialGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#ig-grad)"/>
      <path d="M12 7.2A4.8 4.8 0 1 0 12 16.8 4.8 4.8 0 0 0 12 7.2zm0 7.9A3.1 3.1 0 1 1 12 8.9a3.1 3.1 0 0 1 0 6.2z" fill="white"/>
      <circle cx="17" cy="7" r="1.1" fill="white"/>
    </svg>
  )
}

function TelegramLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="12" fill="#229ED9"/>
      <path d="M5.2 11.8l2.9 1.1 1.1 3.5c.1.3.5.4.7.2l1.6-1.3 3 2.2c.3.2.7 0 .8-.3l2.2-10c.1-.4-.3-.8-.7-.6L5 10.9c-.4.2-.4.8.2.9zm4 .5l5.5-3.4-3.4 3.9-.1 1.7-.4-1.4-.5-.1-.1-.7z" fill="white"/>
    </svg>
  )
}

// ── Data ─────────────────────────────────────────────────────────────────────

const stats = [
  { icon: Users,     label: "Happy Clients",     value: "50K+"  },
  { icon: TrendingUp,label: "Orders Completed",  value: "200K+" },
  { icon: Eye,       label: "Views Delivered",   value: "1B+"   },
  { icon: Heart,     label: "Satisfaction Rate", value: "99%"   },
]

type PlatformItem = {
  platform: "youtube" | "instagram" | "telegram"
  text: string
}

const scrollingItems: PlatformItem[] = [
  { platform: "youtube",   text: "Views +500K"          },
  { platform: "instagram", text: "Followers +100K"      },
  { platform: "telegram",  text: "Members +50K"         },
  { platform: "youtube",   text: "Subscribers +10K"     },
  { platform: "instagram", text: "Likes +200K"          },
  { platform: "youtube",   text: "Comments +5K"         },
  { platform: "instagram", text: "Reels Views +1M"      },
  { platform: "telegram",  text: "Online Members +20K"  },
  { platform: "youtube",   text: "Watch Hours +100K"    },
  { platform: "instagram", text: "Story Views +500K"    },
]

// 6 images in /public named 1.jpg → 6.jpg
const CAROUSEL_IMAGES = ["/1.jpg", "/2.jpg", "/3.jpg", "/4.jpg", "/5.jpg", "/6.jpg"]
const SLIDE_DURATION = 3000 // ms

function PlatformIcon({ platform }: { platform: PlatformItem["platform"] }) {
  if (platform === "youtube")   return <YouTubeLogo   className="h-4 w-4 flex-shrink-0" />
  if (platform === "instagram") return <InstagramLogo className="h-4 w-4 flex-shrink-0" />
  return                               <TelegramLogo  className="h-4 w-4 flex-shrink-0" />
}

// ── Component ─────────────────────────────────────────────────────────────────

export function HeroSection() {
  const [mounted, setMounted]   = useState(false)
  const [current, setCurrent]   = useState(0)
  const [visible, setVisible]   = useState(true)

  // Touch swipe tracking
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)

  useEffect(() => { setMounted(true) }, [])

  const goTo = useCallback((index: number) => {
    setVisible(false)
    setTimeout(() => {
      setCurrent(index)
      setVisible(true)
    }, 300)
  }, [])

  // Auto-advance carousel every SLIDE_DURATION ms
  const advance = useCallback(() => {
    goTo((current + 1) % CAROUSEL_IMAGES.length)
  }, [current, goTo])

  useEffect(() => {
    const id = setInterval(advance, SLIDE_DURATION)
    return () => clearInterval(id)
  }, [advance])

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    // Only trigger if horizontal swipe is dominant and > 40px
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) {
        goTo((current + 1) % CAROUSEL_IMAGES.length)       // swipe left → next
      } else {
        goTo((current - 1 + CAROUSEL_IMAGES.length) % CAROUSEL_IMAGES.length) // swipe right → prev
      }
    }
    touchStartX.current = null
    touchStartY.current = null
  }

  return (
    <section className="relative overflow-hidden bg-background">

      {/* ── Image Carousel ───────────────────────────────────────────────── */}
      <div
        className="relative w-full select-none"
        style={{ aspectRatio: "16/9", maxHeight: "560px" }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Subtle bottom fade for dot visibility only */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-16 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Slides */}
        {CAROUSEL_IMAGES.map((src, i) => (
          <div
            key={src}
            className="absolute inset-0 transition-opacity duration-300 ease-in-out"
            style={{ opacity: i === current && visible ? 1 : 0 }}
          >
            <Image
              src={src}
              alt={`Slide ${i + 1}`}
              fill
              priority={i === 0}
              className="object-cover object-center"
              sizes="100vw"
            />
          </div>
        ))}

        {/* Dot indicators */}
        <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
          {CAROUSEL_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? "h-2 w-5 bg-primary"
                  : "h-2 w-2 bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* ── Hero Text (below carousel, no overlap) ─────────────────────────── */}
      <div className="mx-auto max-w-6xl px-4 pt-5 pb-2">
        <div className="text-center">

          {/* Badge */}
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Trusted Growth Platform
          </div>

          {/* Headline — max 2 lines on mobile */}
          <h1 className="font-display text-balance text-3xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl">
            Loved by millions{" "}
            <span className="bg-gradient-to-r from-primary to-[hsl(142,72%,50%)] bg-clip-text text-transparent">
              all over the world
            </span>
            {" "}❤️
          </h1>

          <p className="mx-auto mt-2.5 max-w-2xl text-pretty text-sm text-muted-foreground md:text-base">
            Grow your social media presence with our fast, reliable, and affordable services.
            Instant delivery, real results.
          </p>

          {/* Platform badges — single row, no wrap */}
          <div className="mt-4 flex items-center justify-center gap-2">
            {[
              { Logo: YouTubeLogo,   name: "YouTube"   },
              { Logo: InstagramLogo, name: "Instagram" },
              { Logo: TelegramLogo,  name: "Telegram"  },
            ].map(({ Logo, name }) => (
              <div
                key={name}
                className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-sm"
              >
                <Logo className="h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Marquee Ticker ─────────────────────────────────────────────────── */}
      {mounted && (
        <div className="marquee-track relative mt-4 overflow-hidden border-y border-border/60 bg-card py-3">
          {/* Left fade */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-card to-transparent" />
          {/* Right fade */}
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-card to-transparent" />

          {/* Duplicated items for seamless loop */}
          <div className="animate-marquee flex gap-3">
            {[...scrollingItems, ...scrollingItems, ...scrollingItems].map((item, idx) => (
              <div
                key={idx}
                className="flex flex-shrink-0 items-center gap-2 rounded-full border border-border/60 bg-background/60 px-4 py-1.5 text-sm font-medium text-foreground"
              >
                <PlatformIcon platform={item.platform} />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Stats Grid ─────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="stat-card flex flex-col items-center rounded-xl border border-border bg-card p-5 text-center glow-blue"
            >
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="font-display text-2xl font-bold text-foreground">{stat.value}</span>
              <span className="mt-1 text-xs text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

    </section>
  )
}
