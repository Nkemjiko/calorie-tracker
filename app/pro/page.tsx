import { headers } from "next/headers"
import { ProPage, type PricingData } from "@/components/profile/pro-page"

type Currency = "NGN" | "USD"

const PRICES = {
  NGN: {
    monthly: { actual: 2500, display: "₦2,500", originalDisplay: "₦3,125", period: "month" },
    yearly: { actual: 20000, display: "₦20,000", originalDisplay: "₦25,000", period: "year" },
  },
  USD: {
    monthly: { actual: 2.99, display: "$2.99", originalDisplay: "$3.74", period: "month" },
    yearly: { actual: 24.99, display: "$24.99", originalDisplay: "$31.24", period: "year" },
  },
} as const

export default async function Page() {
  const headersList = await headers()
  const country = headersList.get("x-vercel-ip-country") ?? ""
  const currency: Currency = country === "NG" ? "NGN" : "USD"

  const pricing: PricingData = {
    currency,
    plans: {
      monthly: {
        actual: PRICES[currency].monthly.actual,
        display: PRICES[currency].monthly.display,
        originalDisplay: PRICES[currency].monthly.originalDisplay,
        period: PRICES[currency].monthly.period,
      },
      yearly: {
        actual: PRICES[currency].yearly.actual,
        display: PRICES[currency].yearly.display,
        originalDisplay: PRICES[currency].yearly.originalDisplay,
        period: PRICES[currency].yearly.period,
      },
    },
  }

  return <ProPage pricing={pricing} />
}
