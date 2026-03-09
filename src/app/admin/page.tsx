"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"

import { DevBreadcrumbs } from "@/components/dev/DevBreadcrumbs"
import { Button } from "@/components/ui/button"
import { fetchConvexMutation, fetchConvexQuery } from "@/lib/convex-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DashboardData {
  generatedAt: number
  users: {
    total: number
    guestUsers: number
    thirdwebLikeAccounts: number
    byStatus: Record<string, number>
  }
  projects: {
    total: number
    active: number
    featured: number
    bySource: Record<string, number>
    byChain: Record<string, number>
  }
  donations: {
    total: number
    totalAmount: number
    byStatus: Record<string, number>
  }
  credits: {
    totalRows: number
    remaining: number
    max: number
  }
  swipes: {
    recentCount: number
  }
}

function MetricCard({ title, value, hint }: { title: string; value: string | number; hint?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs tracking-wide text-muted-foreground uppercase">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold text-white">{value}</p>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  )
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const loadDashboard = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await fetchConvexQuery<{}, DashboardData>(
        "waitlist:getAdminDashboard",
        {},
        { cacheTtlMs: 120_000 }
      )
      if (result.generatedAt === 0) {
        const hydrated = await fetchConvexMutation<{ force?: boolean }, DashboardData>(
          "waitlist:refreshAdminDashboardStats",
          { force: true }
        )
        setData(hydrated)
      } else {
        setData(result)
      }
    } catch (err) {
      console.error("Failed to load dashboard:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshDashboard = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await fetchConvexMutation<{ force?: boolean }, DashboardData>(
        "waitlist:refreshAdminDashboardStats",
        { force: true }
      )
      setData(result)
    } catch (err) {
      console.error("Failed to refresh dashboard:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  if (!data) {
    return (
      <main className="mx-auto w-full max-w-6xl p-6 text-white">
        <DevBreadcrumbs current="Dashboard" />
        <p className="text-sm text-muted-foreground">{isLoading ? "Loading dashboard..." : "No data available"}</p>
      </main>
    )
  }

  return (
    <main className="h-screen overflow-y-auto">
      <div className="mx-auto w-full max-w-6xl space-y-6 p-6 text-white">
      <DevBreadcrumbs current="Dashboard" />
      <header className="space-y-1">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl tracking-wide">Dashboard</h1>
          <Button variant="secondary" size="sm" onClick={() => void refreshDashboard()} disabled={isLoading}>
            {isLoading ? "Loading..." : "Refresh"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Convex snapshot generated at {new Date(data.generatedAt).toLocaleString()}
        </p>
        <div className="flex flex-wrap gap-2 pt-2 text-xs">
          <Link href="/dev/users" className="rounded-full border border-surface-border px-2 py-1 text-muted-foreground hover:text-white">
            Manage users
          </Link>
          <Link href="/dev/projects" className="rounded-full border border-surface-border px-2 py-1 text-muted-foreground hover:text-white">
            Manage projects
          </Link>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Projects" value={data.projects.total} hint={`${data.projects.active} active`} />
        <MetricCard title="Users" value={data.users.total} hint={`${data.users.guestUsers} guests`} />
        <MetricCard title="Thirdweb-like accounts" value={data.users.thirdwebLikeAccounts} hint="wallets starting with 0x" />
        <MetricCard title="Donations" value={data.donations.total} hint={`total amount ${data.donations.totalAmount.toFixed(2)}`} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">User status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(data.users.byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between rounded-md border border-surface-border px-3 py-2 text-sm">
                <span className="capitalize text-muted-foreground">{status}</span>
                <span className="font-semibold text-white">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Credits and swipes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between rounded-md border border-surface-border px-3 py-2">
              <span className="text-muted-foreground">Credit rows</span>
              <span className="font-semibold text-white">{data.credits.totalRows}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border border-surface-border px-3 py-2">
              <span className="text-muted-foreground">Credits remaining</span>
              <span className="font-semibold text-white">{data.credits.remaining}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border border-surface-border px-3 py-2">
              <span className="text-muted-foreground">Credits max</span>
              <span className="font-semibold text-white">{data.credits.max}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border border-surface-border px-3 py-2">
              <span className="text-muted-foreground">Recent swipe events</span>
              <span className="font-semibold text-white">{data.swipes.recentCount}</span>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Projects by source</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(data.projects.bySource).map(([source, count]) => (
              <div key={source} className="flex items-center justify-between rounded-md border border-surface-border px-3 py-2 text-sm">
                <span className="capitalize text-muted-foreground">{source}</span>
                <span className="font-semibold text-white">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Projects by chain</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(data.projects.byChain).map(([chain, count]) => (
              <div key={chain} className="flex items-center justify-between rounded-md border border-surface-border px-3 py-2 text-sm">
                <span className="uppercase text-muted-foreground">{chain}</span>
                <span className="font-semibold text-white">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      </div>
    </main>
  )
}
