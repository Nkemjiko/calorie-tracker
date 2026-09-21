"use client"

import { useState } from "react"
import { Check, Loader2, Crown, ArrowLeft } from "lucide-react"
import { BottomNav } from "@/components/dashboard/bottom-nav"
import { Button } from "@/components/ui/button"
import { useProfile } from "@/lib/hooks/use-profile"
import { useAuth } from "@/components/auth/auth-provider"
import { createClient } from "@/lib/supabase/client"

const FEATURES = [
  "Unlimited AI meal photo scans",
  "Detailed macro tracking (protein, carbs, fat)",
  "Custom fasting schedules",
  "Advanced insights & trends",
  "Priority support",
]

type Plan = "monthly" | "yearly"

const PRICING: Record<Plan, { amount: number; display: string; period: string }> = {
  monthly: { amount: 2500, display: "₦2,500", period: "per month" },
  yearly: { amount: 20000, display: "₦20,000", period: "per year" },
}

export function ProPage() {
  const { user } = useAuth()
  const { profile } = useProfile()
  const [selectedPlan, setSelectedPlan] = useState<Plan>("monthly")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isPro = profile?.is_pro ?? false

  async function handleSubscribe() {
    if (!user) {
      setError("Please sign in to subscribe.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token

      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          amount: PRICING[selectedPlan].amount,
          accessToken,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to initialize payment. Please try again.")
        setLoading(false)
        return
      }

      if (data.authorization_url) {
        window.location.href = data.authorization_url
      } else {
        setError("Payment service is not yet configured. Please try again later.")
        setLoading(false)
      }
    } catch {
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-secondary/40">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <header className="flex items-center gap-3 px-4 pb-2 pt-6">
          <a
            href="/"
            className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Go back"
          >
            <ArrowLeft className="size-4" />
          </a>
        </header>

        <main className="flex flex-1 flex-col gap-6 px-4 pb-8 pt-2">
          {/* Hero */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-brand-green/10">
              <Crown className="size-8 text-brand-green" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {isPro ? "You're a Pro Member" : "Upgrade to Pro"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isPro
                ? "Enjoy unlimited access to all premium features."
                : "Unlock the full power of your health journey."}
            </p>
          </div>

          {/* Features */}
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold text-foreground">What's included</h2>
            <ul className="flex flex-col gap-3">
              {FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-green/10">
                    <Check className="size-3 text-brand-green" />
                  </span>
                  <span className="text-sm text-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pricing */}
          {!isPro && (
            <>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedPlan("monthly")}
                  className={`flex items-center justify-between rounded-2xl border-2 p-4 transition-colors ${
                    selectedPlan === "monthly"
                      ? "border-brand-green bg-brand-green/5"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-sm font-semibold text-foreground">Monthly</span>
                    <span className="text-xs text-muted-foreground">Billed every month</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xl font-bold text-foreground">₦2,500</span>
                    <span className="text-xs text-muted-foreground">/month</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPlan("yearly")}
                  className={`flex items-center justify-between rounded-2xl border-2 p-4 transition-colors ${
                    selectedPlan === "yearly"
                      ? "border-brand-green bg-brand-green/5"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">Yearly</span>
                      <span className="rounded-full bg-brand-green/10 px-2 py-0.5 text-[10px] font-semibold text-brand-green">
                        Save 33%
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">Billed once a year</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xl font-bold text-foreground">₦20,000</span>
                    <span className="text-xs text-muted-foreground">/year</span>
                  </div>
                </button>
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/5 px-3 py-2 text-xs text-destructive">
                  {error}
                </div>
              )}

              <Button
                type="button"
                className="w-full bg-brand-green text-white hover:bg-brand-green/90"
                onClick={handleSubscribe}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Crown className="size-4" />
                )}
                Start Pro Subscription
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Cancel anytime. Secure payment via Paystack.
              </p>
            </>
          )}
        </main>
      </div>

      <BottomNav />
    </div>
  )
}
