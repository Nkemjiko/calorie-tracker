"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dashboard } from "@/components/dashboard/dashboard"
import { useAuth } from "@/components/auth/auth-provider"

export default function Page() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.replace("/")
    }
  }, [loading, user, router])

  return (
    <div className="min-h-dvh bg-secondary/40">
      <Dashboard />
    </div>
  )
}
