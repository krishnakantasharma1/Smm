export type Platform = "YouTube" | "Instagram" | "Telegram" | "Other Contact"

export interface ServiceItem {
  name: string
  price: number // price per 1000
  minOrder?: number
}

export interface Category {
  name: string
  services: ServiceItem[]
}

export interface PlatformData {
  name: Platform
  clickable: boolean
  categories: Category[]
}

export const platformsData: PlatformData[] = [
  {
    name: "YouTube",
    clickable: true,
    categories: [
      {
        name: "YouTube Views",
        services: [
          {
            name: "[Max-10M Speed-Any Quantity Delivered Within 12H-48H] [Lifetime Non Drop] [Recommended] Start: 3-4 hrs) [Minimum - 500]",
            price: 250,
            minOrder: 500,
          },
        ],
      },
      {
        name: "Youtube Shorts",
        services: [
          {
            name: "YouTube Shorts Views [Non Drop] [Speed - 10K Day] [Start-3-5H]",
            price: 199,
          },
          {
            name: "Youtube Short Likes - Speed:- 100K/Day - Refill:- 30 Days (Start Time:-0-1 Hour)",
            price: 199,
          },
          {
            name: "Youtube Short Likes - Speed:-100K/Day- Refill:- 30 Days (Start Time:-0-1 Hour) [Mass order]",
            price: 300,
          },
        ],
      },
      {
        name: "YouTube Likes",
        services: [
          {
            name: "YouTube Likes - Speed:- 150K/Day -Refill:- 30Days {Start:- 0-1hrs}",
            price: 99,
          },
          {
            name: "Youtube Likes [Lifetime Guaranteed] [Max: 100K] [Start Time: 1 Hour] [Speed: 50K/Day]",
            price: 150,
          },
          {
            name: "Youtube Likes [Refill: 30 Days] [Max: 50K] [Start Time: Instant] [Speed: Up to 25K/Day]",
            price: 180,
          },
          {
            name: "Youtube Likes [Refill: 30 Days] [Max: 1M] [Start Time: 0-1 Hour] [Speed: 35K/Day]",
            price: 140,
          },
          {
            name: "Youtube Likes [Refill: No] [Max: 10K] [Start Time: 0-6 Hours] [Speed: 10K/Day]",
            price: 210,
          },
          {
            name: "Youtube Likes [Refill: 30 Days] [Max: 1M] [Start Time: 0-1 Hour] [Speed: INSTANT]",
            price: 220,
          },
        ],
      },
      {
        name: "Youtube Community Posts",
        services: [
          {
            name: "Youtube Community Post Likes [FAST]",
            price: 200,
          },
          {
            name: "Youtube Community Post Likes [HIGH QUALITY] - Refill:- 15 Days",
            price: 400,
          },
        ],
      },
      {
        name: "YouTube Live Stream",
        services: [
          {
            name: "YouTube Livestream Viewers - [15Minutes 100% Concurrent] [Cheapest] Instant",
            price: 50,
          },
          {
            name: "YouTube Livestream Viewers - [30 Minutes | 100% Concurrent] [Cheapest] Instant",
            price: 70,
          },
          {
            name: "YouTube Livestream Viewers - [60 Minutes | 100% Concurrent] [Cheapest] Instant",
            price: 100,
          },
          {
            name: "YouTube Livestream Viewers - [90 Minutes | 100% Concurrent] [Cheapest] Instant",
            price: 120,
          },
          {
            name: "YouTube Livestream Viewers - [120 Minutes | 100% Concurrent] [Cheapest] Instant",
            price: 200,
          },
          {
            name: "YouTube Livestream Viewers - [180 Minutes | 100% Concurrent] [Cheapest] Instant",
            price: 150,
          },
          {
            name: "YouTube Livestream Viewers - [360 Minutes | 100% Concurrent] [Cheapest] Instant",
            price: 300,
          },
          {
            name: "YouTube Livestream Viewers - [12 Hours | 100% Concurrent] [Cheapest] Instant",
            price: 600,
          },
          {
            name: "YouTube Livestream Viewers - [24Hours | 100% Concurrent] [Cheapest] Instant",
            price: 1200,
          },
        ],
      },
      {
        name: "YouTube Subscribers",
        services: [
          {
            name: "YouTube Subscribers - [Max - 500K | Speed: 10K-100K/Day] [No Refill] Start: 0-2hr",
            price: 199,
          },
          {
            name: "YouTube Subscribers [Speed: 250-500/Day] [Refill: 30 Days] [Fast] Start 0-1hr",
            price: 5000,
          },
        ],
      },
      {
        name: "YouTube Comments",
        services: [
          {
            name: "Youtube Comments - [Custom] [Speed:10000/Day] [Real HQ] INSTANT",
            price: 800,
          },
          {
            name: "Youtube Comments [+Subs + Likes] [Created by AI] [Refill: 30D] [Max: 2K] [Start Time: 0-1 Hr] [Speed: 2K/D]",
            price: 2000,
          },
          {
            name: "YouTube Comments [RANDOM] WITH PROFILE PICTURES Speed:- 10K/Day {Start:- 0-2hr}",
            price: 1200,
          },
          {
            name: "Youtube Comments [CUSTOM] || Speed:- 1K/Day {Start:- Instant}",
            price: 1500,
          },
        ],
      },
      {
        name: "YouTube Video AI Comment",
        services: [
          {
            name: "YouTube Video Comments Created By AI | 100% Real Accounts | Auto-Generate Comments Based on Video Content | Non Drop | 365 Days | Instant Start",
            price: 1200,
          },
        ],
      },
      {
        name: "YouTube Comment Like",
        services: [
          {
            name: "YouTube Comment Likes [NON-DROP] Speed:- 3K/Day {Start:- 0-1hr}",
            price: 200,
          },
          {
            name: "Youtube Comment Likes (UP VOTES) INSTANT Speed:- 3K/Day",
            price: 259,
          },
        ],
      },
    ],
  },
  {
    name: "Instagram",
    clickable: true,
    categories: [
      {
        name: "Instagram Followers [Guaranteed]",
        services: [
          { name: "Instagram Followers [Refill - 30Days][Speed:-10K-30K Day]", price: 199 },
          { name: "Instagram Followers [R30] [100% Non - Drop & Stable] [Speed-50K+/Day]", price: 219 },
          { name: "Instagram Followers [Refill - 365Days] [Speed 200K+/Day]", price: 299 },
          { name: "Instagram Followers [Refill - 45Days] [Speed50K+/Day]", price: 300 },
          { name: "Instagram Followers [Refill - 365Days][Speed:-30K-50K Day]", price: 210 },
          { name: "Instagram Followers [Refill - 365 Days] [100% Non - Drop & Stable] [Speed - 50K-300K/Day]", price: 200 },
          { name: "Instagram Followers [Speed = 20k+/Day] [Refill - 30Days]", price: 399 },
          { name: "Instagram Followers [Refill - 30Days][Speed-10K-20K Day] [Only Works when Flag For Review Off]", price: 186.29 },
          { name: "Instagram Indian Real Mix [Speed -50K/Day] [30 Days] [Instant]", price: 400 },
          { name: "Instagram Indian Real Mix [Speed -50K/Day] [30 Days Refill] [Instant]", price: 700 },
          { name: "Instagram Followers [R365] [Speed -250k+/Day] [SUPER FAST] [BEST FOR CELEBRITIES & BIG ACCOUNTS]", price: 800 },
          { name: "Instagram Followers [Lifetime Nondrop] [Speed-10K-50k+/Day] [Indian Mix]", price: 900 },
          { name: "Instagram Followers [R365] [Speed 100K+/Day] [SUPERFAST] [BEST FOR BIG ACCOUNTS]", price: 800 },
          { name: "Instagram Indian Real Mix [Speed -50K-100K/Day] [365 Days Refill] [Instant]", price: 1000 },
        ],
      },
      {
        name: "Instagram Followers [Non Guaranteed]",
        services: [
          { name: "Instagram Followers [INDIAN] -Speed:-10K/Day- Refill:-365Days {Start:Instant}", price: 219 },
          { name: "Instagram Followers(Indian) Speed 100K/Day / Refill:-15days [Good Quality]", price: 299 },
          { name: "Instagram Followers [70% INDIAN] [Speed:-50K/day] [Refill:-30 Days] [Start:1H]", price: 399 },
          { name: "Instagram Indian Real Mix [Speed -50K/Day] [30 Days] [Instant]", price: 449 },
        ],
      },
      {
        name: "Instagram Followers [Indian Services]",
        services: [
          { name: "Instagram Followers(Indian)-Speed:-100K/Day / Refill:-30days / Recommend for High Speed Followers / {Start:-0-1hr}", price: 700 },
          { name: "Instagram Followers [100% INDIAN]-refill:-30days{start:instant}", price: 800 },
          { name: "Instagram Followers [Indian] -Speed:-20k-50k/day-Refill:-365days(Non-Drop)-{start:Instant}", price: 700 },
          { name: "Instagram Followers (Indian Mixed) Speed:-80K-150K/Day / Refill:-365days", price: 800 },
          { name: "Instagram Indian Real Mix [Speed -50K/Day] [365 Days] [Instant]", price: 999 },
          { name: "Instagram Followers(90%INDIAN) Speed:-1-2k/hr - Refill:-365days", price: 899 },
        ],
      },
      {
        name: "Instagram Likes [Indian]",
        services: [
          { name: "Instagram Likes [INDIAN] - [Max: 1M | Speed: 100K/Day] Super Instant", price: 99 },
          { name: "Instagram Likes [INDIA MIX] [Start Time: Instant] [Speed: 50K/Day]", price: 149 },
          { name: "Instagram Likes [INDIAN MIX] [Refill: 365Days] [Max: 100K] [Start Time: 0-1Hours] [Speed: 50K/Day]", price: 160 },
          { name: "Instagram Likes [INDIA] [Start Time: 0-1 Hour] [Speed: 5K/Day]", price: 320 },
          { name: "Instagram Likes [INDIA] [Refill: No] [Max: 50K] [Start Time: 0-24 Hours] [Speed: 5K/Day]", price: 499 },
          { name: "Instagram Likes [INDIA] [Refill: 30D] [Max: 100K] [Start Time: Instant] [Speed: 15K/Day]", price: 519 },
        ],
      },
      {
        name: "Instagram Likes [NON DROP]",
        services: [
          { name: "Instagram Likes - [Max - 1K | Speed:1K/Hour] [Non Drop] [Low Quality] [SLOW]", price: 99 },
          { name: "Instagram Likes - [Max - 1M | Speed: 10K-20K/Day] [Cheapest - Start: 5 Minutes]", price: 119 },
          { name: "Instagram Likes [Speed - 5K+/h] [Max - 200K][Start - Instant]", price: 99 },
          { name: "Instagram Likes - [Max - 50K | Speed: 10000/Hour] [MQ - Non Drop] [Super-fast-INSTANT]", price: 149 },
          { name: "Instagram Likes - [Max - 10K | Speed: 1K/H] [LQ] Start: 0-5 minutes", price: 159 },
          { name: "Instagram Likes [Refill: Lifetime] [Max: 1M] [Start Time: Instant] [Speed: 100K/H] [Bullet Speed]", price: 199 },
        ],
      },
      {
        name: "Instagram Likes [Real & Active Accounts]",
        services: [
          { name: "Instagram Likes - Speed:- 100K/Day (NON DROP) {Start:0-10Mint}", price: 119 },
          { name: "Instagram Likes [Speed - 150K-200K/Day] [Max - 1M] [Start - Instant]", price: 120 },
          { name: "Instagram Likes - Speed:- 50K/day -Refill:- Non Drop {Start: Instant}", price: 129 },
          { name: "Instagram Likes [Speed - 10K+/h] [Max - 1M][Start - Instant]", price: 149 },
          { name: "Instagram Like - Speed:-100K/day {Start:Instant}", price: 159 },
          { name: "Instagram Likes [Refill: Lifetime Guaranteed] [Max: 300K] [Start Time: 1 Hour] [Speed: 100K/Day]", price: 189 },
          { name: "Instagram Likes - [Speed: 10000/Hour][LQ] [Refill:- 365days] [Superfast - INSTANT]", price: 299 },
        ],
      },
      {
        name: "Instagram USA Services",
        services: [
          { name: "Instagram USA Followers 30-Day Refill Max 100K | Instant Start", price: 699 },
          { name: "Instagram USA Private Followers No Duplicate Links", price: 749 },
          { name: "Instagram USA Real and Active Likes | Max 100K | Instant Start | Non-Drop", price: 119 },
          { name: "Instagram USA Likes | Mixed | Max 30K | Fast Start", price: 199 },
        ],
      },
      {
        name: "Instagram Brazil Services",
        services: [
          { name: "Instagram Like Brazil [Max 1K]", price: 299 },
          { name: "Instagram Like Brazil [Max 5K]", price: 299 },
          { name: "Instagram Like Brazil [Max 200K]", price: 349 },
          { name: "Instagram Like Brazil [Max 1M] [Lifetime Refill]", price: 499 },
        ],
      },
      {
        name: "Instagram Arab Services",
        services: [
          { name: "Instagram Arabic Like [100% Real] [Max 1K]", price: 299 },
          { name: "Instagram Arabic Like [100% Real] [Max 5K]", price: 349 },
          { name: "Instagram Arabic Like [100% Real] [Max 100K]", price: 449 },
          { name: "Instagram Arabic Like [100% Real][Max 1M] [Best]", price: 599 },
        ],
      },
      {
        name: "Instagram European Services",
        services: [
          { name: "Instagram European Likes | 2K per Hour | Lifetime Guaranteed | Real", price: 199 },
          { name: "Instagram European Followers Super Real Refill 30 Days | 10K/Day | Instant Start", price: 999 },
          { name: "Instagram Europe Followers(S2) | Real and Stable | 10K/Day | Refill 60 Days | Instant Start", price: 699 },
          { name: "Instagram Comments Europe REAL(10k+ profiles) (Speed: 500/day) [start time: 0-1 minute]", price: 4999 },
        ],
      },
      {
        name: "Instagram Likes [CountryWise]",
        services: [
          { name: "Instagram Likes (Russian) -Speed:- 1K/Hour (Non Drop) {Start:INSTANT (fastest)}", price: 119 },
          { name: "Instagram Likes (Turkish) - Speed:-2K/Day (Real) {Start: INSTANT}", price: 149 },
          { name: "Instagram Likes (Persian) - Speed:-2500/Hour. 100% Real Quality", price: 499 },
          { name: "Instagram Likes (Arabic) - Speed:-High quality {Start:INSTANT} -4k-5K/Day", price: 599 },
          { name: "Instagram Likes (Arabic) -Speed:-5K/Day (Super High Quality) {Start: 0-5 Minutes}", price: 599 },
        ],
      },
      {
        name: "Instagram Auto Likes",
        services: [
          { name: "Speed:-15k/day - Refill:- No! {Start: 0-1 Hour}", price: 119 },
          { name: "Instagram Auto Likes (Real active) -Speed:- 3-5K/Day - Refill:- 30 Days {Start:INSTANT}", price: 99 },
          { name: "Instagram Auto Likes [WOMEN] (Real) - Speed:-100k/day {Start: INSTANT}", price: 199 },
          { name: "Instagram Auto Likes - Speed:-15k/day {Start: 0-1 Hour}", price: 149 },
          { name: "Instagram Auto Likes - Speed:10k/hour {Start: INSTANT (ultrafast)}", price: 149 },
          { name: "Instagram Auto Likes (Real Mix) -Speed:- 3K/Hour {Start: 10 Second (ultrafast)}", price: 199 },
        ],
      },
      {
        name: "Instagram Views/Reel..",
        services: [
          { name: "INSTAGRAM VIEWS [CHEAPEST]", price: 5 },
          { name: "INSTAGRAM VIEWS [NATURAL SPEED]", price: 9 },
          { name: "INSTAGRAM VIEWS [AVERAGE SPEED]", price: 12 },
          { name: "INSTAGRAM VIEWS [SUPER-FAST WORKING]", price: 19 },
        ],
      },
      {
        name: "Instagram Post Views",
        services: [
          { name: "Instagram Post Views [Speed -1M/Day] [Good Service]", price: 19 },
        ],
      },
      {
        name: "Instagram Repost",
        services: [
          { name: "Instagram Repost [Worldwide] 100% Real Accounts | Cancel Enable | Instant Start", price: 149 },
        ],
      },
    ],
  },
  {
    name: "Telegram",
    clickable: true,
    categories: [
      {
        name: "TELEGRAM MEMBERS [NON DROP]",
        services: [
          { name: "Telegram Real Members [Super Instant] - [Speed: 250K/D] [One Tap Complete] - 30 Days Refill", price: 159 },
          { name: "Telegram Non Drop Member [20K+/Day] [10-20Days Non Drop]", price: 99 },
          { name: "Telegram Members - Instant - Speed : 50K/D - 30 Days Refill", price: 109 },
          { name: "Telegram Non Drop Member [50K+/Day] [30 Days Non Drop]", price: 119 },
          { name: "Telegram Non Drop Members [100K/Day] [90Days Non Drop]", price: 199 },
          { name: "Telegram Channel/Group Members [100%Non Drop] [Speed - 30K+ Per Day] [3month Guarantee]", price: 219 },
        ],
      },
      {
        name: "Telegram Members [Country Targeted]",
        services: [
          { name: "Telegram Non Drop Members [15K/Day] [Instant] [Refill - 30Days]", price: 199 },
          { name: "TELEGRAM NON DROP MEMBERS [60 DAYS NONDROP] [INSTANT]", price: 219 },
          { name: "Telegram Non Drop Member [50K/Day] [90 Days]", price: 249 },
          { name: "Telegram Real Members - Instant -Speed :30-40K/D - 90 Days Refill", price: 299 },
          { name: "TELEGRAM NON DROP MEMBERS [NONDROP] [DROPPING - 0%] [SUPER FAST] [RECOMMEND] [INSTANT][REFILL - 180DAYS]", price: 299 },
        ],
      },
      {
        name: "Telegram Online Members",
        services: [
          { name: "Telegram Group Online Member [New Base] [30 Days]", price: 299 },
          { name: "Telegram Group Online Member [Best] [30 Days]", price: 1199 },
          { name: "Telegram Group Online Member [Chinese] [30 Days]", price: 2999 },
          { name: "Telegram Mix 100% Online Member [30 Days Non Drop]", price: 1699 },
          { name: "Telegram 100% Online members [For Chinese and Eastern Asian Exclusively] [1-12H Start]", price: 4999 },
        ],
      },
    ],
  },
  {
    name: "Other Contact",
    clickable: false,
    categories: [],
  },
]
